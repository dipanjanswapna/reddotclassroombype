

'use server';
import 'dotenv/config';

import { revalidatePath } from 'next/cache';
import { addDoc, collection, doc, updateDoc, runTransaction, arrayUnion, writeBatch, getDoc, getDocs, query, where } from 'firebase/firestore';
import { 
    deleteCourse as deleteCourseFromDb, 
    getCourse, 
    getPrebookingsByCourseId, 
    addPromoCode, 
    addNotification, 
    getEnrollmentsByCourseId,
    getPromoCodes,
    getInstructorBySlug
} from '@/lib/firebase/firestore';
import { Course, User, PromoCode, Instructor, Enrollment } from '@/lib/types';
import { db as getDbInstance } from '@/lib/firebase/config';
import { removeUndefinedValues } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';

export async function saveCourseAction(courseData: Partial<Course>) {
  const db = getDbInstance();
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

export async function deleteCourseAction(courseId: string) {
    const db = getDbInstance();
    try {
        const batch = writeBatch(db);

        // 1. Delete the course itself
        const courseRef = doc(db, 'courses', courseId);
        batch.delete(courseRef);

        // 2. Find and delete all enrollments for this course
        const enrollmentsQuery = query(collection(db, 'enrollments'), where('courseId', '==', courseId));
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
        enrollmentsSnapshot.forEach(doc => batch.delete(doc.ref));

        // 3. Find and delete all pre-bookings for this course
        const prebookingsQuery = query(collection(db, 'prebookings'), where('courseId', '==', courseId));
        const prebookingsSnapshot = await getDocs(prebookingsQuery);
        prebookingsSnapshot.forEach(doc => batch.delete(doc.ref));

        // 4. Find and delete all promo codes applicable to this course
        const promosQuery = query(collection(db, 'promo_codes'), where('applicableCourseIds', 'array-contains', courseId));
        const promosSnapshot = await getDocs(promosQuery);
        promosSnapshot.forEach(doc => batch.delete(doc.ref));
        
        // 5. Optionally, you could also delete attendance, notifications, etc.
        // For now, we'll keep them for historical records, but they can be added here.

        await batch.commit();

        revalidatePath('/admin/courses');
        revalidatePath('/teacher/courses');
        revalidatePath('/seller/courses');
        revalidatePath('/courses');
        return { success: true, message: 'Course and all associated data deleted successfully.' };
    } catch (error: any) {
        console.error('Error deleting course:', error);
        return { success: false, message: error.message || 'An unexpected error occurred.' };
    }
}

export async function launchPrebookingCourseAction(courseId: string) {
    const db = getDbInstance();
    try {
        const course = await getCourse(courseId);
        if (!course || !course.isPrebooking) {
            throw new Error('This is not a pre-booking course or course not found.');
        }

        const prebookings = await getPrebookingsByCourseId(courseId);
        
        const batch = writeBatch(db);
        const courseRef = doc(db, 'courses', courseId);
        batch.update(courseRef, { isPrebooking: false });

        if (prebookings.length > 0) {
            const finalPrice = parseFloat((course.price || '0').replace(/[^0-9.]/g, ''));
            const prebookingPrice = parseFloat((course.prebookingPrice || '0').replace(/[^0-9.]/g, ''));
            const discountAmount = finalPrice - prebookingPrice;

            if (discountAmount > 0) {
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
            }
        }
        
        await batch.commit();

        revalidatePath(`/admin/courses/builder/${courseId}`);
        revalidatePath(`/teacher/courses/builder/${courseId}`);
        revalidatePath(`/courses/${courseId}`);
        revalidatePath(`/sites/[site]/courses/${courseId}`);

        const message = prebookings.length > 0 
            ? `Course launched! ${prebookings.length} students have been notified with their unique promo codes.`
            : 'Course launched. No pre-bookings to notify.';

        return { success: true, message };

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
  const db = getDbInstance();
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
