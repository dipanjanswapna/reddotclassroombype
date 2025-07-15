
'use server';
import 'dotenv/config';

import { revalidatePath } from 'next/cache';
import { addBranch, deleteBranch, updateBranch } from '@/lib/firebase/firestore';
import { Branch } from '@/lib/types';

export async function saveBranchAction(branchData: Partial<Branch>) {
  try {
    if (branchData.id) {
      const { id, ...data } = branchData;
      await updateBranch(id, data);
    } else {
      await addBranch(branchData as Branch);
    }
    
    revalidatePath('/admin/offline-hub');

    return { success: true, message: 'Branch saved successfully.' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteBranchAction(id: string) {
    try {
        await deleteBranch(id);
        revalidatePath('/admin/offline-hub');
        return { success: true, message: 'Branch deleted successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
