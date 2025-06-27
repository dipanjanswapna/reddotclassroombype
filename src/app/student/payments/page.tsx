
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
  description: 'View your transaction history at Red Dot Classroom.',
};

const paymentHistory = [
  {
    id: 'inv-001',
    courseName: 'HSC 2025 Crash Course - Science',
    amount: 'BDT 4500',
    date: '2024-06-01',
    status: 'Completed',
  },
  {
    id: 'inv-002',
    courseName: 'IELTS Preparation Course',
    amount: 'BDT 3000',
    date: '2024-05-15',
    status: 'Completed',
  },
  {
    id: 'inv-003',
    courseName: 'Data Science with Python',
    amount: 'BDT 5500',
    date: '2024-04-20',
    status: 'Completed',
  },
];

export default function PaymentsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Payment History</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          A record of all your transactions on the platform.
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>Your payment history for all course enrollments.</CardDescription>
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
              {paymentHistory.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.courseName}</TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell className="text-right">
                    <Badge className="bg-green-500 text-white">{invoice.status}</Badge>
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
