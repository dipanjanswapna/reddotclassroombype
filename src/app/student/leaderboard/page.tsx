
'use client';

import { Crown, Medal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockLeaderboardData } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock current user ID
const currentUserId = 's1';

export default function LeaderboardPage() {
    const topThree = mockLeaderboardData.slice(0, 3);
    const rest = mockLeaderboardData.slice(3);

    const getTrophyColor = (rank: number) => {
        if (rank === 1) return 'text-yellow-500';
        if (rank === 2) return 'text-gray-400';
        if (rank === 3) return 'text-amber-700';
        return 'text-muted-foreground';
    };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
            <Crown className="w-10 h-10 text-primary" />
            <h1 className="font-headline text-3xl font-bold tracking-tight">Leaderboard</h1>
        </div>
        <p className="mt-2 text-lg text-muted-foreground">
          See how you stack up against other learners on the platform. Keep learning to climb the ranks!
        </p>
      </div>
      
       <div className="flex justify-end mb-4">
            <Tabs defaultValue="all-time" className="w-fit">
                <TabsList>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    <TabsTrigger value="all-time">All Time</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>


      {/* Top 3 Performers */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {topThree.map((student, index) => (
            <Card key={student.id} className={cn("text-center transition-all hover:shadow-lg", index === 0 && "border-yellow-500 border-2", index === 1 && "border-gray-400", index === 2 && "border-amber-700")}>
                <CardContent className="p-6">
                    <Medal className={cn("w-12 h-12 mx-auto mb-4", getTrophyColor(student.rank))} />
                    <Avatar className="w-24 h-24 mx-auto mb-2 border-4" style={{ borderColor: getTrophyColor(student.rank) }}>
                        <AvatarImage src={student.avatar} alt={student.name} />
                        <AvatarFallback>{student.name.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-lg">{student.name}</h3>
                    <p className="text-muted-foreground">Rank {student.rank}</p>
                    <p className="font-bold text-xl text-primary">{student.points.toLocaleString()} Points</p>
                </CardContent>
            </Card>
        ))}
      </div>

      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Rankings</CardTitle>
          <CardDescription>A list of all students ranked by their points.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rest.map(student => (
                <TableRow key={student.id} className={cn(student.id === currentUserId && 'bg-accent')}>
                  <TableCell className="font-bold text-lg">{student.rank}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={student.avatar} alt={student.name} />
                            <AvatarFallback>{student.name.substring(0,2)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium">{student.name} {student.id === currentUserId && '(You)'}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{student.points.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
