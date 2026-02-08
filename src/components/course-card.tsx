'use client';

import React, { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Course, Organization } from "@/lib/types";
import { CourseCardWishlistButton } from "./course-card-wishlist-button";
import { Button } from "./ui/button";
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type CourseCardProps = Partial<Course> & {
  partnerSubdomain?: string;
  provider?: Organization | null;
  className?: string;
};

const CourseCardComponent = (props: CourseCardProps) => {
  const { id, title, instructors, imageUrl, category, price, discountPrice, dataAiHint, isArchived, isPrebooking, prebookingPrice, prebookingEndDate, partnerSubdomain, provider, type, className } = props;
  const [isImageLoading, setIsImageLoading] = useState(true);
  
  if (!id || !title || !imageUrl) {
    return null;
  }
  
  const isPrebookingActive = isPrebooking && prebookingEndDate && new Date(prebookingEndDate as string) > new Date();
  const hasDiscount = discountPrice && parseFloat(discountPrice.replace(/[^0-9.]/g, '')) > 0;

  const coursePageUrl = partnerSubdomain ? `/sites/${partnerSubdomain}/courses/${id}` : `/courses/${id}`;
  
  return (
    <div className="h-full w-full">
      <Card className={cn(
          "flex flex-col h-full overflow-hidden transition-all duration-500 group border border-primary/20 hover:border-primary/60 bg-gradient-to-br from-card to-secondary/30 dark:from-card dark:to-primary/10 shadow-lg hover:shadow-xl",
          className
      )}>
        <CardHeader className="p-0 overflow-hidden relative">
          <Link href={coursePageUrl} className="block overflow-hidden bg-muted">
            <div className={cn(
                "relative aspect-[16/10] overflow-hidden",
                isImageLoading && "animate-pulse"
            )}>
                <Image
                src={imageUrl}
                alt={title}
                width={600}
                height={400}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className={cn(
                    "w-full h-auto object-cover aspect-[16/10] transition-all duration-700 group-hover:scale-110",
                    isImageLoading ? "scale-105 blur-lg grayscale opacity-50" : "scale-100 blur-0 grayscale-0 opacity-100"
                )}
                onLoadingComplete={() => setIsImageLoading(false)}
                data-ai-hint={dataAiHint}
                />
            </div>
          </Link>
          <CourseCardWishlistButton courseId={id} />
          <AnimatePresence>
            {!isImageLoading && (
                <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute top-2 left-2 flex flex-col gap-1 z-10"
                >
                    {isPrebookingActive && <Badge variant="warning">Pre-booking</Badge>}
                    {type === 'Exam' && !isPrebookingActive && <Badge variant="destructive">Exam Batch</Badge>}
                    {type === 'Offline' && !isPrebookingActive && <Badge variant="secondary">Offline</Badge>}
                    {type === 'Hybrid' && !isPrebookingActive && <Badge variant="secondary">Hybrid</Badge>}
                </motion.div>
            )}
          </AnimatePresence>
        </CardHeader>
        <CardContent className="p-4 flex flex-col flex-grow">
          {category && <Badge variant="secondary" className="mb-2 w-fit">{category}</Badge>}
          <Link href={coursePageUrl}>
            <CardTitle className="text-base font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">{title}</CardTitle>
          </Link>
          {provider ? (
             <div className="flex items-center gap-2 mt-2">
              <Image src={provider.logoUrl} alt={provider.name} width={16} height={16} className="rounded-full bg-muted object-contain"/>
              <p className="text-xs text-muted-foreground">By {provider.name}</p>
            </div>
          ) : (
            instructors && instructors.length > 0 && <p className="text-muted-foreground text-sm mt-2">By {instructors[0].name}</p>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0">
          {isPrebookingActive ? (
            <div className="flex flex-col items-start w-full">
              <p className="text-sm text-muted-foreground line-through">{price}</p>
              <p className="font-headline text-lg font-bold text-primary">{prebookingPrice}</p>
            </div>
          ) : hasDiscount ? (
            <div className="flex items-baseline gap-2">
              <p className="font-headline text-lg font-bold text-primary">{discountPrice}</p>
              <p className="text-sm text-muted-foreground line-through">{price}</p>
            </div>
          ) : isArchived ? (
              <p className="text-sm text-muted-foreground italic">Registration Closed</p>
          ) : (
              price && <p className="font-headline text-lg font-bold text-primary">{price}</p>
          )}
        </CardFooter>
        <div className="p-4 pt-0 mt-auto">
           {isArchived ? (
              <Button disabled variant="outline" className="w-full">Closed</Button>
           ) : (
              <Button asChild className="w-full font-bold bg-green-600 hover:bg-green-700 shadow-md active:shadow-inner transition-all">
                   <Link href={coursePageUrl}>View Details</Link>
               </Button>
           )}
        </div>
      </Card>
    </div>
  );
}

export const CourseCard = React.memo(CourseCardComponent);
