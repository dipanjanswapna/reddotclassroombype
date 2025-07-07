
'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Crown, Trophy, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Exam } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ExamLeaderboardProps {
    exams: Exam[];
    currentUserUid?: string;
}

const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-400 text-yellow-900';
    if (rank === 2) return 'bg-gray-300 text-gray-800';
    if (rank === 3) return 'bg-orange-300 text-orange-900';
    return 'bg-muted';
}

export function ExamLeaderboard({ exams, currentUserUid }: ExamLeaderboardProps) {

    const rankedExams = React.useMemo(() => {
        const graded = exams.filter(e => e.status === 'Graded');
        const sorted = graded.sort((a, b) => (b.marksObtained || 0) - (a.marksObtained || 0));

        let rank = 1;
        return sorted.map((exam, index) => {
            if (index > 0 && (sorted[index - 1].marksObtained || 0) > (exam.marksObtained || 0)) {
                rank = index + 1;
            }
            return { ...exam, rank };
        });
    }, [exams]);
    
    if (rankedExams.length === 0) {
        return (
            <div className="text-center py-16 bg-muted rounded-lg flex flex-col items-center">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No graded submissions yet.</p>
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-16 text-center">Rank</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-right">Marks</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rankedExams.map(exam => (
                    <TableRow key={exam.id} className={cn(currentUserUid === exam.studentId && 'bg-accent')}>
                        <TableCell className="text-center">
                            <Badge className={`w-8 h-8 flex items-center justify-center text-lg font-bold ${getRankColor(exam.rank)}`}>
                                {exam.rank <= 3 ? <Trophy className="w-5 h-5"/> : exam.rank}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={`https://placehold.co/100x100.png?text=${exam.studentName.substring(0, 2)}`} alt={exam.studentName} />
                                    <AvatarFallback>{exam.studentName.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{exam.studentName}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg text-primary">{exam.marksObtained} / {exam.totalMarks}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

