
'use server';

import { revalidatePath } from 'next/cache';
import { addDoc, collection, doc, updateDoc, runTransaction, arrayUnion, writeBatch } from 'firebase/firestore';
import { deleteCourse, getCourse, getPrebookingsByCourseId, addPromoCode, addNotification } from '@/lib/firebase/firestore';
import { Course, User, PromoCode } from '@/lib/types';
import { db } from '@/lib/firebase/config';
import { removeUndefinedValues } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';

export async function saveCourseAction(courseData: Partial<Course>) {
  try {
    const { id, ...data } = courseData;

    // Clean the object of any undefined values before sending to Firestore
    const cleanData = removeUndefinedValues(data);

    if (id) {
      const courseRef = doc(db, 'courses', id);
      await updateDoc(courseRef, cleanData);
      revalidatePath('/admin/courses');
      revalidatePath(`/admin/courses/builder/${id}`);
      revalidatePath('/teacher/courses');
      revalidatePath(`/teacher/courses/builder/${id}`);
      revalidatePath('/seller/courses');
      revalidatePath(`/seller/courses/builder/${id}`);
      revalidatePath(`/courses/${id}`);
      return { success: true, message: 'Course updated successfully.' };
    } else {
      const newCourseRef = await addDoc(collection(db, 'courses'), cleanData);
      revalidatePath('/admin/courses');
      revalidatePath('/teacher/courses');
      revalidatePath('/seller/courses');
      return { success: true, message: 'Course created successfully.', courseId: newCourseRef.id };
    }
  } catch (error: any) {
    console.error("saveCourseAction Error:", error);
    return { success: false, message: error.message || 'An unexpected server error occurred.' };
  }
}

export async function deleteCourseAction(id: string) {
    try {
        await deleteCourse(id);
        revalidatePath('/admin/courses');
        revalidatePath('/teacher/courses');
        revalidatePath('/seller/courses');
        return { success: true, message: 'Course deleted successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function launchPrebookingCourseAction(courseId: string) {
    try {
        const course = await getCourse(courseId);
        if (!course || !course.isPrebooking) {
            throw new Error('This is not a pre-booking course or course not found.');
        }

        const prebookings = await getPrebookingsByCourseId(courseId);
        if (prebookings.length === 0) {
            await updateDoc(doc(db, 'courses', courseId), { isPrebooking: false });
            revalidatePath(`/admin/courses/builder/${courseId}`);
            revalidatePath(`/teacher/courses/builder/${courseId}`);
            revalidatePath(`/courses/${courseId}`);
            revalidatePath(`/sites/[site]/courses/${courseId}`);
            return { success: true, message: 'Course launched. No pre-bookings to notify.' };
        }
        
        const finalPrice = parseFloat((course.price || '0').replace(/[^0-9.]/g, ''));
        const prebookingPrice = parseFloat((course.prebookingPrice || '0').replace(/[^0-9.]/g, ''));
        const discountAmount = finalPrice - prebookingPrice;

        if (discountAmount <= 0) {
            throw new Error('Final price must be greater than pre-booking price to create a discount.');
        }

        const batch = writeBatch(db);

        for (const prebooking of prebookings) {
            const promoCode: Omit<PromoCode, 'id'> = {
                code: `PREBOOK-${courseId.slice(0, 4).toUpperCase()}-${prebooking.userId.slice(0, 4)}`,
                type: 'fixed',
                value: discountAmount,
                usageCount: 0,
                usageLimit: 1,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
                isActive: true,
                applicableCourseIds: [courseId],
                createdBy: 'admin',
                restrictedToUserId: prebooking.userId,
            };
            const promoRef = doc(collection(db, 'promo_codes'));
            batch.set(promoRef, promoCode);

            const notification = {
                userId: prebooking.userId,
                icon: 'Award' as const,
                title: `"${course.title}" is now live!`,
                description: `Your pre-booking was successful! Use code ${promoCode.code} to get your special discount.`,
                date: Timestamp.now(),
                read: false,
                link: `/checkout/${courseId}`
            };
            const notifRef = doc(collection(db, 'notifications'));
            batch.set(notifRef, notification);
        }
        
        const courseRef = doc(db, 'courses', courseId);
        batch.update(courseRef, { isPrebooking: false });

        await batch.commit();

        revalidatePath(`/admin/courses/builder/${courseId}`);
        revalidatePath(`/teacher/courses/builder/${courseId}`);
        revalidatePath(`/courses/${courseId}`);
        revalidatePath(`/sites/[site]/courses/${courseId}`);

        return { success: true, message: `Course launched! ${prebookings.length} students have been notified with their unique promo codes.` };

    } catch (error: any) {
        console.error("Error launching prebooking course:", error);
        return { success: false, message: error.message };
    }
}


export async function addLessonReactionAction(
  userId: string,
  courseId: string,
  lessonId: string,
  reactionType: 'likes' | 'loves' | 'helpfuls'
) {
  try {
    const userRef = doc(db, 'users', userId);
    const courseRef = doc(db, 'courses', courseId);

    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const courseDoc = await transaction.get(courseRef);

      if (!userDoc.exists()) throw new Error("User not found.");
      if (!courseDoc.exists()) throw new Error("Course not found.");

      const userData = userDoc.data() as User;
      if (userData.reactedLessons?.includes(lessonId)) {
        throw new Error("You have already reacted to this lesson.");
      }
      
      const courseData = courseDoc.data() as Course;

      const updatedSyllabus = courseData.syllabus?.map(module => ({
        ...module,
        lessons: module.lessons.map(lesson => {
          if (lesson.id === lessonId) {
            const currentReactions = lesson.reactions || { likes: 0, loves: 0, helpfuls: 0 };
            return {
              ...lesson,
              reactions: {
                ...currentReactions,
                [reactionType]: (currentReactions[reactionType] || 0) + 1,
              },
            };
          }
          return lesson;
        }),
      }));
      
      transaction.update(courseRef, { syllabus: updatedSyllabus });
      transaction.update(userRef, { reactedLessons: arrayUnion(lessonId) });
    });

    revalidatePath(`/student/my-courses/${courseId}/lesson/${lessonId}`);
    return { success: true, message: 'Thank you for your reaction!' };
  } catch (error: any) {
    console.error('Error adding reaction:', error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}
