
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { getSupportTicketsByUserId } from '@/lib/firebase/firestore';
import { createSupportTicketAction } from '@/app/actions/support.actions';
import type { SupportTicket } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { format } from 'date-fns';
import { safeToDate } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const getStatusBadgeVariant = (status: SupportTicket['status']) => {
  switch (status) {
    case 'Open': return 'destructive';
    case 'In Progress': return 'warning';
    case 'Closed': return 'accent';
    default: return 'secondary';
  }
};

export default function StudentTicketsPage() {
    const { toast } = useToast();
    const { userInfo } = useAuth();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');

    const fetchTickets = async () => {
        if (!userInfo) return;
        setLoading(true);
        try {
            const fetchedTickets = await getSupportTicketsByUserId(userInfo.uid);
            setTickets(fetchedTickets.sort((a,b) => safeToDate(b.updatedAt).getTime() - safeToDate(a.updatedAt).getTime()));
        } catch (error) {
            console.error(error);
            toast({title: 'Error', description: 'Could not fetch support tickets.', variant: 'destructive'});
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (userInfo) {
            fetchTickets();
        } else {
            setLoading(false);
        }
    }, [userInfo]);

    const handleCreateTicket = async () => {
        if (!subject || !description || !userInfo) {
            toast({ title: "Please fill all fields.", variant: "destructive"});
            return;
        }
        setIsSubmitting(true);
        const result = await createSupportTicketAction({
            subject,
            description,
            userId: userInfo.uid,
            userName: userInfo.name,
        });

        if (result.success) {
            toast({ title: 'Success', description: 'Your support ticket has been created.' });
            setIsDialogOpen(false);
            setSubject('');
            setDescription('');
            fetchTickets();
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
        setIsSubmitting(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner />
            </div>
        )
    }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Support Tickets</h1>
            <p className="mt-1 text-lg text-muted-foreground">Create and track your support requests here.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}><PlusCircle className="mr-2"/> Create New Ticket</Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>My Tickets</CardTitle>
            <CardDescription>A log of all your support requests.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Updated</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tickets.map(ticket => (
                        <TableRow key={ticket.id}>
                            <TableCell className="font-medium">{ticket.subject}</TableCell>
                            <TableCell><Badge variant={getStatusBadgeVariant(ticket.status)}>{ticket.status}</Badge></TableCell>
                            <TableCell>{format(safeToDate(ticket.updatedAt), 'PPP p')}</TableCell>
                        </TableRow>
                    ))}
                    {tickets.length === 0 && <TableRow><TableCell colSpan={3} className="text-center h-24">You have not created any support tickets.</TableCell></TableRow>}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
      
       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Support Ticket</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g., Problem with video playback" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Please describe your issue in detail." rows={6}/>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateTicket} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="animate-spin mr-2"/>}
                        Submit Ticket
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
