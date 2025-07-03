'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ThumbsUp, Heart, Lightbulb, Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from './ui/use-toast';
import { rateCourseAction } from '@/app/actions/rating.actions';

interface LessonFeedbackProps {
    courseId: string;
    courseTitle: string;
}

export function LessonFeedback({ courseId, courseTitle }: LessonFeedbackProps) {
    const { toast } = useToast();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleRate = async (newRating: number) => {
        setRating(newRating);
        setIsSubmitting(true);
        const result = await rateCourseAction(courseId, newRating);
        if (result.success) {
            toast({
                title: 'Rating Submitted!',
                description: `You rated "${courseTitle}" ${newRating} stars.`,
            });
            setSubmitted(true);
        } else {
            toast({
                title: 'Error',
                description: result.message,
                variant: 'destructive',
            });
            setRating(0); // Reset on error
        }
        setIsSubmitting(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Lesson Feedback</CardTitle>
                <CardDescription>How was this lesson? Let the instructor know!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h4 className="font-semibold text-sm mb-2">React to this lesson:</h4>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" aria-label="Like"><ThumbsUp className="w-5 h-5"/></Button>
                        <Button variant="outline" size="icon" aria-label="Love"><Heart className="w-5 h-5"/></Button>
                        <Button variant="outline" size="icon" aria-label="Helpful"><Lightbulb className="w-5 h-5"/></Button>
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-sm mb-2">Rate this lesson:</h4>
                     {submitted ? (
                        <p className="text-green-600 font-semibold">Thank you for your rating!</p>
                    ) : (
                        <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => handleRate(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label={`Rate ${star} stars`}
                                >
                                    <Star 
                                        className={cn(
                                            "w-8 h-8 cursor-pointer transition-colors",
                                            (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'
                                        )}
                                        fill={(hoverRating || rating) >= star ? 'currentColor' : 'none'}
                                    />
                                </button>
                            ))}
                            {isSubmitting && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
