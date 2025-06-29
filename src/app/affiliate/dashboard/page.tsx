
import {
  Users,
  MousePointerClick,
  BarChart,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const recentReferrals = [
    { id: 'ref1', user: 'Rahim Sheikh', course: 'HSC 2025 Crash Course', date: '2024-07-20', commission: 'BDT 450' },
    { id: 'ref2', user: 'Fatima Akter', course: 'IELTS Preparation Course', date: '2024-07-19', commission: 'BDT 300' },
    { id: 'ref3', user: 'John Doe', course: 'Data Science with Python', date: '2024-07-18', commission: 'BDT 550' },
];

export default function AffiliateDashboardPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="mb-8">
            <h1 className="font-headline text-4xl font-bold tracking-tight">
            Affiliate Dashboard
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
            Welcome back! Here's a summary of your referral performance.
            </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Total Clicks
                </CardTitle>
                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">12,450</div>
                <p className="text-xs text-muted-foreground">
                +15% from last month
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Total Sign-ups
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">862</div>
                <p className="text-xs text-muted-foreground">
                +8% from last month
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Conversion Rate
                </CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">6.9%</div>
                <p className="text-xs text-muted-foreground">
                Click-to-signup ratio
                </p>
            </CardContent>
            </Card>
             <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Unpaid Earnings
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">BDT 12,500</div>
                <p className="text-xs text-muted-foreground">
                Next payout on Aug 5, 2024
                </p>
            </CardContent>
            </Card>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Recent Referrals</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Referred User</TableHead>
                            <TableHead>Course</TableHead>
                             <TableHead>Date</TableHead>
                            <TableHead className="text-right">Commission</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentReferrals.map((ref) => (
                            <TableRow key={ref.id}>
                                <TableCell>{ref.user}</TableCell>
                                <TableCell>{ref.course}</TableCell>
                                <TableCell>{ref.date}</TableCell>
                                <TableCell className="text-right"><Badge variant="accent">{ref.commission}</Badge></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
