import { getHomepageConfig, getProducts, getStoreCategories } from '@/lib/firebase/firestore';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { StorePageClient } from '@/components/store-page-client';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

export const metadata = {
  title: 'RDC Store | Educational Merchandise',
  description: 'Shop official RED DOT CLASSROOM books, stationery, and apparel.',
};

/**
 * @fileOverview Localized RDC Store Page
 * Implements i18n support and Hind Siliguri font.
 */
async function StoreContent({ searchParams, locale }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }>, locale: string }) {
    const resolvedParams = await searchParams;
    const selectedCategorySlug = resolvedParams?.category as string | undefined;
    const selectedSubCategorySlug = resolvedParams?.subCategory as string | undefined;

    const [homepageConfig, allProducts, allCategories] = await Promise.all([
        getHomepageConfig(),
        getProducts(),
        getStoreCategories(),
    ]);

    const publishedProducts = allProducts.filter(p => p.isPublished);
    
    let displayProducts = publishedProducts;
    let pageTitle = t.all_products[locale as 'en' | 'bn'] || 'All Products';

    if (selectedCategorySlug) {
        const category = allCategories.find(c => c.slug === selectedCategorySlug);
        if (category) {
            displayProducts = publishedProducts.filter(p => p.category === category.name);
            pageTitle = category.name;
            if(selectedSubCategorySlug) {
                const subCategory = category.subCategoryGroups?.flatMap(g => g.subCategories).find(sc => sc.name.toLowerCase().replace(/\s+/g, '-') === selectedSubCategorySlug);
                if (subCategory) {
                    displayProducts = displayProducts.filter(p => p.subCategory === subCategory.name);
                    pageTitle = subCategory.name;
                }
            }
        }
    }

    return (
        <StorePageClient 
            initialProducts={displayProducts} 
            allCategories={allCategories}
            pageTitle={pageTitle}
            homepageConfig={homepageConfig}
        />
    );
}

export default async function RdcStorePage({ params, searchParams }: { params: { locale: string }, searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {    
    const awaitedParams = await params;
    const language = awaitedParams.locale as 'en' | 'bn';
    const isBn = language === 'bn';

    return (
        <div className={cn("bg-background min-h-screen", isBn && "font-bengali")}>
            <Suspense fallback={
                <div className="flex flex-grow items-center justify-center h-[calc(100vh-10rem)] w-full">
                    <LoadingSpinner className="w-12 h-12" />
                </div>
            }>
                <StoreContent searchParams={searchParams} locale={language} />
            </Suspense>
        </div>
    );
}
