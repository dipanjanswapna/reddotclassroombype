

'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlannerTask } from '@/lib/types';
import { format, subDays } from 'date-fns';
import { ProgressChart } from './progress-chart';
import { CheckCircle, Clock, Trophy } from 'lucide-react';

interface AnalyticsViewProps {
  tasks: PlannerTask[];
}

export function AnalyticsView({ tasks }: AnalyticsViewProps) {

  const analyticsData = useMemo(() => {
    const completedTasks = tasks.filter(t => t.status === 'completed' && t.completedAt);
    const last7Days = Array(7).fill(0).map((_, i) => subDays(new Date(), i)).reverse();

    const chartData = last7Days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const tasksOnDay = completedTasks.filter(t => format(new Date(t.completedAt!.toDate()), 'yyyy-MM-dd') === dateStr);
      return {
        name: format(date, 'EEE'),
        tasks: tasksOnDay.length,
        minutes: Math.round(tasksOnDay.reduce((sum, t) => sum + (t.timeSpentSeconds || 0), 0) / 60),
      };
    });

    const totalCompleted = completedTasks.length;
    const totalMinutes = completedTasks.reduce((sum, t) => sum + (t.timeSpentSeconds || 0), 0) / 60;
    
    let mostProductiveDay = 'N/A';
    if (chartData.length > 0) {
      const topDay = chartData.reduce((max, day) => day.minutes > max.minutes ? day : max, chartData[0]);
      if (topDay.minutes > 0) {
        mostProductiveDay = topDay.name;
      }
    }
    
    return { chartData, totalCompleted, totalMinutes: Math.round(totalMinutes), mostProductiveDay };
  }, [tasks]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalCompleted}</div>
            <p className="text-xs text-muted-foreground">All-time completed tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalMinutes} min</div>
            <p className="text-xs text-muted-foreground">Tracked across all tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Productive Day</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.mostProductiveDay}</div>
            <p className="text-xs text-muted-foreground">Based on time spent in last 7 days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Progress</CardTitle>
          <CardDescription>
            Time spent on completed tasks in the last 7 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProgressChart data={analyticsData.chartData} />
        </CardContent>
      </Card>
    </div>
  );
}
