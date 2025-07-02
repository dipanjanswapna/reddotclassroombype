
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

const mockPayouts = [
    { id: 'p_seller_1', date: '2024-07-15', amount: '৳85,000', method: 'Bank Transfer', status: 'Paid' },
    { id: 'p_seller_2', date: '2024-06-15', amount: '৳72,500', method: 'Bank Transfer', status: 'Paid' },
    { id: 'p_seller_3', date: '2024-05-15', amount: '৳91,200', method: 'Bank Transfer', status: 'Paid' },
];

export default function SellerPayoutsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Seller Payouts</h1>
            <p className="mt-1 text-lg text-muted-foreground">
                Track your organization's earnings and view your payment history.
            </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳12,50,000</div>
                    <p className="text-xs text-muted-foreground">All-time earnings</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Month</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳1,15,000</div>
                    <p className="text-xs text-muted-foreground">+8.1% from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available for Payout</CardTitle>
                    <Landmark className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳95,500.00</div>
                    <p className="text-xs text-muted-foreground">Next payout: Aug 15</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Last Payout</CardTitle>
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳85,000.00</div>
                    <p className="text-xs text-muted-foreground">On July 15, 2024</p>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader className="flex items-center justify-between">
                <div>
                    <CardTitle>Payout History</CardTitle>
                    <CardDescription>A record of all payouts your organization has received.</CardDescription>
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
                         {mockPayouts.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No payout history found.
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
