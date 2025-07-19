

'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { HomepageConfig } from "@/lib/types";

type BannerConfig = HomepageConfig['rdcShopBanner'];

interface FreeCoursesBannerProps {
  bannerConfig?: BannerConfig;
}

export function FreeCoursesBanner({ bannerConfig }: FreeCoursesBannerProps) {
    if (!bannerConfig || !bannerConfig.display) {
        return null;
    }

    return (
        <div className="relative rounded-2xl overflow-hidden p-8 text-white bg-black flex flex-col items-center justify-center text-center aspect-video md:aspect-[21/6]">
            <Image
                src={bannerConfig.imageUrl}
                alt="RDC Shop Banner"
                fill
                className="object-cover opacity-30"
                data-ai-hint={bannerConfig.dataAiHint || "sale background"}
            />
            <div className="relative z-10 max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-extrabold font-headline">RDC SHOP</h2>
                <p className="mt-4 text-lg text-gray-200">
                    আপনার প্রয়োজনীয় সকল কোর্স এবং শিক্ষা উপকরণ এখন RDC SHOP-এ। সেরা শিক্ষকদের সাথে নিজের শেখার যাত্রা শুরু করুন।
                </p>
                <Button asChild size="lg" className="mt-6 bg-green-500 hover:bg-green-600 text-black font-bold">
                    <Link href="/courses?category=masterclass">
                        আমাদের ফ্রি কোর্সগুলো দেখুন
                    </Link>
                </Button>
            </div>
        </div>
    )
}
