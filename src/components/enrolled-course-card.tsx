'use client';

import { useState } from "react";
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
  const [isImageLoading, setIsImageLoading] = useState(true);
  
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
    <div className="h-full min-w-[280px] flex-1 max-w-[400px]">
      <Card className={cn(
          "flex flex-col h-full overflow-hidden transition-all duration-500 rounded-xl border border-primary/20 hover:border-primary/60 bg-gradient-to-br from-card to-secondary/30 dark:from-card dark:to-primary/10 group enrolled-course-card",
          className
      )}>
        <CardHeader className="p-0 relative">
          <Link href={courseLink}>
            <div className={cn(
                "relative aspect-[16/10] overflow-hidden bg-muted",
                isImageLoading && "animate-pulse"
            )}>
                <Image
                src={course.imageUrl}
                alt={course.title}
                width={600}
                height={400}
                className={cn(
                    "w-full h-auto object-cover aspect-[16/10] transition-all duration-700 group-hover:scale-110",
                    isImageLoading ? "scale-105 blur-lg grayscale opacity-50" : "scale-100 blur-0 grayscale-0 opacity-100"
                )}
                onLoadingComplete={() => setIsImageLoading(false)}
                data-ai-hint={course.dataAiHint}
                />
            </div>
          </Link>
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {status === 'in-progress' && course.lastViewed && (
                <Badge variant="secondary" className="flex items-center gap-1 bg-background/80 backdrop-blur-sm">
                    <Clock className="h-3 w-3" />
                    Last: {course.lastViewed}
                </Badge>
            )}
            {status === 'prebooked' && <Badge variant="warning">Pre-booked</Badge>}
          </div>
        </CardHeader>

        <CardContent className="p-4 flex flex-col flex-grow">
          <Link href={courseLink}>
            <h3 className="font-headline text-base font-bold leading-snug hover:text-primary transition-colors line-clamp-2">{course.title}</h3>
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
              <div className="space-y-2">
                  <div className="flex justify-between items-center">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Course Progress</p>
                      <p className="text-sm font-bold text-primary">{course.progress}%</p>
                  </div>
                  <Progress value={course.progress} className="h-1.5 [&>div]:bg-accent" />
              </div>
              )}

              {status === 'completed' && course.completedDate && (
                  <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <p className="text-xs font-bold uppercase tracking-wider">Completed</p>
                  </div>
              )}
              
              {status === 'wishlisted' && (
                  <p className="font-headline text-lg font-bold text-primary">{course.price}</p>
              )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          {status === 'in-progress' && (
             <Button asChild className="w-full font-bold shadow-md active:shadow-inner">
                  <Link href={continueLink}>Continue Learning</Link>
             </Button>
          )}
          {status === 'completed' && (
             <div className="w-full flex flex-col gap-2">
               <Button asChild className="w-full font-bold shadow-md" variant="accent">
                      <Link href="/student/certificates">View Certificate</Link>
               </Button>
               <Button asChild className="w-full" variant="outline">
                      <Link href={`/student/my-courses/${course.id}/reviews`}><Star className="mr-2 h-4 w-4"/>Rate Course</Link>
               </Button>
             </div>
          )}
           {status === 'wishlisted' && (
             <div className="w-full flex items-center gap-2">
               <Button asChild className="w-full font-bold shadow-md flex-grow">
                      <Link href={`/checkout/${course.id}`}>Enroll Now</Link>
               </Button>
               <Button variant="outline" size="icon" className="shrink-0" aria-label="Remove from wishlist" onClick={handleRemoveFromWishlist}>
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
             <Button disabled className="w-full font-bold opacity-80">
                  <BookmarkCheck className="mr-2 h-4 w-4" />
                  Pre-booked
             </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
