import { getCourses, getCategories, getOrganizations } from '@/lib/firebase/firestore';
import type { Metadata } from 'next';
import { CoursesPageClient } from '@/components/courses-page-client';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';


export const metadata: Metadata = {
  title: 'All Courses - Red Dot Classroom',
  description: 'Browse all available courses on Red Dot Classroom. Explore a wide range of courses on HSC, SSC, Admission Tests, Job Prep, and skills development.',
};

async function CoursesPageContent({ searchParams }: { searchParams?: { [key: string]: string | undefined } }) {
  const selectedCategory = searchParams?.category;
  const selectedSubCategory = searchParams?.subCategory;
  const selectedProvider = searchParams?.provider;

  const [providers, allCoursesData] = await Promise.all([
    getOrganizations(),
    getCourses({ status: 'Published' }), // Fetch all published for filters
  ]);
  
  const allCategories = [...new Set(allCoursesData.map(c => c.category).filter(Boolean))] as string[];

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

export default function CoursesPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  return (
    <Suspense fallback={
        <div className="flex flex-grow items-center justify-center h-full w-full p-8">
            <LoadingSpinner className="w-12 h-12" />
        </div>
    }>
        <CoursesPageContent searchParams={searchParams} />
    </Suspense>
  )
}
