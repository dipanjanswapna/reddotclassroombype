'use client';

import { useState, useMemo } from 'react';
import { CourseCard } from '@/components/course-card';
import { Course, Organization, Instructor } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { CourseFilterBar } from './course-filter-bar';

type CoursesPageClientProps = {
    initialCourses: Course[];
    archivedCourses: Course[];
    allCategories: string[];
    allSubCategories: string[];
    allProviders: Organization[];
    allInstructors: Instructor[];
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
    allInstructors,
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
      <div className="container mx-auto px-4 md:px-8 py-4">
          <CourseFilterBar
            categories={allCategories}
            subCategories={allSubCategories}
            instructors={allInstructors}
            providers={allProviders}
          />
      </div>

      <main className="container mx-auto px-4 md:px-8 pt-0 pb-16">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner className="w-12 h-12" />
          </div>
        ) : hasFilters ? (
            <section className='py-0'>
              <div className="mb-10 text-center md:text-left">
                <h2 className="font-headline text-3xl font-bold">
                    Filtered Results ({initialCourses.length})
                </h2>
                <div className="h-1 w-16 bg-primary mt-2 rounded-full mx-auto md:mx-0" />
              </div>
              {initialCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {initialCourses.map((course) => {
                    const provider = allProviders.find(p => p.id === course.organizationId);
                    return <CourseCard key={course.id} {...course} provider={provider} />;
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-12">No courses found matching your criteria. Try clearing the filters.</p>
              )}
            </section>
        ) : (
            <div className="space-y-20">
              {sortedCategories.map((category) => (
                <section key={category} id={category.toLowerCase().replace(/\s+/g, '-')} className='py-0'>
                  <div className="mb-10 text-center md:text-left">
                    <h2 className="font-headline text-3xl font-bold">
                        {category}
                    </h2>
                    <div className="h-1 w-16 bg-primary mt-2 rounded-full mx-auto md:mx-0" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {coursesByCategory[category].map((course) => {
                       const provider = allProviders.find(p => p.id === course.organizationId);
                       return <CourseCard key={course.id} {...course} provider={provider} />;
                    })}
                  </div>
                </section>
              ))}

              {archivedCourses.length > 0 && (
                <section id="archived-courses" className='py-0'>
                    <div className="mb-10 text-center md:text-left">
                        <h2 className="font-headline text-3xl font-bold">
                            Archived Courses
                        </h2>
                        <div className="h-1 w-16 bg-primary mt-2 rounded-full mx-auto md:mx-0" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {archivedCourses.map((course) => {
                            const provider = allProviders.find(p => p.id === course.organizationId);
                            return <CourseCard key={course.id} {...course} provider={provider} />;
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
