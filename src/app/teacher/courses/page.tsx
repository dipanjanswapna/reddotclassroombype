
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
import { courses } from '@/lib/mock-data';
import type { VariantProps } from 'class-variance-authority';

// For demo, we'll just show courses by 'Jubayer Ahmed'
const teacherCourses = courses.filter(course => 
  course.instructors.some(instructor => instructor.name === 'Jubayer Ahmed')
);

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
                        {teacherCourses.map((course) => (
                            <TableRow key={course.id}>
                                <TableCell className="font-medium">{course.title}</TableCell>
                                <TableCell>{course.price}</TableCell>
                                <TableCell>{(course.reviews || 0) * 10 + 5}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusBadgeVariant(course.status)}>
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
