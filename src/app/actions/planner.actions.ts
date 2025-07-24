'use server';

import {
  addDocument,
  updateDocument,
  deleteDocument,
  getListsInFolder,
  getTasksInList,
  getFoldersForUser,
  getListsForUser,
  getTasksForUser
} from '@/lib/firebase/firestore';
import { Folder, List, PlannerTask } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { doc, writeBatch } from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase/config';
import { google } from 'googleapis';
import { getUser } from '@/lib/firebase/firestore';


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

async function syncToGoogleCalendar(task: PlannerTask, userId: string) {
    const user = await getUser(userId);
    if (!user?.googleCalendarTokens?.accessToken || !user.googleCalendarTokens.refreshToken) {
        console.log("No Google Calendar tokens found for user.");
        return null;
    }
    
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials(user.googleCalendarTokens as any);
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const event = {
        summary: task.title,
        description: task.description || '',
        start: {
            dateTime: new Date(`${task.date}T${task.time || '09:00:00'}`).toISOString(),
            timeZone: 'Asia/Dhaka',
        },
        end: {
            dateTime: new Date(`${task.date}T${task.endTime || (task.time ? (parseInt(task.time.split(':')[0]) + 1).toString().padStart(2, '0') + ':' + task.time.split(':')[1] : '10:00:00')}`).toISOString(),
            timeZone: 'Asia/Dhaka',
        },
    };

    try {
        if (task.googleCalendarEventId) {
            const res = await calendar.events.update({
                calendarId: 'primary',
                eventId: task.googleCalendarEventId,
                requestBody: event,
            });
            return res.data.id;
        } else {
            const res = await calendar.events.insert({
                calendarId: 'primary',
                requestBody: event,
            });
            return res.data.id;
        }
    } catch (error) {
        console.error('Error syncing to Google Calendar:', error);
        return null; // Don't block task creation if sync fails
    }
}

export async function saveTask(task: PlannerTask) {
    if (task.userId) {
       const googleEventId = await syncToGoogleCalendar(task, task.userId);
       if (googleEventId) {
           task.googleCalendarEventId = googleEventId;
       }
    }

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
