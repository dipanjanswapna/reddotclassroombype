
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getAttendanceForStudentInCourse } from '@/lib/firebase/firestore';
import { AttendanceRecord } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { parseISO, startOfDay } from 'date-fns';

export default function StudentAttendancePage() {
    const params = useParams();
    const { courseId } = params;
    const { userInfo } = useAuth();
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userInfo) {
            const fetchAttendance = async () => {
                const data = await getAttendanceForStudentInCourse(userInfo.uid, courseId as string);
                setAttendanceRecords(data);
                setLoading(false);
            };
            fetchAttendance();
        } else {
            setLoading(false);
        }
    }, [userInfo, courseId]);

    const presentDays = attendanceRecords
        .filter(r => r.status === 'Present')
        .map(r => startOfDay(parseISO(r.date)));
    
    const absentDays = attendanceRecords
        .filter(r => r.status === 'Absent')
        .map(r => startOfDay(parseISO(r.date)));

    const lateDays = attendanceRecords
        .filter(r => r.status === 'Late')
        .map(r => startOfDay(parseISO(r.date)));
    
    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner />
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Attendance Record</h1>
                <p className="mt-1 text-lg text-muted-foreground">Your attendance for this course.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Attendance Calendar</CardTitle>
                    <CardDescription>A visual representation of your attendance.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-8 items-center justify-center">
                    <Calendar
                        mode="multiple"
                        selected={[...presentDays, ...absentDays, ...lateDays]}
                        modifiers={{
                            present: presentDays,
                            absent: absentDays,
                            late: lateDays,
                        }}
                        modifiersClassNames={{
                            present: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-md',
                            absent: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 rounded-md',
                            late: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 rounded-md',
                        }}
                        className="rounded-md border p-4"
                    />
                    <div className="space-y-2">
                        <h4 className="font-semibold">Legend</h4>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-100 rounded-sm border"></div><span>Present</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-100 rounded-sm border"></div><span>Absent</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-100 rounded-sm border"></div><span>Late</span></div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
