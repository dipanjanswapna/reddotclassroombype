"use client"

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Search as SearchIcon, Filter } from 'lucide-react';
import React from 'react';
import { Instructor, Course, Organization } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';

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
    <Card className="mb-4 rounded-[20px] border-primary/10 bg-card/50 backdrop-blur-xl shadow-xl overflow-hidden group">
      <div className="p-5 md:p-8 flex flex-col lg:flex-row gap-8 items-center relative">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
            
            <div className="flex items-center gap-4 shrink-0">
                <div className="p-3 bg-primary/10 rounded-xl text-primary shadow-inner">
                    <Filter className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                    <h3 className="font-black text-lg md:text-xl tracking-tighter uppercase leading-none">Filters</h3>
                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] mt-1">Smart Sorting</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 w-full">
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-[0.15em] text-muted-foreground ml-1">Category</Label>
                    <Select value={selectedCategory} onValueChange={(v) => handleSelect('category', v)}>
                        <SelectTrigger className="rounded-xl h-11 bg-background/50 border-primary/5 hover:border-primary/20 transition-all font-bold text-xs"><SelectValue placeholder="All Categories" /></SelectTrigger>
                        <SelectContent className="rounded-xl border-white/10 shadow-2xl">
                            <SelectItem value="all" className="font-bold text-xs">All Categories</SelectItem>
                            {categories.map(c => <SelectItem key={c} value={c} className="font-bold text-xs">{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-[0.15em] text-muted-foreground ml-1">Subject</Label>
                    <Select value={selectedSubCategory} onValueChange={(v) => handleSelect('subCategory', v)}>
                        <SelectTrigger className="rounded-xl h-11 bg-background/50 border-primary/5 hover:border-primary/20 transition-all font-bold text-xs"><SelectValue placeholder="All Subjects" /></SelectTrigger>
                        <SelectContent className="rounded-xl border-white/10 shadow-2xl">
                            <SelectItem value="all" className="font-bold text-xs">All Subjects</SelectItem>
                            {subCategories.map(sc => <SelectItem key={sc} value={sc} className="font-bold text-xs">{sc}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-[0.15em] text-muted-foreground ml-1">Instructor</Label>
                    <Select value={selectedInstructor} onValueChange={(v) => handleSelect('instructor', v)}>
                        <SelectTrigger className="rounded-xl h-11 bg-background/50 border-primary/5 hover:border-primary/20 transition-all font-bold text-xs"><SelectValue placeholder="All Mentors" /></SelectTrigger>
                        <SelectContent className="rounded-xl border-white/10 shadow-2xl">
                            <SelectItem value="all" className="font-bold text-xs">All Mentors</SelectItem>
                            {instructors.map(i => <SelectItem key={i.slug} value={i.slug} className="font-bold text-xs">{i.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-[0.15em] text-muted-foreground ml-1">Partner</Label>
                    <Select value={selectedProvider} onValueChange={(v) => handleSelect('provider', v)}>
                        <SelectTrigger className="rounded-xl h-11 bg-background/50 border-primary/5 hover:border-primary/20 transition-all font-bold text-xs"><SelectValue placeholder="All Partners" /></SelectTrigger>
                        <SelectContent className="rounded-xl border-white/10 shadow-2xl">
                            <SelectItem value="all" className="font-bold text-xs">All Providers</SelectItem>
                            <SelectItem value="rdc" className="font-bold text-xs">RDC Originals</SelectItem>
                            {providers.map(p => <SelectItem key={p.id} value={p.id!} className="font-bold text-xs">{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
             {hasFilters && (
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => router.push(pathname, { scroll: false })}
                    className="shrink-0 text-destructive hover:bg-destructive/10 rounded-xl font-black uppercase text-[10px] tracking-widest h-11 px-6 border border-destructive/10"
                >
                    <X className="mr-2 h-4 w-4"/> Clear All
                </Button>
            )}
      </div>
    </Card>
  );
}
