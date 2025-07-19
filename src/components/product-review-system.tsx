
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useToast } from './ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Product } from '@/lib/types';
import { addProductReviewAction } from '@/app/actions/product.actions';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { safeToDate } from '@/lib/utils';

interface ProductReviewSystemProps {
    product: Product;
}

export function ProductReviewSystem({ product }: ProductReviewSystemProps) {
    const { toast } = useToast();
    const { userInfo } = useAuth();
    
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const hasUserReviewed = product.reviews?.some(r => r.userId === userInfo?.uid);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInfo) {
            toast({ title: 'Please log in to leave a review.', variant: 'destructive' });
            return;
        }
        if (rating === 0) {
            toast({ title: 'Rating required', description: 'Please select a star rating.', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);
        const result = await addProductReviewAction(product.id!, {
            userId: userInfo.uid,
            userName: userInfo.name,
            avatarUrl: userInfo.avatarUrl,
            rating,
            comment,
        });
        
        if(result.success) {
            toast({ title: 'Review submitted successfully!'});
            setRating(0);
            setComment('');
            // You might want to re-fetch the product data here to show the new review instantly.
            // For now, we rely on the user refreshing the page or a server-side revalidation.
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive'});
        }
        setIsSubmitting(false);
    };

    return (
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Leave a Review</CardTitle>
                        <CardDescription>Share your experience with this product.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {hasUserReviewed ? (
                            <p className="text-sm text-green-600 font-semibold">Thank you for your review!</p>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label className="mb-2 block">Your Rating</Label>
                                    <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                                        {[1, 2, 3, 4, 5].map((star) => (
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
                                <div className="space-y-2">
                                    <Label htmlFor="review-comment">Your Review</Label>
                                    <Textarea
                                        id="review-comment"
                                        placeholder="Tell us what you think..."
                                        rows={4}
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    />
                                </div>
                                <Button className="w-full" type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                    Submit Review
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Reviews ({product.reviewsCount || 0})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 max-h-[600px] overflow-y-auto">
                        {product.reviews && product.reviews.length > 0 ? (
                             product.reviews.map((review) => (
                                <div key={review.id} className="flex items-start gap-4">
                                    <Avatar>
                                        <AvatarImage src={review.avatarUrl} alt={review.userName} />
                                        <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold">{review.userName}</p>
                                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(safeToDate(review.createdAt), { addSuffix: true })}</p>
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
                            <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to leave one!</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
