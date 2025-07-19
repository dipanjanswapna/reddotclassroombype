

import type { Metadata } from 'next';
import { getHomepageConfig, getProducts } from '@/lib/firebase/firestore';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';
import Image from 'next/image';
import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { ProductCarousel } from '@/components/product-carousel';
import { ArrowRight, Book, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'RDC Store',
  description: 'Shop for exclusive Red Dot Classroom merchandise, including apparel, stationery, and books.',
};

async function StoreContent() {
    const homepageConfig = await getHomepageConfig();
    const allProducts = await getProducts();
    const publishedProducts = allProducts.filter(p => p.isPublished);

    const storeConfig = homepageConfig.storeHomepageSection;

    const featuredProducts = publishedProducts.filter(p => storeConfig?.featuredProductIds?.includes(p.id!));
    const newProducts = publishedProducts.sort((a,b) => b.id!.localeCompare(a.id!)).slice(0, 8); // Simplified logic for "new"
    
    const getProductsByCategory = (category: string) => {
        return publishedProducts.filter(p => p.category === category).slice(0,4);
    }
    
    return (
        <div className="space-y-16">
            {storeConfig?.hero && (
                 <section className="bg-[#f0f4ff] dark:bg-gray-800/20 py-12 md:py-20">
                     <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
                         <div className="space-y-4 text-center md:text-left">
                            <h1 className="font-bengali font-bold text-4xl md:text-5xl leading-tight" dangerouslySetInnerHTML={{ __html: storeConfig.hero.title.replace('শিক্ষাই আলো', '<span class="text-green-600">শিক্ষাই আলো</span>') }}></h1>
                            <p className="text-muted-foreground">{storeConfig.hero.subtitle}</p>
                            <div className="flex gap-4 justify-center md:justify-start pt-4">
                                <Button size="lg" className="bg-green-600 hover:bg-green-700">আমাদের বইসমূহ</Button>
                                <Button size="lg" variant="outline">আমাদের সম্পর্কে</Button>
                            </div>
                         </div>
                         <div className="relative h-64 w-64 md:h-80 md:w-80 mx-auto">
                            <Image src={storeConfig.hero.imageUrl} alt="Books" fill className="object-contain" data-ai-hint="books stack"/>
                         </div>
                     </div>
                 </section>
            )}
            
             {featuredProducts.length > 0 && (
                <section>
                    <div className="container mx-auto px-4">
                        <h2 className="text-2xl font-bold font-bengali text-center mb-6">ফিচার্ড প্রোডাক্ট</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {featuredProducts.map(product => <ProductCard key={product.id} product={product} />)}
                        </div>
                    </div>
                </section>
             )}

            {newProducts.length > 0 && (
                <section>
                    <div className="container mx-auto px-4">
                        <div className="flex justify-between items-center mb-6">
                             <h2 className="text-2xl font-bold font-bengali">নতুন কালেকশন</h2>
                             <Button variant="ghost">সব দেখুন <ArrowRight className="ml-2 h-4 w-4"/></Button>
                        </div>
                        <ProductCarousel products={newProducts} />
                    </div>
                </section>
            )}
            
             {storeConfig?.productSections?.map(section => {
                const sectionProducts = getProductsByCategory(section.category);
                if (sectionProducts.length === 0) return null;
                return (
                    <section key={section.category}>
                        <div className="container mx-auto px-4">
                             <div className="flex justify-between items-center mb-6">
                                 <h2 className="text-2xl font-bold font-bengali">{section.title}</h2>
                                 <Button variant="ghost">সব দেখুন <ArrowRight className="ml-2 h-4 w-4"/></Button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {sectionProducts.map(product => <ProductCard key={product.id} product={product} />)}
                            </div>
                        </div>
                    </section>
                )
             })}
        </div>
    );
}

export default async function RdcStorePage() {    
    return (
        <div className="py-0">
            <Suspense fallback={<div className="flex justify-center items-center h-96"><LoadingSpinner/></div>}>
                <StoreContent />
            </Suspense>
        </div>
    );
}
