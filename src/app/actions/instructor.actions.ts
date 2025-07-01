'use server';

import { revalidatePath } from 'next/cache';
import { addInstructor, deleteInstructor, getInstructor, getUserByUid, updateInstructor, updateUser } from '@/lib/firebase/firestore';
import { Instructor } from '@/lib/types';

export async function createInstructorAction(data: Partial<Omit<Instructor, 'status'>> & { uid: string }) {
    try {
        const { uid, ...instructorData } = data;
        const newInstructor = {
            ...instructorData,
            userId: uid, // Link to user
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
                const user = await getUserByUid(instructor.userId);
                if(user) await updateUser(user.id!, { status: 'Active' });
            }
        }

        revalidatePath('/admin/teachers');
        return { success: true, message: 'Instructor status updated.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function saveInstructorProfileAction(id: string, data: Partial<Instructor>) {
    try {
        await updateInstructor(id, data);
        revalidatePath(`/teacher/profile`);
        if (data.slug) {
            revalidatePath(`/teachers/${data.slug}`);
        }
        return { success: true, message: 'Profile updated successfully.' };
    } catch (error: any) {
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
        const newInstructor = {
            ...data,
            status: 'Approved',
            slug: (data.name || '').toLowerCase().replace(/\s+/g, '-'),
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
    try {
        await deleteInstructor(id);
        revalidatePath('/admin/teachers');
        return { success: true, message: 'Instructor deleted successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
