import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowRight,
  Video,
  BookOpen,
  ClipboardList,
  FileText,
  PlayCircle,
  Users,
  Trophy,
  BarChart,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CourseCard } from '@/components/course-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';

const liveCourses = [
  {
    id: '1',
    title: 'HSC 2025 ক্র্যাশ কোর্স - বিজ্ঞান',
    instructor: 'Jubayer Ahmed',
    imageUrl: 'https://placehold.co/600x400',
    category: 'HSC',
    price: 'BDT 4500',
    dataAiHint: 'physics class',
  },
  {
    id: '2',
    title: 'Admission Test Prep (Medical)',
    instructor: 'Sadia Islam',
    imageUrl: 'https://placehold.co/600x400',
    category: 'Admission',
    price: 'BDT 5000',
    dataAiHint: 'medical students',
  },
  {
    id: '3',
    title: 'IELTS Preparation Course',
    instructor: 'Raihan Chowdhury',
    imageUrl: 'https://placehold.co/600x400',
    category: 'Language',
    price: 'BDT 3000',
    dataAiHint: 'ielts exam',
  },
    {
    id: '4',
    title: 'Data Science with Python',
    instructor: 'Ayesha Khan',
    imageUrl: 'https://placehold.co/600x400',
    category: 'Skills',
    price: 'BDT 5500',
    dataAiHint: 'python code',
  },
];

const sscHscCourses = [
  {
    id: '5',
    title: 'SSC 2025 Online Batch',
    instructor: 'Farhan Mahmud',
    imageUrl: 'https://placehold.co/600x400',
    category: 'SSC',
    price: 'BDT 4000',
    dataAiHint: 'classroom students',
  },
  {
    id: '6',
    title: 'HSC 2025 Online Batch',
    instructor: 'Nusrat Jahan',
    imageUrl: 'https://placehold.co/600x400',
    category: 'HSC',
    price: 'BDT 4500',
    dataAiHint: 'lecture hall',
  },
  {
    id: '7',
    title: 'HSC ICT Masterclass',
    instructor: 'Jubayer Ahmed',
    imageUrl: 'https://placehold.co/600x400',
    category: 'HSC',
    price: 'BDT 2500',
    dataAiHint: 'computer circuit',
  },
];

const masterClasses = [
    { id: '3', title: 'IELTS Preparation Course', instructor: 'Raihan Chowdhury', imageUrl: 'https://placehold.co/600x400', category: 'Language', price: 'BDT 3000', dataAiHint: 'ielts exam' },
    { id: '4', title: 'Data Science with Python', instructor: 'Ayesha Khan', imageUrl: 'https://placehold.co/600x400', category: 'Skills', price: 'BDT 5500', dataAiHint: 'python code' },
    { id: '6', title: 'HSC ICT Masterclass', instructor: 'Nusrat Jahan', imageUrl: 'https://placehold.co/600x400', category: 'HSC', price: 'BDT 2500', dataAiHint: 'computer circuit' },
    { id: '8', title: 'Graphic Design Fundamentals', instructor: 'Sadia Islam', imageUrl: 'https://placehold.co/600x400', category: 'Skills', price: 'BDT 3500', dataAiHint: 'graphic design' },
];

const admissionCourses = [
    { id: '2', title: 'Medical Admission Course', instructor: 'Sadia Islam', imageUrl: 'https://placehold.co/600x400', category: 'Admission', price: 'BDT 5000', dataAiHint: 'medical students' },
    { id: '9', title: 'Engineering Admission', instructor: 'Jubayer Ahmed', imageUrl: 'https://placehold.co/600x400', category: 'Admission', price: 'BDT 5000', dataAiHint: 'engineering drawing' },
    { id: '10', title: 'University (Ka unit) Admission', instructor: 'Farhan Mahmud', imageUrl: 'https://placehold.co/600x400', category: 'Admission', price: 'BDT 5000', dataAiHint: 'university building' },
];

const jobCourses = [
    { id: '11', title: 'BCS Preliminary Course', instructor: 'Raihan Chowdhury', imageUrl: 'https://placehold.co/600x400', category: 'Job Prep', price: 'BDT 4000', dataAiHint: 'government building' },
    { id: '12', title: 'Bank Job Preparation', instructor: 'Ayesha Khan', imageUrl: 'https://placehold.co/600x400', category: 'Job Prep', price: 'BDT 3500', dataAiHint: 'bank interior' },
    { id: '13', title: 'Primary Assistant Teacher', instructor: 'Nusrat Jahan', imageUrl: 'https://placehold.co/600x400', category: 'Job Prep', price: 'BDT 3000', dataAiHint: 'teacher classroom' },
    { id: '14', title: 'IBA Admission Preparation', instructor: 'Farhan Mahmud', imageUrl: 'https://placehold.co/600x400', category: 'Job Prep', price: 'BDT 5500', dataAiHint: 'business meeting' },
];


