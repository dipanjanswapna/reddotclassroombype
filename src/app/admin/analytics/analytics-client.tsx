
'use client';

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Cpu, MemoryStick, Monitor, Users, Search, BarChartHorizontal, Wind, Gauge as GaugeIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';

const Gauge = dynamic(() => import('@/components/gauge').then(mod => mod.Gauge), {
    loading: () => <Skeleton className="h-36 w-36 rounded-full" />,
    ssr: false,
});

const generateInitialTrafficData = () => {
  const data = [];
  for (let i = 10; i >= 0; i--) {
    data.push({
      time: `${i * 5}s ago`,
      visitors: 0,
    });
  }
  return data;
};

const speedInsightData = [
    { name: 'FCP', value: 1.2, unit: 's' },
    { name: 'LCP', value: 2.5, unit: 's' },
    { name: 'CLS', value: 0.08, unit: '' },
    { name: 'TTFB', value: 0.6, unit: 's' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

export function AnalyticsClient() {
  const [realtime, setRealtime] = useState({
    visitors: 0,
    cpu: 0,
    memory: 0,
    gpu: 0,
    performance: 0,
    seo: 0,
    trafficData: generateInitialTrafficData(),
  });

  useEffect(() => {
    const updateData = () => {
        setRealtime(prev => {
            const newTrafficData = [...prev.trafficData.slice(1), {
                time: 'now',
                visitors: Math.floor(Math.random() * (20 - 5 + 1)) + 5,
            }].map((d, i) => ({ ...d, time: `${(10-i)*5}s ago`}));

            return {
                visitors: Math.floor(Math.random() * 50) + 10,
                cpu: Math.floor(Math.random() * (80 - 40 + 1)) + 40,
                memory: Math.floor(Math.random() * (70 - 30 + 1)) + 30,
                gpu: Math.floor(Math.random() * (50 - 10 + 1)) + 10,
                performance: Math.floor(Math.random() * (98 - 85 + 1)) + 85,
                seo: Math.floor(Math.random() * (95 - 80 + 1)) + 80,
                trafficData: newTrafficData,
            }
        });
    }
    updateData(); // initial call
    const interval = setInterval(updateData, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
      <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Live Visitors</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{realtime.visitors}</div>
                    <p className="text-xs text-muted-foreground">Currently on your site</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Performance</CardTitle>
                    <GaugeIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="flex justify-center items-center pt-4">
                   <Gauge value={realtime.performance} title="Score" />
                </CardContent>
              </Card>

               <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">SEO</CardTitle>
                    <Search className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="flex justify-center items-center pt-4">
                   <Gauge value={realtime.seo} title="Rank" />
                </CardContent>
              </Card>
          </div>
          
          <Card>
            <CardHeader>
                <CardTitle>Real-time Traffic</CardTitle>
                <CardDescription>Live visitor count over the last minute.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={realtime.trafficData}>
                         <defs>
                            <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} reversed={true} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 'dataMax + 5']} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}/>
                        <Area type="monotone" dataKey="visitors" stroke="hsl(var(--primary))" fill="url(#colorVisitors)" />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Resource Usage</CardTitle>
                        <CardDescription>Simulated real-time server resource usage.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2 font-medium"><Cpu className="h-4 w-4 text-muted-foreground"/>CPU</span>
                                <span className="font-mono text-muted-foreground">{realtime.cpu}%</span>
                            </div>
                            <Progress value={realtime.cpu} />
                        </div>
                         <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2 font-medium"><MemoryStick className="h-4 w-4 text-muted-foreground"/>Memory</span>
                                 <span className="font-mono text-muted-foreground">{realtime.memory}%</span>
                            </div>
                            <Progress value={realtime.memory} />
                        </div>
                         <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2 font-medium"><Monitor className="h-4 w-4 text-muted-foreground"/>GPU</span>
                                 <span className="font-mono text-muted-foreground">{realtime.gpu}%</span>
                            </div>
                            <Progress value={realtime.gpu} />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Speed Insights</CardTitle>
                        <CardDescription>Core Web Vitals from real user interactions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={speedInsightData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }} formatter={(value, name) => `${value}${speedInsightData.find(d => d.name === name)?.unit || ''}`}/>
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {speedInsightData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
          </div>
      </div>
  );
}
