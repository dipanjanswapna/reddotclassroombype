
import { google } from 'googleapis';
import { User, PlannerTask } from './types';
import { updateUser } from './firebase/firestore';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

async function getAuthenticatedClient(user: User) {
    if (!user.googleCalendarTokens?.refreshToken) {
        throw new Error('User has not authenticated with Google Calendar.');
    }

    oauth2Client.setCredentials({
        refresh_token: user.googleCalendarTokens.refreshToken,
    });

    // Check if the access token has expired
    if (user.googleCalendarTokens.expiryDate && user.googleCalendarTokens.expiryDate < Date.now()) {
        const { credentials } = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(credentials);

        // Save the new tokens to the user's document
        await updateUser(user.id!, {
            googleCalendarTokens: {
                accessToken: credentials.access_token!,
                refreshToken: credentials.refresh_token || user.googleCalendarTokens.refreshToken,
                expiryDate: credentials.expiry_date!,
            },
        });
    } else {
         oauth2Client.setCredentials({
            access_token: user.googleCalendarTokens.accessToken,
            refresh_token: user.googleCalendarTokens.refreshToken
        });
    }

    return google.calendar({ version: 'v3', auth: oauth2Client });
}

export async function createGoogleCalendarEvent(user: User, task: PlannerTask): Promise<string | null> {
    if (!user.googleCalendarTokens) return null;

    const calendar = await getAuthenticatedClient(user);
    
    const event: any = {
        summary: task.title,
        description: task.description,
        start: {},
        end: {},
    };
    
    if (task.time) {
        const startTime = new Date(`${task.date}T${task.time}`);
        const endTime = task.endTime ? new Date(`${task.date}T${task.endTime}`) : new Date(startTime.getTime() + 60 * 60 * 1000);
        event.start.dateTime = startTime.toISOString();
        event.end.dateTime = endTime.toISOString();
        event.start.timeZone = 'Asia/Dhaka';
        event.end.timeZone = 'Asia/Dhaka';
    } else {
        event.start.date = task.date;
        event.end.date = task.date;
    }

    try {
        const res = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
        });
        return res.data.id || null;
    } catch (error) {
        console.error('Error creating Google Calendar event:', error);
        throw error;
    }
}

export async function updateGoogleCalendarEvent(user: User, task: PlannerTask) {
    if (!user.googleCalendarTokens || !task.googleCalendarEventId) return;
    
    const calendar = await getAuthenticatedClient(user);
    
    const event: any = {
        summary: task.title,
        description: task.description,
        start: {},
        end: {},
    };

    if (task.time) {
        const startTime = new Date(`${task.date}T${task.time}`);
        const endTime = task.endTime ? new Date(`${task.date}T${task.endTime}`) : new Date(startTime.getTime() + 60 * 60 * 1000);
        event.start.dateTime = startTime.toISOString();
        event.end.dateTime = endTime.toISOString();
        event.start.timeZone = 'Asia/Dhaka';
        event.end.timeZone = 'Asia/Dhaka';
    } else {
        event.start.date = task.date;
        event.end.date = task.date;
    }
    
    try {
        await calendar.events.update({
            calendarId: 'primary',
            eventId: task.googleCalendarEventId,
            requestBody: event,
        });
    } catch (error) {
        console.error('Error updating Google Calendar event:', error);
        throw error;
    }
}

export async function deleteGoogleCalendarEvent(user: User, eventId: string) {
    if (!user.googleCalendarTokens) return;

    const calendar = await getAuthenticatedClient(user);

    try {
        await calendar.events.delete({
            calendarId: 'primary',
            eventId: eventId,
        });
    } catch (error) {
        console.error('Error deleting Google Calendar event:', error);
        // Don't throw error if event is not found, it might have been deleted manually
        if ((error as any).code !== 404 && (error as any).code !== 410) {
            throw error;
        }
    }
}
