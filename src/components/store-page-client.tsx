
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Product, StoreCategory, HomepageConfig } from '@/lib/types';
import { Input } from './ui/input';
import { Search, ShoppingBag, Filter, Sparkles, Loader2 } from 'lucide-react';
import { ProductCard } from './product-card';
import { useSearchParams } from 'next/navigation';
import { BookBanner } from './book-banner';
import { StoreBannerCarousel } from './store-banner-carousel';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from 'react-use';

/**
 * @fileOverview RDC Store Page Client Component.
 * Optimized for high-density wall-to-wall UI with px-1 and 20px rounding.
 * Implements useDebounce for optimized search experience.
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
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const searchParams = useSearchParams();

    // useDebounce from react-use to optimize performance
    useDebounce(
        () => {
            setDebouncedSearchTerm(searchTerm);
            setIsSearching(false);
        },
        400,
        [searchTerm]
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setIsSearching(true);
    };

    const selectedCategorySlug = searchParams.get('category');
    const selectedSubCategorySlug = searchParams.get('subCategory');

    const filteredProducts = useMemo(() => {
        return initialProducts.filter((product) => {
            const matchesSearch = product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            
            const category = allCategories.find(c => c.slug === selectedCategorySlug);
            const subCategory = category?.subCategoryGroups?.flatMap(g => g.subCategories).find(sc => sc.name.toLowerCase().replace(/\s+/g, '-') === selectedSubCategorySlug);

            const matchesCategory = !selectedCategorySlug || (category && product.category === category.name);
            const matchesSubCategory = !selectedSubCategorySlug || (subCategory && product.subCategory === subCategory.name);

            return matchesSearch && matchesCategory && matchesSubCategory;
        });
    }, [initialProducts, debouncedSearchTerm, allCategories, selectedCategorySlug, selectedSubCategorySlug]);

    const bestsellerProduct = useMemo(() => {
        const id = homepageConfig?.storeHomepageSection?.bestsellerProductId;
        if (!id) return null;
        return initialProducts.find(p => p.id === id) || null;
    }, [initialProducts, homepageConfig]);

    const hasFilters = !!(selectedCategorySlug || selectedSubCategorySlug || debouncedSearchTerm);

    return (
        <div className="w-full px-1 -mt-6 lg:-mt-14 space-y-6 md:space-y-10">
            <main className="space-y-8 md:space-y-12">
                {/* Dynamic Hero Banners */}
                {homepageConfig?.storeHomepageSection?.bannerCarousel && (
                     <div className="rounded-[20px] overflow-hidden shadow-xl border border-primary/5">
                        <StoreBannerCarousel banners={homepageConfig.storeHomepageSection.bannerCarousel} />
                     </div>
                )}
                
                <div className="space-y-6 md:space-y-8">
                    {/* Header & Filter Area */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-l-4 border-primary pl-4">
                        <div className="space-y-0.5 text-left">
                            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/20 w-fit">
                                <ShoppingBag className="w-3 h-3" />
                                RDC Store Hub
                            </div>
                            <h1 className="text-xl md:text-3xl font-black uppercase tracking-tight font-headline text-foreground">
                                {pageTitle === "All Products" ? "RED DOT CLASSROOM (RDC) Store" : pageTitle}
                            </h1>
                        </div>
                        
                        <div className="relative w-full md:w-80 group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                {isSearching ? (
                                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                                ) : (
                                    <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                )}
                            </div>
                            <Input
                                placeholder="Search products..."
                                className="pl-9 h-11 rounded-xl bg-card border-primary/20 focus:border-primary/50 transition-all shadow-sm"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>

                    {/* Product Grid */}
                    <AnimatePresence mode="popLayout">
                        <motion.div 
                            key={debouncedSearchTerm + (selectedCategorySlug || '')}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5 px-1"
                        >
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {/* Empty State */}
                    {filteredProducts.length === 0 && (
                        <div className="text-center py-24 bg-muted/20 border-2 border-dashed border-primary/10 rounded-[20px] flex flex-col items-center">
                            <Filter className="w-12 h-12 text-primary/20 mb-4" />
                            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs opacity-40">No products match your criteria</p>
                        </div>
                    )}
                </div>

                {/* Promotional Banner */}
                {!hasFilters && (
                    <div className="pb-10">
                        <BookBanner bestsellerProduct={bestsellerProduct} />
                    </div>
                )}
            </main>
        </div>
    );
}
