

'use client';

import { useState, useMemo } from 'react';
import { Product, StoreCategory } from '@/lib/types';
import { Input } from './ui/input';
import { Search } from 'lucide-react';
import { ProductCard } from './product-card';
import { useSearchParams } from 'next/navigation';

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
            const subCategory = category?.subCategoryGroups?.flatMap(g => g.subCategories).find(sc => sc.name.toLowerCase().replace(/\s+/g, '-') === selectedSubCategorySlug);

            const matchesCategory = !selectedCategorySlug || (category && product.category === category.name);
            const matchesSubCategory = !selectedSubCategorySlug || (subCategory && product.subCategory === subCategory.name);

            return matchesSearch && matchesCategory && matchesSubCategory;
        });
    }, [products, searchTerm, allCategories, selectedCategorySlug, selectedSubCategorySlug]);

    return (
        <div className="container mx-auto px-4 py-8">
            <main>
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
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
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
