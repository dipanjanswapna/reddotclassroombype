
'use client';

import { useState, useMemo } from 'react';
import { CourseCard } from '@/components/course-card';
import { CourseFilterBar } from '@/components/course-filter-bar';
import { Course, Organization } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';

type CoursesPageClientProps = {
    initialCourses: Course[];
    archivedCourses: Course[];
    allCategories: string[];
    allSubCategories: string[];
    allProviders: Organization[];
    hasFilters: boolean;
};

const groupCoursesByCategory = (courses: Course[]): { [key: string]: Course[] } => {
  return courses.reduce((acc, course) => {
    const category = course.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(course);
    return acc;
  }, {} as { [key: string]: Course[] });
};

const categoryOrder = [
    'HSC',
    'SSC',
    'Admission',
    'এইচএসসি ২৫ অনলাইন ব্যাচ',
    'বিষয়ভিত্তিক কোর্স',
    'টেস্ট পেপার সলভ',
    'Job Prep',
    'Skills',
    'Language',
    'মাস্টার কোর্স',
];

export function CoursesPageClient({
    initialCourses,
    archivedCourses,
    allCategories,
    allSubCategories,
    allProviders,
    hasFilters,
}: CoursesPageClientProps) {
  const [loading] = useState(false); 

  const coursesByCategory = useMemo(() => groupCoursesByCategory(initialCourses), [initialCourses]);

  const sortedCategories = useMemo(() => Object.keys(coursesByCategory).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  }), [coursesByCategory]);

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12" id="courses-start">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline">
              All Courses
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Find the perfect course to achieve your learning goals.
            </p>
          </div>
        <CourseFilterBar categories={allCategories} subCategories={allSubCategories} providers={allProviders}/>
      </div>

      <main className="container mx-auto px-4 pt-0 pb-16">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner className="w-12 h-12" />
          </div>
        ) : hasFilters ? (
            <section className='py-0'>
              <h2 className="font-headline mb-6 text-3xl font-bold">
                Filtered Results ({initialCourses.length})
              </h2>
              {initialCourses.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {initialCourses.map((course) => {
                    const provider = allProviders.find(p => p.id === course.organizationId);
                    return <CourseCard key={course.id} {...course} provider={provider} partnerSubdomain={provider?.subdomain}/>;
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">No courses found matching your criteria. Try clearing the filters.</p>
              )}
            </section>
        ) : (
            <div className="space-y-16">
              {sortedCategories.map((category) => (
                <section key={category} id={category.toLowerCase().replace(/\s+/g, '-')} className='py-0'>
                  <h2 className="font-headline mb-6 text-3xl font-bold">
                    {category}
                  </h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {coursesByCategory[category].map((course) => {
                       const provider = allProviders.find(p => p.id === course.organizationId);
                       return <CourseCard key={course.id} {...course} provider={provider} partnerSubdomain={provider?.subdomain} />;
                    })}
                  </div>
                </section>
              ))}

              {archivedCourses.length > 0 && (
                <section id="archived-courses" className='py-0'>
                    <h2 className="font-headline mb-6 text-3xl font-bold">
                        Archived Courses
                    </h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {archivedCourses.map((course) => {
                            const provider = allProviders.find(p => p.id === course.organizationId);
                            return <CourseCard key={course.id} {...course} provider={provider} partnerSubdomain={provider?.subdomain} />;
                        })}
                    </div>
                </section>
              )}
            </div>
        )}
      </main>
    </div>
  );
}
