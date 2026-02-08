
'use client';

import { useState, useMemo } from 'react';
import { Product, StoreCategory, HomepageConfig } from '@/lib/types';
import { Input } from './ui/input';
import { Search } from 'lucide-react';
import { ProductCard } from './product-card';
import { useSearchParams } from 'next/navigation';
import { BookBanner } from './book-banner';
import { StoreBannerCarousel } from './store-banner-carousel';
import { StoreFilterBar } from './store-filter-bar';
import { motion, AnimatePresence } from 'framer-motion';

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

    const hasFilters = !!(selectedCategorySlug || selectedSubCategorySlug || searchTerm);

    return (
        <div className="container mx-auto px-4 md:px-8 py-6 md:py-8 max-w-full overflow-hidden">
            <main className="space-y-10 md:space-y-14">
                <AnimatePresence mode="wait">
                    {!hasFilters && homepageConfig?.storeHomepageSection?.bannerCarousel && (
                        <motion.div
                            key="banner"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <StoreBannerCarousel banners={homepageConfig.storeHomepageSection.bannerCarousel} />
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <section className="space-y-10 md:space-y-14">
                    <div className="mb-6 md:mb-10">
                        <StoreFilterBar categories={allCategories} />
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
                        <div className="text-center md:text-left space-y-2">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase leading-tight">
                                {selectedCategorySlug ? pageTitle : 'Discover Store'}
                            </h1>
                            <div className="h-1.5 w-24 bg-primary rounded-full mx-auto md:mx-0 shadow-lg" />
                        </div>
                        <div className="relative w-full md:w-auto md:flex-grow max-w-md group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search products, books, stationery..."
                                className="pl-12 h-12 rounded-full border-2 bg-card/50 backdrop-blur-sm focus-visible:ring-primary shadow-sm font-semibold"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            {filteredProducts.map((product, idx) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <ProductCard product={product} />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-muted/30 rounded-[2rem] border-2 border-dashed flex flex-col items-center mx-4 md:mx-0">
                            <Search className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
                            <p className="text-xl font-bold text-muted-foreground">
                                No products found matching your criteria.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2 font-medium">Try adjusting your filters or search terms.</p>
                        </div>
                    )}
                </section>

                <AnimatePresence>
                    {!hasFilters && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            <BookBanner />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
