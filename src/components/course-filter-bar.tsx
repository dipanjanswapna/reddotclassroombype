"use client"

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Search as SearchIcon } from 'lucide-react';
import React from 'react';
import { Instructor, Course, Organization } from '@/lib/types';
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
    <Card className="mb-12 glassmorphism-card border-white/20 bg-white/40 dark:bg-card/40 overflow-hidden rounded-2xl shadow-xl">
      <div className="p-6 flex flex-col lg:flex-row gap-6 items-center">
            <div className="flex items-center gap-3 shrink-0">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <SearchIcon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-black text-xl tracking-tight uppercase">Find a Course</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
                <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Category</Label>
                    <Select value={selectedCategory} onValueChange={(v) => handleSelect('category', v)}>
                        <SelectTrigger className="rounded-xl bg-background/50"><SelectValue placeholder="Select Category..." /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Subject</Label>
                    <Select value={selectedSubCategory} onValueChange={(v) => handleSelect('subCategory', v)}>
                        <SelectTrigger className="rounded-xl bg-background/50"><SelectValue placeholder="Select Subject..." /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">All Subjects</SelectItem>
                            {subCategories.map(sc => <SelectItem key={sc} value={sc}>{sc}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Instructor</Label>
                    <Select value={selectedInstructor} onValueChange={(v) => handleSelect('instructor', v)}>
                        <SelectTrigger className="rounded-xl bg-background/50"><SelectValue placeholder="Select Instructor..." /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">All Instructors</SelectItem>
                            {instructors.map(i => <SelectItem key={i.slug} value={i.slug}>{i.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Partner</Label>
                    <Select value={selectedProvider} onValueChange={(v) => handleSelect('provider', v)}>
                        <SelectTrigger className="rounded-xl bg-background/50"><SelectValue placeholder="Select Provider..." /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">All Providers</SelectItem>
                            <SelectItem value="rdc">RDC Originals</SelectItem>
                            {providers.map(p => <SelectItem key={p.id} value={p.id!}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
             {hasFilters && (
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => router.push(pathname, { scroll: false })}
                    className="shrink-0 text-destructive hover:bg-destructive/10 rounded-xl font-bold uppercase tracking-tighter"
                >
                    <X className="mr-2 h-4 w-4"/> Clear
                </Button>
            )}
      </div>
    </Card>
  );
}

import { Label } from './ui/label';
