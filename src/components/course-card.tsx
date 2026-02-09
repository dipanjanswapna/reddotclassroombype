'use client';

import React from 'react';
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Course, Organization } from "@/lib/types";
import { CourseCardWishlistButton } from "./course-card-wishlist-button";
import { Button } from "./ui/button";
import { cn } from '@/lib/utils';

type CourseCardProps = Partial<Course> & {
  partnerSubdomain?: string;
  provider?: Organization | null;
};

const CourseCardComponent = (props: CourseCardProps) => {
  const { id, title, instructors, imageUrl, category, price, discountPrice, dataAiHint, isArchived, isPrebooking, prebookingPrice, prebookingEndDate, partnerSubdomain, provider, type } = props;
  
  if (!id || !title || !imageUrl) {
    return null;
  }
  
  const isPrebookingActive = isPrebooking && prebookingEndDate && new Date(prebookingEndDate as string) > new Date();
  const hasDiscount = discountPrice && parseFloat(discountPrice.replace(/[^0-9.]/g, '')) > 0;

  const coursePageUrl = partnerSubdomain ? `/sites/${partnerSubdomain}/courses/${id}` : `/courses/${id}`;
  
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group bg-white dark:bg-card/60 border-border rounded-xl">
      <CardHeader className="p-0 overflow-hidden relative">
        <Link href={coursePageUrl} className="block overflow-hidden aspect-video">
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            data-ai-hint={dataAiHint}
          />
        </Link>
        <CourseCardWishlistButton courseId={id} />
        
        {/* Status Badges - Compact */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isPrebookingActive && <Badge className="bg-orange-500 text-[8px] h-4 px-1 font-bold uppercase" variant="default">Pre-book</Badge>}
            {type === 'Exam' && !isPrebookingActive && <Badge className="bg-red-600 text-[8px] h-4 px-1 font-bold uppercase" variant="default">Exam</Badge>}
        </div>
      </CardHeader>

      <CardContent className="p-2 flex flex-col flex-grow gap-1">
        <Link href={coursePageUrl}>
          <CardTitle className="text-[13px] font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2 min-h-[2rem] font-headline">
            {title}
          </CardTitle>
        </Link>

        <div className="mt-auto">
            {provider ? (
            <div className="flex items-center gap-1 pt-0.5">
                <p className="text-[10px] font-medium text-muted-foreground truncate">By {provider.name}</p>
            </div>
            ) : (
            instructors && instructors.length > 0 && (
                <p className="text-muted-foreground font-medium text-[10px] pt-0.5 truncate">
                    By {instructors[0].name}
                </p>
            )
            )}
        </div>
      </CardContent>

      <CardFooter className="px-2 pb-2 pt-0 flex items-center justify-between">
        <div className="flex items-baseline gap-1.5">
            {isPrebookingActive ? (
                <>
                    <span className="text-sm font-bold text-accent">{prebookingPrice}</span>
                    <span className="text-[9px] text-muted-foreground line-through">{price}</span>
                </>
            ) : hasDiscount ? (
                <>
                    <span className="text-sm font-bold text-accent">{discountPrice}</span>
                    <span className="text-[9px] text-muted-foreground line-through">{price}</span>
                </>
            ) : isArchived ? (
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Archived</span>
            ) : (
                price && <span className="text-sm font-bold text-accent">{price}</span>
            )}
        </div>
        
        {!isArchived && (
            <Button variant="ghost" size="sm" asChild className="h-6 px-1.5 text-[9px] font-bold uppercase text-primary hover:bg-primary/10">
                <Link href={coursePageUrl}>Details</Link>
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export const CourseCard = React.memo(CourseCardComponent);
