
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { type ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface ProfitByCategoryChartProps {
  data: { name: string; profit: number }[];
  chartConfig: ChartConfig;
}

export default function ProfitByCategoryChart({ data, chartConfig }: ProfitByCategoryChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimated Profit by Category</CardTitle>
        <CardDescription>Distribution of estimated profit from sold items across categories.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart 
                accessibilityLayer 
                data={data} 
                margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                layout="vertical" // For better readability of category names
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `$${value.toLocaleString()}`} />
              <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={8} width={100} />
              <Tooltip 
                content={<ChartTooltipContent 
                            formatter={(value, name, props) => {
                                if (name === 'profit' && typeof value === 'number') {
                                    return [`$${value.toFixed(2)}`, chartConfig.profit.label || 'Est. Profit'];
                                }
                                return [value, name];
                            }}
                            labelFormatter={(label) => `Category: ${label}`}
                         />} 
                cursor={{ fill: 'hsl(var(--muted))' }}
              />
              <Bar dataKey="profit" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        ) : (
          <p className="text-center text-muted-foreground py-10">No profit data available to display.</p>
        )}
      </CardContent>
    </Card>
  );
}
