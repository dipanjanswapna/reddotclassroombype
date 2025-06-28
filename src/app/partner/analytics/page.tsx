
'use client';

import { BarChart, LineChart, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, CartesianGrid, Line, LineChart as RechartsLineChart, Pie, PieChart as RechartsPieChart, Cell } from "recharts"


const salesData = [
  { month: 'Jan', sales: 186, revenue: 80000 },
  { month: 'Feb', sales: 305, revenue: 90000 },
  { month: 'Mar', sales: 237, revenue: 75000 },
  { month: 'Apr', sales: 273, revenue: 120000 },
  { month: 'May', sales: 209, revenue: 95000 },
  { month: 'Jun', sales: 214, revenue: 100000 },
];

const coursePerformanceData = [
    { name: 'Admission Prep', value: 400, fill: 'hsl(var(--chart-1))' },
    { name: 'HSC Course', value: 300, fill: 'hsl(var(--chart-2))' },
    { name: 'Job Skills', value: 200, fill: 'hsl(var(--chart-3))' },
    { name: 'Language', value: 100, fill: 'hsl(var(--chart-4))' },
];

const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--chart-1))",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
}

export default function PartnerAnalyticsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Analytics & Reports
        </h1>
        <p className="mt-1 text-lg text-muted-foreground">
          Track your organization's performance on the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
            <CardDescription>Number of course enrollments per month.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <RechartsBarChart data={salesData} accessibilityLayer>
                 <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Total revenue generated per month (in BDT).</CardDescription>
          </CardHeader>
           <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <RechartsLineChart data={salesData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} dot={false} />
              </RechartsLineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <Card>
          <CardHeader>
            <CardTitle>Course Performance by Category</CardTitle>
            <CardDescription>Distribution of enrollments across your main course categories.</CardDescription>
          </CardHeader>
           <CardContent className="flex items-center justify-center">
            <ChartContainer config={{}} className="h-[300px] w-full max-w-sm">
                 <RechartsPieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                    <Pie data={coursePerformanceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120}>
                       {coursePerformanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </RechartsPieChart>
            </ChartContainer>
          </CardContent>
        </Card>
    </div>
  );
}
