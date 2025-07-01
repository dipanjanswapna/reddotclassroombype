'use server';

import { revalidatePath } from 'next/cache';
import { addSupportTicket, getSupportTicket, updateSupportTicket } from '@/lib/firebase/firestore';
import { SupportTicket } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

export async function createSupportTicketAction(data: { subject: string, description: string, userId: string, userName: string }) {
    try {
        const newTicket: Omit<SupportTicket, 'id'> = {
            ...data,
            status: 'Open',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            replies: []
        };
        await addSupportTicket(newTicket);
        revalidatePath('/student/tickets');
        revalidatePath('/moderator/support-tickets');
        return { success: true, message: 'Support ticket created successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function replyToSupportTicketAction(ticketId: string, replyMessage: string) {
    try {
        const ticket = await getSupportTicket(ticketId);
        if (!ticket) {
            throw new Error("Ticket not found.");
        }
        
        const newReply = {
            author: 'Support' as const,
            message: replyMessage,
            date: Timestamp.now()
        };

        const updatedReplies = [...ticket.replies, newReply];

        await updateSupportTicket(ticketId, { 
            replies: updatedReplies,
            status: 'In Progress',
            updatedAt: Timestamp.now()
        });

        revalidatePath('/moderator/support-tickets');
        return { success: true, message: 'Reply sent successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function closeSupportTicketAction(ticketId: string) {
    try {
        await updateSupportTicket(ticketId, { 
            status: 'Closed',
            updatedAt: Timestamp.now()
        });
        revalidatePath('/moderator/support-tickets');
        return { success: true, message: 'Ticket closed.' };
    } catch(error: any) {
        return { success: false, message: error.message };
    }
}
