
'use client';

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toggleWishlistAction } from '@/app/actions/user.actions';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

export function WishlistButton({ courseId }: { courseId: string }) {
  const { userInfo, loading, refreshUserInfo } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const isWishlisted = !!userInfo?.wishlist?.includes(courseId);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!userInfo) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add courses to your wishlist.",
        variant: "destructive",
        action: <Button onClick={() => router.push('/login')}>Login</Button>
      });
      return;
    }
    
    const result = await toggleWishlistAction(userInfo.id!, courseId);

    if (result.success) {
      await refreshUserInfo();
      toast({
        title: result.isInWishlist ? "Added to Wishlist" : "Removed from Wishlist",
      });
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <Button size="lg" variant="outline" className="px-3" disabled><Heart className="w-5 h-5 animate-pulse" /></Button>
  }
  
  if (!userInfo || userInfo.role !== 'Student') {
    return null;
  }

  return (
    <Button size="lg" variant="outline" className="px-3" onClick={handleWishlistToggle} aria-label="Toggle Wishlist">
        <Heart className={cn("w-5 h-5", isWishlisted && "fill-destructive text-destructive")} />
    </Button>
  );
}
