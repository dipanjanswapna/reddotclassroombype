

'use client';

import { useState, useEffect, useRef } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { getCourse } from '@/lib/firebase/firestore';
import type { Course, Exam, ExamTemplate, Question } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, ArrowLeft, ArrowRight, Flag, FileText, Loader2, MessageSquare, AlertTriangle, Camera } from 'lucide-react';
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
import { Alert, AlertTitle } from '@/components/ui/alert';

const ProctoringView = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasPermission, setHasPermission] = useState(true);

    useEffect(() => {
        const getCameraPermission = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error("Camera access denied:", error);
                setHasPermission(false);
            }
        };
        getCameraPermission();
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    if (!hasPermission) {
        return (
            <div className="fixed bottom-4 right-4 w-40 h-32 bg-destructive text-destructive-foreground rounded-lg p-2 text-xs flex flex-col items-center justify-center">
                <AlertTriangle className="w-6 h-6 mb-1"/>
                <p>Camera access denied. Proctoring is disabled.</p>
            </div>
        )
    }

    return (
        <div className="fixed bottom-4 right-4 w-40 h-32 bg-black rounded-lg shadow-2xl border-2 border-primary overflow-hidden">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            <div className="absolute top-1 left-1 bg-destructive text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                REC
            </div>
        </div>
    );
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

  // MCQ state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({}); // { questionId: optionId }
  
  // Written state
  const [submissionText, setSubmissionText] = useState('');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState<{ score: number; totalMarks: number } | null>(null);

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const [checkingPermission, setCheckingPermission] = useState(true);
  
  useEffect(() => {
    async function checkCameraPermission() {
        if (!navigator.mediaDevices?.getUserMedia) {
            setCheckingPermission(false);
            setHasCameraPermission(false);
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop()); // Release camera immediately
            setHasCameraPermission(true);
        } catch (error) {
            setHasCameraPermission(false);
        } finally {
            setCheckingPermission(false);
        }
    }
    checkCameraPermission();
  }, []);

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
            } else if (templateData.duration) {
                setTimeLeft(templateData.duration * 60);
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
    setTimeLeft(null); // Stop the timer

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

   useEffect(() => {
    if (timeLeft === null || isSubmitted) return;
    if (timeLeft === 0) {
      toast({ title: "Time's Up!", description: "Your exam has been submitted automatically.", variant: 'destructive' });
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || checkingPermission) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-10rem)]">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }
  
  if (!course || !exam || !examTemplate) {
    return notFound();
  }
  
  const isProctoringRequired = examTemplate.webcamProctoring;
  
  if(isProctoringRequired && !hasCameraPermission && exam.status === 'Pending') {
      return (
         <div className="max-w-4xl mx-auto">
            <Card className="text-center">
                <CardHeader>
                    <CardTitle className="text-2xl text-destructive">Proctoring Required</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Camera Access Denied</AlertTitle>
                        <AlertDescription>
                            This is a proctored exam and requires camera access. Please enable camera permissions for this site in your browser settings and refresh the page to start the exam.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        </div>
      )
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
    <>
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{examTemplate.title}</CardTitle>
              <CardDescription>{course.title}</CardDescription>
            </div>
            {timeLeft !== null && (
                <div className="text-right">
                    <Label>Time Left</Label>
                    <p className="font-mono font-bold text-2xl text-destructive">{formatTime(timeLeft)}</p>
                </div>
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
                    <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0 || !examTemplate.allowBackNavigation}>
                        <ArrowLeft className="mr-2" /> Previous
                    </Button>
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
    {isProctoringRequired && <ProctoringView />}
    </>
  );
}
