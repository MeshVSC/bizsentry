
'use client';

import { type ChartConfig } from '@/components/ui/chart';

interface ProfitByCategoryChartProps {
  data: { name: string; profit: number }[];
  chartConfig?: ChartConfig;
}

export default function ProfitByCategoryChart({ data }: ProfitByCategoryChartProps) {
  const maxValue = Math.max(...data.map(item => item.profit), 1);
  
  return (
    <div className="glass-card p-5 hover:bg-[#0A0A0A] hover:border-[#ff9f43]/20 hover:shadow-[0_0_15px_rgba(255,159,67,0.3)] transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold">Profit by Category</h3>
        <div className="text-xs text-muted-foreground">Estimated</div>
      </div>
      
      {data.length > 0 ? (
        <div className="relative h-[200px] w-full">
          {/* Dotted Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" className="overflow-visible">
              <defs>
                <pattern id="profitBgDots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="1" fill="#ff9f43" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#profitBgDots)" />
            </svg>
          </div>
          
          {/* Chart Area */}
          <div className="relative h-full">
            <svg width="100%" height="100%" className="overflow-visible">
              <defs>
                <linearGradient id="profitBarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(255, 159, 67, 0.8)" />
                  <stop offset="50%" stopColor="rgba(230, 126, 34, 0.6)" />
                  <stop offset="100%" stopColor="rgba(211, 84, 0, 0.3)" />
                </linearGradient>
              </defs>
              
              {/* Horizontal Bars */}
              {data.map((item, index) => {
                const barWidth = (item.profit / maxValue) * 220;
                const barHeight = 25;
                const x = 80;
                const y = 20 + index * 35;
                
                return (
                  <g key={item.name}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill="url(#profitBarGradient)"
                      rx="4"
                      className="drop-shadow-lg"
                      style={{filter: 'drop-shadow(0 0 8px rgba(255, 159, 67, 0.4))'}}
                    />
                    <circle
                      cx={x + barWidth + 5}
                      cy={y + barHeight / 2}
                      r="3"
                      fill="#ff9f43"
                      className="drop-shadow-md"
                      style={{filter: 'drop-shadow(0 0 6px rgba(255, 159, 67, 0.6))'}}
                    />
                    <text
                      x={x - 5}
                      y={y + barHeight / 2 + 4}
                      fill="#999"
                      fontSize="10"
                      textAnchor="end"
                      className="text-muted-foreground"
                    >
                      {item.name.length > 8 ? item.name.substring(0, 8) + '...' : item.name}
                    </text>
                    <text
                      x={x + barWidth + 15}
                      y={y + barHeight / 2 + 4}
                      fill="#ff9f43"
                      fontSize="10"
                      className="font-medium"
                    >
                      ${item.profit.toFixed(0)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No profit data available to display.</p>
        </div>
      )}
    </div>
  );
}
