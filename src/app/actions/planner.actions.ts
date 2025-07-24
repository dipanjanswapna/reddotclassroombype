

'use client';

import {
  addDocument,
  updateDocument,
  deleteDocument,
  getListsInFolder,
  getTasksInList,
  getUser,
  getDocument
} from '@/lib/firebase/firestore';
import { Folder, List, PlannerTask, Goal } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { doc, writeBatch } from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase/config';
import { createGoogleCalendarEvent, updateGoogleCalendarEvent, deleteGoogleCalendarEvent } from '@/lib/google-calendar';

// Folders
export async function saveFolder(folder: Partial<Folder>) {
  if (folder.id) {
    await updateDocument('folders', folder.id, folder);
  } else {
    await addDocument('folders', folder);
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
  if (list.id) {
    await updateDocument('lists', list.id, list);
  } else {
    await addDocument('lists', list);
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
export async function saveTask(task: PlannerTask) {
    const user = await getUser(task.userId);
    let eventId = task.googleCalendarEventId;

    if (user?.googleCalendarTokens?.refreshToken) {
        try {
            if (eventId) {
                await updateGoogleCalendarEvent(user, task);
            } else {
                eventId = await createGoogleCalendarEvent(user, task);
            }
        } catch (error) {
            console.error("Google Calendar Sync failed:", error);
            // Optionally, handle this error more gracefully, e.g., by notifying the user.
        }
    }
    
    const dataToSave = { ...task, googleCalendarEventId: eventId, lastUpdatedAt: new Date() };
    if (task.id) {
        await updateDocument('tasks', task.id, dataToSave);
    } else {
        await addDocument('tasks', { ...dataToSave, createdAt: new Date() });
    }
    revalidatePath('/student/planner');
}

export async function deleteTask(taskId: string, userId: string) {
  const user = await getUser(userId);
  const task = await getDocument<PlannerTask>('tasks', taskId);

  if (user?.googleCalendarTokens?.refreshToken && task?.googleCalendarEventId) {
    try {
      await deleteGoogleCalendarEvent(user, task.googleCalendarEventId);
    } catch (error) {
      console.error("Google Calendar Sync failed during delete:", error);
    }
  }

  await deleteDocument('tasks', taskId);
  revalidatePath('/student/planner');
}

// Goals
export async function saveGoal(goal: Partial<Goal>) {
  const dataToSave = { ...goal, updatedAt: new Date() };
  if (goal.id) {
    await updateDocument('goals', goal.id, dataToSave);
  } else {
    await addDocument('goals', { ...goal, createdAt: new Date(), updatedAt: new Date() });
  }
  revalidatePath('/student/planner');
}

export async function deleteGoal(goalId: string) {
  await deleteDocument('goals', goalId);
  revalidatePath('/student/planner');
}
