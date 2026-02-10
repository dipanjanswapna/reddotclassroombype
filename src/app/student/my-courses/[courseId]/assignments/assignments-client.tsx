
'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { FileText, Upload, CheckCircle, MessageSquare, Clock, Calendar, ChevronRight } from 'lucide-react';
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
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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

  return (
     <>
        {assignments.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-muted/30">
                <TableRow className="border-primary/10">
                    <TableHead className="font-black uppercase tracking-widest text-[10px] px-6">Assignment Info</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Deadline</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Status</TableHead>
                    <TableHead className="text-right px-6 font-black uppercase tracking-widest text-[10px]">Action</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {assignments.map((assignment) => (
                    <TableRow key={`${assignment.id}-${assignment.studentId}`} className="border-primary/10 hover:bg-primary/5 transition-colors">
                    <TableCell className="px-6 py-5">
                        <p className="font-black text-sm uppercase tracking-tight">{assignment.title}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{assignment.topic}</p>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" />
                            {format(safeToDate(assignment.deadline), 'dd MMM yyyy')}
                        </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant={getStatusBadgeVariant(assignment.status)} className="font-black text-[9px] uppercase tracking-widest px-3 py-1">
                            {assignment.status} {assignment.status === 'Graded' && assignment.grade && `(${assignment.grade})`}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right px-6">
                        <Button 
                            size="sm" 
                            variant={assignment.status === 'Pending' ? 'default' : 'outline'}
                            className="rounded-xl font-black text-[9px] uppercase tracking-widest h-9 px-4"
                            onClick={() => handleOpenDialog(assignment)}
                        >
                            {assignment.status === 'Pending' ? <Upload className="mr-1.5 h-3.5 w-3.5" /> : <FileText className="mr-1.5 h-3.5 w-3.5" />}
                            {assignment.status === 'Pending' ? 'Submit' : 'View Details'}
                        </Button>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
          </div>
        ) : (
            <div className="text-center py-20 text-muted-foreground flex flex-col items-center">
              <FileText className="w-12 h-12 mb-4 text-primary/20" />
              <p className="font-black uppercase tracking-widest text-xs opacity-40">No assignments assigned yet</p>
          </div>
        )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-2xl rounded-[20px] border-primary/20">
              <DialogHeader>
                  <DialogTitle className="text-xl font-black uppercase tracking-tight">{selectedAssignment?.title}</DialogTitle>
                  <DialogDescription className="font-bold text-xs uppercase tracking-widest flex items-center gap-2 mt-1">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      Topic: {selectedAssignment?.topic} | Deadline: {selectedAssignment && format(safeToDate(selectedAssignment.deadline), 'PPP')}
                  </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {selectedAssignment?.status === 'Graded' && (
                    <Card className="bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 rounded-[20px] overflow-hidden shadow-lg">
                      <CardHeader className="bg-green-100/50 p-5 border-b border-green-200 dark:bg-green-900/40">
                        <CardTitle className="text-base font-black uppercase tracking-tight flex items-center gap-2 text-green-800 dark:text-green-300">
                            <CheckCircle className="w-5 h-5" /> Evaluation Result
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                         <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-green-700/60">Obtained Grade</span>
                            <Badge variant="accent" className="bg-green-600 text-white text-xl px-4 py-1.5 font-black rounded-xl">{selectedAssignment.grade}</Badge>
                         </div>
                         {selectedAssignment.feedback && (
                            <div className="space-y-2 pt-2 border-t border-green-200/50">
                                <p className="text-[10px] font-black uppercase tracking-widest text-green-700/60">Instructor Feedback</p>
                                <p className="text-sm font-medium leading-relaxed italic text-green-900 dark:text-green-100">{selectedAssignment.feedback}</p>
                            </div>
                         )}
                      </CardContent>
                    </Card>
                )}
                
                {(selectedAssignment?.status === 'Submitted' || selectedAssignment?.status === 'Late' || selectedAssignment?.status === 'Graded') && (
                     <div className="space-y-3">
                        <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Your Submission</Label>
                        <div className="p-5 border border-primary/10 rounded-[20px] bg-muted/30 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                            {submissionText || "No content provided."}
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground text-right italic uppercase tracking-tighter">
                            Submitted on {selectedAssignment && format(safeToDate(selectedAssignment.submissionDate), 'PPP p')}
                        </p>
                    </div>
                )}

                {selectedAssignment?.status === 'Pending' && (
                  <div className="space-y-4">
                      {new Date() > safeToDate(selectedAssignment.deadline) && (
                        <Alert variant="destructive" className="rounded-xl border-none bg-red-50 text-red-800">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="font-bold">This assignment is overdue. Late submissions are recorded.</AlertDescription>
                        </Alert>
                      )}
                      <div className="space-y-3">
                          <Label htmlFor="submission-content" className="font-black text-[10px] uppercase tracking-widest text-foreground ml-1">Submit Your Work</Label>
                          <Textarea 
                            id="submission-content" 
                            placeholder="Write or paste your answer here..." 
                            value={submissionText} 
                            onChange={e => setSubmissionText(e.target.value)} 
                            rows={10} 
                            className="rounded-[20px] border-primary/10 bg-white text-base font-medium shadow-inner p-5 focus:border-primary/50"
                          />
                      </div>
                  </div>
                )}
              </div>
              <DialogFooter className="border-t pt-4">
                  <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl font-bold uppercase text-[10px] tracking-widest">Close</Button>
                  {(selectedAssignment?.status === 'Pending' || (selectedAssignment?.status === 'Late' && selectedAssignment?.grade === undefined)) && (
                     <Button onClick={handleSubmission} disabled={isSubmitting || !submissionText.trim()} className="rounded-xl font-black uppercase text-[10px] tracking-widest h-11 px-8 shadow-xl shadow-primary/20">
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4"/>}
                        Submit Homework
                    </Button>
                  )}
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </>
  );
}
