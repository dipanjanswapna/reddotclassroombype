

'use server';

import { revalidatePath } from 'next/cache';
import { addDoc, collection, doc, updateDoc, runTransaction, arrayUnion, writeBatch, getDoc } from 'firebase/firestore';
import { 
    deleteCourse, 
    getCourse, 
    getPrebookingsByCourseId, 
    addPromoCode, 
    addNotification, 
    getEnrollmentsByCourseId,
    getPromoCodes,
    getInstructorBySlug
} from '@/lib/firebase/firestore';
import { Course, User, PromoCode, Instructor } from '@/lib/types';
import { db } from '@/lib/firebase/config';
import { removeUndefinedValues } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';

export async function saveCourseAction(courseData: Partial<Course>) {
  try {
    const { id, ...data } = courseData;

    // Auto-save new questions to the question bank before saving the course
    if (data.examTemplates && Array.isArray(data.examTemplates)) {
        for (const template of data.examTemplates) {
            if (template.questions && Array.isArray(template.questions)) {
            template.questions = await Promise.all(
                template.questions.map(async (q) => {
                if (q.id?.startsWith('new_q_')) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { id, ...newQuestionData } = q; // Exclude temporary ID
                    const newQuestionRef = await addDoc(collection(db, 'question_bank'), newQuestionData);
                    return { ...q, id: newQuestionRef.id };
                }
                return q;
                })
            );
            }
        }
    }

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
        const batch = writeBatch(db);

        // 1. Delete course document
        const courseRef = doc(db, 'courses', id);
        batch.delete(courseRef);

        // 2. Delete enrollments for this course
        const enrollments = await getEnrollmentsByCourseId(id);
        enrollments.forEach(enrollment => {
            const enrollmentRef = doc(db, 'enrollments', enrollment.id!);
            batch.delete(enrollmentRef);
        });
        
        // 3. Delete prebookings for this course
        const prebookings = await getPrebookingsByCourseId(id);
        prebookings.forEach(prebooking => {
            const prebookingRef = doc(db, 'prebookings', prebooking.id!);
            batch.delete(prebookingRef);
        });
        
        // 4. Update or delete relevant promo codes
        const promoCodes = await getPromoCodes();
        promoCodes.forEach(promo => {
            if (promo.applicableCourseIds.includes(id)) {
                if (promo.applicableCourseIds.length === 1) {
                    // Delete promo if it only applies to this course
                    const promoRef = doc(db, 'promo_codes', promo.id!);
                    batch.delete(promoRef);
                } else {
                    // Otherwise, just remove this courseId from the list
                    const updatedApplicableIds = promo.applicableCourseIds.filter(courseId => courseId !== id);
                    const promoRef = doc(db, 'promo_codes', promo.id!);
                    batch.update(promoRef, { applicableCourseIds: updatedApplicableIds });
                }
            }
        });

        await batch.commit();

        revalidatePath('/admin/courses');
        revalidatePath('/teacher/courses');
        revalidatePath('/seller/courses');
        revalidatePath('/courses');
        return { success: true, message: 'Course and associated data deleted successfully.' };
    } catch (error: any) {
        console.error('Error deleting course:', error);
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
    let courseData: Course | null = null;
    let userData: User | null = null;

    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const courseDoc = await transaction.get(courseRef);

      if (!userDoc.exists()) throw new Error("User not found.");
      if (!courseDoc.exists()) throw new Error("Course not found.");
      
      userData = userDoc.data() as User;
      courseData = {id: courseDoc.id, ...courseDoc.data()} as Course;

      if (userData.reactedLessons?.includes(lessonId)) {
        // This won't be thrown if the button is disabled, but good for API-level protection
        throw new Error("You have already reacted to this lesson.");
      }
      
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
    
    // Send notification to instructors
    if (courseData?.instructors && courseData.instructors.length > 0 && userData) {
        const studentName = userData.name;
        const lesson = courseData.syllabus?.flatMap(m => m.lessons).find(l => l.id === lessonId);
        
        if (lesson) {
            for (const instructorInfo of courseData.instructors) {
                const instructor = await getInstructorBySlug(instructorInfo.slug);
                if (instructor?.userId) {
                    await addNotification({
                        userId: instructor.userId,
                        icon: 'ThumbsUp',
                        title: `New Reaction in ${courseData.title}`,
                        description: `${studentName} reacted to your lesson: "${lesson.title}"`,
                        date: Timestamp.now(),
                        read: false,
                        link: `/teacher/courses/builder/${courseId}`
                    });
                }
            }
        }
    }

    revalidatePath(`/student/my-courses/${courseId}/lesson/${lessonId}`);
    return { success: true, message: 'Thank you for your reaction!' };
  } catch (error: any) {
    console.error('Error adding reaction:', error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}
