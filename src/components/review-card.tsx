'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Star, Flag, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/auth-context';
import { Review } from '@/lib/types';
import { reportReviewAction } from '@/app/actions/report.actions';
import { Badge } from './ui/badge';

interface ReviewCardProps {
  review: Review;
  courseId: string;
}

export function ReviewCard({ review, courseId }: ReviewCardProps) {
  const { userInfo } = useAuth();
  const { toast } = useToast();
  const [isReporting, setIsReporting] = useState(false);
  const [isReported, setIsReported] = useState(review.isReported || false);

  const handleReport = async () => {
    if (!userInfo) {
      toast({ title: 'Please log in to report content.', variant: 'destructive' });
      return;
    }
    if (review.user.userId === userInfo.uid) {
        toast({ title: "You cannot report your own review.", variant: "destructive" });
        return;
    }
    setIsReporting(true);
    const result = await reportReviewAction(courseId, review, userInfo.uid);
    if (result.success) {
      toast({ title: 'Review Reported', description: result.message });
      setIsReported(true);
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setIsReporting(false);
  };

  return (
    <div className="flex items-start gap-4">
      <Avatar>
        <AvatarImage src={review.user.avatarUrl} alt={review.user.name} data-ai-hint={review.user.dataAiHint} />
        <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-semibold">{review.user.name}</p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">{review.date}</p>
            {isReported ? (
                <Badge variant="destructive">Reported</Badge>
            ) : (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleReport} disabled={isReporting} aria-label="Report review">
                    {isReporting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Flag className="w-4 h-4" />}
                </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-0.5 mt-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-4 h-4 text-yellow-400 ${i < review.rating ? 'fill-current' : ''}`} />
          ))}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
      </div>
    </div>
  );
}
