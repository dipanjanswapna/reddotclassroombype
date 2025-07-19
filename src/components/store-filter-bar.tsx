

"use client"

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import React from 'react';
import { StoreCategory } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type StoreFilterBarProps = {
  categories: StoreCategory[];
};

export function StoreFilterBar({ categories }: StoreFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategorySlug = searchParams.get('category');
  const selectedSubCategorySlug = searchParams.get('subCategory');

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
                           <div key={category.id} className="flex flex-col items-start space-y-1">
                                <Link 
                                    href={`/store?category=${category.slug}`}
                                    className={cn("font-medium hover:text-primary", selectedCategorySlug === category.slug && "text-primary font-bold")}
                                    scroll={false}
                                >
                                    {category.name}
                                </Link>
                                {selectedCategorySlug === category.slug && category.subCategories && (
                                    <div className="pl-4 space-y-1 border-l ml-1">
                                        {category.subCategories.map(sc => {
                                            const subCatSlug = sc.name.toLowerCase().replace(/\s+/g, '-');
                                            return (
                                                 <Link 
                                                    key={sc.name}
                                                    href={`/store?category=${category.slug}&subCategory=${subCatSlug}`}
                                                    className={cn("text-sm block hover:text-primary", selectedSubCategorySlug === subCatSlug ? "text-primary font-semibold" : "text-muted-foreground")}
                                                    scroll={false}
                                                >
                                                    {sc.name}
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )}
                           </div>
                        ))}
                    </div>
                </div>
                {(selectedCategorySlug || selectedSubCategorySlug) && (
                    <Button variant="ghost" size="sm" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive mt-4" onClick={clearFilters}>
                        <X className="mr-1 h-4 w-4" />
                        Clear Filters
                    </Button>
                )}
            </div>
        </CardContent>
    </Card>
  );
}
