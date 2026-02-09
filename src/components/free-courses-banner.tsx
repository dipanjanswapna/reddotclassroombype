
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
            className="relative rounded-[2rem] overflow-hidden p-8 md:p-16 text-white bg-black flex flex-col items-center justify-center text-center aspect-[16/10] md:aspect-[21/7] shadow-3xl border border-white/10 group"
        >
            <Image
                src={bannerConfig.imageUrl}
                alt="RDC Shop Banner"
                fill
                className="object-cover opacity-50 transition-transform duration-1000 group-hover:scale-110"
                data-ai-hint={bannerConfig.dataAiHint || "sale background"}
            />
            
            {/* Animated Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-black/80 z-10" />
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-accent/20 rounded-full blur-[100px] animate-pulse" />

            <div className="relative z-20 max-w-4xl space-y-6 md:space-y-8">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-center gap-3 mb-4"
                >
                  <div className="h-px w-8 md:w-12 bg-primary" />
                  <span className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-primary">Limited Offers</span>
                  <div className="h-px w-8 md:w-12 bg-primary" />
                </motion.div>

                <h2 className="text-4xl md:text-7xl font-black font-headline tracking-tighter uppercase drop-shadow-2xl">
                    RDC <span className="text-primary">SHOP</span>
                </h2>
                
                <p className="text-lg md:text-2xl text-gray-200 font-medium leading-relaxed max-w-2xl mx-auto drop-shadow-lg font-bengali">
                    আপনার প্রয়োজনীয় সকল কোর্স এবং শিক্ষা উপকরণ এখন RDC SHOP-এ। সেরা শিক্ষকদের সাথে নিজের শেখার যাত্রা শুরু করুন।
                </p>
                
                <motion.div 
                  className="pt-6"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                    <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white font-black text-xl px-12 h-16 rounded-2xl shadow-2xl shadow-primary/40 transition-all duration-300 hover:shadow-primary/60">
                        <Link href="/courses?category=মাস্টার কোর্স" className="flex items-center gap-3">
                            আমাদের ফ্রি কোর্সগুলো দেখুন
                            <PlayCircle className="w-6 h-6 animate-pulse" />
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </motion.div>
    )
}
