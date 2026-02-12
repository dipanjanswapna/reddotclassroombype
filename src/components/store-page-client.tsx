'use client';

import { useState, useMemo } from 'react';
import { Product, StoreCategory, HomepageConfig } from '@/lib/types';
import { Input } from './ui/input';
import { Search, ShoppingBag, Filter, Sparkles } from 'lucide-react';
import { ProductCard } from './product-card';
import { useSearchParams } from 'next/navigation';
import { BookBanner } from './book-banner';
import { StoreBannerCarousel } from './store-banner-carousel';
import { motion } from 'framer-motion';

/**
 * @fileOverview RDC Store Page Client Component.
 * Optimized for high-density wall-to-wall UI with px-1 and 20px rounding.
 * Desktop view shows 5 products in a row (xl:grid-cols-5).
 * Carousel remains visible during search for stability.
 */
export function StorePageClient({
    initialProducts,
    allCategories,
    pageTitle,
    homepageConfig,
}: {
    initialProducts: Product[];
    allCategories: StoreCategory[];
    pageTitle: string;
    homepageConfig: HomepageConfig | null;
}) {
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

    const bestsellerProduct = useMemo(() => {
        const id = homepageConfig?.storeHomepageSection?.bestsellerProductId;
        if (!id) return null;
        return products.find(p => p.id === id) || null;
    }, [products, homepageConfig]);

    const hasFilters = !!(selectedCategorySlug || selectedSubCategorySlug || searchTerm);

    return (
        <div className="w-full px-1 -mt-6 lg:-mt-14 space-y-6 md:space-y-10">
            <main className="space-y-8 md:space-y-12">
                {/* Dynamic Hero Banners - Stable during search */}
                {homepageConfig?.storeHomepageSection?.bannerCarousel && (
                     <div className="rounded-[20px] overflow-hidden shadow-xl border border-primary/5">
                        <StoreBannerCarousel banners={homepageConfig.storeHomepageSection.bannerCarousel} />
                     </div>
                )}
                
                <div className="space-y-6 md:space-y-8">
                    {/* Header & Filter Area */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-l-4 border-primary pl-4">
                        <div className="space-y-0.5">
                            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/20 w-fit">
                                <ShoppingBag className="w-3 h-3" />
                                RDC Store Hub
                            </div>
                            <h1 className="text-xl md:text-3xl font-black uppercase tracking-tight font-headline">
                                {pageTitle === "All Products" ? "RED DOT CLASSROOM (RDC) Store" : pageTitle}
                            </h1>
                        </div>
                        
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                className="pl-9 h-11 rounded-xl bg-card border-primary/20 focus:border-primary/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Product Grid - 5 columns on Desktop (xl:grid-cols-5) */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5 px-1">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredProducts.length === 0 && (
                        <div className="text-center py-24 bg-muted/20 border-2 border-dashed border-primary/10 rounded-[20px] flex flex-col items-center">
                            <Filter className="w-12 h-12 text-primary/20 mb-4" />
                            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs opacity-40">No products match your criteria</p>
                        </div>
                    )}
                </div>

                {/* Promotional Banner - Dynamic Bestseller */}
                {!hasFilters && (
                    <div className="pb-10">
                        <BookBanner bestsellerProduct={bestsellerProduct} />
                    </div>
                )}
            </main>
        </div>
    );
}
