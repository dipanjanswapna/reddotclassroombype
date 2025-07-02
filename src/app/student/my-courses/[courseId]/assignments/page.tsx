
'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { getCourse } from '@/lib/firebase/firestore';
import type { Course, Assignment } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { FileText, Upload, CheckCircle, MessageSquare } from 'lucide-react';
import type { VariantProps } from 'class-variance-authority';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/loading-spinner';
import { submitAssignmentAction } from '@/app/actions/assignment.actions';
import { useAuth } from '@/context/auth-context';

const getStatusBadgeVariant = (status: Assignment['status']): VariantProps<typeof badgeVariants>['variant'] => {
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

export default function AssignmentsPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { toast } = useToast();
  const { userInfo } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submissionText, setSubmissionText] = useState('');

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId || !userInfo) return;
      try {
        const data = await getCourse(courseId);
        setCourse(data);
        if (data && data.assignments) {
          // Filter assignments for the current student
          const studentAssignments = data.assignments.filter(a => a.studentId === userInfo.uid);
          setAssignments(studentAssignments);
        }
      } catch (error) {
        console.error("Failed to fetch course data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId, userInfo]);
  
  const handleOpenDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionText(assignment.submissionText || '');
    setIsDialogOpen(true);
  }

  const handleSubmission = async () => {
    if (!selectedAssignment || !userInfo) return;

    const result = await submitAssignmentAction(
        courseId,
        selectedAssignment.id,
        userInfo.uid,
        submissionText
    );

    if (result.success) {
        setAssignments(prev => 
          prev.map(a => 
            a.id === selectedAssignment.id 
              ? { ...a, status: new Date() > new Date(a.deadline as string) ? 'Late' : 'Submitted', submissionDate: new Date().toISOString().split('T')[0], submissionText } 
              : a
          )
        );
        toast({
          title: 'Assignment Submitted!',
          description: `Your submission for "${selectedAssignment.title}" was successful.`,
        });
        setIsDialogOpen(false);
    } else {
        toast({
            title: 'Submission Failed',
            description: result.message,
            variant: 'destructive',
        });
    }
  };

  const getActionButton = (assignment: Assignment) => {
    switch (assignment.status) {
      case 'Graded':
      case 'Submitted':
        return <Button variant="outline" size="sm" onClick={() => handleOpenDialog(assignment)}>View Details</Button>;
      case 'Late':
        return <Button variant="destructive" size="sm" onClick={() => handleOpenDialog(assignment)}><Upload className="mr-2 h-4 w-4"/>Submit Late</Button>;
      case 'Pending':
      default:
        return <Button size="sm" onClick={() => handleOpenDialog(assignment)}><Upload className="mr-2 h-4 w-4"/>Submit</Button>;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-10rem)]">
          <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

  if (!course) {
    notFound();
  }

  return (
    <>
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
                      <TableCell>{assignment.deadline as string}</TableCell>
                      <TableCell>
                          <Badge variant={getStatusBadgeVariant(assignment.status)}>
                              {assignment.status} {assignment.status === 'Graded' && assignment.grade && `(${assignment.grade})`}
                          </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                         {getActionButton(assignment)}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                  <DialogTitle>{selectedAssignment?.title}</DialogTitle>
                  <DialogDescription>
                      Topic: {selectedAssignment?.topic} | Deadline: {selectedAssignment?.deadline as string}
                  </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-6">
                {selectedAssignment?.status === 'Graded' && (
                    <Card className="bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-green-800 dark:text-green-300"><CheckCircle /> Grade & Feedback</CardTitle>
                      </CardHeader>
                      <CardContent>
                         <p className="font-bold text-2xl">Grade: {selectedAssignment.grade}</p>
                         {selectedAssignment.feedback && (
                            <div className="mt-4">
                                <p className="font-semibold mb-2">Instructor's Feedback:</p>
                                <p className="text-sm text-muted-foreground p-3 bg-background rounded-md">{selectedAssignment.feedback}</p>
                            </div>
                         )}
                      </CardContent>
                    </Card>
                )}
                
                {(selectedAssignment?.status === 'Submitted' || selectedAssignment?.status === 'Late' || selectedAssignment?.status === 'Graded') && (
                     <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-amber-800 dark:text-amber-300"><MessageSquare /> Your Submission</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>You submitted this assignment on {selectedAssignment.submissionDate as string}.</p>
                        <p className="text-muted-foreground mt-2">{submissionText}</p>
                        {selectedAssignment.status !== 'Graded' && <p className="text-muted-foreground mt-2">Waiting for instructor's feedback.</p>}
                      </CardContent>
                    </Card>
                )}

                {(selectedAssignment?.status === 'Pending' || (selectedAssignment?.status === 'Late' && selectedAssignment?.grade === undefined)) && (
                  <div className="space-y-4">
                      {selectedAssignment.status === 'Late' && (
                        <p className="text-destructive font-semibold">This assignment is past its deadline. You can still submit it, but it will be marked as late.</p>
                      )}
                      <div className="space-y-2">
                          <Label htmlFor="submission-comments">Your Submission</Label>
                          <Textarea id="submission-comments" placeholder="Paste your submission text here..." value={submissionText} onChange={e => setSubmissionText(e.target.value)} rows={8} />
                      </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>
                  {(selectedAssignment?.status === 'Pending' || (selectedAssignment?.status === 'Late' && selectedAssignment?.grade === undefined)) && (
                     <Button onClick={handleSubmission}>
                        <Upload className="mr-2 h-4 w-4"/>
                        Submit Assignment
                    </Button>
                  )}
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </>
  );
}
