

'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { getCourse } from '@/lib/firebase/firestore';
import type { Course, Exam, ExamTemplate, Question } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, ArrowLeft, ArrowRight, Flag, FileText, Loader2, MessageSquare } from 'lucide-react';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { submitMcqExamAction, submitWrittenExamAction } from '@/app/actions/grading.actions';
import { Textarea } from '@/components/ui/textarea';

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

  // MCQ state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({}); // { questionId: optionId }
  
  // Written state
  const [submissionText, setSubmissionText] = useState('');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState<{ score: number; totalMarks: number } | null>(null);

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

            if (studentExamData.status === 'Graded' || studentExamData.status === 'Submitted') {
                setIsSubmitted(true);
                setSubmissionText(studentExamData.submissionText || '');
                if (studentExamData.status === 'Graded') {
                    setFinalScore({ score: studentExamData.marksObtained || 0, totalMarks: templateData.totalMarks });
                    setSelectedAnswers(studentExamData.answers || {});
                }
            }

        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }
    fetchExamData();
  }, [courseId, examId, userInfo]);

  const handleSubmit = async () => {
    if (!userInfo || !examTemplate) return;
    
    setLoading(true);
    try {
        if (examTemplate.examType === 'MCQ') {
            const result = await submitMcqExamAction(courseId, userInfo.uid, examId, selectedAnswers);
            if (result.success) {
                toast({ title: "Exam Submitted!", description: "Your exam has been graded." });
                setFinalScore({ score: result.score!, totalMarks: result.totalMarks! });
                setIsSubmitted(true);
            } else {
                throw new Error(result.message);
            }
        } else if (examTemplate.examType === 'Written') {
            const result = await submitWrittenExamAction(courseId, userInfo.uid, examId, submissionText);
            if (result.success) {
                toast({ title: "Submission Successful!", description: "Your written exam has been submitted for grading."});
                setIsSubmitted(true);
                // Manually update local state to show the submitted view
                setExam(prev => prev ? ({...prev, status: 'Submitted', submissionText}) : null);
            } else {
                throw new Error(result.message);
            }
        }
    } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

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
  
  // MCQ specific logic
  const questions = examTemplate.questions || [];
  const handleSelectAnswer = (questionId: string, optionId: string) => { setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId })); };
  const handleNext = () => { if (currentQuestionIndex < questions.length - 1) { setCurrentQuestionIndex(currentQuestionIndex + 1); } };
  const handlePrev = () => { if (currentQuestionIndex > 0) { setCurrentQuestionIndex(currentQuestionIndex - 1); } };
  const currentQuestion = questions[currentQuestionIndex];

  if (isSubmitted) {
     return examTemplate.examType === 'MCQ' ? (
        <div className="max-w-4xl mx-auto">
             <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">Exam Results</CardTitle>
                    <CardDescription>{examTemplate.title} - {course.title}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
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
                {questions.map((q, index) => {
                     const userAnswerId = selectedAnswers[q.id];
                     const isCorrect = userAnswerId === q.correctAnswerId;
                     return (
                         <Card key={q.id} className={cn(isCorrect ? 'border-green-300' : 'border-red-300')}>
                             <CardHeader><CardTitle className="text-lg flex justify-between items-center"><span>Question {index + 1}: {q.text}</span>{isCorrect ? <Badge variant="accent" className="bg-green-100 text-green-800">Correct</Badge> : <Badge variant="destructive">Incorrect</Badge>}</CardTitle></CardHeader>
                             <CardContent className="space-y-2">
                                 {q.options.map((option) => (
                                    <div key={option.id} className={cn(
                                        "flex items-center gap-2 p-3 rounded-md border",
                                        q.correctAnswerId === option.id && "bg-green-100 border-green-300 text-green-900",
                                        userAnswerId === option.id && userAnswerId !== q.correctAnswerId && "bg-red-100 border-red-300 text-red-900 line-through"
                                    )}>
                                        {q.correctAnswerId === option.id ? <CheckCircle className="w-5 h-5"/> : userAnswerId === option.id ? <XCircle className="w-5 h-5"/> : <div className="w-5 h-5"/>}
                                        <p>{option.text}</p>
                                    </div>
                                 ))}
                             </CardContent>
                         </Card>
                     )
                 })}
             </div>
        </div>
    ) : (
         <div className="max-w-4xl mx-auto">
             <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">Exam Submitted</CardTitle>
                    <CardDescription>{examTemplate.title} - {course.title}</CardDescription>
                </CardHeader>
                <CardContent>
                    {exam.status === 'Submitted' && (
                        <div className="text-center p-8 bg-muted rounded-md">
                            <p className="font-semibold">Your submission is waiting for grading.</p>
                            <p className="text-sm text-muted-foreground">You will be notified once your instructor has graded your exam.</p>
                        </div>
                    )}
                     {exam.status === 'Graded' && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <p className="text-lg">You scored:</p>
                                <p className="text-6xl font-bold text-primary my-2">{exam.marksObtained} / {exam.totalMarks}</p>
                                <p className="text-muted-foreground">Grade: {exam.grade}</p>
                            </div>
                             <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><MessageSquare/> Instructor's Feedback</CardTitle></CardHeader>
                                <CardContent><p className="whitespace-pre-wrap">{exam.feedback || "No feedback provided."}</p></CardContent>
                            </Card>
                        </div>
                    )}
                    <Card className="mt-4">
                        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><FileText /> Your Submission</CardTitle></CardHeader>
                        <CardContent><p className="whitespace-pre-wrap p-4 bg-muted rounded-md">{submissionText}</p></CardContent>
                    </Card>
                </CardContent>
                <CardFooter>
                    <Button onClick={() => router.back()} className="w-full">Back to Exams</Button>
                </CardFooter>
             </Card>
         </div>
    );
  }

  // Exam Taking UI
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{examTemplate.title}</CardTitle>
          <CardDescription>{course.title}</CardDescription>
          {examTemplate.examType === 'MCQ' && (
            <div className="pt-2">
              <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} />
              <p className="text-sm text-muted-foreground mt-2">Question {currentQuestionIndex + 1} of {questions.length}</p>
            </div>
          )}
        </CardHeader>
        <CardContent>
            {examTemplate.examType === 'MCQ' && currentQuestion && (
                <div className="space-y-6">
                    <p className="text-lg font-semibold">{currentQuestion.text}</p>
                    <RadioGroup value={selectedAnswers[currentQuestion.id] || ''} onValueChange={(value) => handleSelectAnswer(currentQuestion.id, value)} className="space-y-2">
                        {currentQuestion.options.map((option) => (
                            <Label key={option.id} className="flex items-center gap-3 p-4 border rounded-md cursor-pointer has-[:checked]:bg-muted has-[:checked]:border-primary transition-colors">
                                <RadioGroupItem value={option.id} id={option.id} />
                                <span className="text-base">{option.text}</span>
                            </Label>
                        ))}
                    </RadioGroup>
                </div>
            )}
            {examTemplate.examType === 'Written' && (
                 <div className="space-y-2">
                    <Label htmlFor="submissionText" className="font-semibold">Your Answer</Label>
                    <Textarea
                        id="submissionText"
                        placeholder="Write your answer here..."
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        rows={15}
                    />
                </div>
            )}
        </CardContent>
        <CardFooter className="flex justify-between">
            {examTemplate.examType === 'MCQ' ? (
                <>
                    <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0}><ArrowLeft className="mr-2" /> Previous</Button>
                    {currentQuestionIndex < questions.length - 1 ? (
                        <Button onClick={handleNext}>Next <ArrowRight className="ml-2" /></Button>
                    ) : (
                        <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="accent"><Flag className="mr-2"/> Finish & Submit</Button></AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle><AlertDialogDescription>You cannot change your answers after submitting.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Review Answers</AlertDialogCancel><AlertDialogAction onClick={handleSubmit}>Submit Exam</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </>
            ) : (
                 <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="accent" className="w-full"><Flag className="mr-2"/> Submit Written Exam</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>You will not be able to edit your submission after this.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleSubmit}>Yes, Submit</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
