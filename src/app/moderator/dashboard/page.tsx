
'use client';

import { useState, useEffect } from 'react';
import {
  FileScan,
  Ticket,
  Users,
  MessageSquareWarning,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useToast } from '@/components/ui/use-toast';
import { getSupportTickets, getUsers } from '@/lib/firebase/firestore';
import { SupportTicket, User } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Moderator Dashboard',
    description: 'Overview of community health and pending moderation tasks.',
};

export default function ModeratorDashboardPage() {
    const { toast } = useToast();
    const [stats, setStats] = useState({
        pendingReviews: 12, // Placeholder
        openSupportTickets: 0,
        totalUsers: 0,
        newReportsToday: 8, // Placeholder
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
                const sortedTickets = allTickets.sort((a,b) => b.createdAt.toMillis() - a.createdAt.toMillis());
                
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="mb-8">
            <h1 className="font-headline text-4xl font-bold tracking-tight">
            Moderator Dashboard
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
            Overview of community health and pending tasks.
            </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Pending Reviews
                </CardTitle>
                <FileScan className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.pendingReviews}</div>
                <p className="text-xs text-muted-foreground">
                User-reported content (placeholder)
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Open Support Tickets
                </CardTitle>
                <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.openSupportTickets}</div>
                <p className="text-xs text-muted-foreground">
                Waiting for a response
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                All registered users
                </p>
            </CardContent>
            </Card>
             <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                New Reports Today
                </CardTitle>
                <MessageSquareWarning className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">+{stats.newReportsToday}</div>
                <p className="text-xs text-muted-foreground">
                Since yesterday (placeholder)
                </p>
            </CardContent>
            </Card>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Recent Activity Feed</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Description</TableHead>
                             <TableHead>Time</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentTickets.map((ticket) => (
                            <TableRow key={ticket.id}>
                                <TableCell><Badge variant='warning'>Ticket</Badge></TableCell>
                                <TableCell>New ticket from {ticket.userName}: "{ticket.subject}"</TableCell>
                                <TableCell>{formatDistanceToNow(ticket.createdAt.toDate(), { addSuffix: true })}</TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href="/moderator/support-tickets">View</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
