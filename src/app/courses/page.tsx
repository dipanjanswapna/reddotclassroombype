import { CourseListItem } from '@/components/course-list-item';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { CourseFilterBar } from '@/components/course-filter-bar';

const hscScienceCourses = [
  {
    id: '1',
    category: 'এইচএসসি ২৫ অনলাইন ব্যাচ',
    features: ['লাইভ ক্লাস', 'লেকচার শীট', 'প্র্যাকটিস', 'ফাইনাল মডেল টেস্ট'],
    price: '৳ ১২৫০',
    imageTitle: 'PCMB',
    imageUrl: 'https://placehold.co/300x400',
    dataAiHint: 'science textbook',
  },
  {
    id: '2',
    category: 'এইচএসসি ২৫ অনলাইন ব্যাচ',
    features: ['লাইভ ক্লাস', 'লেকচার শীট', 'প্র্যাকটিস', 'ফাইনাল মডেল টেস্ট'],
    price: '৳ ১২৫০',
    imageTitle: 'B/E/I',
    imageUrl: 'https://placehold.co/300x400',
    dataAiHint: 'english textbook',
  },
];

const hscArtsCourses = [
    {
        id: '3',
        category: 'এইচএসসি ২৫ অনলাইন ব্যাচ',
        features: ['লাইভ ক্লাস', 'লেকচার শীট', 'প্র্যাকটিস', 'ফাইনাল মডেল টেস্ট'],
        price: '৳ ১২৫০',
        imageTitle: 'বাংলা ঐচ্ছিক',
        imageUrl: 'https://placehold.co/300x400',
        dataAiHint: 'bangla literature',
    },
    {
        id: '4',
        category: 'এইচএসসি ২৫ অনলাইন ব্যাচ',
        features: ['লাইভ ক্লাস', 'লেকচার শীট', 'প্র্যাকটিস', 'ফাইনাল মডেল টেস্ট'],
        price: '৳ ১২৫০',
        imageTitle: 'সাইকোলজি',
        imageUrl: 'https://placehold.co/300x400',
        dataAiHint: 'psychology book',
    },
];

const hscSubjectCourses = [
    { id: '5', category: 'বিষয়ভিত্তিক কোর্স', price: '৳ ৭৫০', imageTitle: 'PHYSICS', imageUrl: 'https://placehold.co/300x400', dataAiHint: 'physics equation', features: ['রেকর্ডেড ক্লাস', 'লেকচার শীট', 'কুইজ'] },
    { id: '6', category: 'বিষয়ভিত্তিক কোর্স', price: '৳ ৭৫০', imageTitle: 'CHEMISTRY', imageUrl: 'https://placehold.co/300x400', dataAiHint: 'chemistry lab', features: ['রেকর্ডেড ক্লাস', 'লেকচার শীট', 'কুইজ'] },
    { id: '7', category: 'বিষয়ভিত্তিক কোর্স', price: '৳ ৭৫০', imageTitle: 'H.MATH', imageUrl: 'https://placehold.co/300x400', dataAiHint: 'math formulas', features: ['রেকর্ডেড ক্লাস', 'লেকচার শীট', 'কুইজ'] },
    { id: '8', category: 'বিষয়ভিত্তিক কোর্স', price: '৳ ৭৫০', imageTitle: 'BIOLOGY', imageUrl: 'https://placehold.co/300x400', dataAiHint: 'biology microscope', features: ['রেকর্ডেড ক্লাস', 'লেকচার শীট', 'কুইজ'] },
    { id: '9', category: 'বিষয়ভিত্তিক কোর্স', price: '৳ ৭৫০', imageTitle: 'BANGLA', imageUrl: 'https://placehold.co/300x400', dataAiHint: 'bangla book', features: ['রেকর্ডেড ক্লাস', 'লেকচার শীট', 'কুইজ'] },
    { id: '10', category: 'বিষয়ভিত্তিক কোর্স', price: '৳ ৭৫০', imageTitle: 'ENGLISH', imageUrl: 'https://placehold.co/300x400', dataAiHint: 'english dictionary', features: ['রেকর্ডেড ক্লাস', 'লেকচার শীট', 'কুইজ'] },
    { id: '11', category: 'বিষয়ভিত্তিক কোর্স', price: '৳ ৭৫০', imageTitle: 'ICT', imageUrl: 'https://placehold.co/300x400', dataAiHint: 'computer circuit', features: ['রেকর্ডেড ক্লাস', 'লেকচার শীট', 'কুইজ'] },
    { id: '12', category: 'বিষয়ভিত্তিক কোর্স', price: '৳ ৭৫০', imageTitle: 'FINANCE', imageUrl: 'https://placehold.co/300x400', dataAiHint: 'stock market', features: ['রেকর্ডেড ক্লাস', 'লেকচার শীট', 'কুইজ'] },
];

const testPaperCourses = [
    { id: '13', category: 'টেস্ট পেপার সলভ', price: '৳ ৯৫০', imageTitle: 'বিজ্ঞান শাখা', imageUrl: 'https://placehold.co/300x400', dataAiHint: 'exam paper', features: ['ফিজিক্স', 'ক্যামিস্ট্রি', 'বায়োলজি'] },
    { id: '14', category: 'টেস্ট পেপার সলভ', price: '৳ ৯৫০', imageTitle: 'মানবিক শাখা', imageUrl: 'https://placehold.co/300x400', dataAiHint: 'history book', features: ['ইতিহাস', 'পৌরনীতি', 'অর্থনীতি'] },
];

const masterCourses = [
    { id: '15', category: 'মাস্টার কোর্স', price: 'Free', imageTitle: 'গ্রাফিক্স ডিজাইন', imageUrl: 'https://placehold.co/300x400', dataAiHint: 'design tools', features: ['ফটোশপ', 'ইলাস্ট্রেটর', 'ফিigma'] },
    { id: '16', category: 'মাস্টার কোর্স', price: 'Free', imageTitle: 'ওয়েব ডেভেলপমেন্ট', imageUrl: 'https://placehold.co/300x400', dataAiHint: 'programming code', features: ['HTML', 'CSS', 'JavaScript'] },
];

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
