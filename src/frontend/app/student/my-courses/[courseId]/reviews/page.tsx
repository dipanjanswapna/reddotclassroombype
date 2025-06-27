import { notFound } from 'next/navigation';
import { courses } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function ReviewsPage({ params }: { params: { courseId: string } }) {
  const course = courses.find((c) => c.id === params.courseId);

  if (!course) {
    notFound();
  }

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
            <form className="grid gap-4">
                <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => (
                        <Star key={i} className="w-6 h-6 text-yellow-400 cursor-pointer" fill="currentColor"/>
                    ))}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="review-comment">Your Review</Label>
                    <Textarea id="review-comment" placeholder="Tell us about your experience..." rows={4} />
                </div>
                <Button className="w-fit">Submit Review</Button>
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
