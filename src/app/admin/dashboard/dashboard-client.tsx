
'use client';

import {
  Users,
  BookOpen,
  BarChart,
  DollarSign,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Course } from '@/lib/types';
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
import { safeToDate } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { SerializableUser, SerializableEnrollment } from '@/app/admin/dashboard/page';

const OverviewChart = dynamic(() => import('@/components/admin/overview-chart').then(mod => mod.OverviewChart), {
  loading: () => <Skeleton className="h-[350px] w-full" />,
  ssr: false,
});
const UserRolesChart = dynamic(() => import('@/components/admin/user-roles-chart').then(mod => mod.UserRolesChart), {
    loading: () => <Skeleton className="h-[350px] w-full" />,
    ssr: false,
});


interface DashboardClientProps {
    courses: Course[];
    users: SerializableUser[];
    enrollments: SerializableEnrollment[];
}

export function DashboardClient({ courses, users, enrollments }: DashboardClientProps) {
    // --- Data Processing for Charts ---
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
            const enrollmentDate = safeToDate(enrollment.enrollmentDate);
            if (!isNaN(enrollmentDate.getTime())) {
              const month = enrollmentDate.getMonth();
              revenueData[month].total += price;
            }
        }
    });
  
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
    const userRolesData = Object.entries(roleCounts).map(([name, value]) => ({ name, value }));
  
    const recentSignups = [...users].sort((a, b) => safeToDate(b.joined).getTime() - safeToDate(a.joined).getTime()).slice(0, 5);

    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-[25px] border-primary/10 shadow-xl bg-gradient-to-br from-red-600 to-red-500 text-white overflow-hidden relative group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">৳{totalRevenue.toLocaleString()}</div>
                        <DollarSign className="absolute top-2 right-2 h-12 w-12 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
                    </CardContent>
                </Card>
                
                <Card className="rounded-[25px] border-primary/10 shadow-xl bg-gradient-to-br from-blue-600 to-blue-500 text-white overflow-hidden relative group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Total Enrollments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{enrollments.length}</div>
                        <BookOpen className="absolute top-2 right-2 h-12 w-12 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
                    </CardContent>
                </Card>

                <Card className="rounded-[25px] border-primary/10 shadow-xl bg-gradient-to-br from-green-600 to-green-500 text-white overflow-hidden relative group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{users.length}</div>
                        <Users className="absolute top-2 right-2 h-12 w-12 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
                    </CardContent>
                </Card>

                <Card className="rounded-[25px] border-primary/10 shadow-xl bg-gradient-to-br from-purple-600 to-purple-500 text-white overflow-hidden relative group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Active Courses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{courses.filter(c => c.status === 'Published').length}</div>
                        <BarChart className="absolute top-2 right-2 h-12 w-12 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-1 lg:col-span-4 rounded-[25px] border-primary/5 shadow-xl bg-card overflow-hidden">
                    <CardHeader className="bg-primary/5 p-5 border-b border-primary/10">
                        <CardTitle className="text-sm font-black uppercase tracking-tight">Revenue Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pl-2">
                        <OverviewChart data={revenueData} />
                    </CardContent>
                </Card>
                 <Card className="col-span-1 lg:col-span-3 rounded-[25px] border-primary/5 shadow-xl bg-card overflow-hidden">
                    <CardHeader className="bg-primary/5 p-5 border-b border-primary/10">
                        <CardTitle className="text-sm font-black uppercase tracking-tight">User Demographics</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                        <UserRolesChart data={userRolesData} />
                    </CardContent>
                </Card>
            </div>
    
             <Card className="rounded-[25px] border-primary/5 shadow-xl bg-card overflow-hidden">
                <CardHeader className="bg-primary/5 p-5 border-b border-primary/10">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        <CardTitle className="text-sm font-black uppercase tracking-tight">Recent Activity</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="border-primary/10">
                                <TableHead className="font-black uppercase tracking-widest text-[10px] px-6">User</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px]">Role</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px]">Joined</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentSignups.map(user => {
                                const joinedDate = safeToDate(user.joined);
                                return (
                                    <TableRow key={user.id} className="border-primary/10 hover:bg-primary/5 transition-colors">
                                        <TableCell className="px-6 py-4">
                                            <div className="font-bold text-sm">{user.name}</div>
                                            <div className="text-[10px] font-medium text-muted-foreground">{user.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-black text-[9px] uppercase tracking-widest px-2.5 h-5 border-primary/20 text-primary">
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-[10px] font-bold text-muted-foreground">
                                            {!isNaN(joinedDate.getTime()) ? formatDistanceToNow(joinedDate, { addSuffix: true }) : 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
