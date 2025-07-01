'use server';

import { revalidatePath } from 'next/cache';
import { addOrganization, deleteOrganization, getOrganization, getUserByUid, updateOrganization, updateUser } from '@/lib/firebase/firestore';
import { Organization } from '@/lib/types';

export async function updateOrganizationStatusAction(id: string, status: Organization['status']) {
    try {
        await updateOrganization(id, { status });

        if (status === 'approved') {
            const organization = await getOrganization(id);
            if(organization?.contactUserId) {
                const user = await getUserByUid(organization.contactUserId);
                if(user) await updateUser(user.id!, { status: 'Active' });
            }
        }
        revalidatePath('/admin/sellers');
        return { success: true, message: 'Seller status updated.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function savePartnerBrandingAction(id: string, data: Partial<Organization>) {
    try {
        await updateOrganization(id, data);
        revalidatePath(`/seller/branding`);
        if (data.subdomain) {
            revalidatePath(`/sites/${data.subdomain}`);
        }
        return { success: true, message: 'Branding updated successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function applyAsSellerAction(data: Omit<Organization, 'id' | 'status'> & { contactUserId: string }) {
    try {
        const newPartnerData: Partial<Organization> = {
            ...data,
            status: 'pending'
        };
        await addOrganization(newPartnerData);
        return { success: true, message: 'Application submitted successfully! Our team will review it and get back to you shortly.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function inviteSellerAction(data: Omit<Organization, 'id' | 'status'>) {
    try {
        const newPartnerData: Partial<Organization> = {
            ...data,
            status: 'approved'
        };
        await addOrganization(newPartnerData);
        revalidatePath('/admin/sellers');
        return { success: true, message: 'Seller invited and approved successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deleteOrganizationAction(id: string) {
    try {
        await deleteOrganization(id);
        revalidatePath('/admin/sellers');
        return { success: true, message: 'Seller organization deleted successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
