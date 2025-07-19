
'use server';
import 'dotenv/config';

import { revalidatePath } from 'next/cache';
import { addProduct, deleteProduct, updateProduct } from '@/lib/firebase/firestore';
import { Product } from '@/lib/types';
import { removeUndefinedValues } from '@/lib/utils';

export async function saveProductAction(productData: Partial<Product>) {
  try {
    const { id, ...data } = productData;
    const cleanData = removeUndefinedValues(data);

    if (id) {
      await updateProduct(id, cleanData);
    } else {
      if (!cleanData.name || !cleanData.price || !cleanData.category) {
          throw new Error("Missing required fields for new product.");
      }
      await addProduct(cleanData as Omit<Product, 'id'>);
    }
    
    revalidatePath('/admin/store/products');
    revalidatePath('/store');
    if (id) {
        revalidatePath(`/store/product/${id}`);
    }

    return { success: true, message: 'Product saved successfully.' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteProductAction(id: string) {
    try {
        await deleteProduct(id);
        revalidatePath('/admin/store/products');
        revalidatePath('/store');
        return { success: true, message: 'Product deleted successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
