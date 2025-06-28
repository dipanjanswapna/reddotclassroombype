
'use client';

import { useState } from 'react';
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
import { courses, mockStudents } from '@/lib/mock-data';

type Student = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  enrolledCourse: string;
  progress: number;
};

// Mocking students enrolled in courses by 'Jubayer Ahmed'
const teacherId = 'ins-ja';
const teacherCourses = courses.filter(c => c.instructors.some(i => i.id === teacherId));
const teacherCourseIds = teacherCourses.map(c => c.id);

// This is a more complex data derivation just for the demo
// In a real app, you'd fetch students for the teacher's courses
const getTeacherStudents = () => {
    const studentCourseMap = new Map<string, { courseTitle: string, progress: number }[]>();

    // Correlate students to courses they are enrolled in that this teacher teaches
    courses.forEach(course => {
        if (teacherCourseIds.includes(course.id)) {
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
        }
    });

    const teacherStudents: Student[] = [];
    studentCourseMap.forEach((courseData, studentId) => {
        const studentInfo = mockStudents.find(s => s.id === studentId);
        if (studentInfo) {
            courseData.forEach(cd => {
                teacherStudents.push({
                    id: `${studentInfo.id}-${cd.courseTitle.replace(/\s/g, '-')}`,
                    name: studentInfo.name,
                    email: studentInfo.email,
                    avatar: studentInfo.avatar,
                    enrolledCourse: cd.courseTitle,
                    progress: cd.progress
                });
            });
        }
    });
    return teacherStudents;
};


export default function TeacherStudentsPage() {
  const [students] = useState<Student[]>(getTeacherStudents());
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.enrolledCourse.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            My Students
          </h1>
          <p className="mt-1 text-lg text-muted-foreground">
            View all students enrolled in your courses.
          </p>
        </div>
         <Input 
            placeholder="Search students or courses..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enrolled Students</CardTitle>
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
              {filteredStudents.length > 0 ? filteredStudents.map((student) => (
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
              )) : (
                 <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No students found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
