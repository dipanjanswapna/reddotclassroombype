'use client';

import React from 'react';
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { Course, Organization } from "@/lib/types";
import { CourseCardWishlistButton } from "./course-card-wishlist-button";
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';
import { ChevronRight } from 'lucide-react';

type CourseCardProps = Partial<Course> & {
  partnerSubdomain?: string;
  provider?: Organization | null;
};

const CourseCardComponent = (props: CourseCardProps) => {
  const { id, title, instructors, imageUrl, price, discountPrice, dataAiHint, isPrebooking, prebookingPrice, prebookingEndDate, partnerSubdomain, provider, type } = props;
  const { language } = useLanguage();
  const isBn = language === 'bn';
  
  if (!id || !title || !imageUrl) {
    return null;
  }
  
  const isPrebookingActive = isPrebooking && prebookingEndDate && new Date(prebookingEndDate as string) > new Date();
  const hasDiscount = discountPrice && parseFloat(discountPrice.replace(/[^0-9.]/g, '')) > 0;
  const displayPrice = isPrebookingActive ? prebookingPrice : (hasDiscount ? discountPrice : price);

  const coursePageUrl = partnerSubdomain 
    ? `/sites/${partnerSubdomain}/courses/${id}` 
    : `/${language}/courses/${id}`;
  
  return (
    <div className={cn("relative h-full px-1", isBn && "font-bengali")}>
      <Link href={coursePageUrl} className="block h-full group">
        <Card className={cn(
          "flex flex-col h-full overflow-hidden shadow-sm border border-border rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white dark:bg-card",
          "p-3"
        )}>
          {/* Visual Container */}
          <div className="relative w-full aspect-video shrink-0 overflow-hidden rounded-lg bg-muted">
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              data-ai-hint={dataAiHint}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />

            <div className="absolute top-2 left-2 z-10">
                {isPrebookingActive ? (
                    <Badge className="bg-orange-500 text-white font-bold text-[10px] px-2.5 py-1 shadow-sm border-none">Pre-booking</Badge>
                ) : type === 'Exam' ? (
                    <Badge className="bg-red-600 text-white font-bold text-[10px] px-2.5 py-1 shadow-sm border-none">Exam Batch</Badge>
                ) : (
                    <Badge className="bg-primary text-white font-bold text-[10px] px-2.5 py-1 shadow-sm border-none">Latest</Badge>
                )}
            </div>

            <div className="hidden md:block">
                <CourseCardWishlistButton courseId={id} />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex flex-col pt-4 flex-grow text-left space-y-2">
            <div className="space-y-1">
                <h3 className={cn(
                    "text-base font-bold leading-snug text-foreground line-clamp-2 h-[3rem] group-hover:text-primary transition-colors",
                    !isBn && "font-headline"
                )}>
                {title}
                </h3>

                <div className="flex items-center gap-2">
                    {provider ? (
                        <p className="text-xs font-medium text-muted-foreground truncate">
                            {provider.name}
                        </p>
                    ) : (
                        instructors && instructors.length > 0 && (
                            <p className="text-xs font-medium text-muted-foreground truncate">
                                {instructors[0].name}
                            </p>
                        )
                    )}
                </div>
            </div>

            <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                <div className="flex flex-col">
                    {hasDiscount && (
                        <span className="text-[10px] font-medium text-muted-foreground line-through opacity-60">
                            {price}
                        </span>
                    )}
                    <span className="text-lg font-bold text-primary tracking-tight">
                        {displayPrice}
                    </span>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <ChevronRight className="w-4 h-4" />
                </div>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={cn("rounded-md px-2 py-0.5 text-xs font-bold", className)}>{children}</div>;
}

export const CourseCard = React.memo(CourseCardComponent);
