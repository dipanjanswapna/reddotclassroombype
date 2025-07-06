
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { AttendanceRecord, Batch, Branch, User, Course } from '@/lib/types';
import { Phone, CheckCircle, Info, Loader2, BookUser, Search } from 'lucide-react';
import { markCallAsCompletedAction } from '@/app/actions/attendance.actions';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/auth-context';
import { getAttendanceRecords, getUsers, getBatches, getBranches, getCourses } from '@/lib/firebase/firestore';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { safeToDate } from '@/lib/utils';
import { markStudentAsCounseledAction } from '@/app/actions/user.actions';

type AbsentStudentInfo = AttendanceRecord & {
  studentName?: string;
  studentRoll?: string;
  studentPhone?: string;
  guardianPhone?: string;
  batchName?: string;
  courseName?: string;
};

export function AbsentStudentCallCenter() {
  const { toast } = useToast();
  const { userInfo } = useAuth();
  const [absentStudents, setAbsentStudents] = useState<AbsentStudentInfo[]>([]);
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [counselingSearch, setCounselingSearch] = useState('');

  const fetchAllData = async () => {
    setLoading(true);
    try {
        const [allRecords, fetchedStudents, allBatches, allCourses] = await Promise.all([
            getAttendanceRecords(),
            getUsers(),
            getBatches(),
            getCourses(),
        ]);
        
        const studentUsers = fetchedStudents.filter(u => u.role === 'Student');
        setAllStudents(studentUsers);
        
        const today = format(new Date(), 'yyyy-MM-dd');
        
        const todaysAbsentees = allRecords
            .filter(r => r.date === today && r.status === 'Absent')
            .map(record => {
                const student = studentUsers.find(s => s.id === record.studentId);
                const batch = allBatches.find(b => b.id === record.batchId);
                const course = allCourses.find(c => c.id === record.courseId);
                return {
                    ...record,
                    studentName: student?.name || 'Unknown',
                    studentRoll: student?.offlineRollNo || student?.classRoll || 'N/A',
                    studentPhone: student?.mobileNumber,
                    guardianPhone: student?.guardianMobileNumber,
                    batchName: batch?.name || 'N/A',
                    courseName: course?.title || 'N/A',
                };
            });
        
        setAbsentStudents(todaysAbsentees);
    } catch (error) {
        toast({ title: "Error", description: "Failed to load student data.", variant: "destructive" });
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);
  
  const handleMarkAsCalled = async (recordId: string) => {
    const result = await markCallAsCompletedAction(recordId);
    if (result.success) {
      toast({ title: "Success", description: "Call status updated." });
      setAbsentStudents(prev => prev.map(r => r.id === recordId ? { ...r, callStatus: 'Called' } : r));
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };
  
  const handleMarkAsCounseled = async (studentId: string) => {
    const result = await markStudentAsCounseledAction(studentId);
    if (result.success) {
      toast({ title: "Success", description: "Student marked as counseled for this month."});
      setAllStudents(prev => prev.map(s => s.id === studentId ? { ...s, lastCounseledAt: new Date() as any } : s));
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };
  
  const isCounseledThisMonth = (counseledDate?: any) => {
    if (!counseledDate) return false;
    const date = safeToDate(counseledDate);
    if (isNaN(date.getTime())) return false;
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  const filteredCounselingStudents = useMemo(() => {
    return allStudents.filter(s => 
        s.name.toLowerCase().includes(counselingSearch.toLowerCase()) ||
        s.email.toLowerCase().includes(counselingSearch.toLowerCase()) ||
        (s.offlineRollNo && s.offlineRollNo.includes(counselingSearch)) ||
        (s.classRoll && s.classRoll.includes(counselingSearch))
    );
  }, [allStudents, counselingSearch]);


  if (loading) {
      return (
          <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
              <LoadingSpinner className="w-12 h-12" />
          </div>
      );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Student Call Center</h1>
            <p className="mt-1 text-lg text-muted-foreground">Contact absent students or perform monthly counseling.</p>
        </div>
        <Tabs defaultValue="absent_today">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="absent_today">Today's Absentees</TabsTrigger>
                <TabsTrigger value="counseling">Student Counseling</TabsTrigger>
            </TabsList>
            <TabsContent value="absent_today" className="mt-4">
                 <Card>
                    <CardHeader>
                        <CardTitle>Today's Absentee List</CardTitle>
                        <CardDescription>Follow up with absent students for today, {format(new Date(), 'PPP')}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {absentStudents.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Course / Batch</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {absentStudents.map(student => (
                                        <TableRow key={student.id}>
                                            <TableCell>
                                                <div>{student.studentName}</div>
                                                <div className="text-xs text-muted-foreground">Roll: {student.studentRoll}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div>{student.courseName}</div>
                                                <div className="text-xs text-muted-foreground">{student.batchName}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2 items-center flex-wrap">
                                                    <Button variant="outline" size="sm" asChild disabled={!student.studentPhone}><a href={`tel:${student.studentPhone}`}><Phone className="mr-2 h-4 w-4"/>Student</a></Button>
                                                    <Button variant="outline" size="sm" asChild disabled={!student.guardianPhone}><a href={`tel:${student.guardianPhone}`}><Phone className="mr-2 h-4 w-4 text-purple-500"/>Guardian</a></Button>
                                                    <Button variant="outline" size="sm" onClick={() => handleMarkAsCalled(student.id!)} disabled={student.callStatus === 'Called'}>
                                                        <CheckCircle className={cn("mr-2 h-4 w-4", student.callStatus === 'Called' && "text-green-500")} />
                                                        {student.callStatus === 'Called' ? 'Called' : 'Mark Called'}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-16 bg-muted rounded-lg flex flex-col items-center">
                                <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No students were marked absent today.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="counseling" className="mt-4">
                 <Card>
                    <CardHeader>
                        <CardTitle>Student Counseling List</CardTitle>
                        <CardDescription>Perform monthly counseling calls for all students.</CardDescription>
                        <div className="relative pt-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1.2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email, or roll..."
                                value={counselingSearch}
                                onChange={(e) => setCounselingSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                       {filteredCounselingStudents.length > 0 ? (
                           <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Roll</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCounselingStudents.map(student => {
                                        const counseled = isCounseledThisMonth(student.lastCounseledAt);
                                        return (
                                            <TableRow key={student.id}>
                                                <TableCell>
                                                    <div>{student.name}</div>
                                                    <div className="text-xs text-muted-foreground">{student.email}</div>
                                                </TableCell>
                                                <TableCell>
                                                   <Badge variant="outline">{student.offlineRollNo || student.classRoll || 'N/A'}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2 items-center flex-wrap">
                                                        <Button variant="outline" size="sm" asChild disabled={!student.mobileNumber}><a href={`tel:${student.mobileNumber}`}><Phone className="mr-2 h-4 w-4"/>Student</a></Button>
                                                        <Button variant="outline" size="sm" asChild disabled={!student.guardianMobileNumber}><a href={`tel:${student.guardianMobileNumber}`}><Phone className="mr-2 h-4 w-4 text-purple-500"/>Guardian</a></Button>
                                                        <Button variant="outline" size="sm" onClick={() => handleMarkAsCounseled(student.id!)} disabled={counseled}>
                                                            <BookUser className={cn("mr-2 h-4 w-4", counseled && "text-green-500")} />
                                                            {counseled ? `Counseled on ${format(safeToDate(student.lastCounseledAt), 'MMM d')}` : 'Mark Counseled'}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                           </Table>
                       ) : (
                           <div className="text-center py-16 bg-muted rounded-lg flex flex-col items-center">
                                <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No students found.</p>
                            </div>
                       )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
