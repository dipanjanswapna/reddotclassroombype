

'use server';

import { revalidatePath } from 'next/cache';
import { getCourse, getUser, addPrebooking, getPrebookingForUser } from '@/lib/firebase/firestore';
import { Enrollment, Assignment, Exam } from '@/lib/types';
import { Timestamp, writeBatch, doc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { createInvoiceAction } from './invoice.actions';

export async function prebookCourseAction(courseId: string, userId: string) {
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
        
        await updateCourse(courseId, { prebookingCount: (course.prebookingCount || 0) + 1 });
        
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
