
import { getInstructors } from '@/lib/firebase/firestore';
import type { Instructor } from '@/lib/types';
import type { Metadata } from 'next';
import { TeacherFilterPage } from '@/components/teacher-filter-page';
import { Star, Zap } from 'lucide-react';

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
    <div className="mesh-gradient min-h-screen">
        <section className="bg-gray-900 text-white py-12 md:py-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 blur-[120px] rounded-full -z-10" />
            <div className="container mx-auto px-4 text-center">
                <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-foreground px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-white/10">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    Elite Faculty
                </div>
                <h1 className="font-headline text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight uppercase max-w-4xl mx-auto">
                    meet our <span className="text-primary">RDC</span> star teachers
                </h1>
                <p className="mt-4 text-base md:text-lg text-gray-400 font-medium font-bengali">
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
