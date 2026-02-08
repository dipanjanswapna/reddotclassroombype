import { notFound } from 'next/navigation';
import { getCourse } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { HelpCircle, PlayCircle } from 'lucide-react';
import type { VariantProps } from 'class-variance-authority';
import Link from 'next/link';

import { getCurrentUser } from '@/lib/firebase/auth';
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

export default async function QuizzesPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = await getCourse(courseId);
  const user = await getCurrentUser();

  if (!course) {
    notFound();
  }

  const quizTemplates = course.quizTemplates || [];
  const quizResults = course.quizResults?.filter(r => r.studentId === user?.uid) || [];
  
  const resultsMap = new Map<string, QuizResult>(quizResults.map(r => [r.quizTemplateId, r]));

  return (
    <div className="space-y-10 md:space-y-14">
      <div className="text-center sm:text-left space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">Interactive Quizzes</h1>
        <p className="text-lg text-muted-foreground font-medium break-words">Test your knowledge for {course.title}.</p>
        <div className="h-1.5 w-24 bg-primary rounded-full mx-auto sm:mx-0 shadow-md" />
      </div>

      <Card className="rounded-2xl border-primary/10 shadow-xl overflow-hidden">
        <CardHeader className="p-6 md:p-8 border-b border-primary/5 bg-muted/30 text-center md:text-left">
          <CardTitle className="font-black uppercase tracking-tight text-lg">Available Assessments</CardTitle>
          <CardDescription className="font-medium">Complete these quizzes to test your understanding of the course material.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {quizTemplates.length > 0 ? (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="px-6 md:px-8 font-black uppercase text-[10px] tracking-widest">Quiz</TableHead>
                  <TableHead className="px-6 md:px-8 font-black uppercase text-[10px] tracking-widest">Topic</TableHead>
                  <TableHead className="px-6 md:px-8 font-black uppercase text-[10px] tracking-widest text-right md:text-left">Status</TableHead>
                  <TableHead className="px-6 md:px-8 text-right font-black uppercase text-[10px] tracking-widest">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-primary/5">
                {quizTemplates.map((quiz) => {
                  const result = resultsMap.get(quiz.id);
                  const status = result ? 'Completed' : 'Not Started';
                  const score = result ? result.score : null;

                  return (
                  <TableRow key={quiz.id} className="hover:bg-primary/5 transition-colors">
                    <TableCell className="px-6 md:px-8 py-6 font-bold truncate max-w-[150px] md:max-w-xs">{quiz.title}</TableCell>
                    <TableCell className="px-6 md:px-8 py-6 font-medium text-muted-foreground truncate max-w-[150px] md:max-w-xs">{quiz.topic}</TableCell>
                    <TableCell className="px-6 md:px-8 py-6 text-right md:text-left">
                        <Badge variant={getStatusBadgeVariant(status)} className="font-black text-[9px] md:text-[10px] uppercase tracking-widest rounded-lg whitespace-nowrap">
                            {status} {status === 'Completed' && score !== null && `(${score}%)`}
                        </Badge>
                    </TableCell>
                    <TableCell className="px-6 md:px-8 py-6 text-right">
                      {status === 'Completed' ? (
                        <Button variant="outline" size="sm" asChild className="rounded-lg font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-sm">
                           <Link href={`/student/my-courses/${course.id}/quizzes/${quiz.id}`}>
                                View Results
                           </Link>
                        </Button>
                      ) : (
                         <Button asChild size="sm" className="rounded-lg font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                            <Link href={`/student/my-courses/${course.id}/quizzes/${quiz.id}`}>
                                <PlayCircle className="mr-2 h-4 w-4" />
                                Start
                            </Link>
                         </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )})}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center py-20 text-muted-foreground flex flex-col items-center px-6">
                <HelpCircle className="w-16 h-16 mb-4 text-primary/20" />
                <p className="text-xl font-bold">Assessments coming soon</p>
                <p className="text-sm font-medium mt-1">There are no quizzes available for this course at the moment.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}