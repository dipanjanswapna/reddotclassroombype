

"use client"

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, X } from 'lucide-react';
import React from 'react';
import { StoreCategory } from '@/lib/types';

type StoreFilterBarProps = {
  categories: StoreCategory[];
};

export function StoreFilterBar({ categories }: StoreFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategorySlug = searchParams.get('category');
  const selectedSubCategorySlug = searchParams.get('subCategory');

  const selectedCategory = categories.find(c => c.slug === selectedCategorySlug);
  const selectedSubCategory = selectedCategory?.subCategories?.find(sc => sc.name.toLowerCase().replace(/\s+/g, '-') === selectedSubCategorySlug);

  const handleSelect = (type: 'category' | 'subCategory', value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (type === 'category') {
        current.delete('subCategory');
        if (value === 'all') {
            current.delete('category');
        } else {
            current.set('category', value);
        }
    }

    if (type === 'subCategory') {
        if (value === 'all') {
            current.delete('subCategory');
        } else {
            current.set('subCategory', value);
        }
    }

    const search = current.toString();
    const query = search ? `?${search}` : '';

    router.push(`${pathname}${query}`, { scroll: false });
  };
  
  const clearFilters = () => {
    router.push(pathname, { scroll: false });
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-6">
                <div>
                    <h3 className="font-semibold mb-4">Categories</h3>
                    <div className="space-y-2">
                        {categories.map((category) => (
                           <div key={category.id} className="flex flex-col items-start space-y-2">
                                <Button 
                                    variant="link" 
                                    className={`p-0 h-auto justify-start ${selectedCategory?.id === category.id ? 'font-bold text-primary' : ''}`}
                                    onClick={() => handleSelect('category', category.slug)}
                                >
                                    {category.name}
                                </Button>
                                {selectedCategory?.id === category.id && category.subCategories && (
                                    <div className="pl-4 space-y-1 border-l">
                                        {category.subCategories.map(sc => (
                                             <Button 
                                                key={sc.name}
                                                variant="link" 
                                                className={`p-0 h-auto justify-start text-sm ${selectedSubCategory?.name === sc.name ? 'font-bold text-primary' : 'text-muted-foreground'}`}
                                                onClick={() => handleSelect('subCategory', sc.name.toLowerCase().replace(/\s+/g, '-'))}
                                            >
                                                {sc.name}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                           </div>
                        ))}
                    </div>
                </div>
                {(selectedCategorySlug || selectedSubCategorySlug) && (
                    <Button variant="ghost" size="sm" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={clearFilters}>
                        <X className="mr-1 h-4 w-4" />
                        Clear Filters
                    </Button>
                )}
            </div>
        </CardContent>
    </Card>
  );
}
