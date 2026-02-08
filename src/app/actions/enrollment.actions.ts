'use server';
import 'dotenv/config';

import { revalidatePath } from 'next/cache';
import { getCourse, getUser, addPrebooking, getPrebookingForUser, getEnrollmentsByUserId, getInvoiceByEnrollmentId, addNotification, updateEnrollment, getDocument, addReferral, updateUser, getHomepageConfig, getEnrollmentsByCourseId, getUserByClassRoll, getCourseCycles } from '@/lib/firebase/firestore';
import { Enrollment, Assignment, Exam, Invoice, User, Referral, CourseCycle } from '@/lib/types';
import { Timestamp, writeBatch, doc, collection, getDoc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase/config';
import { createInvoiceAction } from './invoice.actions';

export async function prebookCourseAction(details: { courseId: string, userId: string, cycleId?: string}) {
    const { courseId, userId } = details;
    const db = getDbInstance();
    if (!db) {
        throw new Error('Database service is currently unavailable.');
    }
    try {
        const [course, existingPrebooking, student] = await Promise.all([
            getCourse(courseId),
            getPrebookingForUser(courseId, userId),
            getUser(userId),
        ]);
        
        if (!course) throw new Error("Target curriculum not identified.");
        if (!student) throw new Error("Student node not found in registry.");
        if (!course.isPrebooking) throw new Error("This curriculum is not enabled for pre-booking.");
        if (existingPrebooking) throw new Error("Your node is already synchronized for pre-booking.");

        if (!student.mobileNumber || !student.guardianMobileNumber) {
            throw new Error("Identity record incomplete. Add personal and guardian contact numbers to continue.");
        }

        await addPrebooking({
            courseId,
            userId,
            prebookingDate: Timestamp.now(),
        });
        
        const courseDocRef = doc(db, 'courses', courseId);
        await updateDoc(courseDocRef, { prebookingCount: (course.prebookingCount || 0) + 1 });
        
        revalidatePath(`/courses/${courseId}`);
        revalidatePath(`/sites/[site]/courses/${courseId}`);
        revalidatePath('/student/my-courses');
        revalidatePath('/admin/pre-bookings');

        return { success: true, message: 'Pre-booking authorized. You will receive sync notifications upon launch.' };

    } catch (error: any) {
        console.error("Pre-booking Error:", error);
        return { success: false, message: error.message };
    }
}

type ManualEnrollmentDetails = {
    courseId: string;
    userId: string;
    paymentDetails?: {
        totalFee: number;
        paidAmount: number;
        discount?: number;
        paymentMethod: string;
        paymentDate: string;
        recordedBy: string;
    };
    cycleId?: string;
    referralCode?: string;
};


export async function enrollInCourseAction(details: ManualEnrollmentDetails) {
    const { courseId, userId, paymentDetails, cycleId, referralCode } = details;
    const db = getDbInstance();
    if (!db) {
        throw new Error('Database service is currently offline.');
    }
    try {
        const [student, course, config] = await Promise.all([
            getUser(userId),
            getCourse(courseId),
            getHomepageConfig()
        ]);
        
        if (!student) throw new Error("Student identifier not found.");
        if (!course) throw new Error("Course manifest not available.");
        
        if (!paymentDetails && (!student.mobileNumber || !student.guardianMobileNumber)) {
            throw new Error("Synchronization denied: Mobile and Guardian contact missing from profile.");
        }
        
        const isCycleEnrollment = !!cycleId;
        const cycles = await getCourseCycles(courseId);
        const cycle = isCycleEnrollment ? cycles.find(c => c.id === cycleId) : null;
        
        if (isCycleEnrollment && !cycle) throw new Error("Selected knowledge tier not authorized.");

        const batch = writeBatch(db);
        const mainEnrollmentRef = doc(collection(db, 'enrollments'));
        const userRef = doc(db, 'users', student.id!);

        const studentEnrollments = await getEnrollmentsByUserId(student.uid);
        const isFirstEnrollment = studentEnrollments.length === 0;

        let referralDiscount = 0;
        let referrer: User | null = null;
        
        if (isFirstEnrollment && referralCode) {
            if (student.hasUsedReferral) {
                throw new Error("One-time referral protocol already executed.");
            }
            referrer = await getUserByClassRoll(referralCode);
            if (!referrer) {
                throw new Error("Invalid referral rolls identified.");
            }
            if (referrer.uid === student.uid) {
                throw new Error("Self-referral protocols are prohibited.");
            }

            if (config.referralSettings) {
                const basePriceStr = isCycleEnrollment ? cycle?.price : (course.discountPrice || course.price);
                const price = parseFloat(basePriceStr?.replace(/[^0-9.]/g, '') || '0');
                referralDiscount = price * (config.referralSettings.referredDiscountPercentage / 100);
            }
        }
        
        const enrollmentData: Partial<Enrollment> = {
            id: mainEnrollmentRef.id,
            userId,
            courseId,
            enrollmentDate: Timestamp.now(),
            progress: 0,
            status: 'in-progress',
            isGroupAccessed: false,
            enrollmentType: isCycleEnrollment ? 'cycle' : 'full_course',
            ...(isCycleEnrollment && { cycleId: cycleId }),
            accessGranted: {
                moduleIds: isCycleEnrollment ? cycle?.moduleIds : course.syllabus?.map(m => m.id) || []
            },
            ...(referralCode && { usedReferralCode: referralCode }),
        };

        if (paymentDetails) {
            const dueAmount = paymentDetails.totalFee - paymentDetails.paidAmount - (paymentDetails.discount || 0) - referralDiscount;
            enrollmentData.totalFee = paymentDetails.totalFee;
            enrollmentData.paidAmount = paymentDetails.paidAmount;
            enrollmentData.dueAmount = Math.max(0, dueAmount);
            enrollmentData.paymentMethod = paymentDetails.paymentMethod;
            enrollmentData.discount = (paymentDetails.discount || 0) + referralDiscount;
            enrollmentData.enrolledBy = paymentDetails.recordedBy;
            enrollmentData.paymentStatus = dueAmount > 0 ? 'partial' : 'paid';
        } else {
            const basePriceStr = isCycleEnrollment ? cycle?.price : (course.discountPrice || course.price);
            const price = parseFloat(basePriceStr?.replace(/[^0-9.]/g, '') || '0');
            enrollmentData.totalFee = price;
            enrollmentData.discount = referralDiscount;
            enrollmentData.paidAmount = Math.max(0, price - referralDiscount);
            enrollmentData.dueAmount = 0;
            enrollmentData.paymentStatus = 'paid';
            enrollmentData.paymentMethod = 'Sync Online';
        }
        
        batch.set(mainEnrollmentRef, enrollmentData);
        batch.update(userRef, { enrolledCourses: arrayUnion(courseId) });

        if (isFirstEnrollment && referrer && config.referralSettings) {
            const points = config.referralSettings.pointsPerReferral || 10;
            const updatedPoints = (referrer.referralPoints || 0) + points;
            batch.update(doc(db, 'users', referrer.id!), { referralPoints: updatedPoints });

            const referralData: Omit<Referral, 'id'> = {
                referrerId: referrer.uid,
                referredUserId: student.uid,
                referredUserName: student.name,
                courseId: courseId,
                courseName: course.title,
                rewardedPoints: points,
                date: serverTimestamp() as Timestamp,
                discountGiven: referralDiscount,
                status: 'Awarded'
            };
            batch.set(doc(collection(db, 'referrals')), referralData);
            batch.update(doc(db, 'users', student.id!), { hasUsedReferral: true });
        }

        if (!isCycleEnrollment && course.includedCourseIds && course.includedCourseIds.length > 0) {
            for (const bundledCourseId of course.includedCourseIds) {
                const bundledEnrollmentRef = doc(collection(db, 'enrollments'));
                const bundledEnrollmentData: Omit<Enrollment, 'id'> = {
                    userId,
                    courseId: bundledCourseId,
                    enrollmentDate: Timestamp.now(),
                    progress: 100,
                    status: 'completed',
                    enrollmentType: 'full_course',
                };
                batch.set(bundledEnrollmentRef, bundledEnrollmentData);
                batch.update(userRef, { enrolledCourses: arrayUnion(bundledCourseId) });
            }
        }
        
        // Dynamic generation of assignments and exams for the enrolled student
        const newAssignments: Assignment[] = [];
        if (course.assignmentTemplates && course.assignmentTemplates.length > 0) {
            course.assignmentTemplates.forEach(template => {
                newAssignments.push({
                    id: `${template.id}-${userId}`,
                    studentId: userId,
                    studentName: student.name,
                    title: template.title,
                    topic: template.topic,
                    deadline: template.deadline || '',
                    status: 'Pending',
                });
            });
        }
        
        const newExams: Exam[] = [];
        if (course.examTemplates && course.examTemplates.length > 0) {
            course.examTemplates.forEach(template => {
                newExams.push({
                    id: `${template.id}-${userId}`,
                    studentId: userId,
                    studentName: student.name,
                    title: template.title,
                    topic: template.topic,
                    examType: template.examType,
                    totalMarks: template.totalMarks,
                    examDate: template.examDate,
                    status: 'Pending',
                });
            });
        }
        
        const updates: any = {};
        if (newAssignments.length > 0) updates.assignments = [...(course.assignments || []), ...newAssignments];
        if (newExams.length > 0) updates.exams = [...(course.exams || []), ...newExams];

        if (Object.keys(updates).length > 0) {
             const courseRef = doc(db, 'courses', courseId);
             batch.update(courseRef, updates);
        }
        
        await batch.commit();

        await createInvoiceAction(enrollmentData as Enrollment, student, course);

        revalidatePath('/student/my-courses');
        revalidatePath('/student/dashboard');
        revalidatePath(`/student/my-courses/${courseId}`);

        return { success: true, message: 'Authorization complete. Knowledge sync initiated.' };
    } catch (error: any) {
        console.error("Enrollment Synchronization Error:", error);
        return { success: false, message: error.message };
    }
}
