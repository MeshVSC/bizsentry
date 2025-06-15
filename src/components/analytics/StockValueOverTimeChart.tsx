
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
  const maxValue = Math.max(...data.map(item => item.value), 1);
  
  return (
    <div className="glass-card p-5 hover:bg-[#0A0A0A] hover:border-[#ff9f43]/20 hover:shadow-[0_0_15px_rgba(255,159,67,0.3)] transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold">Stock Value Over Time</h3>
        <div className="text-xs text-muted-foreground">Cumulative</div>
      </div>
      
      {data.length > 0 ? (
        <div className="relative h-[200px] w-full">
          {/* Dotted Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" className="overflow-visible">
              <defs>
                <pattern id="timeDots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="1" fill="#ff9f43" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#timeDots)" />
            </svg>
          </div>
          
          {/* Chart Area */}
          <div className="relative h-full">
            <svg width="100%" height="100%" className="overflow-visible">
              <defs>
                <linearGradient id="timeAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255, 159, 67, 0.6)" />
                  <stop offset="50%" stopColor="rgba(230, 126, 34, 0.4)" />
                  <stop offset="100%" stopColor="rgba(211, 84, 0, 0.1)" />
                </linearGradient>
              </defs>
              
              {/* Area Path */}
              <path
                d={`M 20 ${160 - (data[0]?.value || 0) / maxValue * 120} ${data.map((item, index) => 
                  `L ${40 + index * (280 / Math.max(data.length - 1, 1))} ${160 - item.value / maxValue * 120}`
                ).join(' ')} L ${40 + (data.length - 1) * (280 / Math.max(data.length - 1, 1))} 160 L 20 160 Z`}
                fill="url(#timeAreaGradient)"
                className="drop-shadow-lg"
              />
              
              {/* Line */}
              <path
                d={`M 20 ${160 - (data[0]?.value || 0) / maxValue * 120} ${data.map((item, index) => 
                  `L ${40 + index * (280 / Math.max(data.length - 1, 1))} ${160 - item.value / maxValue * 120}`
                ).join(' ')}`}
                stroke="#ff9f43"
                strokeWidth="2"
                fill="none"
                className="drop-shadow-sm"
              />
              
              {/* Data Points */}
              {data.map((item, index) => (
                <circle
                  key={item.date}
                  cx={40 + index * (280 / Math.max(data.length - 1, 1))}
                  cy={160 - item.value / maxValue * 120}
                  r="4"
                  fill="#ff9f43"
                  className="drop-shadow-md"
                  style={{filter: 'drop-shadow(0 0 6px rgba(255, 159, 67, 0.6))'}}
                />
              ))}
            </svg>
          </div>
          
          {/* Time Labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-5">
            {data.slice(0, 4).map((item, index) => (
              <div key={item.date} className="flex flex-col items-center gap-1">
                <div className="text-[10px] text-muted-foreground text-center">
                  {item.date}
                </div>
                <div className="text-[10px] font-medium text-[#ff9f43]">
                  ${item.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No stock value data available to display.</p>
        </div>
      )}
    </div>
  );
}
