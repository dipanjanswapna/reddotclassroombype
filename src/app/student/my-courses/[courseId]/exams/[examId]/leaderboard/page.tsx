
'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { getCourse } from '@/lib/firebase/firestore';
import type { Course, Exam } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/loading-spinner';
import { ExamLeaderboard } from '@/components/exam-leaderboard';
import { useAuth } from '@/context/auth-context';
import { Crown } from 'lucide-react';

export default function ExamLeaderboardPage() {
    const params = useParams();
    const courseId = params.courseId as string;
    const examId = params.examId as string;
    const { userInfo, loading: authLoading } = useAuth();

    const [course, setCourse] = useState<Course | null>(null);
    const [examsForLeaderboard, setExamsForLeaderboard] = useState<Exam[]>([]);
    const [examTitle, setExamTitle] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userInfo) {
            if (!authLoading) setLoading(false);
            return;
        }

        async function fetchLeaderboardData() {
            try {
                const courseData = await getCourse(courseId);
                if (!courseData) return notFound();
                setCourse(courseData);

                const examTemplateId = examId.split('-')[0];
                const template = courseData.examTemplates?.find(et => et.id === examTemplateId);
                if (template) {
                    setExamTitle(template.title);
                }

                const allExamsForTemplate = (courseData.exams || []).filter(e => e.id.startsWith(examTemplateId));
                setExamsForLeaderboard(allExamsForTemplate);

            } catch (error) {
                console.error("Failed to fetch leaderboard data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchLeaderboardData();

    }, [courseId, examId, userInfo, authLoading]);
    
    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[calc(100vh-10rem)]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }
    
    if (!course) {
        return notFound();
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <Crown className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
                <h1 className="font-headline text-3xl font-bold tracking-tight">{examTitle} Leaderboard</h1>
                <p className="mt-1 text-lg text-muted-foreground">See how you rank against your peers in {course.title}.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Top Performers</CardTitle>
                    <CardDescription>Rankings are based on the marks obtained in this exam.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ExamLeaderboard exams={examsForLeaderboard} currentUserUid={userInfo?.uid} />
                </CardContent>
            </Card>
        </div>
    );
}
