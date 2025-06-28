
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
import { homepageConfig } from '@/lib/homepage-data';
import { useLanguage } from '@/context/language-context';
import { organizations } from '@/lib/mock-data';

type CollaborationItem = typeof homepageConfig.collaborations.items[0];

export function CollaborationsCarousel({ items }: { items: CollaborationItem[] }) {
  const { language } = useLanguage();
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  const getPartnerUrl = (item: CollaborationItem) => {
    const partner = organizations.find(org => org.name === item.name);
    if (!partner || !partner.subdomain) {
      return item.cta.href; // Fallback to the href from data if no partner match
    }

    // This logic works for both localhost (e.g., localhost:9002) and production domains (e.g., rdc.com or www.rdc.com)
    if (typeof window !== 'undefined') {
      const { protocol, host } = window.location;
      // Replace the initial part of the host (www or nothing) with the subdomain
      const mainDomain = host.replace(/^(www\.)?/, '');
      return `${protocol}//${partner.subdomain}.${mainDomain}`;
    }
    
    // Fallback for SSR, though this component is client-side.
    return `https://${partner.subdomain}.rdc.com`; 
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
                    <Link href={getPartnerUrl(item)} target="_blank" rel="noopener noreferrer">
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
