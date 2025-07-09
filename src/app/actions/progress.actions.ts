
'use server';

import { db } from '@/lib/firebase/config';
import { getCourse, getEnrollmentsByUserId } from '@/lib/firebase/firestore';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
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

        const totalLessons = course.syllabus?.reduce((acc, module) => acc + module.lessons.length, 0) || 0;
        
        if (totalLessons === 0) {
            await updateDoc(doc(db, 'enrollments', enrollment.id), { progress: 100, status: 'completed' });
            revalidatePath(`/student/my-courses/${courseId}`);
            return { success: true, message: "Course marked as complete." };
        }

        const enrollmentRef = doc(db, 'enrollments', enrollment.id);
        
        // Use arrayUnion to safely add the lessonId if it doesn't exist
        await updateDoc(enrollmentRef, {
            completedLessons: arrayUnion(lessonId)
        });

        // Refetch enrollment data to get the updated completedLessons array
        const updatedEnrollmentDoc = await getDoc(enrollmentRef);
        const updatedEnrollmentData = updatedEnrollmentDoc.data();
        
        const completedLessonsCount = updatedEnrollmentData?.completedLessons?.length || 0;
        
        const newProgress = Math.round((completedLessonsCount / totalLessons) * 100);

        const updates: { progress: number, status?: 'completed' } = {
            progress: newProgress
        };
        
        if (newProgress >= 100) {
            updates.status = 'completed';
        }

        await updateDoc(enrollmentRef, updates);

        revalidatePath(`/student/my-courses/${courseId}`);
        revalidatePath(`/student/my-courses/${courseId}/lesson/${lessonId}`);
        revalidatePath(`/student/dashboard`);

        return { success: true, message: 'Lesson marked as complete!' };

    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
