import { getCourses, getOrganizations, getHomepageConfig, getInstructors } from '@/lib/firebase/firestore';
import type { Metadata } from 'next';
import { CoursesPageClient } from '@/components/courses-page-client';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { OfflineHubCarousel } from '@/components/offline-hub-carousel';
import { FreeCoursesBanner } from '@/components/free-courses-banner';
import { TypingText } from '@/components/typing-text';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'RDC Shop | Premium Courses',
  description: 'Explore the highest-quality academic courses at RED DOT CLASSROOM.',
};

/**
 * @fileOverview Localized RDC Shop Page
 * Standardized high-density reduced spacing (py-6 md:py-10).
 * Wall-to-wall design with px-1.
 */
async function CoursesPageContent({ searchParams, locale }: { searchParams?: Promise<{ [key: string]: string | undefined }>, locale: string }) {
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
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: Promise<{ [key: string]: string | undefined }>;
}) {
    const awaitedParams = await params;
    const language = awaitedParams.locale as 'en' | 'bn';
    const isBn = language === 'bn';
    const homepageConfig = await getHomepageConfig();
    
  return (
    <div className={cn("bg-background min-h-screen pb-20", isBn && "font-bengali")}>
        <section className="pt-4 pb-2 border-b border-white/5 overflow-hidden px-1">
            <div className="container mx-auto px-0">
                {homepageConfig?.offlineHubHeroCarousel?.display && (
                    <div className="mb-6">
                        <OfflineHubCarousel slides={homepageConfig.offlineHubHeroCarousel.slides} />
                    </div>
                )}

                <div className="text-left max-w-4xl mx-auto space-y-4 px-1">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20 shadow-sm">
                        <Sparkles className="w-3.5 h-3.5" />
                        {t.best_learning_platform[language]}
                    </div>
                    
                    <h1 className={cn(
                        "font-black text-4xl md:text-5xl lg:text-6xl tracking-tighter uppercase leading-none text-foreground",
                        !isBn && "font-headline"
                    )}>
                        {t.rdc_shop[language]}
                    </h1>
                    
                    <div className="max-w-3xl">
                        <p className="text-base md:text-xl text-muted-foreground font-medium leading-relaxed">
                            {t.shop_description[language]}
                        </p>
                    </div>
                </div>
            </div>
        </section>

      <div className="container mx-auto px-1 py-6 md:py-10">
          <Suspense fallback={
              <div className="flex flex-grow items-center justify-center h-64">
                  <LoadingSpinner className="w-10 h-10" />
              </div>
          }>
              <CoursesPageContent searchParams={searchParams} locale={language} />
          </Suspense>
      </div>

      <div className="container mx-auto px-1 pb-12">
        <FreeCoursesBanner bannerConfig={homepageConfig?.rdcShopBanner} />
      </div>
    </div>
  )
}