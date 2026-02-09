
'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/language-context';
import type { HomepageConfig } from '@/lib/types';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Card, CardContent } from './ui/card';
import { Quote, Users, Presentation, Wallet, Headphones, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

type WhyTrustUsProps = {
  data: HomepageConfig['whyChooseUs'];
};

const featureIcons: Record<string, any> = {
    "Best Instructors": Users,
    "Interactive Learning": Presentation,
    "Lots for a Low Cost": Wallet,
    "Support System": Headphones,
};

const pastelColors = [
    "bg-[#dcfce7]", // Mint Green
    "bg-[#dbeafe]", // Light Blue
    "bg-[#ffedd5]", // Light Peach
    "bg-[#fef9c3]", // Light Yellow
];

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
    <section className="py-12 md:py-16 overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-3xl rounded-full -z-10"></div>
      
      <div className="container mx-auto px-4">
        <div className="glassmorphism-card p-6 md:p-12 border-white/30 bg-white/50 dark:bg-card/40 rounded-2xl md:rounded-3xl">
            <div className="grid lg:grid-cols-2 gap-10 md:gap-12 items-center">
            <div className="space-y-4 md:space-y-6">
                <h2 className="font-headline text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-tight" dangerouslySetInnerHTML={{ __html: renderedTitle }} />
                <p className="text-base md:text-lg text-muted-foreground font-medium leading-relaxed">
                {data.description?.[language] || data.description?.['en']}
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(data.features || []).map((feature, index) => {
                    const IconComponent = featureIcons[feature.title?.['en'] || ''];
                    const bgColor = pastelColors[index % pastelColors.length];
                    
                    return (
                        <div key={feature.id || `feature-${index}`} className={cn(
                            "border border-white/40 dark:border-white/10 p-4 md:p-5 rounded-2xl flex flex-row items-center gap-4 hover:border-primary/50 transition-all duration-300 hover:shadow-xl shadow-sm backdrop-blur-sm group",
                            bgColor
                        )}>
                            <div className="bg-primary/10 p-2.5 md:p-3 rounded-xl border-2 border-primary/20 group-hover:scale-110 transition-transform duration-300 shrink-0">
                                {IconComponent ? (
                                    <IconComponent className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                                ) : (
                                    <Image src={feature.iconUrl} alt={feature.title?.['en'] || 'Feature Icon'} width={40} height={40} data-ai-hint={feature.dataAiHint} className="w-8 h-8 md:w-10 md:h-10 object-contain"/>
                                )}
                            </div>
                            <h3 className="font-bold text-sm md:text-base text-gray-900 text-left leading-tight">{feature.title?.[language] || feature.title?.['en']}</h3>
                        </div>
                    );
                })}
            </div>
            </div>
        </div>

        <div className="mt-12 md:mt-16 z-10 relative">
          <Carousel
            plugins={[plugin.current]}
            className="w-full"
            opts={{ loop: (data.testimonials || []).length > 1 }}
          >
            <CarouselContent>
              {(data.testimonials || []).map((testimonial, index) => (
                <CarouselItem key={testimonial.id || `testimonial-${index}`}>
                  <Card className="glassmorphism-card bg-white/80 dark:bg-card/60 border-white/40 rounded-2xl md:rounded-3xl">
                    <CardContent className="p-6 md:p-12 grid md:grid-cols-3 gap-8 items-center">
                        <div className="md:col-span-2 relative">
                            <Quote className="text-5xl md:text-7xl text-primary/10 absolute -top-6 md:-top-8 -left-2 md:-left-4" fill="currentColor" />
                            <blockquote className="text-lg md:text-xl lg:text-2xl font-medium italic relative z-10 text-foreground leading-relaxed">
                                "{testimonial.quote?.[language] || testimonial.quote?.['en']}"
                            </blockquote>
                            <div className="mt-6">
                                <p className="font-black text-base md:text-lg text-primary">{testimonial.studentName}</p>
                                <p className="text-[10px] md:text-sm font-bold text-muted-foreground uppercase tracking-widest">{testimonial.college}</p>
                            </div>
                        </div>
                        <div className="relative w-40 h-48 md:w-56 md:h-56 mx-auto">
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
                <div className="mt-6 md:mt-8 flex justify-center gap-4">
                    <CarouselPrevious variant="outline" className="static translate-y-0 h-10 w-10 md:h-12 md:w-12 rounded-xl border-white/40 shadow-lg hover:bg-primary hover:text-white transition-all" aria-label="Previous testimonial"/>
                    <CarouselNext variant="outline" className="static translate-y-0 h-10 w-10 md:h-12 md:w-12 rounded-xl border-white/40 shadow-lg hover:bg-primary hover:text-white transition-all" aria-label="Next testimonial"/>
                </div>
             )}
          </Carousel>
        </div>
      </div>
    </section>
  );
}
