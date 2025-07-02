'use server';

import { revalidatePath } from 'next/cache';
import { getCourse, updateCourse, addNotification, getInstructorBySlug } from '@/lib/firebase/firestore';
import { Timestamp } from 'firebase/firestore';

export async function submitAssignmentAction(
    courseId: string, 
    assignmentId: string, 
    studentId: string,
    submissionText: string
) {
    try {
        const course = await getCourse(courseId);
        if (!course || !course.assignments) {
            throw new Error("Course or assignments not found.");
        }
        
        let assignmentFound = false;
        const updatedAssignments = course.assignments.map(a => {
            if (a.id === assignmentId && a.studentId === studentId) {
                assignmentFound = true;
                return {
                    ...a,
                    submissionText,
                    submissionDate: Timestamp.now(),
                    status: new Date() > new Date(a.deadline as string) ? 'Late' as const : 'Submitted' as const,
                };
            }
            return a;
        });
        
        if (!assignmentFound) {
            throw new Error("Assignment not found for this student.");
        }

        await updateCourse(courseId, { assignments: updatedAssignments });

        // Notify instructors
        if (course.instructors && course.instructors.length > 0) {
            const studentAssignment = updatedAssignments.find(a => a.id === assignmentId && a.studentId === studentId);
            if (studentAssignment) {
                 for (const instructorInfo of course.instructors) {
                    const instructor = await getInstructorBySlug(instructorInfo.slug);
                    if (instructor?.userId) {
                        await addNotification({
                            userId: instructor.userId,
                            icon: 'FileCheck2',
                            title: `New Submission in ${course.title}`,
                            description: `${studentAssignment.studentName} submitted "${studentAssignment.title}".`,
                            date: Timestamp.now(),
                            read: false,
                            link: `/teacher/grading`
                        });
                    }
                }
            }
        }

        revalidatePath(`/student/my-courses/${courseId}/assignments`);
        revalidatePath(`/teacher/grading`);

        return { success: true, message: 'Assignment submitted successfully.' };

    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
