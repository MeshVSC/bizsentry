"use client";

import { Package, DollarSign, TrendingUp } from 'lucide-react';

interface GlassSettings {
  blur: number;
  backgroundOpacity: number;
  borderOpacity: number;
  shadowIntensity: number;
  tintIntensity: number;
  cornerRadius: number;
}

interface GlassComparisonProps {
  settings: GlassSettings;
  background: string;
}

const getBackgroundStyle = (background: string) => {
  const styles = {
    'dark': 'bg-black',
    'gradient-purple': 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900',
    'gradient-orange': 'bg-gradient-to-br from-orange-600 via-red-600 to-pink-600',
    'complex-pattern': 'bg-gradient-to-br from-cyan-900 via-blue-900 to-purple-900',
    'mesh-gradient': 'bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900',
    'noise-texture': 'bg-gradient-to-br from-slate-800 via-gray-800 to-zinc-800',
  };
  return styles[background as keyof typeof styles] || styles.dark;
};

export default function GlassComparison({ settings, background }: GlassComparisonProps) {
  const enhancedGlassStyle = {
    background: `rgba(255, 255, 255, ${settings.backgroundOpacity})`,
    backdropFilter: `blur(${settings.blur}px)`,
    border: `1px solid rgba(255, 255, 255, ${settings.borderOpacity})`,
    borderRadius: `${settings.cornerRadius}px`,
    boxShadow: `
      0 8px 32px rgba(0, 0, 0, ${settings.shadowIntensity}),
      0 4px 16px rgba(0, 0, 0, ${settings.shadowIntensity * 0.5}),
      inset 0 1px 0 rgba(255, 255, 255, ${settings.borderOpacity * 0.5})
    `,
  };

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-semibold mb-6">Side-by-Side Comparison</h2>
      
      <div className={`relative p-8 rounded-xl ${getBackgroundStyle(background)} overflow-hidden`}>
        {/* Background pattern for complex-pattern */}
        {background === 'complex-pattern' && (
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
                               radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
              backgroundSize: '20px 20px, 30px 30px'
            }}
          />
        )}

        {/* Noise texture for noise-texture background */}
        {background === 'noise-texture' && (
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        )}
        
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Glass Style */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white mb-4">Current Style</h3>
            
            {/* Current glass card */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <Package className="w-5 h-5 text-[#ff9f43]" />
                <div>
                  <h4 className="font-medium">Inventory Summary</h4>
                  <p className="text-xs text-muted-foreground">Current glass effect</p>
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">1,247</div>
              <div className="text-xs text-muted-foreground">Total items in stock</div>
            </div>

            {/* Current metric cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card p-4">
                <DollarSign className="w-4 h-4 text-[#ff9f43] mb-2" />
                <div className="text-lg font-bold">$24,580</div>
                <div className="text-xs text-muted-foreground">Total Value</div>
              </div>
              <div className="glass-card p-4">
                <TrendingUp className="w-4 h-4 text-[#ff9f43] mb-2" />
                <div className="text-lg font-bold">+12%</div>
                <div className="text-xs text-muted-foreground">This Month</div>
              </div>
            </div>

            {/* Current button */}
            <button className="w-full glass-btn px-4 py-3 rounded-lg text-sm font-medium">
              Current Glass Button
            </button>
          </div>

          {/* Enhanced Glass Style */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white mb-4">Enhanced Style</h3>
            
            {/* Enhanced glass card */}
            <div style={enhancedGlassStyle} className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <Package className="w-5 h-5 text-[#ff9f43]" />
                <div>
                  <h4 className="font-medium text-white">Inventory Summary</h4>
                  <p className="text-xs text-white/60">Enhanced glass effect</p>
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-white">1,247</div>
              <div className="text-xs text-white/60">Total items in stock</div>
            </div>

            {/* Enhanced metric cards */}
            <div className="grid grid-cols-2 gap-3">
              <div style={enhancedGlassStyle} className="p-4">
                <DollarSign className="w-4 h-4 text-[#ff9f43] mb-2" />
                <div className="text-lg font-bold text-white">$24,580</div>
                <div className="text-xs text-white/60">Total Value</div>
              </div>
              <div style={enhancedGlassStyle} className="p-4">
                <TrendingUp className="w-4 h-4 text-[#ff9f43] mb-2" />
                <div className="text-lg font-bold text-white">+12%</div>
                <div className="text-xs text-white/60">This Month</div>
              </div>
            </div>

            {/* Enhanced button */}
            <button 
              style={{
                ...enhancedGlassStyle,
                background: `rgba(255, 159, 67, ${settings.backgroundOpacity + 0.05})`
              }}
              className="w-full px-4 py-3 text-sm font-medium text-white hover:scale-105 transition-transform"
            >
              Enhanced Glass Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}