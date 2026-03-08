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
    <Card className="rounded-xl shadow-sm">
        <CardHeader>
            <CardTitle>All Academic Courses</CardTitle>
            <CardDescription>A list of all courses in the system, including their approval status.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="px-6 font-bold">Course Title</TableHead>
                        <TableHead className="font-bold">Lead Instructor</TableHead>
                        <TableHead className="font-bold">Price</TableHead>
                        <TableHead className="font-bold">Status</TableHead>
                        <TableHead className="text-right px-6 font-bold">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {courses.map((course) => (
                        <TableRow key={course.id} className="hover:bg-muted/30">
                            <TableCell className="px-6 font-semibold">{course.title}</TableCell>
                            <TableCell className="font-medium">{course.instructors?.[0]?.name || 'N/A'}</TableCell>
                            <TableCell className="font-bold text-primary">{course.price}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusBadgeVariant(course.status as Status)} className="rounded-lg uppercase text-[9px] font-black">
                                    {course.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right px-6">
                                <div className="flex gap-2 justify-end">
                                    {course.status === 'Pending Approval' && (
                                        <>
                                            <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold" onClick={() => handleStatusChange(course.id!, 'Published')}>
                                                <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                                                Approve
                                            </Button>
                                            <Button size="sm" variant="destructive" className="h-8 rounded-lg font-bold" onClick={() => handleStatusChange(course.id!, 'Rejected')}>
                                                <XCircle className="mr-1.5 h-3.5 w-3.5" />
                                                Reject
                                            </Button>
                                        </>
                                    )}
                                    <Button variant="outline" size="sm" asChild className="h-8 rounded-lg font-bold">
                                        <Link href={`/admin/courses/builder/${course.id}`}>
                                            <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                            Edit
                                        </Link>
                                    </Button>
                                    <Button variant="destructive" size="sm" className="h-8 rounded-lg font-bold" onClick={() => setCourseToDelete(course)}>
                                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
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
        <AlertDialogContent className="rounded-xl">
            <AlertDialogHeader>
            <AlertDialogTitle className="font-headline uppercase">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-sm">
                This action cannot be undone. This will permanently delete the course "{courseToDelete?.title}" and all its associated data.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg font-bold">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90 rounded-lg font-bold">Continue</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}