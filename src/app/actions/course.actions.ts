
'use server';

import { revalidatePath } from 'next/cache';
import { addDoc, collection, doc, updateDoc, runTransaction, arrayUnion } from 'firebase/firestore';
import { deleteCourse } from '@/lib/firebase/firestore';
import { Course, User } from '@/lib/types';
import { db } from '@/lib/firebase/config';
import { removeUndefinedValues } from '@/lib/utils';

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
      const courseData = courseDoc.data() as Course;

      if (userData.reactedLessons?.includes(lessonId)) {
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

    revalidatePath(`/student/my-courses/${courseId}/lesson/${lessonId}`);
    return { success: true, message: 'Thank you for your reaction!' };
  } catch (error: any) {
    console.error('Error adding reaction:', error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}
