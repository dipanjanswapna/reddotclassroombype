'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { ReportedContent } from '@/lib/types';
import { getPendingReports } from '@/lib/firebase/firestore';
import { dismissReportAction, deleteReportedReviewAction } from '@/app/actions/report.actions';
import { LoadingSpinner } from '@/components/loading-spinner';
import { format } from 'date-fns';
import { useAuth } from '@/context/auth-context';
import { AlertTriangle, Trash2, Check, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { safeToDate } from '@/lib/utils';

export default function ContentReviewPage() {
    const { toast } = useToast();
    const { userInfo } = useAuth();
    const [reports, setReports] = useState<ReportedContent[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const pendingReports = await getPendingReports();
            setReports(pendingReports);
        } catch (error) {
            console.error("Failed to fetch reports:", error);
            toast({ title: "Error", description: "Could not load content for review.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleDismiss = async (reportId: string) => {
        if (!userInfo) return;
        const result = await dismissReportAction(reportId, userInfo.uid);
        if (result.success) {
            toast({ title: result.message });
            fetchReports();
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
    };

    const handleDelete = async (report: ReportedContent) => {
        if (!userInfo) return;
        const result = await deleteReportedReviewAction(report.id!, report.courseId, report.contentId, userInfo.uid);
        if (result.success) {
            toast({ title: result.message, variant: 'destructive' });
            fetchReports();
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
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
                <h1 className="font-headline text-3xl font-bold tracking-tight">Content Review Queue</h1>
                <p className="mt-1 text-lg text-muted-foreground">Review user-reported content to maintain community standards.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Pending Reports</CardTitle>
                    <CardDescription>Content reported by users that requires your attention.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Reported Content</TableHead>
                                <TableHead>Context</TableHead>
                                <TableHead>Reported On</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reports.length > 0 ? reports.map(report => (
                                <TableRow key={report.id}>
                                    <TableCell>
                                        <p className="font-mono text-xs text-muted-foreground">{report.contentType.toUpperCase()}</p>
                                        <p className="p-2 bg-muted rounded-md mt-1">{report.contentSnapshot}</p>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/courses/${report.courseId}`} className="font-medium hover:underline" target="_blank">
                                            {report.courseTitle} <ExternalLink className="inline h-3 w-3" />
                                        </Link>
                                    </TableCell>
                                    <TableCell>{format(safeToDate(report.createdAt), 'PPP p')}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Button size="sm" variant="outline" onClick={() => handleDismiss(report.id!)}><Check className="mr-2 h-4 w-4 text-green-500" /> Dismiss</Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(report)}><Trash2 className="mr-2 h-4 w-4" /> Delete Content</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No pending reports. Great job!
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
