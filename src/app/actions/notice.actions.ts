
'use server';

import { revalidatePath } from 'next/cache';
import { addDoc, collection, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Notice } from '@/lib/types';
import { removeUndefinedValues } from '@/lib/utils';


export async function saveNoticeAction(noticeData: Partial<Notice>) {
  try {
    const { id, ...data } = noticeData;

    const cleanData = removeUndefinedValues({
      ...data,
      updatedAt: Timestamp.now(),
    });
    
    if (id) {
      // Update existing notice
      const noticeRef = doc(db, 'notices', id);
      await updateDoc(noticeRef, cleanData);
    } else {
      // Create new notice
      const noticeRef = collection(db, 'notices');
      await addDoc(noticeRef, {
        ...cleanData,
        createdAt: Timestamp.now(),
      });
    }

    revalidatePath('/');
    revalidatePath('/admin/notices');

    return { success: true, message: 'Notice saved successfully.' };
  } catch (error: any) {
    console.error("Error saving notice:", error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}

export async function deleteNoticeAction(noticeId: string) {
    try {
        await deleteDoc(doc(db, 'notices', noticeId));
        revalidatePath('/');
        revalidatePath('/admin/notices');
        return { success: true, message: 'Notice deleted successfully.' };
    } catch (error: any) {
        console.error("Error deleting notice:", error);
        return { success: false, message: error.message || 'An unexpected error occurred.' };
    }
}
