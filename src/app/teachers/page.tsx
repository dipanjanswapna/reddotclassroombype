
import { getInstructors } from '@/lib/firebase/firestore';
import type { Instructor } from '@/lib/types';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'RDC Star Teachers',
  description: 'Meet our team of expert instructors at Red Dot Classroom. Learn from the best to achieve your academic and professional goals.',
};

export default async function AllTeachersPage() {
  const allInstructors = await getInstructors();
  const approvedInstructors = allInstructors.filter(
    (instructor) => instructor.status === 'Approved'
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight">Meet Our Star Teachers</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Learn from the best. Our instructors are experts in their fields, dedicated to your success.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {approvedInstructors.map((teacher) => (
          <Link key={teacher.id} href={`/teachers/${teacher.slug}`} className="group block">
            <Card className="overflow-hidden relative aspect-[4/5] rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <Image
                src={teacher.avatarUrl}
                alt={teacher.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={teacher.dataAiHint}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" aria-hidden="true" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-semibold text-lg">{teacher.name}</h3>
                <p className="text-sm text-white/80">{teacher.title}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
