import { CourseListItem } from '@/components/course-list-item';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { CourseFilterBar } from '@/components/course-filter-bar';
import { courses } from '@/lib/mock-data';

const hscScienceCourses = courses.filter(c => c.category === 'এইচএসসি ২৫ অনলাইন ব্যাচ').slice(0, 2);
const hscArtsCourses = courses.filter(c => c.category === 'এইচএসসি ২৫ অনলাইন ব্যাচ').slice(0, 2);
const hscSubjectCourses = courses.filter(c => c.category === 'বিষয়ভিত্তিক কোর্স').slice(0, 8);
const testPaperCourses = courses.filter(c => c.category === 'টেস্ট পেপার সলভ').slice(0, 2);
const masterCourses = courses.filter(c => c.category === 'মাস্টার কোর্স').slice(0, 2);

export default function CoursesPage() {
  return (
    <div className="bg-background">
      <div className="bg-gray-900 text-white">
        <div className="container mx-auto grid grid-cols-1 items-center gap-8 px-4 py-8 md:grid-cols-2">
          <div>
            <h1 className="font-headline text-4xl font-bold">কোর্সসমূহ</h1>
            <p className="mt-2 text-gray-300">
              তোমার প্রয়োজন অনুযায়ী বেছে নাও সেরা কোর্স
            </p>
            <Button className="mt-4 bg-red-600 font-bold text-white hover:bg-red-700">
              <Sparkles className="mr-2 h-4 w-4" />
              Start learning free
            </Button>
          </div>
          <div className="hidden items-center justify-center md:flex md:justify-end">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-red-600">
              <span className="text-6xl font-bold text-white">H</span>
            </div>
          </div>
        </div>
        <CourseFilterBar />
      </div>

      <div className="container mx-auto px-4 py-12">
        <section className="mb-12">
          <h2 className="font-headline mb-6 text-2xl font-bold">
            এইচএসসি ২৫ অনলাইন ব্যাচ - বিজ্ঞান
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {hscScienceCourses.map((course) => (
              <CourseListItem key={course.id} {...course} />
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-headline mb-6 text-2xl font-bold">
            এইচএসসি ২৫ অনলাইন ব্যাচ - মানবিক
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {hscArtsCourses.map((course) => (
              <CourseListItem key={course.id} {...course} />
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-headline mb-6 text-2xl font-bold">
            বিষয়ভিত্তিক কোর্স
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {hscSubjectCourses.map((course) => (
              <CourseListItem key={course.id} {...course} />
            ))}
          </div>
        </section>
        
        <section className="mb-12">
          <h2 className="font-headline mb-6 text-2xl font-bold">
            টেস্ট পেপার সলভ কোর্স
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {testPaperCourses.map((course) => (
              <CourseListItem key={course.id} {...course} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-headline mb-6 text-2xl font-bold">
            মাস্টার কোর্স
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {masterCourses.map((course) => (
              <CourseListItem key={course.id} {...course} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
