
import Link from 'next/link';
import {
  PlusCircle,
  Pencil,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { courses } from '@/lib/mock-data';

// For demo, we'll just show courses by 'Jubayer Ahmed'
const teacherCourses = courses.filter(course => course.instructor.name === 'Jubayer Ahmed');

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
                <Link href="/teacher/courses/builder">
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
                                    <Badge className={course.id === '1' ? 'bg-yellow-500 text-black hover:bg-yellow-600' : 'bg-green-500 text-white hover:bg-green-600'}>
                                        {course.id === '1' ? 'Pending Approval' : 'Published'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href="/teacher/courses/builder">
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
