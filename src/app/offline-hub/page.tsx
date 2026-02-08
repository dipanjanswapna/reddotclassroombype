import type { Metadata } from 'next';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { getHomepageConfig, getCourses, getBranches, getOrganizations } from '@/lib/firebase/firestore';
import { ArrowRight, CheckCircle, MapPin, Phone, MessageSquare, Building2, Globe } from 'lucide-react';
import Link from 'next/link';
import { CourseCard } from '@/components/course-card';
import { Course } from '@/lib/types';
import { OfflineHubCarousel } from '@/components/offline-hub-carousel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'RDC OFFLINE HUB',
  description: 'Welcome to the Red Dot Classroom Offline Hub. Find our centers, facilities, and upcoming events.',
};

export default async function OfflineHubPage() {
    const [homepageConfig, allCourses, allBranches, allOrgs] = await Promise.all([
        getHomepageConfig(),
        getCourses({ status: 'Published' }),
        getBranches(),
        getOrganizations(),
    ]);
    
    const language = 'en';
    const offlineHubData = homepageConfig?.offlineHubSection;
    const offlineCourses = allCourses.filter(c => c.type === 'Offline' || c.type === 'Hybrid');

    if (!offlineHubData || !offlineHubData.display) {
        return (
            <div className="flex h-screen items-center justify-center bg-background text-foreground">
                <p>Offline hub is currently not available. Please check back later.</p>
            </div>
        );
    }

  return (
    <div className="bg-background min-h-screen text-foreground pb-20">
      {/* Dynamic Hero Carousel */}
      {homepageConfig?.offlineHubHeroCarousel?.display && (
        <div className="bg-background">
            <OfflineHubCarousel slides={homepageConfig.offlineHubHeroCarousel.slides} />
        </div>
      )}

      {/* Static Hero Section */}
      <div className="relative overflow-hidden border-b">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 via-transparent to-transparent z-0 opacity-50 blur-3xl"></div>
          <div className="container mx-auto px-4 py-10 md:py-14 relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6 text-center lg:text-left">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs tracking-widest uppercase mb-2">
                          <Globe className="w-4 h-4" />
                          Bridging the Gap: Online to Offline
                      </div>
                      <h1 className="font-headline text-3xl md:text-5xl font-black tracking-tight leading-tight">
                          RDC <span className="text-primary">Offline Hub</span>
                      </h1>
                      <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
                         With 9 years of experience teaching millions of students online, we are now bringing the best classroom experience to your neighborhood. Learn directly from the top educators in state-of-the-art multimedia classrooms.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                          <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-black px-10 h-14 rounded-2xl shadow-xl transition-all">
                              Book a Free Class
                          </Button>
                          <Button variant="outline" size="lg" className="bg-background border-primary/20 hover:bg-accent text-foreground font-bold h-14 rounded-2xl px-10">
                              Explore Centers
                          </Button>
                      </div>
                  </div>
                  <div className="hidden lg:flex justify-center relative">
                      <div className="absolute inset-0 bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
                      <div className="relative w-full max-w-lg aspect-[4/3] rounded-[2.5rem] border-4 border-primary/10 p-3 shadow-2xl bg-card backdrop-blur-md overflow-hidden transform rotate-2">
                           <Image
                              src="https://picsum.photos/seed/offline/800/600"
                              alt="Modern RDC Offline Classroom"
                              fill
                              className="object-cover rounded-[2rem]"
                              data-ai-hint="modern classroom"
                          />
                      </div>
                  </div>
              </div>
          </div>
      </div>
      
      {/* Offline Programs Grid */}
      {offlineCourses.length > 0 && (
        <section className="container mx-auto px-4 py-10 md:py-14">
          <div className="text-center mb-12 space-y-2">
            <h2 className="font-headline text-2xl md:text-4xl font-black tracking-tight text-green-700 dark:text-green-500">
              {offlineHubData.programsTitle?.[language] || "Our Programs"}
            </h2>
            <div className="h-1 w-16 bg-primary mx-auto rounded-full shadow-md" />
            <p className="text-muted-foreground max-w-2xl mx-auto pt-2 text-sm md:text-base">Selected academic batches designed for the best results through face-to-face learning.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {offlineCourses.map((program: Course) => {
                const provider = allOrgs.find(o => o.id === program.organizationId);
                return (
                    <CourseCard 
                        key={program.id} 
                        {...program} 
                        provider={provider} 
                    />
                );
            })}
          </div>
        </section>
      )}

      {/* Offline Hubs/Centers Section */}
      <section className="bg-muted/30 py-10 md:py-14 border-y">
        <div className="container mx-auto px-4">
            <div className="text-center mb-12 space-y-2">
                <h2 className="font-headline text-2xl md:text-4xl font-black tracking-tight text-green-700 dark:text-green-500">
                    {offlineHubData.centersTitle[language] || "Our Offline Hubs"}
                </h2>
                <div className="h-1 w-16 bg-primary mx-auto rounded-full shadow-md" />
                <p className="text-muted-foreground max-w-2xl mx-auto pt-2 text-sm md:text-base">Find an RDC center near you and join our community of learners.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {allBranches.map((center) => (
                    <Card key={center.id} className="bg-card border-primary/10 hover:border-primary/40 transition-all duration-500 group shadow-xl rounded-3xl overflow-hidden">
                        <div className="h-40 bg-muted relative overflow-hidden">
                            <Image 
                                src={`https://picsum.photos/seed/${center.id}/600/400`} 
                                alt={center.name} 
                                fill 
                                className="object-cover transition-transform duration-700 group-hover:scale-110" 
                                data-ai-hint="city branch"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            <div className="absolute bottom-4 left-6">
                                <Badge className="bg-primary hover:bg-primary font-bold border-none text-white">{center.branchCode || 'ACTIVE'}</Badge>
                            </div>
                        </div>
                        <CardHeader className="px-6 pt-6">
                            <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-3 group-hover:text-primary transition-colors">
                                <Building2 className="w-6 h-6 text-primary" />
                                {center.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-8 space-y-4">
                            <div className="flex items-start gap-3 text-muted-foreground text-sm">
                                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <p className="leading-relaxed">{center.address}</p>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground text-sm">
                                <Phone className="w-5 h-5 text-primary shrink-0" />
                                <p>{center.contactPhone}</p>
                            </div>
                            <Button asChild variant="outline" className="w-full mt-2 border-primary/20 hover:bg-primary hover:text-white rounded-xl font-bold transition-all">
                                <Link href="#" className="flex items-center justify-center gap-2">
                                    Get Directions <ArrowRight className="w-4 h-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      </section>

      {/* Modern Contact Section */}
      {offlineHubData.contactSection?.display && (
        <section className="container mx-auto px-4 py-10 md:py-14">
            <div className="bg-gradient-to-br from-primary via-red-700 to-black rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 text-center relative overflow-hidden shadow-2xl border border-white/10 group">
                <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mt-48 blur-[80px]"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full -mr-48 -mb-48 blur-[80px]"></div>
                
                <div className="relative z-10 space-y-6">
                    <div className="inline-flex p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl group-hover:scale-110 transition-transform">
                        <MessageSquare className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="font-headline text-2xl md:text-4xl font-black text-white leading-tight">
                        {offlineHubData.contactSection.title[language] || "Ready to Join?"}
                    </h2>
                    <p className="text-base md:text-xl text-red-100 max-w-2xl mx-auto leading-relaxed">
                        {offlineHubData.contactSection.subtitle[language] || "Talk to our student advisors anytime to find the perfect batch for you."}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Button asChild size="lg" className="bg-white hover:bg-red-50 text-primary font-black text-base md:text-lg h-14 px-8 rounded-xl shadow-2xl w-full sm:w-auto transition-all active:scale-95">
                            <a href={`tel:${offlineHubData.contactSection.callButtonNumber}`} className="flex items-center gap-3">
                                <Phone className="w-5 h-5" />
                                {offlineHubData.contactSection.callButtonText[language]}
                            </a>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="bg-transparent border-white/30 hover:bg-white/10 text-white font-black text-base md:text-lg h-14 px-8 rounded-xl w-full sm:w-auto transition-all">
                            <a href={`https://wa.me/${offlineHubData.contactSection.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                                <MessageSquare className="w-5 h-5" />
                                WhatsApp Us
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
      )}
    </div>
  );
}
