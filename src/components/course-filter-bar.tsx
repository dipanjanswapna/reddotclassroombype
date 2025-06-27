
"use client"

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, X } from 'lucide-react';
import React from 'react';

type CourseFilterBarProps = {
  categories: string[];
  subCategories: string[];
};

export function CourseFilterBar({ categories, subCategories }: CourseFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get('category');
  const selectedSubCategory = searchParams.get('subCategory');

  const handleSelect = (type: 'category' | 'subCategory', value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (value === 'all') {
      current.delete(type);
    } else {
      current.set(type, value);
    }

    const search = current.toString();
    const query = search ? `?${search}` : '';

    router.push(`${pathname}${query}`, { scroll: false });
  };
  
  const clearFilters = () => {
    router.push(pathname, { scroll: false });
  }

  return (
    <div className="bg-gray-900 border-y border-gray-700/50">
      <div className="container mx-auto flex flex-wrap items-center gap-2 py-2">
        <span className="text-sm font-semibold text-gray-300 pr-2">ফিল্টার করুন:</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-white hover:bg-gray-700 data-[state=open]:bg-gray-700">
              {selectedCategory || 'ক্যাটাগরি'}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={() => handleSelect('category', 'all')}>সকল ক্যাটাগরি</DropdownMenuItem>
            {categories.map((category) => (
              <DropdownMenuItem key={category} onSelect={() => handleSelect('category', category)}>
                {category}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-white hover:bg-gray-700 data-[state=open]:bg-gray-700" disabled={!subCategories.length}>
              {selectedSubCategory || 'সাব-ক্যাটাগরি'}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={() => handleSelect('subCategory', 'all')}>সকল সাব-ক্যাটাগরি</DropdownMenuItem>
            {subCategories.map((subCategory) => (
              <DropdownMenuItem key={subCategory} onSelect={() => handleSelect('subCategory', subCategory)}>
                {subCategory}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {(selectedCategory || selectedSubCategory) && (
            <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-400/10 hover:text-red-300" onClick={clearFilters}>
                <X className="mr-1 h-4 w-4" />
                ফিল্টার মুছুন
            </Button>
        )}
      </div>
    </div>
  );
}
