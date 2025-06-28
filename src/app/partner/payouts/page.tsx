
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
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const payoutHistory = [
  { id: 'payout-001', date: '2024-06-05', amount: 'BDT 85,000', status: 'Paid', method: 'Bank Transfer' },
  { id: 'payout-002', date: '2024-05-05', amount: 'BDT 72,500', status: 'Paid', method: 'Bank Transfer' },
  { id: 'payout-003', date: '2024-04-05', amount: 'BDT 91,200', status: 'Paid', method: 'Bank Transfer' },
];

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid': return 'accent';
    case 'pending': return 'warning';
    case 'failed': return 'destructive';
    default: return 'secondary';
  }
};

export default function PartnerPayoutsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Payouts</h1>
        <p className="mt-1 text-lg text-muted-foreground">
          View your earnings and payout history.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">BDT 45,750</p>
            <p className="text-sm text-muted-foreground">Next payout on July 5, 2024</p>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Payout Settings</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-muted-foreground">Your payouts are sent via Bank Transfer to your registered bank account.</p>
             <Button variant="outline" className="mt-4">Update Bank Details</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Payout History</CardTitle>
            <CardDescription>A record of all payouts from RDC to your organization.</CardDescription>
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
