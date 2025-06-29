
'use server';

import { revalidatePath } from 'next/cache';
import { 
    addCourse, 
    updateCourse, 
    deleteCourse,
    updateHomepageConfig,
    addUser,
    updateUser,
    deleteUser,
    updateInstructor,
    updateOrganization
} from '@/lib/firebase/firestore';
import { Course, User, Instructor, Organization } from '@/lib/types';

export async function saveCourseAction(courseData: Partial<Course>) {
  try {
    if (courseData.id) {
      await updateCourse(courseData.id, courseData);
      revalidatePath('/admin/courses');
      revalidatePath(`/admin/courses/builder/${courseData.id}`);
       revalidatePath(`/courses/${courseData.id}`);
      return { success: true, message: 'Course updated successfully.' };
    } else {
      const newCourseRef = await addCourse(courseData);
      revalidatePath('/admin/courses');
      return { success: true, message: 'Course created successfully.', courseId: newCourseRef.id };
    }
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteCourseAction(id: string) {
    try {
        await deleteCourse(id);
        revalidatePath('/admin/courses');
        return { success: true, message: 'Course deleted successfully.' };
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

export async function saveUserAction(userData: Partial<User>) {
    try {
        if (userData.id) {
            const { id, ...data } = userData;
            await updateUser(id, data);
            revalidatePath('/admin/users');
            return { success: true, message: 'User updated successfully.' };
        } else {
            await addUser(userData);
            revalidatePath('/admin/users');
            return { success: true, message: 'User created successfully.' };
        }
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deleteUserAction(id: string) {
    try {
        await deleteUser(id);
        revalidatePath('/admin/users');
        return { success: true, message: 'User deleted successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function updateInstructorStatusAction(id: string, status: Instructor['status']) {
    try {
        await updateInstructor(id, { status });
        revalidatePath('/admin/teachers');
        return { success: true, message: 'Instructor status updated.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function updateOrganizationStatusAction(id: string, status: Organization['status']) {
    try {
        await updateOrganization(id, { status });
        revalidatePath('/admin/partners');
        return { success: true, message: 'Organization status updated.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
