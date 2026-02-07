'use client';

import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface UserRolesChartProps {
  data: { name: string; value: number }[];
}

const COLORS = [
  'hsl(var(--chart-1))', 
  'hsl(var(--chart-2))', 
  'hsl(var(--chart-3))', 
  'hsl(var(--chart-4))', 
  'hsl(var(--chart-5))',
  '#1976D2',
  '#FFC107'
];

export function UserRolesChart({ data }: UserRolesChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: 'spring', damping: 12 }}
      className="w-full h-[350px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              borderColor: 'hsl(var(--border))',
              borderRadius: 'var(--radius)',
            }}
          />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            innerRadius={60}
            paddingAngle={5}
            dataKey="value"
            isAnimationActive={true}
            animationDuration={1200}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
            ))}
          </Pie>
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
