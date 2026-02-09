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
  
  const titleText = data.title?.[language] || data.title?.['en'] || '';
  const renderedTitle = titleText.replace(/RDC/g, `<span class="text-primary">RDC</span>`);

  return (
    <section className="py-16 overflow-hidden relative">
      {/* Background Decorative Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-3xl rounded-full -z-10"></div>
      
      <div className="container mx-auto px-4">
        <div className="glassmorphism-card p-8 md:p-12 border-white/30 bg-white/50 dark:bg-card/40">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
                <h2 className="font-headline text-4xl font-black tracking-tight leading-tight" dangerouslySetInnerHTML={{ __html: renderedTitle }} />
                <p className="text-lg text-muted-foreground font-medium">
                {data.description?.[language] || data.description?.['en']}
                </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {(data.features || []).map((feature, index) => (
                <div key={feature.id || `feature-${index}`} className="bg-white/60 dark:bg-background/50 border border-white/40 dark:border-white/10 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 hover:border-primary/50 transition-all duration-300 hover:shadow-xl shadow-sm backdrop-blur-sm group">
                    <div className="bg-primary/10 p-3 rounded-xl border-2 border-primary/20 group-hover:scale-110 transition-transform duration-300">
                        <Image src={feature.iconUrl} alt={feature.title?.['en'] || 'Feature Icon'} width={40} height={40} data-ai-hint={feature.dataAiHint} className="w-10 h-10 object-contain"/>
                    </div>
                    <h3 className="font-bold text-card-foreground text-center sm:text-left leading-tight">{feature.title?.[language] || feature.title?.['en']}</h3>
                </div>
                ))}
            </div>
            </div>
        </div>

        <div className="mt-16 z-10 relative">
          <Carousel
            plugins={[plugin.current]}
            className="w-full"
            opts={{ loop: (data.testimonials || []).length > 1 }}
          >
            <CarouselContent>
              {(data.testimonials || []).map((testimonial, index) => (
                <CarouselItem key={testimonial.id || `testimonial-${index}`}>
                  <Card className="glassmorphism-card bg-white/80 dark:bg-card/60 border-white/40">
                    <CardContent className="p-8 md:p-12 grid md:grid-cols-3 gap-8 items-center">
                        <div className="md:col-span-2 relative">
                            <Quote className="text-7xl text-primary/10 absolute -top-8 -left-4" fill="currentColor" />
                            <blockquote className="text-xl md:text-2xl font-medium italic relative z-10 text-foreground leading-relaxed">
                                "{testimonial.quote?.[language] || testimonial.quote?.['en']}"
                            </blockquote>
                            <div className="mt-6">
                                <p className="font-black text-lg text-primary">{testimonial.studentName}</p>
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{testimonial.college}</p>
                            </div>
                        </div>
                        <div className="relative w-48 h-48 md:w-56 md:h-56 mx-auto">
                             <div className="absolute top-0 left-0 w-full h-full bg-primary/10 rounded-3xl transform -rotate-6 shadow-lg"></div>
                            <Image
                                src={testimonial.imageUrl}
                                alt={testimonial.studentName}
                                fill
                                className="object-cover rounded-3xl z-10 relative shadow-2xl border-4 border-white/50"
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
                <div className="mt-8 flex justify-center gap-4">
                    <CarouselPrevious variant="outline" className="static translate-y-0 h-12 w-12 rounded-xl border-white/40 shadow-lg hover:bg-primary hover:text-white transition-all" aria-label="Previous testimonial"/>
                    <CarouselNext variant="outline" className="static translate-y-0 h-12 w-12 rounded-xl border-white/40 shadow-lg hover:bg-primary hover:text-white transition-all" aria-label="Next testimonial"/>
                </div>
             )}
          </Carousel>
        </div>
      </div>
    </section>
  );
}