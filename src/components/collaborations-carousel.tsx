
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
import { Facebook, Youtube, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { CollaborationItem, Organization } from '@/lib/types';

export function CollaborationsCarousel({ items, organizations }: { items: CollaborationItem[]; organizations: Organization[] }) {
  const { language } = useLanguage();
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  const getPartnerUrl = (item: CollaborationItem) => {
    const partner = organizations.find(org => org.id === item.organizationId);
    if (partner?.subdomain) {
      return `/sites/${partner.subdomain}`;
    }
    // Fallback if no partner is found or subdomain is not set
    return item.cta.href;
  };


  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full"
      opts={{ align: 'start', loop: true }}
    >
      <CarouselContent>
        {items.map((item) => (
          <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Card className="h-full flex flex-col p-6 text-center items-center shadow-lg transition-all hover:shadow-2xl bg-background/50 backdrop-blur-sm">
                <CardHeader className="p-0">
                  <div className="bg-background shadow-md rounded-lg p-2 w-32 h-32 flex items-center justify-center mb-4">
                    <Image
                      src={item.logoUrl}
                      alt={item.name}
                      width={120}
                      height={120}
                      className={
                        item.type === 'individual' ? 'rounded-full' : 'rounded-md'
                      }
                       data-ai-hint={item.dataAiHint}
                    />
                  </div>
                  <h3 className="font-headline text-xl font-bold">{item.name}</h3>
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                  <p className="text-muted-foreground text-sm">
                    {typeof item.description === 'object' ? item.description[language] : item.description}
                  </p>
                </CardContent>
                <CardFooter className="p-0 flex-col w-full gap-4">
                  <div className="flex gap-4">
                    {item.socials.facebook && (
                      <Link href={item.socials.facebook} target="_blank"  rel="noopener noreferrer">
                        <Facebook className="text-muted-foreground hover:text-primary" />
                      </Link>
                    )}
                    {item.socials.youtube && (
                      <Link href={item.socials.youtube} target="_blank"  rel="noopener noreferrer">
                        <Youtube className="text-muted-foreground hover:text-destructive" />
                      </Link>
                    )}
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={getPartnerUrl(item)}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {typeof item.cta.text === 'object' ? item.cta.text[language] : item.cta.text}
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
