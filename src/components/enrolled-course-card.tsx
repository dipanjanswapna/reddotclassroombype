

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Course } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { toggleWishlistAction } from "@/app/actions";
import { useToast } from "./ui/use-toast";

type EnrolledCourseCardProps = {
  course: Course & { progress?: number; lastViewed?: string; completedDate?: string };
  status: 'in-progress' | 'completed' | 'wishlisted' | 'archived';
};

// Mock user ID for demo purposes. In a real app, this would come from an auth context.
const currentUserId = 'usr_stud_001';

export function EnrolledCourseCard({ course, status }: EnrolledCourseCardProps) {
  const { toast } = useToast();
  const [isWishlisted, setIsWishlisted] = useState(course.isWishlisted || false);
  
  const courseLink = (status === 'in-progress' || status === 'archived') ? `/student/my-courses/${course.id}` : `/courses/${course.id}`;
  const continueLink = status === 'in-progress' ? `/student/my-courses/${course.id}` : '#';
  
  const handleRemoveFromWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentUserId || !course.id) return;
    
    // Optimistic UI update, assumes removal is successful
    // A more robust solution might handle this in a parent component
    const cardElement = (e.currentTarget as HTMLElement).closest('.enrolled-course-card');
    if (cardElement) {
        cardElement.remove();
    }
    
    const result = await toggleWishlistAction(currentUserId, course.id);

    if (result.success) {
      toast({
        title: "Removed from Wishlist",
        description: `"${course.title}" has been removed from your wishlist.`
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to remove from wishlist. Please refresh and try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 rounded-lg bg-card group enrolled-course-card">
      <CardHeader className="p-0 relative">
        <Link href={courseLink}>
          <Image
            src={course.imageUrl}
            alt={course.title}
            width={600}
            height={400}
            className="w-full h-auto object-cover aspect-[16/10]"
            data-ai-hint={course.dataAiHint}
          />
        </Link>
        {status === 'in-progress' && course.lastViewed && (
             <Badge variant="secondary" className="absolute top-2 left-2 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last viewed: {course.lastViewed}
             </Badge>
        )}
      </CardHeader>

      <CardContent className="p-4 flex-grow">
        <Link href={courseLink}>
          <h3 className="font-headline text-base font-bold leading-snug hover:text-primary transition-colors">{course.title}</h3>
        </Link>
        <p className="text-muted-foreground text-sm mt-1">By {course.instructors?.[0]?.name || 'RDC Instructor'}</p>

        {status === 'in-progress' && typeof course.progress === 'number' && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium">Progress</p>
                <p className="text-sm font-medium text-primary">{course.progress}%</p>
            </div>
            <Progress value={course.progress} className="h-2 [&>div]:bg-accent" />
          </div>
        )}

        {status === 'completed' && course.completedDate && (
            <p className="text-sm text-green-600 mt-4 font-medium">Completed on: {course.completedDate}</p>
        )}
        
        {status === 'wishlisted' && (
            <p className="font-headline text-lg font-bold text-primary mt-4">{course.price}</p>
        )}

      </CardContent>

      <CardFooter className="p-4 pt-0">
        {status === 'in-progress' && (
           <Button asChild className="w-full font-bold">
                <Link href={continueLink}>কোর্স চালিয়ে যান</Link>
           </Button>
        )}
        {status === 'completed' && (
           <div className="w-full flex flex-col gap-2">
             <Button asChild className="w-full font-bold" variant="accent">
                    <Link href="/student/certificates">সার্টিফিকেট দেখুন</Link>
             </Button>
             <Button asChild className="w-full" variant="outline">
                    <Link href={`/student/my-courses/${course.id}/reviews`}><Star className="mr-2 h-4 w-4"/>রিভিউ দিন</Link>
             </Button>
           </div>
        )}
         {status === 'wishlisted' && (
           <div className="w-full flex items-center gap-2">
             <Button asChild className="w-full font-bold">
                    <Link href={`/checkout/${course.id}`}>এখনই এনরোল করুন</Link>
             </Button>
             <Button variant="outline" size="icon" aria-label="Remove from wishlist" onClick={handleRemoveFromWishlist}>
                <Trash2 className="h-4 w-4" />
             </Button>
           </div>
        )}
        {status === 'archived' && (
           <Button asChild className="w-full" variant="outline">
                <Link href={courseLink}>View Archived Content</Link>
           </Button>
        )}
      </CardFooter>
    </Card>
  );
}
