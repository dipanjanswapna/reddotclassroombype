import { getCourses, getOrganizations, getHomepageConfig, getInstructors } from '@/lib/firebase/firestore';
import type { Metadata } from 'next';
import { CoursesPageClient } from '@/components/courses-page-client';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { OfflineHubCarousel } from '@/components/offline-hub-carousel';
import { FreeCoursesBanner } from '@/components/free-courses-banner';
import { TypingText } from '@/components/typing-text';

export const metadata: Metadata = {
  title: 'RED DOT CLASSROOM (RDC)',
  description: 'Browse all available courses, books, and stationeries on RED DOT CLASSROOM (RDC).',
};

async function CoursesPageContent({ searchParams }: { searchParams?: Promise<{ [key: string]: string | undefined }> }) {
  const resolvedParams = await searchParams;
  const selectedCategory = resolvedParams?.category;
  const selectedSubCategory = resolvedParams?.subCategory;
  const selectedProvider = resolvedParams?.provider;
  const selectedInstructor = resolvedParams?.instructor;

  const [providers, allCoursesData, allInstructors] = await Promise.all([
    getOrganizations(),
    getCourses({ status: 'Published' }),
    getInstructors(),
  ]);
  
  const allCategories = Array.from(new Set(allCoursesData.map(c => c.category))).filter(Boolean) as string[];

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
  
  const allSubCategories = Array.from(new Set(allCoursesData.map(course => course.subCategory))).filter(Boolean) as string[];

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
  searchParams?: Promise<{ [key: string]: string | undefined }>;
}) {
    const homepageConfig = await getHomepageConfig();
    
  return (
    <div className="bg-background min-h-screen">
        <section className="pt-4 pb-2 border-b border-white/5 overflow-hidden px-1">
            <div className="container mx-auto px-0">
                {homepageConfig?.offlineHubHeroCarousel?.display && (
                    <div className="mb-6">
                        <OfflineHubCarousel slides={homepageConfig.offlineHubHeroCarousel.slides} />
                    </div>
                )}

                <div className="text-center max-w-xl mx-auto space-y-2">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20 shadow-sm">
                        <TypingText text="Premium Learning Resources" className="inline" />
                    </div>
                    <h1 className="font-black text-2xl md:text-3xl lg:text-4xl tracking-tighter uppercase leading-tight font-headline">
                        RED DOT CLASSROOM <span className="text-primary">(RDC)</span>
                    </h1>
                    <div className="min-h-[2.5rem]">
                        <p className="text-[11px] md:text-sm text-muted-foreground font-medium leading-relaxed font-bengali px-2">
                            আপনার প্রয়োজনীয় সকল কোর্স এবং শিক্ষা উপকরণ এখন RED DOT CLASSROOM (RDC)-তে।
                        </p>
                    </div>
                </div>
            </div>
        </section>

      <div className="container mx-auto px-1 py-4">
          <Suspense fallback={
              <div className="flex flex-grow items-center justify-center h-64">
                  <LoadingSpinner className="w-10 h-10" />
              </div>
          }>
              <CoursesPageContent searchParams={searchParams} />
          </Suspense>
      </div>

      <div className="container mx-auto px-1 pb-10 md:pb-14">
        <FreeCoursesBanner bannerConfig={homepageConfig?.rdcShopBanner} />
      </div>
    </div>
  )
}
