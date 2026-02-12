
'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { HomepageConfig } from "@/lib/types";
import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";

type BannerConfig = HomepageConfig['rdcShopBanner'];

interface FreeCoursesBannerProps {
  bannerConfig?: BannerConfig;
}

/**
 * @fileOverview FreeCoursesBanner Component
 * Optimized for extreme scaling. Text and buttons are significantly smaller ("onek soto") 
 * for a high-density, premium look that works perfectly on tablets and mobile.
 */
export function FreeCoursesBanner({ bannerConfig }: FreeCoursesBannerProps) {
    if (!bannerConfig || !bannerConfig.display) {
        return null;
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.2 }}
            className="relative rounded-[1rem] md:rounded-[1.25rem] overflow-hidden p-4 md:p-8 text-white bg-black flex flex-col items-center justify-center text-center aspect-[16/9] sm:aspect-[21/7] md:aspect-[21/5] shadow-2xl border border-white/10 group"
        >
            <Image
                src={bannerConfig.imageUrl}
                alt="RDC Shop Banner"
                fill
                className="object-cover opacity-25 transition-transform duration-[5000ms] group-hover:scale-110"
                data-ai-hint={bannerConfig.dataAiHint || "dark library background"}
            />
            
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-black/90 z-10" />

            <div className="relative z-20 max-w-xl space-y-2 md:space-y-3">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center justify-center gap-1.5 mb-0.5"
                >
                  <div className="h-px w-3 md:w-6 bg-primary/50" />
                  <span className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.25em] text-primary">Academic Excellence</span>
                  <div className="h-px w-3 md:w-6 bg-primary/50" />
                </motion.div>

                <h2 className="text-lg md:text-xl lg:text-2xl font-black font-headline tracking-tighter uppercase drop-shadow-lg">
                    RED DOT CLASSROOM <span className="text-primary">(RDC)</span>
                </h2>
                
                <p className="text-[9px] md:text-[11px] lg:text-xs text-gray-300 font-medium leading-relaxed max-w-sm md:max-w-md mx-auto drop-shadow-md font-bengali">
                    আপনার প্রয়োজনীয় সকল কোর্স এবং শিক্ষা উপকরণ এখন RDC-তে। সেরা শিক্ষকদের সাথে নিজের শেখার যাত্রা শুরু করুন।
                </p>
                
                <motion.div 
                  className="pt-1.5"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                    <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white font-black text-[9px] md:text-[10px] px-3 md:px-6 h-7 md:h-9 rounded-lg md:rounded-xl shadow-xl shadow-primary/20 transition-all duration-300">
                        <Link href="/courses?category=মাস্টার কোর্স" className="flex items-center gap-1.5">
                            আমাদের ফ্রি কোর্সগুলো দেখুন
                            <PlayCircle className="w-3.5 h-3.5 animate-pulse" />
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </motion.div>
    )
}
