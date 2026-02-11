'use client';

import React, { useEffect, useState } from 'react';
import { motion, animate } from 'framer-motion';
import { Card } from './ui/card';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';

interface StatItem {
  label: { bn: string; en: string };
  value: number;
  suffix?: string;
  color: string;
}

interface StatsSectionProps {
  stats: StatItem[];
  title?: { bn: string; en: string };
}

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 2,
      onUpdate: (latest) => setDisplayValue(Math.floor(latest)),
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [value]);

  return (
    <span>
      {displayValue.toLocaleString()}{suffix}
    </span>
  );
}

export function StatsSection({ stats, title }: StatsSectionProps) {
  const { language } = useLanguage();

  return (
    <section className="py-8 md:py-10 overflow-hidden">
      <div className="container mx-auto px-1">
        {title && (
          <h2 className="font-headline text-xl md:text-2xl lg:text-3xl font-black mb-8 md:mb-10 text-center uppercase tracking-tight">
            {title[language] || title['en']}
          </h2>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={cn(
                "p-6 md:p-8 flex flex-col justify-center h-36 md:h-40 border-none shadow-sm rounded-[20px] transition-transform hover:scale-[1.02]",
                stat.color
              )}>
                <div className="space-y-1">
                  <p className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter">
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-xs md:text-sm font-bold text-gray-600 uppercase tracking-wider">
                    {stat.label[language] || stat.label['en']}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
