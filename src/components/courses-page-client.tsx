
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.3 } }
  };

  return (
    <div className="bg-transparent">
      <div className="container mx-auto px-4 py-4 md:py-8">
          <CourseFilterBar
            categories={allCategories}
            subCategories={allSubCategories}
            instructors={allInstructors}
            providers={allProviders}
          />
      </div>

      <main className="container mx-auto px-4 pt-0 pb-20 min-h-[400px]">
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
              className="space-y-16 md:space-y-24"
            >
              {hasFilters ? (
                  <section className='py-0'>
                    <h2 className="font-headline mb-8 text-2xl md:text-3xl font-black tracking-tight uppercase border-l-4 border-primary pl-4">
                      Found {initialCourses.length} Courses
                    </h2>
                    {initialCourses.length > 0 ? (
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                      <div className="text-center py-20 glassmorphism-card border-dashed">
                        <p className="text-muted-foreground text-lg">No courses found matching your criteria. Try clearing the filters.</p>
                      </div>
                    )}
                  </section>
              ) : (
                  <>
                    {sortedCategories.map((category) => (
                      <section key={category} id={category.toLowerCase().replace(/\s+/g, '-')} className='py-0'>
                        <h2 className="font-headline mb-8 text-2xl md:text-3xl font-black tracking-tight uppercase border-l-4 border-primary pl-4">
                          {category}
                        </h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                      <section id="archived-courses" className='py-0 border-t border-white/10 pt-16 md:pt-24'>
                          <h2 className="font-headline mb-8 text-2xl md:text-3xl font-black tracking-tight uppercase text-muted-foreground border-l-4 border-muted-foreground/30 pl-4">
                              Archived Courses
                          </h2>
                          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
