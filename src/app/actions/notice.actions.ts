
'use server';

import 'dotenv/config';

import { revalidatePath } from 'next/cache';
import { collection, addDoc, deleteDoc, doc, updateDoc, Timestamp, getDoc } from 'firebase/firestore';
import { db as getDbInstance } from '@/lib/firebase/config';
import type { Notice } from '@/lib/types';
import { removeUndefinedValues } from '@/lib/utils';
import { getUsers, addNotification } from '@/lib/firebase/firestore';

export async function saveNoticeAction(noticeData: Partial<Notice>) {
  const db = getDbInstance();
  try {
    const { id, ...data } = noticeData;

    const cleanData: Partial<Notice> = removeUndefinedValues({
      ...data,
      updatedAt: Timestamp.now(),
    });

    let isNewlyPublished = false;

    if (id) {
      const noticeRef = doc(db, 'notices', id);
      const existingDoc = await getDoc(noticeRef);
      const existingData = existingDoc.data();
      
      // Check if a draft is being published for the first time
      if (cleanData.isPublished && !existingData?.isPublished) {
          cleanData.publishedAt = Timestamp.now();
          isNewlyPublished = true;
      }

      await updateDoc(noticeRef, cleanData);
    } else {
      cleanData.createdAt = Timestamp.now();
      if(cleanData.isPublished) {
        cleanData.publishedAt = Timestamp.now();
        isNewlyPublished = true;
      }
      await addDoc(collection(db, 'notices'), cleanData);
    }
    
    // If a notice was just published for the first time, notify all students.
    if (isNewlyPublished && cleanData.title) {
        const users = await getUsers();
        const students = users.filter(u => u.role === 'Student');
        
        const notificationPromises = students.map(student => 
            addNotification({
                userId: student.uid,
                icon: 'Megaphone',
                title: 'New Notice Published',
                description: cleanData.title!,
                date: Timestamp.now(),
                read: false,
            })
        );
        await Promise.all(notificationPromises);
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
    const db = getDbInstance();
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
