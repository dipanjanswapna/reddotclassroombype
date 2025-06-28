
import { CourseCard } from '@/components/course-card';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpenText } from 'lucide-react';
import { CourseFilterBar } from '@/components/course-filter-bar';
import { courses, Course } from '@/lib/mock-data';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Courses',
  description: 'Explore a wide range of courses on Red Dot Classroom. Find the perfect course for HSC, SSC, Admission Tests, Job Prep, and Skills development.',
};

// Helper to group courses by category
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

// Define a preferred order for categories to ensure a logical layout
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

export default function CoursesPage({
  searchParams,
}: {
  searchParams?: {
    category?: string;
    subCategory?: string;
  };
}) {

  // Separate all published courses into active and archived
  const allPublishedCourses = courses.filter(course => course.status === 'Published');
  const activeCourses = allPublishedCourses.filter(course => !course.isArchived);
  const archivedCourses = allPublishedCourses.filter(course => course.isArchived);

  const selectedCategory = searchParams?.category;
  const selectedSubCategory = searchParams?.subCategory;

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
  
  const hasFilters = selectedCategory || selectedSubCategory;
  
  const coursesByCategory = groupCoursesByCategory(filteredCourses);

  const sortedCategories = Object.keys(coursesByCategory).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
  
  // The filter bar should also only show categories from active courses
  const allCategories = [...new Set(activeCourses.map(course => course.category))].sort();
  const allSubCategories = [...new Set(activeCourses.map(course => course.subCategory).filter(Boolean))] as string[];


  return (
    <div className="bg-background">
      <div className="bg-secondary/50 border-b">
        <div className="container mx-auto grid grid-cols-1 items-center gap-8 px-4 py-16 md:grid-cols-2">
          <div>
            <h1 className="font-headline text-4xl font-bold tracking-tight">আমাদের কোর্সসমূহ</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              তোমার প্রয়োজন অনুযায়ী বেছে নাও সেরা কোর্সটি, আর শুরু করো তোমার শেখার নতুন যাত্রা।
            </p>
            <Button asChild className="mt-6 bg-green-600 font-bold text-white hover:bg-green-700">
              <Link href="/courses#master-course">
                 <Sparkles className="mr-2 h-4 w-4" />
                 আমাদের ফ্রি কোর্সগুলো দেখুন
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
        <CourseFilterBar categories={allCategories} subCategories={allSubCategories} />
      </div>

      <main className="container mx-auto px-4 py-16">
        {hasFilters ? (
            <section>
              <h2 className="font-headline mb-6 text-3xl font-bold">
                Filtered Results ({filteredCourses.length})
              </h2>
              {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {filteredCourses.map((course) => (
                    <CourseCard key={course.id} {...course} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No courses found matching your criteria. Try clearing the filters.</p>
              )}
            </section>
        ) : (
            <div className="space-y-16">
              {sortedCategories.map((category) => (
                <section key={category} id={category.toLowerCase().replace(/\s+/g, '-')}>
                  <h2 className="font-headline mb-6 text-3xl font-bold">
                    {category}
                  </h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {coursesByCategory[category].map((course) => (
                      <CourseCard key={course.id} {...course} />
                    ))}
                  </div>
                </section>
              ))}

              {archivedCourses.length > 0 && (
                <section id="old-is-gold">
                    <h2 className="font-headline mb-6 text-3xl font-bold">
                        OLD IS GOLD
                    </h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {archivedCourses.map((course) => (
                        <CourseCard key={course.id} {...course} />
                        ))}
                    </div>
                </section>
              )}
            </div>
        )}
      </main>
    </div>
  );
}
