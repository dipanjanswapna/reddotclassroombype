import { getCourses, getStoreCategories, getOrganizations, getHomepageConfig, getInstructors } from '@/lib/firebase/firestore';
import type { Metadata } from 'next';
import { CoursesPageClient } from '@/components/courses-page-client';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { OfflineHubCarousel } from '@/components/offline-hub-carousel';
import { FreeCoursesBanner } from '@/components/free-courses-banner';

export const metadata: Metadata = {
  title: 'RDC SHOP - Red Dot Classroom',
  description: 'Browse all available courses, books, and stationeries on RDC SHOP. Explore a wide range of products for HSC, SSC, Admission Tests, and skills development.',
};

async function CoursesPageContent({ searchParams }: { searchParams?: { [key: string]: string | undefined } }) {
  const selectedCategory = searchParams?.category;
  const selectedSubCategory = searchParams?.subCategory;
  const selectedProvider = searchParams?.provider;
  const selectedInstructor = searchParams?.instructor;

  const [providers, allCoursesData, allCategoriesData, allInstructors] = await Promise.all([
    getOrganizations(),
    getCourses({ status: 'Published' }), 
    getStoreCategories(),
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
    <div className="bg-background min-h-screen overflow-x-hidden max-w-full">
        {homepageConfig?.offlineHubHeroCarousel?.display && (
            <div className="bg-background border-b border-primary/5">
                <OfflineHubCarousel slides={homepageConfig.offlineHubHeroCarousel.slides} />
            </div>
        )}
      <div className="container mx-auto px-4 md:px-8 py-10 md:py-14 max-w-full overflow-hidden">
          <Suspense fallback={
              <div className="flex flex-grow items-center justify-center h-96 w-full p-8">
                  <LoadingSpinner className="w-12 h-12" />
              </div>
          }>
              <CoursesPageContent searchParams={searchParams} />
          </Suspense>
      </div>
      <div className="container mx-auto px-4 md:px-8 pb-10 md:pb-14 max-w-full">
        <FreeCoursesBanner bannerConfig={homepageConfig?.rdcShopBanner} />
      </div>
    </div>
  )
}
