
'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  BarChart,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCourses, getOrganizationByUserId } from '@/lib/firebase/firestore';
import { Course } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/context/auth-context';

export default function PartnerDashboardPage() {
    const { toast } = useToast();
    const { userInfo } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userInfo) return;

        async function fetchPartnerData() {
            try {
                const organization = await getOrganizationByUserId(userInfo.uid);
                if (organization) {
                    const allCourses = await getCourses();
                    const partnerCourses = allCourses.filter(c => c.organizationId === organization.id);
                    setCourses(partnerCourses);
                } else {
                     toast({ title: 'Error', description: 'Could not find your organization details.', variant: 'destructive'});
                }
            } catch(err) {
                console.error(err);
                toast({ title: 'Error', description: 'Could not fetch dashboard data.', variant: 'destructive'});
            } finally {
                setLoading(false);
            }
        }
        fetchPartnerData();
    }, [userInfo, toast]);
    
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
            <h1 className="font-headline text-4xl font-bold tracking-tight">
            Partner Dashboard
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
            Here's an overview of your organization's performance.
            </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Total Students
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">2,150</div>
                <p className="text-xs text-muted-foreground">
                +12% from last month
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Active Courses
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{courses.length}</div>
                <p className="text-xs text-muted-foreground">
                +2 new this month
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">BDT 250,000</div>
                <p className="text-xs text-muted-foreground">
                This month's earnings
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Course Completion Rate
                </CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">82%</div>
                <p className="text-xs text-muted-foreground">
                Average across all courses
                </p>
            </CardContent>
            </Card>
        </div>
    </div>
  );
}
