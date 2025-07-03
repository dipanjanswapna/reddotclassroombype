
'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ThumbsUp, Heart, Lightbulb, Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from './ui/use-toast';
import { useAuth } from '@/context/auth-context';
import { addRatingAction } from '@/app/actions/rating.actions';
import { addLessonReactionAction } from '@/app/actions/course.actions';

interface LessonFeedbackProps {
    courseId: string;
    courseTitle: string;
    lessonId: string;
}

type ReactionType = 'likes' | 'loves' | 'helpfuls';

export function LessonFeedback({ courseId, courseTitle, lessonId }: LessonFeedbackProps) {
    const { toast } = useToast();
    const { userInfo, refreshUserInfo } = useAuth();

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [submittingRating, setSubmittingRating] = useState(false);
    
    const [submittingReaction, setSubmittingReaction] = useState<ReactionType | false>(false);
    
    const hasRatedCourse = userInfo?.ratedCourses?.includes(courseId);
    const hasReactedToLesson = userInfo?.reactedLessons?.includes(lessonId);

    const handleReaction = async (reactionType: ReactionType) => {
        if (hasReactedToLesson || submittingReaction) return;
        if (!userInfo) {
            toast({ title: 'Please log in to react.', variant: 'destructive' });
            return;
        }

        setSubmittingReaction(reactionType);
        const result = await addLessonReactionAction(userInfo.uid, courseId, lessonId, reactionType);
        
        if (result.success) {
            toast({ title: result.message });
            await refreshUserInfo();
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
        setSubmittingReaction(false);
    };

    const handleRate = async (newRating: number) => {
        if (hasRatedCourse || submittingRating) return;
        if (!userInfo) {
            toast({ title: 'Please log in to rate.', variant: 'destructive' });
            return;
        }

        setRating(newRating);
        setSubmittingRating(true);
        const result = await addRatingAction(userInfo.uid, courseId, newRating);

        if (result.success) {
            toast({
                title: 'Rating Submitted!',
                description: `You rated "${courseTitle}" ${newRating} stars.`,
            });
            await refreshUserInfo();
        } else {
            toast({
                title: 'Error',
                description: result.message,
                variant: 'destructive',
            });
            setRating(0); // Reset on error
        }
        setSubmittingRating(false);
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
                        <Button variant="outline" size="icon" aria-label="Like" onClick={() => handleReaction('likes')} disabled={!!hasReactedToLesson || !!submittingReaction}>
                            {submittingReaction === 'likes' ? <Loader2 className="w-5 h-5 animate-spin" /> : <ThumbsUp className="w-5 h-5" />}
                        </Button>
                        <Button variant="outline" size="icon" aria-label="Love" onClick={() => handleReaction('loves')} disabled={!!hasReactedToLesson || !!submittingReaction}>
                            {submittingReaction === 'loves' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className="w-5 h-5" />}
                        </Button>
                        <Button variant="outline" size="icon" aria-label="Helpful" onClick={() => handleReaction('helpfuls')} disabled={!!hasReactedToLesson || !!submittingReaction}>
                             {submittingReaction === 'helpfuls' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lightbulb className="w-5 h-5" />}
                        </Button>
                    </div>
                    {hasReactedToLesson && <p className="text-xs text-muted-foreground mt-2">You have already reacted to this lesson.</p>}
                </div>
                <div>
                    <h4 className="font-semibold text-sm mb-2">Rate this course:</h4>
                     {hasRatedCourse ? (
                        <p className="text-green-600 font-semibold">Thank you for rating this course!</p>
                    ) : (
                        <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    disabled={submittingRating}
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
                            {submittingRating && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
