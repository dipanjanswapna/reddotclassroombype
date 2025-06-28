
'use client';

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { courses as initialCourses, Course } from '@/lib/mock-data';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import type { VariantProps } from 'class-variance-authority';

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
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [categories, setCategories] = useState<string[]>([...new Set(initialCourses.map(c => c.category))]);
  const [newCategory, setNewCategory] = useState('');

  const handleStatusChange = (id: string, status: Status) => {
    setCourses(courses.map(course =>
      course.id === id ? { ...course, status } : course
    ));
    toast({
      title: "Course Status Updated",
      description: `The course has been ${status.toLowerCase()}.`,
    });
  };

  const handleDeleteCourse = (id: string) => {
    setCourses(courses.filter(course => course.id !== id));
     toast({
      title: "Course Deleted",
      description: "The course has been permanently deleted.",
      variant: 'destructive',
    });
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
      toast({
        title: "Category Added",
        description: `"${newCategory.trim()}" has been added.`,
      });
    }
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
     setCategories(categories.filter(c => c !== categoryToDelete));
      toast({
      title: "Category Deleted",
      description: `"${categoryToDelete}" has been deleted.`,
      variant: 'destructive'
    });
  };
  
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">
                    Course Management
                </h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Create, edit, and manage all courses and categories on the platform.
                </p>
            </div>
            <Button asChild>
                <Link href="/admin/courses/builder/new">
                    <PlusCircle className="mr-2" />
                    Create New Course
                </Link>
            </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
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
                                            <Badge variant={getStatusBadgeVariant(course.status)}>
                                                {course.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                {course.status === 'Pending Approval' && (
                                                    <>
                                                        <Button variant="outline" size="sm" className="border-green-400 text-green-700 hover:bg-green-100" onClick={() => handleStatusChange(course.id, 'Published')}>
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Approve
                                                        </Button>
                                                        <Button variant="outline" size="sm" className="border-red-400 text-red-700 hover:bg-red-100" onClick={() => handleStatusChange(course.id, 'Rejected')}>
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
                                                        <AlertDialogAction onClick={() => handleDeleteCourse(course.id)}>Continue</AlertDialogAction>
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
            <div className="lg:col-span-1">
                 <Card>
                    <CardHeader>
                        <CardTitle>Category Management</CardTitle>
                        <CardDescription>Add or remove course categories.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-category">New Category Name</Label>
                                <div className="flex gap-2">
                                    <Input 
                                        id="new-category" 
                                        value={newCategory} 
                                        onChange={(e) => setNewCategory(e.target.value)} 
                                        placeholder="e.g., University"
                                    />
                                    <Button onClick={handleAddCategory}>Add</Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Existing Categories</Label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(cat => (
                                        <Badge key={cat} variant="secondary" className="text-sm py-1 pl-3 pr-1">
                                            {cat}
                                            <Button variant="ghost" size="icon" className="h-5 w-5 ml-1" onClick={() => handleDeleteCategory(cat)}>
                                                <XCircle className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                            </Button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
