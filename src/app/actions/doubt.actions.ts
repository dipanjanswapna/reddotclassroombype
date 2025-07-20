'use server';

import {
  collection,
  addDoc,
  Timestamp,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  orderBy,
  runTransaction,
  writeBatch,
} from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase/config';
import type { Doubt, DoubtAnswer } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { addNotification } from '@/lib/firebase/firestore';

// Function to create a new doubt
export async function askDoubtAction(doubtData: {
  sessionId: string;
  courseId: string;
  studentId: string;
  questionText: string;
  attachments?: any[]; // Simplified for now
}): Promise<{ success: boolean; message: string; doubtId?: string }> {
  const db = getDbInstance();
  if (!db) return { success: false, message: 'Database service is unavailable.' };

  try {
    const newDoubt: Omit<Doubt, 'id'> = {
      ...doubtData,
      status: 'Open',
      askedAt: Timestamp.now(),
      lastUpdatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'doubts'), newDoubt);

    // Placeholder for notifying doubt solvers
    // In a real app, you would get assignedDoubtSolverIds from the session
    // and create notifications for each of them.
    console.log(`New doubt created: ${docRef.id}. Need to notify solvers.`);

    revalidatePath(`/student/my-courses/${doubtData.courseId}/doubt-solve`);

    return { success: true, message: 'Your question has been submitted.', doubtId: docRef.id };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to submit your question.' };
  }
}

// Function to add an answer to a doubt
export async function answerDoubtAction(answerData: {
  doubtId: string;
  doubtSolverId: string;
  answerText: string;
  attachments?: any[]; // Simplified
  studentId: string; // Needed for notification
}): Promise<{ success: boolean; message: string }> {
  const db = getDbInstance();
  if (!db) return { success: false, message: 'Database service is unavailable.' };
  
  try {
    const doubtRef = doc(db, 'doubts', answerData.doubtId);

    await runTransaction(db, async (transaction) => {
      const doubtDoc = await transaction.get(doubtRef);
      if (!doubtDoc.exists()) {
        throw new Error("Doubt not found.");
      }
      
      const newAnswer: Omit<DoubtAnswer, 'id'> = {
        doubtId: answerData.doubtId,
        doubtSolverId: answerData.doubtSolverId,
        answerText: answerData.answerText,
        answeredAt: Timestamp.now(),
        attachments: answerData.attachments,
      };

      const answerRef = doc(collection(db, 'doubt_answers'));
      transaction.set(answerRef, newAnswer);
      
      const doubtData = doubtDoc.data();
      transaction.update(doubtRef, {
        status: 'Answered',
        lastUpdatedAt: Timestamp.now(),
        assignedDoubtSolverId: doubtData.assignedDoubtSolverId || answerData.doubtSolverId,
      });

      // Notify student
       await addNotification({
          userId: answerData.studentId,
          icon: 'doubt_answered',
          title: 'Your question has been answered!',
          description: `A doubt solver has replied to your question.`,
          date: Timestamp.now(),
          read: false,
          link: `/student/my-courses/${doubtData.courseId}/doubt-solve`
      });
    });

    revalidatePath(`/doubt-solver/dashboard`);
    revalidatePath(`/student/my-courses/*/doubt-solve`);
    
    return { success: true, message: 'Your answer has been submitted.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to submit answer.' };
  }
}

// Function to reopen a doubt
export async function reopenDoubtAction(doubtId: string, followupQuestion: string): Promise<{ success: boolean; message: string }> {
    const db = getDbInstance();
    if (!db) return { success: false, message: 'Database service is unavailable.' };

    try {
        const doubtRef = doc(db, 'doubts', doubtId);
        
        await updateDoc(doubtRef, {
            status: 'Reopened',
            lastUpdatedAt: Timestamp.now()
        });

        // Add the followup as an "answer" from the student
        const followupAnswer: Omit<DoubtAnswer, 'id'> = {
            doubtId,
            doubtSolverId: 'student_followup', // Special marker
            answerText: followupQuestion,
            answeredAt: Timestamp.now()
        };
        await addDoc(collection(db, 'doubt_answers'), followupAnswer);
        
        // Notify the assigned doubt solver
        // In a real app, you would fetch the doubt, get the assignedDoubtSolverId and notify them.

        revalidatePath(`/student/my-courses/*`);
        revalidatePath(`/doubt-solver/dashboard`);
        return { success: true, message: "Your followup question has been sent." };
    } catch(error: any) {
        return { success: false, message: error.message || "Failed to reopen doubt." };
    }
}


// Function for student to mark a doubt as satisfied
export async function markDoubtAsSatisfiedAction(doubtId: string, rating: number): Promise<{ success: boolean; message: string }> {
    const db = getDbInstance();
    if (!db) return { success: false, message: 'Database service is unavailable.' };
    
    try {
        const doubtRef = doc(db, 'doubts', doubtId);
        await updateDoc(doubtRef, {
            status: 'Satisfied',
            rating: rating,
            lastUpdatedAt: Timestamp.now(),
        });
        
        // Notify the solver
        
        revalidatePath(`/student/my-courses/*`);
        revalidatePath(`/doubt-solver/dashboard`);
        return { success: true, message: "Thank you for your feedback!" };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to update doubt status." };
    }
}
