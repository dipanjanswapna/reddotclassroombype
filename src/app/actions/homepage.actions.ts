
'use server';

import { revalidatePath } from 'next/cache';
import { updateHomepageConfig } from '@/lib/firebase/firestore';

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
