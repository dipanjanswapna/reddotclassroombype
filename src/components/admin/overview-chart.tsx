'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

interface OverviewChartProps {
  data: { name: string; total: number }[];
}

export function OverviewChart({ data }: OverviewChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-[350px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
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
            tickFormatter={(value) => `৳${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              borderColor: 'hsl(var(--border))',
              borderRadius: 'var(--radius)',
            }}
            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
          />
          <Bar 
            dataKey="total" 
            fill="hsl(var(--primary))" 
            radius={[4, 4, 0, 0]} 
            isAnimationActive={true}
            animationDuration={1500}
            animationBegin={200}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
