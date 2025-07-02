
'use client';

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Course, Organization } from "@/lib/types";
import { Button } from "./ui/button";
import { CourseCardWishlistButton } from "./course-card-wishlist-button";

type CourseCardProps = Partial<Course> & {
  partnerSubdomain?: string;
  provider?: Organization | null;
};

export function CourseCard(props: CourseCardProps) {
  const { id, title, instructors, imageUrl, category, price, dataAiHint, isArchived, isPrebooking, prebookingPrice, prebookingEndDate, partnerSubdomain, provider } = props;
  
  if (!id || !title || !imageUrl) {
    return null;
  }
  
  const isPrebookingActive = isPrebooking && prebookingEndDate && new Date(prebookingEndDate) > new Date();

  const coursePageUrl = partnerSubdomain ? `/sites/${partnerSubdomain}/courses/${id}` : `/courses/${id}`;
  const prebookUrl = partnerSubdomain ? `/sites/${partnerSubdomain}/pre-book/${id}` : `/pre-book/${id}`;
  const checkoutUrl = partnerSubdomain ? `/sites/${partnerSubdomain}/checkout/${id}` : `/checkout/${id}`;

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-lg bg-card group">
      <CardHeader className="p-0 overflow-hidden relative">
        <Link href={coursePageUrl} className="block overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            width={600}
            height={400}
            className="w-full h-auto object-cover aspect-[16/10] transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={dataAiHint}
          />
        </Link>
        <CourseCardWishlistButton courseId={id} />
        {isPrebookingActive && <Badge className="absolute top-2 left-2" variant="warning">Pre-booking</Badge>}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        {category && <Badge variant="secondary" className="mb-2">{category}</Badge>}
        <Link href={coursePageUrl}>
          <h3 className="font-headline text-base font-bold leading-snug group-hover:text-primary transition-colors">{title}</h3>
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
        ) : isArchived ? (
            <Badge variant="outline">Enrollment Closed</Badge>
        ) : (
            price && <p className="font-headline text-lg font-bold text-primary">{price}</p>
        )}
      </CardFooter>
      <div className="p-4 pt-0">
         {isPrebookingActive ? (
             <Button asChild className="w-full"><Link href={prebookUrl}>Pre-book Now</Link></Button>
         ) : !isArchived ? (
             <Button asChild className="w-full"><Link href={checkoutUrl}>Enroll Now</Link></Button>
         ) : null}
      </div>
    </Card>
  );
}
