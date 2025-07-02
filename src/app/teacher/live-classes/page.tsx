
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, Video, Loader2 } from 'lucide-react';
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
import { scheduleLiveClassAction } from '@/app/actions/live-class.actions';
import { format } from 'date-fns';

type LiveClassWithCourse = LiveClass & {
  courseTitle: string;
  courseId: string;
}

function getPlatformBadgeColor(platform: string) {
    switch (platform.toLowerCase()) {
        case 'youtube live':
            return 'bg-red-600 hover:bg-red-700';
        case 'facebook live':
            return 'bg-blue-600 hover:bg-blue-700';
        case 'zoom':
            return 'bg-sky-500 hover:bg-sky-600';
        case 'google meet':
            return 'bg-green-600 hover:bg-green-700';
        default:
            return 'bg-gray-500 hover:bg-gray-600';
    }
}

export default function TeacherLiveClassesPage() {
  const { toast } = useToast();
  const { userInfo } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [liveClasses, setLiveClasses] = useState<LiveClassWithCourse[]>([]);
  const [teacherCourses, setTeacherCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [selectedCourse, setSelectedCourse] = useState('');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState('');
  const [platform, setPlatform] = useState<LiveClass['platform']>('Zoom');
  const [joinUrl, setJoinUrl] = useState('');

  const fetchClassData = async () => {
    if (!userInfo) return;
    try {
        const instructor = await getInstructorByUid(userInfo.uid);
        if (!instructor) {
            toast({ title: 'Error', description: 'Could not find your instructor profile.', variant: 'destructive' });
            if (loading) setLoading(false);
            return;
        }

        const allCourses = await getCourses();
        let manageableCourses: Course[] = [];

        if (instructor.organizationId) {
            manageableCourses = allCourses.filter(course => course.organizationId === instructor.organizationId);
        } else {
            manageableCourses = allCourses.filter(c => c.instructors?.some(i => i.slug === instructor.slug));
        }

        setTeacherCourses(manageableCourses);

        const allClasses = manageableCourses.flatMap(course => 
            (course.liveClasses || []).map(lc => ({...lc, courseTitle: course.title, courseId: course.id!}))
        );
        setLiveClasses(allClasses.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({ title: 'Error', description: 'Could not fetch live class data', variant: 'destructive'});
    } finally {
        if (loading) setLoading(false);
    }
  };


  useEffect(() => {
    if (!userInfo) return;
    fetchClassData();
  }, [userInfo]);


  const handleScheduleClass = async () => {
    if (!selectedCourse || !topic || !date || !time || !platform || !joinUrl) {
        toast({ title: 'Error', description: 'Please fill out all fields.', variant: 'destructive' });
        return;
    }
    
    setIsSaving(true);

    const liveClassData: Omit<LiveClass, 'id'> = {
        topic,
        date: format(date, 'yyyy-MM-dd'),
        time,
        platform,
        joinUrl
    };

    const result = await scheduleLiveClassAction(selectedCourse, liveClassData);
    
    if (result.success) {
        toast({ title: 'Success!', description: `Scheduled "${topic}" successfully.` });
        await fetchClassData(); // Re-fetch data
        setIsDialogOpen(false);
        // Reset form
        setSelectedCourse('');
        setTopic('');
        setDate(new Date());
        setTime('');
        setPlatform('Zoom');
        setJoinUrl('');
    } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setIsSaving(false);
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
                        <Button type="button" onClick={handleScheduleClass} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save changes
                        </Button>
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
