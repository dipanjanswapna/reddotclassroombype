
import { notFound } from 'next/navigation';
import { courses } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { HelpCircle, PlayCircle } from 'lucide-react';
import type { VariantProps } from 'class-variance-authority';
import Link from 'next/link';

const getStatusBadgeVariant = (status: 'Completed' | 'Not Started' | 'In Progress'): VariantProps<typeof badgeVariants>['variant'] => {
  switch (status) {
    case 'Completed':
      return 'accent';
    case 'In Progress':
      return 'warning';
    default:
      return 'secondary';
  }
};

export default function QuizzesPage({ params }: { params: { courseId: string } }) {
  const course = courses.find((c) => c.id === params.courseId);

  if (!course) {
    notFound();
  }

  const quizzes = course.quizzes || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Quizzes</h1>
        <p className="mt-1 text-lg text-muted-foreground">Test your knowledge for {course.title}.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Quizzes</CardTitle>
          <CardDescription>Complete these quizzes to test your understanding of the course material.</CardDescription>
        </CardHeader>
        <CardContent>
          {quizzes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quiz</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizzes.map((quiz) => (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-medium">{quiz.title}</TableCell>
                    <TableCell>{quiz.topic}</TableCell>
                    <TableCell>{quiz.totalQuestions}</TableCell>
                    <TableCell>{quiz.duration} mins</TableCell>
                    <TableCell>
                        <Badge variant={getStatusBadgeVariant(quiz.status)}>
                            {quiz.status} {quiz.status === 'Completed' && quiz.score && `(${quiz.score}%)`}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {quiz.status === 'Completed' ? (
                        <Button variant="outline" size="sm" asChild>
                           <Link href={`/student/my-courses/${course.id}/quizzes/${quiz.id}`}>
                                View Results
                           </Link>
                        </Button>
                      ) : (
                         <Button asChild size="sm">
                            <Link href={`/student/my-courses/${course.id}/quizzes/${quiz.id}`}>
                                <PlayCircle className="mr-2" />
                                {quiz.status === 'In Progress' ? 'Continue Quiz' : 'Start Quiz'}
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
                <HelpCircle className="w-12 h-12 mb-4 text-gray-400" />
                <p>There are no quizzes available for this course at the moment.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
