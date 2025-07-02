
'use client';

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
import { Banknote, DollarSign, Download, Landmark } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Earnings',
    description: 'Track your course revenue and view your payment history.',
};

const mockTransactions = [
    { id: 'sale_1', date: '2024-07-21', course: 'HSC 25 Physics Crash Course', amount: '৳250', status: 'Cleared' },
    { id: 'sale_2', date: '2024-07-20', course: 'HSC 25 Physics Crash Course', amount: '৳250', status: 'Cleared' },
    { id: 'sale_3', date: '2024-07-19', course: 'Medical Admission Course 2024', amount: '৳150', status: 'Pending' },
    { id: 'sale_4', date: '2024-07-18', course: 'IELTS Foundation Course', amount: '৳150', status: 'Cleared' },
];

export default function TeacherEarningsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">My Earnings</h1>
            <p className="mt-1 text-lg text-muted-foreground">
                Track your course revenue and view your payment history.
            </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳1,25,000</div>
                    <p className="text-xs text-muted-foreground">All-time earnings</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Month</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳12,500</div>
                    <p className="text-xs text-muted-foreground">+5.2% from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available for Payout</CardTitle>
                    <Landmark className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳8,750.00</div>
                    <p className="text-xs text-muted-foreground">Next payout: Aug 15</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Last Payout</CardTitle>
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳11,200.00</div>
                    <p className="text-xs text-muted-foreground">On July 15, 2024</p>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader className="flex items-center justify-between">
                <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>A log of your most recent course sales.</CardDescription>
                </div>
                <Button variant="outline"><Download className="mr-2"/> Export History</Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Your Earnings</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockTransactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell>{transaction.date}</TableCell>
                                <TableCell className="font-medium">{transaction.course}</TableCell>
                                <TableCell className="font-bold">{transaction.amount}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={transaction.status === 'Cleared' ? 'accent' : 'warning'}>{transaction.status}</Badge>
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
