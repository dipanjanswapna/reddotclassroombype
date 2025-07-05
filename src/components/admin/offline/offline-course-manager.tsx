
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Course } from '@/lib/types';
import { deleteCourseAction } from '@/app/actions/course.actions';
import { Badge } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';
import { badgeVariants } from '@/components/ui/badge';

type Status = 'Published' | 'Pending Approval' | 'Draft' | 'Rejected';

const getStatusBadgeVariant = (status: Status): VariantProps<typeof badgeVariants>['variant'] => {
  switch (status) {
    case 'Published': return 'accent';
    case 'Pending Approval': return 'warning';
    case 'Rejected': return 'destructive';
    default: return 'secondary';
  }
};

interface OfflineCourseManagerProps {
  initialCourses: Course[];
}

export function OfflineCourseManager({ initialCourses }: OfflineCourseManagerProps) {
    const { toast } = useToast();
    const [courses, setCourses] = useState<Course[]>(initialCourses);
    const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

    const handleDeleteConfirm = async () => {
        if (!courseToDelete?.id) return;
        const result = await deleteCourseAction(courseToDelete.id);
        if(result.success) {
            setCourses(courses.filter(course => course.id !== courseToDelete.id));
            toast({ title: "Course Deleted", description: "The course has been permanently deleted." });
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
        setCourseToDelete(null);
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Offline & Hybrid Courses</CardTitle>
                        <CardDescription>Manage all courses designated for offline or hybrid delivery.</CardDescription>
                    </div>
                     <Button asChild>
                        <Link href="/admin/courses/builder/new">
                            <PlusCircle className="mr-2"/> Create Course
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courses.map(course => (
                                <TableRow key={course.id}>
                                    <TableCell className="font-medium">{course.title}</TableCell>
                                    <TableCell><Badge variant="outline">{course.type}</Badge></TableCell>
                                    <TableCell><Badge variant={getStatusBadgeVariant(course.status as Status)}>{course.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/admin/courses/builder/${course.id}`}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </Link>
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => setCourseToDelete(course)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                             {courses.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No offline or hybrid courses found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertDialog open={!!courseToDelete} onOpenChange={(open) => !open && setCourseToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the course "{courseToDelete?.title}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
