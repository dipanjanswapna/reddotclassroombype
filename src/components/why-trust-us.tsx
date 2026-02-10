
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
  const plugin = React.useRef(Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }));
  const isHomePage = pathname === '/';

  if (!data || !data.display) {
    return null;
  }
  
  const titleText = data.title?.[language] || data.title?.['en'] || '';
  const renderedTitle = titleText.replace(/RDC/g, `<span class="text-primary">RDC</span>`);

  return (
    <section className="py-6 md:py-8 overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-3xl rounded-full -z-10"></div>
      
      <div className="container mx-auto px-4">
        {/* Features Section */}
        <div className="glassmorphism-card p-6 md:p-10 border-white/30 bg-card dark:bg-card/40 rounded-3xl mb-8">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-10 items-center">
            <div className="space-y-4">
                <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tight leading-tight" dangerouslySetInnerHTML={{ __html: renderedTitle }} />
                <p className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed">
                {data.description?.[language] || data.description?.['en']}
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(data.features || []).map((feature, index) => {
                    const IconComponent = featureIcons[feature.title?.['en'] || ''];
                    const bgColor = pastelColors[index % pastelColors.length];
                    
                    return (
                        <div key={feature.id || `feature-${index}`} className={cn(
                            "border border-white/40 dark:border-white/10 p-3 md:p-4 rounded-2xl flex flex-row items-center gap-3 hover:border-primary/50 transition-all duration-300 hover:shadow-lg shadow-sm backdrop-blur-sm group",
                            bgColor
                        )}>
                            <div className="bg-primary/10 p-2 rounded-xl border-2 border-primary/20 group-hover:scale-110 transition-transform duration-300 shrink-0">
                                {IconComponent ? (
                                    <IconComponent className="w-6 h-6 text-primary" />
                                ) : (
                                    <Image src={feature.iconUrl} alt={feature.title?.['en'] || 'Feature Icon'} width={32} height={32} data-ai-hint={feature.dataAiHint} className="w-6 h-6 object-contain"/>
                                )}
                            </div>
                            <h3 className="font-bold text-xs md:text-sm text-gray-900 text-left leading-tight">{feature.title?.[language] || feature.title?.['en']}</h3>
                        </div>
                    );
                })}
            </div>
            </div>
        </div>

        {/* Testimonials Carousel Section - Optimized Small Size */}
        <div className="z-10 relative max-w-4xl mx-auto">
          <Carousel
            plugins={[plugin.current]}
            className="w-full"
            opts={{ loop: (data.testimonials || []).length > 1, align: 'start' }}
          >
            <CarouselContent>
              {(data.testimonials || []).map((testimonial, index) => (
                <CarouselItem key={testimonial.id || `testimonial-${index}`}>
                  <Card className="glassmorphism-card bg-card dark:bg-card/60 border-white/40 rounded-3xl overflow-hidden">
                    <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center">
                        {/* Text Content */}
                        <div className="md:col-span-8 relative space-y-4 text-center md:text-left">
                            <Quote className="text-4xl md:text-5xl text-primary/10 absolute -top-6 md:-top-8 -left-1 md:-left-4 pointer-events-none" fill="currentColor" />
                            <blockquote className="text-base md:text-lg lg:text-xl font-medium italic relative z-10 text-foreground leading-relaxed tracking-tight">
                                "{testimonial.quote?.[language] || testimonial.quote?.['en']}"
                            </blockquote>
                            <div className="space-y-0.5">
                                <p className="font-black text-base md:text-lg text-primary font-headline uppercase tracking-tight">
                                    {testimonial.studentName}
                                </p>
                                <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-[0.1em] font-body">
                                    {testimonial.college}
                                </p>
                            </div>
                        </div>

                        {/* Image Presentation */}
                        <div className="md:col-span-4 relative w-32 h-32 md:w-40 md:h-40 mx-auto md:ml-auto">
                             <div className="absolute inset-0 bg-primary/10 rounded-2xl transform -rotate-6 shadow-lg translate-x-1 translate-y-1"></div>
                             <div className="absolute inset-0 bg-white/50 rounded-2xl transform rotate-3 shadow-md border border-white/20"></div>
                            <div className="relative w-full h-full rounded-2xl overflow-hidden z-10 border-2 border-white shadow-xl">
                                <Image
                                    src={testimonial.imageUrl}
                                    alt={testimonial.studentName}
                                    fill
                                    className="object-cover"
                                    data-ai-hint={testimonial.dataAiHint}
                                    sizes="(max-width: 768px) 120px, 160px"
                                />
                            </div>
                        </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
             {(data.testimonials || []).length > 1 && (
                <div className="mt-6 flex justify-center gap-3">
                    <CarouselPrevious variant="outline" className="static translate-y-0 h-9 w-9 rounded-xl border-white/40 shadow-md hover:bg-primary hover:text-white transition-all" aria-label="Previous testimonial"/>
                    <CarouselNext variant="outline" className="static translate-y-0 h-9 w-9 rounded-xl border-white/40 shadow-md hover:bg-primary hover:text-white transition-all" aria-label="Next testimonial"/>
                </div>
             )}
          </Carousel>
        </div>
      </div>
    </section>
  );
}
