import { notFound } from 'next/navigation';
import { courses } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';

const mockLiveClasses = [
    { id: 'lc1', topic: 'Vector Advanced Problems', date: 'July 5, 2024', time: '8:00 PM', platform: 'Zoom' },
    { id: 'lc2', topic: 'Organic Chemistry Q&A', date: 'July 8, 2024', time: '8:00 PM', platform: 'Google Meet' },
    { id: 'lc3', topic: 'Calculus Final Review', date: 'July 12, 2024', time: '7:00 PM', platform: 'Facebook Live' },
];

export default function LiveClassesPage({ params }: { params: { courseId: string } }) {
  const course = courses.find((c) => c.id === params.courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Live Classes</h1>
        <p className="mt-1 text-lg text-muted-foreground">Join upcoming live sessions for {course.title}.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Live Class Schedule</CardTitle>
          <CardDescription>Don't miss out on these interactive sessions with your instructors.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Topic</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLiveClasses.map((liveClass) => (
                <TableRow key={liveClass.id}>
                  <TableCell className="font-medium">{liveClass.topic}</TableCell>
                  <TableCell>{liveClass.date} at {liveClass.time}</TableCell>
                  <TableCell className="text-right">
                    <Button>
                      <Video className="mr-2" />
                      Join Class
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
