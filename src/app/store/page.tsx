
import type { Metadata } from 'next';
import { getProducts, getStoreCategories } from '@/lib/firebase/firestore';
import { StorePageClient } from '@/components/store-page-client';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';

export const metadata: Metadata = {
  title: 'RDC Store',
  description: 'Shop for exclusive Red Dot Classroom merchandise, including apparel, stationery, and books.',
};

async function StoreContent() {
    const products = await getProducts();
    const categories = await getStoreCategories();
    const publishedProducts = products.filter(p => p.isPublished);
    return <StorePageClient initialProducts={publishedProducts} allCategories={categories} />;
}

export default async function RdcStorePage() {
    return (
        <div className="py-8 md:py-12">
            <Suspense fallback={<div className="flex justify-center items-center h-96"><LoadingSpinner/></div>}>
                <StoreContent />
            </Suspense>
        </div>
    );
}
