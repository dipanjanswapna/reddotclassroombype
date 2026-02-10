
import { notFound } from 'next/navigation';
import { getCourse } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { HelpCircle, PlayCircle, Trophy, FileQuestion, ChevronRight } from 'lucide-react';
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
    <div className="space-y-10">
      <div className="flex flex-col gap-2 border-l-4 border-primary pl-4">
        <h1 className="font-headline text-3xl font-black tracking-tight uppercase">Practice <span className="text-primary">Quizzes</span></h1>
        <p className="text-muted-foreground font-medium">Test your knowledge and track your scores for {course.title}.</p>
      </div>

      <Card className="rounded-[20px] border-primary/20 shadow-xl overflow-hidden bg-card">
        <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
                <FileQuestion className="w-6 h-6 text-primary" />
            </div>
            <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">Knowledge Checks</CardTitle>
                <CardDescription className="font-medium text-xs">Self-assessment quizzes for each module.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {quizTemplates.length > 0 ? (
            <div className="overflow-x-auto">
                <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow className="border-primary/10">
                    <TableHead className="font-black uppercase tracking-widest text-[10px] px-6">Quiz Title</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Topic</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Questions</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Your Score</TableHead>
                    <TableHead className="text-right px-6 font-black uppercase tracking-widest text-[10px]">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {quizTemplates.map((quiz) => {
                    const result = resultsMap.get(quiz.id);
                    const status = result ? 'Completed' : 'Not Started';
                    const score = result ? result.score : null;

                    return (
                    <TableRow key={quiz.id} className="border-primary/10 hover:bg-primary/5 transition-colors">
                        <TableCell className="px-6 py-5">
                            <p className="font-black text-sm uppercase tracking-tight">{quiz.title}</p>
                            <Badge variant={getStatusBadgeVariant(status)} className="mt-1 text-[8px] uppercase tracking-tighter px-2 h-4">
                                {status}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase truncate max-w-[150px] inline-block">{quiz.topic}</span>
                        </TableCell>
                        <TableCell>
                            <span className="text-xs font-black">{quiz.questions.length} items</span>
                        </TableCell>
                        <TableCell>
                            {score !== null ? (
                                <div className="flex items-center gap-1.5">
                                    <Trophy className={cn("w-3.5 h-3.5", score >= 80 ? "text-yellow-500" : "text-primary/20")} />
                                    <span className="font-black text-sm text-foreground">{score}%</span>
                                </div>
                            ) : (
                                <span className="text-[10px] font-bold text-muted-foreground italic uppercase">N/A</span>
                            )}
                        </TableCell>
                        <TableCell className="text-right px-6">
                        {status === 'Completed' ? (
                            <Button variant="outline" size="sm" asChild className="rounded-xl h-9 font-black text-[9px] uppercase tracking-widest border-primary/10 hover:bg-primary/5">
                            <Link href={`/student/my-courses/${course.id}/quizzes/${quiz.id}`}>
                                    View Review <ChevronRight className="ml-1 h-3 w-3" />
                            </Link>
                            </Button>
                        ) : (
                            <Button asChild size="sm" className="rounded-xl h-9 font-black text-[9px] uppercase tracking-widest px-6 shadow-lg shadow-primary/20">
                                <Link href={`/student/my-courses/${course.id}/quizzes/${quiz.id}`}>
                                    <PlayCircle className="mr-1.5 h-3.5 w-3.5" /> Start Quiz
                                </Link>
                            </Button>
                        )}
                        </TableCell>
                    </TableRow>
                    )})}
                </TableBody>
                </Table>
            </div>
          ) : (
             <div className="text-center py-24 bg-muted/5 flex flex-col items-center">
                <HelpCircle className="w-12 h-12 text-primary/20 mb-4" />
                <p className="font-black uppercase tracking-widest text-xs opacity-40">No quizzes available for this course</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
