
'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { getCourse } from '@/lib/firebase/firestore';
import type { Course, Exam, ExamTemplate, Question } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, ArrowLeft, ArrowRight, Flag } from 'lucide-react';
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
import { submitMcqExamAction } from '@/app/actions/grading.actions';

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
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({}); // { questionId: optionId }
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

            if (studentExamData.status === 'Graded') {
              setIsSubmitted(true);
              setFinalScore({ score: studentExamData.marksObtained || 0, totalMarks: studentExamData.totalMarks });
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
  
  if (!course || !exam || !examTemplate || !examTemplate.questions) {
    return notFound();
  }
  
  const questions = examTemplate.questions;

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

  const handleSubmit = async () => {
    if (!userInfo) return;
    setLoading(true);

    const result = await submitMcqExamAction(courseId, examId, userInfo.uid, selectedAnswers);
    
    if (result.success) {
      toast({ title: "Exam Submitted!", description: "Your exam has been graded." });
      setFinalScore({ score: result.score!, totalMarks: result.totalMarks! });
      setIsSubmitted(true);
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
    setLoading(false);
  };
  
  const currentQuestion = questions[currentQuestionIndex];

  if (isSubmitted && finalScore) {
    return (
        <div className="max-w-4xl mx-auto">
             <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">Exam Results</CardTitle>
                    <CardDescription>{examTemplate.title} - {course.title}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-lg">You scored:</p>
                    <p className="text-6xl font-bold text-primary my-2">{finalScore.score} / {finalScore.totalMarks}</p>
                    <p className="text-muted-foreground">
                        ({((finalScore.score / finalScore.totalMarks) * 100).toFixed(2)}%)
                    </p>
                </CardContent>
             </Card>
             <div className="mt-8 space-y-4">
                <h3 className="text-2xl font-bold">Review Your Answers</h3>
                 {questions.map((q, index) => {
                     const userAnswerId = selectedAnswers[q.id];
                     const isCorrect = userAnswerId === q.correctAnswerId;
                     return (
                         <Card key={q.id} className={cn(isCorrect ? 'border-green-300' : 'border-red-300')}>
                             <CardHeader>
                                 <CardTitle className="text-lg flex justify-between items-center">
                                     <span>Question {index + 1}: {q.text}</span>
                                     {isCorrect ? (
                                         <Badge variant="accent" className="bg-green-100 text-green-800">Correct</Badge>
                                     ) : (
                                          <Badge variant="destructive">Incorrect</Badge>
                                     )}
                                 </CardTitle>
                             </CardHeader>
                             <CardContent className="space-y-2">
                                 {q.options.map((option) => {
                                     const isSelected = userAnswerId === option.id;
                                     const isCorrectAnswer = q.correctAnswerId === option.id;
                                     return (
                                        <div key={option.id} className={cn(
                                            "flex items-center gap-2 p-3 rounded-md border",
                                            isCorrectAnswer && "bg-green-100 border-green-300 text-green-900",
                                            isSelected && !isCorrectAnswer && "bg-red-100 border-red-300 text-red-900 line-through",
                                        )}>
                                            {isCorrectAnswer ? <CheckCircle className="w-5 h-5"/> : isSelected ? <XCircle className="w-5 h-5"/> : <div className="w-5 h-5"/>}
                                            <p>{option.text}</p>
                                        </div>
                                     )
                                 })}
                             </CardContent>
                         </Card>
                     )
                 })}
             </div>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{examTemplate.title}</CardTitle>
          <CardDescription>{course.title}</CardDescription>
          <div className="pt-2">
            <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} />
            <p className="text-sm text-muted-foreground mt-2">Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-6">
                <p className="text-lg font-semibold">{currentQuestion.text}</p>
                <RadioGroup 
                    value={selectedAnswers[currentQuestion.id] || ''}
                    onValueChange={(value) => handleSelectAnswer(currentQuestion.id, value)}
                    className="space-y-2"
                >
                    {currentQuestion.options.map((option, index) => (
                        <Label key={option.id} className="flex items-center gap-3 p-4 border rounded-md cursor-pointer has-[:checked]:bg-muted has-[:checked]:border-primary transition-colors">
                            <RadioGroupItem value={option.id} id={option.id} />
                            <span className="text-base">{option.text}</span>
                        </Label>
                    ))}
                </RadioGroup>
            </div>
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0}>
                <ArrowLeft className="mr-2" /> Previous
            </Button>
            {currentQuestionIndex < questions.length - 1 ? (
                 <Button onClick={handleNext}>
                    Next <ArrowRight className="ml-2" />
                 </Button>
            ) : (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button variant="accent">
                            <Flag className="mr-2"/> Finish & Submit
                         </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
                            <AlertDialogDescription>
                                You cannot change your answers after submitting. Please review your answers before proceeding.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Review Answers</AlertDialogCancel>
                            <AlertDialogAction onClick={handleSubmit}>Submit Exam</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
