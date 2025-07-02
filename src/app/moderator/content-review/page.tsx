
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, User, MessageSquare, AlertCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Content Review',
    description: 'Review user-reported content to maintain community standards.',
};

const mockReportedItems = [
    { id: 'rep_1', type: 'Comment', content: 'This is spam! Buy my stuff at spam.com', user: 'Spammer01', date: '2024-07-21', reason: 'Spam' },
    { id: 'rep_2', type: 'Review', content: 'This teacher is the worst, totally useless.', user: 'AngryStudent', date: '2024-07-20', reason: 'Harassment' },
    { id: 'rep_3', type: 'Comment', content: 'What is the answer to question 5?', user: 'Cheater_McCheat', date: '2024-07-19', reason: 'Academic Dishonesty' },
];

export default function ContentReviewPage() {
    const [items, setItems] = useState(mockReportedItems);
    
    const handleAction = (id: string, action: 'approve' | 'remove') => {
        setItems(items.filter(item => item.id !== id));
        console.log(`Item ${id} was ${action}d.`);
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center h-full p-8">
                <div className="p-4 bg-muted rounded-full mb-4">
                    <ThumbsUp className="w-12 h-12 text-muted-foreground" />
                </div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Review Queue Clear!</h1>
                <p className="mt-2 text-lg text-muted-foreground max-w-md">
                    There are no items currently waiting for review. Great job!
                </p>
            </div>
        )
    }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Content Review Queue</h1>
        <p className="mt-1 text-lg text-muted-foreground">
          Review user-reported content to maintain community standards.
        </p>
      </div>
      
      <div className="space-y-6">
        {items.map(item => (
            <Card key={item.id}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Badge>{item.type}</Badge>
                                Reported for: {item.reason}
                            </CardTitle>
                            <CardDescription className="mt-2 flex items-center gap-4">
                               <span className="flex items-center gap-1.5"><User className="h-3 w-3"/>{item.user}</span>
                               <span className="flex items-center gap-1.5"><MessageSquare className="h-3 w-3"/>{item.date}</span>
                            </CardDescription>
                        </div>
                        <Badge variant="destructive"><AlertCircle className="mr-2"/>Needs Review</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <blockquote className="p-4 border-l-4 bg-muted">
                        {item.content}
                    </blockquote>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => handleAction(item.id, 'approve')}><ThumbsUp className="mr-2"/>Approve (Keep Content)</Button>
                    <Button variant="destructive" onClick={() => handleAction(item.id, 'remove')}><ThumbsDown className="mr-2"/>Remove Content</Button>
                </CardFooter>
            </Card>
        ))}
      </div>
    </div>
  );
}
