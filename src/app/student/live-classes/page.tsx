
import { courses } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'My Live Classes',
  description: 'A central hub for all your upcoming live classes across all enrolled courses.',
};

// In a real app, this would be fetched based on the logged-in user.
// For now, we'll mock the student's enrolled courses.
const enrolledCourseIds = ['1', '3', '4'];
const getStudentLiveClasses = () => {
    return courses
        .filter(course => enrolledCourseIds.includes(course.id))
        .flatMap(course => 
            (course.liveClasses || []).map(liveClass => ({
            ...liveClass,
            courseId: course.id,
            courseTitle: course.title,
            }))
        )
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

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

export default function AllLiveClassesPage() {
  const studentLiveClasses = getStudentLiveClasses();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Upcoming Live Classes</h1>
        <p className="mt-1 text-lg text-muted-foreground">Stay on top of your live class schedule across all your courses.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Schedule</CardTitle>
          <CardDescription>This list includes upcoming live classes from all the courses you are currently enrolled in.</CardDescription>
        </CardHeader>
        <CardContent>
          {studentLiveClasses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentLiveClasses.map((liveClass) => (
                  <TableRow key={`${liveClass.courseId}-${liveClass.id}`}>
                    <TableCell className="font-medium">{liveClass.courseTitle}</TableCell>
                    <TableCell>{liveClass.topic}</TableCell>
                    <TableCell>
                        <Badge className={`${getPlatformBadgeColor(liveClass.platform)} text-white`}>
                            {liveClass.platform}
                        </Badge>
                    </TableCell>
                    <TableCell>{liveClass.date} at {liveClass.time}</TableCell>
                    <TableCell className="text-right">
                       <Button asChild>
                        <Link href={`/student/my-courses/${liveClass.courseId}/live-classes/${liveClass.id}`}>
                          <Video className="mr-2" />
                          Join Class
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                <Video className="w-12 h-12 mb-4 text-gray-400" />
                <p>You have no upcoming live classes scheduled.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
