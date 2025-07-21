
'use client';

import { useState, useEffect, useCallback } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { getCourse, getDoubtsByCourseAndStudent, getDoubtAnswers, createDoubtSession, getEnrollmentsByUserId } from '@/lib/firebase/firestore';
import { useAuth } from '@/context/auth-context';
import { Course, Doubt, DoubtAnswer, DoubtAttachment } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { askDoubtAction, reopenDoubtAction, markDoubtAsSatisfiedAction } from '@/app/actions/doubt.actions';
import { MessageSquare, Send, Loader2, Star, CheckCircle, RefreshCw, XCircle, AlertTriangle, Image as ImageIcon } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import Image from 'next/image';
import { ImageUploader } from '@/components/image-uploader';


function DoubtThread({ doubt, answers, onReopen, onSatisfied }: { doubt: Doubt, answers: DoubtAnswer[], onReopen: (doubtId: string, question: string) => void, onSatisfied: (doubtId: string, rating: number) => void }) {
    const [followup, setFollowup] = useState('');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [isReopening, setIsReopening] = useState(false);
    const [isSatisfying, setIsSatisfying] = useState(false);

    const handleReopen = async () => {
        if (followup.trim()) {
            setIsReopening(true);
            await onReopen(doubt.id!, followup);
            setFollowup('');
            setIsReopening(false);
        }
    }
    
    const handleSatisfied = async () => {
        if (rating > 0) {
            setIsSatisfying(true);
            await onSatisfied(doubt.id!, rating);
            setIsSatisfying(false);
        }
    }

  return (
    <div className="space-y-4">
      {/* Original Question */}
      <div className="p-4 bg-muted rounded-lg">
        <p className="font-semibold">Your Question:</p>
        {doubt.questionText && <p className="whitespace-pre-wrap">{doubt.questionText}</p>}
        {doubt.attachments?.[0]?.url && <Image src={doubt.attachments[0].url} alt="Question attachment" width={300} height={200} className="mt-2 rounded-md" />}
        <p className="text-xs text-muted-foreground mt-2">Asked {formatDistanceToNow(safeToDate(doubt.askedAt), { addSuffix: true })}</p>
      </div>

      {/* Answers */}
      {answers.sort((a,b) => safeToDate(a.answeredAt).getTime() - safeToDate(b.answeredAt).getTime()).map(answer => (
        <div key={answer.id} className={`p-4 rounded-lg ${answer.doubtSolverId === doubt.studentId ? 'bg-blue-50 dark:bg-blue-900/20 ml-6' : 'bg-green-50 dark:bg-green-900/20'}`}>
          <p className="font-semibold">{answer.doubtSolverId === doubt.studentId ? 'Your Follow-up' : 'Doubt Solver\'s Answer'}:</p>
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
                 <Button onClick={handleReopen} size="sm" className="mt-2" disabled={!followup.trim() || isReopening}>
                   {isReopening ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RefreshCw className="mr-2 h-4 w-4"/>}
                   Re-open Doubt
                </Button>
            </div>
             <div className="border-t pt-4">
                <Label className="font-semibold">Satisfied with the answer? Please rate the support.</Label>
                 <div className="flex items-center gap-1 mt-2" onMouseLeave={() => setHoverRating(0)}>
                    {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} className={cn("w-6 h-6 cursor-pointer transition-colors", (hoverRating || rating) >= star ? 'text-yellow-400 fill-current' : 'text-gray-300')} />
                    ))}
                </div>
                 <Button onClick={handleSatisfied} size="sm" className="mt-2" disabled={rating === 0 || isSatisfying}>
                    {isSatisfying ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle className="mr-2 h-4 w-4"/>}
                    Mark as Satisfied
                </Button>
            </div>
        </div>
      )}
    </div>
  );
}

