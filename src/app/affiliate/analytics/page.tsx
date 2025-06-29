
'use client';

import { DollarSign, BarChart, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, CartesianGrid, Pie, PieChart as RechartsPieChart, Cell } from "recharts"


const salesData = [
  { month: 'Jan', clicks: 4000, signups: 2400 },
  { month: 'Feb', clicks: 3000, signups: 1398 },
  { month: 'Mar', clicks: 2000, signups: 9800 },
  { month: 'Apr', clicks: 2780, signups: 3908 },
  { month: 'May', clicks: 1890, signups: 4800 },
  { month: 'Jun', clicks: 2390, signups: 3800 },
];

const trafficSourceData = [
    { name: 'Facebook', value: 400, fill: 'hsl(var(--chart-1))' },
    { name: 'YouTube', value: 300, fill: 'hsl(var(--chart-2))' },
    { name: 'Direct', value: 200, fill: 'hsl(var(--chart-3))' },
    { name: 'Blog', value: 100, fill: 'hsl(var(--chart-4))' },
];

const chartConfig = {
  clicks: {
    label: "Clicks",
    color: "hsl(var(--chart-1))",
  },
  signups: {
    label: "Sign-ups",
    color: "hsl(var(--chart-2))",
  },
}

export default function AffiliateAnalyticsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Referral Analytics
        </h1>
        <p className="mt-1 text-lg text-muted-foreground">
          Track the performance of your referral links.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Clicks & Sign-ups Over Time</CardTitle>
            <CardDescription>Performance in the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <RechartsBarChart data={salesData} accessibilityLayer>
                 <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="clicks" fill="var(--color-clicks)" radius={4} />
                <Bar dataKey="signups" fill="var(--color-signups)" radius={4} />
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Traffic Sources</CardTitle>
            <CardDescription>Where your sign-ups are coming from.</CardDescription>
          </CardHeader>
           <CardContent className="flex items-center justify-center">
            <ChartContainer config={{}} className="h-[300px] w-full max-w-sm">
                 <RechartsPieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                    <Pie data={trafficSourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120}>
                       {trafficSourceData.map((entry, index) => (
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
