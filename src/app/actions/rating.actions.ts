'use server';

import { revalidatePath } from 'next/cache';
import { doc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function rateCourseAction(courseId: string, newRating: number) {
    if (newRating < 1 || newRating > 5) {
        return { success: false, message: 'Invalid rating value.' };
    }

    try {
        const courseRef = doc(db, 'courses', courseId);
        
        await runTransaction(db, async (transaction) => {
            const courseDoc = await transaction.get(courseRef);
            if (!courseDoc.exists()) {
                throw "Course not found.";
            }

            const courseData = courseDoc.data();
            const currentRating = courseData.rating || 0;
            const reviewCount = courseData.reviews || 0;

            const newReviewCount = reviewCount + 1;
            const updatedRating = ((currentRating * reviewCount) + newRating) / newReviewCount;

            transaction.update(courseRef, { 
                rating: parseFloat(updatedRating.toFixed(2)),
                reviews: newReviewCount 
            });
        });

        revalidatePath(`/courses/${courseId}`);
        revalidatePath(`/teachers/*`); // Revalidate teacher pages that might show average ratings

        return { success: true, message: 'Thank you for your rating!' };
    } catch (error: any) {
        console.error('Error rating course:', error);
        return { success: false, message: error.message || 'An unexpected error occurred.' };
    }
}
