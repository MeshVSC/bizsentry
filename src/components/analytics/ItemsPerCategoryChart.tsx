
'use client';

import { type ChartConfig } from '@/components/ui/chart';

interface ItemsPerCategoryChartProps {
  data: { name: string; count: number }[];
  chartConfig?: ChartConfig;
}

export default function ItemsPerCategoryChart({ data }: ItemsPerCategoryChartProps) {
  const maxValue = Math.max(...data.map(item => item.count), 1);
  
  return (
    <div className="glass-card p-5 hover:bg-[#0A0A0A] hover:border-[#ff9f43]/20 hover:shadow-[0_0_15px_rgba(255,159,67,0.3)] transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold">Items per Category</h3>
        <div className="text-xs text-muted-foreground">Distribution</div>
      </div>
      
      {data.length > 0 ? (
        <div className="relative h-[200px] w-full overflow-hidden">
          {/* Dotted Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" className="overflow-visible">
              <defs>
                <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="1" fill="#ff9f43" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>
          </div>
          
          {/* Single SVG with proper viewBox */}
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="xMidYMid meet"
            className="overflow-visible relative z-10"
          >
            <defs>
              <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255, 159, 67, 0.8)" />
                <stop offset="50%" stopColor="rgba(230, 126, 34, 0.6)" />
                <stop offset="100%" stopColor="rgba(211, 84, 0, 0.3)" />
              </linearGradient>
              <filter id="blueGlow">
                <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Bright blue glowy line connecting dots */}
            <path
              d={`M ${data.map((item, index) => {
                const chartWidth = 90;
                const chartHeight = 65;
                const barHeight = (item.count / maxValue) * chartHeight;
                const barWidth = Math.min(12, chartWidth / data.length * 0.8);
                const spacing = chartWidth / data.length;
                const x = 5 + index * spacing + (spacing - barWidth) / 2;
                const y = 75 - barHeight;
                return `${x + barWidth / 2},${y - 1}`;
              }).join(' L ')}`}
              stroke="#00bfff"
              strokeWidth="0.3"
              fill="none"
              filter="url(#blueGlow)"
              style={{
                filter: 'drop-shadow(0 0 1px #00bfff) drop-shadow(0 0 2px #00bfff)',
                strokeDasharray: '0.5 0.5',
                animation: 'pulse 2s ease-in-out infinite'
              }}
            />
            
            {/* Bars */}
            {data.map((item, index) => {
              const chartWidth = 90; // Leave 10% margin (5% on each side)
              const chartHeight = 65; // Chart area height in viewBox units
              const barHeight = (item.count / maxValue) * chartHeight;
              const barWidth = Math.min(12, chartWidth / data.length * 0.8);
              const spacing = chartWidth / data.length;
              const x = 5 + index * spacing + (spacing - barWidth) / 2; // Center bars in their slots
              const y = 75 - barHeight; // Start from bottom of chart area
              
              return (
                <g key={item.name}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill="url(#barGradient)"
                    rx="0.8"
                    style={{filter: 'drop-shadow(0 0 1px rgba(255, 159, 67, 0.4))'}}
                  />
                  <circle
                    cx={x + barWidth / 2}
                    cy={y - 1}
                    r="0.6"
                    fill="#ff9f43"
                    style={{filter: 'drop-shadow(0 0 1px rgba(255, 159, 67, 0.6))'}}
                  />
                  {/* Category labels */}
                  <text
                    x={x + barWidth / 2}
                    y="85"
                    textAnchor="middle"
                    className="text-[2px] fill-muted-foreground"
                    style={{ fontSize: '2.2px' }}
                  >
                    {item.name.length > 6 ? item.name.substring(0, 6) + '...' : item.name}
                  </text>
                  <text
                    x={x + barWidth / 2}
                    y="90"
                    textAnchor="middle"
                    className="text-[2px] fill-[#ff9f43]"
                    style={{ fontSize: '2.5px', fontWeight: 'bold' }}
                  >
                    {item.count}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No category data available to display.</p>
        </div>
      )}
    </div>
  );
}
