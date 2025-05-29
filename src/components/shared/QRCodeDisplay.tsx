
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
  // We'll use a trick: render to a hidden canvas to get themed colors, then to SVG. This is complex.
  // Simpler: use fixed colors or pass theme-aware colors directly if SVG doesn't pick up CSS vars.
  // For now, let's assume direct color values are needed for fgColor/bgColor by qrcode.react for SVG.
  // A more robust solution would involve checking computed styles if we want to use CSS vars.
  // For simplicity here, I'll use some default colors that work well with dark themes.
  const effectiveFgColor = typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim() || '#F9FAFB' : '#F9FAFB';
  const effectiveBgColor = typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--card').trim() || '#1F2937' : '#1F2937';


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
