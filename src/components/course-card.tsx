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
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5 group bg-white/80 dark:bg-card/60 backdrop-blur-md border-white/40 dark:border-white/10 rounded-2xl">
      <CardHeader className="p-0 overflow-hidden relative">
        <Link href={coursePageUrl} className="block overflow-hidden aspect-[16/10]">
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            data-ai-hint={dataAiHint}
          />
        </Link>
        <CourseCardWishlistButton courseId={id} />
        
        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isPrebookingActive && <Badge className="shadow-lg bg-orange-500 hover:bg-orange-600 text-[10px] font-black uppercase tracking-tighter" variant="default">Pre-booking</Badge>}
            {type === 'Exam' && !isPrebookingActive && <Badge className="shadow-lg bg-red-600 hover:bg-red-700 text-[10px] font-black uppercase tracking-tighter" variant="default">Exam Batch</Badge>}
            {(type === 'Offline' || type === 'Hybrid') && !isPrebookingActive && <Badge className="shadow-lg bg-blue-600 hover:bg-blue-700 text-[10px] font-black uppercase tracking-tighter" variant="default">{type}</Badge>}
        </div>
      </CardHeader>

      <CardContent className="p-4 flex flex-col flex-grow gap-2">
        <div className="flex justify-between items-start gap-2">
            {category && <Badge variant="secondary" className="font-black tracking-tighter uppercase text-[9px] px-2 py-0 h-5 bg-primary/10 text-primary border-primary/20">{category}</Badge>}
        </div>
        
        <Link href={coursePageUrl}>
          <CardTitle className="text-[15px] md:text-base font-black leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
            {title}
          </CardTitle>
        </Link>

        {provider ? (
           <div className="flex items-center gap-2 mt-auto pt-2">
            <Image src={provider.logoUrl} alt={provider.name} width={16} height={16} className="rounded-full bg-muted object-contain shadow-sm border border-white/20"/>
            <p className="text-[11px] font-bold text-muted-foreground truncate">By {provider.name}</p>
          </div>
        ) : (
          instructors && instructors.length > 0 && (
            <p className="text-muted-foreground font-bold text-[11px] mt-auto pt-2 uppercase tracking-tight truncate">
                By {instructors[0].name}
            </p>
          )
        )}
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0 flex flex-col gap-3">
        <div className="flex items-center justify-between w-full">
            {isPrebookingActive ? (
                <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground line-through font-bold opacity-60">{price}</span>
                    <span className="text-lg font-black text-accent">{prebookingPrice}</span>
                </div>
            ) : hasDiscount ? (
                <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground line-through font-bold opacity-60">{price}</span>
                    <span className="text-lg font-black text-accent">{discountPrice}</span>
                </div>
            ) : isArchived ? (
                <span className="text-sm font-bold text-muted-foreground">Archived</span>
            ) : (
                price && <span className="text-lg font-black text-accent">{price}</span>
            )}
        </div>

        {isArchived ? (
            <Button disabled className="w-full h-10 rounded-xl bg-muted text-muted-foreground font-black text-xs uppercase tracking-widest">Enrollment Closed</Button>
        ) : (
            <Button asChild className="w-full h-10 rounded-xl font-black text-xs uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-300">
                <Link href={coursePageUrl}>View Details</Link>
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export const CourseCard = React.memo(CourseCardComponent);