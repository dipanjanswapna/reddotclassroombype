'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Search, Library } from 'lucide-react';
import { courses } from '@/lib/mock-data';
import Link from 'next/link';

// In a real app, this would be based on the logged-in user's enrollments.
const enrolledCourseIds = ['1', '3', '4'];
const enrolledCourses = courses.filter(course => enrolledCourseIds.includes(course.id));

type Resource = {
  id: string;
  title: string;
  type: 'Lecture Sheet' | 'Notes' | 'eBook'; // Example types
  url: string;
  courseTitle: string;
  courseId: string;
};

// Flatten resources from enrolled courses
const getAllResources = (): Resource[] => {
  const resources: Resource[] = [];
  enrolledCourses.forEach(course => {
    course.syllabus?.forEach(module => {
      module.lessons.forEach(lesson => {
        if (lesson.lectureSheetUrl) {
          resources.push({
            id: `${course.id}-${lesson.id}`,
            title: lesson.title,
            type: 'Lecture Sheet',
            url: lesson.lectureSheetUrl,
            courseTitle: course.title,
            courseId: course.id,
          });
        }
      });
    });
  });
  return resources;
};

export default function ResourcesPage() {
  const [allResources] = useState(getAllResources());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');

  const filteredResources = allResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || resource.courseTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || resource.courseId === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
            <Library className="w-10 h-10 text-primary" />
            <h1 className="font-headline text-3xl font-bold tracking-tight">Resources Library</h1>
        </div>
        <p className="mt-2 text-lg text-muted-foreground">
          Find all your course materials in one place.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>All Resources</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search resources..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {enrolledCourses.map(course => (
                    <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredResources.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                        <FileText className="w-6 h-6 text-primary mt-1" />
                        <div>
                            <CardTitle className="text-lg">{resource.title}</CardTitle>
                            <CardDescription>{resource.type}</CardDescription>
                        </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                     <p className="text-sm text-muted-foreground">Course: {resource.courseTitle}</p>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full" variant="outline">
                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted rounded-lg">
                <Library className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No resources found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
