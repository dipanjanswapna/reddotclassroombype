'use client';

import Image from 'next/image';
import { Button } from './ui/button';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { useLanguage } from '@/context/language-context';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Localized BookBanner Component
 * Upgraded UI/UX for the bestseller book section with Hind Siliguri support.
 */
export function BookBanner({ bestsellerProduct }: { bestsellerProduct?: Product | null }) {
    const { language } = useLanguage();
    const isBn = language === 'bn';
    const productImageUrl = bestsellerProduct?.imageUrl || "https://picsum.photos/seed/bookstore1/400/600";
    const productTitle = bestsellerProduct?.name || t.favorite_book[language];
    const productLink = bestsellerProduct ? `/store/product/${bestsellerProduct.id}` : "/store?category=books";

    return (
        <section className={cn("px-1 py-0 overflow-hidden", isBn && "font-bengali")}>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative bg-gradient-to-br from-blue-700 via-indigo-800 to-primary rounded-[25px] p-8 md:p-14 overflow-hidden shadow-2xl border border-white/10 group"
            >
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/30 rounded-full blur-[100px] -ml-48 -mb-48" />
                
                <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                    <div className="space-y-6 text-center md:text-left">
                        <motion.div 
                            initial={{ x: -20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.25em] border border-white/30 shadow-lg"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            Premium Recommendation
                        </motion.div>
                        
                        <div className="space-y-3">
                            <p className="font-black text-primary-foreground/80 uppercase tracking-[0.2em] text-xs md:text-sm">{t.bestseller_authors[language]}</p>
                            <h2 className={cn(
                                "text-3xl md:text-5xl lg:text-6xl font-black text-white leading-none tracking-tighter uppercase drop-shadow-2xl",
                                !isBn && "font-headline"
                            )}>
                                {t.meet_your_next[language]} <br className="hidden lg:block"/> 
                                <span className="text-yellow-400">{productTitle}</span>
                            </h2>
                        </div>

                        <p className="text-white/80 font-medium text-sm md:text-lg max-w-md mx-auto md:mx-0 leading-relaxed">
                            {isBn 
                                ? 'গবেষণালব্ধ তথ্যের ভিত্তিতে তৈরি আমাদের বিশেষ একাডেমিক বইগুলো এখন এক ক্লিকেই আপনার দরজায়। সেরা মানের প্রিন্ট ও বাঁধাই।'
                                : 'Our research-driven academic books are now just a click away from your doorstep. Superior print quality and elite binding.'
                            }
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-4">
                            <Button asChild size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-yellow-400 hover:text-primary-foreground font-black uppercase tracking-widest h-14 px-10 rounded-xl shadow-2xl transition-all duration-300 active:scale-95 group/btn border-none">
                                <Link href={productLink}>
                                    {t.buy_now[language]}
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                </Link>
                            </Button>
                            
                            <div className="flex items-center gap-3 px-4 py-2 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10">
                                <div className="flex -space-x-2">
                                    {[1,2,3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-muted overflow-hidden">
                                            <Image src={`https://picsum.photos/seed/${i+100}/100/100`} alt="User" width={32} height={32} crossOrigin="anonymous" />
                                        </div>
                                    ))}
                                </div>
                                <div className="text-left">
                                    <div className="flex items-center gap-0.5">
                                        {[1,2,3,4,5].map(i => <Star key={i} className="w-2.5 h-2.5 text-yellow-400 fill-current"/>)}
                                    </div>
                                    <p className="text-[9px] font-black text-white uppercase tracking-widest">20k+ Readers</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative h-80 md:h-[500px] flex justify-center items-center">
                        <motion.div 
                            animate={{ rotate: [-8, -12, -8], y: [0, 8, 0], x: [0, -5, 0] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute w-44 md:w-72 transform -translate-x-12 md:-translate-x-24 rotate-[-12deg] transition-all duration-500 group-hover:-translate-x-16 md:group-hover:-translate-x-32 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] z-0"
                        >
                            <Image 
                                src="https://picsum.photos/seed/bookstore2/400/600"
                                alt="Decorative element"
                                width={400}
                                height={600}
                                className="object-cover rounded-lg shadow-2xl border border-white/10"
                                data-ai-hint="math book cover"
                                crossOrigin="anonymous"
                            />
                        </motion.div>
                        
                        <motion.div 
                            animate={{ rotate: [3, 7, 3], y: [0, -8, 0], x: [0, 5, 0] }}
                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="relative w-52 md:w-80 z-10 transition-all duration-500 group-hover:scale-105 group-hover:rotate-2 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)]"
                        >
                            <Image 
                                 src={productImageUrl}
                                 alt={productTitle}
                                 width={400}
                                 height={600}
                                 className="object-cover rounded-lg border border-white/20 aspect-[4/6] bg-white"
                                 data-ai-hint="product cover"
                                 crossOrigin="anonymous"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </section>
    )
}
