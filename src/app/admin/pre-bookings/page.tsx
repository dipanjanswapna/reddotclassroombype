
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Course } from '@/lib/types';
import { getCourses } from '@/lib/firebase/firestore';
import { saveCourseAction } from '@/app/actions/course.actions';
import { Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/loading-spinner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pre-booking Management',
    description: 'Monitor and manage all pre-booking campaigns on the platform.',
};

export default function AdminPrebookingPage() {
    const { toast } = useToast();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCourses() {
            try {
                const allCourses = await getCourses();
                const prebookingCourses = allCourses.filter(c => c.isPrebooking);
                setCourses(prebookingCourses);
            } catch (error) {
                console.error("Failed to fetch pre-booking courses:", error);
                toast({ title: "Error", description: "Could not fetch pre-booking data.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        }
        fetchCourses();
    }, [toast]);

    const handleTogglePrebooking = async (courseId: string) => {
        const course = courses.find(c => c.id === courseId);
        if (!course) return;

        const newStatus = !course.isPrebooking;
        const result = await saveCourseAction({ id: courseId, isPrebooking: newStatus });

        if (result.success) {
            setCourses(prev => prev.map(c => c.id === courseId ? {...c, isPrebooking: newStatus} : c));
            toast({
                title: `Pre-booking ${newStatus ? 'Enabled' : 'Disabled'}`,
                description: `Pre-booking for "${course.title}" has been updated.`
            });
        } else {
            toast({ title: "Error", description: result.message, variant: "destructive" });
        }
    }
    
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
                <h1 className="font-headline text-3xl font-bold tracking-tight">Pre-booking Management</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Monitor and manage all pre-booking campaigns on the platform.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Pre-booking Courses</CardTitle>
                    <CardDescription>Track the progress of all pre-booking enrollments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Course</TableHead>
                                <TableHead>Progress</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courses.map((course) => {
                                const isEnded = course.prebookingEndDate ? isPast(new Date(course.prebookingEndDate)) : true;
                                const progress = course.prebookingCount && course.prebookingTarget ? (course.prebookingCount / course.prebookingTarget) * 100 : 0;
                                return (
                                    <TableRow key={course.id}>
                                        <TableCell className="font-medium">{course.title}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <Progress value={progress} className="w-48 h-2"/>
                                                <p className="text-xs text-muted-foreground">{course.prebookingCount || 0} / {course.prebookingTarget || 'N/A'} students</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{course.prebookingEndDate ? format(new Date(course.prebookingEndDate), 'PPP') : 'N/A'}</TableCell>
                                        <TableCell>
                                            <Badge variant={isEnded ? 'secondary' : 'accent'}>
                                                {isEnded ? 'Ended' : 'Active'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button variant="outline" size="sm" onClick={() => handleTogglePrebooking(course.id!)}>
                                                    {course.isPrebooking ? <ToggleRight className="mr-2 h-4 w-4"/> : <ToggleLeft className="mr-2 h-4 w-4"/>}
                                                    {course.isPrebooking ? 'Disable' : 'Enable'}
                                                </Button>
                                                <Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4"/>View Students</Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
