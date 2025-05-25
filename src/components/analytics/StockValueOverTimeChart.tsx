
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { type ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface StockValueOverTimeChartProps {
  data: { date: string; value: number }[];
  chartConfig: ChartConfig;
}

export default function StockValueOverTimeChart({ data, chartConfig }: StockValueOverTimeChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Value Over Time</CardTitle>
        <CardDescription>Cumulative value of inventory added (based on original price).</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart
              accessibilityLayer
              data={data}
              margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                // You might want to format the tick or add more ticks if there's a lot of data
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                domain={['dataMin', 'dataMax']} // Or set a fixed domain like [0, 'auto']
              />
              <Tooltip
                content={<ChartTooltipContent 
                            formatter={(value, name, props) => {
                                if (name === 'value' && typeof value === 'number') {
                                    return [`$${value.toLocaleString()}`, chartConfig.value.label];
                                }
                                return [value, name];
                            }}
                            labelFormatter={(label) => `Date: ${label}`}
                         />} 
                cursor={{ fill: 'hsl(var(--muted))' }}
              />
              <Line
                dataKey="value"
                type="monotone"
                stroke="hsl(var(--primary))" // Use primary color from theme
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: "hsl(var(--background))", // Background color for dot fill
                  stroke: "hsl(var(--primary))", // Primary color for dot stroke
                  strokeWidth: 2,
                }}
                activeDot={{
                    r: 6,
                    fill: "hsl(var(--background))",
                    stroke: "hsl(var(--primary))",
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
