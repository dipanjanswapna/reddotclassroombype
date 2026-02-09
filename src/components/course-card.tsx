'use client';

import React from 'react';
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Course, Organization } from "@/lib/types";
import { CourseCardWishlistButton } from "./course-card-wishlist-button";
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
  const displayPrice = isPrebookingActive ? prebookingPrice : (hasDiscount ? discountPrice : price);

  const coursePageUrl = partnerSubdomain ? `/sites/${partnerSubdomain}/courses/${id}` : `/courses/${id}`;
  
  return (
    <div className="group relative">
      <Link href={coursePageUrl} className="block">
        <Card className={cn(
          "flex flex-row md:flex-col h-full overflow-hidden transition-all duration-300 md:hover:shadow-xl md:hover:-translate-y-1 bg-white dark:bg-card/60 border-0 md:border rounded-none md:rounded-xl",
          "border-b border-dashed md:border-b-border pb-4 md:pb-0 mb-0 md:mb-0 last:border-b-0 last:pb-0"
        )}>
          {/* Card Header / Image Section */}
          <div className="relative w-[120px] xs:w-[140px] md:w-full aspect-[4/3] md:aspect-video shrink-0 overflow-hidden rounded-lg md:rounded-none">
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 640px) 140px, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 md:group-hover:scale-110"
              data-ai-hint={dataAiHint}
            />
            
            {/* Corner Ribbons/Badges */}
            <div className="absolute top-0 left-0 overflow-hidden w-16 h-16 pointer-events-none">
                {isPrebookingActive ? (
                    <div className="absolute top-2 left-[-20px] rotate-[-45deg] bg-orange-500 text-white text-[8px] font-black py-0.5 px-6 shadow-md uppercase tracking-tighter">
                        Pre
                    </div>
                ) : type === 'Exam' ? (
                    <div className="absolute top-2 left-[-20px] rotate-[-45deg] bg-red-600 text-white text-[8px] font-black py-0.5 px-6 shadow-md uppercase tracking-tighter">
                        Exam
                    </div>
                ) : (
                    <div className="absolute top-2 left-[-20px] rotate-[-45deg] bg-primary text-white text-[8px] font-black py-0.5 px-6 shadow-md uppercase tracking-tighter">
                        New
                    </div>
                )}
            </div>

            <div className="hidden md:block">
                <CourseCardWishlistButton courseId={id} />
            </div>
          </div>

          {/* Card Body / Text Section */}
          <div className="flex-1 flex flex-col p-0 md:p-3 justify-center md:justify-start gap-1">
            <h3 className="text-[14px] md:text-[15px] font-black leading-tight text-foreground line-clamp-2 md:line-clamp-2 min-h-0 md:min-h-[2.5rem] font-headline group-hover:text-primary transition-colors">
              {title}
            </h3>

            <div className="flex flex-col gap-0.5">
                {provider ? (
                    <p className="text-[11px] md:text-[12px] font-medium text-muted-foreground truncate">
                        {provider.name}
                    </p>
                ) : (
                    instructors && instructors.length > 0 && (
                        <p className="text-[11px] md:text-[12px] font-medium text-muted-foreground truncate">
                            {instructors[0].name} {instructors.length > 1 ? `+${instructors.length - 1}` : ''}
                        </p>
                    )
                )}
            </div>

            <div className="mt-1 md:mt-2 flex items-center gap-2">
                <span className="text-[15px] md:text-[16px] font-black text-accent drop-shadow-sm">
                    {displayPrice}
                </span>
                {hasDiscount && (
                    <span className="text-[10px] md:text-[11px] text-muted-foreground line-through opacity-60">
                        {price}
                    </span>
                )}
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
}

export const CourseCard = React.memo(CourseCardComponent);