
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { courses, Course } from '@/lib/mock-data';
import { CalendarPlus, Eye } from 'lucide-react';
import { format, isPast } from 'date-fns';

const teacherId = 'ins-ja'; // Mock teacher ID
const teacherPrebookingCourses = courses.filter(c => 
    c.isPrebooking && c.instructors.some(i => i.id === teacherId)
);

export default function TeacherPrebookingPage() {

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Pre-booking Management</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Monitor and manage your pre-booking campaigns.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Your Pre-booking Courses</CardTitle>
                    <CardDescription>Track the progress of your pre-booking enrollments.</CardDescription>
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
                            {teacherPrebookingCourses.map((course) => {
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
                                            <Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4"/>View Students</Button>
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

    