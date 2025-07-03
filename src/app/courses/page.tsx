

import { getCourses, getCategories, getOrganizations } from '@/lib/firebase/firestore';
import type { Metadata } from 'next';
import { CoursesPageClient } from '@/components/courses-page-client';

export const metadata: Metadata = {
  title: 'RDC SHOP - All Courses',
  description: 'Browse all courses available on the RDC SHOP. Explore a wide range of courses on HSC, SSC, Admission Tests, Job Prep, and skills development at Red Dot Classroom to advance your learning journey.',
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  const [courses, categories, providers] = await Promise.all([
    getCourses(),
    getCategories(),
    getOrganizations(),
  ]);

  let activeCourses = courses.filter(course => course.status === 'Published' && !course.isArchived);
  const archivedCourses = courses.filter(course => course.status === 'Published' && course.isArchived);
  const approvedProviders = providers.filter(p => p.status === 'approved');
  
  const sortedCategories = [...categories].sort();
  const allSubCategories = [...new Set(activeCourses.map(course => course.subCategory).filter(Boolean))] as string[];

  // Server-side filtering
  const selectedCategory = searchParams?.category;
  const selectedSubCategory = searchParams?.subCategory;
  const selectedProvider = searchParams?.provider;
  const hasFilters = !!(selectedCategory || selectedSubCategory || selectedProvider);

  if (selectedCategory) {
    activeCourses = activeCourses.filter(course => course.category === selectedCategory);
  }
  if (selectedSubCategory) {
    activeCourses = activeCourses.filter(course => course.subCategory === selectedSubCategory);
  }
  if (selectedProvider) {
    activeCourses = activeCourses.filter(course => course.organizationId === selectedProvider);
  }

  return (
    <CoursesPageClient 
        initialCourses={activeCourses}
        archivedCourses={archivedCourses}
        allCategories={sortedCategories}
        allSubCategories={allSubCategories}
        allProviders={approvedProviders}
        hasFilters={hasFilters}
    />
  );
}
