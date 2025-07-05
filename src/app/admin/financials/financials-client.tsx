
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { Enrollment, Course, User } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

type Transaction = {
  id: string;
  studentName: string;
  courseName: string;
  amount: number;
  date: Date;
};

// A version of Enrollment where the date is a string, suitable for passing from Server to Client
type SerializableEnrollment = Omit<Enrollment, 'enrollmentDate'> & {
    enrollmentDate: string;
}

interface FinancialsClientProps {
  initialEnrollments: SerializableEnrollment[];
  initialCourses: Course[];
  initialUsers: User[];
}

export function FinancialsClient({ initialEnrollments, initialCourses, initialUsers }: FinancialsClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  
  const transactions = useMemo(() => {
    return initialEnrollments.map(enrollment => {
      const course = initialCourses.find(c => c.id === enrollment.courseId);
      const user = initialUsers.find(u => u.id === enrollment.userId);
      const isPrebooking = course?.isPrebooking && course.prebookingEndDate && new Date(course.prebookingEndDate as string) > new Date();
      const priceString = isPrebooking && course.prebookingPrice ? course.prebookingPrice : course?.price;

      return {
        id: enrollment.id!,
        studentName: user?.name || 'Unknown Student',
        courseName: course?.title || 'Unknown Course',
        amount: parseFloat(priceString?.replace(/[^0-9.]/g, '') || '0'),
        date: new Date(enrollment.enrollmentDate), // Convert string back to Date object
      };
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [initialEnrollments, initialCourses, initialUsers]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
        const matchesSearch = 
            t.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.id.toLowerCase().includes(searchTerm.toLowerCase());
        
        const afterFromDate = dateRange.from ? t.date >= dateRange.from : true;
        const beforeToDate = dateRange.to ? t.date <= dateRange.to : true;
        
        return matchesSearch && afterFromDate && beforeToDate;
    });
  }, [transactions, searchTerm, dateRange]);

  const totalRevenue = filteredTransactions.reduce((acc, t) => acc + t.amount, 0);
  const totalTransactions = filteredTransactions.length;
  const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  return (
    <div className="space-y-8">
       <div className="grid gap-6 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">BDT {totalRevenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Based on current filters</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalTransactions.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Enrollments in filtered range</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Sale Value</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">BDT {avgTransactionValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <p className="text-xs text-muted-foreground">Average transaction amount</p>
                </CardContent>
            </Card>
       </div>

       <Card>
        <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>A detailed log of all course enrollments and payments.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col md:flex-row gap-2 mb-4">
                <Input
                    placeholder="Search by student, course, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                <div className="flex gap-2">
                    <DatePicker date={dateRange.from} setDate={(date) => setDateRange(prev => ({...prev, from: date}))} className="w-full" />
                    <DatePicker date={dateRange.to} setDate={(date) => setDateRange(prev => ({...prev, to: date}))} className="w-full" />
                </div>
                 <Button variant="outline" className="ml-auto">
                    <Download className="mr-2"/>
                    Export CSV
                </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono max-w-24 truncate">{t.id}</TableCell>
                    <TableCell className="font-medium">{t.studentName}</TableCell>
                    <TableCell>{t.courseName}</TableCell>
                    <TableCell>BDT {t.amount.toFixed(2)}</TableCell>
                    <TableCell>{format(t.date, 'PPP')}</TableCell>
                    <TableCell>
                      <Badge variant="accent">Paid</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">No transactions found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
        </CardContent>
       </Card>
    </div>
  );
}
