
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Autoplay from 'embla-carousel-autoplay';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { Organization } from '@/lib/types';

export function CollaborationsCarousel({ organizations }: { organizations: Organization[] }) {
  const { language } = useLanguage();
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full"
      opts={{ align: 'start', loop: organizations.length > 2 }}
    >
      <CarouselContent>
        {organizations.map((org) => (
          <CarouselItem key={org.id} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Card className="h-full flex flex-col p-6 text-center items-center shadow-lg transition-all hover:shadow-2xl bg-[#eef2ed] dark:bg-card/50 backdrop-blur-sm border border-white/20">
                <CardHeader className="p-0">
                  <div className="bg-background shadow-md rounded-lg p-2 w-32 h-32 flex items-center justify-center mb-4 border border-white/10">
                    <Image
                      src={org.logoUrl}
                      alt={org.name}
                      width={120}
                      height={120}
                      className='rounded-md object-contain'
                       data-ai-hint="organization logo"
                    />
                  </div>
                  <h3 className="font-headline text-xl font-bold">{org.name}</h3>
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {org.description || `Explore courses from ${org.name}.`}
                  </p>
                </CardContent>
                <CardFooter className="p-0 flex-col w-full gap-4">
                  <Button asChild variant="outline" className="w-full rounded-xl">
                    <Link href={`/sites/${org.subdomain}`} rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      ওয়েবসাইট দেখুন
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
