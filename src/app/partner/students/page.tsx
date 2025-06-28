
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

type Student = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  enrolledCourse: string;
  progress: number;
};

const mockStudents: Student[] = [
  { id: 's1', name: 'Karim Rahman', email: 'karim@example.com', avatar: 'https://placehold.co/100x100.png', enrolledCourse: 'Admission Test Prep (Medical)', progress: 85 },
  { id: 's2', name: 'Fatima Chowdhury', email: 'fatima@example.com', avatar: 'https://placehold.co/100x100.png', enrolledCourse: 'Admission Test Prep (Medical)', progress: 92 },
  { id: 's3', name: 'Jamal Uddin', email: 'jamal@example.com', avatar: 'https://placehold.co/100x100.png', enrolledCourse: 'Admission Test Prep (Medical)', progress: 60 },
  { id: 's4', name: 'Nadia Islam', email: 'nadia@example.com', avatar: 'https://placehold.co/100x100.png', enrolledCourse: 'Admission Test Prep (Medical)', progress: 45 },
];


export default function PartnerStudentsPage() {
  const [students] = useState<Student[]>(mockStudents);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Student Management
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
