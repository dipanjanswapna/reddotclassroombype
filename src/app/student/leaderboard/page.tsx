
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Crown, Trophy, User as UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getUsers } from '@/lib/firebase/firestore';
import { useAuth } from '@/context/auth-context';
import type { User } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { cn } from '@/lib/utils';

type LeaderboardUser = User & {
    rank: number;
    points: number;
}

const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-400 text-yellow-900';
    if (rank === 2) return 'bg-gray-300 text-gray-800';
    if (rank === 3) return 'bg-orange-300 text-orange-900';
    return 'bg-muted';
}

export default function LeaderboardPage() {
    const { userInfo, loading: authLoading } = useAuth();
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboardData = async () => {
            try {
                const allUsers = await getUsers();
                const studentUsers = allUsers.filter(u => u.role === 'Student');

                const usersWithPoints = studentUsers.map(user => ({
                    ...user,
                    // Mock points based on a hash of the user ID for consistent-but-random scores
                    points: Math.floor(Math.abs(
                        user.id!.split('').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 0)
                    ) % 5000) + 500
                })).sort((a,b) => b.points - a.points);
                
                const rankedUsers = usersWithPoints.map((user, index) => ({
                    ...user,
                    rank: index + 1
                }));

                setLeaderboard(rankedUsers);
            } catch (error) {
                console.error("Failed to generate leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboardData();
    }, []);

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
                <h1 className="font-headline text-3xl font-bold tracking-tight">Leaderboard</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                   See how you rank against other learners on the platform.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Top Students</CardTitle>
                    <CardDescription>Rankings are based on points earned from course completion, quizzes, and other activities.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16 text-center">Rank</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead className="text-right">Points</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leaderboard.map(user => (
                                <TableRow key={user.id} className={cn(userInfo?.id === user.id && 'bg-accent')}>
                                    <TableCell className="text-center">
                                        <Badge className={`w-8 h-8 flex items-center justify-center text-lg font-bold ${getRankColor(user.rank)}`}>
                                            {user.rank <= 3 ? <Trophy className="w-5 h-5"/> : user.rank}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={user.avatarUrl} alt={user.name} />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{user.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-lg text-primary">{user.points.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
