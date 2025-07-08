
'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/language-context';
import type { HomepageConfig } from '@/lib/types';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Card, CardContent } from './ui/card';
import { Quote } from 'lucide-react';

type WhyTrustUsProps = {
  data: HomepageConfig['whyChooseUs'];
};

export function WhyTrustUs({ data }: WhyTrustUsProps) {
  const { language } = useLanguage();
  const plugin = React.useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));

  if (!data || !data.display) {
    return null;
  }

  return (
    <section className="bg-indigo-900 text-white py-16 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-headline text-4xl font-bold">{data.title?.[language] || data.title?.['bn']}</h2>
            <p className="text-lg opacity-90">
              {data.description?.[language] || data.description?.['bn']}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {(data.features || []).map((feature, index) => (
              <div key={feature.id || `feature-${index}`} className="bg-white/10 p-4 rounded-lg flex items-center gap-4 backdrop-blur-sm hover:bg-white/20 transition-colors">
                <Image src={feature.iconUrl} alt={feature.title?.[language] || feature.title?.['bn'] || 'Feature Icon'} width={40} height={40} data-ai-hint={feature.dataAiHint} className="bg-white p-1 rounded-md"/>
                <h3 className="font-semibold">{feature.title?.[language] || feature.title?.['bn']}</h3>
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
                  <Card className="bg-white text-gray-800 shadow-2xl rounded-2xl">
                    <CardContent className="p-8 grid md:grid-cols-3 gap-8 items-center">
                        <div className="md:col-span-2">
                            <Quote className="text-5xl text-indigo-300 -scale-x-100" fill="currentColor" />
                            <blockquote className="text-lg italic mt-[-2rem] ml-8">
                                {testimonial.quote?.[language] || testimonial.quote?.['bn']}
                            </blockquote>
                            <div className="mt-4 ml-8">
                                <p className="font-bold">{testimonial.studentName}</p>
                                <p className="text-sm text-muted-foreground">{testimonial.college}</p>
                            </div>
                        </div>
                        <div className="relative w-48 h-48 mx-auto">
                             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-200 to-purple-200 rounded-2xl transform -rotate-6"></div>
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
                    <CarouselPrevious className="static translate-y-0 bg-white/20 hover:bg-white/30 text-white" />
                    <CarouselNext className="static translate-y-0 bg-white/20 hover:bg-white/30 text-white" />
                </div>
             )}
          </Carousel>
        </div>
      </div>
    </section>
  );
}
