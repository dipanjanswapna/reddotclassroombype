
'use client';

import { Award, BookOpenCheck, BrainCircuit, Medal, Trophy, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Achievement } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useState, useEffect } from 'react';
import { getEnrollmentsByUserId } from '@/lib/firebase/firestore';


const iconMap = {
    Medal,
    Trophy,
    Zap,
    BrainCircuit,
    BookOpenCheck,
};

const mockAchievements: Achievement[] = [
    { id: '1', title: 'First Steps', description: 'Enrolled in your first course!', icon: 'Medal', date: '2024-05-10' },
    { id: '2', title: 'Course Completer', description: 'Finished your first course.', icon: 'Trophy', date: '2024-06-15' },
    { id: '3', title: 'Weekend Warrior', description: 'Completed 5 lessons in a weekend.', icon: 'Zap', date: '2024-06-22' },
    { id: '4', title: 'Quiz Master', description: 'Scored 100% on a quiz.', icon: 'BrainCircuit', date: '2024-07-01' },
    { id: '5', title: 'Dedicated Learner', description: 'Completed 5 courses.', icon: 'BookOpenCheck', date: '2024-07-18' },
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
            const enrollments = await getEnrollmentsByUserId(userInfo.uid);
            const completedCourses = enrollments.filter(e => e.status === 'completed');
            
            const earnedAchievements: Achievement[] = [];
            
            if (enrollments.length > 0) {
                earnedAchievements.push(mockAchievements[0]);
            }
            if (completedCourses.length > 0) {
                earnedAchievements.push(mockAchievements[1]);
            }
            if (completedCourses.length >= 5) {
                earnedAchievements.push(mockAchievements[4]);
            }
            // Add more logic for other achievements here...

            setAchievements(earnedAchievements);
            setLoading(false);
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
