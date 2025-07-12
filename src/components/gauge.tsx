
'use client';
import { Pie, PieChart, Cell, ResponsiveContainer } from 'recharts';

export const Gauge = ({ value, title }: { value: number; title: string }) => {
  const color = value >= 90 ? 'hsl(var(--chart-2))' : value >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))';

  const data = [
    { name: 'Score', value: value, fill: color },
    { name: 'Remaining', value: 100 - value, fill: 'hsl(var(--muted))' },
  ];

  return (
    <div className="relative w-36 h-36">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={-180}
            innerRadius="80%"
            outerRadius="100%"
            dataKey="value"
            stroke="none"
            cornerRadius={5}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color: color }}>{value}</span>
        <span className="text-sm font-medium text-muted-foreground mt-1">{title}</span>
      </div>
    </div>
  );
};
