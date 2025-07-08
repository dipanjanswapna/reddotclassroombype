

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { getCourse } from '@/lib/firebase/firestore';
import type { Course, Exam, ExamTemplate, Question, QuestionOption, MatchingPair } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, ArrowLeft, ArrowRight, Flag, Loader2, MessageSquare, AlertTriangle, Eye } from 'lucide-react';
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
import { submitExamAction } from '@/app/actions/grading.actions';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const QuestionRenderer = ({ question, studentAnswer, isReview, onAnswerChange }: { question: Question, studentAnswer: any, isReview: boolean, onAnswerChange: (questionId: string, answer: any) => void }) => {
  const handleMCQChange = (optionId: string, checked: boolean) => {
    const currentAnswers = new Set(studentAnswer || []);
    if (checked) {
      currentAnswers.add(optionId);
    } else {
      currentAnswers.delete(optionId);
    }
    onAnswerChange(question.id!, Array.from(currentAnswers));
  };
  
  if (isReview) {
     switch (question.type) {
      case 'MCQ': {
        const correctIds = new Set(question.options?.filter(o => o.isCorrect).map(o => o.id));
        return (
          <div className="space-y-2">
            {question.options?.map(option => {
              const isSelected = studentAnswer?.includes(option.id);
              const isCorrect = correctIds.has(option.id);
              return (
                <div key={option.id} className={cn(
                  "flex items-center gap-3 p-3 rounded-md border",
                  isCorrect ? "bg-green-100 border-green-300 text-green-900" : "",
                  isSelected && !isCorrect ? "bg-red-100 border-red-300 text-red-900 line-through" : ""
                )}>
                  {isCorrect ? <CheckCircle className="w-5 h-5"/> : isSelected ? <XCircle className="w-5 h-5"/> : <div className="w-5 h-5"/>}
                  <p>{option.text}</p>
                </div>
              );
            })}
          </div>
        );
      }
       case 'True/False': {
        const isCorrect = studentAnswer === question.correctAnswer;
         return (
            <p className={cn("p-4 rounded-md border", isCorrect ? "bg-green-100 border-green-300" : "bg-red-100 border-red-300")}>
              Your answer: <strong>{studentAnswer || 'Not Answered'}</strong>. Correct answer: <strong>{question.correctAnswer}</strong>.
            </p>
         )
       }
       case 'Short Answer':
       case 'Essay':
       default:
        return (
            <Card className="bg-muted">
              <CardHeader><CardTitle className="text-lg">Your Submission</CardTitle></CardHeader>
              <CardContent><p className="whitespace-pre-wrap">{studentAnswer || 'Not Answered'}</p></CardContent>
            </Card>
        );
    }
  }

  switch(question.type) {
    case 'MCQ':
      return (
        <div className="space-y-2">
          {question.options?.map(option => (
            <Label key={option.id} className="flex items-center gap-3 p-4 border rounded-md cursor-pointer has-[:checked]:bg-muted has-[:checked]:border-primary transition-colors">
              <Checkbox
                id={option.id}
                checked={(studentAnswer as string[] || []).includes(option.id)}
                onCheckedChange={(checked) => handleMCQChange(option.id, !!checked)}
              />
              <span className="text-base">{option.text}</span>
            </Label>
          ))}
        </div>
      );
    case 'True/False':
      return (
        <RadioGroup value={studentAnswer} onValueChange={(value) => onAnswerChange(question.id!, value)} className="space-y-2">
          <Label className="flex items-center gap-3 p-4 border rounded-md cursor-pointer has-[:checked]:bg-muted has-[:checked]:border-primary transition-colors">
            <RadioGroupItem value="True" id={`${question.id}-true`} /> True
          </Label>
          <Label className="flex items-center gap-3 p-4 border rounded-md cursor-pointer has-[:checked]:bg-muted has-[:checked]:border-primary transition-colors">
            <RadioGroupItem value="False" id={`${question.id}-false`} /> False
          </Label>
        </RadioGroup>
      );
    case 'Short Answer':
    case 'Essay':
       return <Textarea placeholder="Write your answer here..." value={studentAnswer || ''} onChange={e => onAnswerChange(question.id!, e.target.value)} rows={question.type === 'Essay' ? 10 : 4} />;
    default:
      return <p className="text-muted-foreground">This question type is not yet supported for exam taking.</p>;
  }
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

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, any>>({}); 
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
            stream.getTracks().forEach(track => track.stop());
            setHasCameraPermission(true);
        } catch (error) {
            setHasCameraPermission(false);
        } finally {
            setCheckingPermission(false);
        }
    }
    checkCameraPermission();
  }, []);

  const fetchExamData = useCallback(async () => {
    if (!userInfo) return;
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
        setSelectedAnswers(studentExamData.answers || {});
        if (studentExamData.status === 'Graded') {
          setFinalScore({ score: studentExamData.marksObtained || 0, totalMarks: templateData.totalMarks });
        }
      } else if (templateData.duration) {
        setTimeLeft(templateData.duration * 60);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [courseId, examId, userInfo]);
  
  useEffect(() => {
    fetchExamData();
  }, [fetchExamData]);
  
  const handleSubmit = useCallback(async () => {
    if (!userInfo || !examTemplate) return;
    
    setLoading(true);
    setTimeLeft(null);

    try {
      const result = await submitExamAction(courseId, userInfo.uid, examId, selectedAnswers);
      if (result.success) {
        toast({ title: "Exam Submitted!", description: result.message });
        setFinalScore({ score: result.score!, totalMarks: result.totalMarks! });
        setIsSubmitted(true);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [userInfo, examTemplate, courseId, examId, selectedAnswers, toast]);

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
  }, [timeLeft, isSubmitted, handleSubmit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setSelectedAnswers(prev => ({...prev, [questionId]: answer }));
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
  
  const questions = examTemplate.questions || [];
  const handleNext = () => { if (currentQuestionIndex < questions.length - 1) { setCurrentQuestionIndex(currentQuestionIndex + 1); } };
  const handlePrev = () => { if (currentQuestionIndex > 0) { setCurrentQuestionIndex(currentQuestionIndex - 1); } };
  const currentQuestion = questions[currentQuestionIndex];

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Exam Results</CardTitle>
            <CardDescription>{examTemplate.title} - {course.title}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {exam.status === 'Graded' ? (
              <>
                <p className="text-lg">You scored:</p>
                <p className="text-6xl font-bold text-primary my-2">{finalScore?.score} / {finalScore?.totalMarks}</p>
                <p className="text-muted-foreground">({((finalScore?.score || 0) / (finalScore?.totalMarks || 1) * 100).toFixed(2)}%)</p>
              </>
            ) : (
               <div className="p-4 bg-muted rounded-md">
                 <p className="font-semibold">Your exam has been submitted for manual review.</p>
                 <p className="text-sm text-muted-foreground">Your score will be available after your instructor grades the written portions.</p>
               </div>
            )}
          </CardContent>
        </Card>

        <div>
          <h3 className="text-2xl font-bold mb-4">Review Your Submission</h3>
          <div className="space-y-4">
            {questions.map((q, index) => (
              <Card key={q.id}>
                <CardHeader>
                  <CardTitle className="text-lg">Question {index + 1}: {q.text}</CardTitle>
                </CardHeader>
                <CardContent>
                   <QuestionRenderer
                      question={q}
                      studentAnswer={selectedAnswers[q.id!]}
                      isReview={true}
                      onAnswerChange={() => {}}
                    />
                </CardContent>
                 {q.explanation && (
                    <CardFooter>
                      <Alert>
                        <AlertTitle>Explanation</AlertTitle>
                        <AlertDescription>{q.explanation}</AlertDescription>
                      </Alert>
                    </CardFooter>
                  )}
              </Card>
            ))}
          </div>
        </div>
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
          <div className="pt-2">
            <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} />
            <p className="text-sm text-muted-foreground mt-2">Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>
        </CardHeader>
        <CardContent>
            {currentQuestion && (
                <div className="space-y-6">
                    <p className="text-lg font-semibold">{currentQuestion.text}</p>
                    <QuestionRenderer 
                        question={currentQuestion}
                        studentAnswer={selectedAnswers[currentQuestion.id!]}
                        isReview={false}
                        onAnswerChange={handleAnswerChange}
                    />
                </div>
            )}
        </CardContent>
        <CardFooter className="flex justify-between">
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
        </CardFooter>
      </Card>
    </div>
    {isProctoringRequired && <ProctoringView />}
    </>
  );
}
