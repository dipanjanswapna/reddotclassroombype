
'use server';

import { revalidatePath } from 'next/cache';
import { getCourse, updateCourse } from '@/lib/firebase/firestore';
import { LiveClass } from '@/lib/types';

export async function scheduleLiveClassAction(courseId: string, liveClassData: Omit<LiveClass, 'id'>) {
    try {
        const course = await getCourse(courseId);
        if (!course) {
            throw new Error('Course not found.');
        }

        const newLiveClass: LiveClass = {
            id: `lc_${new Date().getTime()}`,
            ...liveClassData,
        };

        const updatedLiveClasses = [...(course.liveClasses || []), newLiveClass];

        await updateCourse(courseId, { liveClasses: updatedLiveClasses });

        // Revalidate paths where this data is shown
        revalidatePath(`/teacher/live-classes`);
        revalidatePath(`/student/my-courses/${courseId}/live-classes`);
        revalidatePath(`/student/live-classes`);

        return { success: true, message: 'Live class scheduled successfully.', newLiveClass };
    } catch (error: any) {
        console.error('Error scheduling live class:', error);
        return { success: false, message: error.message };
    }
}
