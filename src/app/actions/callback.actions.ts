
'use server';

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { z } from "zod";

const CallbackRequestSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  mobileNumber: z.string().min(10, "A valid mobile number is required."),
  class: z.string(),
  goals: z.string(),
  preferredCourses: z.string(),
  state: z.string(),
});

export type CallbackRequest = z.infer<typeof CallbackRequestSchema>;

export async function addCallbackRequest(data: CallbackRequest): Promise<{ success: boolean; message: string }> {
  try {
    const validatedData = CallbackRequestSchema.parse(data);
    await addDoc(collection(db, 'callbacks'), {
      ...validatedData,
      requestedAt: Timestamp.now(),
      status: 'Pending', 
    });
    return { success: true, message: "Callback request submitted successfully." };
  } catch (error: any) {
    console.error("Error adding callback request: ", error);
    if (error instanceof z.ZodError) {
      return { success: false, message: "Invalid data provided. Please check the form." };
    }
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}
