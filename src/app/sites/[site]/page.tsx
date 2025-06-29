
'use client';

import { notFound, useParams } from 'next/navigation';
import { getPartnerBySubdomain, getCourses } from '@/lib/firebase/firestore';
import { CourseCard } from '@/components/course-card';
import type { Organization, Course } from '@/lib/types';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';


export default function PartnerSitePage() {
  const params = useParams();
  const siteSlug = params.site as string;
  
  const [partner, setPartner] = useState<Organization | null>(null);
  const [partnerCourses, setPartnerCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      if (!siteSlug) return;
      const fetchPartnerData = async () => {
          try {
              const partnerData = await getPartnerBySubdomain(siteSlug);
              if (partnerData) {
                  setPartner(partnerData);
                  const allCourses = await getCourses();
                  const filteredCourses = allCourses.filter(c => c.organizationId === partnerData.id && c.status === 'Published');
                  setPartnerCourses(filteredCourses);
              }
          } catch (error) {
              console.error("Failed to fetch partner data:", error);
          } finally {
              setLoading(false);
          }
      };
      fetchPartnerData();
  }, [siteSlug]);

  if (loading) {
      return (
          <div className="flex flex-grow items-center justify-center h-full w-full p-8">
            <LoadingSpinner className="w-12 h-12" />
          </div>
      );
  }

  if (!partner) {
    notFound();
  }

  return (
    <div className="flex flex-col">
       {partner.hero && (
        <section className="relative w-full h-64 md:h-80 bg-secondary/80">
          <Image
            src={partner.hero.imageUrl}
            alt={`${partner.name} hero image`}
            fill
            className="object-cover"
            data-ai-hint={partner.hero.dataAiHint || "abstract banner"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10 flex items-end">
            <div className="container mx-auto px-4 py-8 md:py-12 text-white">
              <h1 className="font-headline text-3xl md:text-5xl font-bold tracking-tight">{partner.hero.title}</h1>
              <p className="mt-2 text-lg md:text-xl max-w-2xl">
                {partner.hero.subtitle}
              </p>
            </div>
          </div>
        </section>
      )}
    
      <div className="container mx-auto px-4 py-12">
        {!partner.hero && (
          <div className="text-center mb-12">
            <h1 className="font-headline text-4xl font-bold tracking-tight">Welcome to {partner.name}</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Explore our collection of high-quality courses.
            </p>
          </div>
        )}

        <h2 className="font-headline text-3xl font-bold mb-8">{partner.hero ? 'Our Courses' : 'Courses'}</h2>
        {partnerCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {partnerCourses.map((course) => (
              <CourseCard key={course.id} {...course} partnerSubdomain={siteSlug} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-muted rounded-lg">
            <p className="text-muted-foreground">No courses available from this provider yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
