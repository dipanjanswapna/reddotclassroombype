'use server';

import {
  getFoldersForUser,
  getListsForUser,
  getTasksForUser,
  addDocument,
  updateDocument,
  deleteDocument,
  getListsInFolder,
  getTasksInList,
  getTasksInFolder,
} from '@/lib/firebase/firestore';
import { Folder, List, PlannerTask } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { writeBatch } from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase/config';

// Folders
export async function getFolders(userId: string) {
  return await getFoldersForUser(userId);
}

export async function saveFolder(folder: Partial<Folder>) {
  if (folder.id) {
    await updateDocument('folders', folder.id, folder);
  } else {
    await addDocument('folders', folder);
  }
  revalidatePath('/student/planner');
}

export async function deleteFolder(folderId: string, userId: string) {
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
export async function getLists(userId: string) {
  return await getListsForUser(userId);
}

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
export async function getTasks(userId: string) {
  return await getTasksForUser(userId);
}

export async function saveTask(task: Partial<PlannerTask>) {
  if (task.id) {
    await updateDocument('tasks', task.id, task);
  } else {
    await addDocument('tasks', task);
  }
  revalidatePath('/student/planner');
}

export async function deleteTask(taskId: string) {
  await deleteDocument('tasks', taskId);
  revalidatePath('/student/planner');
}

// Pomodoro Update
export async function completePomoSession(taskId: string, currentActualPomo: number, userId: string) {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore not initialized");

    const taskRef = doc(db, 'tasks', taskId);
    const userRef = doc(db, 'users', userId);

    const batch = writeBatch(db);
    batch.update(taskRef, { actualPomo: (currentActualPomo || 0) + 1 });
    
    // In the future, points might depend on difficulty, etc.
    const userDoc = await getDoc(userRef);
    if(userDoc.exists()) {
        const userData = userDoc.data();
        const currentPoints = userData.studyPoints || 0;
        batch.update(userRef, { studyPoints: currentPoints + 1 });
    }

    await batch.commit();
    revalidatePath('/student/planner');
}
