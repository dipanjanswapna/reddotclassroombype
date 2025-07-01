'use server';

import { revalidatePath } from 'next/cache';
import { addEnrollment, getCourse, updateCourse } from '@/lib/firebase/firestore';
import { Enrollment } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

export async function enrollInCourseAction(courseId: string, userId: string) {
    try {
        const enrollmentData: Omit<Enrollment, 'id'> = {
            userId,
            courseId,
            enrollmentDate: Timestamp.now(),
            progress: 0,
            status: 'in-progress'
        };
        await addEnrollment(enrollmentData);

        // Also increment the prebookingCount if it's a pre-booking
        const course = await getCourse(courseId);
        if (course?.isPrebooking) {
            const currentCount = course.prebookingCount || 0;
            await updateCourse(courseId, { prebookingCount: currentCount + 1 });
        }

        revalidatePath('/student/my-courses');
        revalidatePath('/student/dashboard');
        revalidatePath(`/checkout/${courseId}`);
        if(course?.isPrebooking) {
            revalidatePath('/admin/pre-bookings');
            revalidatePath('/teacher/pre-bookings');
        }

        return { success: true, message: 'Successfully enrolled in the course.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
