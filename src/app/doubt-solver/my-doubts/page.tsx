
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { getDoubts } from '@/lib/firebase/firestore';
import type { Doubt } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { safeToDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import Link from 'next/link';

export default function MyDoubtsPage() {
  const { userInfo, loading: authLoading } = useAuth();
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !userInfo) return;

    const fetchData = async () => {
      try {
        const allDoubts = await getDoubts();
        const myDoubts = allDoubts.filter(d => d.assignedDoubtSolverId === userInfo.uid);
        
        setDoubts(myDoubts.sort((a,b) => safeToDate(b.lastUpdatedAt).getTime() - safeToDate(a.lastUpdatedAt).getTime()));

      } catch (error) {
        console.error("Error fetching doubts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userInfo, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">My Doubts</h1>
        <p className="mt-1 text-lg text-muted-foreground">
          A history of all the doubts you have answered.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Answered Questions</CardTitle>
          <CardDescription>A log of all questions you've engaged with.</CardDescription>
        </CardHeader>
        <CardContent>
           <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Update</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {doubts.map(doubt => (
                         <TableRow key={doubt.id}>
                            <TableCell className="max-w-xs truncate">{doubt.questionText}</TableCell>
                            <TableCell><Badge>{doubt.status}</Badge></TableCell>
                            <TableCell>{formatDistanceToNow(safeToDate(doubt.lastUpdatedAt), { addSuffix: true })}</TableCell>
                            <TableCell className="text-right">
                                <Button asChild size="sm" variant="outline">
                                    <Link href={`/doubt-solver/doubt/${doubt.id}`}><Eye className="mr-2 h-4 w-4"/> View</Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {doubts.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center h-24">You haven't answered any doubts yet.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
           </Table>
        </CardContent>
      </Card>
    </div>
  );
}
