
'use client';

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toggleWishlistAction } from '@/app/actions/user.actions';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

export function CourseCardWishlistButton({ courseId }: { courseId: string }) {
  const { userInfo, refreshUserInfo } = useAuth();
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
  
  if (!userInfo || userInfo.role !== 'Student') {
      return null;
  }

  return (
      <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/70 hover:bg-white rounded-full h-8 w-8 z-10"
          onClick={handleWishlistToggle}
          aria-label="Toggle Wishlist"
      >
          <Heart className={cn("w-4 h-4", isWishlisted ? "text-destructive fill-destructive" : "text-muted-foreground")} />
      </Button>
  );
}
