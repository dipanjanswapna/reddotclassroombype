
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { 
  BookOpen,
  PlayCircle,
  Users,
  Trophy,
  Youtube,
  Facebook,
  Video,
  ThumbsUp,
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
import { courses, allInstructors } from '@/lib/mock-data';
import { HeroCarousel } from '@/components/hero-carousel';
import { homepageConfig } from '@/lib/homepage-data';
import { CollaborationsCarousel } from '@/components/collaborations-carousel';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/language-context';

const WhyChooseUsIcon = ({ icon, className }: { icon: React.ComponentType<{ className?: string }>, className?: string }) => {
  const Icon = icon;
  return <Icon className={cn("w-10 h-10 text-primary", className)} />;
};

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Trophy,
  BookOpen,
  Users,
};

const SocialIcon = ({ platform, className }: { platform: string, className?: string }) => {
  switch (platform) {
    case 'YouTube':
      return <Youtube className={cn("w-6 h-6 text-white", className)} />;
    case 'Facebook Group':
    case 'Facebook Page':
      return <Facebook className={cn("w-6 h-6 text-white", className)} />;
    default:
      return null;
  }
};


export default function Home() {
  const { language } = useLanguage();

  const liveCourses = courses.filter(c => homepageConfig.liveCoursesIds.includes(c.id));
  const featuredInstructors = allInstructors.filter(i => homepageConfig.teachersSection.instructorIds.includes(i.id) && i.status === 'Approved');
  const sscHscCourses = courses.filter(c => homepageConfig.sscHscCourseIds.includes(c.id));
  const masterClasses = courses.filter(c => homepageConfig.masterClassesIds.includes(c.id));
  const admissionCourses = courses.filter(c => homepageConfig.admissionCoursesIds.includes(c.id));
  const jobCourses = courses.filter(c => homepageConfig.jobCoursesIds.includes(c.id));

  return (
    <div className="flex flex-col bg-background">
      <HeroCarousel banners={homepageConfig.heroBanners} />
      
      <section className="bg-secondary/50" aria-labelledby="hero-heading">
        <div className="container mx-auto px-4">
          <h2 id="hero-heading" className="font-headline text-3xl font-bold text-center mb-4">{language === 'bn' ? 'শেখার যাত্রা শুরু' : 'Start Your Learning Journey'}</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">{language === 'bn' ? 'আপনার সন্তানের উজ্জ্বল ভবিষ্যতের জন্য আমাদের কোর্সগুলোতে ভর্তি করুন। সেরা শিক্ষকমণ্ডলী আর আধুনিক পাঠ্যক্রম নিয়ে আমরা আছি আপনার পাশে।' : 'Enroll your child in our courses for a bright future. We are here with the best teachers and modern curriculum.'}</p>
           <div>
            <h3 className="font-headline text-2xl font-bold text-center mb-6">{language === 'bn' ? 'আমাদের লাইভ কোর্সসমূহ' : 'Our Live Courses'}</h3>
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
                <CarouselPrevious className="bg-background/50 hover:bg-background/80 text-foreground"/>
                <CarouselNext className="bg-background/50 hover:bg-background/80 text-foreground"/>
            </Carousel>
           </div>
        </div>
      </section>

      <section aria-labelledby="teachers-heading">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
              <div>
                  <h2 id="teachers-heading" className="font-headline text-3xl font-bold">{homepageConfig.teachersSection.title[language]}</h2>
                  <p className="text-muted-foreground mt-1">{homepageConfig.teachersSection.subtitle[language]}</p>
              </div>
              <Button asChild variant="outline">
                  <Link href="/teachers">{homepageConfig.teachersSection.buttonText[language]}</Link>
              </Button>
          </div>
          <Carousel opts={{ align: 'start' }} className="w-full">
            <CarouselContent className="-ml-4">
              {featuredInstructors.map((instructor) => (
                <CarouselItem key={instructor.id} className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                   <Link href={`/teachers/${instructor.slug}`} className="block group text-center">
                    <div className="relative overflow-hidden rounded-lg">
                      <Image
                        src={instructor.avatarUrl}
                        alt={instructor.name}
                        width={250}
                        height={300}
                        className="w-full object-cover aspect-[4/5] transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint={instructor.dataAiHint}
                      />
                      <div className="absolute bottom-2 left-2 right-2 p-2 rounded-md bg-black/30 backdrop-blur-sm text-white">
                        <h3 className="font-semibold text-sm truncate">{instructor.name}</h3>
                        <p className="text-xs opacity-80 truncate">{instructor.title}</p>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="text-foreground -left-4 hidden sm:flex" />
            <CarouselNext className="text-foreground -right-4 hidden sm:flex" />
          </Carousel>
        </div>
      </section>

      <section aria-labelledby="video-section-heading">
        <div className="container mx-auto px-4 text-center">
            <h2 id="video-section-heading" className="font-headline text-3xl font-bold mb-2">{homepageConfig.videoSection.title[language]}</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">{homepageConfig.videoSection.description[language]}</p>
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
              <Link href="/courses">{language === 'bn' ? 'সকল কোর্স দেখুন' : 'See All Courses'}</Link>
            </Button>
        </div>
      </section>

      <section className="bg-secondary/50" aria-labelledby="ssc-hsc-heading">
          <div className="container mx-auto px-4 text-center">
              <Badge variant="default" className="mb-4 text-lg py-1 px-4 rounded-full">SSC & HSC</Badge>
              <h2 id="ssc-hsc-heading" className="font-headline text-3xl font-bold mb-8">{language === 'bn' ? 'SSC ও HSC শিক্ষার্থীদের জন্য' : 'For SSC & HSC Students'}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {sscHscCourses.map(course => <CourseCard key={course.id} {...course} />)}
              </div>
          </div>
      </section>

      <section aria-labelledby="masterclass-heading">
          <div className="container mx-auto px-4 text-center">
              <h2 id="masterclass-heading" className="font-headline text-3xl font-bold mb-8">{language === 'bn' ? 'তোমাদের জন্য রয়েছে রেকর্ডেড মাস্টারক্লাস' : 'Recorded Masterclasses For You'}</h2>
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
                <CarouselPrevious className="bg-background/50 hover:bg-background/80 text-foreground"/>
                <CarouselNext className="bg-background/50 hover:bg-background/80 text-foreground"/>
              </Carousel>
              <Button asChild variant="accent" size="lg" className="mt-12 font-bold">
                <Link href="/courses?category=মাস্টার কোর্স">{language === 'bn' ? 'সকল কোর্স দেখুন' : 'See All Courses'}</Link>
              </Button>
          </div>
      </section>

      <section className="bg-secondary/50" aria-labelledby="admission-heading">
          <div className="container mx-auto px-4 text-center">
              <Badge variant="default" className="mb-4 text-lg py-1 px-4 rounded-full">Admission</Badge>
              <h2 id="admission-heading" className="font-headline text-3xl font-bold mb-8">{language === 'bn' ? 'আপনার ভার্সিটির সম্পূর্ণ প্রস্তুতি' : 'Complete Preparation for Your University'}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {admissionCourses.map(course => <CourseCard key={course.id} {...course} />)}
              </div>
               <Button asChild variant="accent" size="lg" className="mt-12 font-bold">
                <Link href="/courses?category=Admission">{language === 'bn' ? 'সকল কোর্স দেখুন' : 'See All Courses'}</Link>
               </Button>
          </div>
      </section>
      
      <section aria-labelledby="job-prep-heading">
          <div className="container mx-auto px-4 text-center">
              <Badge variant="default" className="mb-4 text-lg py-1 px-4 rounded-full">Job Preparation</Badge>
              <h2 id="job-prep-heading" className="font-headline text-3xl font-bold mb-8">{language === 'bn' ? 'সরকারি চাকরির সর্বোচ্চ প্রস্তুতি' : 'Ultimate Preparation for Government Jobs'}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {jobCourses.map(course => <CourseCard key={course.id} {...course} />)}
              </div>
               <Button asChild variant="accent" size="lg" className="mt-12 font-bold">
                <Link href="/courses?category=Job+Prep">{language === 'bn' ? 'সকল কোর্স দেখুন' : 'See All Courses'}</Link>
              </Button>
          </div>
      </section>

      <section className="bg-secondary/50" aria-labelledby="why-choose-us-heading">
        <div className="container mx-auto px-4">
          <h2 id="why-choose-us-heading" className="font-headline text-3xl font-bold text-center mb-12">
            {homepageConfig.whyChooseUs.title[language]}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {homepageConfig.whyChooseUs.features.map((feature, index) => (
              <div key={index} className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="mb-4 flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
                  <WhyChooseUsIcon icon={iconMap[feature.icon] || Trophy} />
                </div>
                <h3 className="font-headline text-xl font-semibold mb-2">{feature.title[language]}</h3>
                <p className="text-muted-foreground">{feature.description[language]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="collaborations-heading">
        <div className="container mx-auto px-4">
          <h2 id="collaborations-heading" className="font-headline text-3xl font-bold text-center mb-12">
            {homepageConfig.collaborations.title[language]}
          </h2>
          <CollaborationsCarousel items={homepageConfig.collaborations.items} />
        </div>
      </section>

      <section className="bg-secondary/30" aria-labelledby="social-media-heading">
        <div className="container mx-auto px-4 text-center">
          <h2 id="social-media-heading" className="font-headline text-3xl font-bold mb-2">
            {homepageConfig.socialMediaSection.title[language]}
          </h2>
          <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
            {homepageConfig.socialMediaSection.description[language]}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {homepageConfig.socialMediaSection.channels.map((channel) => (
              <Card key={channel.id} className="text-center p-6 flex flex-col items-center justify-between shadow-lg hover:shadow-xl transition-shadow bg-card">
                <CardHeader className="p-0">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", channel.platform === 'YouTube' ? 'bg-red-600' : 'bg-blue-600')}>
                      <SocialIcon platform={channel.platform} />
                    </div>
                    <CardTitle className="text-lg">{typeof channel.name === 'object' ? channel.name[language] : channel.name}</CardTitle>
                  </div>
                  <CardDescription>{channel.handle}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4 pt-4">
                  <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                    {channel.stat1_value && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{channel.stat1_value} {typeof channel.stat1_label === 'object' ? channel.stat1_label[language] : channel.stat1_label}</span>
                      </div>
                    )}
                    {channel.stat2_value && (
                       <div className="flex items-center gap-1">
                        {channel.platform === 'YouTube' ? <Video className="w-4 h-4" /> : <ThumbsUp className="w-4 h-4" />}
                        <span>{channel.stat2_value} {typeof channel.stat2_label === 'object' ? channel.stat2_label[language] : channel.stat2_label}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{typeof channel.description === 'object' ? channel.description[language] : channel.description}</p>
                </CardContent>
                <CardFooter className="p-0 w-full">
                  <Button asChild className="w-full" style={{ backgroundColor: channel.platform === 'YouTube' ? '#FF0000' : '#1877F2', color: 'white' }}>
                    <Link href={channel.ctaUrl} target="_blank" rel="noopener noreferrer">
                      <span className="ml-2">{typeof channel.ctaText === 'object' ? channel.ctaText[language] : channel.ctaText}</span>
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/50" aria-labelledby="notes-banner-heading">
        <div className="container mx-auto px-4">
          <Card className="shadow-lg">
            <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className='text-center md:text-left'>
                    <h3 id="notes-banner-heading" className="font-headline text-2xl font-bold text-card-foreground">{homepageConfig.notesBanner.title[language]}</h3>
                    <p className="text-muted-foreground mt-2">{homepageConfig.notesBanner.description[language]}</p>
                </div>
                <Button variant="accent" size="lg" className="font-bold shrink-0">{homepageConfig.notesBanner.buttonText[language]}</Button>
            </div>
          </Card>
        </div>
      </section>

      <section className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground" aria-labelledby="stats-heading">
        <div className="container mx-auto px-4 text-center">
            <h2 id="stats-heading" className="font-headline text-3xl font-bold mb-8">{homepageConfig.statsSectionTitle[language]}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {homepageConfig.stats.map((stat, index) => (
                    <div key={index} className="text-center bg-white/10 rounded-lg p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/20">
                        <p className="font-headline text-5xl font-bold">{stat.value}</p>
                        <p className="mt-2 text-lg opacity-90">{stat.label[language]}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      <section aria-labelledby="app-promo-heading">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
              <div className="text-center md:text-left">
                <h2 id="app-promo-heading" className="font-headline text-4xl font-bold">{homepageConfig.appPromo.title[language]}</h2>
                <p className="mt-4 text-lg text-muted-foreground">{homepageConfig.appPromo.description[language]}</p>
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
