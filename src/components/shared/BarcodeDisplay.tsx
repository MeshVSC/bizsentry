
"use client";

import Barcode from 'react-barcode';
import { useEffect, useState } from 'react';

interface BarcodeDisplayProps {
  value: string;
  format?: "CODE128" | "CODE39" | "CODE128A" | "CODE128B" | "CODE128C" | "EAN13" | "EAN8" | "EAN5" | "EAN2" | "UPC" | "UPCE" | "ITF14" | "ITF" | "MSI" | "MSI10" | "MSI11" | "MSI1010" | "MSI1110" | "pharmacode" | "codabar";
  width?: number;
  height?: number;
  displayValue?: boolean;
  className?: string;
}

export default function BarcodeDisplay({
  value,
  format = 'CODE128',
  width = 2,
  height = 100,
  displayValue = true,
  className = '',
}: BarcodeDisplayProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [fgColor, setFgColor] = useState('#F9FAFB'); // Default for dark theme
  const [bgColor, setBgColor] = useState('#1F2937'); // Default for dark theme

  useEffect(() => {
    setIsMounted(true);
    // Get computed styles for theme-aware colors
    if (typeof window !== 'undefined') {
      const computedFgColor = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim();
      const computedBgColor = getComputedStyle(document.documentElement).getPropertyValue('--card').trim(); // Using card as background
      if (computedFgColor) setFgColor(computedFgColor);
      if (computedBgColor) setBgColor(computedBgColor);
    }
  }, []);

  if (!isMounted || !value) {
    // Render a placeholder or nothing if not mounted or no value
    return (
      <div 
        className={className} 
        style={{ 
          width: width * (value?.length || 20) + 40, // Approximate width
          height: height + (displayValue ? 20 : 0), 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          border: '1px solid hsl(var(--border))', 
          backgroundColor: 'hsl(var(--muted))',
          padding: '8px',
          borderRadius: 'var(--radius)',
        }}
      >
        {value ? 'Loading...' : 'N/A'}
      </div>
    );
  }
  
  return (
    <div className={`${className} max-w-full overflow-hidden`} style={{ display: 'inline-block', padding: '8px', backgroundColor: bgColor, borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))' }}>
      <div className="max-w-full overflow-x-auto">
        <Barcode
          value={value}
          format={format}
          width={Math.min(width, 1.5)} // Reduce width to prevent overflow
          height={height}
          displayValue={displayValue}
          lineColor={fgColor}
          background={bgColor} // react-barcode uses 'background' prop for bgColor
          margin={5} // Reduced margin
          fontSize={10} // Smaller font size
          fontOptions="bold"
          textMargin={2}
        />
      </div>
    </div>
  );
}
