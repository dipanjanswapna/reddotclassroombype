'use client';

import React from 'react';
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Course, Organization } from "@/lib/types";
import { CourseCardWishlistButton } from "./course-card-wishlist-button";
import { Button } from "./ui/button";

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
    <Card className="glassmorphism-card bg-white/60 dark:bg-card/40 border-white/30 dark:border-white/10 flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 group">
      <CardHeader className="p-0 overflow-hidden relative">
        <Link href={coursePageUrl} className="block overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            width={600}
            height={400}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="w-full h-auto object-cover aspect-[16/10] transition-transform duration-500 group-hover:scale-105"
            data-ai-hint={dataAiHint}
          />
        </Link>
        <CourseCardWishlistButton courseId={id} />
        {isPrebookingActive && <Badge className="absolute top-3 left-3 shadow-lg" variant="warning">Pre-booking</Badge>}
        {type === 'Exam' && !isPrebookingActive && <Badge className="absolute top-3 left-3 shadow-lg" variant="destructive">Exam Batch</Badge>}
        {type === 'Offline' && !isPrebookingActive && <Badge className="absolute top-3 left-3 shadow-lg" variant="secondary">Offline</Badge>}
        {type === 'Hybrid' && !isPrebookingActive && <Badge className="absolute top-3 left-3 shadow-lg" variant="secondary">Hybrid</Badge>}
      </CardHeader>
      <CardContent className="p-5 flex-grow">
        {category && <Badge variant="secondary" className="mb-3 font-bold tracking-tighter uppercase text-[10px]">{category}</Badge>}
        <Link href={coursePageUrl}>
          <CardTitle className="text-base font-black leading-tight group-hover:text-primary transition-colors line-clamp-2">{title}</CardTitle>
        </Link>
        {provider ? (
           <div className="flex items-center gap-2 mt-3">
            <Image src={provider.logoUrl} alt={provider.name} width={18} height={18} className="rounded-full bg-muted object-contain shadow-sm"/>
            <p className="text-xs font-bold text-muted-foreground">By {provider.name}</p>
          </div>
        ) : (
          instructors && instructors.length > 0 && <p className="text-muted-foreground font-medium text-xs mt-3 uppercase tracking-wider">By {instructors[0].name}</p>
        )}
      </CardContent>
      <CardFooter className="p-5 pt-0">
        {isPrebookingActive ? (
          <div className="flex flex-col items-start w-full">
            <p className="text-xs text-muted-foreground line-through opacity-70">{price}</p>
            <p className="font-headline text-xl font-black text-primary">{prebookingPrice}</p>
          </div>
        ) : hasDiscount ? (
          <div className="flex items-baseline gap-2">
            <p className="font-headline text-xl font-black text-primary">{discountPrice}</p>
            <p className="text-sm text-muted-foreground line-through opacity-70">{price}</p>
          </div>
        ) : isArchived ? (
            null
        ) : (
            price && <p className="font-headline text-xl font-black text-primary">{price}</p>
        )}
      </CardFooter>
      <div className="p-5 pt-0 mt-auto">
         {isArchived ? (
            <Badge variant="outline" className="w-full justify-center h-11 text-sm font-bold">Enrollment Closed</Badge>
         ) : (
            <Button asChild className="w-full font-black text-sm h-11 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 rounded-xl">
                 <Link href={coursePageUrl}>View Details</Link>
             </Button>
         )}
      </div>
    </Card>
  );
}

export const CourseCard = React.memo(CourseCardComponent);