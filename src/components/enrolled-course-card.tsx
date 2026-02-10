
'use client';

import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Course, Organization } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Clock, Trash2, BookmarkCheck, ChevronRight } from "lucide-react";
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
      "flex flex-col h-full overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5 bg-[#eef2ed] dark:bg-card/40 border border-white/40 rounded-2xl md:rounded-3xl",
      "p-3 md:p-4 mb-4"
    )}>
      <div className="relative w-full aspect-video shrink-0 overflow-hidden rounded-xl md:rounded-2xl shadow-inner bg-black/5">
        <Link href={courseLink}>
          <Image
            src={course.imageUrl}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            data-ai-hint={course.dataAiHint}
          />
        </Link>
        {status === 'in-progress' && course.lastViewed && (
             <Badge variant="secondary" className="absolute top-3 left-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-white/80 backdrop-blur-md border-white/50 text-foreground">
                <Clock className="h-3 w-3 text-primary" />
                {course.lastViewed}
             </Badge>
        )}
        {status === 'prebooked' && <Badge variant="warning" className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest shadow-lg">Pre-booked</Badge>}
      </div>

      <div className="flex-1 flex flex-col pt-4 pb-2 space-y-3 text-left">
        <div className="space-y-1">
            <Link href={courseLink}>
            <h3 className="text-base md:text-lg font-black leading-tight text-foreground line-clamp-2 font-headline hover:text-primary transition-colors text-left uppercase tracking-tight">
                {course.title}
            </h3>
            </Link>
            {provider ? (
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest truncate">Provided by {provider.name}</p>
            ) : (
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest truncate mt-1">Mentor: {course.instructors?.[0]?.name || 'RDC Expert'}</p>
            )}
        </div>

        {status === 'in-progress' && typeof course.progress === 'number' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Learning Progress</span>
                <span className="text-xs font-black text-primary">{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-2 rounded-full bg-white/50 [&>div]:bg-accent shadow-inner" />
          </div>
        )}

        {status === 'completed' && course.completedDate && (
            <div className="flex items-center gap-2 bg-green-500/10 p-2 rounded-lg border border-green-500/20">
                <BookmarkCheck className="w-4 h-4 text-green-600" />
                <p className="text-[10px] text-green-700 font-black uppercase tracking-widest">Completed on {course.completedDate}</p>
            </div>
        )}
        
        {status === 'wishlisted' && (
            <p className="text-xl font-black text-primary tracking-tighter mt-1">{course.price}</p>
        )}

        <div className="pt-2 flex gap-3 mt-auto">
            {status === 'in-progress' && (
                <Button asChild size="lg" className="w-full font-black text-xs h-12 uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20">
                    <Link href={continueLink} className="flex items-center justify-center gap-2">
                        Continue Learning <ChevronRight className="w-4 h-4" />
                    </Link>
                </Button>
            )}
            {status === 'completed' && (
                <Button asChild size="lg" className="w-full font-black text-xs h-12 uppercase tracking-widest rounded-xl" variant="accent">
                    <Link href="/student/certificates">Claim Certificate</Link>
                </Button>
            )}
            {status === 'wishlisted' && (
                <>
                    <Button asChild size="lg" className="flex-grow font-black text-xs h-12 uppercase tracking-widest rounded-xl">
                        <Link href={`/checkout/${course.id}`}>Enroll Now</Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-12 w-12 text-destructive hover:bg-destructive/10 rounded-xl" onClick={handleRemoveFromWishlist}>
                        <Trash2 className="h-5 w-5" />
                    </Button>
                </>
            )}
            {status === 'prebooked' && (
                <Button disabled size="lg" className="w-full font-black text-xs h-12 uppercase tracking-widest rounded-xl bg-muted text-muted-foreground border-white/20">
                    <BookmarkCheck className="mr-2 h-4 w-4" /> Securely Pre-booked
                </Button>
            )}
        </div>
      </div>
    </Card>
  );
}
