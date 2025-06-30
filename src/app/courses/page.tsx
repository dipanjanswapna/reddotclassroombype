
import { getCourses, getCategories, getOrganizations } from '@/lib/firebase/firestore';
import type { Metadata } from 'next';
import { CoursesPageClient } from '@/components/courses-page-client';

export const metadata: Metadata = {
  title: 'All Courses | RDC SHOP',
  description: 'Explore a wide range of courses on HSC, SSC, Admission Tests, Job Prep, and skills development at Red Dot Classroom. Find the perfect course to advance your learning journey.',
};

export default async function CoursesPage() {
  const [courses, categories, providers] = await Promise.all([
    getCourses(),
    getCategories(),
    getOrganizations(),
  ]);

  const activeCourses = courses.filter(course => course.status === 'Published' && !course.isArchived);
  const archivedCourses = courses.filter(course => course.status === 'Published' && course.isArchived);
  const approvedProviders = providers.filter(p => p.status === 'approved');
  
  const sortedCategories = [...categories].sort();
  const allSubCategories = [...new Set(activeCourses.map(course => course.subCategory).filter(Boolean))] as string[];

  return (
    <CoursesPageClient 
        activeCourses={activeCourses}
        archivedCourses={archivedCourses}
        allCategories={sortedCategories}
        allSubCategories={allSubCategories}
        allProviders={approvedProviders}
    />
  );
}
