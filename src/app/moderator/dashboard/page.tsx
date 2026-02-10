
'use client';

import { useState, useEffect } from 'react';
import {
  FileScan,
  Ticket,
  Users,
  MessageSquareWarning,
  Activity,
  ShieldAlert,
  Clock,
  ChevronRight,
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
import { motion } from 'framer-motion';

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
                const sortedTickets = [...allTickets].sort((a,b) => safeToDate(b.createdAt).getTime() - safeToDate(a.createdAt).getTime());
                
                setStats({
                    openSupportTickets: openTickets,
                    totalUsers: allUsers.length
                });
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
    <div className="px-1 py-4 md:py-8 space-y-10">
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="border-l-4 border-orange-600 pl-4"
        >
            <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight leading-none uppercase text-foreground">
            Moderator <span className="text-orange-600">Hub</span>
            </h1>
            <p className="mt-2 text-sm md:text-lg text-muted-foreground font-medium">
            Maintain community standards and support users.
            </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-[25px] border-primary/10 shadow-xl bg-gradient-to-br from-orange-600 to-orange-500 text-white overflow-hidden relative group">
                <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Open Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black">{stats.openSupportTickets}</div>
                    <Ticket className="absolute top-2 right-2 h-12 w-12 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
                </CardContent>
            </Card>

            <Card className="rounded-[25px] border-primary/10 shadow-xl bg-gradient-to-br from-blue-600 to-blue-500 text-white overflow-hidden relative group">
                <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black">{stats.totalUsers}</div>
                    <Users className="absolute top-2 right-2 h-12 w-12 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
                </CardContent>
            </Card>

            <Card className="rounded-[25px] border-primary/10 shadow-xl bg-gradient-to-br from-red-600 to-red-500 text-white overflow-hidden relative group">
                <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Pending Review</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black">3</div>
                    <ShieldAlert className="absolute top-2 right-2 h-12 w-12 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
                </CardContent>
            </Card>

            <Card className="rounded-[25px] border-primary/10 shadow-xl bg-gradient-to-br from-indigo-600 to-indigo-500 text-white overflow-hidden relative group">
                <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Active Reports</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black">12</div>
                    <FileScan className="absolute top-2 right-2 h-12 w-12 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
                </CardContent>
            </Card>
        </div>
        
        <Card className="rounded-[25px] border-primary/5 shadow-xl bg-card overflow-hidden">
            <CardHeader className="bg-orange-600/5 p-5 border-b border-black/5">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-orange-600" />
                    <CardTitle className="text-sm font-black uppercase tracking-tight">Urgent Support Queue</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="border-black/5">
                            <TableHead className="font-black uppercase tracking-widest text-[10px] px-6">User</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Subject</TableHead>
                             <TableHead className="font-black uppercase tracking-widest text-[10px]">Time</TableHead>
                            <TableHead className="text-right px-6 font-black uppercase tracking-widest text-[10px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentTickets.length > 0 ? recentTickets.map((ticket) => (
                            <TableRow key={ticket.id} className="border-black/5 hover:bg-muted/20 transition-colors">
                                <TableCell className="px-6 py-4">
                                    <div className="font-bold text-sm uppercase tracking-tight">{ticket.userName}</div>
                                </TableCell>
                                <TableCell className="text-xs font-medium text-muted-foreground truncate max-w-[200px]">
                                    {ticket.subject}
                                </TableCell>
                                <TableCell className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 py-4">
                                    <Clock className="w-3 h-3" />
                                    {formatDistanceToNow(safeToDate(ticket.createdAt), { addSuffix: true })}
                                </TableCell>
                                <TableCell className="text-right px-6">
                                    <Button asChild variant="outline" size="sm" className="h-8 px-4 rounded-xl font-black uppercase text-[9px] tracking-widest border-orange-600/20 text-orange-600 hover:bg-orange-600 hover:text-white transition-all">
                                        <Link href="/moderator/support-tickets">Handle</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-40 text-center">
                                    <div className="flex flex-col items-center justify-center opacity-30">
                                        <Ticket className="w-12 h-12 mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No active tickets found</p>
                                    </div>
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
