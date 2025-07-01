

"use client";

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CourseCard } from '@/components/course-card';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpenText } from 'lucide-react';
import { CourseFilterBar } from '@/components/course-filter-bar';
import { Course, Organization } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';

type CoursesPageClientProps = {
    activeCourses: Course[];
    archivedCourses: Course[];
    allCategories: string[];
    allSubCategories: string[];
    allProviders: Organization[];
};

const groupCoursesByCategory = (courses: Course[]): { [key: string]: Course[] } => {
  return courses.reduce((acc, course) => {
    const category = course.category;
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
    activeCourses,
    archivedCourses,
    allCategories,
    allSubCategories,
    allProviders
}: CoursesPageClientProps) {
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const [loading] = useState(false); // Data is pre-fetched, so no client-side loading needed initially

  const selectedCategory = searchParams?.get('category');
  const selectedSubCategory = searchParams?.get('subCategory');
  const selectedProvider = searchParams?.get('provider');

  let filteredCourses = activeCourses;

  if (selectedCategory) {
    filteredCourses = filteredCourses.filter(
      (course) => course.category === selectedCategory
    );
  }
  if (selectedSubCategory) {
    filteredCourses = filteredCourses.filter(
      (course) => course.subCategory === selectedSubCategory
    );
  }
   if (selectedProvider) {
    filteredCourses = filteredCourses.filter(
      (course) => course.organizationId === selectedProvider
    );
  }
  
  const hasFilters = selectedCategory || selectedSubCategory || selectedProvider;
  
  const coursesByCategory = groupCoursesByCategory(filteredCourses);

  const sortedCategories = Object.keys(coursesByCategory).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <div className="bg-background">
      <div className="bg-secondary/50 border-b">
        <div className="container mx-auto grid grid-cols-1 items-center gap-8 px-4 py-16 md:grid-cols-2">
          <div>
            <h1 className="font-headline text-4xl font-bold tracking-tight">RDC SHOP</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {language === 'bn' ? 'আপনার প্রয়োজনীয় সকল কোর্স এখন RDC SHOP-এ। সেরা শিক্ষকদের সাথে নিজের শেখার যাত্রা শুরু করুন।' : 'All the courses you need are now at RDC SHOP. Start your learning journey with the best teachers.'}
            </p>
            <Button asChild className="mt-6 bg-green-600 font-bold text-white hover:bg-green-700">
              <Link href="/courses#master-course">
                 <Sparkles className="mr-2 h-4 w-4" />
                 {language === 'bn' ? 'আমাদের ফ্রি কোর্সগুলো দেখুন' : 'See Our Free Courses'}
              </Link>
            </Button>
          </div>
          <div className="hidden items-center justify-center md:flex md:justify-end">
            <div className="relative flex h-48 w-48 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse"></div>
              <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-background border-2 border-primary">
                <BookOpenText className="h-20 w-20 text-primary" />
              </div>
            </div>
          </div>
        </div>
        <CourseFilterBar categories={allCategories} subCategories={allSubCategories} providers={allProviders}/>
      </div>

      <main className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner className="w-12 h-12" />
          </div>
        ) : hasFilters ? (
            <section className='py-0'>
              <h2 className="font-headline mb-6 text-3xl font-bold">
                {language === 'bn' ? `ফিল্টার ফলাফল (${filteredCourses.length})` : `Filtered Results (${filteredCourses.length})`}
              </h2>
              {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {filteredCourses.map((course) => {
                    const provider = allProviders.find(p => p.id === course.organizationId);
                    return <CourseCard key={course.id} {...course} provider={provider} />;
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">{language === 'bn' ? 'আপনার মানদণ্ডের সাথে মিলে এমন কোনো কোর্স পাওয়া যায়নি। ফিল্টারগুলো মুছে ফেলার চেষ্টা করুন।' : 'No courses found matching your criteria. Try clearing the filters.'}</p>
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
                       return <CourseCard key={course.id} {...course} provider={provider} />;
                    })}
                  </div>
                </section>
              ))}

              {archivedCourses.length > 0 && (
                <section id="old-is-gold" className='py-0'>
                    <h2 className="font-headline mb-6 text-3xl font-bold">
                        OLD IS GOLD
                    </h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
