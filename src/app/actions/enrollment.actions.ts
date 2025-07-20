

'use server';
import 'dotenv/config';

import { revalidatePath } from 'next/cache';
import { getCourse, getUser, addPrebooking, getPrebookingForUser, getEnrollmentsByCourseId, getInvoiceByEnrollmentId, addNotification, updateEnrollment, getDocument, addReferral, updateUser } from '@/lib/firebase/firestore';
import { Enrollment, Assignment, Exam, Invoice, User, Referral } from '@/lib/types';
import { Timestamp, writeBatch, doc, collection, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase/config';
import { createInvoiceAction } from './invoice.actions';

export async function prebookCourseAction(courseId: string, userId: string) {
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
        
        if (!course) throw new Error("Course not found.");
        if (!student) throw new Error("Student user not found.");
        if (!course.isPrebooking) throw new Error("This course is not available for pre-booking.");
        if (existingPrebooking) throw new Error("You have already pre-booked this course.");

        if (!student.mobileNumber || !student.guardianMobileNumber) {
            throw new Error("Please complete your profile by adding your and your guardian's mobile number before pre-booking.");
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
        revalidatePath('/teacher/pre-bookings');

        return { success: true, message: 'Pre-booking successful! You will be notified when the course launches.' };

    } catch (error: any) {
        console.error("Pre-booking error:", error);
        return { success: false, message: error.message };
    }
}

type ManualEnrollmentDetails = {
    courseId: string;
    userId: string; // The UID of the student being enrolled
    paymentDetails?: {
        totalFee: number;
        paidAmount: number;
        dueAmount: number;
        paymentMethod: string;
        discount?: number;
        paymentDate: string; // ISO String
        recordedBy: string; // UID of admin/staff
    };
    cycleId?: string; // Optional: for cycle-based enrollment
};


export async function enrollInCourseAction(details: ManualEnrollmentDetails) {
    const { courseId, userId, paymentDetails, cycleId } = details;
    const db = getDbInstance();
    if (!db) {
        throw new Error('Database service is currently unavailable.');
    }
    try {
        const student = await getUser(userId);
        if (!student) {
            throw new Error("Student user not found.");
        }
        
        if (!paymentDetails && (!student.mobileNumber || !student.guardianMobileNumber)) {
            throw new Error("Please complete your profile by adding your and your guardian's mobile number before enrolling.");
        }
        
        const course = await getCourse(courseId);
        if (!course) {
            throw new Error("Course not found after enrollment.");
        }
        
        const isCycleEnrollment = !!cycleId;
        const cycle = isCycleEnrollment ? course.cycles?.find(c => c.id === cycleId) : null;
        
        if (isCycleEnrollment && !cycle) {
            throw new Error("Selected course cycle not found.");
        }

        const batch = writeBatch(db);

        // 1. Create enrollment document
        const mainEnrollmentRef = doc(collection(db, 'enrollments'));
        const enrollmentData: Partial<Enrollment> = {
            id: mainEnrollmentRef.id,
            userId,
            courseId,
            enrollmentDate: Timestamp.now(),
            progress: 0,
            status: 'in-progress',
            isGroupAccessed: false, // New field for group access tracking
            enrollmentType: isCycleEnrollment ? 'cycle' : 'full_course',
            ...(isCycleEnrollment && { cycleId: cycleId }),
            accessGranted: {
                moduleIds: isCycleEnrollment ? cycle?.moduleIds : course.syllabus?.map(m => m.id) || []
            }
        };

        if (paymentDetails) {
            enrollmentData.totalFee = paymentDetails.totalFee;
            enrollmentData.paidAmount = paymentDetails.paidAmount;
            enrollmentData.dueAmount = paymentDetails.dueAmount;
            enrollmentData.paymentMethod = paymentDetails.paymentMethod;
            enrollmentData.discount = paymentDetails.discount;
            enrollmentData.enrolledBy = paymentDetails.recordedBy;
            enrollmentData.paymentStatus = paymentDetails.dueAmount > 0 ? 'partial' : 'paid';
        } else if (isCycleEnrollment && cycle) {
            enrollmentData.totalFee = parseFloat(cycle.price.replace(/[^0-9.]/g, '')) || 0;
            enrollmentData.paidAmount = enrollmentData.totalFee;
            enrollmentData.dueAmount = 0;
            enrollmentData.paymentStatus = 'paid';
            enrollmentData.paymentMethod = 'Online';
        } else {
            const price = parseFloat(course.price?.replace(/[^0-9.]/g, '')) || 0;
            enrollmentData.totalFee = price;
            enrollmentData.paidAmount = price;
            enrollmentData.dueAmount = 0;
            enrollmentData.paymentStatus = 'paid';
            enrollmentData.paymentMethod = 'Online';
        }
        
        batch.set(mainEnrollmentRef, enrollmentData);
        
        // --- Referral Logic ---
        const studentEnrollments = await getEnrollmentsByUserId(student.uid);
        if (studentEnrollments.length === 0 && student.referredBy) {
            const referrer = await getUser(student.referredBy);
            if(referrer) {
                const points = 10; // Award 10 points per referral
                const updatedPoints = (referrer.referralPoints || 0) + points;
                await updateUser(referrer.id!, { referralPoints: updatedPoints });

                const referralData: Omit<Referral, 'id'> = {
                    referrerId: referrer.uid,
                    referredUserId: student.uid,
                    referredUserName: student.name,
                    courseId: courseId,
                    courseName: course.title,
                    rewardedPoints: points,
                    date: serverTimestamp() as Timestamp,
                };
                await addReferral(referralData);
            }
        }

        // 2. Create enrollments for bundled courses only if it's a full course purchase
        if (!isCycleEnrollment && course.includedCourseIds && course.includedCourseIds.length > 0) {
            for (const bundledCourseId of course.includedCourseIds) {
                const bundledEnrollmentRef = doc(collection(db, 'enrollments'));
                const bundledEnrollmentData: Omit<Enrollment, 'id'> = {
                    userId,
                    courseId: bundledCourseId,
                    enrollmentDate: Timestamp.now(),
                    progress: 100, // Mark as completed
                    status: 'completed',
                    enrollmentType: 'full_course',
                };
                batch.set(bundledEnrollmentRef, bundledEnrollmentData);
            }
        }
        
        const newAssignments: Assignment[] = [];
        if (course.assignmentTemplates && course.assignmentTemplates.length > 0) {
            course.assignmentTemplates.forEach(template => {
                const assignmentExists = course.assignments?.some(
                    a => a.studentId === userId && a.title === template.title && a.topic === template.topic
                );

                if (!assignmentExists) {
                    newAssignments.push({
                        id: `${template.id}-${userId}`,
                        studentId: userId,
                        studentName: student.name,
                        title: template.title,
                        topic: template.topic,
                        deadline: template.deadline || '',
                        status: 'Pending',
                    });
                }
            });
        }
        
        const newExams: Exam[] = [];
        if (course.examTemplates && course.examTemplates.length > 0) {
            course.examTemplates.forEach(template => {
                const examExists = course.exams?.some(
                    e => e.studentId === userId && e.title === template.title && e.topic === template.topic
                );

                if (!examExists) {
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
                }
            });
        }
        
        const updates: Partial<any> = {};
        if (newAssignments.length > 0) {
            updates.assignments = [...(course.assignments || []), ...newAssignments];
        }
        if (newExams.length > 0) {
            updates.exams = [...(course.exams || []), ...newExams];
        }

        if (Object.keys(updates).length > 0) {
             const courseRef = doc(db, 'courses', courseId);
             batch.update(courseRef, updates);
        }
        
        await batch.commit();

        await createInvoiceAction(enrollmentData as Enrollment, student, course);

        revalidatePath('/student/my-courses');
        revalidatePath('/student/dashboard');
        revalidatePath(`/admin/manage-user/${student.id}`);
        revalidatePath(`/checkout/${courseId}`);
        revalidatePath(`/sites/[site]/checkout/${courseId}`);
        revalidatePath(`/student/my-courses/${courseId}/assignments`);
        revalidatePath(`/student/my-courses/${courseId}/exams`);
        if(course.isPrebooking) {
            revalidatePath('/admin/pre-bookings');
            revalidatePath('/teacher/pre-bookings');
        }

        return { success: true, message: 'Successfully enrolled in the course.' };
    } catch (error: any) {
        console.error(error);
        return { success: false, message: error.message };
    }
}


export async function verifyGroupAccessCodeAction(accessCode: string) {
    const db = getDbInstance();
    if (!db) {
        throw new Error('Database service is currently unavailable.');
    }
    try {
        let enrollment = await getDocument<Enrollment>('enrollments', accessCode);
        if (!enrollment) {
            return { success: false, message: 'Invalid Group Access Code.' };
        }

        const [student, course] = await Promise.all([
            getUser(enrollment.userId),
            getCourse(enrollment.courseId),
        ]);

        if (!student || !course) {
            return { success: false, message: 'Could not find student or course details.' };
        }

        // If invoice doesn't exist, create it.
        let invoice = null;
        if (enrollment.invoiceId) {
            invoice = await getDocument<Invoice>('invoices', enrollment.invoiceId);
        }
        
        if (!invoice) {
            invoice = await getInvoiceByEnrollmentId(enrollment.id!);
            if (invoice) {
                await updateEnrollment(enrollment.id!, { invoiceId: invoice.id });
                enrollment.invoiceId = invoice.id;
            }
        }
        
        if (!invoice) {
            const creationResult = await createInvoiceAction(enrollment, student, course);
            if (creationResult.success && creationResult.invoiceId) {
                invoice = await getDocument<Invoice>('invoices', creationResult.invoiceId);
                await updateEnrollment(enrollment.id!, { invoiceId: invoice!.id });
                enrollment.invoiceId = invoice!.id;
            }
        }
        
        return { success: true, data: { enrollment, student, course, invoice } };

    } catch (error: any) {
        console.error("Error verifying group access code:", error);
        return { success: false, message: error.message || 'An unexpected error occurred during verification.' };
    }
}

export async function markAsGroupAccessedAction(enrollmentId: string, adminId: string) {
    const db = getDbInstance();
    if (!db) {
        throw new Error('Database service is currently unavailable.');
    }
    try {
        const enrollmentDoc = await getDoc(doc(db, 'enrollments', enrollmentId));
        if (!enrollmentDoc.exists()) {
            throw new Error('Enrollment not found.');
        }

        const enrollment = enrollmentDoc.data() as Enrollment;

        if (enrollment.isGroupAccessed) {
            return { success: true, message: 'Student was already marked as added.' };
        }
        
        const course = await getCourse(enrollment.courseId);
        if (!course) {
            throw new Error('Course not found.');
        }

        await updateEnrollment(enrollmentId, {
            isGroupAccessed: true,
            groupAccessedAt: Timestamp.now(),
            groupAccessedBy: adminId,
        });
        
        const cycle = enrollment.cycleId ? course.cycles?.find(c => c.id === enrollment.cycleId) : null;
        
        const notificationTitle = `Welcome to the ${course.title} Group!`;
        const notificationDescription = `You have been successfully added to the secret group for ${course.title}${cycle ? ` - ${cycle.title}` : ''}. Start learning with your peers!`;
        
        await addNotification({
            userId: enrollment.userId,
            icon: 'Users',
            title: notificationTitle,
            description: notificationDescription,
            date: Timestamp.now(),
            read: false,
            link: cycle?.communityUrl || course.communityUrl,
        });
        
        return { success: true, message: 'Student marked as added and notified.' };

    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
