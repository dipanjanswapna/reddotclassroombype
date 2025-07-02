
'use server';

import { revalidatePath } from 'next/cache';
import { addNotification, getCourse, updateCourse } from '@/lib/firebase/firestore';
import { Timestamp } from 'firebase/firestore';

export async function gradeAssignmentAction(
    courseId: string, 
    studentId: string,
    assignmentId: string, 
    grade: string,
    feedback: string
) {
    try {
        const course = await getCourse(courseId);
        if (!course || !course.assignments) {
            throw new Error("Course or assignments not found.");
        }

        const assignment = course.assignments.find(a => a.id === assignmentId && a.studentId === studentId);
        if (!assignment) {
            throw new Error("Assignment not found for this student.");
        }

        const updatedAssignments = course.assignments.map(a => {
            if (a.id === assignmentId && a.studentId === studentId) {
                return {
                    ...a,
                    status: 'Graded' as const,
                    grade,
                    feedback
                };
            }
            return a;
        });

        await updateCourse(courseId, { assignments: updatedAssignments });

        await addNotification({
            userId: studentId,
            icon: 'Award',
            title: `Assignment Graded: ${assignment.title}`,
            description: `You received a grade of ${grade} for your submission in "${course.title}".`,
            date: Timestamp.now(),
            read: false,
            link: `/student/my-courses/${courseId}/assignments`
        });

        revalidatePath(`/teacher/grading`);
        revalidatePath(`/student/my-courses/${courseId}/assignments`);
        return { success: true, message: 'Assignment graded successfully.' };

    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
