
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
  AlertDialogTrigger,
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

  const handleDeleteCourse = async (id: string) => {
    const result = await deleteCourseAction(id);
    if(result.success) {
      setCourses(courses.filter(course => course.id !== id));
       toast({
        title: "Course Deleted",
        description: "The course has been permanently deleted.",
      });
    } else {
       toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
  };
  
  return (
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
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-primary-foreground" onClick={() => handleStatusChange(course.id!, 'Published')}>
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Approve
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button size="sm" variant="destructive">
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        Reject
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure you want to reject this course?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will mark the course as 'Rejected'. The creator will be able to edit and resubmit it.
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleStatusChange(course.id!, 'Rejected')} className="bg-destructive hover:bg-destructive/90">Confirm Rejection</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </>
                                    )}
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/admin/courses/builder/${course.id}`}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Edit
                                        </Link>
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the course and all its data.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteCourse(course.id!)}>Continue</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  );
}
