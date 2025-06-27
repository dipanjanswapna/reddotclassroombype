
import { CourseCard } from '@/components/course-card';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpenText } from 'lucide-react';
import { CourseFilterBar } from '@/components/course-filter-bar';
import { courses, Course } from '@/lib/mock-data';
import Link from 'next/link';

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

const coursesByCategory = groupCoursesByCategory(courses);
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

const sortedCategories = Object.keys(coursesByCategory).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA === -1) return 1; // Put categories not in the order list at the end
    if (indexB === -1) return -1;
    return indexA - indexB;
});


export default function CoursesPage() {
  return (
    <div className="bg-background">
      <div className="bg-gray-900 text-white">
        <div className="container mx-auto grid grid-cols-1 items-center gap-8 px-4 py-12 md:grid-cols-2">
          <div>
            <h1 className="font-headline text-4xl font-bold tracking-tight">আমাদের কোর্সসমূহ</h1>
            <p className="mt-2 text-lg text-gray-300">
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
            <div className="flex h-40 w-40 items-center justify-center rounded-full bg-primary/20 border-2 border-primary">
              <BookOpenText className="h-20 w-20 text-primary" />
            </div>
          </div>
        </div>
        <CourseFilterBar />
      </div>

      <main className="container mx-auto px-4 py-12">
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
        </div>
      </main>
    </div>
  );
}
