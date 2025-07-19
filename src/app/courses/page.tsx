
import { getCourses, getStoreCategories, getOrganizations, getHomepageConfig } from '@/lib/firebase/firestore';
import type { Metadata } from 'next';
import { CoursesPageClient } from '@/components/courses-page-client';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { OfflineHubCarousel } from '@/components/offline-hub-carousel';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'RDC SHOP - Red Dot Classroom',
  description: 'Browse all available courses, books, and stationeries on RDC SHOP. Explore a wide range of products for HSC, SSC, Admission Tests, and skills development.',
};

async function CoursesPageContent({ searchParams }: { searchParams?: { [key: string]: string | undefined } }) {
  const selectedCategory = searchParams?.category;
  const selectedSubCategory = searchParams?.subCategory;
  const selectedProvider = searchParams?.provider;

  const [providers, allCoursesData, allCategoriesData] = await Promise.all([
    getOrganizations(),
    getCourses({ status: 'Published' }), // Fetch all published for filters
    getStoreCategories(),
  ]);
  
  const allCategories = allCategoriesData.map(c => c.name);

  const filteredCourses = await getCourses({
      category: selectedCategory,
      subCategory: selectedSubCategory,
      provider: selectedProvider,
      status: 'Published'
  });
  
  const activeCourses = filteredCourses.filter(course => !course.isArchived);
  const archivedCourses = allCoursesData.filter(course => course.isArchived);
  const approvedProviders = providers.filter(p => p.status === 'approved');
  
  const allSubCategories = [...new Set(allCoursesData.map(course => course.subCategory).filter(Boolean))] as string[];

  const hasFilters = !!(selectedCategory || selectedSubCategory || selectedProvider);

  return (
    <CoursesPageClient 
        initialCourses={activeCourses}
        archivedCourses={archivedCourses}
        allCategories={allCategories}
        allSubCategories={allSubCategories}
        allProviders={approvedProviders}
        hasFilters={hasFilters}
    />
  );
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
    const homepageConfig = await getHomepageConfig();
    const shopBanner = homepageConfig?.rdcShopBanner;
    
  return (
    <div className="bg-background">
        {homepageConfig?.offlineHubHeroCarousel?.display && (
            <div className="bg-gray-900">
                <OfflineHubCarousel slides={homepageConfig.offlineHubHeroCarousel.slides} />
            </div>
        )}
        <div className="container mx-auto px-4 py-8">
            {shopBanner?.display && (
                 <div className="relative mb-8 rounded-lg overflow-hidden aspect-[16/6] sm:aspect-[21/6]">
                     <Image
                         src={shopBanner.imageUrl}
                         alt="RDC Shop Banner"
                         fill
                         className="w-full h-full object-cover"
                         data-ai-hint={shopBanner.dataAiHint}
                     />
                     <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                         <div className="text-center text-white p-4">
                             <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline text-shadow">
                               RDC SHOP
                             </h1>
                              <p className="mt-4 text-lg max-w-2xl text-shadow">
                                আপনার প্রয়োজনীয় সকল কোর্স এবং শিক্ষা উপকরণ এখন RDC SHOP-এ। সেরা শিক্ষকদের সাথে নিজের শেখার যাত্রা শুরু করুন।
                            </p>
                             <Button asChild className="mt-4 bg-green-500 hover:bg-green-600">
                                <Link href="#courses-start">আমাদের ফ্রি কোর্সগুলো দেখুন</Link>
                             </Button>
                         </div>
                     </div>
                 </div>
            )}
            <Suspense fallback={
                <div className="flex flex-grow items-center justify-center h-full w-full p-8">
                    <LoadingSpinner className="w-12 h-12" />
                </div>
            }>
                <CoursesPageContent searchParams={searchParams} />
            </Suspense>
        </div>
    </div>
  )
}
