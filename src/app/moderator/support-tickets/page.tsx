
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { getSupportTickets } from '@/lib/firebase/firestore';
import { replyToSupportTicketAction, closeSupportTicketAction } from '@/app/actions/support.actions';
import type { SupportTicket } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { format } from 'date-fns';

const getStatusBadgeVariant = (status: SupportTicket['status']) => {
  switch (status) {
    case 'Open': return 'destructive';
    case 'In Progress': return 'warning';
    case 'Closed': return 'accent';
    default: return 'secondary';
  }
};

export default function ModeratorSupportTicketsPage() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReplying, setIsReplying] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reply, setReply] = useState('');

  useEffect(() => {
      async function fetchTickets() {
          try {
              const fetchedTickets = await getSupportTickets();
              const sortedTickets = fetchedTickets.sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis());
              setTickets(sortedTickets);
          } catch (error) {
              console.error("Failed to fetch tickets:", error);
              toast({ title: 'Error', description: 'Could not fetch support tickets.', variant: 'destructive' });
          } finally {
              setLoading(false);
          }
      }
      fetchTickets();
  }, [toast]);

  const handleOpenDialog = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setIsDialogOpen(true);
    setReply('');
  };
  
  const handleReply = async () => {
    if (!reply || !selectedTicket?.id) return;
    setIsReplying(true);

    const result = await replyToSupportTicketAction(selectedTicket.id, reply);

    if (result.success) {
        const updatedTickets = await getSupportTickets();
        setTickets(updatedTickets.sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis()));
        toast({ title: 'Reply Sent!', description: 'Your reply has been sent to the user.' });
        setIsDialogOpen(false);
    } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setIsReplying(false);
  };
  
  const handleCloseTicket = async () => {
      if (!selectedTicket?.id) return;
      setIsReplying(true); // Reuse loading state
      const result = await closeSupportTicketAction(selectedTicket.id);
      if (result.success) {
          setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, status: 'Closed' } : t).sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis()));
          toast({ title: 'Ticket Closed', description: 'The support ticket has been marked as closed.' });
          setIsDialogOpen(false);
      } else {
          toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
      setIsReplying(false);
  };

   if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Support Tickets</h1>
        <p className="mt-1 text-lg text-muted-foreground">
          Manage and respond to user support requests.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ticket Queue</CardTitle>
          <CardDescription>All support tickets requiring attention.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.length > 0 ? tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.userName}</TableCell>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(ticket.status)}>{ticket.status}</Badge>
                  </TableCell>
                  <TableCell>{format(ticket.updatedAt.toDate(), 'PPP p')}</TableCell>
                  <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDialog(ticket)}>View & Reply</Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No support tickets to show.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                  <DialogTitle>Ticket from {selectedTicket?.userName}: {selectedTicket?.subject}</DialogTitle>
                  <DialogDescription>
                      Created on {selectedTicket && format(selectedTicket.createdAt.toDate(), 'PPP p')}
                  </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                    <p className="font-semibold">User's Message:</p>
                    <p className="p-3 border rounded-md bg-muted text-sm">{selectedTicket?.description}</p>
                </div>
                 {selectedTicket?.replies.map((r, index) => (
                    <div key={index} className="space-y-2">
                        <p className="font-semibold">{r.author}'s Reply ({format(r.date.toDate(), 'PPP p')}):</p>
                        <p className={`p-3 border rounded-md text-sm ${r.author === 'Support' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-muted'}`}>{r.message}</p>
                    </div>
                 ))}
                 {selectedTicket?.status !== 'Closed' && (
                     <div className="space-y-2 pt-4">
                        <Label htmlFor="reply">Your Reply</Label>
                        <Textarea id="reply" value={reply} onChange={e => setReply(e.target.value)} rows={4}/>
                    </div>
                 )}
              </div>
              <DialogFooter className="sm:justify-between">
                {selectedTicket?.status !== 'Closed' ? (
                     <Button variant="secondary" onClick={handleCloseTicket} disabled={isReplying}>Close Ticket</Button>
                ) : <div />}
                <div>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="mr-2">Cancel</Button>
                  {selectedTicket?.status !== 'Closed' && <Button onClick={handleReply} disabled={isReplying || !reply}>
                      {isReplying && <Loader2 className="mr-2 animate-spin" />} Send Reply
                  </Button>}
                </div>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
