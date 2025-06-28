
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge, badgeVariants } from '@/components/ui/badge';
import { CalendarClock, Clock } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Upcoming Deadlines",
  description: "Track all your upcoming assignment and quiz deadlines.",
};

const mockDeadlines = [
  { id: 1, course: 'HSC 2025 Crash Course', task: 'Physics Model Test 1', type: 'Quiz', due: '3 days', fullDate: '2024-07-28' },
  { id: 2, course: 'HSC 2025 Crash Course', task: 'Chemistry Assignment 2', type: 'Assignment', due: '5 days', fullDate: '2024-07-30' },
  { id: 3, course: 'IELTS Preparation Course', task: 'Speaking Practice Task', type: 'Assignment', due: '1 week', fullDate: '2024-08-02' },
  { id: 4, course: 'HSC 2025 Crash Course', task: 'Math Chapter 5 Quiz', type: 'Quiz', due: '10 days', fullDate: '2024-08-05' },
];

const getBadgeVariant = (type: 'Quiz' | 'Assignment') => {
    return type === 'Quiz' ? 'warning' : 'default';
};

export default function DeadlinesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Upcoming Deadlines</h1>
        <p className="mt-1 text-lg text-muted-foreground">
          Stay on top of your assignments and quizzes.
        </p>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>All Deadlines</CardTitle>
            <CardDescription>A list of all your upcoming deadlines across all courses.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Due In</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {mockDeadlines.map((deadline) => (
                        <TableRow key={deadline.id}>
                            <TableCell className="font-medium">{deadline.task}</TableCell>
                            <TableCell>{deadline.course}</TableCell>
                            <TableCell>
                                <Badge variant={getBadgeVariant(deadline.type as 'Quiz' | 'Assignment')}>{deadline.type}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>{deadline.due}</span>
                                    <span className="text-xs text-muted-foreground">({deadline.fullDate})</span>
                                </div>
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
