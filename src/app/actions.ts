'use server';

import { revalidatePath } from 'next/cache';
import { addCourse, updateCourse, updateHomepageConfig } from '@/lib/firebase/firestore';
import { Course } from '@/lib/types';

export async function saveCourseAction(courseData: Partial<Course>) {
  try {
    if (courseData.id) {
      await updateCourse(courseData.id, courseData);
      revalidatePath('/admin/courses');
      revalidatePath(`/admin/courses/builder/${courseData.id}`);
       revalidatePath(`/courses/${courseData.id}`);
      return { success: true, message: 'Course updated successfully.' };
    } else {
      const newCourse = await addCourse(courseData);
      revalidatePath('/admin/courses');
      return { success: true, message: 'Course created successfully.', courseId: newCourse.id };
    }
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function saveHomepageConfigAction(config: any) {
    try {
        await updateHomepageConfig(config);
        revalidatePath('/admin/homepage');
        revalidatePath('/');
        return { success: true, message: 'Homepage configuration updated successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
