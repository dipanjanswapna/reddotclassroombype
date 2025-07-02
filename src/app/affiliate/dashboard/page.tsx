
'use client';

import { DollarSign, Link2, MousePointerClick, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';

const mockRecentReferrals = [
    { id: 'ref_1', course: 'HSC 25 Physics Crash Course', date: '2024-07-20', status: 'Converted', commission: '৳250' },
    { id: 'ref_2', course: 'Medical Admission Course 2024', date: '2024-07-19', status: 'Clicked', commission: 'N/A' },
    { id: 'ref_3', course: 'IELTS Foundation Course', date: '2024-07-18', status: 'Converted', commission: '৳150' },
    { id: 'ref_4', course: 'Spoken English for Professionals', date: '2024-07-18', status: 'Clicked', commission: 'N/A' },
];

export default function AffiliateDashboardPage() {
    const { userInfo } = useAuth();

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="mb-8">
                <h1 className="font-headline text-4xl font-bold tracking-tight">
                    Welcome, {userInfo?.name}!
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Here's a summary of your affiliate performance.
                </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳4,250</div>
                        <p className="text-xs text-muted-foreground">All-time earnings</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                        <Link2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+25</div>
                        <p className="text-xs text-muted-foreground">Successful sign-ups</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                        <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,234</div>
                        <p className="text-xs text-muted-foreground">Clicks on your referral links</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2.03%</div>
                        <p className="text-xs text-muted-foreground">Clicks to successful sign-ups</p>
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Recent Referral Activity</CardTitle>
                    <CardDescription>A log of the most recent activity on your links.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Referred Course</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Commission</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockRecentReferrals.map(referral => (
                                <TableRow key={referral.id}>
                                    <TableCell className="font-medium">{referral.course}</TableCell>
                                    <TableCell>{referral.date}</TableCell>
                                    <TableCell>
                                        <Badge variant={referral.status === 'Converted' ? 'accent' : 'secondary'}>
                                            {referral.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">{referral.commission}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
