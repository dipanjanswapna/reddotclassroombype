'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Instructor } from '@/lib/types';
import { Home, Book } from 'lucide-react';

/**
 * @fileOverview Redesigned Teacher Filter Page.
 * Implements a strict 5-column grid on desktop (xl:grid-cols-5).
 */
export function TeacherFilterPage({ instructors, subjects }: { instructors: Instructor[], subjects: string[] }) {
    const [selectedSubject, setSelectedSubject] = useState('সব');

    const filteredInstructors = selectedSubject === 'সব'
        ? instructors
        : instructors.filter(inst => inst.title === selectedSubject);

    return (
        <div className="container mx-auto px-4 py-10 md:py-14 max-w-full overflow-hidden">
            <div className="mb-10">
                <h2 className="font-headline text-2xl md:text-3xl font-black uppercase tracking-tight mb-6 flex items-center gap-4">
                    <div className="h-8 md:h-10 w-1.5 bg-primary rounded-full shadow-sm"></div>
                    Find Your Mentor
                </h2>
                <div className="flex flex-wrap gap-3">
                    <Button
                        variant={selectedSubject === 'সব' ? 'default' : 'outline'}
                        onClick={() => setSelectedSubject('সব')}
                        className="rounded-full h-10 px-6 font-bold uppercase tracking-wider text-xs"
                    >
                        <Home className="mr-2 h-4 w-4" />
                        সব
                    </Button>
                    {subjects.map(subject => (
                        <Button
                            key={subject}
                            variant={selectedSubject === subject ? 'default' : 'outline'}
                            onClick={() => setSelectedSubject(subject)}
                             className="rounded-full h-10 px-6 font-bold uppercase tracking-wider text-xs border-primary/20"
                        >
                           <Book className="mr-2 h-4 w-4" />
                           {subject}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Strict 5-column Grid on Desktop */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                {filteredInstructors.map((teacher) => (
                <Link key={teacher.id} href={`/teachers/${teacher.slug}`} className="group block" aria-label={`View profile for ${teacher.name}`}>
                    <Card className="overflow-hidden relative aspect-[4/5] rounded-[2rem] border border-primary/10 shadow-lg transition-all duration-500 hover:shadow-2xl hover:border-primary/40 hover:-translate-y-1 group">
                    <Image
                        src={teacher.avatarUrl}
                        alt={teacher.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 25vw, 20vw"
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        data-ai-hint={teacher.dataAiHint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" aria-hidden="true" />
                    
                    <div className="absolute bottom-6 left-6 right-6">
                        <div className="relative p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl text-white text-center">
                            <h3 className="font-black text-base md:text-lg uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">{teacher.name}</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mt-1">{teacher.title}</p>
                        </div>
                    </div>
                    </Card>
                </Link>
                ))}
            </div>
            {filteredInstructors.length === 0 && (
                <div className="text-center py-24 bg-muted/30 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center">
                    <p className="text-xl font-bold text-muted-foreground">No teachers found for this category.</p>
                    <p className="text-sm text-muted-foreground mt-2 font-medium">Try selecting another subject or reset the filter.</p>
                </div>
            )}
        </div>
    );
}