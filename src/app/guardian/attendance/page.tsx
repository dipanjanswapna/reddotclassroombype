

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';
import { getAttendanceForStudent, getCourses } from '@/lib/firebase/firestore';
import { AttendanceRecord, Course } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ClipboardCheck } from 'lucide-react';

type AttendanceWithCourse = AttendanceRecord & {
    courseName?: string;
}

const getStatusBadgeVariant = (status: 'Present' | 'Absent' | 'Late') => {
  switch (status) {
    case 'Present': return 'accent';
    case 'Late': return 'warning';
    case 'Absent': return 'destructive';
    default: return 'secondary';
  }
};

export default function GuardianAttendancePage() {
  const { userInfo: guardian, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [attendance, setAttendance] = useState<AttendanceWithCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    const fetchAttendanceHistory = async () => {
      if (!guardian || !guardian.linkedStudentId) {
        setLoading(false);
        return;
      }
      try {
        const [allCourses, attendanceRecords] = await Promise.all([
          getCourses(),
          getAttendanceForStudent(guardian.linkedStudentId),
        ]);
        
        const history: AttendanceWithCourse[] = attendanceRecords.map(record => {
          const course = allCourses.find(c => c.id === record.courseId);
          return {
            ...record,
            courseName: course?.title || 'Unknown Course',
          };
        }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setAttendance(history);

      } catch (error) {
        console.error("Failed to fetch attendance history:", error);
        toast({ title: 'Error', description: "Could not load attendance history.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchAttendanceHistory();
  }, [authLoading, guardian, toast]);
  
  if (loading || authLoading) {
      return (
          <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
              <LoadingSpinner className="w-12 h-12" />
          </div>
      );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Child's Attendance</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          A complete record of your child's attendance across all courses.
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Attendance History</CardTitle>
            <CardDescription>A log of all recorded attendance.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Course</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.length > 0 ? attendance.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{format(new Date(record.date), 'PPP')}</TableCell>
                  <TableCell>{record.courseName}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={getStatusBadgeVariant(record.status)}>{record.status}</Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                            <ClipboardCheck className="w-8 h-8" />
                            <span>No attendance has been recorded yet.</span>
                        </div>
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
