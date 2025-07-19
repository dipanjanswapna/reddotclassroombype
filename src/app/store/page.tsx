
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getProducts, getStoreCategories, getHomepageConfig } from '@/lib/firebase/firestore';
import { StorePageClient } from '@/components/store-page-client';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Button } from '@/components/ui/button';

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
    const storeBanner = homepageConfig?.storeHomepageSection?.banner;

    return (
        <div className="bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-8">
                {storeBanner && storeBanner.display && (
                    <div className="relative rounded-lg overflow-hidden mb-8">
                        <Image 
                            src={storeBanner.imageUrl} 
                            width={1200} 
                            height={300} 
                            alt={storeBanner.altText || 'RDC Store Banner'} 
                            className="w-full h-auto object-cover" 
                            data-ai-hint="students learning computer" 
                        />
                    </div>
                )}
                <Suspense fallback={<div className="flex justify-center items-center h-96"><LoadingSpinner/></div>}>
                   <StoreContent />
                </Suspense>
                
                 <section className="mt-16">
                    <div className="relative bg-[#0d122b] text-white p-8 md:p-12 rounded-2xl overflow-hidden grid md:grid-cols-2 gap-8 items-center">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-500/20 rounded-full"></div>
                        <div className="absolute -bottom-16 -left-10 w-48 h-48 bg-blue-500/20 rounded-full"></div>
                        <div className="relative z-10">
                            <h2 className="font-headline text-3xl font-bold leading-tight">৬ষ্ঠ শ্রেণি থেকে SSC-HSC পরীক্ষা এবং এডমিশন প্রিপারেশনের জন্য RDC'র কোর্সগুলো ভিজিট করুন।</h2>
                            <p className="mt-4 text-white/80">বাসায় বসেই বুয়েট-ঢাবি-মেডিকেল পাস ও ১৭ বছর পর্যন্ত অভিজ্ঞ শিক্ষকদের সাথে পড়াশোনা হোক দেশের সর্বাধুনিক প্রযুক্তির RDC অ্যাপ এবং ওয়েব-অ্যাপে।</p>
                            <Button asChild className="mt-6 bg-blue-500 hover:bg-blue-600 font-bengali font-bold">
                                <Link href="/courses">
                                    ভিজিট করুন
                                </Link>
                            </Button>
                        </div>
                        <div className="relative hidden md:block">
                            <Image
                                src="https://placehold.co/400x300.png"
                                alt="Student studying with laptop"
                                width={400}
                                height={300}
                                className="object-contain"
                                data-ai-hint="student studying illustration"
                            />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
