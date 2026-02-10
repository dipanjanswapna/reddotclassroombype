
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
import { MessageSquare, Send, Loader2, Star, CheckCircle, RefreshCw, XCircle, AlertTriangle, Image as ImageIcon, Sparkles } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="space-y-6">
      <div className="p-5 bg-muted rounded-[20px] border border-primary/5">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Original Question</p>
        {doubt.questionText && <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap text-foreground">{doubt.questionText}</p>}
        {doubt.attachments?.[0]?.url && (
            <div className="mt-3 relative aspect-video w-full max-w-sm rounded-xl overflow-hidden border-2 border-white shadow-lg">
                <Image src={doubt.attachments[0].url} alt="Question attachment" fill className="object-cover" />
            </div>
        )}
        <p className="text-[9px] font-bold text-muted-foreground mt-3 uppercase tracking-tighter">Asked {formatDistanceToNow(safeToDate(doubt.askedAt), { addSuffix: true })}</p>
      </div>

      <div className="space-y-4">
        {answers.sort((a,b) => safeToDate(a.answeredAt).getTime() - safeToDate(b.answeredAt).getTime()).map(answer => (
            <div key={answer.id} className={cn(
                "p-5 rounded-[20px] border max-w-[90%]",
                answer.doubtSolverId === doubt.studentId 
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-100 ml-auto" 
                    : "bg-green-50 dark:bg-green-900/20 border-green-100 mr-auto"
            )}>
                <p className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-60">
                    {answer.doubtSolverId === doubt.studentId ? 'You' : 'Expert Solver'}
                </p>
                <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{answer.answerText}</p>
                <p className="text-[9px] font-bold text-muted-foreground mt-2 uppercase tracking-tighter">{formatDistanceToNow(safeToDate(answer.answeredAt), { addSuffix: true })}</p>
            </div>
        ))}
      </div>
      
      {doubt.status === 'Answered' && (
        <div className="p-6 border border-primary/20 rounded-[20px] bg-primary/5 space-y-6">
            <div className="space-y-3">
                 <Label className="font-black uppercase text-[10px] tracking-widest text-foreground">Need more help?</Label>
                 <Textarea 
                    value={followup} 
                    onChange={e => setFollowup(e.target.value)} 
                    placeholder="Type your follow-up question here..."
                    className="rounded-xl border-primary/10 bg-white"
                />
                 <Button onClick={handleReopen} size="sm" className="font-black uppercase text-[10px] tracking-widest h-10 px-6 rounded-xl" disabled={!followup.trim() || isReopening}>
                   {isReopening ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin"/> : <RefreshCw className="mr-2 h-3.5 w-3.5"/>}
                   Re-open Doubt
                </Button>
            </div>
             <div className="border-t border-primary/10 pt-6">
                <Label className="font-black uppercase text-[10px] tracking-widest text-foreground">Rate the solution</Label>
                 <div className="flex items-center gap-1.5 mt-3" onMouseLeave={() => setHoverRating(0)}>
                    {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                            key={star} 
                            onClick={() => setRating(star)} 
                            onMouseEnter={() => setHoverRating(star)} 
                            className={cn(
                                "w-7 h-7 cursor-pointer transition-all", 
                                (hoverRating || rating) >= star ? 'text-yellow-400 fill-current scale-110' : 'text-gray-300'
                            )} 
                        />
                    ))}
                </div>
                 <Button onClick={handleSatisfied} size="sm" className="mt-4 font-black uppercase text-[10px] tracking-widest h-10 px-6 rounded-xl" variant="accent" disabled={rating === 0 || isSatisfying}>
                    {isSatisfying ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin"/> : <CheckCircle className="mr-2 h-3.5 w-3.5"/>}
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
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <LoadingSpinner className="w-10 h-10" />
      </div>
    );
  }

  if (!isEnrolled) {
      return (
        <div className="space-y-8">
            <Alert variant="destructive" className="rounded-[20px] border-none shadow-xl">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle className="font-black uppercase tracking-tight">Access Denied</AlertTitle>
                <AlertDescription className="font-medium">
                    You must be enrolled in this course to use the doubt solving feature.
                    <Button asChild variant="link" className="p-0 h-auto ml-1 text-white font-black">
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
    <div className="space-y-10">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="border-l-4 border-primary pl-4"
      >
        <h1 className="font-headline text-3xl font-black tracking-tight uppercase">Doubt <span className="text-primary">Solving</span></h1>
        <p className="mt-1 text-muted-foreground font-medium">Ask questions about {course?.title} and get instant expert help.</p>
      </motion.div>

      <Card className="rounded-[20px] border-primary/20 shadow-xl overflow-hidden bg-[#eef2ed] dark:bg-card/40">
        <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Ask a new question
            </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
                <Textarea
                    placeholder="Explain your problem clearly..."
                    value={newDoubtText}
                    onChange={(e) => setNewDoubtText(e.target.value)}
                    rows={5}
                    className="rounded-xl border-primary/10 bg-white h-32 focus:border-primary/50 text-base"
                />
                <div className="grid md:grid-cols-2 gap-4 items-end">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Attach an image (Optional)</Label>
                        <ImageUploader onAnswerChange={setNewDoubtImage} existingImageUrl={newDoubtImage || undefined} />
                    </div>
                    <Button onClick={handleAskDoubt} disabled={isSubmitting || (!newDoubtText.trim() && !newDoubtImage)} className="h-12 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4" />}
                        Submit Question
                    </Button>
                </div>
            </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="font-headline text-xl font-black uppercase tracking-tight border-l-4 border-primary pl-4">Previous Discussions</h2>
        {doubts.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-3">
            {doubts.map(doubt => (
              <AccordionItem key={doubt.id} value={doubt.id!} className="border border-primary/10 rounded-[20px] bg-card overflow-hidden shadow-md">
                <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-primary/5 transition-all">
                    <div className="flex-grow text-left flex items-center gap-4 min-w-0">
                        <div className={cn(
                            "p-2.5 rounded-xl shrink-0",
                            doubt.status === 'Answered' || doubt.status === 'Satisfied' ? "bg-green-100 text-green-600" : "bg-primary/10 text-primary"
                        )}>
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <div className="truncate pr-4">
                            <p className="font-black text-sm md:text-base uppercase tracking-tight truncate">{doubt.questionText || "Image Inquiry"}</p>
                            <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter">Asked {formatDistanceToNow(safeToDate(doubt.askedAt), { addSuffix: true })}</p>
                        </div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(doubt.status)} className="ml-2 font-black text-[9px] uppercase tracking-widest px-3 py-1">{doubt.status}</Badge>
                </AccordionTrigger>
                <AccordionContent className="p-6 border-t border-primary/5 bg-muted/10">
                    <DoubtThread doubt={doubt} answers={answers[doubt.id!] || []} onReopen={handleReopen} onSatisfied={handleSatisfied} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-primary/10 rounded-[20px] bg-muted/5">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">No questions found</p>
          </div>
        )}
      </div>
    </div>
  );
}
