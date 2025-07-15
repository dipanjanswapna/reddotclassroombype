

'use server';
import 'dotenv/config';

import { revalidatePath } from 'next/cache';
import { doc, runTransaction, arrayUnion } from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase/config';
import type { User, Course } from '@/lib/types';

export async function addRatingAction(
  userId: string,
  courseId: string,
  newRating: number
) {
  const db = getDbInstance();
  if (!db) {
    throw new Error('Database service is currently unavailable.');
  }
  if (newRating < 1 || newRating > 5) {
    return { success: false, message: 'Invalid rating value.' };
  }

  try {
    const userRef = doc(db, 'users', userId);
    const courseRef = doc(db, 'courses', courseId);

    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const courseDoc = await transaction.get(courseRef);

      if (!userDoc.exists()) throw new Error("User not found.");
      if (!courseDoc.exists()) throw new Error("Course not found.");
      
      const userData = userDoc.data() as User;
      if (userData.ratedCourses?.includes(courseId)) {
        throw new Error("You have already rated this course.");
      }

      const courseData = courseDoc.data();
      const currentRating = courseData.rating || 0;
      const reviewCount = courseData.reviews || 0;
      const newReviewCount = reviewCount + 1;
      const updatedRating = ((currentRating * reviewCount) + newRating) / newReviewCount;

      transaction.update(courseRef, {
        rating: parseFloat(updatedRating.toFixed(2)),
        reviews: newReviewCount,
      });
      transaction.update(userRef, { ratedCourses: arrayUnion(courseId) });
    });

    revalidatePath(`/courses/${courseId}`);
    revalidatePath(`/student/my-courses/${courseId}/lesson/*`);
    
    return { success: true, message: 'Thank you for your rating!' };
  } catch (error: any) {
    console.error('Error adding rating:', error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}
