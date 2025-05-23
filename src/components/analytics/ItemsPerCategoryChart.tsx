
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'; // Removed Legend and ResponsiveContainer as ChartContainer handles responsiveness.
import { type ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface ItemsPerCategoryChartProps {
  data: { name: string; count: number }[];
  chartConfig: ChartConfig;
}

export default function ItemsPerCategoryChart({ data, chartConfig }: ItemsPerCategoryChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Items per Category</CardTitle>
        <CardDescription>Distribution of items across different categories.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart accessibilityLayer data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false}/>
              <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'hsl(var(--muted))' }}/>
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
              {/* Legend can be added here if needed: <Legend /> */}
            </BarChart>
          </ChartContainer>
        ) : (
          <p className="text-center text-muted-foreground py-10">No category data available to display.</p>
        )}
      </CardContent>
    </Card>
  );
}
