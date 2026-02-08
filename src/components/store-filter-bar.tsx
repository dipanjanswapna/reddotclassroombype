
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, SlidersHorizontal, Search } from 'lucide-react';
import React, { useMemo } from 'react';
import { StoreCategory } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { cn } from '@/lib/utils';

type StoreFilterBarProps = {
  categories: StoreCategory[];
};

export function StoreFilterBar({ categories }: StoreFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategorySlug = searchParams.get('category') || 'all';
  const selectedSubCategorySlug = searchParams.get('subCategory') || 'all';

  const handleSelect = (type: 'category' | 'subCategory', value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (value === 'all') {
        current.delete(type);
    } else {
        current.set(type, value);
    }

    if (type === 'category') {
        current.delete('subCategory');
    }

    const search = current.toString();
    const query = search ? `?${search}` : '';

    router.push(`${pathname}${query}`, { scroll: false });
  };
  
  const currentCategory = useMemo(() => 
    categories.find(c => c.slug === selectedCategorySlug),
    [categories, selectedCategorySlug]
  );

  const availableSubCategories = useMemo(() => {
    if (!currentCategory) return [];
    return currentCategory.subCategoryGroups?.flatMap(g => g.subCategories) || [];
  }, [currentCategory]);

  const hasFilters = selectedCategorySlug !== 'all' || selectedSubCategorySlug !== 'all';

  return (
    <Card className="rounded-[2.5rem] border-primary/20 bg-background/40 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] sticky top-20 z-30 transition-all duration-500 border-2">
      <div className="p-4 flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 px-4 shrink-0 border-r border-primary/10 mr-2">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-muted-foreground">Shop Filters</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                <Select value={selectedCategorySlug} onValueChange={(v) => handleSelect('category', v)}>
                    <SelectTrigger className="bg-background/50 h-12 rounded-2xl border-none shadow-sm font-semibold">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl backdrop-blur-xl">
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Select 
                    value={selectedSubCategorySlug} 
                    onValueChange={(v) => handleSelect('subCategory', v)}
                    disabled={availableSubCategories.length === 0}
                >
                    <SelectTrigger className={cn("bg-background/50 h-12 rounded-2xl border-none shadow-sm font-semibold", availableSubCategories.length === 0 && "opacity-50")}>
                        <SelectValue placeholder="All Sub-categories" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl backdrop-blur-xl">
                        <SelectItem value="all">All Sub-categories</SelectItem>
                        {availableSubCategories.map(sc => (
                            <SelectItem key={sc.name} value={sc.name.toLowerCase().replace(/\s+/g, '-')}>
                                {sc.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             {hasFilters && (
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="shrink-0 text-destructive hover:bg-destructive/10 rounded-full font-black h-12 px-6 transition-all ml-auto"
                    onClick={() => router.push(pathname, { scroll: false })}
                >
                    <X className="mr-2 h-4 w-4"/> Clear Filters
                </Button>
            )}
      </div>
    </Card>
  );
}
