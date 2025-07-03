
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Course } from '@/lib/types';
import { getCourses } from '@/lib/firebase/firestore';
import { launchPrebookingCourseAction } from '@/app/actions/course.actions';
import { Rocket, Loader2 } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/loading-spinner';
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

export default function AdminPrebookingPage() {
    const { toast } = useToast();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [launchingCourseId, setLaunchingCourseId] = useState<string | null>(null);
    const [courseToLaunch, setCourseToLaunch] = useState<Course | null>(null);

    const fetchCourses = async () => {
         try {
            const allCourses = await getCourses();
            const prebookingCourses = allCourses.filter(c => c.isPrebooking);
            setCourses(prebookingCourses);
        } catch (error) {
            console.error("Failed to fetch pre-booking courses:", error);
            toast({ title: "Error", description: "Could not fetch pre-booking data.", variant: "destructive" });
        } finally {
            if(loading) setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchCourses();
    }, []);
    
    const handleLaunchConfirm = async () => {
        if (!courseToLaunch?.id) return;
        setLaunchingCourseId(courseToLaunch.id);

        const result = await launchPrebookingCourseAction(courseToLaunch.id);

        if (result.success) {
            await fetchCourses(); // Refresh the list
            toast({
                title: `Course Launched!`,
                description: result.message
            });
        } else {
            toast({ title: "Error", description: result.message, variant: "destructive" });
            setLaunchingCourseId(null);
        }
        setCourseToLaunch(null);
    }
    
    if (loading) {
        return (
          <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
            <LoadingSpinner className="w-12 h-12" />
          </div>
        );
    }

    return (
        <>
            <div className="p-4 sm:p-6 lg:p-8 space-y-8">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Pre-booking Management</h1>
                    <p className="mt-1 text-lg text-muted-foreground">
                        Monitor and manage all pre-booking campaigns on the platform.
                    </p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>All Pre-booking Courses</CardTitle>
                        <CardDescription>Launch courses once they are ready to go live.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Progress</TableHead>
                                    <TableHead>End Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {courses.map((course) => {
                                    const isEnded = course.prebookingEndDate ? isPast(new Date(course.prebookingEndDate)) : true;
                                    const progress = course.prebookingCount && course.prebookingTarget ? (course.prebookingCount / course.prebookingTarget) * 100 : 0;
                                    const isLaunching = launchingCourseId === course.id;
                                    return (
                                        <TableRow key={course.id}>
                                            <TableCell className="font-medium">{course.title}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <Progress value={progress} className="w-48 h-2"/>
                                                    <p className="text-xs text-muted-foreground">{course.prebookingCount || 0} / {course.prebookingTarget || 'N/A'} students</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{course.prebookingEndDate ? format(new Date(course.prebookingEndDate), 'PPP') : 'N/A'}</TableCell>
                                            <TableCell>
                                                <Badge variant={isEnded ? 'secondary' : 'accent'}>
                                                    {isEnded ? 'Ended' : 'Active'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="accent" size="sm" onClick={() => setCourseToLaunch(course)} disabled={isLaunching}>
                                                    {isLaunching ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Rocket className="mr-2 h-4 w-4"/>}
                                                    Launch Course
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                                 {courses.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No active pre-booking campaigns found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <AlertDialog open={!!courseToLaunch} onOpenChange={(open) => !open && setCourseToLaunch(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to launch "{courseToLaunch?.title}"?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will end the pre-booking phase. The course will become available for regular enrollment. All pre-booked users will be sent a unique promo code for their discount. This action cannot be undone.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLaunchConfirm} className="bg-accent hover:bg-accent/90">Launch</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
