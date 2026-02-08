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

  if (!data || !data.display) {
    return null;
  }
  
  const titleText = data.title?.[language] || data.title?.['bn'] || '';
  const renderedTitle = titleText.replace(/RDC/g, `<span class="text-primary">RDC</span>`);

  return (
    <section className="py-10 md:py-14 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="glassmorphism-card border-2 border-primary p-6 md:p-10 shadow-xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
                <h2 className="font-headline text-3xl md:text-4xl font-black text-green-700 dark:text-green-500 leading-tight" dangerouslySetInnerHTML={{ __html: renderedTitle }} />
                <div className="h-1.5 w-24 bg-primary mx-auto lg:mx-0 rounded-full" />
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 mt-4 leading-relaxed">
                {data.description?.[language] || data.description?.['bn']}
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(data.features || []).map((feature, index) => (
                <div key={feature.id || `feature-${index}`} className="bg-background/50 border border-white/10 p-4 rounded-xl flex items-center gap-4 hover:border-primary/50 transition-all backdrop-blur-sm shadow-sm group">
                    <div className="bg-primary/10 p-2 rounded-xl border border-primary/20 shrink-0 group-hover:scale-110 transition-transform">
                        <Image src={feature.iconUrl} alt={feature.title?.['bn'] || 'Feature Icon'} width={40} height={40} data-ai-hint={feature.dataAiHint} className="w-10 h-10"/>
                    </div>
                    <h3 className="font-bold text-card-foreground text-sm sm:text-base leading-tight">{feature.title?.[language] || feature.title?.['bn']}</h3>
                </div>
                ))}
            </div>
            </div>
        </div>

        <div className="mt-8 z-10 relative">
          <Carousel
            plugins={[plugin.current]}
            className="w-full"
            opts={{ loop: (data.testimonials || []).length > 1 }}
          >
            <CarouselContent>
              {(data.testimonials || []).map((testimonial, index) => (
                <CarouselItem key={testimonial.id || `testimonial-${index}`}>
                  <Card className="glassmorphism-card border-2 border-primary shadow-lg overflow-hidden">
                    <CardContent className="p-8 grid md:grid-cols-3 gap-8 items-center">
                        <div className="md:col-span-2 text-center md:text-left space-y-4">
                            <Quote className="text-5xl text-primary/10 mx-auto md:ml-0" fill="currentColor" />
                            <blockquote className="text-lg italic mt-[-2rem] md:ml-8 font-medium text-foreground/90">
                                "{testimonial.quote?.[language] || testimonial.quote?.['bn']}"
                            </blockquote>
                            <div className="pt-4 md:ml-8">
                                <p className="font-black text-lg text-primary">{testimonial.studentName}</p>
                                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">{testimonial.college}</p>
                            </div>
                        </div>
                        <div className="relative w-48 h-48 mx-auto">
                             <div className="absolute inset-0 bg-primary/10 rounded-3xl transform -rotate-6 shadow-inner"></div>
                            <Image
                                src={testimonial.imageUrl}
                                alt={testimonial.studentName}
                                fill
                                className="object-cover rounded-3xl z-10 relative shadow-2xl border-4 border-white/50"
                                data-ai-hint={testimonial.dataAiHint}
                                sizes="(max-width: 768px) 100vw, 33vw"
                            />
                        </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
             {(data.testimonials || []).length > 1 && (
                <div className="mt-4 flex justify-center gap-3">
                    <CarouselPrevious variant="outline" className="static translate-y-0 h-10 w-10 rounded-full border-primary/20 hover:bg-primary/10" aria-label="Previous testimonial"/>
                    <CarouselNext variant="outline" className="static translate-y-0 h-10 w-10 rounded-full border-primary/20 hover:bg-primary/10" aria-label="Next testimonial"/>
                </div>
             )}
          </Carousel>
        </div>
      </div>
    </section>
  );
}
