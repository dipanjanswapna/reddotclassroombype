
import { notFound } from 'next/navigation';
import { getCourse } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { HelpCircle, PlayCircle } from 'lucide-react';
import type { VariantProps } from 'class-variance-authority';
import Link from 'next/link';

import { getCurrentUser } from '@/lib/firebase/auth'; // A helper we'll assume exists for server components
import type { QuizResult } from '@/lib/types';


const getStatusBadgeVariant = (status?: 'Completed' | 'Not Started'): VariantProps<typeof badgeVariants>['variant'] => {
  if (!status) return 'secondary';
  switch (status) {
    case 'Completed':
      return 'accent';
    default:
      return 'secondary';
  }
};

export default async function QuizzesPage({ params }: { params: { courseId: string } }) {
  const course = await getCourse(params.courseId);
  const user = await getCurrentUser();

  if (!course) {
    notFound();
  }

  const quizTemplates = course.quizTemplates || [];
  const quizResults = course.quizResults?.filter(r => r.studentId === user?.uid) || [];
  
  const resultsMap = new Map<string, QuizResult>(quizResults.map(r => [r.quizTemplateId, r]));

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
          {quizTemplates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quiz</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizTemplates.map((quiz) => {
                  const result = resultsMap.get(quiz.id);
                  const status = result ? 'Completed' : 'Not Started';
                  const score = result ? result.score : null;

                  return (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-medium">{quiz.title}</TableCell>
                    <TableCell>{quiz.topic}</TableCell>
                    <TableCell>{quiz.questions.length}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusBadgeVariant(status)}>
                            {status} {status === 'Completed' && score !== null && `(${score}%)`}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {status === 'Completed' ? (
                        <Button variant="outline" size="sm" asChild>
                           <Link href={`/student/my-courses/${course.id}/quizzes/${quiz.id}`}>
                                View Results
                           </Link>
                        </Button>
                      ) : (
                         <Button asChild size="sm">
                            <Link href={`/student/my-courses/${course.id}/quizzes/${quiz.id}`}>
                                <PlayCircle className="mr-2" />
                                Start Quiz
                            </Link>
                         </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )})}
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
