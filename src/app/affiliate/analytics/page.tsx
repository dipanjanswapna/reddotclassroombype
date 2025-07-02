
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart } from 'recharts';
import { ArrowUpRight, Link2, MousePointerClick, DollarSign, TrendingUp } from 'lucide-react';

const mockChartData = [
    { date: 'Jul 1', Clicks: 150, Signups: 5 },
    { date: 'Jul 2', Clicks: 180, Signups: 8 },
    { date: 'Jul 3', Clicks: 220, Signups: 7 },
    { date: 'Jul 4', Clicks: 250, Signups: 12 },
    { date: 'Jul 5', Clicks: 210, Signups: 10 },
    { date: 'Jul 6', Clicks: 300, Signups: 15 },
    { date: 'Jul 7', Clicks: 280, Signups: 14 },
];

const mockTopReferrals = [
    { course: 'HSC 25 Physics Crash Course', clicks: 540, signups: 55, earnings: '৳5,500' },
    { course: 'Medical Admission Course 2024', clicks: 320, signups: 30, earnings: '৳4,500' },
    { course: 'IELTS Foundation Course', clicks: 210, signups: 15, earnings: '৳2,250' },
    { course: 'Spoken English for Professionals', clicks: 150, signups: 8, earnings: '৳1,200' },
];

export default function AffiliateAnalyticsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Referral Analytics</h1>
            <p className="mt-1 text-lg text-muted-foreground">
                Track your link performance and optimize your strategy.
            </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                    <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">1,234</div>
                    <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sign-ups</CardTitle>
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+25</div>
                    <p className="text-xs text-muted-foreground">+10% from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">2.03%</div>
                    <p className="text-xs text-muted-foreground">Avg. click to sign-up</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳4,250</div>
                    <p className="text-xs text-muted-foreground">This month's earnings</p>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Performance Over Time</CardTitle>
                <CardDescription>Clicks vs. Sign-ups in the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mockChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Line yAxisId="left" type="monotone" dataKey="Clicks" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
                        <Line yAxisId="right" type="monotone" dataKey="Signups" stroke="hsl(var(--accent))" strokeDasharray="5 5"/>
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

         <Card>
            <CardHeader>
                <CardTitle>Top Performing Referrals</CardTitle>
                <CardDescription>Your most successful course referral links.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Clicks</TableHead>
                            <TableHead>Sign-ups</TableHead>
                            <TableHead className="text-right">Earnings</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockTopReferrals.map((referral) => (
                            <TableRow key={referral.course}>
                                <TableCell className="font-medium">{referral.course}</TableCell>
                                <TableCell>{referral.clicks}</TableCell>
                                <TableCell>{referral.signups}</TableCell>
                                <TableCell className="text-right font-bold">{referral.earnings}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
