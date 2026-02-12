'use client';

import React from 'react';
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { Course, Organization } from "@/lib/types";
import { CourseCardWishlistButton } from "./course-card-wishlist-button";
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';

type CourseCardProps = Partial<Course> & {
  partnerSubdomain?: string;
  provider?: Organization | null;
};

const CourseCardComponent = (props: CourseCardProps) => {
  const { id, title, instructors, imageUrl, price, discountPrice, dataAiHint, isPrebooking, prebookingPrice, prebookingEndDate, partnerSubdomain, provider, type } = props;
  const { language } = useLanguage();
  
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
    <div className="relative h-full px-1">
      <Link href={coursePageUrl} className="block h-full group">
        <Card className={cn(
          "flex flex-col h-full overflow-hidden shadow-xl border-primary/5 rounded-[20px] transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 bg-card",
          "p-2.5"
        )}>
          {/* Visual Container */}
          <div className="relative w-full aspect-video shrink-0 overflow-hidden rounded-[16px] shadow-inner bg-black/5">
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              data-ai-hint={dataAiHint}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

            <div className="absolute top-2 left-2 z-10">
                {isPrebookingActive ? (
                    <Badge className="bg-orange-500 text-white font-black text-[8px] uppercase tracking-widest px-2.5 py-1 animate-pulse border-none shadow-lg">PRE-BOOK</Badge>
                ) : type === 'Exam' ? (
                    <Badge className="bg-red-600 text-white font-black text-[8px] uppercase tracking-widest px-2.5 py-1 border-none shadow-lg">EXAM BATCH</Badge>
                ) : (
                    <Badge className="bg-primary text-white font-black text-[8px] uppercase tracking-widest px-2.5 py-1 border-none shadow-lg">LATEST</Badge>
                )}
            </div>

            <div className="hidden md:block">
                <CourseCardWishlistButton courseId={id} />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex flex-col pt-4 px-1.5 flex-grow text-left space-y-3">
            <div className="space-y-1.5">
                <h3 className="text-sm md:text-base font-black leading-tight text-foreground line-clamp-2 font-headline uppercase tracking-tight group-hover:text-primary transition-colors h-[2.5rem] md:h-[3rem]">
                {title}
                </h3>

                <div className="flex items-center gap-2">
                    {provider ? (
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate max-w-full">
                            {provider.name}
                        </p>
                    ) : (
                        instructors && instructors.length > 0 && (
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate max-w-full">
                                {instructors[0].name}
                            </p>
                        )
                    )}
                </div>
            </div>

            <div className="mt-auto pt-3 border-t border-primary/5 flex items-center justify-between">
                <div className="flex flex-col">
                    {hasDiscount && (
                        <span className="text-[9px] font-black text-muted-foreground line-through decoration-primary/20 opacity-60">
                            {price}
                        </span>
                    )}
                    <span className="text-lg font-black text-primary tracking-tighter leading-none">
                        {displayPrice}
                    </span>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
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
    return <div className={cn("rounded-full px-2 py-0.5 text-xs font-bold", className)}>{children}</div>;
}

export const CourseCard = React.memo(CourseCardComponent);
