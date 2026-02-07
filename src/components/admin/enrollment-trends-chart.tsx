'use client';

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

interface ChartProps {
  data: { name: string; total: number }[];
}

export default function EnrollmentTrendsChart({ data }: ChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="w-full h-[350px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
          <XAxis
            dataKey="name"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              borderColor: 'hsl(var(--border))',
              borderRadius: 'var(--radius)',
            }}
          />
          <Area 
            type="monotone" 
            dataKey="total" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorTotal)" 
            isAnimationActive={true}
            animationDuration={1800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
