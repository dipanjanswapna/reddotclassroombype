
'use client';

import { useState } from 'react';
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
import { mockSupportTickets, SupportTicket } from '@/lib/mock-data';
import { Label } from '@/components/ui/label';

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
  const [tickets, setTickets] = useState<SupportTicket[]>(mockSupportTickets);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reply, setReply] = useState('');

  const handleOpenDialog = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setIsDialogOpen(true);
  };
  
  const handleReply = () => {
    if (!reply || !selectedTicket) return;

    const newReply = {
      author: 'Support' as const,
      message: reply,
      date: new Date().toISOString().split('T')[0],
    };

    setTickets(prev => prev.map(t => 
        t.id === selectedTicket.id 
        ? { ...t, status: 'In Progress' as const, replies: [...t.replies, newReply], updatedAt: newReply.date } 
        : t
    ));

    toast({ title: 'Reply Sent!', description: 'Your reply has been sent to the user.' });
    setIsDialogOpen(false);
    setReply('');
  };

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
                <TableHead>Ticket ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.length > 0 ? tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-mono">{ticket.id}</TableCell>
                  <TableCell className="font-medium">{ticket.subject}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(ticket.status)}>{ticket.status}</Badge>
                  </TableCell>
                  <TableCell>{ticket.updatedAt}</TableCell>
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
                  <DialogTitle>Ticket: {selectedTicket?.subject}</DialogTitle>
                  <DialogDescription>
                      Created on {selectedTicket?.createdAt} | Last updated {selectedTicket?.updatedAt}
                  </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                    <p className="font-semibold">User's Message:</p>
                    <p className="p-3 border rounded-md bg-muted text-sm">{selectedTicket?.description}</p>
                </div>
                 {selectedTicket?.replies.map((r, index) => (
                    <div key={index} className="space-y-2">
                        <p className="font-semibold">{r.author}'s Reply ({r.date}):</p>
                        <p className="p-3 border rounded-md bg-muted/50 text-sm">{r.message}</p>
                    </div>
                 ))}
                 <div className="space-y-2 pt-4">
                    <Label htmlFor="reply">Your Reply</Label>
                    <Textarea id="reply" value={reply} onChange={e => setReply(e.target.value)} rows={4}/>
                 </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>
                <Button onClick={handleReply}>Send Reply</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