const whyChooseUs = [
  { icon: Trophy, title: 'সেরা প্রশিক্ষক', description: 'দেশের সেরা শিক্ষকরা ক্লাস নেন' },
  { icon: BookOpen, title: 'লাইভ ক্লাস', description: 'সরাসরি প্রশ্ন করার সুযোগ' },
  { icon: Users, title: 'সহপাঠীদের সাথে প্রস্তুতি', description: 'একসাথে পড়াশোনা ও মডেল টেস্ট' },
];

export default function Home() {
  return (
    <div className="flex flex-col bg-background">
      {/* Hero Section */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl font-bold text-center mb-2">শেখার যাত্রা শুরু</h2>
          <div className="grid md:grid-cols-2 gap-8 items-stretch mt-8">
            <Card className="bg-blue-900/40 border-blue-700">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center justify-center p-4 bg-gray-800/50 rounded-lg">
                    <Video className="w-10 h-10 text-primary mb-2"/>
                    <p className="font-semibold text-center">লাইভ ক্লাস</p>
                  </div>
                   <div className="flex flex-col items-center justify-center p-4 bg-gray-800/50 rounded-lg">
                    <BookOpen className="w-10 h-10 text-green-400 mb-2"/>
                    <p className="font-semibold text-center">ভিডিও লেকচার</p>
                  </div>
                   <div className="flex flex-col items-center justify-center p-4 bg-gray-800/50 rounded-lg">
                    <ClipboardList className="w-10 h-10 text-yellow-400 mb-2"/>
                    <p className="font-semibold text-center">প্র্যাকটিস</p>
                  </div>
                   <div className="flex flex-col items-center justify-center p-4 bg-gray-800/50 rounded-lg">
                    <FileText className="w-10 h-10 text-purple-400 mb-2"/>
                    <p className="font-semibold text-center">নোট</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-yellow-900/20 border-yellow-700">
               <CardContent className="p-6">
                 <div className="grid grid-cols-2 gap-4">
                    <CourseCard id="1" title="HSC 2025 ক্র্যাশ কোর্স" imageUrl="https://placehold.co/600x400" dataAiHint="science class" />
                    <CourseCard id="2" title="মেডিকেল এডমিশন কোর্স" imageUrl="https://placehold.co/600x400" dataAiHint="doctor student" />
                    <CourseCard id="9" title="ইঞ্জিনিয়ারিং এডমিশন" imageUrl="https://placehold.co/600x400" dataAiHint="engineering blueprint" />
                    <CourseCard id="5" title="SSC 2025 Online Batch" imageUrl="https://placehold.co/600x400" dataAiHint="students writing" />
                 </div>
              </CardContent>
            </Card>
          </div>
           <div className="mt-12">
            <h3 className="font-headline text-2xl font-bold text-center mb-6 text-white">আমাদের লাইভ কোর্সসমূহ</h3>
             <Carousel opts={{ align: 'start', loop: true }}>
                <CarouselContent>
                  {liveCourses.map((course) => (
                    <CarouselItem key={course.id} className="md:basis-1/2 lg:basis-1/4">
                      <div className="p-1">
                        <CourseCard {...course} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="text-white"/>
                <CarouselNext className="text-white"/>
            </Carousel>
           </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
            <h2 className="font-headline text-3xl font-bold mb-2">সফল শিক্ষার্থীদের কোর্সে কী কী থাকছে?</h2>
            <p className="text-muted-foreground mb-8">নিজেকে এগিয়ে রাখতে আজই শুরু করুন আপনার পছন্দের কোর্স</p>
            <div className="grid md:grid-cols-2 gap-8">
                <div className="relative rounded-lg overflow-hidden group">
                    <Image src="https://placehold.co/600x400" alt="Online course feature" width={600} height={400} className="w-full" data-ai-hint="online learning"/>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <PlayCircle className="w-16 h-16 text-white/80 group-hover:text-white transition-colors cursor-pointer"/>
                    </div>
                </div>
                <div className="relative rounded-lg overflow-hidden group">
                    <Image src="https://placehold.co/600x400" alt="Best science videos" width={600} height={400} className="w-full" data-ai-hint="science experiment"/>
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <PlayCircle className="w-16 h-16 text-white/80 group-hover:text-white transition-colors cursor-pointer"/>
                    </div>
                </div>
            </div>
            <Button variant="accent" size="lg" className="mt-8 font-bold">সকল কোর্স দেখুন</Button>
        </div>
      </section>

      {/* SSC & HSC Section */}
      <section className="py-16 bg-card">
          <div className="container mx-auto px-4 text-center">
              <Badge variant="default" className="mb-2">SSC ও HSC</Badge>
              <h2 className="font-headline text-3xl font-bold mb-8">SSC ও HSC শিক্ষার্থীদের জন্য</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sscHscCourses.map(course => <CourseCard key={course.id} {...course} />)}
              </div>
          </div>
      </section>

      {/* Masterclass Section */}
      <section className="py-16 bg-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
              <h2 className="font-headline text-3xl font-bold mb-8">তোমাদের জন্য রয়েছে রেকর্ডেড মাস্টারক্লাস</h2>
               <Carousel opts={{ align: 'start', loop: true }}>
                <CarouselContent>
                  {masterClasses.map((course) => (
                    <CarouselItem key={course.id} className="md:basis-1/2 lg:basis-1/4">
                      <div className="p-1">
                        <CourseCard {...course} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="text-white"/>
                <CarouselNext className="text-white"/>
              </Carousel>
              <Button variant="accent" size="lg" className="mt-8 font-bold">সকল কোর্স দেখুন</Button>
          </div>
      </section>

      {/* Admission Section */}
      <section className="py-16 bg-card">
          <div className="container mx-auto px-4 text-center">
              <Badge variant="default" className="mb-2">Admission</Badge>
              <h2 className="font-headline text-3xl font-bold mb-8">আপনার ভার্সিটির সম্পূর্ণ প্রস্তুতি</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {admissionCourses.map(course => <CourseCard key={course.id} {...course} />)}
              </div>
               <Button variant="accent" size="lg" className="mt-8 font-bold">সকল কোর্স দেখুন</Button>
          </div>
      </section>
      
      {/* Job Prep Section */}
      <section className="py-16 bg-background">
          <div className="container mx-auto px-4 text-center">
              <Badge variant="default" className="mb-2">Job Preparation</Badge>
              <h2 className="font-headline text-3xl font-bold mb-8">সরকারি চাকরির সর্বোচ্চ প্রস্তুতি</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {jobCourses.map(course => <CourseCard key={course.id} {...course} />)}
              </div>
               <Button variant="accent" size="lg" className="mt-8 font-bold">সকল কোর্স দেখুন</Button>
          </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl font-bold text-center mb-12">
            কেন আমরাই শিক্ষার্থী ও অভিভাবকদের প্রথম পছন্দ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyChooseUs.map((feature) => (
              <Card key={feature.title} className="text-center p-6 border-0 shadow-none bg-transparent">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-headline text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Notes Banner */}
      <section className="py-12 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="bg-gray-800 rounded-lg p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                  <h3 className="font-headline text-2xl font-bold text-white">টেন মিনিট স্কুলের নোট পড়ে পাস!</h3>
                  <p className="text-gray-300 mt-2">সেরা নোট, লেকচার শিট ও গুরুত্বপূর্ণ সাজেশন খুঁজে নাও সহজেই।</p>
              </div>
              <Button variant="accent" size="lg" className="font-bold shrink-0">নোটস এবং সাজেশন</Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-red-800 text-white">
        <div className="container mx-auto px-4 text-center">
            <h2 className="font-headline text-3xl font-bold mb-8">২০২২-২৪ শিক্ষাবর্ষে টেন মিনিট স্কুলের এডমিশন সাফল্য</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                    <p className="font-headline text-5xl font-bold">১,২১৬</p>
                    <p className="mt-2 text-lg">মেডিকেল ও ডেন্টাল</p>
                </div>
                <div className="text-center">
                    <p className="font-headline text-5xl font-bold">৮৫+</p>
                    <p className="mt-2 text-lg">বুয়েট</p>
                </div>
                <div className="text-center">
                    <p className="font-headline text-5xl font-bold">৯</p>
                    <p className="mt-2 text-lg">আইবিএ (ঢাকা বিশ্ববিদ্যালয়)</p>
                </div>
            </div>
        </div>
      </section>

      {/* App Promo Section */}
      <section className="py-16 bg-gray-900 text-white">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
              <div className="text-center md:text-left">
                <h2 className="font-headline text-4xl font-bold">যেকোনো জায়গায় বসে শিখুন, যখন যা প্রয়োজন!</h2>
                <p className="mt-4 text-lg text-gray-300">আমাদের অ্যাপ ডাউনলোড করে স্মার্টফোনেই গুছিয়ে নিন আপনার সম্পূর্ণ প্রস্তুতি।</p>
                <div className="flex justify-center md:justify-start gap-4 mt-8">
                    <Link href="#">
                        <Image src="https://placehold.co/180x60" width={180} height={60} alt="Google Play Store" data-ai-hint="play store button"/>
                    </Link>
                    <Link href="#">
                        <Image src="https://placehold.co/180x60" width={180} height={60} alt="Apple App Store" data-ai-hint="app store button"/>
                    </Link>
                </div>
              </div>
              <div className="flex justify-center">
                  <Image src="https://placehold.co/400x500" width={400} height={500} alt="RDC App" data-ai-hint="mobile app screenshot"/>
              </div>
          </div>
      </section>
    </div>
  );
}
