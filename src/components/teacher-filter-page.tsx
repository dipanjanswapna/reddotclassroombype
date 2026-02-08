'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Instructor } from '@/lib/types';
import { Home, Book, Search } from 'lucide-react';
import { Input } from './ui/input';

/**
 * @fileOverview Redesigned Teacher Filter Page.
 * Implements a high-impact arrival and a strict 5-column elite grid on desktop.
 */
export function TeacherFilterPage({ instructors, subjects }: { instructors: Instructor[], subjects: string[] }) {
    const [selectedSubject, setSelectedSubject] = useState('সব');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredInstructors = instructors.filter(inst => {
        const matchesSubject = selectedSubject === 'সব' || inst.title === selectedSubject;
        const matchesSearch = inst.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (inst.title && inst.title.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSubject && matchesSearch;
    });

    return (
        <div className="container mx-auto px-4 md:px-8 py-10 md:py-14 max-w-full overflow-hidden">
            <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="text-center lg:text-left space-y-4">
                    <h2 className="font-headline text-3xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center lg:justify-start gap-4">
                        <div className="h-10 md:h-12 w-2 bg-primary rounded-full shadow-lg"></div>
                        Meet Our Elite Mentors
                    </h2>
                    <p className="text-lg text-muted-foreground font-medium max-w-2xl">Learn from the most experienced educators in the country, dedicated to your academic mastery.</p>
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-4">
                        <Button
                            variant={selectedSubject === 'সব' ? 'default' : 'outline'}
                            onClick={() => setSelectedSubject('সব')}
                            className="rounded-full h-11 px-8 font-black uppercase tracking-widest text-[10px] shadow-sm transition-all"
                        >
                            <Home className="mr-2 h-4 w-4" />
                            সব
                        </Button>
                        {subjects.map(subject => (
                            <Button
                                key={subject}
                                variant={selectedSubject === subject ? 'default' : 'outline'}
                                onClick={() => setSelectedSubject(subject)}
                                className="rounded-full h-11 px-8 font-black uppercase tracking-widest text-[10px] border-primary/20 hover:bg-primary/5 transition-all"
                            >
                               <Book className="mr-2 h-4 w-4" />
                               {subject}
                            </Button>
                        ))}
                    </div>
                </div>
                
                <div className="relative w-full lg:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                        placeholder="Search for a specific mentor..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 h-14 rounded-2xl border-2 focus-visible:ring-primary shadow-xl bg-card/50 backdrop-blur-sm font-bold"
                    />
                </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                {filteredInstructors.map((teacher) => (
                <Link key={teacher.id} href={`/teachers/${teacher.slug}`} className="group block h-full" aria-label={`View profile for ${teacher.name}`}>
                    <Card className="overflow-hidden relative aspect-[4/5] rounded-[2.5rem] border border-primary/10 shadow-xl transition-all duration-700 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40 hover:-translate-y-2 group bg-card">
                    <Image
                        src={teacher.avatarUrl}
                        alt={teacher.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 25vw, 20vw"
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        data-ai-hint={teacher.dataAiHint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" aria-hidden="true" />
                    
                    <div className="absolute bottom-8 left-6 right-6">
                        <div className="relative p-5 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl text-white text-center transition-all group-hover:bg-white/20">
                            <h3 className="font-black text-lg md:text-xl uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">{teacher.name}</h3>
                            <div className="h-0.5 w-8 bg-primary mx-auto my-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-70 group-hover:opacity-100">{teacher.title}</p>
                        </div>
                    </div>
                    </Card>
                </Link>
                ))}
            </div>
            {filteredInstructors.length === 0 && (
                <div className="text-center py-32 bg-muted/30 rounded-[4rem] border-4 border-dashed border-primary/10 flex flex-col items-center">
                    <Search className="h-20 w-24 text-primary/10 mb-6" />
                    <p className="text-2xl font-black text-muted-foreground uppercase tracking-tight">No mentors found</p>
                    <p className="text-base text-muted-foreground mt-2 font-medium px-6">We couldn't find any mentors matching your criteria. Try adjusting your filters.</p>
                    <Button variant="link" onClick={() => { setSelectedSubject('সব'); setSearchTerm(''); }} className="mt-6 font-black uppercase text-[10px] tracking-widest">Clear All Filters</Button>
                </div>
            )}
        </div>
    );
}
