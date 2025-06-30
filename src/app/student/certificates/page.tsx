

'use client';

import { Award, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCourses, getOrganizations } from '@/lib/firebase/firestore';
import type { Course, Organization } from '@/lib/types';
import Image from 'next/image';
import { RdcLogo } from '@/components/rdc-logo';
import { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';

// Mock student ID
const currentStudentId = 'usr_stud_001';

export default function CertificatesPage() {
  const [completedCourses, setCompletedCourses] = useState<Course[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompletedCourses() {
        try {
            const [allCourses, allOrgs] = await Promise.all([
                getCourses(),
                getOrganizations()
            ]);
            setOrganizations(allOrgs);

            // Mock logic: assume a student has completed a course if they have a graded assignment with an 'A'
            const studentCompletedCourses = allCourses.filter(c => 
                c.assignments?.some(a => 
                    a.studentId === currentStudentId && a.status === 'Graded' && a.grade?.startsWith('A')
                )
            ).map((course, index) => ({
                ...course,
                studentName: 'Jubayer Ahmed', // Mock student name
                completedDate: ['May 15, 2024', 'June 01, 2024'][index % 2],
            }));
            
            setCompletedCourses(studentCompletedCourses);
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }
    fetchCompletedCourses();
  }, []);

  if (loading) {
    return (
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
            <LoadingSpinner className="w-12 h-12" />
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
            <Award className="w-10 h-10 text-primary" />
            <h1 className="font-headline text-3xl font-bold tracking-tight">My Certificates</h1>
        </div>
        <p className="mt-2 text-lg text-muted-foreground">
          You've worked hard! Here are the certificates you've earned.
        </p>
      </div>

       <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        {completedCourses.map((course: any) => {
            const partner = organizations.find(org => org.id === course.organizationId);

            return (
              <div key={course.id} className="p-1 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-card border-2 border-foreground/10 rounded-md p-6 relative aspect-[4/3] flex flex-col justify-between">
                    <div className="absolute top-0 left-0 w-24 h-24 bg-primary/5 rounded-tl-md rounded-br-full opacity-50"></div>
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-accent/5 rounded-br-md rounded-tl-full opacity-50"></div>
                    
                    <header className="flex justify-between items-start text-center relative z-10">
                        <div className="flex items-center gap-2">
                            {partner ? (
                                <Image src={partner.logoUrl} alt={partner.name} width={40} height={40} className="rounded-full bg-muted object-contain"/>
                            ) : (
                                <RdcLogo className="w-12 h-auto" />
                            )}
                        </div>
                        <div className="text-right">
                            <h2 className="font-bold text-lg">{partner ? partner.name : 'Red Dot Classroom'}</h2>
                            <p className="text-xs text-muted-foreground">Official Certificate</p>
                        </div>
                    </header>
                    
                    <main className="text-center relative z-10 py-4">
                        <p className="text-muted-foreground text-sm uppercase tracking-wider">Certificate of Completion</p>
                        <h1 className="font-headline text-4xl font-bold my-2 text-primary">{course.studentName}</h1>
                        <p className="text-muted-foreground">has successfully completed the course</p>
                        <h3 className="font-semibold text-xl mt-2">{course.title}</h3>
                    </main>

                    <footer className="flex justify-between items-end relative z-10">
                        <div className="text-left">
                            <p className="text-xs text-muted-foreground">Issued on</p>
                            <p className="font-semibold">{course.completedDate}</p>
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-lg -mb-2">{course.instructors[0].name}</p>
                            <hr />
                            <p className="text-xs text-muted-foreground">Lead Instructor</p>
                        </div>
                        <div className="text-right">
                            <Button size="sm" variant="accent">
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </Button>
                        </div>
                    </footer>
                </div>
              </div>
            )
        })}
      </div>
      
      {completedCourses.length === 0 && (
          <div className="text-center py-16 bg-muted rounded-lg">
             <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">You haven't earned any certificates yet. Complete a course to get started!</p>
          </div>
      )}

    </div>
  );
}