export default function DoubtSolvePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const { userInfo, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [answers, setAnswers] = useState<Record<string, DoubtAnswer[]>>({});
  const [doubtSessionId, setDoubtSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  
  const [newDoubtText, setNewDoubtText] = useState('');
  const [newDoubtImage, setNewDoubtImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAllData = useCallback(async () => {
    if (!userInfo) return;
    setLoading(true);
    try {
      const courseData = await getCourse(courseId);
      if (!courseData) return notFound();
      setCourse(courseData);

      const enrollments = await getEnrollmentsByUserId(userInfo.uid);
      const isEnrolledInCourse = enrollments.some(e => e.courseId === courseId);
      setIsEnrolled(isEnrolledInCourse);

      if (!isEnrolledInCourse) {
        setLoading(false);
        return;
      }

      const sessionId = await createDoubtSession(courseId, courseData.title, courseData.doubtSolverIds || []);
      setDoubtSessionId(sessionId);
      
      const studentDoubts = await getDoubtsByCourseAndStudent(courseId, userInfo.uid);
      setDoubts(studentDoubts.sort((a, b) => safeToDate(b.lastUpdatedAt).getTime() - safeToDate(a.lastUpdatedAt).getTime()));

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
  }, [courseId, userInfo]);

  useEffect(() => {
    if (!authLoading) {
        fetchAllData();
    }
  }, [authLoading, fetchAllData]);

  const handleAskDoubt = async () => {
    if ((!newDoubtText.trim() && !newDoubtImage) || !userInfo || !doubtSessionId) return;
    setIsSubmitting(true);

    const attachments: DoubtAttachment[] = [];
    if (newDoubtImage) {
        attachments.push({
            type: 'image',
            url: newDoubtImage,
            fileName: 'doubt-image.png'
        });
    }

    const result = await askDoubtAction({
      sessionId: doubtSessionId,
      courseId,
      studentId: userInfo.uid,
      questionText: newDoubtText,
      attachments,
    });

    if (result.success && result.doubtId) {
        toast({ title: 'Success', description: result.message });
        setNewDoubtText('');
        setNewDoubtImage(null);
        fetchAllData();
    } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setIsSubmitting(false);
  };
  
    const handleReopen = async (doubtId: string, question: string) => {
        if (!userInfo) return;
        const result = await reopenDoubtAction(doubtId, question, userInfo.uid);
        if (result.success) {
            toast({ title: "Success", description: result.message });
            fetchAllData();
        } else {
            toast({ title: "Error", description: result.message, variant: 'destructive' });
        }
    };

    const handleSatisfied = async (doubtId: string, rating: number) => {
        const result = await markDoubtAsSatisfiedAction(doubtId, rating);
        if (result.success) {
            toast({ title: "Success", description: result.message });
            fetchAllData();
        } else {
            toast({ title: "Error", description: result.message, variant: 'destructive' });
        }
    };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isEnrolled) {
      return (
        <div className="space-y-8">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                    You must be enrolled in this course to use the doubt solving feature.
                    <Button asChild variant="link" className="p-0 h-auto ml-1">
                        <Link href={`/courses/${courseId}`}>Go to Course Page</Link>
                    </Button>
                </AlertDescription>
            </Alert>
        </div>
      )
  }

  const getStatusBadgeVariant = (status: Doubt['status']) => {
      switch(status) {
          case 'Open':
          case 'Reopened':
              return 'warning';
          case 'Answered':
              return 'default';
          case 'Satisfied':
              return 'accent';
          case 'Closed':
              return 'secondary';
          default:
              return 'secondary';
      }
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
            <ImageUploader onAnswerChange={setNewDoubtImage} existingImageUrl={newDoubtImage || undefined} />

            <Button onClick={handleAskDoubt} disabled={isSubmitting || (!newDoubtText.trim() && !newDoubtImage)}>
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
                        <p className="font-medium truncate">{doubt.questionText || "Image Doubt"}</p>
                        <p className="text-xs text-muted-foreground mt-1">Asked {formatDistanceToNow(safeToDate(doubt.askedAt), { addSuffix: true })}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(doubt.status)} className="ml-4">{doubt.status}</Badge>
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
