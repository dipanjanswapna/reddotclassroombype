'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/language-context';
import type { HomepageConfig } from '@/lib/types';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Card, CardContent } from './ui/card';
import { Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

type WhyTrustUsProps = {
  data: HomepageConfig['whyChooseUs'];
};

export default function WhyTrustUs({ data }: WhyTrustUsProps) {
  const { language } = useLanguage();
  const pathname = usePathname();
  const plugin = React.useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));
  const isHomePage = pathname === '/';

  if (!data || !data.display) {
    return null;
  }
  
  const titleText = data.title?.[language] || data.title?.['bn'] || '';
  const renderedTitle = titleText.replace(/RDC/g, `<span class="text-primary">RDC</span>`);

  return (
    <section className="py-6 sm:py-8 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="glassmorphism-card border-2 border-primary p-6 md:p-8 shadow-xl">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 text-center lg:text-left">
                <h2 className="font-headline text-3xl font-bold text-green-700 dark:text-green-500" dangerouslySetInnerHTML={{ __html: renderedTitle }} />
                <div className="h-1 w-16 bg-primary mt-2 rounded-full mx-auto lg:mx-0" />
                <p className="text-md text-muted-foreground max-w-2xl mx-auto lg:mx-0 mt-4">
                {data.description?.[language] || data.description?.['bn']}
                </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
                {(data.features || []).map((feature, index) => (
                <div key={feature.id || `feature-${index}`} className="bg-background/50 border border-white/10 p-3 rounded-lg flex items-center gap-3 hover:border-primary/50 transition-colors backdrop-blur-sm flex-1 min-w-[180px] max-w-[280px]">
                    <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/50 shrink-0">
                        <Image src={feature.iconUrl} alt={feature.title?.['bn'] || 'Feature Icon'} width={32} height={32} data-ai-hint={feature.dataAiHint} className="w-8 h-8"/>
                    </div>
                    <h3 className="font-semibold text-card-foreground text-xs sm:text-sm">{feature.title?.[language] || feature.title?.['bn']}</h3>
                </div>
                ))}
            </div>
            </div>
        </div>

        <div className="mt-4 z-10 relative">
          <Carousel
            plugins={[plugin.current]}
            className="w-full"
            opts={{ loop: (data.testimonials || []).length > 1 }}
          >
            <CarouselContent>
              {(data.testimonials || []).map((testimonial, index) => (
                <CarouselItem key={testimonial.id || `testimonial-${index}`}>
                  <Card className="glassmorphism-card border-2 border-primary shadow-lg">
                    <CardContent className="p-6 grid md:grid-cols-3 gap-6 items-center">
                        <div className="md:col-span-2 text-center md:text-left">
                            <Quote className="text-4xl text-primary/20 mx-auto md:ml-0" fill="currentColor" />
                            <blockquote className="text-md italic mt-[-1.5rem] md:ml-6">
                                {testimonial.quote?.[language] || testimonial.quote?.['bn']}
                            </blockquote>
                            <div className="mt-3 md:ml-6">
                                <p className="font-bold text-sm">{testimonial.studentName}</p>
                                <p className="text-xs text-muted-foreground">{testimonial.college}</p>
                            </div>
                        </div>
                        <div className="relative w-36 h-36 mx-auto">
                             <div className="absolute top-0 left-0 w-full h-full bg-primary/10 rounded-2xl transform -rotate-6"></div>
                            <Image
                                src={testimonial.imageUrl}
                                alt={testimonial.studentName}
                                fill
                                className="object-cover rounded-2xl z-10 relative shadow-lg"
                                data-ai-hint={testimonial.dataAiHint}
                                sizes="(max-width: 768px) 50vw, 33vw"
                            />
                        </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
             {(data.testimonials || []).length > 1 && (
                <div className="mt-2 flex justify-center gap-2">
                    <CarouselPrevious variant="outline" size="sm" className="static translate-y-0" aria-label="Previous testimonial"/>
                    <CarouselNext variant="outline" size="sm" className="static translate-y-0" aria-label="Next testimonial"/>
                </div>
             )}
          </Carousel>
        </div>
      </div>
    </section>
  );
}
