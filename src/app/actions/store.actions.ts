
'use server';
import 'dotenv/config';

import { revalidatePath } from 'next/cache';
import { addStoreCategory, deleteStoreCategory, updateStoreCategory } from '@/lib/firebase/firestore';
import { StoreCategory } from '@/lib/types';
import { removeUndefinedValues } from '@/lib/utils';

export async function saveStoreCategoryAction(categoryData: Partial<StoreCategory>) {
  try {
    const { id, ...data } = categoryData;
    const cleanData = removeUndefinedValues(data);

    if (id) {
      await updateStoreCategory(id, cleanData);
    } else {
      if (!cleanData.name || !cleanData.slug) {
          throw new Error("Missing required fields for new category.");
      }
      await addStoreCategory(cleanData as Omit<StoreCategory, 'id'>);
    }
    
    revalidatePath('/admin/store/categories');
    revalidatePath('/store');

    return { success: true, message: 'Category saved successfully.' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteStoreCategoryAction(id: string) {
    try {
        await deleteStoreCategory(id);
        revalidatePath('/admin/store/categories');
        revalidatePath('/store');
        return { success: true, message: 'Category deleted successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
