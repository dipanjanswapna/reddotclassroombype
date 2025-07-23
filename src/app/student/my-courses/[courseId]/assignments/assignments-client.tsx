
'use client';

import { useState, useEffect } from 'react';
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
import { submitAssignmentAction } from '@/app/actions/assignment.actions';
import { useAuth } from '@/context/auth-context';
import type { Course, Assignment } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { safeToDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

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

interface AssignmentsClientProps {
  course: Course;
  initialAssignments: Assignment[];
}

export function AssignmentsClient({ course, initialAssignments }: AssignmentsClientProps) {
  const { toast } = useToast();
  const { userInfo } = useAuth();
  
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userInfo) {
      const studentAssignments = initialAssignments.filter(a => a.studentId === userInfo.uid);
      setAssignments(studentAssignments);
    }
  }, [initialAssignments, userInfo]);

  const handleOpenDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionText(assignment.submissionText || '');
    setIsDialogOpen(true);
  }

  const handleSubmission = async () => {
    if (!selectedAssignment || !userInfo || !course.id) return;

    setIsSubmitting(true);
    const result = await submitAssignmentAction(
        course.id,
        selectedAssignment.id,
        userInfo.uid,
        submissionText
    );

    if (result.success) {
        setAssignments(prev => 
          prev.map(a => 
            a.id === selectedAssignment.id 
              ? { ...a, status: new Date() > safeToDate(a.deadline) ? 'Late' : 'Submitted', submissionDate: new Date().toISOString().split('T')[0], submissionText } 
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
    setIsSubmitting(false);
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

  return (
     <>
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
                <TableRow key={`${assignment.id}-${assignment.studentId}`}>
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
                     <Button onClick={handleSubmission} disabled={isSubmitting}>
                        {isSubmitting ? <LoadingSpinner /> : <Upload className="mr-2 h-4 w-4"/>}
                        Submit Assignment
                    </Button>
                  )}
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </>
  );
}
