
'use client';

import { DollarSign, Banknote, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { courses } from '@/lib/mock-data';

// Mock data specific to this page
const teacherId = 'ins-ja'; // Mock current teacher ID
const teacherCourses = courses.filter(c => c.instructors.some(i => i.id === teacherId));

const earningsBreakdown = teacherCourses.map(course => ({
  courseId: course.id,
  courseTitle: course.title,
  enrollments: Math.floor(Math.random() * 200) + 50,
  grossRevenue: (Math.floor(Math.random() * 200) + 50) * parseFloat(course.price.replace(/[^0-9.]/g, '')),
  netEarning: ((Math.floor(Math.random() * 200) + 50) * parseFloat(course.price.replace(/[^0-9.]/g, ''))) * 0.7, // Assuming 70% commission
}));

const totalEarnings = earningsBreakdown.reduce((acc, item) => acc + item.netEarning, 0);
const thisMonthEarnings = totalEarnings / 12; // Mock value

const payoutHistory = [
  { id: 'payout-t-001', date: '2024-06-05', amount: 'BDT 25,000', status: 'Paid', method: 'Bank Transfer' },
  { id: 'payout-t-002', date: '2024-05-05', amount: 'BDT 22,500', status: 'Paid', method: 'Bank Transfer' },
];

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid': return 'accent';
    case 'pending': return 'warning';
    case 'failed': return 'destructive';
    default: return 'secondary';
  }
};


export default function TeacherEarningsPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">My Earnings</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Track your course revenue and view your payout history.
                </p>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">BDT {totalEarnings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                        <p className="text-xs text-muted-foreground">Lifetime earnings from all courses.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">BDT {thisMonthEarnings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                        <p className="text-xs text-muted-foreground">Earnings for the current month.</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Next Payout</CardTitle>
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">BDT 18,500</p>
                        <p className="text-xs text-muted-foreground">Scheduled for August 5, 2024</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Earnings Breakdown by Course</CardTitle>
                    <CardDescription>View how much each of your courses has earned.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Course</TableHead>
                                <TableHead className="text-right">Enrollments</TableHead>
                                <TableHead className="text-right">Gross Revenue</TableHead>
                                <TableHead className="text-right">Net Earnings (70%)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {earningsBreakdown.map((earning) => (
                                <TableRow key={earning.courseId}>
                                    <TableCell className="font-medium">{earning.courseTitle}</TableCell>
                                    <TableCell className="text-right">{earning.enrollments}</TableCell>
                                    <TableCell className="text-right">BDT {earning.grossRevenue.toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-semibold">BDT {earning.netEarning.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Payout History</CardTitle>
                    <CardDescription>A record of all payouts to your bank account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payoutHistory.map((payout) => (
                                <TableRow key={payout.id}>
                                    <TableCell className="font-medium">{payout.id}</TableCell>
                                    <TableCell>{payout.date}</TableCell>
                                    <TableCell>{payout.amount}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(payout.status)} className="capitalize">{payout.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm"><Download className="mr-2 h-4 w-4" /> Download Invoice</Button>
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
