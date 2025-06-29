
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { courses as initialCourses, Course } from '@/lib/mock-data';
import { CalendarPlus, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

const allPrebookingCourses = initialCourses.filter(c => c.isPrebooking);

export default function AdminPrebookingPage() {
    const { toast } = useToast();
    const [courses, setCourses] = useState(allPrebookingCourses);

    const handleTogglePrebooking = (courseId: string) => {
        setCourses(prev => prev.map(c => c.id === courseId ? {...c, isPrebooking: !c.isPrebooking} : c));
        const course = courses.find(c => c.id === courseId);
        toast({
            title: `Pre-booking ${course?.isPrebooking ? 'Disabled' : 'Enabled'}`,
            description: `Pre-booking for "${course?.title}" has been updated.`
        });
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
                                                <Button variant="outline" size="sm" onClick={() => handleTogglePrebooking(course.id)}>
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

    