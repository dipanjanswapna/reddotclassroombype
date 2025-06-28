import { notFound } from 'next/navigation';
import { courses } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { FileText, Upload } from 'lucide-react';
import type { VariantProps } from 'class-variance-authority';
import Link from 'next/link';

const getStatusBadgeVariant = (status: 'Submitted' | 'Pending' | 'Graded' | 'Late'): VariantProps<typeof badgeVariants>['variant'] => {
  switch (status) {
    case 'Graded':
      return 'accent';
    case 'Submitted':
      return 'warning';
    case 'Late':
        return 'destructive';
    default:
      return 'secondary';
  }
};

export default function AssignmentsPage({ params }: { params: { courseId: string } }) {
  const course = courses.find((c) => c.id === params.courseId);

  if (!course) {
    notFound();
  }

  const assignments = course.assignments || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Assignments</h1>
        <p className="mt-1 text-lg text-muted-foreground">Submit your assignments for {course.title}.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Assignments</CardTitle>
          <CardDescription>Keep track of your assignments and deadlines.</CardDescription>
        </CardHeader>
        <CardContent>
          {assignments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.title}</TableCell>
                    <TableCell>{assignment.topic}</TableCell>
                    <TableCell>{assignment.deadline}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusBadgeVariant(assignment.status)}>
                            {assignment.status} {assignment.status === 'Graded' && assignment.grade && `(${assignment.grade})`}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       {assignment.status === 'Graded' ? (
                        <Button variant="outline" size="sm">
                           View Feedback
                        </Button>
                      ) : (
                         <Button asChild size="sm">
                            <Link href="#">
                                <Upload className="mr-2" />
                                Submit
                            </Link>
                         </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                <FileText className="w-12 h-12 mb-4 text-gray-400" />
                <p>There are no assignments available for this course at the moment.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
