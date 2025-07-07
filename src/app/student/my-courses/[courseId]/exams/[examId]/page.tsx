
'use client';

import { useState, useEffect, useCallback } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { getCourse } from '@/lib/firebase/firestore';
import type { Course, Exam, ExamTemplate, Question } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, ArrowLeft, ArrowRight, Flag, Clock, FileText, Mic, Beaker } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { submitMcqExamAction, submitWrittenExamAction } from '@/app/actions/grading.actions';
import { Textarea } from '@/components/ui/textarea';

const formatTime = (seconds: number | null): string => {
    if (seconds === null) return '...';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function ExamTakingPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { userInfo } = useAuth();
  const courseId = params.courseId as string;
  const examId = params.examId as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [examTemplate, setExamTemplate] = useState<ExamTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  // MCQ State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({}); // { questionId: optionId }
  
  // Written Exam State
  const [writtenSubmission, setWrittenSubmission] = useState('');

  // General State
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState<{ score: number; totalMarks: number } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showSubmitWarning, setShowSubmitWarning] = useState(false);

  const handleSubmit = useCallback(async (isAutoSubmit = false) => {
    if (!userInfo || !examTemplate) return;
    if (!isAutoSubmit) setShowSubmitWarning(false);
    
    setLoading(true);

    try {
        if (examTemplate.examType === 'MCQ') {
            const result = await submitMcqExamAction(courseId, examId, userInfo.uid, selectedAnswers);
            if (result.success) {
                toast({ title: "Exam Submitted!", description: "Your exam has been graded." });
                setFinalScore({ score: result.score!, totalMarks: result.totalMarks! });
                setIsSubmitted(true);
            } else {
                throw new Error(result.message);
            }
        } else if (examTemplate.examType === 'Written') {
            const result = await submitWrittenExamAction(courseId, userInfo.uid, examId, writtenSubmission);
            if (result.success) {
                toast({ title: "Submission Successful!", description: result.message });
                setExam(prev => prev ? ({ ...prev, status: 'Submitted', submissionText: writtenSubmission }) : null);
                setIsSubmitted(true); // Treat as submitted for review
            } else {
                throw new Error(result.message);
            }
        }
        localStorage.removeItem(`exam-timer-${examId}`);
    } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }, [courseId, examId, userInfo, selectedAnswers, toast, examTemplate, writtenSubmission]);

  useEffect(() => {
    if (!examTemplate?.duration || exam?.status === 'Graded' || exam?.status === 'Submitted') return;

    const examEndTimeKey = `exam-timer-${examId}`;
    let endTimeString = localStorage.getItem(examEndTimeKey);

    if (!endTimeString) {
        const newEndTime = Date.now() + examTemplate.duration * 60 * 1000;
        localStorage.setItem(examEndTimeKey, newEndTime.toString());
        endTimeString = newEndTime.toString();
    }
    
    const endTime = parseInt(endTimeString, 10);

    const interval = setInterval(() => {
        const remaining = endTime - Date.now();
        if (remaining <= 0) {
            clearInterval(interval);
            setTimeLeft(0);
            toast({
                title: "Time's Up!",
                description: "Your exam is being submitted automatically.",
                variant: 'destructive',
            });
            handleSubmit(true);
        } else {
            setTimeLeft(Math.floor(remaining / 1000));
        }
    }, 1000);

    return () => clearInterval(interval);
  }, [examTemplate, exam, examId, handleSubmit, toast]);


  useEffect(() => {
    if (!userInfo) return;
    async function fetchExamData() {
        try {
            const courseData = await getCourse(courseId);
            if (!courseData) return notFound();
            setCourse(courseData);
            
            const studentExamData = courseData.exams?.find(e => e.id === examId && e.studentId === userInfo.uid);
            if (!studentExamData) return notFound();
            setExam(studentExamData);
            
            const templateId = examId.split('-')[0];
            const templateData = courseData.examTemplates?.find(et => et.id === templateId);
            if (!templateData) return notFound();
            setExamTemplate(templateData);

            if (studentExamData.status === 'Graded') {
                setIsSubmitted(true);
                setFinalScore({ score: studentExamData.marksObtained || 0, totalMarks: templateData.totalMarks });
            } else if (studentExamData.status === 'Submitted') {
                setIsSubmitted(true);
                setWrittenSubmission(studentExamData.submissionText || '');
            }

        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }
    fetchExamData();
  }, [courseId, examId, userInfo]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-10rem)]">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }
  
  if (!course || !exam || !examTemplate) {
    return notFound();
  }
  
  const questions = examTemplate.questions || [];

  const handleSelectAnswer = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const currentQuestion = questions[currentQuestionIndex];
  
  const renderExamInfo = () => {
    let Icon = FileText;
    if (examTemplate.examType === 'Oral') Icon = Mic;
    if (examTemplate.examType === 'Practical') Icon = Beaker;
    
    return (
        <div className="max-w-4xl mx-auto">
            <Card>
                <CardHeader className="text-center">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-3xl font-bold">{examTemplate.examType} Exam</CardTitle>
                    <CardDescription>{examTemplate.title} - {course.title}</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-lg">This is a manually graded {examTemplate.examType.toLowerCase()} exam.</p>
                    <p className="text-muted-foreground">No online submission is required. Please follow your instructor's guidelines for this assessment. Your instructor will grade your performance after the assessment is complete.</p>
                     {exam.status === 'Graded' && finalScore && (
                       <div className="pt-4 border-t">
                           <p className="text-lg font-semibold">Your Result:</p>
                           <p className="text-5xl font-bold text-primary my-2">{finalScore.score} / {finalScore.totalMarks}</p>
                           <p className="text-muted-foreground">({((finalScore.score / finalScore.totalMarks) * 100).toFixed(2)}%)</p>
                           {exam.feedback && <p className="mt-2 text-sm text-muted-foreground"><strong>Feedback:</strong> {exam.feedback}</p>}
                       </div>
                   )}
                </CardContent>
            </Card>
        </div>
    );
  };


  if (isSubmitted) {
    return (
        <div className="max-w-4xl mx-auto">
             <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">Exam Results</CardTitle>
                    <CardDescription>{examTemplate.title} - {course.title}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                   {examTemplate.examType === 'Written' && exam.status === 'Submitted' && (
                       <div className="text-lg font-semibold">Your submission is awaiting review.</div>
                   )}
                   {finalScore && (
                       <>
                           <p className="text-lg">You scored:</p>
                           <p className="text-6xl font-bold text-primary my-2">{finalScore.score} / {finalScore.totalMarks}</p>
                           <p className="text-muted-foreground">({((finalScore.score / finalScore.totalMarks) * 100).toFixed(2)}%)</p>
                       </>
                   )}
                </CardContent>
             </Card>
             <div className="mt-8 space-y-4">
                <h3 className="text-2xl font-bold">Review Your Submission</h3>
                {examTemplate.examType === 'MCQ' && questions.map((q, index) => {
                     const userAnswerId = selectedAnswers[q.id];
                     const isCorrect = userAnswerId === q.correctAnswerId;
                     return (
                         <Card key={q.id} className={cn(isCorrect ? 'border-green-300' : 'border-red-300')}>
                             <CardHeader><CardTitle className="text-lg flex justify-between items-center"><span>Question {index + 1}: {q.text}</span>{isCorrect ? <Badge variant="accent" className="bg-green-100 text-green-800">Correct</Badge> : <Badge variant="destructive">Incorrect</Badge>}</CardTitle></CardHeader>
                             <CardContent className="space-y-2">
                                 {q.options.map((option) => (<div key={option.id} className={cn("flex items-center gap-2 p-3 rounded-md border", q.correctAnswerId === option.id && "bg-green-100 border-green-300 text-green-900", userAnswerId === option.id && userAnswerId !== q.correctAnswerId && "bg-red-100 border-red-300 text-red-900 line-through")}>{q.correctAnswerId === option.id ? <CheckCircle className="w-5 h-5"/> : userAnswerId === option.id ? <XCircle className="w-5 h-5"/> : <div className="w-5 h-5"/>}<p>{option.text}</p></div>))}
                             </CardContent>
                         </Card>
                     )
                 })}
                 {examTemplate.examType === 'Written' && (
                     <Card>
                         <CardHeader><CardTitle>Your Answer Script</CardTitle></CardHeader>
                         <CardContent className="whitespace-pre-wrap bg-muted p-4 rounded-md">{exam.submissionText}</CardContent>
                         {exam.status === 'Graded' && (
                             <CardFooter className="flex-col items-start pt-4">
                                <h4 className="font-semibold">Instructor's Feedback:</h4>
                                <p className="text-muted-foreground mt-2">{exam.feedback || "No feedback provided."}</p>
                             </CardFooter>
                         )}
                     </Card>
                 )}
             </div>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-2xl">{examTemplate.title}</CardTitle>
                    <CardDescription>{course.title}</CardDescription>
                </div>
                {timeLeft !== null && (
                    <div className={cn("text-right p-2 rounded-lg transition-colors", timeLeft <= 300 ? "bg-destructive/10 text-destructive" : "bg-muted")}><p className="text-sm font-medium flex items-center gap-1.5"><Clock className="w-4 h-4"/>Time Left</p><p className="text-2xl font-bold font-mono">{formatTime(timeLeft)}</p></div>
                )}
            </div>
          {examTemplate.examType === 'MCQ' && (
            <div className="pt-2">
                <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} />
                <p className="text-sm text-muted-foreground mt-2">Question {currentQuestionIndex + 1} of {questions.length}</p>
            </div>
          )}
        </CardHeader>
        <CardContent>
            {examTemplate.examType === 'MCQ' && (
                <div className="space-y-6">
                    <p className="text-lg font-semibold">{currentQuestion.text}</p>
                    <RadioGroup value={selectedAnswers[currentQuestion.id] || ''} onValueChange={(value) => handleSelectAnswer(currentQuestion.id, value)} className="space-y-2">
                        {currentQuestion.options.map((option) => (<Label key={option.id} className="flex items-center gap-3 p-4 border rounded-md cursor-pointer has-[:checked]:bg-muted has-[:checked]:border-primary transition-colors"><RadioGroupItem value={option.id} id={option.id} /><span className="text-base">{option.text}</span></Label>))}
                    </RadioGroup>
                </div>
            )}
            {examTemplate.examType === 'Written' && (
                <div className="space-y-4">
                    <Label htmlFor="written-submission" className="text-lg font-semibold">Your Answer Script</Label>
                    <Textarea id="written-submission" value={writtenSubmission} onChange={(e) => setWrittenSubmission(e.target.value)} rows={20} placeholder="Start writing your answers here..." />
                </div>
            )}
            {(examTemplate.examType === 'Oral' || examTemplate.examType === 'Practical') && (
                renderExamInfo()
            )}
        </CardContent>
        {(examTemplate.examType === 'MCQ' || examTemplate.examType === 'Written') && (
            <CardFooter className="flex justify-between">
                {examTemplate.examType === 'MCQ' ? (
                    <>
                        <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0}><ArrowLeft className="mr-2" /> Previous</Button>
                        {currentQuestionIndex < questions.length - 1 ? (<Button onClick={handleNext}>Next <ArrowRight className="ml-2" /></Button>) : (
                            <AlertDialog open={showSubmitWarning} onOpenChange={setShowSubmitWarning}>
                                <AlertDialogTrigger asChild><Button variant="accent" onClick={() => setShowSubmitWarning(true)}><Flag className="mr-2"/> Finish & Submit</Button></AlertDialogTrigger>
                                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle><AlertDialogDescription>You cannot change your answers after submitting. Please review your answers before proceeding.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Review Answers</AlertDialogCancel><AlertDialogAction onClick={() => handleSubmit(false)}>Submit Exam</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                            </AlertDialog>
                        )}
                    </>
                ) : (
                    <AlertDialog open={showSubmitWarning} onOpenChange={setShowSubmitWarning}>
                        <AlertDialogTrigger asChild><Button variant="accent" className="w-full" onClick={() => setShowSubmitWarning(true)}><Flag className="mr-2"/> Submit for Grading</Button></AlertDialogTrigger>
                        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle><AlertDialogDescription>You cannot change your answers after submitting.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleSubmit(false)}>Submit Exam</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                    </AlertDialog>
                )}
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
