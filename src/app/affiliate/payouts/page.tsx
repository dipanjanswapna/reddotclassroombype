
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
    title: 'Affiliate Payouts',
    description: 'Track your affiliate earnings and view your payment history.',
};

const mockPayouts = [
    { id: 'p_123', date: '2024-07-15', amount: '৳2,500', method: 'bKash', status: 'Paid' },
    { id: 'p_124', date: '2024-06-15', amount: '৳1,750', method: 'bKash', status: 'Paid' },
];

export default function AffiliatePayoutsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Payout History</h1>
            <p className="mt-1 text-lg text-muted-foreground">
                Track your earnings and view your payment history.
            </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available for Payout</CardTitle>
                    <Landmark className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳850.00</div>
                    <p className="text-xs text-muted-foreground">Minimum payout: ৳1,000</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Paid Out</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳4,250.00</div>
                    <p className="text-xs text-muted-foreground">All-time earnings paid</p>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader className="flex items-center justify-between">
                <div>
                    <CardTitle>Payout History</CardTitle>
                    <CardDescription>A record of all payouts you have received.</CardDescription>
                </div>
                <Button variant="outline"><Download className="mr-2"/> Export History</Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Transaction ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockPayouts.map((payout) => (
                            <TableRow key={payout.id}>
                                <TableCell className="font-mono">{payout.id}</TableCell>
                                <TableCell>{payout.date}</TableCell>
                                <TableCell className="font-medium">{payout.amount}</TableCell>
                                <TableCell>{payout.method}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={payout.status === 'Paid' ? 'accent' : 'secondary'}>{payout.status}</Badge>
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
