
"use client";

import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  className?: string;
}

export default function QRCodeDisplay({
  value,
  size = 128,
  bgColor = "var(--card)", // Use CSS variable for background
  fgColor = "var(--foreground)", // Use CSS variable for foreground
  level = 'M',
  className = '',
}: QRCodeDisplayProps) {
  if (!value) {
    return <div className={className} style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--muted))' }}>N/A</div>;
  }

  // For SVG, fgColor and bgColor might need to be actual color values.
  // Resolve CSS variables to real colors when running in the browser while
  // allowing direct color strings to be used as provided.
  const resolveColor = (color: string, fallbackHex: string) => {
    const cssVarMatch = color.match(/var\((--[^)]+)\)/);
    if (cssVarMatch) {
      if (typeof window !== 'undefined') {
        return (
          getComputedStyle(document.documentElement)
            .getPropertyValue(cssVarMatch[1])
            .trim() || fallbackHex
        );
      }
      return fallbackHex;
    }
    return color;
  };

  const effectiveFgColor = resolveColor(fgColor, '#F9FAFB');
  const effectiveBgColor = resolveColor(bgColor, '#1F2937');


  return (
    <div className={className} style={{ display: 'inline-block', padding: '8px', backgroundColor: 'hsl(var(--card))', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))' }}>
      <QRCodeSVG
        value={value}
        size={size}
        bgColor={effectiveBgColor} // Ensure these are actual color strings
        fgColor={effectiveFgColor} // Ensure these are actual color strings
        level={level}
        includeMargin={false} // Control margin with the outer div's padding
      />
    </div>
  );
}
