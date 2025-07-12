
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Instructor } from '@/lib/types';
import { Home, Book } from 'lucide-react';

export function TeacherFilterPage({ instructors, subjects }: { instructors: Instructor[], subjects: string[] }) {
    const [selectedSubject, setSelectedSubject] = useState('সব');

    const filteredInstructors = selectedSubject === 'সব'
        ? instructors
        : instructors.filter(inst => inst.title === selectedSubject);

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-8">
                <h2 className="font-headline text-2xl font-bold mb-4">বিভাগ অনুযায়ী শিক্ষকদের সংগঠিত</h2>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={selectedSubject === 'সব' ? 'default' : 'outline'}
                        onClick={() => setSelectedSubject('সব')}
                        className="rounded-full"
                    >
                        <Home className="mr-2 h-4 w-4" />
                        সব
                    </Button>
                    {subjects.map(subject => (
                        <Button
                            key={subject}
                            variant={selectedSubject === subject ? 'default' : 'outline'}
                            onClick={() => setSelectedSubject(subject)}
                             className="rounded-full"
                        >
                           <Book className="mr-2 h-4 w-4" />
                           {subject}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredInstructors.map((teacher) => (
                <Link key={teacher.id} href={`/teachers/${teacher.slug}`} className="group block" aria-label={`View profile for ${teacher.name}`}>
                    <Card className="overflow-hidden relative aspect-[4/5] rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <Image
                        src={teacher.avatarUrl}
                        alt={teacher.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint={teacher.dataAiHint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" aria-hidden="true" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="font-semibold text-lg">{teacher.name}</h3>
                        <p className="text-sm text-white/80">{teacher.title}</p>
                    </div>
                    </Card>
                </Link>
                ))}
            </div>
            {filteredInstructors.length === 0 && (
                <div className="text-center py-16 bg-muted rounded-lg col-span-full">
                    <p className="text-muted-foreground">No teachers found for the selected subject.</p>
                </div>
            )}
        </div>
    );
}
