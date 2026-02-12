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
import { cn } from '@/lib/utils';
import { safeToDate } from '@/lib/utils';
import { format } from 'date-fns';
import { useLanguage } from '@/context/language-context';

interface ReviewCardProps {
  review: Review;
  courseId: string;
}

export function ReviewCard({ review, courseId }: ReviewCardProps) {
  const { userInfo } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
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
    <div className={cn("flex items-start gap-4 p-4 rounded-2xl bg-muted/20 border border-primary/5", language === 'bn' && "font-bengali")}>
      <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
        <AvatarImage src={review.user.avatarUrl} alt={review.user.name} data-ai-hint={review.user.dataAiHint} />
        <AvatarFallback className="font-bold">{review.user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="font-black text-sm uppercase tracking-tight text-foreground truncate">{review.user.name}</p>
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{format(safeToDate(review.date), 'dd MMM yyyy')}</p>
            {isReported ? (
                <Badge variant="destructive" className="h-5 px-2 text-[8px] uppercase">Reported</Badge>
            ) : (
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-destructive/10" onClick={handleReport} disabled={isReporting} aria-label="Report review">
                    {isReporting ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Flag className="w-3.5 h-3.5" />}
                </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-0.5 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={cn("w-3.5 h-3.5", i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200')} />
          ))}
        </div>
        <p className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed italic border-l-2 border-primary/10 pl-4">
            "{review.comment}"
        </p>
      </div>
    </div>
  );
}
