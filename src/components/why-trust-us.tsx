
'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { useLanguage } from '@/context/language-context';
import type { HomepageConfig } from '@/lib/types';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Card, CardContent, CardHeader } from './ui/card';

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
    <section className="bg-[#293262] text-white py-16 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-headline text-4xl font-bold">{data.title?.[language] || ''}</h2>
            <p className="text-lg opacity-80">
              {data.description?.[language] || ''}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {(data.features || []).map((feature) => (
              <div key={feature.id} className="bg-white/10 p-4 rounded-lg flex items-center gap-4 backdrop-blur-sm">
                <Image src={feature.iconUrl} alt="" width={48} height={48} data-ai-hint={feature.dataAiHint} />
                <h3 className="font-semibold">{feature.title?.[language] || ''}</h3>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <Carousel
            plugins={[plugin.current]}
            className="w-full"
            opts={{ loop: true }}
          >
            <CarouselContent>
              {(data.testimonials || []).map((testimonial) => (
                <CarouselItem key={testimonial.id}>
                  <Card className="bg-white text-gray-800 shadow-2xl rounded-2xl">
                    <CardContent className="p-8 grid md:grid-cols-3 gap-8 items-center">
                        <div className="md:col-span-2">
                            <p className="text-5xl font-bold text-indigo-300">”</p>
                            <blockquote className="text-lg italic mt-[-2rem] ml-8">
                                {testimonial.quote?.[language] || ''}
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
                            />
                        </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="mt-4 flex justify-center gap-4">
                 <CarouselPrevious className="static translate-y-0 bg-white/20 hover:bg-white/30 text-white" />
                <CarouselNext className="static translate-y-0 bg-white/20 hover:bg-white/30 text-white" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
