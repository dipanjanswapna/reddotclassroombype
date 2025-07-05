
import { getInstructors } from '@/lib/firebase/firestore';
import type { Instructor } from '@/lib/types';
import type { Metadata } from 'next';
import { TeacherFilterPage } from '@/components/teacher-filter-page';

export const metadata: Metadata = {
  title: 'RDC Star Teachers',
  description: 'Meet our team of expert instructors at Red Dot Classroom. Learn from the best to achieve your academic and professional goals.',
};

export default async function AllTeachersPage() {
  const allInstructors = await getInstructors();
  const approvedInstructors = allInstructors.filter(
    (instructor) => instructor.status === 'Approved'
  );

  // Get unique subjects from instructor titles
  const subjects = [...new Set(approvedInstructors.map(inst => inst.title).filter(Boolean))];

  return (
    <div>
        <section className="bg-gray-900 text-white py-16">
            <div className="container mx-auto px-4 text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
                    meet our RDC star teachers
                </h1>
                <p className="mt-4 text-lg text-gray-300">
                    তোমাদের পড়াশোনাকে আরও সহজ করতে আমরা প্রস্তুত!
                </p>
            </div>
        </section>

        <TeacherFilterPage 
            instructors={approvedInstructors}
            subjects={subjects}
        />
    </div>
  );
}
