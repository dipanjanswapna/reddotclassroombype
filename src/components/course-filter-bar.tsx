

"use client"

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import React, { useMemo } from 'react';
import { Instructor, Course, Organization } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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
    <Card className="mb-12">
      <div className="p-4 flex flex-col md:flex-row gap-4 items-center">
            <h3 className="font-semibold text-lg shrink-0">Find a Course</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                <Select value={selectedCategory} onValueChange={(v) => handleSelect('category', v)}>
                    <SelectTrigger><SelectValue placeholder="Select Category..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Select value={selectedSubCategory} onValueChange={(v) => handleSelect('subCategory', v)}>
                    <SelectTrigger><SelectValue placeholder="Select Sub-category..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Sub-categories</SelectItem>
                        {subCategories.map(sc => <SelectItem key={sc} value={sc}>{sc}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Select value={selectedInstructor} onValueChange={(v) => handleSelect('instructor', v)}>
                    <SelectTrigger><SelectValue placeholder="Select Instructor..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Instructors</SelectItem>
                        {instructors.map(i => <SelectItem key={i.slug} value={i.slug}>{i.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={selectedProvider} onValueChange={(v) => handleSelect('provider', v)}>
                    <SelectTrigger><SelectValue placeholder="Select Provider..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Providers</SelectItem>
                        <SelectItem value="rdc">RDC Originals</SelectItem>
                        {providers.map(p => <SelectItem key={p.id} value={p.id!}>{p.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
             {hasFilters && (
                <Button variant="ghost" size="sm" onClick={() => router.push(pathname, { scroll: false })}>
                    <X className="mr-2 h-4 w-4"/> Clear
                </Button>
            )}
      </div>
    </Card>
  );
}
