'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useToast } from './ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Loader2, Send, MessageSquareHeart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Product } from '@/lib/types';
import { addProductReviewAction } from '@/app/actions/product.actions';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { safeToDate } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';
import { t } from '@/lib/i18n';

interface ProductReviewSystemProps {
    product: Product;
}

export function ProductReviewSystem({ product }: ProductReviewSystemProps) {
    const { toast } = useToast();
    const { userInfo } = useAuth();
    const { language } = useLanguage();
    const isBn = language === 'bn';
    
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const hasUserReviewed = product.reviews?.some(r => r.userId === userInfo?.uid);

    const getT = (key: string) => t[key]?.[language] || t[key]?.['en'] || key;

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
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive'});
        }
        setIsSubmitting(false);
    };

    return (
        <div className={cn("grid md:grid-cols-12 gap-8 items-start", isBn && "font-bengali")}>
            <div className="md:col-span-5">
                <Card className="rounded-[25px] border-primary/20 shadow-xl overflow-hidden bg-[#eef2ed] dark:bg-card/40">
                    <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
                        <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                            <MessageSquareHeart className="w-5 h-5 text-primary" />
                            Leave a Review
                        </CardTitle>
                        <CardDescription className="font-medium text-[10px] uppercase tracking-widest mt-1">Share your experience with this item</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        {hasUserReviewed ? (
                            <div className="text-center py-8 space-y-3">
                                <div className="bg-green-100 text-green-600 p-3 rounded-full w-fit mx-auto shadow-inner"><Star className="fill-current"/></div>
                                <p className="text-sm text-green-700 font-black uppercase tracking-widest">Thank you for your feedback!</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-3 block">Your Rating</Label>
                                    <div className="flex items-center gap-2" onMouseLeave={() => setHoverRating(0)}>
                                        {[1, 2, 3, 4, 5].map((star) => (
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
                                    <Label htmlFor="review-comment" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Your Detailed Review</Label>
                                    <Textarea
                                        id="review-comment"
                                        placeholder="What did you like or dislike about this product?..."
                                        rows={5}
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="rounded-xl border-primary/10 bg-white text-base focus:border-primary/50"
                                    />
                                </div>
                                <Button className="w-full h-12 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95" type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                                    Post Review
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-7 space-y-6">
                <h3 className="font-headline text-lg font-black uppercase tracking-tight border-l-4 border-primary pl-4">Verified Customer Reviews ({product.reviewsCount || 0})</h3>
                <div className="space-y-4 max-h-[800px] overflow-y-auto custom-scrollbar pr-2">
                    {product.reviews && product.reviews.length > 0 ? (
                         product.reviews.map((review) => (
                            <div key={review.id} className="flex items-start gap-4 p-5 rounded-[20px] bg-card border border-primary/5 shadow-md">
                                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                    <AvatarImage src={review.avatarUrl} alt={review.userName} />
                                    <AvatarFallback className="font-bold">{review.userName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-black text-sm uppercase tracking-tight text-foreground truncate">{review.userName}</p>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">{formatDistanceToNow(safeToDate(review.createdAt), { addSuffix: true })}</p>
                                    </div>
                                    <div className="flex items-center gap-0.5 mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={cn("w-3.5 h-3.5", i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200')} />
                                        ))}
                                    </div>
                                    <p className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed italic border-l-2 border-primary/10 pl-4">"{review.comment}"</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-muted/20 border-2 border-dashed border-primary/10 rounded-[25px] flex flex-col items-center">
                            <Star className="w-12 h-12 text-primary/20 mb-4 opacity-30" />
                            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs opacity-40">No reviews yet. Be the first to share!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
