'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toggleWishlistAction } from '@/app/actions';
import { useToast } from '@/components/ui/use-toast';

const currentUserId = 'usr_stud_001'; 

type CourseCardWishlistButtonProps = {
  courseId: string;
  initialIsWishlisted: boolean;
};

export function CourseCardWishlistButton({ courseId, initialIsWishlisted }: CourseCardWishlistButtonProps) {
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
      setIsWishlisted(isWishlisted); // Revert
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive"
      });
    }
  };

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
