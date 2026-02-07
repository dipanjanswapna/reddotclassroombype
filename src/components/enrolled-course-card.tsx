'use client';

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Course, Organization } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, Trash2, BookmarkCheck } from "lucide-react";
import { toggleWishlistAction } from "@/app/actions/user.actions";
import { useToast } from "./ui/use-toast";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

type EnrolledCourseCardProps = {
  course: Course & { progress?: number; lastViewed?: string; completedDate?: string };
  status: 'in-progress' | 'completed' | 'wishlisted' | 'archived' | 'prebooked';
  provider?: Organization | null;
  className?: string;
};

export function EnrolledCourseCard({ course, status, provider, className }: EnrolledCourseCardProps) {
  const { toast } = useToast();
  const { userInfo, refreshUserInfo } = useAuth();
  
  const courseLink = (status === 'in-progress' || status === 'archived' || status === 'prebooked') ? `/student/my-courses/${course.id}` : `/courses/${course.id}`;
  const continueLink = status === 'in-progress' ? `/student/my-courses/${course.id}` : '#';
  
  const handleRemoveFromWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!userInfo || !course.id) return;
    
    const result = await toggleWishlistAction(userInfo.id!, course.id);

    if (result.success) {
      await refreshUserInfo();
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
    <Card className={cn(
        "flex flex-col h-full overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 rounded-lg bg-card group enrolled-course-card min-w-[280px] flex-1 max-w-[400px]",
        className
    )}>
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
        {status === 'prebooked' && <Badge variant="warning" className="absolute top-2 left-2 flex items-center gap-1">Pre-booked</Badge>}
      </CardHeader>

      <CardContent className="p-4 flex flex-col flex-grow">
        <Link href={courseLink}>
          <h3 className="font-headline text-base font-bold leading-snug hover:text-primary transition-colors">{course.title}</h3>
        </Link>
        {provider ? (
           <div className="flex items-center gap-2 mt-2">
            <Image src={provider.logoUrl} alt={provider.name} width={16} height={16} className="rounded-full bg-muted object-contain"/>
            <p className="text-xs text-muted-foreground">By {provider.name}</p>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm mt-1">By {course.instructors?.[0]?.name || 'RDC Instructor'}</p>
        )}

        <div className="mt-auto pt-4">
            {status === 'in-progress' && typeof course.progress === 'number' && (
            <div>
                <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium">Progress</p>
                    <p className="text-sm font-medium text-primary">{course.progress}%</p>
                </div>
                <Progress value={course.progress} className="h-2 [&>div]:bg-accent" />
            </div>
            )}

            {status === 'completed' && course.completedDate && (
                <p className="text-sm text-green-600 font-medium">Completed on: {course.completedDate}</p>
            )}
            
            {status === 'wishlisted' && (
                <p className="font-headline text-lg font-bold text-primary">{course.price}</p>
            )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {status === 'in-progress' && (
           <Button asChild className="w-full font-bold">
                <Link href={continueLink}>Continue Learning</Link>
           </Button>
        )}
        {status === 'completed' && (
           <div className="w-full flex flex-col gap-2">
             <Button asChild className="w-full font-bold" variant="accent">
                    <Link href="/student/certificates">View Certificate</Link>
             </Button>
             <Button asChild className="w-full" variant="outline">
                    <Link href={`/student/my-courses/${course.id}/reviews`}><Star className="mr-2 h-4 w-4"/>Rate Course</Link>
             </Button>
           </div>
        )}
         {status === 'wishlisted' && (
           <div className="w-full flex items-center gap-2">
             <Button asChild className="w-full font-bold">
                    <Link href={`/checkout/${course.id}`}>Enroll Now</Link>
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
        {status === 'prebooked' && (
           <Button disabled className="w-full font-bold">
                <BookmarkCheck className="mr-2 h-4 w-4" />
                Pre-booked
           </Button>
        )}
      </CardFooter>
    </Card>
  );
}