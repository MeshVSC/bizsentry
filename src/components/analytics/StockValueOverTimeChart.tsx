
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { type ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface StockValueOverTimeChartProps {
  data: { date: string; value: number }[];
  chartConfig: ChartConfig;
  description?: string;
}

export default function StockValueOverTimeChart({ data, chartConfig, description }: StockValueOverTimeChartProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="p-4">
        <CardTitle className="h2-style text-foreground">Stock Value Over Time</CardTitle>
        <CardDescription className="text-muted-foreground">
          {description || "Cumulative value of inventory added (based on original price)."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <LineChart
              accessibilityLayer
              data={data}
              margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
                                if (name === 'value' && typeof value === 'number') {
                                    return [`$${value.toLocaleString()}`, chartConfig.value.label];
                                }
                                return [value, name];
                            }}
                            labelFormatter={(label) => `Date: ${label}`}
                         />} 
                cursor={{ fill: 'hsl(var(--muted))' }}
                wrapperStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
              />
              <Line
                dataKey="value"
                type="monotone"
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: "hsl(var(--background))", 
                  stroke: "hsl(var(--chart-2))", 
                  strokeWidth: 2,
                }}
                activeDot={{
                    r: 6,
                    fill: "hsl(var(--background))",
                    stroke: "hsl(var(--chart-2))",
                }}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <p className="text-center text-muted-foreground py-10">No stock value data available to display.</p>
        )}
      </CardContent>
    </Card>
  );
}
