
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useToast } from '@/components/ui/use-toast';
import { getCourses, getInstructorByUid } from '@/lib/firebase/firestore';
import type { Course, LiveClass } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/context/auth-context';

type LiveClassWithCourse = LiveClass & {
  courseTitle: string;
  courseId: string;
}

export default function TeacherLiveClassesPage() {
  const { toast } = useToast();
  const { userInfo } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [liveClasses, setLiveClasses] = useState<LiveClassWithCourse[]>([]);
  const [teacherCourses, setTeacherCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [selectedCourse, setSelectedCourse] = useState('');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState('');
  const [platform, setPlatform] = useState<LiveClass['platform']>('Zoom');
  const [joinUrl, setJoinUrl] = useState('');

  useEffect(() => {
    if (!userInfo) return;
    const fetchClassData = async () => {
        try {
            const instructor = await getInstructorByUid(userInfo.uid);
            if (!instructor) {
                toast({ title: 'Error', description: 'Could not find your instructor profile.', variant: 'destructive' });
                setLoading(false);
                return;
            }

            const allCourses = await getCourses();
            const filteredTeacherCourses = allCourses.filter(c => c.instructors.some(i => i.slug === instructor.slug));
            setTeacherCourses(filteredTeacherCourses);

            const allClasses = filteredTeacherCourses.flatMap(course => 
                (course.liveClasses || []).map(lc => ({...lc, courseTitle: course.title, courseId: course.id!}))
            );
            setLiveClasses(allClasses);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast({ title: 'Error', description: 'Could not fetch live class data', variant: 'destructive'});
        } finally {
            setLoading(false);
        }
    };
    fetchClassData();
  }, [userInfo, toast]);


  const handleScheduleClass = () => {
    if (!selectedCourse || !topic || !date || !time || !platform || !joinUrl) {
        toast({ title: 'Error', description: 'Please fill out all fields.', variant: 'destructive' });
        return;
    }
    
    // In a real app, this would be a server action to update the course document
    const courseDetails = teacherCourses.find(c => c.id === selectedCourse);

    const newClass: LiveClassWithCourse = {
        id: `lc-new-${Date.now()}`,
        courseId: selectedCourse,
        courseTitle: courseDetails?.title || 'Unknown Course',
        topic,
        date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        time,
        platform,
        joinUrl
    };

    setLiveClasses(prev => [...prev, newClass]);
    toast({ title: 'Success!', description: `Scheduled "${topic}" for ${courseDetails?.title}.` });
    setIsDialogOpen(false);
    // Reset form
    setSelectedCourse('');
    setTopic('');
    setDate(new Date());
    setTime('');
    setPlatform('Zoom');
    setJoinUrl('');
  };

  if(loading) {
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
                    Live Class Management
                </h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Manage your upcoming live classes.
                </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2" />
                        Schedule New Class
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Schedule a New Live Class</DialogTitle>
                        <DialogDescription>
                            Fill in the details below to schedule a new class. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="course" className="text-right">Course</Label>
                            <Select onValueChange={setSelectedCourse} value={selectedCourse}>
                                <SelectTrigger id="course" className="col-span-3">
                                    <SelectValue placeholder="Select a course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teacherCourses.map(course => (
                                        <SelectItem key={course.id} value={course.id!}>{course.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="topic" className="text-right">Topic</Label>
                            <Input id="topic" value={topic} onChange={e => setTopic(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right">Date</Label>
                            <DatePicker date={date} setDate={setDate} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="time" className="text-right">Time</Label>
                            <Input id="time" type="time" value={time} onChange={e => setTime(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="platform" className="text-right">Platform</Label>
                             <Select onValueChange={(value: LiveClass['platform']) => setPlatform(value)} value={platform}>
                                <SelectTrigger id="platform" className="col-span-3">
                                    <SelectValue placeholder="Select a platform" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Zoom">Zoom</SelectItem>
                                    <SelectItem value="Google Meet">Google Meet</SelectItem>
                                    <SelectItem value="YouTube Live">YouTube Live</SelectItem>
                                    <SelectItem value="Facebook Live">Facebook Live</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="url" className="text-right">Join URL</Label>
                            <Input id="url" value={joinUrl} onChange={e => setJoinUrl(e.target.value)} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="button" onClick={handleScheduleClass}>Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Your Upcoming Classes</CardTitle>
                <CardDescription>A list of live classes you are scheduled to take.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Topic</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {liveClasses.length > 0 ? liveClasses.map((liveClass) => (
                            <TableRow key={liveClass.id}>
                                <TableCell className="font-medium">{liveClass.courseTitle}</TableCell>
                                <TableCell>{liveClass.topic}</TableCell>
                                <TableCell>{liveClass.date} at {liveClass.time}</TableCell>
                                <TableCell className="text-right">
                                    <Button asChild>
                                        <Link href={`/student/my-courses/${liveClass.courseId}/live-classes/${liveClass.id}`} target="_blank" rel="noopener noreferrer">
                                            <Video className="mr-2" />
                                            Start Class
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                    You have no upcoming live classes.
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
