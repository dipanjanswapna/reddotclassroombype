import { getCourses, getOrganizations, getHomepageConfig, getInstructors } from '@/lib/firebase/firestore';
import type { Metadata } from 'next';
import { CoursesPageClient } from '@/components/courses-page-client';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { OfflineHubCarousel } from '@/components/offline-hub-carousel';
import { FreeCoursesBanner } from '@/components/free-courses-banner';
import { TypingText } from '@/components/typing-text';

export const metadata: Metadata = {
  title: 'RDC SHOP - Red Dot Classroom',
  description: 'Browse all available courses, books, and stationeries on RDC SHOP. Explore a wide range of products for HSC, SSC, Admission Tests, and skills development.',
};

async function CoursesPageContent({ searchParams }: { searchParams?: { [key: string]: string | undefined } }) {
  const selectedCategory = searchParams?.category;
  const selectedSubCategory = searchParams?.subCategory;
  const selectedProvider = searchParams?.provider;
  const selectedInstructor = searchParams?.instructor;

  const [providers, allCoursesData, allInstructors] = await Promise.all([
    getOrganizations(),
    getCourses({ status: 'Published' }),
    getInstructors(),
  ]);
  
  const allCategories = allCoursesData.map(c => c.category).filter((v, i, a) => a.indexOf(v) === i && v);

  const filteredCourses = await getCourses({
      category: selectedCategory,
      subCategory: selectedSubCategory,
      provider: selectedProvider,
      instructorSlug: selectedInstructor,
      status: 'Published'
  });
  
  const activeCourses = filteredCourses.filter(course => !course.isArchived);
  const archivedCourses = allCoursesData.filter(course => course.isArchived);
  const approvedProviders = providers.filter(p => p.status === 'approved');
  const approvedInstructors = allInstructors.filter(i => i.status === 'Approved');
  
  const allSubCategories = [...new Set(allCoursesData.map(course => course.subCategory).filter(Boolean))] as string[];

  const hasFilters = !!(selectedCategory || selectedSubCategory || selectedProvider || selectedInstructor);

  return (
    <CoursesPageClient 
        initialCourses={activeCourses}
        archivedCourses={archivedCourses}
        allCategories={allCategories}
        allSubCategories={allSubCategories}
        allProviders={approvedProviders}
        allInstructors={approvedInstructors}
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
    
  return (
    <div className="bg-background mesh-gradient min-h-screen">
        {/* Unified Hero & Intro Section */}
        <section className="pt-6 md:pt-10 pb-16 md:pb-24 border-b border-white/10 overflow-hidden">
            <div className="container mx-auto px-4">
                {/* Hero Carousel Integrated into Page Flow */}
                {homepageConfig?.offlineHubHeroCarousel?.display && (
                    <div className="mb-12 md:mb-20">
                        <OfflineHubCarousel slides={homepageConfig.offlineHubHeroCarousel.slides} />
                    </div>
                )}

                {/* Shop Intro - Seamlessly aligned below Carousel */}
                <div className="text-center max-w-4xl mx-auto space-y-4 md:space-y-6">
                    <h1 className="font-black text-4xl md:text-6xl lg:text-7xl tracking-tighter uppercase">
                        RDC <span className="text-primary">SHOP</span>
                    </h1>
                    <div className="min-h-[5rem] md:min-h-auto">
                        <TypingText 
                            text="আপনার প্রয়োজনীয় সকল কোর্স এবং শিক্ষা উপকরণ এখন RDC SHOP-এ। সেরা শিক্ষকদের সাথে নিজের শেখার যাত্রা শুরু করুন।"
                            className="text-lg md:text-2xl text-muted-foreground font-semibold leading-relaxed font-bengali px-2"
                        />
                    </div>
                </div>
            </div>
        </section>

      <div className="container mx-auto px-4 py-12">
          <Suspense fallback={
              <div className="flex flex-grow items-center justify-center h-64">
                  <LoadingSpinner className="w-12 h-12" />
              </div>
          }>
              <CoursesPageContent searchParams={searchParams} />
          </Suspense>
      </div>

      {/* Premium Footer Banner */}
      <div className="container mx-auto px-4 pb-20 md:pb-28">
        <FreeCoursesBanner bannerConfig={homepageConfig?.rdcShopBanner} />
      </div>
    </div>
  )
}