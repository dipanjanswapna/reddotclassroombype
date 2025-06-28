
'use client';

import { mockAchievements, Achievement } from '@/lib/mock-data';
import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Medal, Trophy, Zap, BrainCircuit, BookOpenCheck } from 'lucide-react';
import React from 'react';

// Metadata can be defined in client components but it's often better in layout or server components.
// For simplicity, we define it here but acknowledge it won't be applied on the server.
const metadata: Metadata = {
  title: 'My Achievements',
  description: 'Track your learning milestones and badges earned on Red Dot Classroom.',
};


const iconMap: { [key in Achievement['icon']]: React.ComponentType<{ className?: string }> } = {
  Medal,
  Trophy,
  Zap,
  BrainCircuit,
  BookOpenCheck,
};

const AchievementIcon = ({ icon, className }: { icon: Achievement['icon'], className?: string }) => {
  const IconComponent = iconMap[icon];
  return <IconComponent className={className} />;
};

export default function AchievementsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
         <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-10 h-10 text-primary" />
            <h1 className="font-headline text-3xl font-bold tracking-tight">My Achievements</h1>
        </div>
        <p className="mt-2 text-lg text-muted-foreground">
          Celebrate your learning milestones! Here are the badges you've earned.
        </p>
      </div>

      {mockAchievements.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockAchievements.map((achievement) => (
            <Card key={achievement.id} className="flex flex-col text-center items-center p-6 bg-card hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                <div className="relative mb-4">
                    <div className="absolute -inset-2 bg-yellow-400/20 blur-xl rounded-full"></div>
                    <div className="relative p-4 bg-yellow-400/30 rounded-full">
                        <AchievementIcon icon={achievement.icon} className="w-12 h-12 text-yellow-600" />
                    </div>
                </div>
                <CardTitle>{achievement.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-2 flex-grow">
                <CardDescription>{achievement.description}</CardDescription>
                </CardContent>
                <div className="pt-4 text-xs text-muted-foreground">
                Unlocked on {achievement.date}
                </div>
            </Card>
            ))}
        </div>
      ) : (
          <div className="text-center py-16 bg-muted rounded-lg">
            <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">You haven't earned any achievements yet. Complete a course to get started!</p>
          </div>
      )}
    </div>
  );
}
