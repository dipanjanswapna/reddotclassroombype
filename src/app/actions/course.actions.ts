'use server';

import { revalidatePath } from 'next/cache';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { deleteCourse } from '@/lib/firebase/firestore';
import { Course } from '@/lib/types';
import { db } from '@/lib/firebase/config';

export async function saveCourseAction(courseData: Partial<Course>) {
  try {
    const { id, ...data } = courseData;

    // The data is now pre-cleaned on the client-side, but as a safeguard,
    // we can still handle specific edge cases here.
    const cleanData = data as any;
    
    // Ensure organizationId is not an empty string if it exists
    if (cleanData.organizationId === '') {
        delete cleanData.organizationId;
    }

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
