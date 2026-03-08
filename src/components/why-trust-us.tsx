'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/language-context';
import type { HomepageConfig } from '@/lib/types';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Card, CardContent } from './ui/card';
import { Quote, Users, Presentation, Wallet, Headphones, Zap, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type WhyTrustUsProps = {
  data: HomepageConfig['whyChooseUs'];
};

const featureIcons: Record<string, any> = {
    "Best Instructors": Users,
    "Interactive Learning": Presentation,
    "Lots for a Low Cost": Wallet,
    "Support System": Headphones,
};

const neutralColors = [
    "bg-gray-50 border-border dark:bg-muted/20",
    "bg-gray-50 border-border dark:bg-muted/20",
    "bg-gray-50 border-border dark:bg-muted/20",
    "bg-gray-50 border-border dark:bg-muted/20",
];

/**
 * @fileOverview WhyTrustUs Component
 * Professional geometric design without glassmorphism.
 */
export default function WhyTrustUs({ data }: WhyTrustUsProps) {
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const plugin = React.useRef(Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }));

  if (!data || !data.display) {
    return null;
  }
  
  const titleText = data.title?.[language] || data.title?.['en'] || '';
  const renderedTitle = titleText.replace(/RDC/g, `<span class="text-primary">RDC</span>`);

  return (
    <section className={cn("py-6 md:py-10 overflow-hidden relative px-1", isBn && "font-bengali")}>
      <div className="container mx-auto px-0">
        {/* Features Grid */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 md:p-10 border border-border bg-white dark:bg-card rounded-xl mb-8 md:mb-10 shadow-sm"
        >
            <div className="grid lg:grid-cols-2 gap-10 items-center">
                <div className="space-y-5 text-left">
                    <h2 className={cn(
                        "font-bold tracking-tight leading-tight",
                        isBn ? "text-3xl md:text-4xl" : "font-headline text-3xl md:text-4xl"
                    )} dangerouslySetInnerHTML={{ __html: renderedTitle }} />
                    <p className="text-base text-muted-foreground font-medium leading-relaxed max-w-xl">
                        {data.description?.[language] || data.description?.['en']}
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(data.features || []).map((feature, index) => {
                        const IconComponent = featureIcons[feature.title?.['en'] || ''] || Zap;
                        const bgColor = neutralColors[index % neutralColors.length];
                        
                        return (
                            <div 
                                key={feature.id || `feature-${index}`}
                                className={cn(
                                    "border p-4 rounded-xl flex items-center gap-4 transition-all hover:bg-muted/50",
                                    bgColor
                                )}
                            >
                                <div className="bg-primary/10 p-2.5 rounded-lg shrink-0">
                                    <IconComponent className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-bold text-sm text-foreground leading-tight">
                                    {feature.title?.[language] || feature.title?.['en']}
                                </h3>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="max-w-5xl mx-auto pt-2">
          <Carousel
            plugins={[plugin.current]}
            className="w-full"
            opts={{ loop: (data.testimonials || []).length > 1, align: 'start' }}
          >
            <CarouselContent>
              {(data.testimonials || []).map((testimonial, index) => (
                <CarouselItem key={testimonial.id || `testimonial-${index}`}>
                  <Card className="bg-white dark:bg-card border border-border rounded-xl overflow-hidden shadow-sm mx-1">
                    <CardContent className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
                        <div className="md:col-span-8 relative space-y-6 text-center md:text-left">
                            <Quote className="text-6xl text-primary/10 absolute -top-10 -left-4" fill="currentColor" />
                            <blockquote className="text-lg md:text-xl font-medium italic relative z-10 text-foreground leading-relaxed">
                                "{testimonial.quote?.[language] || testimonial.quote?.['en']}"
                            </blockquote>
                            <div className="space-y-1">
                                <p className={cn(
                                    "font-bold text-lg text-primary",
                                    !isBn && "font-headline"
                                )}>
                                    {testimonial.studentName}
                                </p>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                                    {testimonial.college}
                                </p>
                            </div>
                        </div>
                        <div className="md:col-span-4 flex justify-center">
                            <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-xl overflow-hidden border-4 border-white shadow-lg">
                                <Image src={testimonial.imageUrl} alt={testimonial.studentName} fill className="object-cover" data-ai-hint={testimonial.dataAiHint} />
                                <div className="absolute top-2 right-2 bg-yellow-400 p-1.5 rounded-lg shadow-sm border border-white">
                                    <Star className="w-4 h-4 text-white fill-current" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
