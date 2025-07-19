
'use server';
import 'dotenv/config';

import { revalidatePath } from 'next/cache';
import { addProduct, deleteProduct, updateProduct, getProduct } from '@/lib/firebase/firestore';
import { Product, ProductReview } from '@/lib/types';
import { removeUndefinedValues } from '@/lib/utils';
import { Timestamp, runTransaction, doc } from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase/config';

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

export async function addProductReviewAction(productId: string, review: Omit<ProductReview, 'id' | 'createdAt'>) {
    const db = getDbInstance();
    if (!db) {
      throw new Error("Database service is currently unavailable.");
    }
    if (review.rating < 1 || review.rating > 5) {
      return { success: false, message: 'Invalid rating value.' };
    }

    try {
      const productRef = doc(db, 'products', productId);

      await runTransaction(db, async (transaction) => {
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists()) throw new Error("Product not found.");

        const productData = productDoc.data() as Product;

        const newReview: ProductReview = {
            ...review,
            id: new Date().getTime().toString(),
            createdAt: Timestamp.now(),
        };

        const existingReviews = productData.reviews || [];
        // Check if user has already reviewed
        // if (existingReviews.some(r => r.userId === review.userId)) {
        //   throw new Error("You have already reviewed this product.");
        // }

        const newReviews = [newReview, ...existingReviews];
        const newReviewCount = newReviews.length;
        const newRating = (existingReviews.reduce((sum, r) => sum + r.rating, 0) + newReview.rating) / newReviewCount;
        
        transaction.update(productRef, {
            reviews: newReviews,
            reviewsCount: newReviewCount,
            ratings: parseFloat(newRating.toFixed(2)),
        });
      });
      
      revalidatePath(`/store/product/${productId}`);
      
      return { success: true, message: 'Thank you for your review!' };
    } catch (error: any) {
      console.error('Error adding product review:', error);
      return { success: false, message: error.message || 'An unexpected error occurred.' };
    }
}
