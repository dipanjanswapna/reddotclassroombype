
'use server';

import { revalidatePath } from 'next/cache';
import { addEnrollment, getCourse, updateCourse, getUser } from '@/lib/firebase/firestore';
import { Enrollment, Assignment } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

export async function enrollInCourseAction(courseId: string, userId: string) {
    try {
        const student = await getUser(userId);
        if (!student) {
            throw new Error("Student user not found.");
        }
        
        const enrollmentData: Omit<Enrollment, 'id'> = {
            userId,
            courseId,
            enrollmentDate: Timestamp.now(),
            progress: 0,
            status: 'in-progress'
        };
        await addEnrollment(enrollmentData);

        const course = await getCourse(courseId);
        if (!course) {
            throw new Error("Course not found after enrollment.");
        }

        // Generate assignments for the student from templates
        const newAssignments: Assignment[] = [];
        if (course.assignmentTemplates && course.assignmentTemplates.length > 0) {
            course.assignmentTemplates.forEach(template => {
                // Check if an assignment for this student and template already exists
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
        
        const updates: Partial<any> = {};
        if (course.isPrebooking) {
            updates.prebookingCount = (course.prebookingCount || 0) + 1;
        }

        if (newAssignments.length > 0) {
            updates.assignments = [...(course.assignments || []), ...newAssignments];
        }

        if (Object.keys(updates).length > 0) {
            await updateCourse(courseId, updates);
        }

        revalidatePath('/student/my-courses');
        revalidatePath('/student/dashboard');
        revalidatePath(`/checkout/${courseId}`);
        revalidatePath(`/student/my-courses/${courseId}/assignments`);
        if(course.isPrebooking) {
            revalidatePath('/admin/pre-bookings');
            revalidatePath('/teacher/pre-bookings');
        }

        return { success: true, message: 'Successfully enrolled in the course.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
