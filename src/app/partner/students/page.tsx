
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getCourses, getUsers } from '@/lib/firebase/firestore';
import type { User, Course } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/loading-spinner';

type StudentDisplayInfo = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  enrolledCourse: string;
  progress: number;
};

const partnerId = 'org_medishark';

export default function PartnerStudentsPage() {
  const { toast } = useToast();
  const [students, setStudents] = useState<StudentDisplayInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const getPartnerStudents = async () => {
        try {
            const [allCourses, allUsers] = await Promise.all([
                getCourses(),
                getUsers()
            ]);

            const partnerCourses = allCourses.filter(c => c.organizationId === partnerId);
            const studentCourseMap = new Map<string, { courseTitle: string, progress: number }[]>();

            partnerCourses.forEach(course => {
                course.assignments?.forEach(assignment => {
                    if (!studentCourseMap.has(assignment.studentId)) {
                        studentCourseMap.set(assignment.studentId, []);
                    }
                    const studentCourses = studentCourseMap.get(assignment.studentId)!;
                    if (!studentCourses.some(c => c.courseTitle === course.title)) {
                        studentCourses.push({
                            courseTitle: course.title,
                            progress: Math.floor(Math.random() * 80) + 20 // Mock progress
                        });
                    }
                });
            });

            const partnerStudents: StudentDisplayInfo[] = [];
            studentCourseMap.forEach((courseData, studentId) => {
                const studentInfo = allUsers.find(s => s.id === studentId);
                if (studentInfo) {
                    courseData.forEach(cd => {
                        partnerStudents.push({
                            id: `${studentInfo.id}-${cd.courseTitle.replace(/\s/g, '-')}`,
                            name: studentInfo.name,
                            email: studentInfo.email,
                            avatar: 'https://placehold.co/100x100.png',
                            enrolledCourse: cd.courseTitle,
                            progress: cd.progress
                        });
                    });
                }
            });
            setStudents(partnerStudents);

        } catch (error) {
            console.error("Failed to fetch students:", error);
            toast({ title: 'Error', description: 'Failed to fetch student data.', variant: 'destructive'});
        } finally {
            setLoading(false);
        }
    };
    getPartnerStudents();
  }, [toast]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            My Students
          </h1>
          <p className="mt-1 text-lg text-muted-foreground">
            View all students enrolled in your organization's courses.
          </p>
        </div>
         <Input 
            placeholder="Search students..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Enrolled Students</CardTitle>
          <CardDescription>A list of all students currently enrolled in your courses.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="flex items-center gap-3">
                     <Avatar className="h-9 w-9">
                        <AvatarImage src={student.avatar} alt={student.name} />
                        <AvatarFallback>{student.name.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{student.enrolledCourse}</TableCell>
                   <TableCell>{student.progress}%</TableCell>
                  <TableCell>
                    <Badge variant={student.progress > 80 ? 'accent' : 'secondary'}>
                      {student.progress > 80 ? 'Excelling' : 'In Progress'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
