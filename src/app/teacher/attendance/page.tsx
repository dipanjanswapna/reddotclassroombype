
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { getInstructorByUid, getCourses, getBatches, getBranches, getUsersByBatchId } from '@/lib/firebase/firestore';
import { saveAttendanceAction } from '@/app/actions/attendance.actions';
import type { Batch, Course, Branch, User } from '@/lib/types';
import { ClipboardCheck, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/context/auth-context';
import { format } from 'date-fns';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type BatchWithDetails = Batch & {
    courseName: string;
    branchName: string;
};

type AttendanceStatus = 'Present' | 'Absent' | 'Late';

export default function TeacherAttendancePage() {
    const { toast } = useToast();
    const { userInfo } = useAuth();
    const [batches, setBatches] = useState<BatchWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    const [selectedBatch, setSelectedBatch] = useState<BatchWithDetails | null>(null);
    const [studentsInBatch, setStudentsInBatch] = useState<User[]>([]);
    const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceStatus>>({});

    useEffect(() => {
        if (!userInfo) return;
        
        async function fetchInitialData() {
            try {
                const instructor = await getInstructorByUid(userInfo.uid);
                if (!instructor) {
                    toast({ title: 'Error', description: 'Could not find your instructor profile.', variant: 'destructive' });
                    setLoading(false);
                    return;
                }
                
                const [allCourses, allBatches, allBranches] = await Promise.all([
                    getCourses(),
                    getBatches(),
                    getBranches(),
                ]);
                
                const teacherBatches = allBatches.filter(batch => batch.instructorSlugs.includes(instructor.slug));
                
                const batchesWithDetails = teacherBatches.map(batch => {
                    const course = allCourses.find(c => c.id === batch.courseId);
                    const branch = allBranches.find(b => b.id === batch.branchId);
                    return {
                        ...batch,
                        courseName: course?.title || 'Unknown Course',
                        branchName: branch?.name || 'Unknown Branch',
                    }
                });
                
                setBatches(batchesWithDetails);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast({ title: 'Error', description: 'Could not load your data.', variant: 'destructive'});
            } finally {
                setLoading(false);
            }
        }
        fetchInitialData();
    }, [userInfo, toast]);
    
    const handleOpenDialog = async (batch: BatchWithDetails) => {
        setSelectedBatch(batch);
        setIsLoading(true); // Reuse loading state for fetching students
        try {
            const students = await getUsersByBatchId(batch.id!);
            setStudentsInBatch(students);
            // Default all students to 'Present'
            const initialAttendance = students.reduce((acc, student) => {
                acc[student.id!] = 'Present';
                return acc;
            }, {} as Record<string, AttendanceStatus>);
            setAttendanceData(initialAttendance);
            setIsDialogOpen(true);
        } catch (error) {
            toast({ title: 'Error', description: 'Could not load student list for this batch.', variant: 'destructive'});
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAttendanceChange = (studentId: string, status: AttendanceStatus) => {
        setAttendanceData(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSaveAttendance = async () => {
        if (!selectedBatch || !userInfo) return;
        setIsSaving(true);
        const dataToSave = Object.entries(attendanceData).map(([studentId, status]) => ({
            studentId,
            status,
        }));

        const result = await saveAttendanceAction(
            selectedBatch.id!,
            selectedBatch.courseId,
            selectedBatch.branchId,
            dataToSave,
            userInfo.uid
        );
        
        if (result.success) {
            toast({ title: "Success!", description: "Attendance has been saved."});
            setIsDialogOpen(false);
        } else {
            toast({ title: "Error", description: result.message, variant: "destructive"});
        }
        setIsSaving(false);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-[calc(100vh-8rem)]"><LoadingSpinner /></div>;
    }

    return (
        <>
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Digital Attendance</h1>
                <p className="mt-1 text-lg text-muted-foreground">Select a batch to record today's attendance.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>My Offline Batches</CardTitle>
                    <CardDescription>A list of all your assigned batches in offline centers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Batch</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Branch</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {batches.length > 0 ? batches.map(batch => (
                                <TableRow key={batch.id}>
                                    <TableCell className="font-medium">{batch.name}</TableCell>
                                    <TableCell>{batch.courseName}</TableCell>
                                    <TableCell>{batch.branchName}</TableCell>
                                    <TableCell className="text-right">
                                        <Button onClick={() => handleOpenDialog(batch)}>
                                            <ClipboardCheck className="mr-2 h-4 w-4" />
                                            Take Attendance
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">You are not assigned to any offline batches.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Take Attendance for {selectedBatch?.name}</DialogTitle>
                    <p className="text-sm text-muted-foreground">Date: {format(new Date(), 'PPP')}</p>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    {loading ? <LoadingSpinner /> : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Roll</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {studentsInBatch.map(student => (
                                    <TableRow key={student.id}>
                                        <TableCell className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={student.avatarUrl} />
                                                <AvatarFallback>{student.name.substring(0,2)}</AvatarFallback>
                                            </Avatar>
                                            {student.name}
                                        </TableCell>
                                        <TableCell><Badge variant="outline">{student.offlineRollNo || "N/A"}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <RadioGroup
                                                value={attendanceData[student.id!] || 'Present'}
                                                onValueChange={(value) => handleAttendanceChange(student.id!, value as AttendanceStatus)}
                                                className="flex justify-end gap-4"
                                            >
                                                <Label className="flex items-center gap-2 cursor-pointer text-green-600"><RadioGroupItem value="Present" id={`${student.id}-present`} />Present</Label>
                                                <Label className="flex items-center gap-2 cursor-pointer text-red-600"><RadioGroupItem value="Absent" id={`${student.id}-absent`} />Absent</Label>
                                                <Label className="flex items-center gap-2 cursor-pointer text-yellow-600"><RadioGroupItem value="Late" id={`${student.id}-late`} />Late</Label>
                                            </RadioGroup>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
                <div className="pt-4 flex justify-end">
                    <Button onClick={handleSaveAttendance} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 animate-spin" />}
                        Save Attendance
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
        </>
    );
}
