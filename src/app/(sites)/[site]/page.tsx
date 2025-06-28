import { notFound } from 'next/navigation';
import { courses, organizations } from '@/lib/mock-data';
import { CourseCard } from '@/components/course-card';
import { Metadata } from 'next';
import Image from 'next/image';

const getPartner = (slug: string) => {
  return organizations.find(org => org.subdomain === slug);
};

export async function generateMetadata({ params }: { params: { site: string } }): Promise<Metadata> {
  const partner = getPartner(params.site);

  if (!partner) {
    return {
      title: 'Partner Not Found',
    };
  }

  return {
    title: `Courses by ${partner.name}`,
    description: `Explore all courses offered by ${partner.name} on the RDC platform.`,
  };
}


export default function PartnerSitePage({ params }: { params: { site: string } }) {
  const partner = getPartner(params.site);

  if (!partner) {
    notFound();
  }

  const partnerCourses = courses.filter(c => c.organizationId === partner.id && c.status === 'Published');

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
              <CourseCard key={course.id} {...course} />
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
