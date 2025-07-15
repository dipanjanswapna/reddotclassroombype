
'use server';
import 'dotenv/config';

import { revalidatePath } from 'next/cache';
import { addQuestionToBank, deleteQuestionFromBank, updateQuestionInBank } from '@/lib/firebase/firestore';
import { Question } from '@/lib/types';
import { removeUndefinedValues } from '@/lib/utils';

export async function saveQuestionAction(questionData: Partial<Question>) {
  try {
    const { id, ...data } = questionData;
    const cleanData = removeUndefinedValues(data);

    if (id) {
      await updateQuestionInBank(id, cleanData);
    } else {
      if (!cleanData.type || !cleanData.text || !cleanData.difficulty) {
          throw new Error("Missing required fields for new question.");
      }
      await addQuestionToBank(cleanData as Omit<Question, 'id'>);
    }
    
    revalidatePath('/admin/question-bank');
    return { success: true, message: 'Question saved successfully.' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteQuestionAction(id: string) {
    try {
        await deleteQuestionFromBank(id);
        revalidatePath('/admin/question-bank');
        return { success: true, message: 'Question deleted successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
