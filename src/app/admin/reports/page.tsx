
import { getCourses, getUsers, getEnrollments } from '@/lib/firebase/firestore';
import { Course, User, Enrollment } from '@/lib/types';
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserGrowthChart } from '@/components/admin/user-growth-chart';
import { EnrollmentTrendsChart } from '@/components/admin/enrollment-trends-chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AreaChart, BarChart, BookOpen, Users } from 'lucide-react';
import { safeToDate } from '@/lib/utils';

export const metadata: Metadata = {
    title: 'Platform Reports',
    description: 'Detailed visual reports on user growth, course enrollments, and more.',
};

// Helper function to process data by month
const processDataByMonth = (items: (User | Enrollment)[], dateField: 'joined' | 'enrollmentDate') => {
    const monthlyData: { [key: string]: number } = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    items.forEach(item => {
        const dateValue = item[dateField as keyof typeof item];
        if (!dateValue) return;

        const date = safeToDate(dateValue);
        if (isNaN(date.getTime())) return;

        const month = date.getMonth();
        const year = date.getFullYear();
        const key = `${year}-${monthNames[month]}`;

        if (!monthlyData[key]) {
            monthlyData[key] = 0;
        }
        monthlyData[key]++;
    });

    const sortedKeys = Object.keys(monthlyData).sort((a, b) => {
        const [yearA, monthA] = a.split('-');
        const [yearB, monthB] = b.split('-');
        return new Date(`${monthA} 1, ${yearA}`).getTime() - new Date(`${monthB} 1, ${yearB}`).getTime();
    });

    return sortedKeys.map(key => ({
        name: key.split('-')[1], // Just the month name for the chart
        total: monthlyData[key],
    }));
};

export default async function ReportsPage() {
    const [courses, users, enrollments]: [Course[], User[], Enrollment[]] = await Promise.all([
        getCourses(),
        getUsers(),
        getEnrollments(),
    ]);

    // User Growth Data
    const userGrowthData = processDataByMonth(users, 'joined');

    // Enrollment Trends Data
    const enrollmentTrendsData = processDataByMonth(enrollments, 'enrollmentDate');
    
    // Top Courses by Enrollment
    const courseEnrollmentCounts = enrollments.reduce((acc, enrollment) => {
        acc[enrollment.courseId] = (acc[enrollment.courseId] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const topCourses = Object.entries(courseEnrollmentCounts)
        .map(([courseId, count]) => {
            const course = courses.find(c => c.id === courseId);
            return {
                title: course?.title || 'Unknown Course',
                enrollments: count,
            };
        })
        .sort((a, b) => b.enrollments - a.enrollments)
        .slice(0, 5);
        
    // Top teachers by student count
    const teacherStudentCounts = courses.reduce((acc, course) => {
        const studentCount = courseEnrollmentCounts[course.id!] || 0;
        if(course.instructors) {
             course.instructors.forEach(instructor => {
                if (!acc[instructor.name]) {
                    acc[instructor.name] = { name: instructor.name, students: 0 };
                }
                acc[instructor.name].students += studentCount;
            });
        }
        return acc;
    }, {} as Record<string, {name: string, students: number}>);

    const topTeachers = Object.values(teacherStudentCounts)
        .sort((a, b) => b.students - a.students)
        .slice(0, 5);


    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="mb-8">
                <h1 className="font-headline text-4xl font-bold tracking-tight">
                Platform Reports
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">
                In-depth analysis of platform performance and trends.
                </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users /> User Growth</CardTitle>
                        <CardDescription>New user sign-ups over time.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <UserGrowthChart data={userGrowthData} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BookOpen /> Enrollment Trends</CardTitle>
                        <CardDescription>New course enrollments over time.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <EnrollmentTrendsChart data={enrollmentTrendsData} />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BarChart /> Top 5 Courses by Enrollment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Course</TableHead>
                                    <TableHead className="text-right">Enrollments</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topCourses.map(course => (
                                    <TableRow key={course.title}>
                                        <TableCell className="font-medium">{course.title}</TableCell>
                                        <TableCell className="text-right font-bold">{course.enrollments}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><AreaChart /> Top 5 Teachers by Student Count</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Teacher</TableHead>
                                    <TableHead className="text-right">Total Students</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topTeachers.map(teacher => (
                                    <TableRow key={teacher.name}>
                                        <TableCell className="font-medium">{teacher.name}</TableCell>
                                        <TableCell className="text-right font-bold">{teacher.students}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
