
'use client';

import { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { courses, allInstructors, Assignment, Course } from '@/lib/mock-data';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileCheck2, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const teacherId = 'ins-ja'; // Mock teacher ID

// Flatten assignments from all courses taught by the teacher
const getInitialAssignments = () => {
    const teacherCourses = courses.filter(c => 
        c.instructors.some(i => i.id === teacherId)
    );
    return teacherCourses.flatMap(course => 
        (course.assignments || []).map(assignment => ({
            ...assignment,
            courseTitle: course.title,
            courseId: course.id,
        }))
    );
};


export default function TeacherGradingPage() {
  const { toast } = useToast();
  const [allAssignments, setAllAssignments] = useState(getInitialAssignments());
  const [selectedAssignment, setSelectedAssignment] = useState<(Assignment & { courseTitle: string }) | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state for grading dialog
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');

  const pendingAssignments = allAssignments.filter(a => a.status === 'Submitted' || a.status === 'Late');

  const handleOpenDialog = (assignment: Assignment & { courseTitle: string }) => {
    setSelectedAssignment(assignment);
    setGrade(assignment.grade || '');
    setFeedback(assignment.feedback || '');
    setIsDialogOpen(true);
  };
  
  const handleGradeSubmit = () => {
    if (!selectedAssignment) return;

    setAllAssignments(prev => prev.map(a => 
      a.id === selectedAssignment.id ? 
      { ...a, status: 'Graded', grade, feedback } : a
    ));

    toast({ title: "Grade Submitted!", description: `You have graded ${selectedAssignment.studentName}'s assignment.`});
    setIsDialogOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Assignment Grading
          </h1>
          <p className="mt-1 text-lg text-muted-foreground">
            Review and grade student submissions.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Submissions</CardTitle>
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
                      {assignment.submissionDate}
                      {assignment.status === 'Late' && <Badge variant="destructive" className="ml-2">Late</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button onClick={() => handleOpenDialog(assignment)}>
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
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                <p>{selectedAssignment?.submissionText || "No submission text provided."}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="grade">Grade</Label>
                    <Input id="grade" value={grade} onChange={e => setGrade(e.target.value)} placeholder="e.g., A+ or 95%"/>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea id="feedback" value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Provide constructive feedback..." rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleGradeSubmit}><Send className="mr-2 h-4 w-4"/>Submit Grade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
