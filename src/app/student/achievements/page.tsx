
'use client';

import { Award, BookOpenCheck, BrainCircuit, Medal, Trophy, Zap, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Achievement, Course, Enrollment, User } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useState, useEffect } from 'react';
import { getEnrollmentsByUserId, getCoursesByIds } from '@/lib/firebase/firestore';


const iconMap = {
    Medal,
    Trophy,
    Zap,
    BrainCircuit,
    BookOpenCheck,
    Star,
};

const allAchievements: Achievement[] = [
    { id: '1', title: 'First Steps', description: 'Enrolled in your first course!', icon: 'Medal', date: '' },
    { id: '2', title: 'Course Completer', description: 'Finished your first course.', icon: 'Trophy', date: '' },
    { id: '3', title: '5 Course Veteran', description: 'Completed 5 courses.', icon: 'BookOpenCheck', date: '' },
    { id: '4', title: 'Quiz Whiz', description: 'Scored 90% or more on a quiz.', icon: 'BrainCircuit', date: '' },
    { id: '5', title: 'Top of the Class', description: 'Scored 90% or more on an exam.', icon: 'Star', date: '' },
];


export default function AchievementsPage() {
    const { userInfo, loading: authLoading } = useAuth();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userInfo) {
            if (!authLoading) setLoading(false);
            return;
        }

        async function generateAchievements() {
            try {
                const enrollments = await getEnrollmentsByUserId(userInfo.uid);
                const courseIds = enrollments.map(e => e.courseId);
                const courses = courseIds.length > 0 ? await getCoursesByIds(courseIds) : [];
                
                const completedEnrollments = enrollments.filter(e => e.status === 'completed');
                
                const earnedAchievements: Achievement[] = [];
                
                // Achievement 1: First Steps
                if (enrollments.length > 0) {
                    earnedAchievements.push({ ...allAchievements[0], date: enrollments[0].enrollmentDate.toDate().toLocaleDateString() });
                }

                // Achievement 2: Course Completer
                if (completedEnrollments.length > 0) {
                    earnedAchievements.push({ ...allAchievements[1], date: completedEnrollments[0].enrollmentDate.toDate().toLocaleDateString() });
                }

                // Achievement 3: 5 Course Veteran
                if (completedEnrollments.length >= 5) {
                    earnedAchievements.push({ ...allAchievements[2], date: completedEnrollments[4].enrollmentDate.toDate().toLocaleDateString() });
                }

                // Check quizzes and exams from all enrolled courses
                let quizWhizEarned = false;
                let topClassEarned = false;

                for (const course of courses) {
                    if (!quizWhizEarned && course.quizResults) {
                        const highQuizScore = course.quizResults.find(q => q.studentId === userInfo.uid && q.score >= 90);
                        if (highQuizScore) {
                             earnedAchievements.push({ ...allAchievements[3], date: highQuizScore.submissionDate.toDate().toLocaleDateString() });
                             quizWhizEarned = true;
                        }
                    }
                    if (!topClassEarned && course.exams) {
                        const highExamScore = course.exams.find(e => e.studentId === userInfo.uid && e.status === 'Graded' && e.marksObtained && e.totalMarks > 0 && (e.marksObtained / e.totalMarks) >= 0.9);
                        if (highExamScore) {
                            earnedAchievements.push({ ...allAchievements[4], date: highExamScore.submissionDate ? new Date(highExamScore.submissionDate as any).toLocaleDateString() : new Date().toLocaleDateString() });
                            topClassEarned = true;
                        }
                    }
                }

                setAchievements(earnedAchievements);
            } catch (error) {
                console.error("Failed to generate achievements", error);
            } finally {
                setLoading(false);
            }
        }

        generateAchievements();
    }, [userInfo, authLoading]);

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">My Achievements</h1>
        <p className="mt-1 text-lg text-muted-foreground">
          A showcase of your learning milestones and accomplishments.
        </p>
      </div>

       {achievements.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {achievements.map((achievement) => {
                    const Icon = iconMap[achievement.icon] || Award;
                    return (
                        <Card key={achievement.id} className="text-center">
                            <CardContent className="pt-6">
                                <div className="p-4 bg-muted inline-block rounded-full mb-4">
                                    <Icon className="w-12 h-12 text-primary" />
                                </div>
                                <h3 className="font-headline text-xl font-bold">{achievement.title}</h3>
                                <p className="text-muted-foreground mt-1">{achievement.description}</p>
                                <p className="text-xs text-muted-foreground mt-4">Earned on {achievement.date}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
       ) : (
           <div className="text-center py-16 bg-muted rounded-lg">
                <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">You haven't earned any achievements yet. Keep learning to unlock them!</p>
            </div>
       )}
    </div>
  );
}
