
'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { getCourse } from '@/lib/firebase/firestore';
import type { Course, QuizTemplate, QuizQuestion } from '@/lib/types';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { submitQuizAction } from '@/app/actions/quiz.actions';

export default function QuizPage({ params }: { params: { courseId: string; quizId: string } }) {
  const { userInfo } = useAuth();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [quizTemplate, setQuizTemplate] = useState<QuizTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({}); // { questionId -> optionId }
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);


  useEffect(() => {
    async function fetchQuizData() {
        if (!userInfo) {
            if (!loading) setLoading(false);
            return;
        }

        try {
            const courseData = await getCourse(params.courseId);
            if (courseData) {
                setCourse(courseData);
                const templateData = courseData.quizTemplates?.find(q => q.id === params.quizId);
                if (templateData) {
                    setQuizTemplate(templateData);

                    const existingResult = courseData.quizResults?.find(r => r.studentId === userInfo.uid && r.quizTemplateId === params.quizId);
                    if (existingResult) {
                        setIsSubmitted(true);
                        setSelectedAnswers(existingResult.answers);
                        setFinalScore(existingResult.score);
                    }
                }
            }
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }
    fetchQuizData();
  }, [params.courseId, params.quizId, userInfo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-10rem)]">
          <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

  if (!course || !quizTemplate) {
    notFound();
  }

  const handleSelectAnswer = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizTemplate.questions.length - 1) {
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

    const correctAnswers = quizTemplate.questions.reduce((acc, q) => {
      if (selectedAnswers[q.id!] === q.correctAnswerId) {
        return acc + 1;
      }
      return acc;
    }, 0);
    const score = Math.round((correctAnswers / quizTemplate.questions.length) * 100);
    
    setFinalScore(score);
    setIsSubmitted(true);

    const result = await submitQuizAction(
      course!.id!,
      quizTemplate.id,
      userInfo.uid,
      userInfo.name,
      selectedAnswers,
      score
    );

    if (result.success) {
      toast({ title: "Quiz Submitted!", description: "Your answers have been saved." });
    } else {
      toast({ title: "Error", description: "Failed to save your quiz results.", variant: "destructive" });
    }
  };

  const currentQuestion = quizTemplate.questions[currentQuestionIndex];

  if (isSubmitted) {
    return (
        <div className="max-w-4xl mx-auto">
             <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">Quiz Results</CardTitle>
                    <CardDescription>{quizTemplate.title} - {course.title}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-lg">You scored:</p>
                    <p className="text-6xl font-bold text-primary my-2">{finalScore}%</p>
                    <p className="text-muted-foreground">({Math.round(finalScore / 100 * quizTemplate.questions.length)} out of {quizTemplate.questions.length} correct)</p>
                </CardContent>
             </Card>
             <div className="mt-8 space-y-4">
                <h3 className="text-2xl font-bold">Review Your Answers</h3>
                 {quizTemplate.questions.map((q, index) => {
                     const userAnswerId = selectedAnswers[q.id!];
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
                                 {q.options?.map((option) => {
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
          <CardTitle className="text-2xl">{quizTemplate.title}</CardTitle>
          <CardDescription>{course.title}</CardDescription>
          <div className="pt-2">
            <Progress value={((currentQuestionIndex + 1) / quizTemplate.questions.length) * 100} />
            <p className="text-sm text-muted-foreground mt-2">Question {currentQuestionIndex + 1} of {quizTemplate.questions.length}</p>
          </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-6">
                <p className="text-lg font-semibold">{currentQuestion.text}</p>
                <RadioGroup 
                    value={selectedAnswers[currentQuestion.id!]}
                    onValueChange={(value) => handleSelectAnswer(currentQuestion.id!, value)}
                    className="space-y-2"
                >
                    {currentQuestion.options?.map((option, index) => (
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
            {currentQuestionIndex < quizTemplate.questions.length - 1 ? (
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
                            <AlertDialogAction onClick={handleSubmit}>Submit Quiz</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
