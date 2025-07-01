'use server';

import { revalidatePath } from 'next/cache';
import { Timestamp } from 'firebase/firestore';
import { getCourse, updateCourse, getEnrollmentsByCourseId, addNotification } from '@/lib/firebase/firestore';
import { Announcement } from '@/lib/types';

export async function postAnnouncementAction(courseId: string, title: string, content: string) {
    try {
        const course = await getCourse(courseId);
        if (!course) {
            throw new Error('Course not found.');
        }

        const newAnnouncement: Omit<Announcement, 'id'> = {
            title,
            content,
            date: new Date().toISOString().split('T')[0],
        };

        const updatedAnnouncements = [
            { id: new Date().getTime().toString(), ...newAnnouncement },
            ...(course.announcements || [])
        ];
        
        await updateCourse(courseId, { announcements: updatedAnnouncements });

        // Send notifications to all enrolled students
        const enrollments = await getEnrollmentsByCourseId(courseId);
        const notificationPromises = enrollments.map(enrollment => 
            addNotification({
                userId: enrollment.userId,
                icon: 'Megaphone',
                title: `New Announcement in ${course.title}`,
                description: title,
                date: Timestamp.now(),
                read: false,
                link: `/student/my-courses/${courseId}/announcements`
            })
        );

        await Promise.all(notificationPromises);

        revalidatePath(`/student/my-courses/${courseId}/announcements`);
        revalidatePath(`/admin/courses/builder/${courseId}`);
        revalidatePath(`/teacher/courses/builder/${courseId}`);
        revalidatePath(`/seller/courses/builder/${courseId}`);

        return { success: true, message: 'Announcement posted successfully.', newAnnouncement: updatedAnnouncements[0] };
    } catch (error: any) {
        console.error('Error posting announcement:', error);
        return { success: false, message: error.message };
    }
}
