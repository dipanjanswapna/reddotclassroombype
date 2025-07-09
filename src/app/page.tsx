
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
import { Badge } from '@/components/ui/badge';
import { HeroCarousel } from '@/components/hero-carousel';
import { cn, getYoutubeVideoId } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getHomepageConfig, getCoursesByIds, getInstructors, getOrganizations } from '@/lib/firebase/firestore';
import type { HomepageConfig, Course, Instructor, Organization } from '@/lib/types';
import { DynamicLiveCoursesCarousel } from '@/components/dynamic-live-courses-carousel';
import { DynamicTeachersCarousel } from '@/components/dynamic-teachers-carousel';
import { DynamicCollaborationsCarousel } from '@/components/dynamic-collaborations-carousel';
import { DynamicMasterclassCarousel } from '@/components/dynamic-masterclass-carousel';
import { PartnersLogoScroll } from '@/components/partners-logo-scroll';
import { FreeClassesSection } from '@/components/free-classes-section';
import { CategoriesCarousel } from '@/components/categories-carousel';
import { WhyTrustUs } from '@/components/why-trust-us';
import downloadAppImage from '@/public/download.jpg';

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

export default async function Home() {
  const homepageConfig = await getHomepageConfig();
  
  if (!homepageConfig) {
    return <div className="container mx-auto p-4">Homepage configuration not found. Please set it up in the admin panel.</div>;
  }

  const [
    liveCourses,
    allInstructors,
    sscHscCourses,
    masterClasses,
    admissionCourses,
    jobCourses,
    organizations
  ] = await Promise.all([
    getCoursesByIds(homepageConfig.liveCoursesIds || []),
    getInstructors(),
    getCoursesByIds(homepageConfig.sscHscCourseIds || []),
    getCoursesByIds(homepageConfig.masterClassesIds || []),
    getCoursesByIds(homepageConfig.admissionCoursesIds || []),
    getCoursesByIds(homepageConfig.jobCoursesIds || []),
    getOrganizations()
  ]);

  const featuredInstructors = allInstructors.filter(inst => inst.status === 'Approved');
  const approvedCollaborators = organizations.filter(org => org.status === 'approved');
  
  const language = 'bn'; // Default language

  return (
    <div className="bg-background">
      <HeroCarousel banners={homepageConfig.heroBanners} autoplaySettings={homepageConfig.heroCarousel} />
      
      <div className="[&>section:last-child]:pb-0">
        {homepageConfig.strugglingStudentSection?.display && (
          <section className="py-8">
              <div className="container mx-auto px-4">
                  <div className="bg-teal-50 dark:bg-teal-900/20 rounded-full p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                          <Image
                              src={homepageConfig.strugglingStudentSection.imageUrl}
                              alt="Struggling in studies illustration"
                              width={150}
                              height={100}
                              className="hidden sm:block object-contain"
                              data-ai-hint="student family studying"
                          />
                          <div>
                              <h3 className="font-headline text-xl font-bold text-gray-800 dark:text-white">
                                  {homepageConfig.strugglingStudentSection.title[language]}
                              </h3>
                              <p className="text-muted-foreground">
                                  {homepageConfig.strugglingStudentSection.subtitle[language]}
                              </p>
                          </div>
                      </div>
                      <Button asChild className="bg-teal-500 hover:bg-teal-600 font-bold shrink-0">
                          <Link href="/strugglers-studies">
                              {homepageConfig.strugglingStudentSection.buttonText[language]}
                          </Link>
                      </Button>
                  </div>
              </div>
          </section>
        )}

        {homepageConfig.categoriesSection?.display && (
          <section aria-labelledby="categories-heading">
            <div className="container mx-auto px-4">
              <h2 id="categories-heading" className="font-headline text-3xl font-bold text-center mb-10">
                {homepageConfig.categoriesSection.title[language]}
              </h2>
              <CategoriesCarousel categories={homepageConfig.categoriesSection.categories} />
            </div>
          </section>
        )}

        {homepageConfig.journeySection?.display && (
          <section className="bg-secondary/50" aria-labelledby="hero-heading">
            <div className="container mx-auto px-4">
              <h2 id="hero-heading" className="font-headline text-3xl font-bold text-center mb-4">{homepageConfig.journeySection.title[language]}</h2>
              <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">{homepageConfig.journeySection.subtitle[language]}</p>
              <div>
                <h3 className="font-headline text-2xl font-bold text-center mb-6">{homepageConfig.journeySection.courseTitle[language]}</h3>
                <DynamicLiveCoursesCarousel courses={liveCourses} />
              </div>
            </div>
          </section>
        )}

        {homepageConfig.teachersSection?.display && (
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
              <DynamicTeachersCarousel instructors={featuredInstructors} scrollSpeed={homepageConfig.teachersSection.scrollSpeed} />
            </div>
          </section>
        )}

        {homepageConfig.videoSection?.display && (
          <section aria-labelledby="video-section-heading">
            <div className="container mx-auto px-4 text-center">
                <h2 id="video-section-heading" className="font-headline text-3xl font-bold mb-2">{homepageConfig.videoSection.title[language]}</h2>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">{homepageConfig.videoSection.description[language]}</p>
                <div className="grid md:grid-cols-2 gap-8">
                    {homepageConfig.videoSection.videos.map((video, index) => {
                      const videoId = getYoutubeVideoId(video.videoUrl);
                      const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'https://placehold.co/600x400.png?text=Invalid+URL';
                      
                      return (
                          <a key={index} href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="relative rounded-lg overflow-hidden group shadow-lg block">
                              <Image src={thumbnailUrl} alt={video.title} width={600} height={400} className="w-full transition-transform duration-300 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <PlayCircle className="w-16 h-16 text-white/80 group-hover:text-white transition-colors cursor-pointer"/>
                              </div>
                          </a>
                      );
                    })}
                </div>
                <Button asChild variant="accent" size="lg" className="mt-12 font-bold">
                  <Link href="/courses">{homepageConfig.videoSection.buttonText[language]}</Link>
                </Button>
            </div>
          </section>
        )}

        {homepageConfig.sscHscSection?.display && (
          <section className="bg-secondary/50" aria-labelledby="ssc-hsc-heading">
              <div className="container mx-auto px-4 text-center">
                  <Badge variant="default" className="mb-4 text-lg py-1 px-4 rounded-full">{homepageConfig.sscHscSection.badge[language]}</Badge>
                  <h2 id="ssc-hsc-heading" className="font-headline text-3xl font-bold mb-8">{homepageConfig.sscHscSection.title[language]}</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                      {sscHscCourses.map(course => <CourseCard key={course.id} {...course} />)}
                  </div>
              </div>
          </section>
        )}

        {homepageConfig.masterclassSection?.display && (
          <section aria-labelledby="masterclass-heading">
              <div className="container mx-auto px-4 text-center">
                  <h2 id="masterclass-heading" className="font-headline text-3xl font-bold mb-8">{homepageConfig.masterclassSection.title[language]}</h2>
                  <DynamicMasterclassCarousel courses={masterClasses} />
                  <Button asChild variant="accent" size="lg" className="mt-12 font-bold">
                    <Link href="/courses?category=মাস্টার কোর্স">{homepageConfig.masterclassSection.buttonText[language]}</Link>
                  </Button>
              </div>
          </section>
        )}

        {homepageConfig.admissionSection?.display && (
          <section className="bg-secondary/50" aria-labelledby="admission-heading">
              <div className="container mx-auto px-4 text-center">
                  <Badge variant="default" className="mb-4 text-lg py-1 px-4 rounded-full">{homepageConfig.admissionSection.badge[language]}</Badge>
                  <h2 id="admission-heading" className="font-headline text-3xl font-bold mb-8">{homepageConfig.admissionSection.title[language]}</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                      {admissionCourses.map(course => <CourseCard key={course.id} {...course} />)}
                  </div>
                  <Button asChild variant="accent" size="lg" className="mt-12 font-bold">
                    <Link href="/courses?category=Admission">{homepageConfig.admissionSection.buttonText[language]}</Link>
                  </Button>
              </div>
          </section>
        )}
        
        {homepageConfig.jobPrepSection?.display && (
          <section aria-labelledby="job-prep-heading">
              <div className="container mx-auto px-4 text-center">
                  <Badge variant="default" className="mb-4 text-lg py-1 px-4 rounded-full">{homepageConfig.jobPrepSection.badge[language]}</Badge>
                  <h2 id="job-prep-heading" className="font-headline text-3xl font-bold mb-8">{homepageConfig.jobPrepSection.title[language]}</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                      {jobCourses.map(course => <CourseCard key={course.id} {...course} />)}
                  </div>
                  <Button asChild variant="accent" size="lg" className="mt-12 font-bold">
                    <Link href="/courses?category=Job+Prep">{homepageConfig.jobPrepSection.buttonText[language]}</Link>
                  </Button>
              </div>
          </section>
        )}

        {homepageConfig.freeClassesSection?.display && (
          <section className="bg-background py-16" aria-labelledby="free-classes-heading">
            <FreeClassesSection sectionData={homepageConfig.freeClassesSection} />
          </section>
        )}

        {homepageConfig.whyChooseUs?.display && (
          <WhyTrustUs data={homepageConfig.whyChooseUs} />
        )}

        {homepageConfig.collaborations?.display && approvedCollaborators.length > 0 && (
          <section aria-labelledby="collaborations-heading">
            <div className="container mx-auto px-4">
              <h2 id="collaborations-heading" className="font-headline text-3xl font-bold text-center mb-12">
                {homepageConfig.collaborations.title[language]}
              </h2>
              <DynamicCollaborationsCarousel organizations={approvedCollaborators} />
            </div>
          </section>
        )}
        
        {homepageConfig.partnersSection?.display && (
          <section aria-labelledby="partners-heading">
            <div className="container mx-auto px-4">
              <h2 id="partners-heading" className="font-headline text-3xl font-bold text-center mb-12">
                {homepageConfig.partnersSection.title[language]}
              </h2>
              <PartnersLogoScroll 
                partners={homepageConfig.partnersSection.partners}
                scrollSpeed={homepageConfig.partnersSection.scrollSpeed}
              />
            </div>
          </section>
        )}


        {homepageConfig.socialMediaSection?.display && (
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
        )}

        {homepageConfig.notesBanner?.display && (
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
        )}

        {homepageConfig.statsSection?.display && (
          <section className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground" aria-labelledby="stats-heading">
            <div className="container mx-auto px-4 text-center">
                <h2 id="stats-heading" className="font-headline text-3xl font-bold mb-8">{homepageConfig.statsSection.title[language]}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {homepageConfig.statsSection.stats.map((stat, index) => (
                        <div key={index} className="text-center bg-white/10 rounded-lg p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/20">
                            <p className="font-headline text-5xl font-bold">{stat.value}</p>
                            <p className="mt-2 text-lg opacity-90">{stat.label[language]}</p>
                        </div>
                    ))}
                </div>
            </div>
          </section>
        )}

        {homepageConfig.appPromo?.display && (
          <section aria-labelledby="app-promo-heading">
              <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                  <div className="text-center md:text-left">
                    <h2 id="app-promo-heading" className="font-headline text-4xl font-bold text-[rgb(242,0,0)]">{homepageConfig.appPromo.title[language]}</h2>
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
                      <Image src={downloadAppImage} width={350} height={500} alt="RDC App" className='object-contain' placeholder="blur" />
                  </div>
              </div>
          </section>
        )}
      </div>
    </div>
  );
}
