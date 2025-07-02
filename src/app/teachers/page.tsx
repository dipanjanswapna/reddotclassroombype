
import { getInstructors } from '@/lib/firebase/firestore';
import type { Instructor } from '@/lib/types';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

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
      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {approvedInstructors.map((teacher) => (
          <Link key={teacher.id} href={`/teachers/${teacher.slug}`} className="group block">
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="relative aspect-[4/5] overflow-hidden">
                 <Image
                    src={teacher.avatarUrl}
                    alt={teacher.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={teacher.dataAiHint}
                  />
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-lg">{teacher.name}</h3>
                <p className="text-sm text-primary">{teacher.title}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
