'use client';

import { useState, useEffect } from 'react';
import {
  FileScan,
  Ticket,
  Users,
  MessageSquareWarning,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useToast } from '@/components/ui/use-toast';
import { getSupportTickets, getUsers } from '@/lib/firebase/firestore';
import { SupportTicket, User } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { safeToDate } from '@/lib/utils';

export default function ModeratorDashboardPage() {
    const { toast } = useToast();
    const [stats, setStats] = useState({
        openSupportTickets: 0,
        totalUsers: 0,
    });
    const [recentTickets, setRecentTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const [allTickets, allUsers] = await Promise.all([
                    getSupportTickets(),
                    getUsers(),
                ]);

                const openTickets = allTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
                const sortedTickets = allTickets.sort((a,b) => safeToDate(b.createdAt).getTime() - safeToDate(a.createdAt).getTime());
                
                setStats(prev => ({
                    ...prev,
                    openSupportTickets: openTickets,
                    totalUsers: allUsers.length
                }));
                setRecentTickets(sortedTickets.slice(0, 5));

            } catch(e) {
                console.error(e);
                toast({ title: 'Error', description: 'Failed to load dashboard data.', variant: 'destructive'});
            } finally {
                setLoading(false);
            }
        }
        fetchDashboardData();
    }, [toast]);
    
    if (loading) {
        return (
          <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
            <LoadingSpinner className="w-12 h-12" />
          </div>
        );
    }

  return (
    <div className="space-y-10 md:space-y-14">
        <div className="text-center sm:text-left space-y-2">
            <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">
                Moderator Dashboard
            </h1>
            <p className="text-lg text-muted-foreground font-medium">Overview of community health and pending tasks.</p>
            <div className="h-1.5 w-24 bg-primary rounded-full mx-auto sm:mx-0 shadow-md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glassmorphism-card border-primary/20 bg-primary/5 shadow-xl rounded-[2rem] overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-primary">Open Tickets</CardTitle>
                    <Ticket className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-black text-primary tracking-tighter">{stats.openSupportTickets}</div>
                    <p className="text-xs text-muted-foreground font-medium mt-1">Awaiting response</p>
                </CardContent>
            </Card>
            <Card className="glassmorphism-card border-blue-500/20 bg-blue-500/5 shadow-xl rounded-[2rem] overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-blue-600">Total Users</CardTitle>
                    <Users className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-black text-blue-600 tracking-tighter">{stats.totalUsers}</div>
                    <p className="text-xs text-muted-foreground font-medium mt-1">Platform wide</p>
                </CardContent>
            </Card>
        </div>
        
        <Card className="rounded-[2.5rem] border-primary/10 shadow-xl overflow-hidden">
            <CardHeader className="p-8 border-b border-primary/5 bg-muted/30">
                <CardTitle className="font-black uppercase tracking-tight flex items-center gap-3">
                    <Ticket className="h-6 w-6 text-primary"/>
                    Recent Support Tickets
                </CardTitle>
                <CardDescription className="font-medium">The newest tickets that need attention.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest">Type</TableHead>
                                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest">Subject</TableHead>
                                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest">Time</TableHead>
                                <TableHead className="px-8 text-right font-black uppercase text-[10px] tracking-widest">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-primary/5">
                            {recentTickets.length > 0 ? recentTickets.map((ticket) => (
                                <TableRow key={ticket.id} className="hover:bg-primary/5 transition-colors">
                                    <TableCell className="px-8 py-6">
                                        <Badge variant='warning' className="font-black text-[10px] uppercase tracking-widest rounded-lg">Ticket</Badge>
                                    </TableCell>
                                    <TableCell className="px-8 py-6 font-medium">New ticket from {ticket.userName}: "{ticket.subject}"</TableCell>
                                    <TableCell className="px-8 py-6 text-muted-foreground text-xs font-bold">{formatDistanceToNow(safeToDate(ticket.createdAt), { addSuffix: true })}</TableCell>
                                    <TableCell className="px-8 py-6 text-right">
                                        <Button asChild variant="outline" size="sm" className="font-black uppercase text-[10px] tracking-widest h-9 rounded-xl">
                                            <Link href="/moderator/support-tickets">Manage</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground font-medium">No new tickets.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
