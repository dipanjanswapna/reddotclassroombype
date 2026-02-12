'use client';

import Image from 'next/image';
import { Button } from './ui/button';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';

/**
 * @fileOverview BookBanner Component
 * Upgraded UI/UX for the bestseller book section.
 * Uses 20px rounding, high-density layout, and px-1 spacing.
 */
export function BookBanner() {
    return (
        <section className="px-1 py-0 overflow-hidden">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-primary rounded-[20px] p-8 md:p-14 overflow-hidden shadow-2xl border border-white/10 group"
            >
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full blur-[80px] -ml-32 -mb-32" />
                
                <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                    <div className="space-y-6 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/30 shadow-lg">
                            <Sparkles className="w-3.5 h-3.5" />
                            Premium Release
                        </div>
                        
                        <div className="space-y-3">
                            <p className="font-black text-white/80 uppercase tracking-widest text-xs md:text-sm">By bestseller author</p>
                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-none tracking-tighter uppercase font-headline">
                                Meet your next <br className="hidden lg:block"/> 
                                <span className="text-yellow-400">favorite book</span>
                            </h2>
                        </div>

                        <p className="text-white/70 font-medium text-sm md:text-lg max-w-md mx-auto md:mx-0 leading-relaxed">
                            গবেষণালব্ধ তথ্যের ভিত্তিতে তৈরি আমাদের বিশেষ একাডেমিক বইগুলো এখন এক ক্লিকেই আপনার দরজায়।
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-4">
                            <Button asChild size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-yellow-400 hover:text-primary-foreground font-black uppercase tracking-widest h-14 px-10 rounded-xl shadow-2xl transition-all duration-300 active:scale-95 group/btn">
                                <Link href="/store?category=books">
                                    Buy Our Books
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                </Link>
                            </Button>
                            
                            <div className="flex items-center gap-3 px-4">
                                <div className="flex -space-x-2">
                                    {[1,2,3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-muted overflow-hidden">
                                            <Image src={`https://picsum.photos/seed/${i+10}/100/100`} alt="User" width={32} height={32} />
                                        </div>
                                    ))}
                                </div>
                                <div className="text-left">
                                    <div className="flex items-center gap-0.5">
                                        {[1,2,3,4,5].map(i => <Star key={i} className="w-2.5 h-2.5 text-yellow-400 fill-current"/>)}
                                    </div>
                                    <p className="text-[9px] font-black text-white uppercase tracking-widest">15k+ Sold</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-center md:justify-start gap-8 mt-10 opacity-40 grayscale brightness-0 invert">
                            <Image src="https://i.imgur.com/rS25S1q.png" alt="Audible" width={70} height={18} className="object-contain" data-ai-hint="audible logo"/>
                            <Image src="https://i.imgur.com/1G8WJpT.png" alt="Amazon" width={70} height={18} className="object-contain" data-ai-hint="amazon logo"/>
                            <Image src="https://i.imgur.com/vHqLz3y.png" alt="Google" width={70} height={18} className="object-contain" data-ai-hint="google books logo"/>
                        </div>
                    </div>

                    <div className="relative h-72 md:h-[450px] flex justify-center items-center">
                        {/* Realistic Book Stack */}
                        <motion.div 
                            animate={{ rotate: [-8, -10, -8], y: [0, 5, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute w-40 md:w-64 transform -translate-x-12 md:-translate-x-20 rotate-[-10deg] transition-all duration-500 group-hover:-translate-x-16 md:group-hover:-translate-x-24 shadow-2xl z-0"
                        >
                            <Image 
                                src="https://picsum.photos/seed/book2/400/600"
                                alt="Book cover 2"
                                width={400}
                                height={600}
                                className="object-cover rounded-lg shadow-2xl border border-white/10"
                                data-ai-hint="book cover design"
                            />
                        </motion.div>
                        
                        <motion.div 
                            animate={{ rotate: [3, 5, 3], y: [0, -5, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            className="relative w-48 md:w-72 z-10 transition-all duration-500 group-hover:scale-105 group-hover:rotate-2 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]"
                        >
                            <Image 
                                 src="https://picsum.photos/seed/book1/400/600"
                                 alt="Book cover 1"
                                 width={400}
                                 height={600}
                                 className="object-cover rounded-lg border border-white/20"
                                 data-ai-hint="premium book cover"
                            />
                            {/* Reflection effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </section>
    )
}
