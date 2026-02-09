'use client';

import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Course, Organization } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Clock, Trash2, BookmarkCheck } from "lucide-react";
import { toggleWishlistAction } from "@/app/actions/user.actions";
import { useToast } from "./ui/use-toast";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

type EnrolledCourseCardProps = {
  course: Course & { progress?: number; lastViewed?: string; completedDate?: string };
  status: 'in-progress' | 'completed' | 'wishlisted' | 'archived' | 'prebooked';
  provider?: Organization | null;
};

export function EnrolledCourseCard({ course, status, provider }: EnrolledCourseCardProps) {
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
      "flex flex-row md:flex-col h-full overflow-hidden transition-all duration-300 md:hover:shadow-xl md:hover:-translate-y-1 bg-white dark:bg-card/60 border border-border rounded-xl",
      "mb-3 md:mb-0 p-2 md:p-0"
    )}>
      <div className="relative w-[100px] xs:w-[120px] md:w-full aspect-square md:aspect-video shrink-0 overflow-hidden rounded-lg md:rounded-none">
        <Link href={courseLink}>
          <Image
            src={course.imageUrl}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 120px, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 md:group-hover:scale-110"
            data-ai-hint={course.dataAiHint}
          />
        </Link>
        {status === 'in-progress' && course.lastViewed && (
             <Badge variant="secondary" className="absolute top-2 left-2 flex items-center gap-1 text-[10px] scale-75 origin-top-left">
                <Clock className="h-3 w-3" />
                {course.lastViewed}
             </Badge>
        )}
        {status === 'prebooked' && <Badge variant="warning" className="absolute top-2 left-2 text-[10px] scale-75 origin-top-left">Pre-booked</Badge>}
      </div>

      <div className="flex-1 flex flex-col p-2 md:p-4 justify-center md:justify-start gap-1 text-left">
        <Link href={courseLink}>
          <h3 className="text-[13px] md:text-[15px] font-black leading-tight text-foreground line-clamp-2 font-headline hover:text-primary transition-colors">{course.title}</h3>
        </Link>
        
        {provider ? (
           <div className="flex items-center gap-2 mt-1">
            <p className="text-[10px] md:text-[11px] font-medium text-muted-foreground truncate">By {provider.name}</p>
          </div>
        ) : (
          <p className="text-[10px] md:text-[11px] font-medium text-muted-foreground truncate mt-1">By {course.instructors?.[0]?.name || 'RDC Instructor'}</p>
        )}

        {status === 'in-progress' && typeof course.progress === 'number' && (
          <div className="mt-2 md:mt-4">
            <div className="flex justify-between items-center mb-1">
                <p className="text-[10px] font-medium">Progress</p>
                <p className="text-[10px] font-medium text-primary">{course.progress}%</p>
            </div>
            <Progress value={course.progress} className="h-1 md:h-2 [&>div]:bg-accent" />
          </div>
        )}

        {status === 'completed' && course.completedDate && (
            <p className="text-[10px] text-green-600 mt-2 font-medium">Completed: {course.completedDate}</p>
        )}
        
        {status === 'wishlisted' && (
            <p className="text-[14px] md:text-[16px] font-black text-accent mt-2">{course.price}</p>
        )}

        <div className="mt-3 flex gap-2">
            {status === 'in-progress' && (
                <Button asChild size="sm" className="w-full font-black text-[10px] h-8 uppercase tracking-tighter">
                    <Link href={continueLink}>Continue</Link>
                </Button>
            )}
            {status === 'completed' && (
                <Button asChild size="sm" className="w-full font-black text-[10px] h-8 uppercase tracking-tighter" variant="accent">
                    <Link href="/student/certificates">Certificate</Link>
                </Button>
            )}
            {status === 'wishlisted' && (
                <>
                    <Button asChild size="sm" className="flex-grow font-black text-[10px] h-8 uppercase tracking-tighter">
                        <Link href={`/checkout/${course.id}`}>Enroll</Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleRemoveFromWishlist}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </>
            )}
            {status === 'prebooked' && (
                <Button disabled size="sm" className="w-full font-black text-[10px] h-8 uppercase tracking-tighter">
                    <BookmarkCheck className="mr-1 h-3 w-3" /> Pre-booked
                </Button>
            )}
        </div>
      </div>
    </Card>
  );
}