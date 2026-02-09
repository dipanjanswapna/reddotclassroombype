
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Instructor } from '@/lib/types';
import { Home, Book, Layers, LayoutGrid, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function TeacherFilterPage({ instructors, subjects }: { instructors: Instructor[], subjects: string[] }) {
    const [selectedSubject, setSelectedSubject] = useState('সব');

    const filteredInstructors = selectedSubject === 'সব'
        ? instructors
        : instructors.filter(inst => inst.title === selectedSubject);

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="mb-10 md:mb-14">
                <div className="flex items-center gap-3 mb-6 border-l-4 border-primary pl-4">
                    <h2 className="font-headline text-lg md:text-xl lg:text-2xl font-black tracking-tight uppercase">বিভাগ অনুযায়ী শিক্ষকদের সংগঠিত</h2>
                </div>
                
                {/* Horizontal Scroll System for Categories */}
                <div className="relative group">
                    <div className="flex overflow-x-auto no-scrollbar gap-3 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                        <Button
                            variant={selectedSubject === 'সব' ? 'default' : 'outline'}
                            onClick={() => setSelectedSubject('সব')}
                            className={cn(
                                "rounded-xl h-10 md:h-12 px-6 font-black uppercase tracking-tighter text-xs md:text-sm shrink-0 shadow-sm transition-all",
                                selectedSubject === 'সব' ? "bg-primary text-white shadow-primary/20 scale-105" : "bg-white/50 backdrop-blur-sm border-white/20 hover:bg-white"
                            )}
                        >
                            <LayoutGrid className="mr-2 h-4 w-4" />
                            সব
                        </Button>
                        {subjects.map(subject => (
                            <Button
                                key={subject}
                                variant={selectedSubject === subject ? 'default' : 'outline'}
                                onClick={() => setSelectedSubject(subject)}
                                className={cn(
                                    "rounded-xl h-10 md:h-12 px-6 font-black uppercase tracking-tighter text-xs md:text-sm shrink-0 shadow-sm transition-all",
                                    selectedSubject === subject ? "bg-primary text-white shadow-primary/20 scale-105" : "bg-white/50 backdrop-blur-sm border-white/20 hover:bg-white"
                                )}
                            >
                               <Book className="mr-2 h-4 w-4" />
                               {subject}
                            </Button>
                        ))}
                    </div>
                    {/* Shadow indicators for scroll */}
                    <div className="absolute right-0 top-0 h-12 w-12 bg-gradient-to-l from-background/50 to-transparent pointer-events-none lg:hidden" />
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div 
                    key={selectedSubject}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="grid gap-4 md:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                >
                    {filteredInstructors.map((teacher) => (
                    <Link key={teacher.id} href={`/teachers/${teacher.slug}`} className="group block" aria-label={`View profile for ${teacher.name}`}>
                        <Card className="overflow-hidden relative aspect-[4/5] rounded-2xl shadow-md border-white/30 bg-[#eef2ed] dark:bg-card/40 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group-hover:border-primary/30">
                            <Image
                                src={teacher.avatarUrl}
                                alt={teacher.name}
                                fill
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                data-ai-hint={teacher.dataAiHint}
                            />
                            
                            {/* Verified Badge */}
                            <div className="absolute top-2 right-2 z-10">
                                <div className="bg-white/80 backdrop-blur-md p-1 rounded-full shadow-sm border border-white/50">
                                    <CheckCircle2 className="w-4 h-4 text-green-600 fill-green-50" />
                                </div>
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
                            
                            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-white z-10">
                                <h3 className="font-headline font-black text-xs md:text-base leading-tight uppercase tracking-tight group-hover:text-primary transition-colors">
                                    {teacher.name}
                                </h3>
                                <p className="text-[10px] md:text-xs text-white/70 font-bold uppercase tracking-widest mt-1">
                                    {teacher.title}
                                </p>
                                
                                <div className="mt-3 pt-3 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-primary">View Profile →</span>
                                </div>
                            </div>
                        </Card>
                    </Link>
                    ))}
                </motion.div>
            </AnimatePresence>

            {filteredInstructors.length === 0 && (
                <div className="text-center py-24 bg-white/40 backdrop-blur-sm rounded-3xl border border-dashed border-white/50 shadow-inner">
                    <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground font-bold text-lg">No teachers found for the selected subject.</p>
                    <Button variant="link" onClick={() => setSelectedSubject('সব')} className="mt-2 text-primary font-black uppercase tracking-widest text-xs">Show All Teachers</Button>
                </div>
            )}
        </div>
    );
}
