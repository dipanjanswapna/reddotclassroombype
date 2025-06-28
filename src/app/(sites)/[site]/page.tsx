import { notFound } from 'next/navigation';
import { courses, organizations } from '@/lib/mock-data';
import { CourseCard } from '@/components/course-card';
import { Metadata } from 'next';

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
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight">Welcome to {partner.name}</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Explore our collection of high-quality courses.
        </p>
      </div>
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
  );
}
