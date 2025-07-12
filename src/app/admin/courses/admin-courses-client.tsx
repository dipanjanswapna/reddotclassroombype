
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, badgeVariants } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/components/ui/use-toast';
import type { VariantProps } from 'class-variance-authority';
import { Course } from '@/lib/types';
import { deleteCourseAction, saveCourseAction } from '@/app/actions/course.actions';

type Status = 'Published' | 'Pending Approval' | 'Draft' | 'Rejected';

const getStatusBadgeVariant = (status: Status): VariantProps<typeof badgeVariants>['variant'] => {
  switch (status) {
    case 'Published':
      return 'accent';
    case 'Pending Approval':
      return 'warning';
    case 'Rejected':
      return 'destructive';
    default:
      return 'secondary';
  }
};

export function AdminCoursesClient({ initialCourses }: { initialCourses: Course[] }) {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const handleStatusChange = async (id: string, status: Status) => {
    const result = await saveCourseAction({ id, status });
    if (result.success) {
      setCourses(courses.map(course =>
        course.id === id ? { ...course, status } : course
      ));
      toast({
        title: "Course Status Updated",
        description: `The course has been ${status.toLowerCase()}.`,
      });
    } else {
       toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete?.id) return;
    const result = await deleteCourseAction(courseToDelete.id);
    if(result.success) {
      setCourses(courses.filter(course => course.id !== courseToDelete.id));
       toast({
        title: "Course Deleted",
        description: "The course has been permanently deleted.",
      });
    } else {
       toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setCourseToDelete(null);
  };
  
  return (
    <>
    <Card>
        <CardHeader>
            <CardTitle>All Courses</CardTitle>
            <CardDescription>A list of all courses in the system, including their status.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {courses.map((course) => (
                        <TableRow key={course.id}>
                            <TableCell className="font-medium">{course.title}</TableCell>
                            <TableCell>{course.instructors?.[0]?.name || 'N/A'}</TableCell>
                            <TableCell>{course.price}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusBadgeVariant(course.status as Status)}>
                                    {course.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
                                    {course.status === 'Pending Approval' && (
                                        <>
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-primary-foreground" onClick={() => handleStatusChange(course.id!, 'Published')} aria-label={`Approve ${course.title}`}>
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Approve
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleStatusChange(course.id!, 'Rejected')} aria-label={`Reject ${course.title}`}>
                                                <XCircle className="mr-2 h-4 w-4" />
                                                Reject
                                            </Button>
                                        </>
                                    )}
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/admin/courses/builder/${course.id}`} aria-label={`Edit ${course.title}`}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Edit
                                        </Link>
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => setCourseToDelete(course)} aria-label={`Delete ${course.title}`}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
     <AlertDialog open={!!courseToDelete} onOpenChange={(open) => !open && setCourseToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the course "{courseToDelete?.title}" and all its associated data.
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
