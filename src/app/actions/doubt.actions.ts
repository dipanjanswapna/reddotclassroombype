
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
  getDoc,
} from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase/config';
import type { Doubt, DoubtAnswer } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { addNotification, getCourse } from '@/lib/firebase/firestore';

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

    // Notify assigned doubt solvers
    const course = await getCourse(doubtData.courseId);
    if (course && course.doubtSolverIds) {
      const notificationPromises = course.doubtSolverIds.map(solverId => 
        addNotification({
          userId: solverId,
          icon: 'HelpCircle',
          title: `New Doubt in "${course.title}"`,
          description: doubtData.questionText.substring(0, 50) + '...',
          date: Timestamp.now(),
          read: false,
          link: `/doubt-solver/doubt/${docRef.id}`
        })
      );
      await Promise.all(notificationPromises);
    }


    revalidatePath(`/student/my-courses/${doubtData.courseId}/doubt-solve`);
    revalidatePath('/doubt-solver/dashboard');

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
  courseTitle: string;
  courseId: string;
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

       await addNotification({
          userId: answerData.studentId,
          icon: 'MessageSquare',
          title: `Your question in "${answerData.courseTitle}" was answered!`,
          description: `A doubt solver has replied to your question.`,
          date: Timestamp.now(),
          read: false,
          link: `/student/my-courses/${answerData.courseId}/doubt-solve`
      });
    });

    revalidatePath(`/doubt-solver/dashboard`);
    revalidatePath(`/student/my-courses/${answerData.courseId}/doubt-solve`);
    
    return { success: true, message: 'Your answer has been submitted.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to submit answer.' };
  }
}

// Function to reopen a doubt
export async function reopenDoubtAction(doubtId: string, followupQuestion: string, studentId: string): Promise<{ success: boolean; message: string }> {
    const db = getDbInstance();
    if (!db) return { success: false, message: 'Database service is unavailable.' };

    try {
        const doubtRef = doc(db, 'doubts', doubtId);
        const doubtSnap = await getDoc(doubtRef);
        if(!doubtSnap.exists()) throw new Error("Doubt not found");
        const doubtData = doubtSnap.data();

        await updateDoc(doubtRef, {
            status: 'Reopened',
            lastUpdatedAt: Timestamp.now()
        });

        const followupAnswer: Omit<DoubtAnswer, 'id'> = {
            doubtId,
            doubtSolverId: studentId,
            answerText: followupQuestion,
            answeredAt: Timestamp.now()
        };
        await addDoc(collection(db, 'doubt_answers'), followupAnswer);
        
        if (doubtData.assignedDoubtSolverId) {
            await addNotification({
                userId: doubtData.assignedDoubtSolverId,
                icon: 'HelpCircle',
                title: 'Doubt Reopened!',
                description: `A student has a follow-up question.`,
                date: Timestamp.now(),
                read: false,
                link: `/doubt-solver/doubt/${doubtId}`
            });
        }

        revalidatePath(`/student/my-courses/${doubtData.courseId}/doubt-solve`);
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
        const doubtSnap = await getDoc(doubtRef);
        if(!doubtSnap.exists()) throw new Error("Doubt not found");
        const doubtData = doubtSnap.data();

        await updateDoc(doubtRef, {
            status: 'Satisfied',
            rating: rating,
            lastUpdatedAt: Timestamp.now(),
        });
        
        if (doubtData.assignedDoubtSolverId) {
            await addNotification({
                userId: doubtData.assignedDoubtSolverId,
                icon: 'Star',
                title: 'Answer Rated!',
                description: `A student rated your answer with ${rating} stars.`,
                date: Timestamp.now(),
                read: false,
                link: `/doubt-solver/doubt/${doubtId}`
            });
        }
        
        revalidatePath(`/student/my-courses/${doubtData.courseId}/doubt-solve`);
        revalidatePath(`/doubt-solver/dashboard`);
        return { success: true, message: "Thank you for your feedback!" };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to update doubt status." };
    }
}
