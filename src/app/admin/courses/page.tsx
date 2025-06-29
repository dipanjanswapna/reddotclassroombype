
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';
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
import { getCourses } from '@/lib/firebase/firestore';
import { deleteCourseAction, saveCourseAction } from '@/app/actions';
import { LoadingSpinner } from '@/components/loading-spinner';


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


export default function AdminCourseManagementPage() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const fetchedCourses = await getCourses();
        setCourses(fetchedCourses);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({ title: 'Error', description: 'Could not fetch courses.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast]);

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
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">
                    Course Management
                </h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Create, edit, and manage all courses on the platform.
                </p>
            </div>
            <Button asChild>
                <Link href="/admin/courses/builder/new">
                    <PlusCircle className="mr-2" />
                    Create New Course
                </Link>
            </Button>
        </div>

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
                                                <Button variant="outline" size="sm" className="border-green-400 text-green-700 hover:bg-green-100" onClick={() => handleStatusChange(course.id!, 'Published')}>
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Approve
                                                </Button>
                                                <Button variant="outline" size="sm" className="border-red-400 text-red-700 hover:bg-red-100" onClick={() => handleStatusChange(course.id!, 'Rejected')}>
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                    Reject
                                                </Button>
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
    </div>
  );
}
