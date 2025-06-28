
import Image from 'next/image';
import Link from 'next/link';
import { 
  BookOpen,
  PlayCircle,
  Users,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CourseCard } from '@/components/course-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { courses } from '@/lib/mock-data';
import type { Metadata } from 'next';
import { HeroCarousel } from '@/components/hero-carousel';
import { homepageConfig } from '@/lib/homepage-data';
import { CollaborationsCarousel } from '@/components/collaborations-carousel';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  description: 'Join thousands of learners at Red Dot Classroom. We offer high-quality online courses for HSC, SSC, Admission Tests, and professional skills development in Bangladesh.',
};

const WhyChooseUsIcon = ({ icon, className }: { icon: React.ComponentType<{ className?: string }>, className?: string }) => {
  const Icon = icon;
  return <Icon className={cn("w-10 h-10 text-primary", className)} />;
};

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Trophy,
  BookOpen,
  Users,
};

export default function Home() {
  const liveCourses = courses.filter(c => homepageConfig.liveCoursesIds.includes(c.id));
  const sscHscCourses = courses.filter(c => homepageConfig.sscHscCourseIds.includes(c.id));
  const masterClasses = courses.filter(c => homepageConfig.masterClassesIds.includes(c.id));
  const admissionCourses = courses.filter(c => homepageConfig.admissionCoursesIds.includes(c.id));
  const jobCourses = courses.filter(c => homepageConfig.jobCoursesIds.includes(c.id));

  return (
    <div className="flex flex-col bg-background">
      {/* Hero Carousel Section */}
      <HeroCarousel banners={homepageConfig.heroBanners} />
      
      {/* Hero Section */}
      <section className="bg-secondary/50" aria-labelledby="hero-heading">
        <div className="container mx-auto px-4">
          <h2 id="hero-heading" className="font-headline text-3xl font-bold text-center mb-4">শেখার যাত্রা শুরু</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">আপনার সন্তানের উজ্জ্বল ভবিষ্যতের জন্য আমাদের কোর্সগুলোতে ভর্তি করুন। সেরা শিক্ষকমণ্ডলী আর আধুনিক পাঠ্যক্রম নিয়ে আমরা আছি আপনার পাশে।</p>
           <div>
            <h3 className="font-headline text-2xl font-bold text-center mb-6">আমাদের লাইভ কোর্সসমূহ</h3>
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
                <CarouselPrevious className="text-foreground"/>
                <CarouselNext className="text-foreground"/>
            </Carousel>
           </div>
        </div>
      </section>

      {/* Video Section */}
      <section aria-labelledby="video-section-heading">
        <div className="container mx-auto px-4 text-center">
            <h2 id="video-section-heading" className="font-headline text-3xl font-bold mb-2">{homepageConfig.videoSection.title}</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">{homepageConfig.videoSection.description}</p>
            <div className="grid md:grid-cols-2 gap-8">
                {homepageConfig.videoSection.videos.map((video, index) => (
                  <div key={index} className="relative rounded-lg overflow-hidden group shadow-lg">
                      <Image src={video.imageUrl} alt={video.alt} width={600} height={400} className="w-full transition-transform duration-300 group-hover:scale-105" data-ai-hint={video.dataAiHint}/>
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <PlayCircle className="w-16 h-16 text-white/80 group-hover:text-white transition-colors cursor-pointer"/>
                      </div>
                  </div>
                ))}
            </div>
            <Button asChild variant="accent" size="lg" className="mt-12 font-bold">
              <Link href="/courses">সকল কোর্স দেখুন</Link>
            </Button>
        </div>
      </section>

      {/* SSC & HSC Section */}
      <section className="bg-secondary/50" aria-labelledby="ssc-hsc-heading">
          <div className="container mx-auto px-4 text-center">
              <Badge variant="default" className="mb-4 text-lg py-1 px-4 rounded-full">SSC ও HSC</Badge>
              <h2 id="ssc-hsc-heading" className="font-headline text-3xl font-bold mb-8">SSC ও HSC শিক্ষার্থীদের জন্য</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {sscHscCourses.map(course => <CourseCard key={course.id} {...course} />)}
              </div>
          </div>
      </section>

      {/* Masterclass Section */}
      <section className="bg-background" aria-labelledby="masterclass-heading">
          <div className="container mx-auto px-4 text-center">
              <h2 id="masterclass-heading" className="font-headline text-3xl font-bold mb-8">তোমাদের জন্য রয়েছে রেকর্ডেড মাস্টারক্লাস</h2>
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
                <CarouselPrevious className="text-foreground"/>
                <CarouselNext className="text-foreground"/>
              </Carousel>
              <Button asChild variant="accent" size="lg" className="mt-12 font-bold">
                <Link href="/courses?category=মাস্টার কোর্স">সকল কোর্স দেখুন</Link>
              </Button>
          </div>
      </section>

      {/* Admission Section */}
      <section className="bg-secondary/50" aria-labelledby="admission-heading">
          <div className="container mx-auto px-4 text-center">
              <Badge variant="default" className="mb-4 text-lg py-1 px-4 rounded-full">Admission</Badge>
              <h2 id="admission-heading" className="font-headline text-3xl font-bold mb-8">আপনার ভার্সিটির সম্পূর্ণ প্রস্তুতি</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {admissionCourses.map(course => <CourseCard key={course.id} {...course} />)}
              </div>
               <Button asChild variant="accent" size="lg" className="mt-12 font-bold">
                <Link href="/courses?category=Admission">সকল কোর্স দেখুন</Link>
               </Button>
          </div>
      </section>
      
      {/* Job Prep Section */}
      <section className="bg-background" aria-labelledby="job-prep-heading">
          <div className="container mx-auto px-4 text-center">
              <Badge variant="default" className="mb-4 text-lg py-1 px-4 rounded-full">Job Preparation</Badge>
              <h2 id="job-prep-heading" className="font-headline text-3xl font-bold mb-8">সরকারি চাকরির সর্বোচ্চ প্রস্তুতি</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {jobCourses.map(course => <CourseCard key={course.id} {...course} />)}
              </div>
               <Button asChild variant="accent" size="lg" className="mt-12 font-bold">
                <Link href="/courses?category=Job+Prep">সকল কোর্স দেখুন</Link>
              </Button>
          </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-secondary/50" aria-labelledby="why-choose-us-heading">
        <div className="container mx-auto px-4">
          <h2 id="why-choose-us-heading" className="font-headline text-3xl font-bold text-center mb-12">
            {homepageConfig.whyChooseUs.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {homepageConfig.whyChooseUs.features.map((feature, index) => (
              <div key={index} className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm">
                <div className="mb-4 flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
                  <WhyChooseUsIcon icon={iconMap[feature.icon] || Trophy} />
                </div>
                <h3 className="font-headline text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collaborations Section */}
      <section className="bg-background" aria-labelledby="collaborations-heading">
        <div className="container mx-auto px-4">
          <h2 id="collaborations-heading" className="font-headline text-3xl font-bold text-center mb-12">
            {homepageConfig.collaborations.title}
          </h2>
          <CollaborationsCarousel items={homepageConfig.collaborations.items} />
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground" aria-labelledby="stats-heading">
        <div className="container mx-auto px-4 text-center">
            <h2 id="stats-heading" className="font-headline text-3xl font-bold mb-8">{homepageConfig.statsSectionTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {homepageConfig.stats.map((stat, index) => (
                    <div key={index} className="text-center">
                        <p className="font-headline text-5xl font-bold">{stat.value}</p>
                        <p className="mt-2 text-lg opacity-90">{stat.label}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Notes Banner */}
      <section className="bg-secondary/50" aria-labelledby="notes-banner-heading">
        <div className="container mx-auto px-4">
          <Card className="shadow-lg">
            <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className='text-center md:text-left'>
                    <h3 id="notes-banner-heading" className="font-headline text-2xl font-bold text-card-foreground">{homepageConfig.notesBanner.title}</h3>
                    <p className="text-muted-foreground mt-2">{homepageConfig.notesBanner.description}</p>
                </div>
                <Button variant="accent" size="lg" className="font-bold shrink-0">{homepageConfig.notesBanner.buttonText}</Button>
            </div>
          </Card>
        </div>
      </section>

      {/* App Promo Section */}
      <section className="bg-background" aria-labelledby="app-promo-heading">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
              <div className="text-center md:text-left">
                <h2 id="app-promo-heading" className="font-headline text-4xl font-bold">{homepageConfig.appPromo.title}</h2>
                <p className="mt-4 text-lg text-muted-foreground">{homepageConfig.appPromo.description}</p>
                <div className="flex justify-center md:justify-start gap-4 mt-8">
                    <Link href={homepageConfig.appPromo.googlePlayUrl}>
                        <Image src="https://placehold.co/180x60.png" width={180} height={60} alt="Google Play Store" data-ai-hint="play store button"/>
                    </Link>
                    <Link href={homepageConfig.appPromo.appStoreUrl}>
                        <Image src="https://placehold.co/180x60.png" width={180} height={60} alt="Apple App Store" data-ai-hint="app store button"/>
                    </Link>
                </div>
              </div>
              <div className="flex justify-center">
                  <Image src={homepageConfig.appPromo.imageUrl} width={350} height={500} alt="RDC App" className='object-contain' data-ai-hint="mobile app screenshot"/>
              </div>
          </div>
      </section>
    </div>
  );
}
