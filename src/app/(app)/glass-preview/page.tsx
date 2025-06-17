"use client";

import { useState } from 'react';
import GlassComparison from '@/components/glass-preview/GlassComparison';
import GlassControls from '@/components/glass-preview/GlassControls';
import GlassShowcase from '@/components/glass-preview/GlassShowcase';
import BackgroundVariations from '@/components/glass-preview/BackgroundVariations';

export default function GlassPreviewPage() {
  const [glassSettings, setGlassSettings] = useState({
    blur: 16,
    backgroundOpacity: 0.1,
    borderOpacity: 0.2,
    shadowIntensity: 0.1,
    tintIntensity: 0.05,
    cornerRadius: 12,
  });

  const [activeBackground, setActiveBackground] = useState('dark');

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="glass-card p-6 m-6 mb-8">
        <h1 className="text-2xl font-bold mb-2">Glass Morphism Theme Preview</h1>
        <p className="text-muted-foreground">
          Interactive theming system for customizing glass effects. 
          Adjust settings in real-time to preview different glass morphism styles.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          💡 Access this page directly at <code>/glass-preview</code>
        </p>
      </div>

      {/* Interactive Controls */}
      <div className="mx-6 mb-8">
        <GlassControls 
          settings={glassSettings}
          onSettingsChange={setGlassSettings}
        />
      </div>

      {/* Background Selection */}
      <div className="mx-6 mb-8">
        <BackgroundVariations 
          activeBackground={activeBackground}
          onBackgroundChange={setActiveBackground}
        />
      </div>

      {/* Side-by-side Comparison */}
      <div className="mx-6 mb-8">
        <GlassComparison 
          settings={glassSettings}
          background={activeBackground}
        />
      </div>

      {/* Component Showcase */}
      <div className="mx-6 mb-8">
        <GlassShowcase 
          settings={glassSettings}
          background={activeBackground}
        />
      </div>

      {/* CSS Export */}
      <div className="glass-card p-6 m-6">
        <h3 className="text-lg font-semibold mb-4">Generated CSS</h3>
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-4 font-mono text-sm overflow-x-auto">
          <pre className="text-green-400">
{`.enhanced-glass {
  background: rgba(255, 255, 255, ${glassSettings.backgroundOpacity});
  backdrop-filter: blur(${glassSettings.blur}px);
  border: 1px solid rgba(255, 255, 255, ${glassSettings.borderOpacity});
  border-radius: ${glassSettings.cornerRadius}px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, ${glassSettings.shadowIntensity}),
    0 4px 16px rgba(0, 0, 0, ${glassSettings.shadowIntensity * 0.5}),
    inset 0 1px 0 rgba(255, 255, 255, ${glassSettings.borderOpacity * 0.5});
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}