'use client';

import React from 'react';
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { Course, Organization } from "@/lib/types";
import { CourseCardWishlistButton } from "./course-card-wishlist-button";
import { cn } from '@/lib/utils';

type CourseCardProps = Partial<Course> & {
  partnerSubdomain?: string;
  provider?: Organization | null;
};

const CourseCardComponent = (props: CourseCardProps) => {
  const { id, title, instructors, imageUrl, price, discountPrice, dataAiHint, isPrebooking, prebookingPrice, prebookingEndDate, partnerSubdomain, provider, type } = props;
  
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
          "flex flex-row md:flex-col h-full overflow-hidden transition-all duration-300 md:hover:shadow-xl md:hover:-translate-y-1 bg-white dark:bg-card/60 border border-border rounded-xl",
          "mb-3 md:mb-0 p-2 md:p-0"
        )}>
          {/* Card Header / Image Section */}
          <div className="relative w-[100px] xs:w-[120px] md:w-full aspect-square md:aspect-video shrink-0 overflow-hidden rounded-lg md:rounded-none">
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 640px) 120px, (max-width: 1024px) 33vw, 25vw"
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
          <div className="flex-1 flex flex-col p-2 md:p-4 justify-center md:justify-start gap-1 text-left">
            <h3 className="text-[13px] md:text-[15px] font-black leading-tight text-foreground line-clamp-2 font-headline group-hover:text-primary transition-colors text-left">
              {title}
            </h3>

            <div className="flex flex-col gap-0.5 text-left">
                {provider ? (
                    <p className="text-[10px] md:text-[11px] font-medium text-muted-foreground truncate">
                        {provider.name}
                    </p>
                ) : (
                    instructors && instructors.length > 0 && (
                        <p className="text-[10px] md:text-[11px] font-medium text-muted-foreground truncate">
                            {instructors[0].name} {instructors.length > 1 ? `+${instructors.length - 1}` : ''}
                        </p>
                    )
                )}
            </div>

            <div className="mt-1 md:mt-2 flex items-center gap-2 text-left">
                <span className="text-[14px] md:text-[16px] font-black text-accent drop-shadow-sm">
                    {displayPrice}
                </span>
                {hasDiscount && (
                    <span className="text-[9px] md:text-[10px] text-muted-foreground line-through opacity-60">
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
