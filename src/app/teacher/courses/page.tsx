
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  Pencil,
} from 'lucide-react';
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
import type { VariantProps } from 'class-variance-authority';
import { getCourses } from '@/lib/firebase/firestore';
import { Course } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/loading-spinner';

// For demo, we'll use a hardcoded teacher ID. In a real app, this would come from the auth state.
const teacherId = 'ins-ja'; 

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

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchTeacherCourses() {
      try {
        const allCourses = await getCourses();
        const teacherCourses = allCourses.filter(course => 
          course.instructors?.some(instructor => instructor.id === teacherId)
        );
        setCourses(teacherCourses);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        toast({ title: 'Error', description: 'Could not fetch your courses.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchTeacherCourses();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">
                    My Courses
                </h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Manage your created and co-authored courses.
                </p>
            </div>
            <Button asChild>
                <Link href="/teacher/courses/builder/new">
                    <PlusCircle className="mr-2" />
                    Create New Course
                </Link>
            </Button>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Your Courses</CardTitle>
                <CardDescription>A list of courses you are managing.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Students</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {courses.length > 0 ? courses.map((course) => (
                            <TableRow key={course.id}>
                                <TableCell className="font-medium">{course.title}</TableCell>
                                <TableCell>{course.price}</TableCell>
                                <TableCell>{(course.reviews || 0) * 10 + 5}</TableCell> {/* Mock student count */}
                                <TableCell>
                                    <Badge variant={getStatusBadgeVariant(course.status as Status)}>
                                        {course.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/teacher/courses/builder/${course.id}`}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Edit
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                           <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    You have not created any courses yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
