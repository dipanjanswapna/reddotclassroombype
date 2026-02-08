
'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { HomepageConfig } from "@/lib/types";
import { Badge } from "./ui/badge";

type BannerConfig = HomepageConfig['rdcShopBanner'];

interface FreeCoursesBannerProps {
  bannerConfig?: BannerConfig;
}

/**
 * @fileOverview Refined RDC SHOP banner component.
 * Features multi-layered gradients, hover animations, and bold typography.
 */
export function FreeCoursesBanner({ bannerConfig }: FreeCoursesBannerProps) {
    if (!bannerConfig || !bannerConfig.display) {
        return null;
    }

    return (
        <section className="relative rounded-3xl overflow-hidden py-16 md:py-24 px-6 text-white bg-black flex flex-col items-center justify-center text-center shadow-2xl border border-white/5 group">
            <Image
                src={bannerConfig.imageUrl}
                alt="RDC Shop Banner"
                fill
                className="object-cover opacity-40 transition-transform duration-1000 group-hover:scale-105"
                data-ai-hint={bannerConfig.dataAiHint || "sale background"}
            />
            {/* Multi-layered gradients for visual depth and text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
            
            <div className="relative z-10 max-w-3xl space-y-6">
                <Badge variant="secondary" className="bg-primary text-white font-bold px-4 py-1 animate-bounce border-none">Exclusive Offer</Badge>
                <h2 className="text-4xl md:text-6xl font-black font-headline tracking-tighter drop-shadow-2xl">RDC <span className="text-primary">SHOP</span></h2>
                <p className="text-lg md:text-2xl text-gray-200 font-medium leading-relaxed max-w-2xl mx-auto drop-shadow-md">
                    আপনার প্রয়োজনীয় সকল কোর্স এবং শিক্ষা উপকরণ এখন RDC SHOP-এ। সেরা শিক্ষকদের সাথে নিজের শেখার যাত্রা শুরু করুন।
                </p>
                <div className="pt-4">
                    <Button asChild size="lg" className="bg-green-500 hover:bg-green-600 text-black font-black text-lg h-14 px-10 rounded-2xl shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all hover:scale-105 active:scale-95 border-none">
                        <Link href="/courses?category=মাস্টার কোর্স">
                            আমাদের ফ্রি কোর্সগুলো দেখুন
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
