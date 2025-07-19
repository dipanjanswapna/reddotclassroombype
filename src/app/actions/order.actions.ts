
'use server';
import 'dotenv/config';
import { revalidatePath } from 'next/cache';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase/config';
import type { Order } from '@/lib/types';
import { removeUndefinedValues } from '@/lib/utils';


export async function createOrderAction(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<{ success: boolean; message?: string; orderId?: string }> {
  const db = getDbInstance();
  if (!db) throw new Error("Database service is currently unavailable.");

  try {
    const newOrderData: Omit<Order, 'id'> = {
      ...orderData,
      createdAt: Timestamp.now(),
    };

    const cleanOrderData = removeUndefinedValues(newOrderData);
    
    const orderRef = await addDoc(collection(db, 'orders'), cleanOrderData);
    
    // Potentially revalidate admin paths in the future
    // revalidatePath('/admin/orders');
    
    return { success: true, orderId: orderRef.id };

  } catch (error: any) {
    console.error("Error creating order:", error);
    return { success: false, message: error.message || "An unexpected error occurred." };
  }
}
