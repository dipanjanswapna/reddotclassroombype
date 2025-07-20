'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getDoubt, getDoubtAnswers, getStudentForDoubt } from '@/lib/firebase/firestore';
import type { Doubt, DoubtAnswer, User } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { answerDoubtAction } from '@/app/actions/doubt.actions';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { safeToDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

function DoubtAnswerThread({ doubt, answers, student }: { doubt: Doubt, answers: DoubtAnswer[], student: User | null }) {
    const { userInfo } = useAuth();
    const [answerText, setAnswerText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleAnswerSubmit = async () => {
        if (!answerText.trim() || !userInfo) return;
        setIsSubmitting(true);
        const result = await answerDoubtAction({
            doubtId: doubt.id!,
            doubtSolverId: userInfo.uid,
            answerText,
            studentId: doubt.studentId
        });
        if(result.success) {
            toast({ title: 'Success', description: result.message });
            setAnswerText('');
            // TODO: Refetch data after submission
            window.location.reload();
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-4">
            {answers.map(answer => (
                <div key={answer.id} className={`p-4 rounded-lg ${answer.doubtSolverId === 'student_followup' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                    <p className="font-semibold">{answer.doubtSolverId === 'student_followup' ? 'Student\'s Follow-up' : 'Your Answer'}:</p>
                    <p className="whitespace-pre-wrap">{answer.answerText}</p>
                    <p className="text-xs text-muted-foreground mt-2">Answered {formatDistanceToNow(safeToDate(answer.answeredAt), { addSuffix: true })}</p>
                </div>
            ))}
            <div className="p-4 bg-muted rounded-lg">
                <p className="font-semibold">{student?.name || 'Student'}'s Question:</p>
                <p className="whitespace-pre-wrap">{doubt.questionText}</p>
                <p className="text-xs text-muted-foreground mt-2">Asked {formatDistanceToNow(safeToDate(doubt.askedAt), { addSuffix: true })}</p>
            </div>
             <div className="space-y-2">
                <Textarea
                    placeholder="Type your answer here..."
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    rows={6}
                />
                <Button onClick={handleAnswerSubmit} disabled={isSubmitting || !answerText.trim()}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4" />}
                    Submit Answer
                </Button>
            </div>
        </div>
    );
}

export default function DoubtAnswerPage() {
    const params = useParams();
    const doubtId = params.doubtId as string;
    const { userInfo, loading: authLoading } = useAuth();
    
    const [doubt, setDoubt] = useState<Doubt | null>(null);
    const [answers, setAnswers] = useState<DoubtAnswer[]>([]);
    const [student, setStudent] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!doubtId) return;

        const fetchData = async () => {
            try {
                const doubtData = await getDoubt(doubtId);
                setDoubt(doubtData);
                if (doubtData) {
                    const [answersData, studentData] = await Promise.all([
                        getDoubtAnswers(doubtId),
                        getStudentForDoubt(doubtData.studentId)
                    ]);
                    setAnswers(answersData);
                    setStudent(studentData);
                }
            } catch (error) {
                console.error("Error fetching doubt details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [doubtId]);

    if (loading || authLoading) {
        return <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>;
    }
    
    if (!doubt) {
        return <div>Doubt not found.</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                         <div>
                            <CardTitle>Doubt Details</CardTitle>
                            <CardDescription>Question from {student?.name || 'a student'}</CardDescription>
                         </div>
                         <Badge>{doubt.status}</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <DoubtAnswerThread doubt={doubt} answers={answers} student={student} onReopen={() => {}} onSatisfied={() => {}}/>
                </CardContent>
            </Card>
        </div>
    );
}
