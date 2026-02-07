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
  className?: string;
};

const CourseCardComponent = (props: CourseCardProps) => {
  const { id, title, instructors, imageUrl, category, price, discountPrice, dataAiHint, isArchived, isPrebooking, prebookingPrice, prebookingEndDate, partnerSubdomain, provider, type, className } = props;
  
  if (!id || !title || !imageUrl) {
    return null;
  }
  
  const isPrebookingActive = isPrebooking && prebookingEndDate && new Date(prebookingEndDate as string) > new Date();
  const hasDiscount = discountPrice && parseFloat(discountPrice.replace(/[^0-9.]/g, '')) > 0;

  const coursePageUrl = partnerSubdomain ? `/sites/${partnerSubdomain}/courses/${id}` : `/courses/${id}`;
  
  return (
    <Card className={cn(
        "glassmorphism-card flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group min-w-[280px] flex-1 max-w-[400px]",
        className
    )}>
      <CardHeader className="p-0 overflow-hidden relative">
        <Link href={coursePageUrl} className="block overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            width={600}
            height={400}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="w-full h-auto object-cover aspect-[16/10] transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={dataAiHint}
          />
        </Link>
        <CourseCardWishlistButton courseId={id} />
        {isPrebookingActive && <Badge className="absolute top-2 left-2" variant="warning">Pre-booking</Badge>}
        {type === 'Exam' && !isPrebookingActive && <Badge className="absolute top-2 left-2" variant="destructive">Exam Batch</Badge>}
        {type === 'Offline' && !isPrebookingActive && <Badge className="absolute top-2 left-2" variant="secondary">Offline</Badge>}
        {type === 'Hybrid' && !isPrebookingActive && <Badge className="absolute top-2 left-2" variant="secondary">Hybrid</Badge>}
      </CardHeader>
      <CardContent className="p-4 flex flex-col flex-grow">
        {category && <Badge variant="secondary" className="mb-2">{category}</Badge>}
        <Link href={coursePageUrl}>
          <CardTitle className="text-base leading-snug group-hover:text-primary transition-colors">{title}</CardTitle>
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
            null
        ) : (
            price && <p className="font-headline text-lg font-bold text-primary">{price}</p>
        )}
      </CardFooter>
      <div className="p-4 pt-0">
         {isArchived ? (
            <Badge variant="outline">Enrollment Closed</Badge>
         ) : (
            <Button asChild className="w-full font-bold bg-green-600 hover:bg-green-700">
                 <Link href={coursePageUrl}>View Details</Link>
             </Button>
         )}
      </div>
    </Card>
  );
}

export const CourseCard = React.memo(CourseCardComponent);