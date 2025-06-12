
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
    <Card className="shadow-lg"> {/* bg-card, rounded-lg, shadow-lg */}
      <CardHeader className="p-4"> {/* padding 16px */}
        <CardTitle className="h2-style text-foreground">Estimated Profit by Category</CardTitle>
        <CardDescription className="text-muted-foreground">Distribution of estimated profit from sold items across categories.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0"> {/* padding 16px */}
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[280px] w-full"> {/* Height 280px */}
            <BarChart 
                accessibilityLayer 
                data={data} 
                margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                layout="vertical"
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border))"/>
              <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `$${value.toLocaleString()}`} stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={8} width={100} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                content={<ChartTooltipContent
                            formatter={(value, name) => {
                                if (name === 'profit' && typeof value === 'number') {
                                    return [`$${value.toFixed(2)}`, chartConfig.profit.label || 'Est. Profit'];
                                }
                                return [value, name];
                            }}
                            labelFormatter={(label) => `Category: ${label}`}
                         />} 
                cursor={{ fill: 'hsl(var(--muted))' }}
                wrapperStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
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
