
'use server';
import 'dotenv/config';

import { revalidatePath } from 'next/cache';
import { getCourse, updateCourse, getEnrollmentsByCourseId, addNotification } from '@/lib/firebase/firestore';
import { LiveClass } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

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
        
        // Notify enrolled students
        const enrollments = await getEnrollmentsByCourseId(courseId);
        const notificationPromises = enrollments.map(enrollment => 
            addNotification({
                userId: enrollment.userId,
                icon: 'Video',
                title: `New Live Class in ${course.title}`,
                description: `A new live class "${liveClassData.topic}" has been scheduled for ${liveClassData.date}.`,
                date: Timestamp.now(),
                read: false,
                link: `/student/my-courses/${courseId}/live-classes`
            })
        );
        await Promise.all(notificationPromises);

        // Revalidate paths where this data is shown
        revalidatePath(`/teacher/live-classes`);
        revalidatePath(`/student/my-courses/${courseId}/live-classes`);
        revalidatePath(`/student/live-classes`);

        return { success: true, message: 'Live class scheduled successfully and students notified.', newLiveClass };
    } catch (error: any) {
        console.error('Error scheduling live class:', error);
        return { success: false, message: error.message };
    }
}

    