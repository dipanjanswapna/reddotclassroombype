
'use server';

import { revalidatePath } from 'next/cache';
import { addDoc, collection, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Notice } from '@/lib/types';
import { removeUndefinedValues } from '@/lib/utils';


export async function saveNoticeAction(noticeData: Partial<Notice>) {
  try {
    const { id, ...data } = noticeData;

    const cleanData: Partial<Notice> = removeUndefinedValues({
      ...data,
      updatedAt: Timestamp.now(),
    });

    if (id) {
      // Update existing notice
      const noticeRef = doc(db, 'notices', id);
      const existingDoc = await getDoc(noticeRef);
      const existingData = existingDoc.data();
      
      // If a draft is being published for the first time, set publishedAt
      if (cleanData.isPublished && !existingData?.isPublished) {
          cleanData.publishedAt = Timestamp.now();
      }

      await updateDoc(noticeRef, cleanData);
    } else {
      // Create new notice
      cleanData.createdAt = Timestamp.now();
      if(cleanData.isPublished) {
        cleanData.publishedAt = Timestamp.now();
      }
      await addDoc(collection(db, 'notices'), cleanData);
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
