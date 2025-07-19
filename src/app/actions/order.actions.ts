
'use server';
import 'dotenv/config';
import { revalidatePath } from 'next/cache';
import { addDoc, collection, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase/config';
import type { Order } from '@/lib/types';
import { removeUndefinedValues } from '@/lib/utils';


export async function createOrderAction(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; message?: string; orderId?: string }> {
  const db = getDbInstance();
  if (!db) throw new Error("Database service is currently unavailable.");

  try {
    const newOrderData: Omit<Order, 'id'> = {
      ...orderData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const cleanOrderData = removeUndefinedValues(newOrderData);
    
    const orderRef = await addDoc(collection(db, 'orders'), cleanOrderData);
    
    revalidatePath('/admin/store/orders');
    revalidatePath('/student/payments');
    
    return { success: true, message: `Your order #${orderRef.id.slice(0, 8)} has been placed successfully.`, orderId: orderRef.id };

  } catch (error: any) {
    console.error("Error creating order:", error);
    return { success: false, message: error.message || "An unexpected error occurred." };
  }
}

export async function updateOrderStatusAction(orderId: string, status: Order['status']): Promise<{ success: boolean, message: string }> {
    const db = getDbInstance();
    if (!db) throw new Error("Database service is not available.");

    try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
            status: status,
            updatedAt: Timestamp.now(),
        });

        revalidatePath('/admin/store/orders');
        revalidatePath('/student/payments');
        
        return { success: true, message: "Order status updated successfully." };

    } catch (error: any) {
        console.error("Error updating order status:", error);
        return { success: false, message: error.message || "Failed to update order status." };
    }
}
