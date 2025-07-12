
'use server';

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { z } from "zod";

const CallbackRequestSchema = z.object({
  fullName: z.string(),
  mobileNumber: z.string(),
  class: z.string(),
  goals: z.string(),
  preferredCourses: z.string(),
  state: z.string(),
});

type CallbackRequest = z.infer<typeof CallbackRequestSchema>;

export async function addCallbackRequest(data: CallbackRequest) {
  try {
    const validatedData = CallbackRequestSchema.parse(data);
    await addDoc(collection(db, 'callbacks'), {
      ...validatedData,
      createdAt: Timestamp.now(),
      status: 'pending', // 'pending', 'contacted', 'closed'
    });
    return { success: true, message: "Callback request submitted successfully." };
  } catch (error: any) {
    console.error("Error adding callback request: ", error);
    if (error instanceof z.ZodError) {
      return { success: false, message: "Invalid data provided." };
    }
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}
