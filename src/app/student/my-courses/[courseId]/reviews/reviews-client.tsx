
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Send, Award, MessageSquareHeart, ShieldCheck } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import type { Course } from '@/lib/types';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { safeToDate } from '@/lib/utils';

export function ReviewsClient({ course }: { course: Course }) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
        toast({
            title: 'Rating required',
            description: 'Please select a star rating before submitting.',
            variant: 'destructive'
        });
        return;
    }
    toast({
      title: 'Review Submitted!',
      description: 'Thank you for your valuable feedback.',
    });
    setRating(0);
    setComment('');
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-start">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-5 space-y-6"
      >
        <Card className="rounded-[20px] border-primary/20 shadow-xl overflow-hidden bg-[#eef2ed] dark:bg-card/40 sticky top-24">
            <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
                <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                    <MessageSquareHeart className="w-5 h-5 text-primary" />
                    Leave a Review
                </CardTitle>
                <CardDescription className="font-medium text-xs">Share your learning experience with us.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-3 block">Overall Satisfaction</Label>
                        <div className="flex items-center gap-2" onMouseLeave={() => setHoverRating(0)}>
                            {[1,2,3,4,5].map(star => (
                                <Star 
                                    key={star} 
                                    className={cn(
                                        "w-8 h-8 cursor-pointer transition-all",
                                        (hoverRating || rating) >= star ? 'text-yellow-400 fill-current scale-110' : 'text-gray-300'
                                    )}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Label htmlFor="review-comment" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Your detailed feedback</Label>
                        <Textarea 
                            id="review-comment" 
                            placeholder="How was the teaching style, materials, and overall experience?..." 
                            rows={6}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="rounded-xl border-primary/10 bg-white text-base focus:border-primary/50 p-4"
                        />
                    </div>
                    <Button className="w-full h-12 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95" type="submit">
                        <Send className="mr-2 h-4 w-4" /> Submit Review
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="bg-primary/5 p-4 flex justify-center gap-2 border-t border-primary/10">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Trusted Feedback System</span>
            </CardFooter>
        </Card>
      </motion.div>

      <div className="lg:col-span-7 space-y-6">
        <h2 className="font-headline text-xl font-black uppercase tracking-tight border-l-4 border-primary pl-4">Student Feedback</h2>
        
        {course.reviewsData && course.reviewsData.length > 0 ? (
            <div className="space-y-4">
                {course.reviewsData.map((review, idx) => (
                    <motion.div
                        key={review.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="rounded-[20px] border-primary/5 bg-card shadow-lg p-6">
                            <div className="flex items-start gap-4">
                                <Avatar className="h-12 w-12 border-2 border-primary/10 p-0.5">
                                    <AvatarImage src={review.user.avatarUrl} alt={review.user.name} />
                                    <AvatarFallback className="font-black text-primary/40">{review.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-black text-sm uppercase tracking-tight text-foreground truncate">{review.user.name}</p>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter shrink-0">{format(safeToDate(review.date), 'dd MMM yyyy')}</p>
                                    </div>
                                    <div className="flex items-center gap-0.5 mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={cn("w-3.5 h-3.5", i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200')} />
                                        ))}
                                    </div>
                                    <p className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed italic border-l-2 border-primary/10 pl-4">"{review.comment}"</p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        ) : (
            <div className="text-center py-24 bg-muted/5 border-2 border-dashed border-primary/10 rounded-[20px] flex flex-col items-center">
                <Award className="w-12 h-12 text-primary/20 mb-4" />
                <p className="text-muted-foreground font-black uppercase tracking-widest text-xs opacity-40">No reviews yet. Be the first to share!</p>
            </div>
        )}
      </div>
    </div>
  );
}
