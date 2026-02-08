"use client"

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, SlidersHorizontal, Search } from 'lucide-react';
import React from 'react';
import { Instructor, Organization } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { cn } from '@/lib/utils';

type CourseFilterBarProps = {
  categories: string[];
  subCategories: string[];
  instructors: Instructor[];
  providers: Organization[];
};

export function CourseFilterBar({ categories, subCategories, instructors, providers }: CourseFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get('category') || 'all';
  const selectedSubCategory = searchParams.get('subCategory') || 'all';
  const selectedInstructor = searchParams.get('instructor') || 'all';
  const selectedProvider = searchParams.get('provider') || 'all';

  const handleSelect = (type: 'category' | 'subCategory' | 'instructor' | 'provider', value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (value === 'all') {
        current.delete(type);
    } else {
        current.set(type, value);
    }

    if(type === 'category') {
        current.delete('subCategory');
    }

    const search = current.toString();
    const query = search ? `?${search}` : '';

    router.push(`${pathname}${query}`, { scroll: false });
  };
  
  const hasFilters = selectedCategory !== 'all' || selectedSubCategory !== 'all' || selectedInstructor !== 'all' || selectedProvider !== 'all';

  return (
    <Card className="rounded-2xl border-primary/20 bg-background/60 backdrop-blur-xl shadow-lg sticky top-20 z-30 transition-all duration-300">
      <div className="p-4 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 px-2 shrink-0">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Explore</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                <Select value={selectedCategory} onValueChange={(v) => handleSelect('category', v)}>
                    <SelectTrigger className="bg-background/50 h-11 rounded-xl">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Select value={selectedSubCategory} onValueChange={(v) => handleSelect('subCategory', v)}>
                    <SelectTrigger className={cn("bg-background/50 h-11 rounded-xl", selectedCategory === 'all' && "opacity-50")}>
                        <SelectValue placeholder="Sub-category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="all">All Sub-categories</SelectItem>
                        {subCategories.map(sc => <SelectItem key={sc} value={sc}>{sc}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Select value={selectedInstructor} onValueChange={(v) => handleSelect('instructor', v)}>
                    <SelectTrigger className="bg-background/50 h-11 rounded-xl">
                        <SelectValue placeholder="Instructor" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="all">All Instructors</SelectItem>
                        {instructors.map(i => <SelectItem key={i.slug} value={i.slug}>{i.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={selectedProvider} onValueChange={(v) => handleSelect('provider', v)}>
                    <SelectTrigger className="bg-background/50 h-11 rounded-xl">
                        <SelectValue placeholder="Provider" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="all">All Providers</SelectItem>
                        <SelectItem value="rdc" className="font-bold text-primary">RDC Originals</SelectItem>
                        {providers.map(p => <SelectItem key={p.id} value={p.id!}>{p.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
             {hasFilters && (
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="shrink-0 text-destructive hover:bg-destructive/10 rounded-full font-bold h-11 px-4"
                    onClick={() => router.push(pathname, { scroll: false })}
                >
                    <X className="mr-2 h-4 w-4"/> Clear Filters
                </Button>
            )}
      </div>
    </Card>
  );
}