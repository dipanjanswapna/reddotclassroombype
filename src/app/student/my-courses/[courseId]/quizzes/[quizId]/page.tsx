
'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { getCourse } from '@/lib/firebase/firestore';
import type { Course, Quiz, QuizQuestion } from '@/lib/types';
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

export default function QuizPage({ params }: { params: { courseId: string; quizId: string } }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({}); // questionIndex -> optionId
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    async function fetchQuizData() {
        try {
            const courseData = await getCourse(params.courseId);
            if (courseData) {
                setCourse(courseData);
                const quizData = courseData.quizzes?.find(q => q.id === params.quizId);
                if (quizData) {
                    setQuiz(quizData);
                }
            }
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }
    fetchQuizData();
  }, [params.courseId, params.quizId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-10rem)]">
          <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

  if (!course || !quiz) {
    notFound();
  }

  const handleSelectAnswer = (questionIndex: number, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };
  
  const score = Object.entries(selectedAnswers).reduce((acc, [questionIndex, optionId]) => {
    if (quiz.questions[Number(questionIndex)].correctAnswerId === optionId) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const scorePercentage = Math.round((score / quiz.questions.length) * 100);

  const currentQuestion = quiz.questions[currentQuestionIndex];

  if (isSubmitted) {
    return (
        <div className="max-w-4xl mx-auto">
             <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">Quiz Results</CardTitle>
                    <CardDescription>{quiz.title} - {course.title}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-lg">You scored:</p>
                    <p className="text-6xl font-bold text-primary my-2">{scorePercentage}%</p>
                    <p className="text-muted-foreground">({score} out of {quiz.questions.length} correct)</p>
                </CardContent>
             </Card>
             <div className="mt-8 space-y-4">
                <h3 className="text-2xl font-bold">Review Your Answers</h3>
                 {quiz.questions.map((q, index) => {
                     const userAnswerId = selectedAnswers[index];
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
                                  {!isCorrect && userAnswerId !== undefined && (
                                      <p className="text-sm pt-2">Your answer: "{q.options.find(opt => opt.id === userAnswerId)?.text}"</p>
                                  )}
                                  {!isCorrect && (
                                      <p className="text-sm text-green-700 font-semibold">Correct answer: "{q.options.find(opt => opt.id === q.correctAnswerId)?.text}"</p>
                                  )}
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
          <CardTitle className="text-2xl">{quiz.title}</CardTitle>
          <CardDescription>{course.title}</CardDescription>
          <div className="pt-2">
            <Progress value={((currentQuestionIndex + 1) / quiz.questions.length) * 100} />
            <p className="text-sm text-muted-foreground mt-2">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
          </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-6">
                <p className="text-lg font-semibold">{currentQuestion.text}</p>
                <RadioGroup 
                    value={selectedAnswers[currentQuestionIndex]}
                    onValueChange={(value) => handleSelectAnswer(currentQuestionIndex, value)}
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
            {currentQuestionIndex < quiz.questions.length - 1 ? (
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
