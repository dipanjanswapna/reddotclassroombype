

import type { Metadata } from 'next';
import { getProducts, getStoreCategories, getHomepageConfig } from '@/lib/firebase/firestore';
import { StorePageClient } from '@/components/store-page-client';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';
import Image from 'next/image';
import Link from 'next/link';

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
    const homepageConfig = await getHomepageConfig();
    const banner = homepageConfig?.storeHomepageSection?.banner;
    
    return (
        <div className="py-8 md:py-12">
            {banner?.display && banner.imageUrl && (
                 <div className="container mx-auto px-4 mb-8">
                    <Link href={banner.linkUrl || '#'}>
                        <div className="relative aspect-[16/6] rounded-lg overflow-hidden group">
                             <Image
                                src={banner.imageUrl}
                                alt={banner.altText || 'RDC Store Banner'}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                data-ai-hint="store sale offer"
                            />
                            <div className="absolute inset-0 bg-black/30"></div>
                        </div>
                    </Link>
                 </div>
            )}
            <Suspense fallback={<div className="flex justify-center items-center h-96"><LoadingSpinner/></div>}>
                <StoreContent />
            </Suspense>
        </div>
    );
}
