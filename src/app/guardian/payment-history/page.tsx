
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment History',
  description: "View your child's transaction history at Red Dot Classroom.",
};

// In a real app, this data would be fetched from a payment service
const paymentHistory: any[] = [];

export default function GuardianPaymentsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Payment History</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          A record of all transactions for your child on the platform.
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>Payment history for all course enrollments.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Course Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentHistory.length > 0 ? paymentHistory.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.courseName}</TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell className="text-right">
                    <Badge className="bg-green-500 text-white">{invoice.status}</Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No payment history found.
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
