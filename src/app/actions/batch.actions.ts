
'use server';
import 'dotenv/config';

import { revalidatePath } from 'next/cache';
import { addBatch, deleteBatch, updateBatch } from '@/lib/firebase/firestore';
import { Batch } from '@/lib/types';

export async function saveBatchAction(batchData: Partial<Batch>) {
  try {
    if (batchData.id) {
      const { id, ...data } = batchData;
      await updateBatch(id, data);
    } else {
      await addBatch(batchData as Omit<Batch, 'id'>);
    }
    
    revalidatePath('/admin/offline-hub');

    return { success: true, message: 'Batch saved successfully.' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteBatchAction(id: string) {
    try {
        await deleteBatch(id);
        revalidatePath('/admin/offline-hub');
        return { success: true, message: 'Batch deleted successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
