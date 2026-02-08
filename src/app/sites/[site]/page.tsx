import { notFound } from 'next/navigation';
import { getPartnerBySubdomain, getCourses, getProducts } from '@/lib/firebase/firestore';
import type { Organization, Course, Product } from '@/lib/types';
import Image from 'next/image';
import type { Metadata } from 'next';
import { CourseCard } from '@/components/course-card';
import { ProductCard } from '@/components/product-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * @fileOverview Partner Storefront.
 * Updated for Next.js 15 async params compliance and refined visual radius.
 */

export async function generateMetadata({ params }: { params: Promise<{ site: string }> }): Promise<Metadata> {
  const { site } = await params;
  const partner = await getPartnerBySubdomain(site);

  if (!partner) {
    return {
      title: 'Storefront Not Found',
    }
  }

  return {
    title: partner.name,
    description: partner.description || `The official storefront for ${partner.name} on Red Dot Classroom.`,
    openGraph: {
      title: partner.name,
      description: partner.description,
      images: [partner.logoUrl],
    },
  }
}


export default async function PartnerSitePage({ params }: { params: Promise<{ site: string }> }) {
  const { site: siteSlug } = await params;
  const partner = await getPartnerBySubdomain(siteSlug);

  if (!partner) {
    notFound();
  }

  const [allCourses, allProducts] = await Promise.all([
    getCourses(),
    getProducts(),
  ]);

  const partnerCourses = allCourses.filter(c => c.organizationId === partner.id && c.status === 'Published');
  const partnerProducts = allProducts.filter(p => p.sellerId === partner.id && p.isPublished);

  const hasCourses = partnerCourses.length > 0;
  const hasProducts = partnerProducts.length > 0;

  const defaultTab = hasCourses ? 'courses' : 'products';

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
            <p className="text-lg text-muted-foreground">
              Explore our collection of high-quality courses.
            </p>
          </div>
        )}

        <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-xl h-14 p-1">
                {hasCourses && <TabsTrigger value="courses" className="rounded-lg font-bold">Courses</TabsTrigger>}
                {hasProducts && <TabsTrigger value="products" className="rounded-lg font-bold">Store Products</TabsTrigger>}
            </TabsList>
            {hasCourses && (
                 <TabsContent value="courses" className="mt-8">
                     <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {partnerCourses.map((course) => (
                        <CourseCard key={course.id} {...course} partnerSubdomain={siteSlug} provider={partner}/>
                        ))}
                    </div>
                 </TabsContent>
            )}
             {hasProducts && (
                <TabsContent value="products" className="mt-8">
                     <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {partnerProducts.map((product) => (
                           <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </TabsContent>
             )}
        </Tabs>

        { !hasCourses && !hasProducts && (
          <div className="text-center py-16 bg-muted rounded-2xl">
            <p className="text-muted-foreground">No courses or products available from this seller yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
