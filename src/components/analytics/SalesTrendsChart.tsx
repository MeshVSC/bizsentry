
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { type ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface SalesTrendsChartProps {
  data: { date: string; totalSales: number }[];
  chartConfig: ChartConfig;
}

export default function SalesTrendsChart({ data, chartConfig }: SalesTrendsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Trends Over Time</CardTitle>
        <CardDescription>Approximate daily sales value based on items marked sold.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart
              accessibilityLayer
              data={data}
              margin={{ top: 5, right: 20, left: -5, bottom: 5 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                domain={['dataMin', 'dataMax']}
              />
              <Tooltip
                content={<ChartTooltipContent 
                            formatter={(value, name, props) => {
                                if (name === 'totalSales' && typeof value === 'number') {
                                    return [`$${value.toLocaleString()}`, chartConfig.totalSales.label];
                                }
                                return [value, name];
                            }}
                            labelFormatter={(label) => `Date: ${label}`}
                         />} 
                cursor={{ fill: 'hsl(var(--muted))' }}
              />
              <Line
                dataKey="totalSales"
                type="monotone"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: "hsl(var(--background))", 
                  stroke: "hsl(var(--chart-3))", 
                  strokeWidth: 2,
                }}
                activeDot={{
                    r: 6,
                    fill: "hsl(var(--background))",
                    stroke: "hsl(var(--chart-3))",
                }}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <p className="text-center text-muted-foreground py-10">No sales data available to display.</p>
        )}
      </CardContent>
    </Card>
  );
}
