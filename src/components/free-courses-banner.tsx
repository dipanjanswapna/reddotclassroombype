'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { HomepageConfig } from "@/lib/types";
import { motion } from "framer-motion";

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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl overflow-hidden p-8 md:p-12 text-white bg-black flex flex-col items-center justify-center text-center aspect-[16/9] md:aspect-[21/7] shadow-2xl border border-white/10"
        >
            <Image
                src={bannerConfig.imageUrl}
                alt="RDC Shop Banner"
                fill
                className="object-cover opacity-40 transition-transform duration-1000 hover:scale-105"
                data-ai-hint={bannerConfig.dataAiHint || "sale background"}
            />
            <div className="relative z-10 max-w-3xl space-y-6">
                <h2 className="text-4xl md:text-6xl font-black font-headline tracking-tighter uppercase drop-shadow-xl">
                    RDC <span className="text-primary">SHOP</span>
                </h2>
                <p className="text-lg md:text-xl text-gray-200 font-medium leading-relaxed max-w-2xl mx-auto drop-shadow-md">
                    আপনার প্রয়োজনীয় সকল কোর্স এবং শিক্ষা উপকরণ এখন RDC SHOP-এ। সেরা শিক্ষকদের সাথে নিজের শেখার যাত্রা শুরু করুন।
                </p>
                <div className="pt-4">
                    <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white font-black text-lg px-10 h-14 rounded-xl shadow-xl shadow-primary/20 transition-all duration-300 hover:-translate-y-1">
                        <Link href="/courses?category=মাস্টার কোর্স">
                            আমাদের ফ্রি কোর্সগুলো দেখুন
                        </Link>
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}
