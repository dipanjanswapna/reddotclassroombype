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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.3 } }
  };

  return (
    <div className="bg-transparent px-1">
      <div className="py-2 md:py-4">
          <CourseFilterBar
            categories={allCategories}
            subCategories={allSubCategories}
            instructors={allInstructors}
            providers={allProviders}
          />
      </div>

      <main className="pt-4 pb-20 min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner className="w-12 h-12" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={hasFilters ? 'filtered' : 'grouped'}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-10 md:space-y-14"
            >
              {hasFilters ? (
                  <section className='py-0 px-0'>
                    <h2 className="font-headline mb-6 text-sm md:text-base font-black tracking-tight uppercase border-l-4 border-primary pl-4 flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      Found {initialCourses.length} Courses
                    </h2>
                    {initialCourses.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {initialCourses.map((course) => {
                          const provider = allProviders.find(p => p.id === course.organizationId);
                          return (
                            <motion.div key={course.id} variants={itemVariants}>
                              <CourseCard {...course} provider={provider} />
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-20 bg-card/50 backdrop-blur-xl border-2 border-dashed border-primary/10 rounded-[20px]">
                        <p className="text-muted-foreground font-black text-xs md:text-sm uppercase tracking-widest">No courses found matching your criteria</p>
                      </div>
                    )}
                  </section>
              ) : (
                  <>
                    {sortedCategories.map((category) => (
                      <section key={category} id={category.toLowerCase().replace(/\s+/g, '-')} className='py-0 px-0'>
                        <h2 className="font-headline mb-6 text-sm md:text-base font-black tracking-tight uppercase border-l-4 border-primary pl-4 text-foreground drop-shadow-sm">
                          {category}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                          {coursesByCategory[category].map((course) => {
                             const provider = allProviders.find(p => p.id === course.organizationId);
                             return (
                                <motion.div key={course.id} variants={itemVariants}>
                                  <CourseCard {...course} provider={provider} />
                                </motion.div>
                             );
                          })}
                        </div>
                      </section>
                    ))}

                    {archivedCourses.length > 0 && (
                      <section id="archived-courses" className='py-0 px-0 border-t border-white/10 pt-12 md:pt-16'>
                          <h2 className="font-headline mb-6 text-sm md:text-base font-black tracking-tight uppercase text-muted-foreground border-l-4 border-muted-foreground/30 pl-4">
                              Archived Courses
                          </h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                              {archivedCourses.map((course) => {
                                  const provider = allProviders.find(p => p.id === course.organizationId);
                                  return (
                                    <motion.div key={course.id} variants={itemVariants}>
                                      <CourseCard {...course} provider={provider} />
                                    </motion.div>
                                  );
                              })}
                          </div>
                      </section>
                    )}
                  </>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
