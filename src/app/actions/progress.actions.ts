
'use server';

import { db } from '@/lib/firebase/config';
import { getCourse, getEnrollmentsByUserId } from '@/lib/firebase/firestore';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import type { Enrollment } from '@/lib/types';

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

        // Fetch the enrollment document once to get its current state
        const enrollmentDoc = await getDoc(enrollmentRef);
        if (!enrollmentDoc.exists()) {
            throw new Error("Enrollment data could not be found.");
        }
        const currentEnrollmentData = enrollmentDoc.data() as Enrollment;
        const completedLessons = currentEnrollmentData.completedLessons || [];

        // If lesson is already complete, do nothing.
        if (completedLessons.includes(lessonId)) {
            return { success: true, message: "Lesson was already marked as complete." };
        }

        const newCompletedLessons = [...completedLessons, lessonId];
        
        let totalLessonsInScope = 0;
        const isCycleEnrollment = enrollment.enrollmentType === 'cycle' && enrollment.cycleId;

        if (isCycleEnrollment) {
            const cycle = course.cycles?.find(c => c.id === enrollment.cycleId);
            const accessibleModuleIds = new Set(cycle?.moduleIds || []);
            totalLessonsInScope = course.syllabus
                ?.filter(m => accessibleModuleIds.has(m.id))
                .reduce((acc, module) => acc + module.lessons.length, 0) || 0;
        } else {
            // Full course enrollment
            totalLessonsInScope = course.syllabus?.reduce((acc, module) => acc + module.lessons.length, 0) || 0;
        }
        
        if (totalLessonsInScope === 0) {
            await updateDoc(enrollmentRef, { progress: 100, status: 'completed', completedLessons: newCompletedLessons });
            revalidatePath(`/student/my-courses/${courseId}`, 'layout');
            return { success: true, message: "Course marked as complete." };
        }

        const newProgress = Math.min(100, Math.round((newCompletedLessons.length / totalLessonsInScope) * 100));

        const updates: Partial<Enrollment> = {
            completedLessons: newCompletedLessons,
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
