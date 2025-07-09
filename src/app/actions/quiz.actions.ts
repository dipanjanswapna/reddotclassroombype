
'use server';

import { revalidatePath } from 'next/cache';
import { getCourse, updateCourse, addNotification, getInstructorBySlug } from '@/lib/firebase/firestore';
import { QuizResult } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

export async function submitQuizAction(
    courseId: string,
    quizTemplateId: string,
    studentId: string,
    studentName: string,
    answers: Record<string, string>,
    score: number // as percentage
) {
    try {
        const course = await getCourse(courseId);
        if (!course) {
            throw new Error("Course not found.");
        }

        const newResult: QuizResult = {
            id: `${quizTemplateId}-${studentId}`,
            quizTemplateId,
            studentId,
            studentName,
            answers,
            score,
            status: 'Completed',
            submissionDate: Timestamp.now(),
        };
        
        const existingResults = course.quizResults || [];
        
        if (existingResults.some(r => r.id === newResult.id)) {
            console.log(`Quiz result for ${newResult.id} already exists. Ignoring submission.`);
            return { success: true, message: 'Quiz already submitted.' };
        }

        const updatedResults = [...existingResults, newResult];
        
        await updateCourse(courseId, { quizResults: updatedResults });

        if (score >= 90 && course.instructors && course.instructors.length > 0) {
            const quizTemplate = course.quizTemplates?.find(q => q.id === quizTemplateId);
            for (const instructorInfo of course.instructors) {
                const instructor = await getInstructorBySlug(instructorInfo.slug);
                if (instructor?.userId) {
                    await addNotification({
                        userId: instructor.userId,
                        icon: 'Award',
                        title: `High Score in ${course.title}!`,
                        description: `${studentName} scored ${score}% on the quiz "${quizTemplate?.title}".`,
                        date: Timestamp.now(),
                        read: false,
                        link: `/teacher/courses/builder/${courseId}?tab=quizzes`
                    });
                }
            }
        }

        revalidatePath(`/student/my-courses/${courseId}/quizzes`);
        revalidatePath(`/student/my-courses/${courseId}/quizzes/${quizTemplateId}`);

        return { success: true, message: 'Quiz submitted successfully.' };
    } catch (error: any) {
        console.error("Error submitting quiz:", error);
        return { success: false, message: error.message };
    }
}
