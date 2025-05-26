
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { type ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface ItemsPerCategoryChartProps {
  data: { name: string; count: number }[];
  chartConfig: ChartConfig;
}

export default function ItemsPerCategoryChart({ data, chartConfig }: ItemsPerCategoryChartProps) {
  return (
    <Card className="shadow-lg"> {/* bg-card, rounded-lg, shadow-lg from Card default + props */}
      <CardHeader className="p-4"> {/* padding 16px */}
        <CardTitle className="h2-style text-foreground">Items per Category</CardTitle> {/* Use .h2-style or ensure CardTitle is styled as H2 */}
        <CardDescription className="text-muted-foreground">Distribution of items across different categories.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0"> {/* padding 16px */}
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[280px] w-full"> {/* Height 280px */}
            <BarChart accessibilityLayer data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} stroke="hsl(var(--muted-foreground))" />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} stroke="hsl(var(--muted-foreground))"/>
              <Tooltip 
                content={<ChartTooltipContent />} 
                cursor={{ fill: 'hsl(var(--muted))' }}
                wrapperStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
              />
              <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={4} />
            </BarChart>
          </ChartContainer>
        ) : (
          <p className="text-center text-muted-foreground py-10">No category data available to display.</p>
        )}
      </CardContent>
    </Card>
  );
}
