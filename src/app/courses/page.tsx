import { CourseCard } from '@/components/course-card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

const courses = [
  {
    id: '1',
    title: 'Advanced Web Development',
    instructor: 'Jubayer Ahmed',
    imageUrl: 'https://placehold.co/600x400',
    category: 'Development',
    rating: 4.8,
    reviews: 120,
    price: 'BDT 4500',
    dataAiHint: 'programming code',
  },
  {
    id: '2',
    title: 'IELTS Preparation Course',
    instructor: 'Sadia Islam',
    imageUrl: 'https://placehold.co/600x400',
    category: 'Language',
    rating: 4.9,
    reviews: 250,
    price: 'BDT 3000',
    dataAiHint: 'lecture notes',
  },
  {
    id: '3',
    title: 'University Admission Test Prep',
    instructor: 'Raihan Chowdhury',
    imageUrl: 'https://placehold.co/600x400',
    category: 'Academic',
    rating: 4.7,
    reviews: 300,
    price: 'BDT 5000',
    dataAiHint: 'university campus',
  },
  {
    id: '4',
    title: 'Digital Marketing Fundamentals',
    instructor: 'Ayesha Khan',
    imageUrl: 'https://placehold.co/600x400',
    category: 'Marketing',
    rating: 4.8,
    reviews: 180,
    price: 'BDT 2500',
    dataAiHint: 'marketing chart',
  },
  {
    id: '5',
    title: 'Data Science with Python',
    instructor: 'Farhan Mahmud',
    imageUrl: 'https://placehold.co/600x400',
    category: 'Development',
    rating: 4.9,
    reviews: 450,
    price: 'BDT 5500',
    dataAiHint: 'data analytics',
  },
  {
    id: '6',
    title: 'Graphic Design Masterclass',
    instructor: 'Nusrat Jahan',
    imageUrl: 'https://placehold.co/600x400',
    category: 'Design',
    rating: 4.8,
    reviews: 220,
    price: 'BDT 3500',
    dataAiHint: 'design tools',
  },
];

export default function CoursesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight">Our Courses</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Find the perfect course to kickstart your learning journey.
        </p>
      </div>

      <div className="mb-8 p-4 bg-card rounded-lg flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search for courses..." className="pl-10" />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Select>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="academic">Academic</SelectItem>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="language">Language</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="design">Design</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Popularity</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {courses.map((course) => (
          <CourseCard key={course.id} {...course} />
        ))}
      </div>
    </div>
  );
}
