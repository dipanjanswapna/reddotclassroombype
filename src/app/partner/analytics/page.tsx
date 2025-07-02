
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
import { ArrowUpRight, BookOpen, Users, DollarSign, BarChart3 as BarChartIcon } from 'lucide-react';

const mockChartData = [
    { date: 'Jul 1', Revenue: 1500, Students: 5 },
    { date: 'Jul 2', Revenue: 1800, Students: 8 },
    { date: 'Jul 3', Revenue: 2200, Students: 7 },
    { date: 'Jul 4', Revenue: 2500, Students: 12 },
    { date: 'Jul 5', Revenue: 2100, Students: 10 },
    { date: 'Jul 6', Revenue: 3000, Students: 15 },
    { date: 'Jul 7', Revenue: 2800, Students: 14 },
];

const mockTopCourses = [
    { course: 'Advanced Medical Terminology', students: 540, revenue: '৳55,000' },
    { course: 'Surgical Skills Workshop', students: 320, revenue: '৳45,000' },
    { course: 'Cardiology Essentials', students: 210, revenue: '৳22,500' },
    { course: 'Pediatric Care Masterclass', students: 150, revenue: '৳12,000' },
];

export default function SellerAnalyticsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Seller Analytics</h1>
            <p className="mt-1 text-lg text-muted-foreground">
                Track your sales, student engagement, and course performance.
            </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳2,50,000</div>
                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+1,234</div>
                    <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+850</div>
                    <p className="text-xs text-muted-foreground">+19% from last month</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Completion Rate</CardTitle>
                    <BarChartIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">78%</div>
                    <p className="text-xs text-muted-foreground">Across all your courses</p>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Sales Over Time</CardTitle>
                <CardDescription>Revenue and new students in the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" unit="৳" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Bar yAxisId="left" dataKey="Revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="Students" stroke="hsl(var(--accent))" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

         <Card>
            <CardHeader>
                <CardTitle>Top Performing Courses</CardTitle>
                <CardDescription>Your most successful courses by student count and revenue.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Students</TableHead>
                            <TableHead className="text-right">Revenue</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockTopCourses.map((course) => (
                            <TableRow key={course.course}>
                                <TableCell className="font-medium">{course.course}</TableCell>
                                <TableCell>{course.students}</TableCell>
                                <TableCell className="text-right font-bold">{course.revenue}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
