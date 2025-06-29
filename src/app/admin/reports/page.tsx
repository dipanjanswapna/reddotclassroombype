
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Area, Bar, Line, Pie, ResponsiveContainer, BarChart as RechartsBarChart, LineChart as RechartsLineChart, PieChart as RechartsPieChart, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import { mockUserGrowth, mockEnrollmentByCategory, mockStudentRoleDistribution, mockRevenuePayouts } from '@/lib/mock-data';

const userGrowthConfig = {
  users: { label: "New Users", color: "hsl(var(--chart-1))" },
};

const enrollmentConfig = {
  enrollments: { label: "Enrollments", color: "hsl(var(--chart-2))" },
};

const revenuePayoutsConfig = {
    revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
    payouts: { label: "Payouts", color: "hsl(var(--chart-3))" },
}

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Platform Reports</h1>
        <p className="mt-1 text-lg text-muted-foreground">
          Visualize key metrics and trends across the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>User Growth Over Time</CardTitle>
            <CardDescription>Monthly new user registrations.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={userGrowthConfig} className="h-[300px] w-full">
              <RechartsLineChart data={mockUserGrowth} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Line dataKey="users" type="monotone" stroke="var(--color-users)" strokeWidth={2} dot={true} />
              </RechartsLineChart>
            </ChartContainer>
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle>Revenue vs. Payouts</CardTitle>
            <CardDescription>Comparison of total revenue and payouts to partners/teachers.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenuePayoutsConfig} className="h-[300px] w-full">
              <RechartsLineChart data={mockRevenuePayouts} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `৳${Number(value) / 1000}k`} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line dataKey="revenue" type="monotone" stroke="var(--color-revenue)" strokeWidth={2} dot={true} />
                <Line dataKey="payouts" type="monotone" stroke="var(--color-payouts)" strokeWidth={2} dot={true} />
              </RechartsLineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Course Enrollment by Category</CardTitle>
            <CardDescription>Total student enrollments in each course category.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={enrollmentConfig} className="h-[300px] w-full">
              <RechartsBarChart data={mockEnrollmentByCategory} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid horizontal={false} />
                <YAxis dataKey="category" type="category" tickLine={false} axisLine={false} tickMargin={10} width={80} />
                <XAxis type="number" hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="enrollments" layout="vertical" fill="var(--color-enrollments)" radius={4} />
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Role Distribution</CardTitle>
            <CardDescription>The breakdown of user roles on the platform.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer config={{}} className="h-[300px] w-full max-w-sm">
              <RechartsPieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                <Pie data={mockStudentRoleDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {mockStudentRoleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                 <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </RechartsPieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
    