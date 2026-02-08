
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
            <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
                <p>Offline hub is currently not available. Please check back later.</p>
            </div>
        );
    }

  return (
    <div className="bg-gray-900 min-h-screen text-white pb-20">
      {/* Dynamic Hero Carousel */}
      {homepageConfig?.offlineHubHeroCarousel?.display && (
        <div className="bg-gray-950">
            <OfflineHubCarousel slides={homepageConfig.offlineHubHeroCarousel.slides} />
        </div>
      )}

      {/* Static Hero Section */}
      <div className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-900/20 via-transparent to-transparent z-0 opacity-50 blur-3xl"></div>
          <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                  <div className="space-y-8 text-center lg:text-left">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm tracking-widest uppercase mb-4 animate-in fade-in slide-in-from-left duration-700">
                          <Globe className="w-4 h-4" />
                          Bridging the Gap: Online to Offline
                      </div>
                      <h1 className="font-headline text-4xl md:text-6xl font-black tracking-tight leading-tight">
                          RDC <span className="text-red-500">Offline Hub</span>
                      </h1>
                      <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                         With 9 years of experience teaching millions of students online, we are now bringing the best classroom experience to your neighborhood. Learn directly from the top educators in state-of-the-art multimedia classrooms.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                          <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white font-black px-10 h-14 rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-all">
                              Book a Free Class
                          </Button>
                          <Button variant="outline" size="lg" className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold h-14 rounded-2xl px-10">
                              Explore Centers
                          </Button>
                      </div>
                  </div>
                  <div className="hidden lg:flex justify-center relative">
                      <div className="absolute inset-0 bg-red-500/10 rounded-full blur-[120px] animate-pulse"></div>
                      <div className="relative w-full max-w-lg aspect-[4/3] rounded-[2.5rem] border-4 border-red-500/20 p-3 shadow-2xl bg-black/40 backdrop-blur-md overflow-hidden transform rotate-2">
                           <Image
                              src="https://picsum.photos/seed/offline/800/600"
                              alt="Modern RDC Offline Classroom"
                              fill
                              className="object-cover rounded-[2rem] opacity-80"
                              data-ai-hint="modern classroom"
                          />
                      </div>
                  </div>
              </div>
          </div>
      </div>
      
      {/* Offline Programs Grid */}
      {offlineCourses.length > 0 && (
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-headline text-3xl md:text-5xl font-black tracking-tight">
              {offlineHubData.programsTitle?.[language] || "Our Programs"}
            </h2>
            <div className="h-1.5 w-24 bg-red-600 mx-auto rounded-full shadow-lg" />
            <p className="text-gray-400 max-w-2xl mx-auto">Selected academic batches designed for the best results through face-to-face learning.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {offlineCourses.map((program: Course) => {
                const provider = allOrgs.find(o => o.id === program.organizationId);
                return (
                    <CourseCard 
                        key={program.id} 
                        {...program} 
                        provider={provider} 
                        className="bg-gray-800/50 border-white/5"
                    />
                );
            })}
          </div>
        </section>
      )}

      {/* Offline Hubs/Centers Section */}
      <section className="bg-gray-950/50 py-16 md:py-24 border-y border-white/5">
        <div className="container mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
                <h2 className="font-headline text-3xl md:text-5xl font-black tracking-tight">
                    {offlineHubData.centersTitle[language] || "Our Offline Hubs"}
                </h2>
                <div className="h-1.5 w-24 bg-red-600 mx-auto rounded-full shadow-lg" />
                <p className="text-gray-400 max-w-2xl mx-auto">Find an RDC center near you and join our community of learners.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {allBranches.map((center) => (
                    <Card key={center.id} className="bg-gray-900/50 border-red-500/10 hover:border-red-500/40 transition-all duration-500 group shadow-xl rounded-3xl overflow-hidden">
                        <div className="h-40 bg-muted relative overflow-hidden">
                            <Image 
                                src={`https://picsum.photos/seed/${center.id}/600/400`} 
                                alt={center.name} 
                                fill 
                                className="object-cover opacity-50 group-hover:scale-110 transition-transform duration-700" 
                                data-ai-hint="city branch"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                            <div className="absolute bottom-4 left-6">
                                <Badge className="bg-red-600 hover:bg-red-600 font-bold border-none">{center.branchCode || 'ACTIVE'}</Badge>
                            </div>
                        </div>
                        <CardHeader className="px-6 pt-6">
                            <CardTitle className="text-2xl font-bold flex items-center gap-3 text-white group-hover:text-red-400 transition-colors">
                                <Building2 className="w-6 h-6 text-red-500" />
                                {center.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-8 space-y-4">
                            <div className="flex items-start gap-3 text-gray-400 text-sm">
                                <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <p className="leading-relaxed">{center.address}</p>
                            </div>
                            <div className="flex items-center gap-3 text-gray-400 text-sm">
                                <Phone className="w-5 h-5 text-red-500 shrink-0" />
                                <p>{center.contactPhone}</p>
                            </div>
                            <Button asChild variant="outline" className="w-full mt-4 border-red-500/20 bg-white/5 hover:bg-red-500 hover:text-white rounded-xl font-bold transition-all">
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
        <section className="container mx-auto px-4 py-16 md:py-24">
            <div className="bg-gradient-to-br from-red-600 via-red-800 to-black rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl border border-white/10 group">
                <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mt-48 blur-[80px]"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500/10 rounded-full -mr-48 -mb-48 blur-[80px]"></div>
                
                <div className="relative z-10 space-y-8">
                    <div className="inline-flex p-5 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl mb-4 group-hover:scale-110 transition-transform">
                        <MessageSquare className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="font-headline text-3xl md:text-5xl font-black text-white leading-tight">
                        {offlineHubData.contactSection.title[language] || "Ready to Join?"}
                    </h2>
                    <p className="text-lg md:text-xl text-red-100 max-w-2xl mx-auto leading-relaxed">
                        {offlineHubData.contactSection.subtitle[language] || "Talk to our student advisors anytime to find the perfect batch for you."}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                        <Button asChild size="lg" className="bg-white hover:bg-red-50 text-red-600 font-black text-lg h-16 px-12 rounded-2xl shadow-2xl w-full sm:w-auto transition-all active:scale-95">
                            <a href={`tel:${offlineHubData.contactSection.callButtonNumber}`} className="flex items-center gap-3">
                                <Phone className="w-5 h-5" />
                                {offlineHubData.contactSection.callButtonText[language]}
                            </a>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="bg-transparent border-white/30 hover:bg-white/10 text-white font-black text-lg h-16 px-12 rounded-2xl w-full sm:w-auto transition-all">
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
