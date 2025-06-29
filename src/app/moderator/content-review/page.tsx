
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, ThumbsDown, User, MessageSquare, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

type ReportedContent = {
  id: string;
  type: 'Comment' | 'Post';
  content: string;
  author: { name: string; avatar: string };
  reporter: { name: string; avatar: string };
  reason: string;
  timestamp: string;
  contextUrl: string;
};

const mockReportedContent: ReportedContent[] = [
  {
    id: 'rep1',
    type: 'Comment',
    content: "This course is a complete waste of time. Don't buy it.",
    author: { name: 'FrustratedUser', avatar: 'https://placehold.co/100x100.png' },
    reporter: { name: 'HelpfulStudent', avatar: 'https://placehold.co/100x100.png' },
    reason: 'Spam / Misleading',
    timestamp: '2 hours ago',
    contextUrl: '#',
  },
  {
    id: 'rep2',
    type: 'Post',
    content: "Hey everyone, check out my new YouTube channel for free tutorials! [link]",
    author: { name: 'SelfPromoter', avatar: 'https://placehold.co/100x100.png' },
    reporter: { name: 'AnotherStudent', avatar: 'https://placehold.co/100x100.png' },
    reason: 'Spam / Self-promotion',
    timestamp: '5 hours ago',
    contextUrl: '#',
  },
];

export default function ContentReviewPage() {
  const [reports, setReports] = useState(mockReportedContent);
  const { toast } = useToast();

  const handleAction = (id: string, action: 'approved' | 'removed') => {
    setReports(reports.filter(r => r.id !== id));
    toast({
      title: `Content ${action}`,
      description: `The reported content has been ${action}.`,
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Content Review Queue</h1>
        <p className="mt-1 text-lg text-muted-foreground">
          Review and take action on user-reported content to maintain community standards.
        </p>
      </div>

      <div className="space-y-6">
        {reports.length > 0 ? reports.map(report => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                      <Badge variant="destructive">{report.type}</Badge>
                      Reported for: {report.reason}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                      <Clock className="h-4 w-4"/> {report.timestamp}
                  </CardDescription>
                </div>
                <div className="text-right text-sm">
                    <p className="font-semibold">Reported by:</p>
                    <p className="text-muted-foreground">{report.reporter.name}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                     <div className="p-4 rounded-md border bg-muted">
                        <p className="font-semibold mb-2 flex items-center gap-2"><MessageSquare /> Content:</p>
                        <p className="text-muted-foreground italic">"{report.content}"</p>
                     </div>
                      <div className="p-4 rounded-md border">
                        <p className="font-semibold mb-2 flex items-center gap-2"><User /> Author:</p>
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={report.author.avatar}/>
                                <AvatarFallback>{report.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{report.author.name}</span>
                        </div>
                     </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => handleAction(report.id, 'approved')}><ThumbsUp className="mr-2"/>Approve Content</Button>
                    <Button variant="destructive" onClick={() => handleAction(report.id, 'removed')}><ThumbsDown className="mr-2"/>Remove Content</Button>
                </div>
            </CardContent>
          </Card>
        )) : (
             <Card>
                <CardContent className="p-16 text-center">
                    <p className="text-muted-foreground">The content review queue is empty. Great job!</p>
                </CardContent>
             </Card>
        )}
      </div>
    </div>
  );
}
