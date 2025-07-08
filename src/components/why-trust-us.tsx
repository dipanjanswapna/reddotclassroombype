
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

type WhyTrustUsProps = {
  data: HomepageConfig['whyChooseUs'];
};

export function WhyTrustUs({ data }: WhyTrustUsProps) {
  const { language } = useLanguage();
  const plugin = React.useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));

  if (!data || !data.display) {
    return null;
  }
  
  const titleText = data.title?.[language] || data.title?.['bn'] || '';
  const renderedTitle = titleText.replace(/RDC/g, `<span class="text-primary">RDC</span>`);

  return (
    <section className="bg-background py-16 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-headline text-4xl font-bold" dangerouslySetInnerHTML={{ __html: renderedTitle }} />
            <p className="text-lg text-muted-foreground">
              {data.description?.[language] || data.description?.['bn']}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {(data.features || []).map((feature, index) => (
              <div key={feature.id || `feature-${index}`} className="bg-card border p-4 rounded-lg flex items-center gap-4 hover:border-primary/50 transition-colors">
                <Image src={feature.iconUrl} alt={feature.title?.['bn'] || 'Feature Icon'} width={60} height={60} data-ai-hint={feature.dataAiHint} className="bg-primary/10 p-2 rounded-lg border border-[rgb(252,71,95)]"/>
                <h3 className="font-semibold text-card-foreground">{feature.title?.[language] || feature.title?.['bn']}</h3>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <Carousel
            plugins={[plugin.current]}
            className="w-full"
            opts={{ loop: (data.testimonials || []).length > 1 }}
          >
            <CarouselContent>
              {(data.testimonials || []).map((testimonial, index) => (
                <CarouselItem key={testimonial.id || `testimonial-${index}`}>
                  <Card className="bg-card shadow-lg rounded-2xl border border-secondary">
                    <CardContent className="p-8 grid md:grid-cols-3 gap-8 items-center">
                        <div className="md:col-span-2">
                            <Quote className="text-5xl text-primary/20" fill="currentColor" />
                            <blockquote className="text-lg italic mt-[-2rem] ml-8">
                                {testimonial.quote?.[language] || testimonial.quote?.['bn']}
                            </blockquote>
                            <div className="mt-4 ml-8">
                                <p className="font-bold">{testimonial.studentName}</p>
                                <p className="text-sm text-muted-foreground">{testimonial.college}</p>
                            </div>
                        </div>
                        <div className="relative w-48 h-48 mx-auto">
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
                <div className="mt-6 flex justify-center gap-4">
                    <CarouselPrevious variant="outline" className="static translate-y-0" />
                    <CarouselNext variant="outline" className="static translate-y-0" />
                </div>
             )}
          </Carousel>
        </div>
      </div>
    </section>
  );
}
