

'use client';

import { useState, useMemo } from 'react';
import { Product, StoreCategory } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Filter, X, Search, Book, Pen, Shirt } from 'lucide-react';
import { ProductCard } from './product-card';
import { StoreFilterBar } from './store-filter-bar';
import { useSearchParams } from 'next/navigation';

const categoryIcons: { [key: string]: React.ReactNode } = {
  'T-Shirt': <Shirt className="h-4 w-4" />,
  'Hoodie': <Shirt className="h-4 w-4" />,
  'Jersey': <Shirt className="h-4 w-4" />,
  'Apparel': <Shirt className="h-4 w-4" />,
  'PDF Book': <Book className="h-4 w-4" />,
  'Printed Book': <Book className="h-4 w-4" />,
  'E-Book': <Book className="h-4 w-4" />,
  'Pen': <Pen className="h-4 w-4" />,
  'Notebook': <Book className="h-4 w-4" />,
  'Stationery': <Pen className="h-4 w-4" />,
};

export function StorePageClient({ initialProducts, allCategories, pageTitle }: { initialProducts: Product[], allCategories: StoreCategory[], pageTitle: string }) {
    const [products] = useState(initialProducts);
    const [searchTerm, setSearchTerm] = useState('');
    const searchParams = useSearchParams();

    const selectedCategorySlug = searchParams.get('category');
    const selectedSubCategorySlug = searchParams.get('subCategory');

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
            
            const category = allCategories.find(c => c.slug === selectedCategorySlug);
            const subCategory = category?.subCategories?.find(sc => sc.name.toLowerCase().replace(/\s+/g, '-') === selectedSubCategorySlug);

            const matchesCategory = !selectedCategorySlug || (category && product.category === category.name);
            const matchesSubCategory = !selectedSubCategorySlug || (subCategory && product.subCategory === subCategory.name);

            return matchesSearch && matchesCategory && matchesSubCategory;
        });
    }, [products, searchTerm, allCategories, selectedCategorySlug, selectedSubCategorySlug]);

    return (
        <div className="container mx-auto px-4 grid lg:grid-cols-4 gap-8 py-8">
            <aside className="hidden lg:block lg:col-span-1">
                <StoreFilterBar categories={allCategories} />
            </aside>
            <main className="lg:col-span-3">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">{pageTitle}</h1>
                    <div className="relative w-full md:w-auto md:flex-grow max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
                {filteredProducts.length === 0 && (
                    <div className="col-span-full text-center py-16">
                        <p className="text-muted-foreground">No products found matching your criteria.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
