
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { getCourses, getInstructorByUid } from '@/lib/firebase/firestore';
import { gradeAssignmentAction, gradeExamAction } from '@/app/actions/grading.actions';
import type { Assignment, Exam } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileCheck2, Send, Loader2, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/context/auth-context';
import { format } from 'date-fns';
import { safeToDate } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type AssignmentWithCourseInfo = Assignment & {
  courseTitle: string;
  courseId: string;
};

type ExamWithCourseInfo = Exam & {
    courseTitle: string;
    courseId: string;
}

export default function TeacherGradingPage() {
  const { toast } = useToast();
  const { userInfo } = useAuth();
  const [pendingAssignments, setPendingAssignments] = useState<AssignmentWithCourseInfo[]>([]);
  const [pendingExams, setPendingExams] = useState<ExamWithCourseInfo[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isGrading, setIsGrading] = useState(false);
  
  // States for Assignment Dialog
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentWithCourseInfo | null>(null);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [assignmentGrade, setAssignmentGrade] = useState('');
  const [assignmentFeedback, setAssignmentFeedback] = useState('');

  // States for Exam Dialog
  const [selectedExam, setSelectedExam] = useState<ExamWithCourseInfo | null>(null);
  const [isExamDialogOpen, setIsExamDialogOpen] = useState(false);
  const [examMarks, setExamMarks] = useState(0);
  const [examGrade, setExamGrade] = useState('');
  const [examFeedback, setExamFeedback] = useState('');

  useEffect(() => {
    if (!userInfo) return;
    const fetchAssignments = async () => {
      try {
        const instructor = await getInstructorByUid(userInfo.uid);
        if (!instructor) {
            toast({ title: 'Error', description: 'Could not find your instructor profile.', variant: 'destructive' });
            setLoading(false);
            return;
        }

        const allCourses = await getCourses();
        const teacherCourses = allCourses.filter(c => 
          c.instructors?.some(i => i.slug === instructor.slug)
        );

        const assignmentsToGrade = teacherCourses.flatMap(course => 
          (course.assignments || []).filter(a => a.status === 'Submitted' || a.status === 'Late').map(assignment => ({
            ...assignment,
            courseTitle: course.title,
            courseId: course.id!,
          }))
        );

        const examsToGrade = teacherCourses.flatMap(course =>
            (course.exams || []).filter(e => e.status === 'Pending').map(exam => ({
                ...exam,
                courseTitle: course.title,
                courseId: course.id!,
            }))
        );

        setPendingAssignments(assignmentsToGrade);
        setPendingExams(examsToGrade);

      } catch (error) {
        console.error("Failed to fetch assignments:", error);
        toast({ title: 'Error', description: 'Could not fetch assignments.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [userInfo, toast]);


  const handleOpenAssignmentDialog = (assignment: AssignmentWithCourseInfo) => {
    setSelectedAssignment(assignment);
    setAssignmentGrade(assignment.grade || '');
    setAssignmentFeedback(assignment.feedback || '');
    setIsAssignmentDialogOpen(true);
  };
  
  const handleGradeAssignmentSubmit = async () => {
    if (!selectedAssignment) return;
    setIsGrading(true);

    const result = await gradeAssignmentAction(
      selectedAssignment.courseId,
      selectedAssignment.studentId,
      selectedAssignment.id,
      assignmentGrade,
      assignmentFeedback
    );

    if (result.success) {
      setPendingAssignments(prev => prev.filter(a => !(a.id === selectedAssignment.id && a.studentId === selectedAssignment.studentId)));
      toast({ title: "Grade Submitted!", description: `You have graded ${selectedAssignment.studentName}'s assignment.`});
      setIsAssignmentDialogOpen(false);
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
    setIsGrading(false);
  };

  const handleOpenExamDialog = (exam: ExamWithCourseInfo) => {
    setSelectedExam(exam);
    setExamMarks(exam.marksObtained || 0);
    setExamGrade(exam.grade || '');
    setExamFeedback(exam.feedback || '');
    setIsExamDialogOpen(true);
  };
  
  const handleGradeExamSubmit = async () => {
    if (!selectedExam) return;
    setIsGrading(true);

    const result = await gradeExamAction(
      selectedExam.courseId,
      selectedExam.studentId,
      selectedExam.id,
      examMarks,
      examGrade,
      examFeedback
    );

    if (result.success) {
      setPendingExams(prev => prev.filter(e => !(e.id === selectedExam.id && e.studentId === selectedExam.studentId)));
      toast({ title: "Exam Grade Submitted!", description: `You have graded ${selectedExam.studentName}'s exam.`});
      setIsExamDialogOpen(false);
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
    setIsGrading(false);
  };

  
  if (loading) {
    return (
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
            <LoadingSpinner className="w-12 h-12" />
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Assignment & Exam Grading
          </h1>
          <p className="mt-1 text-lg text-muted-foreground">
            Review and grade student submissions.
          </p>
        </div>
      </div>

        <Tabs defaultValue="assignments">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="assignments">Assignments ({pendingAssignments.length})</TabsTrigger>
                <TabsTrigger value="exams">Exams ({pendingExams.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="assignments">
                <Card>
                    <CardHeader>
                    <CardTitle>Pending Assignment Submissions</CardTitle>
                    <CardDescription>A list of all student assignments waiting for your review.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Assignment</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {pendingAssignments.length > 0 ? pendingAssignments.map((assignment) => (
                            <TableRow key={`${assignment.id}-${assignment.studentId}`}>
                            <TableCell className="font-medium">{assignment.studentName}</TableCell>
                            <TableCell>{assignment.courseTitle}</TableCell>
                            <TableCell>{assignment.title}</TableCell>
                            <TableCell>
                                {assignment.submissionDate ? format(safeToDate(assignment.submissionDate), 'PPP') : 'N/A'}
                                {assignment.status === 'Late' && <Badge variant="destructive" className="ml-2">Late</Badge>}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button onClick={() => handleOpenAssignmentDialog(assignment)}>
                                    <FileCheck2 className="mr-2 h-4 w-4"/> Grade
                                </Button>
                            </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                No pending assignments. Great job!
                            </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="exams">
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Exam Submissions</CardTitle>
                        <CardDescription>A list of all student exams waiting for your review.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Exam</TableHead>
                                    <TableHead>Exam Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                            {pendingExams.length > 0 ? pendingExams.map((exam) => (
                                <TableRow key={`${exam.id}-${exam.studentId}`}>
                                    <TableCell className="font-medium">{exam.studentName}</TableCell>
                                    <TableCell>{exam.courseTitle}</TableCell>
                                    <TableCell>{exam.title}</TableCell>
                                    <TableCell>{exam.examDate ? format(safeToDate(exam.examDate), 'PPP') : 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button onClick={() => handleOpenExamDialog(exam)}>
                                            <Award className="mr-2 h-4 w-4"/> Grade
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No pending exams to grade.
                                </TableCell>
                                </TableRow>
                            )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      
      <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Grade: {selectedAssignment?.title}</DialogTitle>
            <DialogDescription>
              For <strong>{selectedAssignment?.studentName}</strong> in course: {selectedAssignment?.courseTitle}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label className="font-semibold">Student's Submission</Label>
              <div className="mt-2 p-4 border rounded-md bg-muted text-sm">
                <p className="whitespace-pre-wrap">{selectedAssignment?.submissionText || "No submission text provided."}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="grade">Grade</Label>
                    <Input id="grade" value={assignmentGrade} onChange={e => setAssignmentGrade(e.target.value)} placeholder="e.g., A+ or 95%"/>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea id="feedback" value={assignmentFeedback} onChange={e => setAssignmentFeedback(e.target.value)} placeholder="Provide constructive feedback..." rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignmentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleGradeAssignmentSubmit} disabled={isGrading}>
                {isGrading && <Loader2 className="mr-2 animate-spin" />}
                <Send className="mr-2 h-4 w-4"/>Submit Grade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isExamDialogOpen} onOpenChange={setIsExamDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Grade Exam: {selectedExam?.title}</DialogTitle>
            <DialogDescription>
              For <strong>{selectedExam?.studentName}</strong> in course: {selectedExam?.courseTitle}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="marks">Marks Obtained</Label>
                    <Input id="marks" type="number" value={examMarks} onChange={e => setExamMarks(Number(e.target.value))} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="total-marks">Total Marks</Label>
                    <Input id="total-marks" value={selectedExam?.totalMarks || 0} disabled />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="exam-grade">Grade (Optional)</Label>
                <Input id="exam-grade" value={examGrade} onChange={e => setExamGrade(e.target.value)} placeholder="e.g., A+"/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="exam-feedback">Feedback (Optional)</Label>
                <Textarea id="exam-feedback" value={examFeedback} onChange={e => setExamFeedback(e.target.value)} placeholder="Provide constructive feedback..." rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExamDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleGradeExamSubmit} disabled={isGrading}>
                {isGrading && <Loader2 className="mr-2 animate-spin" />}
                <Send className="mr-2 h-4 w-4"/>Submit Result
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
