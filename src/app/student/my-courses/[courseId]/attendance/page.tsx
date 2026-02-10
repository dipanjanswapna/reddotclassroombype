
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
import { motion } from 'framer-motion';
import { ClipboardCheck, PieChart, Info } from 'lucide-react';

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
    
    const attendancePercentage = attendanceRecords.length > 0 
        ? Math.round(((presentDays.length + lateDays.length) / attendanceRecords.length) * 100) 
        : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <LoadingSpinner className="w-10 h-10" />
            </div>
        );
    }
    
    return (
        <div className="space-y-10">
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-2 border-l-4 border-primary pl-4"
            >
                <h1 className="font-headline text-3xl font-black tracking-tight uppercase">Attendance <span className="text-primary">Logs</span></h1>
                <p className="mt-1 text-muted-foreground font-medium">Keep track of your physical or digital presence in classes.</p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 rounded-[20px] border-primary/20 shadow-xl overflow-hidden bg-card">
                    <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-xl">
                                <ClipboardCheck className="w-6 h-6 text-primary" />
                            </div>
                            <CardTitle className="text-xl font-black uppercase tracking-tight">Presence Calendar</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 flex flex-col md:flex-row gap-8 items-center justify-center">
                        <Calendar
                            mode="multiple"
                            selected={[...presentDays, ...absentDays, ...lateDays]}
                            modifiers={{
                                present: presentDays,
                                absent: absentDays,
                                late: lateDays,
                            }}
                            modifiersClassNames={{
                                present: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-md font-bold',
                                absent: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 rounded-md font-bold',
                                late: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 rounded-md font-bold',
                            }}
                            className="rounded-xl border border-primary/5 p-4 shadow-inner bg-muted/20"
                        />
                        <div className="space-y-4 w-full md:w-auto">
                            <h4 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground border-b border-primary/10 pb-2">Status Legend</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-xs font-bold"><div className="w-4 h-4 bg-green-100 rounded-lg border border-green-300"></div><span>Present ({presentDays.length})</span></div>
                                <div className="flex items-center gap-3 text-xs font-bold"><div className="w-4 h-4 bg-red-100 rounded-lg border border-red-300"></div><span>Absent ({absentDays.length})</span></div>
                                <div className="flex items-center gap-3 text-xs font-bold"><div className="w-4 h-4 bg-yellow-100 rounded-lg border border-yellow-300"></div><span>Late ({lateDays.length})</span></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="rounded-[20px] border-primary/20 shadow-xl bg-card overflow-hidden">
                        <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
                            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-primary" /> Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 text-center">
                            <div className="relative inline-flex items-center justify-center">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle className="text-muted stroke-current" strokeWidth="10" fill="transparent" r="50" cx="64" cy="64" />
                                    <circle className="text-primary stroke-current" strokeWidth="10" strokeLinecap="round" fill="transparent" r="50" cx="64" cy="64" style={{ strokeDasharray: `${2 * Math.PI * 50}`, strokeDashoffset: `${2 * Math.PI * 50 * (1 - attendancePercentage / 100)}` }} />
                                </svg>
                                <span className="absolute text-2xl font-black text-foreground">{attendancePercentage}%</span>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-4">Attendance Rate</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[20px] border-primary/20 shadow-xl bg-primary/5 p-6 border-l-4 border-l-primary">
                        <div className="flex gap-3">
                            <Info className="w-5 h-5 text-primary shrink-0" />
                            <div className="space-y-1">
                                <p className="text-[11px] font-black uppercase tracking-tight text-foreground">Did you know?</p>
                                <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
                                    Students with over 90% attendance are 3x more likely to secure top positions in final exams.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
