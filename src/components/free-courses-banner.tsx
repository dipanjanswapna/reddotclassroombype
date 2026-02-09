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
 * Redesigned with significantly smaller typography and buttons for a sleek, premium look.
 */
export function FreeCoursesBanner({ bannerConfig }: FreeCoursesBannerProps) {
    if (!bannerConfig || !bannerConfig.display) {
        return null;
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring" }}
            className="relative rounded-[1rem] md:rounded-[1.5rem] overflow-hidden p-6 md:p-10 text-white bg-black flex flex-col items-center justify-center text-center aspect-[16/9] md:aspect-[21/5] shadow-2xl border border-white/10 group"
        >
            <Image
                src={bannerConfig.imageUrl}
                alt="RDC Shop Banner"
                fill
                className="object-cover opacity-30 transition-transform duration-1000 group-hover:scale-105"
                data-ai-hint={bannerConfig.dataAiHint || "sale background"}
            />
            
            {/* Animated Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-black/80 z-10" />
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-[100px]" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-accent/5 rounded-full blur-[100px]" />

            <div className="relative z-20 max-w-2xl space-y-3 md:space-y-4">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-center gap-2 mb-1"
                >
                  <div className="h-px w-4 md:w-8 bg-primary/50" />
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-primary">Academic Excellence</span>
                  <div className="h-px w-4 md:w-8 bg-primary/50" />
                </motion.div>

                <h2 className="text-xl md:text-2xl lg:text-3xl font-black font-headline tracking-tighter uppercase drop-shadow-xl">
                    RDC <span className="text-primary">SHOP</span>
                </h2>
                
                <p className="text-[10px] md:text-sm text-gray-300 font-medium leading-relaxed max-w-lg mx-auto drop-shadow-md font-bengali">
                    আপনার প্রয়োজনীয় সকল কোর্স এবং শিক্ষা উপকরণ এখন RDC SHOP-এ। সেরা শিক্ষকদের সাথে নিজের শেখার যাত্রা শুরু করুন।
                </p>
                
                <motion.div 
                  className="pt-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                    <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white font-black text-[10px] md:text-xs px-4 md:px-8 h-8 md:h-10 rounded-lg md:rounded-xl shadow-xl shadow-primary/30 transition-all duration-300">
                        <Link href="/courses?category=মাস্টার কোর্স" className="flex items-center gap-2">
                            আমাদের ফ্রি কোর্সগুলো দেখুন
                            <PlayCircle className="w-4 h-4 animate-pulse" />
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </motion.div>
    )
}
