
'use server';

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { z } from "zod";
import { revalidatePath } from 'next/cache';
import type { CallbackRequest } from '@/lib/types';

const CallbackRequestSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  mobileNumber: z.string().min(10, "A valid mobile number is required."),
  class: z.string(),
  goals: z.string(),
  preferredCourses: z.string(),
  state: z.string(),
});

type FormData = z.infer<typeof CallbackRequestSchema>;

export async function addCallbackRequest(data: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const validatedData = CallbackRequestSchema.parse(data);
    
    const newRequest: Omit<CallbackRequest, 'id'> = {
      ...validatedData,
      requestedAt: Timestamp.now(),
      status: 'Pending', 
    };

    await addDoc(collection(db, 'callbacks'), newRequest);
    
    // Revalidate the admin page where requests are viewed.
    revalidatePath('/admin/callback-requests');

    return { success: true, message: "Callback request submitted successfully." };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: "Invalid data provided. Please check the form." };
    }
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    console.error("Error adding callback request: ", errorMessage);
    return { success: false, message: errorMessage };
  }
}
