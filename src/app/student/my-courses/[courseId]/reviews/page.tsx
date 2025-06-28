'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import { courses } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ReviewsPage({ params }: { params: { courseId: string } }) {
  const course = courses.find((c) => c.id === params.courseId);
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!course) {
    notFound();
  }

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
    console.log({ rating, comment });
    toast({
      title: 'Review Submitted!',
      description: 'Thank you for your feedback.',
    });
    setRating(0);
    setComment('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Reviews</h1>
        <p className="mt-1 text-lg text-muted-foreground">See what other students are saying about {course.title}.</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Leave a Review</CardTitle>
            <CardDescription>Share your experience to help other students.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
                <div>
                    <Label className="mb-2 block">Your Rating</Label>
                    <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                        {[1,2,3,4,5].map(star => (
                            <Star 
                                key={star} 
                                className={cn(
                                    "w-6 h-6 cursor-pointer transition-colors",
                                    (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'
                                )}
                                fill={(hoverRating || rating) >= star ? 'currentColor' : 'none'}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                            />
                        ))}
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="review-comment">Your Review</Label>
                    <Textarea 
                        id="review-comment" 
                        placeholder="Tell us about your experience..." 
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </div>
                <Button className="w-fit" type="submit">Submit Review</Button>
            </form>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
            <CardTitle>Student Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {course.reviewsData && course.reviewsData.length > 0 ? (
            course.reviewsData.map((review) => (
              <div key={review.id} className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={review.user.avatarUrl} alt={review.user.name} data-ai-hint={review.user.dataAiHint} />
                  <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <p className="font-semibold">{review.user.name}</p>
                        <p className="text-xs text-muted-foreground">{review.date}</p>
                    </div>
                     <div className="flex items-center gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 text-yellow-400 ${i < review.rating ? 'fill-current' : ''}`} />
                        ))}
                    </div>
                  <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No reviews yet. Be the first to leave one!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
