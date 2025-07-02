
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
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
import { getCourses, getInstructorByUid, getEnrollments } from '@/lib/firebase/firestore';
import { Course } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/context/auth-context';

type Status = 'Published' | 'Pending Approval' | 'Draft' | 'Rejected';

type CourseWithStudentCount = Course & { studentCount: number };

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
  const [courses, setCourses] = useState<CourseWithStudentCount[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { userInfo } = useAuth();

  useEffect(() => {
    async function fetchTeacherCourses() {
      if (!userInfo) return;
      try {
        const [instructor, allCourses, allEnrollments] = await Promise.all([
            getInstructorByUid(userInfo.uid),
            getCourses(),
            getEnrollments(),
        ]);

        if (!instructor?.id) {
          toast({ title: 'Error', description: 'Could not find your instructor profile.', variant: 'destructive' });
          setLoading(false);
          return;
        }

        let manageableCourses: Course[] = [];

        // If teacher is associated with an organization, they can manage all courses from that org.
        if (instructor.organizationId) {
            manageableCourses = allCourses.filter(course => course.organizationId === instructor.organizationId);
        } else {
            // Otherwise, they can only manage courses they are explicitly assigned to (legacy/independent teachers).
            manageableCourses = allCourses.filter(course => 
                course.instructors?.some(i => i.slug === instructor.slug)
            );
        }
        
        const coursesWithCount = manageableCourses.map(course => {
            const studentCount = allEnrollments.filter(e => e.courseId === course.id).length;
            return { ...course, studentCount };
        });

        setCourses(coursesWithCount);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        toast({ title: 'Error', description: 'Could not fetch your courses.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchTeacherCourses();
  }, [userInfo, toast]);

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
                    Manage Courses
                </h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Manage all courses from your associated organization.
                </p>
            </div>
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
                        {courses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    You are not assigned to manage any courses yet.
                                </TableCell>
                            </TableRow>
                        ) : courses.map((course) => (
                            <TableRow key={course.id}>
                                <TableCell className="font-medium">{course.title}</TableCell>
                                <TableCell>{course.price}</TableCell>
                                <TableCell>{course.studentCount}</TableCell>
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
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
