
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
    <Card className="shadow-lg"> {/* bg-card, rounded-lg, shadow-lg */}
      <CardHeader className="p-4"> {/* padding 16px */}
        <CardTitle className="h2-style text-foreground">Sales Trends Over Time</CardTitle>
        <CardDescription className="text-muted-foreground">Approximate daily sales value based on items marked sold.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0"> {/* padding 16px */}
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[280px] w-full"> {/* Height 280px */}
            <LineChart
              accessibilityLayer
              data={data}
              margin={{ top: 5, right: 20, left: -5, bottom: 5 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))"/>
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                domain={['dataMin', 'dataMax']}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                content={<ChartTooltipContent
                            formatter={(value, name) => {
                                if (name === 'totalSales' && typeof value === 'number') {
                                    return [`$${value.toLocaleString()}`, chartConfig.totalSales.label];
                                }
                                return [value, name];
                            }}
                            labelFormatter={(label) => `Date: ${label}`}
                         />} 
                cursor={{ fill: 'hsl(var(--muted))' }}
                wrapperStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
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
