

'use server';

import {
  addDocument,
  updateDocument,
  deleteDocument,
  getListsInFolder,
  getTasksInList,
  getUser,
  getDocument,
} from '@/lib/firebase/firestore';
import { Folder, List, PlannerTask, Goal } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase/config';
import { createGoogleCalendarEvent, updateGoogleCalendarEvent, deleteGoogleCalendarEvent } from '@/lib/google-calendar';


// Folders
export async function saveFolder(folder: Partial<Folder>) {
  const dataToSave = { ...folder, updatedAt: serverTimestamp() };
  if (folder.id) {
    await updateDocument('folders', folder.id, dataToSave);
  } else {
    await addDocument('folders', { ...dataToSave, createdAt: serverTimestamp() });
  }
  revalidatePath('/student/planner');
}

export async function deleteFolder(folderId: string) {
  const db = getDbInstance();
  if (!db) throw new Error("Firestore not initialized");

  const batch = writeBatch(db);
  const listsToDelete = await getListsInFolder(folderId);

  for (const list of listsToDelete) {
    const tasksToDelete = await getTasksInList(list.id!);
    for (const task of tasksToDelete) {
        batch.delete(doc(db, 'tasks', task.id!));
    }
    batch.delete(doc(db, 'lists', list.id!));
  }
  
  batch.delete(doc(db, 'folders', folderId));
  await batch.commit();
  revalidatePath('/student/planner');
}

// Lists
export async function saveList(list: Partial<List>) {
  const dataToSave = { ...list, updatedAt: serverTimestamp() };
  if (list.id) {
    await updateDocument('lists', list.id, dataToSave);
  } else {
    await addDocument('lists', { ...dataToSave, createdAt: serverTimestamp() });
  }
  revalidatePath('/student/planner');
}

export async function deleteList(listId: string) {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore not initialized");

    const batch = writeBatch(db);
    const tasksToDelete = await getTasksInList(listId);
    for (const task of tasksToDelete) {
        batch.delete(doc(db, 'tasks', task.id!));
    }
    batch.delete(doc(db, 'lists', listId));
    await batch.commit();
    revalidatePath('/student/planner');
}

// Tasks
export async function saveTask(task: Partial<PlannerTask>) {
  let dataToSave = { ...task, lastUpdatedAt: serverTimestamp() };
  const user = await getUser(task.userId!);

  if (user?.googleCalendarTokens?.refreshToken && task.date) {
    try {
      if (task.googleCalendarEventId) {
        // Update existing event
        await updateGoogleCalendarEvent(user, task as PlannerTask);
      } else {
        // Create new event
        const eventId = await createGoogleCalendarEvent(user, task as PlannerTask);
        if (eventId) {
          dataToSave.googleCalendarEventId = eventId;
        }
      }
    } catch(error) {
       console.error("Google Calendar Sync Error:", error);
       // Don't block task saving if calendar sync fails
    }
  }

  if (task.id) {
    await updateDocument('tasks', task.id, dataToSave);
  } else {
    await addDocument('tasks', { ...dataToSave, createdAt: serverTimestamp() });
  }
  revalidatePath('/student/planner');
}

export async function deleteTask(taskId: string, userId: string) {
  const taskToDelete = await getDocument<PlannerTask>('tasks', taskId);
  if (taskToDelete?.googleCalendarEventId) {
    const user = await getUser(userId);
    if(user?.googleCalendarTokens?.refreshToken) {
      try {
        await deleteGoogleCalendarEvent(user, taskToDelete.googleCalendarEventId);
      } catch (error) {
        console.error("Google Calendar Sync Error on delete:", error);
      }
    }
  }

  await deleteDocument('tasks', taskId);
  revalidatePath('/student/planner');
}

// Goals
export async function saveGoal(goal: Partial<Goal>) {
  const dataToSave = { ...goal, updatedAt: serverTimestamp() };
  if (goal.id) {
    await updateDocument('goals', goal.id, dataToSave);
  } else {
    await addDocument('goals', { ...goal, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  }
  revalidatePath('/student/planner');
}

export async function deleteGoal(goalId: string) {
  await deleteDocument('goals', goalId);
  revalidatePath('/student/planner');
}
