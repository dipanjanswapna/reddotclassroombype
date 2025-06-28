
'use client';

import { useState } from 'react';
import { PlusCircle, MessageSquare } from 'lucide-react';
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
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { mockSupportTickets, SupportTicket } from '@/lib/mock-data';

const getStatusBadgeVariant = (status: SupportTicket['status']) => {
  switch (status) {
    case 'Open': return 'destructive';
    case 'In Progress': return 'warning';
    case 'Closed': return 'accent';
    default: return 'secondary';
  }
};

export default function SupportTicketsPage() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>(mockSupportTickets);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateTicket = () => {
    if (!subject || !description) {
      toast({ title: "Error", description: "Subject and description cannot be empty.", variant: "destructive" });
      return;
    }

    const newTicket: SupportTicket = {
      id: `ticket-${Date.now()}`,
      subject,
      description,
      status: 'Open',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      replies: [],
    };

    setTickets(prev => [newTicket, ...prev]);
    toast({ title: 'Ticket Submitted!', description: 'Our support team will get back to you shortly.' });
    setIsDialogOpen(false);
    setSubject('');
    setDescription('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="mt-1 text-lg text-muted-foreground">
            Create and track your support requests here.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2" /> Create New Ticket</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Support Ticket</DialogTitle>
              <DialogDescription>Describe your issue, and our team will get back to you.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-right">Subject</Label>
                <Input id="subject" value={subject} onChange={e => setSubject(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">Description</Label>
                <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} className="col-span-3" rows={5} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button onClick={handleCreateTicket}>Submit Ticket</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Tickets</CardTitle>
          <CardDescription>A history of all your support requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
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
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    You have not submitted any support tickets.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
