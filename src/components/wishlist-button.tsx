'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toggleWishlistAction } from '@/app/actions';
import { useToast } from '@/components/ui/use-toast';

// In a real app, this would come from an auth context
const currentUserId = 'usr_stud_001'; 

type WishlistButtonProps = {
  courseId: string;
  initialIsWishlisted: boolean;
};

export function WishlistButton({ courseId, initialIsWishlisted }: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
  const { toast } = useToast();
  
  useEffect(() => {
    setIsWishlisted(initialIsWishlisted);
  }, [initialIsWishlisted]);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentUserId) return;
    
    setIsWishlisted(!isWishlisted);

    const result = await toggleWishlistAction(currentUserId, courseId);

    if (!result.success) {
      setIsWishlisted(isWishlisted); // Revert on failure
      toast({
        title: "Error",
        description: "Could not update wishlist. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button size="lg" variant="outline" className="px-3" onClick={handleWishlistToggle} aria-label="Toggle Wishlist">
        <Heart className={cn("w-5 h-5", isWishlisted && "fill-destructive text-destructive")} />
    </Button>
  );
}
