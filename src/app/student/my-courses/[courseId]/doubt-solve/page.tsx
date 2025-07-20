'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { getCourse, getDoubtsByCourseAndStudent, getDoubtAnswers, createDoubtSession } from '@/lib/firebase/firestore';
import { useAuth } from '@/context/auth-context';
import { Course, Doubt, DoubtAnswer } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { askDoubtAction, reopenDoubtAction, markDoubtAsSatisfiedAction } from '@/app/actions/doubt.actions';
import { MessageSquare, Send, Loader2, Star, CheckCircle, RefreshCw } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { formatDistanceToNow } from 'date-fns';
import { safeToDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function DoubtThread({ doubt, answers, onReopen, onSatisfied }: { doubt: Doubt, answers: DoubtAnswer[], onReopen: (doubtId: string, question: string) => void, onSatisfied: (doubtId: string, rating: number) => void }) {
    const [followup, setFollowup] = useState('');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    const handleReopen = () => {
        if (followup.trim()) {
            onReopen(doubt.id!, followup);
            setFollowup('');
        }
    }
    
    const handleSatisfied = () => {
        if (rating > 0) {
            onSatisfied(doubt.id!, rating);
        }
    }

  return (
    <div className="space-y-4">
      {/* Original Question */}
      <div className="p-4 bg-muted rounded-lg">
        <p className="font-semibold">Your Question:</p>
        <p className="whitespace-pre-wrap">{doubt.questionText}</p>
        <p className="text-xs text-muted-foreground mt-2">Asked {formatDistanceToNow(safeToDate(doubt.askedAt), { addSuffix: true })}</p>
      </div>

      {/* Answers */}
      {answers.map(answer => (
        <div key={answer.id} className={`p-4 rounded-lg ${answer.doubtSolverId === 'student_followup' ? 'bg-blue-50 dark:bg-blue-900/20 ml-6' : 'bg-green-50 dark:bg-green-900/20'}`}>
          <p className="font-semibold">{answer.doubtSolverId === 'student_followup' ? 'Your Follow-up' : 'Doubt Solver\'s Answer'}:</p>
          <p className="whitespace-pre-wrap">{answer.answerText}</p>
          <p className="text-xs text-muted-foreground mt-2">Answered {formatDistanceToNow(safeToDate(answer.answeredAt), { addSuffix: true })}</p>
        </div>
      ))}
      
      {/* Actions */}
      {doubt.status === 'Answered' && (
        <div className="p-4 border rounded-lg space-y-4">
            <div>
                 <Label className="font-semibold">Not satisfied? Ask a follow-up question.</Label>
                 <Textarea value={followup} onChange={e => setFollowup(e.target.value)} placeholder="Type your follow-up question here..."/>
                 <Button onClick={handleReopen} size="sm" className="mt-2" disabled={!followup.trim()}>Re-open Doubt</Button>
            </div>
             <div className="border-t pt-4">
                <Label className="font-semibold">Satisfied with the answer? Please rate the support.</Label>
                 <div className="flex items-center gap-1 mt-2" onMouseLeave={() => setHoverRating(0)}>
                    {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} className={cn("w-6 h-6 cursor-pointer transition-colors", (hoverRating || rating) >= star ? 'text-yellow-400 fill-current' : 'text-gray-300')} />
                    ))}
                </div>
                 <Button onClick={handleSatisfied} size="sm" className="mt-2" disabled={rating === 0}>Mark as Satisfied</Button>
            </div>
        </div>
      )}
    </div>
  );
}

export default function DoubtSolvePage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { userInfo, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [answers, setAnswers] = useState<Record<string, DoubtAnswer[]>>({});
  const [doubtSessionId, setDoubtSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newDoubtText, setNewDoubtText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!userInfo) {
      if (!authLoading) setLoading(false);
      return;
    }

    const fetchInitialData = async () => {
      try {
        const courseData = await getCourse(courseId);
        if (!courseData) return notFound();
        setCourse(courseData);

        const sessionId = await createDoubtSession(courseId, courseData.title, courseData.doubtSolverIds || []);
        setDoubtSessionId(sessionId);
        
        const studentDoubts = await getDoubtsByCourseAndStudent(courseId, userInfo.uid);
        setDoubts(studentDoubts);

        const allAnswers: Record<string, DoubtAnswer[]> = {};
        for (const doubt of studentDoubts) {
            const doubtAnswers = await getDoubtAnswers(doubt.id!);
            allAnswers[doubt.id!] = doubtAnswers;
        }
        setAnswers(allAnswers);

      } catch (error) {
        console.error("Error fetching doubt solve data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [courseId, userInfo, authLoading]);

  const handleAskDoubt = async () => {
    if (!newDoubtText.trim() || !userInfo || !doubtSessionId) return;
    setIsSubmitting(true);

    const result = await askDoubtAction({
      sessionId: doubtSessionId,
      courseId,
      studentId: userInfo.uid,
      questionText: newDoubtText,
    });

    if (result.success && result.doubtId) {
        toast({ title: 'Success', description: result.message });
        setNewDoubtText('');
        // Re-fetch doubts to show the new one
        const studentDoubts = await getDoubtsByCourseAndStudent(courseId, userInfo.uid);
        setDoubts(studentDoubts);
    } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setIsSubmitting(false);
  };
  
    const handleReopen = async (doubtId: string, question: string) => {
        const result = await reopenDoubtAction(doubtId, question);
        if (result.success) {
            toast({ title: "Success", description: result.message });
            // Refetch
        } else {
            toast({ title: "Error", description: result.message, variant: 'destructive' });
        }
    };

    const handleSatisfied = async (doubtId: string, rating: number) => {
        const result = await markDoubtAsSatisfiedAction(doubtId, rating);
        if (result.success) {
            toast({ title: "Success", description: result.message });
            // Refetch
        } else {
            toast({ title: "Error", description: result.message, variant: 'destructive' });
        }
    };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Doubt Solve</h1>
        <p className="mt-1 text-lg text-muted-foreground">Ask questions about {course?.title}.</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold">Ask a new question</h3>
        <div className="space-y-2">
            <Textarea
            placeholder="Type your question here..."
            value={newDoubtText}
            onChange={(e) => setNewDoubtText(e.target.value)}
            rows={4}
            />
            <Button onClick={handleAskDoubt} disabled={isSubmitting || !newDoubtText.trim()}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4" />}
                Submit Question
            </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold">Your previous questions</h3>
        {doubts.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-2">
            {doubts.map(doubt => (
              <AccordionItem key={doubt.id} value={doubt.id!} className="border rounded-lg bg-card overflow-hidden">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex-grow text-left">
                        <p className="font-medium truncate">{doubt.questionText}</p>
                        <p className="text-xs text-muted-foreground mt-1">Asked {formatDistanceToNow(safeToDate(doubt.askedAt), { addSuffix: true })}</p>
                    </div>
                    <Badge variant={doubt.status === 'Answered' ? 'accent' : 'secondary'} className="ml-4">{doubt.status}</Badge>
                </AccordionTrigger>
                <AccordionContent className="p-4 border-t bg-muted/50">
                    <DoubtThread doubt={doubt} answers={answers[doubt.id!] || []} onReopen={handleReopen} onSatisfied={handleSatisfied} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="text-muted-foreground">You haven't asked any questions yet.</p>
        )}
      </div>
    </div>
  );
}
