
import {
  Users,
  BookOpen,
  BarChart,
  DollarSign,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getCourses, getUsers, getEnrollments } from '@/lib/firebase/firestore';
import { Course, User, Enrollment } from '@/lib/types';
import { Metadata } from 'next';
import { OverviewChart } from '@/components/admin/overview-chart';
import { UserRolesChart } from '@/components/admin/user-roles-chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

export const metadata: Metadata = {
    title: 'Admin Dashboard',
    description: 'Platform-wide overview and management tools.',
};

export default async function AdminDashboardPage() {
  const [courses, users, enrollments]: [Course[], User[], Enrollment[]] = await Promise.all([
    getCourses(),
    getUsers(),
    getEnrollments(),
  ]);

  // --- Data Processing for Charts ---

  // Revenue Data (mocking monthly data)
  const revenueData = [
    { name: 'Jan', total: 0 },
    { name: 'Feb', total: 0 },
    { name: 'Mar', total: 0 },
    { name: 'Apr', total: 0 },
    { name: 'May', total: 0 },
    { name: 'Jun', total: 0 },
    { name: 'Jul', total: 0 },
    { name: 'Aug', total: 0 },
    { name: 'Sep', total: 0 },
    { name: 'Oct', total: 0 },
    { name: 'Nov', total: 0 },
    { name: 'Dec', total: 0 },
  ];
  
  let totalRevenue = 0;
  enrollments.forEach(enrollment => {
      const course = courses.find(c => c.id === enrollment.courseId);
      if(course) {
          const price = parseFloat(course.price.replace(/[^0-9.]/g, '')) || 0;
          totalRevenue += price;
          const month = enrollment.enrollmentDate.toDate().getMonth();
          revenueData[month].total += price;
      }
  });

  // User Roles Data
  const roleCounts = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const userRolesData = Object.entries(roleCounts).map(([name, value]) => ({ name, value }));

  // Recent Activity
  const recentSignups = users.sort((a,b) => (b.joined as any).toMillis() - (a.joined as any).toMillis()).slice(0, 5);
  
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="mb-8">
            <h1 className="font-headline text-4xl font-bold tracking-tight">
            Admin Dashboard
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
            Platform-wide overview and management tools.
            </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">BDT {totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All-time revenue</p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{enrollments.length}</div>
                <p className="text-xs text-muted-foreground">Across all courses</p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">All registered users</p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{courses.filter(c => c.status === 'Published').length}</div>
                <p className="text-xs text-muted-foreground">Total published courses</p>
            </CardContent>
            </Card>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-1 lg:col-span-4">
                <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                    <CardDescription>Monthly revenue generated from course enrollments.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <OverviewChart data={revenueData} />
                </CardContent>
            </Card>
             <Card className="col-span-1 lg:col-span-3">
                <CardHeader>
                    <CardTitle>User Demographics</CardTitle>
                    <CardDescription>Distribution of different user roles on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <UserRolesChart data={userRolesData} />
                </CardContent>
            </Card>
        </div>

         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity /> Recent Activity</CardTitle>
                <CardDescription>A log of the most recent user signups on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentSignups.map(user => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name} ({user.email})</TableCell>
                                <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                                <TableCell>{formatDistanceToNow((user.joined as any).toDate(), { addSuffix: true })}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
