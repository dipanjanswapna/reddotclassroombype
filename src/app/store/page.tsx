
import type { Metadata } from 'next';
import { getHomepageConfig, getProducts, getStoreCategories } from '@/lib/firebase/firestore';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { StorePageClient } from '@/components/store-page-client';

export const metadata: Metadata = {
  title: 'RDC Store',
  description: 'Shop for exclusive Red Dot Classroom merchandise, including apparel, stationery, and books.',
};

async function StoreContent({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
    const selectedCategorySlug = searchParams?.category;
    const selectedSubCategorySlug = searchParams?.subCategory;

    const [homepageConfig, allProducts, allCategories] = await Promise.all([
        getHomepageConfig(),
        getProducts(),
        getStoreCategories(),
    ]);

    const publishedProducts = allProducts.filter(p => p.isPublished);
    
    let displayProducts = publishedProducts;
    let pageTitle = 'All Products';

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

export default async function RdcStorePage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {    
    return (
        <div className="bg-background min-h-screen overflow-x-hidden max-w-full">
            <Suspense fallback={
                <div className="flex flex-grow items-center justify-center h-screen w-full p-8">
                    <LoadingSpinner className="w-12 h-12" />
                </div>
            }>
                <StoreContent searchParams={searchParams} />
            </Suspense>
        </div>
    );
}
