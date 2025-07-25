

'use server';
import 'dotenv/config';

import { revalidatePath } from 'next/cache';
import { 
    addInstructor, 
    deleteInstructor, 
    getInstructor, 
    getUser, 
    updateInstructor, 
    updateUser,
    getCourses
} from '@/lib/firebase/firestore';
import { Instructor, User } from '@/lib/types';
import { generateRegistrationNumber, removeUndefinedValues } from '@/lib/utils';
import { writeBatch, doc } from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase/config';

export async function createInstructorAction(data: Partial<Omit<Instructor, 'status' | 'slug'>> & { uid: string }) {
    try {
        const { uid, ...instructorData } = data;
        const slug = `${instructorData.name?.toLowerCase().replace(/\s+/g, '-')}-${uid.substring(0, 6)}`;
        const newInstructor = {
            ...instructorData,
            userId: uid, // Link to user
            slug: slug,
            status: 'Pending Approval',
        };
        await addInstructor(newInstructor as Instructor);
        revalidatePath('/auth/teacher-signup');
        revalidatePath('/admin/teachers');
        return { success: true, message: 'Application submitted successfully! Our team will review it and get back to you shortly.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function updateInstructorStatusAction(id: string, status: Instructor['status']) {
    try {
        await updateInstructor(id, { status });
        
        if (status === 'Approved') {
            const instructor = await getInstructor(id);
            if(instructor?.userId) {
                const user = await getUser(instructor.userId);
                if(user) {
                    const updates: Partial<User> = { status: 'Active' };
                    const regNo = String(user.registrationNumber);
                    if (!user.registrationNumber || isNaN(parseInt(regNo)) || regNo.length !== 8) {
                        updates.registrationNumber = generateRegistrationNumber();
                    }
                    await updateUser(user.id!, updates);
                }
            }
        }

        revalidatePath('/admin/teachers');
        return { success: true, message: 'Instructor status updated.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function saveInstructorProfileAction(id: string, data: Partial<Instructor>) {
    const db = getDbInstance();
    if (!db) {
        throw new Error('Database service is currently unavailable.');
    }
    try {
        const currentInstructor = await getInstructor(id);
        if (!currentInstructor) {
            throw new Error("Instructor not found.");
        }
        const currentSlug = currentInstructor.slug;

        const batch = writeBatch(db);

        const instructorRef = doc(db, 'instructors', id);
        const cleanData = removeUndefinedValues(data);
        batch.update(instructorRef, cleanData);

        const allCourses = await getCourses();
        const affectedCourses = allCourses.filter(course =>
            course.instructors?.some(i => i.slug === currentSlug)
        );

        for (const course of affectedCourses) {
            const courseRef = doc(db, 'courses', course.id!);
            const newInstructorsArray = course.instructors.map(instructorInCourse => {
                if (instructorInCourse.slug === currentSlug) {
                    return {
                        ...instructorInCourse,
                        name: data.name ?? instructorInCourse.name,
                        title: data.title ?? instructorInCourse.title,
                        avatarUrl: data.avatarUrl ?? instructorInCourse.avatarUrl,
                        slug: data.slug ?? instructorInCourse.slug,
                        dataAiHint: data.dataAiHint ?? instructorInCourse.dataAiHint,
                    };
                }
                return instructorInCourse;
            });
            batch.update(courseRef, { instructors: newInstructorsArray });
        }
        
        await batch.commit();

        revalidatePath('/'); // Revalidate homepage to show new profile pic
        revalidatePath('/teacher/profile');
        if (data.slug) {
            revalidatePath(`/teachers/${data.slug}`);
        }
        revalidatePath('/courses', 'layout'); 

        return { success: true, message: 'Profile updated successfully across the platform.' };
    } catch (error: any) {
        console.error("Error updating instructor profile:", error);
        return { success: false, message: error.message };
    }
}


export async function inviteInstructorAction(data: Partial<Instructor>) {
    try {
        const newInstructor = {
            ...data,
            status: 'Pending Approval',
        };
        await addInstructor(newInstructor as Instructor);
        revalidatePath('/seller/teachers');
        return { success: true, message: 'Invitation sent successfully!' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function removeInstructorFromOrgAction(id: string) {
    try {
        await updateInstructor(id, { organizationId: '' });
        revalidatePath('/seller/teachers');
        return { success: true, message: 'Instructor removed from organization.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function adminInviteInstructorAction(data: Partial<Instructor>) {
    try {
        const randomString = Math.random().toString(36).substring(2, 8);
        const newInstructor = {
            ...data,
            status: 'Approved',
            slug: `${(data.name || '').toLowerCase().replace(/\s+/g, '-')}-${randomString}`,
            avatarUrl: `https://placehold.co/100x100.png?text=${(data.name || '').split(' ').map(n=>n[0]).join('')}`,
            dataAiHint: 'person teacher'
        };
        await addInstructor(newInstructor as Instructor);
        revalidatePath('/admin/teachers');
        return { success: true, message: 'Teacher invited and approved successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deleteInstructorAction(id: string) {
    const db = getDbInstance();
    if (!db) {
        throw new Error('Database service is currently unavailable.');
    }
    try {
        const instructor = await getInstructor(id);
        if (!instructor) {
            throw new Error("Instructor not found.");
        }

        const batch = writeBatch(db);

        // 1. Delete the instructor document
        const instructorRef = doc(db, 'instructors', id);
        batch.delete(instructorRef);

        // 2. If linked to a user, delete the user document
        if (instructor.userId) {
            const userToDelete = await getUser(instructor.userId);
            if (userToDelete?.id) {
                const userRef = doc(db, 'users', userToDelete.id);
                batch.delete(userRef);
            }
        }

        // 3. Remove this instructor from all courses
        const allCourses = await getCourses();
        allCourses.forEach(course => {
            if (course.instructors?.some(i => i.slug === instructor.slug)) {
                const updatedInstructors = course.instructors.filter(i => i.slug !== instructor.slug);
                const courseRef = doc(db, 'courses', course.id!);
                batch.update(courseRef, { instructors: updatedInstructors });
            }
        });
        
        await batch.commit();
        
        revalidatePath('/admin/teachers');
        return { success: true, message: 'Instructor and associated data deleted successfully.' };
    } catch (error: any) {
        console.error("Error deleting instructor:", error);
        return { success: false, message: error.message };
    }
}
