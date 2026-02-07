'use client';

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

interface ChartProps {
  data: { name: string; total: number }[];
}

export default function UserGrowthChart({ data }: ChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-[350px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
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
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="hsl(var(--primary))" 
            strokeWidth={3} 
            dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
            activeDot={{ r: 8, strokeWidth: 0 }} 
            isAnimationActive={true}
            animationDuration={2000}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
