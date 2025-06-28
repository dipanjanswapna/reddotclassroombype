
import { courses } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { HelpCircle, PlayCircle } from 'lucide-react';
import type { VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import type { Metadata } from 'next';


export const metadata: Metadata = {
  title: 'My Quizzes',
  description: 'A central hub for all your quizzes across all enrolled courses.',
};

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

// In a real app, this would be fetched based on the logged-in user.
// For now, we'll mock the student's enrolled courses.
const enrolledCourseIds = ['1', '3', '4'];
const getStudentQuizzes = () => {
    return courses
        .filter(course => enrolledCourseIds.includes(course.id))
        .flatMap(course => 
            (course.quizzes || []).map(quiz => ({
            ...quiz,
            courseId: course.id,
            courseTitle: course.title,
            }))
        );
}


export default function AllQuizzesPage() {
  const studentQuizzes = getStudentQuizzes();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Interactive Quizzes</h1>
        <p className="mt-1 text-lg text-muted-foreground">Test your knowledge across all your courses from one place.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Available Quizzes</CardTitle>
          <CardDescription>This list includes quizzes from all the courses you are currently enrolled in.</CardDescription>
        </CardHeader>
        <CardContent>
          {studentQuizzes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quiz</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentQuizzes.map((quiz) => (
                  <TableRow key={`${quiz.courseId}-${quiz.id}`}>
                    <TableCell className="font-medium">{quiz.title}</TableCell>
                    <TableCell>{quiz.courseTitle}</TableCell>
                    <TableCell>{quiz.topic}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusBadgeVariant(quiz.status)}>
                            {quiz.status} {quiz.status === 'Completed' && quiz.score && `(${quiz.score}%)`}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {quiz.status === 'Completed' ? (
                        <Button variant="outline" size="sm" asChild>
                           <Link href={`/student/my-courses/${quiz.courseId}/quizzes/${quiz.id}`}>
                                View Results
                           </Link>
                        </Button>
                      ) : (
                         <Button asChild size="sm">
                            <Link href={`/student/my-courses/${quiz.courseId}/quizzes/${quiz.id}`}>
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
                <p>You have no quizzes available in your enrolled courses.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
