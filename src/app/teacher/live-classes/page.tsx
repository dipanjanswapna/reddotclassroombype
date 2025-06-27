
import {
  PlusCircle,
  Video,
} from 'lucide-react';
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
import { courses } from '@/lib/mock-data';
import Link from 'next/link';

// Mock data: find all classes assigned to a specific teacher
const teacherName = 'Jubayer Ahmed'; // Example teacher
const teacherLiveClasses = courses.flatMap(course => 
    (course.liveClasses || [])
        // A class is assigned to this teacher if their name is found in the course's general instructors list
        .filter(() => (course.instructors || []).some(ins => ins.name === teacherName)) 
        .map(lc => ({...lc, courseTitle: course.title, courseId: course.id}))
);


export default function TeacherLiveClassesPage() {
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
            <Button>
                <PlusCircle className="mr-2" />
                Schedule New Class
            </Button>
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
                        {teacherLiveClasses.length > 0 ? teacherLiveClasses.map((liveClass) => (
                            <TableRow key={liveClass.id}>
                                <TableCell className="font-medium">{liveClass.courseTitle}</TableCell>
                                <TableCell>{liveClass.topic}</TableCell>
                                <TableCell>{liveClass.date} at {liveClass.time}</TableCell>
                                <TableCell className="text-right">
                                    <Button asChild>
                                        <Link href={liveClass.joinUrl} target="_blank" rel="noopener noreferrer">
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
