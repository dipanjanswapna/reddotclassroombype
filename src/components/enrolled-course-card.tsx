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
import { motion } from "framer-motion";

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
    <motion.div 
      whileHover={{ y: -3 }} 
      transition={{ type: "spring", stiffness: 300 }}
      className="h-full w-full"
    >
      <Card className={cn(
        "flex flex-col h-full overflow-hidden transition-all duration-500 shadow-xl bg-card border-primary/20 rounded-xl",
        "p-2.5 md:p-3"
      )}>
        <div className="relative w-full aspect-video shrink-0 overflow-hidden rounded-lg shadow-inner bg-black/5">
          <Link href={courseLink}>
            <Image
              src={course.imageUrl}
              alt={course.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              data-ai-hint={course.dataAiHint}
            />
          </Link>
          {status === 'in-progress' && course.lastViewed && (
               <Badge variant="secondary" className="absolute top-2 left-2 flex items-center gap-1 text-[8px] font-black uppercase tracking-widest bg-white/80 backdrop-blur-md border-white/50 text-foreground">
                  <Clock className="h-2.5 w-2.5 text-primary" />
                  {course.lastViewed}
               </Badge>
          )}
          {status === 'prebooked' && <Badge variant="warning" className="absolute top-2 left-2 text-[8px] font-black uppercase tracking-widest shadow-lg">Pre-booked</Badge>}
        </div>

        <div className="flex-1 flex flex-col pt-3 pb-1 space-y-3 text-left">
          <div className="space-y-0.5">
              <Link href={courseLink}>
              <h3 className="text-sm md:text-base font-black leading-tight text-foreground line-clamp-2 font-headline hover:text-primary transition-colors text-left uppercase tracking-tight">
                  {course.title}
              </h3>
              </Link>
              {provider ? (
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate">By {provider.name}</p>
              ) : (
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate mt-0.5">Mentor: {course.instructors?.[0]?.name || 'RDC Expert'}</p>
              )}
          </div>

          {status === 'in-progress' && typeof course.progress === 'number' && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                  <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Progress</span>
                  <span className="text-[10px] font-black text-primary">{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-1.5 rounded-full bg-white/50 [&>div]:bg-accent shadow-inner" />
            </div>
          )}

          {status === 'completed' && course.completedDate && (
              <div className="flex items-center gap-1.5 bg-green-500/10 p-1.5 rounded-lg border border-green-500/20">
                  <BookmarkCheck className="w-3 h-3 text-green-600" />
                  <p className="text-[8px] text-green-700 font-black uppercase tracking-widest">Completed: {course.completedDate}</p>
              </div>
          )}
          
          {status === 'wishlisted' && (
              <p className="text-lg font-black text-primary tracking-tighter mt-0.5">{course.price}</p>
          )}

          <div className="pt-1 flex gap-2 mt-auto">
              {status === 'in-progress' && (
                  <Button asChild size="sm" className="w-full font-black text-[10px] h-9 md:h-10 uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20">
                      <Link href={continueLink} className="flex items-center justify-center gap-1.5">
                          চালিয়ে যান <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                  </Button>
              )}
              {status === 'completed' && (
                  <Button asChild size="sm" className="w-full font-black text-[10px] h-9 md:h-10 uppercase tracking-widest rounded-xl" variant="accent">
                      <Link href="/student/certificates">সার্টিফিকেট নিন</Link>
                  </Button>
              )}
              {status === 'wishlisted' && (
                  <>
                      <Button asChild size="sm" className="flex-grow font-black text-[10px] h-9 md:h-10 uppercase tracking-widest rounded-xl">
                          <Link href={`/checkout/${course.id}`}>এনরোল করুন</Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 md:h-10 md:w-10 text-destructive hover:bg-destructive/10 rounded-xl" onClick={handleRemoveFromWishlist}>
                          <Trash2 className="h-4 w-4" />
                      </Button>
                  </>
              )}
              {status === 'prebooked' && (
                  <Button disabled size="sm" className="w-full font-black text-[10px] h-9 md:h-10 uppercase tracking-widest rounded-xl bg-muted text-muted-foreground border-white/20">
                      <BookmarkCheck className="mr-1.5 h-3.5 w-3.5" /> Pre-booked
                  </Button>
              )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}