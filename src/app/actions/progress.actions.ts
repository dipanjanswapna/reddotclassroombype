
'use server';
import { config } from 'dotenv';
config();

import { db } from '@/lib/firebase/config';
import { getCourse, getEnrollmentsByUserId } from '@/lib/firebase/firestore';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export async function markLessonAsCompleteAction(userId: string, courseId: string, lessonId: string) {
    try {
        const enrollments = await getEnrollmentsByUserId(userId);
        const enrollment = enrollments.find(e => e.courseId === courseId);

        if (!enrollment || !enrollment.id) {
            throw new Error("Enrollment not found.");
        }

        const course = await getCourse(courseId);
        if (!course) {
            throw new Error("Course not found.");
        }
        
        const enrollmentRef = doc(db, 'enrollments', enrollment.id);
        
        const completedLessons = enrollment.completedLessons || [];
        // If lesson is already complete, do nothing.
        if (completedLessons.includes(lessonId)) {
            return { success: true, message: "Lesson was already marked as complete." };
        }

        await updateDoc(enrollmentRef, { completedLessons: arrayUnion(lessonId) });
        
        const totalLessons = course.syllabus?.reduce((acc, module) => acc + module.lessons.length, 0) || 0;
        
        if (totalLessons === 0) {
            await updateDoc(enrollmentRef, { progress: 100, status: 'completed' });
            revalidatePath(`/student/my-courses/${courseId}`, 'layout');
            return { success: true, message: "Course marked as complete." };
        }

        const newProgress = Math.min(100, Math.round(((completedLessons.length + 1) / totalLessons) * 100));
        
        const updates: { progress: number, status?: 'completed' } = {
            progress: newProgress,
        };
        
        if (newProgress >= 100) {
            updates.status = 'completed';
        }

        await updateDoc(enrollmentRef, updates);

        revalidatePath(`/student/my-courses/${courseId}`, 'layout');
        revalidatePath(`/student/dashboard`);

        return { success: true, message: 'Lesson marked as complete!' };

    } catch (error: any) {
        console.error("Error in markLessonAsCompleteAction: ", error);
        return { success: false, message: error.message };
    }
}
