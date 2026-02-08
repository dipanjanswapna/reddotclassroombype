'use client';

import { useState, useMemo } from 'react';
import { CourseCard } from '@/components/course-card';
import { Course, Organization, Instructor } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { CourseFilterBar } from './course-filter-bar';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="bg-background w-full">
      <div className="w-full py-4 mb-8">
          <CourseFilterBar
            categories={allCategories}
            subCategories={allSubCategories}
            instructors={allInstructors}
            providers={allProviders}
          />
      </div>

      <main className="w-full pt-0 pb-16">
        <AnimatePresence mode="wait">
            {hasFilters ? (
                <motion.section 
                    key="filtered-results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className='py-0'
                >
                    <div className="mb-10 text-center md:text-left">
                        <h2 className="font-headline text-3xl font-black tracking-tight uppercase">
                            Search Results ({initialCourses.length})
                        </h2>
                        <div className="h-2 w-24 bg-primary mt-4 rounded-full mx-auto md:mx-0 shadow-lg" />
                    </div>
                    {initialCourses.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            {initialCourses.map((course) => {
                                const provider = allProviders.find(p => p.id === course.organizationId);
                                return <CourseCard key={course.id} {...course} provider={provider} />;
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-muted/30 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center">
                            <p className="text-xl font-bold text-muted-foreground">
                                No courses match your filters.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">Try selecting different categories or providers.</p>
                        </div>
                    )}
                </motion.section>
            ) : (
                <div className="space-y-20 md:space-y-24">
                    {sortedCategories.map((category, catIdx) => (
                        <motion.section 
                            key={category} 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ delay: catIdx * 0.1 }}
                            id={category.toLowerCase().replace(/\s+/g, '-')} 
                            className='py-0'
                        >
                            <div className="mb-10 text-center md:text-left">
                                <h2 className="font-headline text-4xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">
                                    {category}
                                </h2>
                                <div className="h-2 w-24 bg-primary mt-4 rounded-full mx-auto md:mx-0 shadow-lg" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                                {coursesByCategory[category].map((course) => {
                                    const provider = allProviders.find(p => p.id === course.organizationId);
                                    return <CourseCard key={course.id} {...course} provider={provider} />;
                                })}
                            </div>
                        </motion.section>
                    ))}

                    {archivedCourses.length > 0 && (
                        <section id="archived-courses" className='py-0'>
                            <div className="mb-10 text-center md:text-left">
                                <h2 className="font-headline text-4xl font-black tracking-tight text-muted-foreground uppercase">
                                    Archived Programs
                                </h2>
                                <div className="h-2 w-24 bg-muted mt-4 rounded-full mx-auto md:mx-0 shadow-inner" />
                                <p className="text-sm text-muted-foreground mt-4 italic font-medium">These programs are currently closed for new enrollments.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                                {archivedCourses.map((course) => {
                                    const provider = allProviders.find(p => p.id === course.organizationId);
                                    return <CourseCard key={course.id} {...course} provider={provider} className="grayscale opacity-75 grayscale hover:grayscale-0 hover:opacity-100" />;
                                })}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </AnimatePresence>
      </main>
    </div>
  );
}