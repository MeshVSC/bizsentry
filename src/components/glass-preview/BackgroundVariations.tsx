"use client";

interface BackgroundVariationsProps {
  activeBackground: string;
  onBackgroundChange: (background: string) => void;
}

export default function BackgroundVariations({ activeBackground, onBackgroundChange }: BackgroundVariationsProps) {
  const backgrounds = [
    {
      id: 'dark',
      name: 'Dark (Current)',
      style: 'bg-black',
      description: 'Your current app background'
    },
    {
      id: 'gradient-purple',
      name: 'Purple Gradient',
      style: 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900',
      description: 'Rich purple to blue gradient'
    },
    {
      id: 'gradient-orange',
      name: 'Orange Gradient',
      style: 'bg-gradient-to-br from-orange-600 via-red-600 to-pink-600',
      description: 'Warm orange to pink gradient'
    },
    {
      id: 'complex-pattern',
      name: 'Complex Pattern',
      style: 'bg-gradient-to-br from-cyan-900 via-blue-900 to-purple-900',
      description: 'Multi-layered background with patterns'
    },
    {
      id: 'mesh-gradient',
      name: 'Mesh Gradient',
      style: 'bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900',
      description: 'Modern mesh-style gradient'
    },
    {
      id: 'noise-texture',
      name: 'Textured',
      style: 'bg-gradient-to-br from-slate-800 via-gray-800 to-zinc-800',
      description: 'Subtle texture with noise'
    }
  ];

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-semibold mb-6">Background Variations</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Test glass effects against different backgrounds to see how they adapt
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {backgrounds.map((bg) => (
          <button
            key={bg.id}
            onClick={() => onBackgroundChange(bg.id)}
            className={`relative h-20 rounded-lg overflow-hidden transition-all ${bg.style} ${
              activeBackground === bg.id 
                ? 'ring-2 ring-[#ff9f43] scale-105' 
                : 'hover:scale-102 hover:ring-1 hover:ring-white/20'
            }`}
          >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/20" />
            
            {/* Background name */}
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <div className="text-xs font-medium text-white truncate">
                {bg.name}
              </div>
            </div>

            {/* Selection indicator */}
            {activeBackground === bg.id && (
              <div className="absolute top-2 right-2 w-3 h-3 bg-[#ff9f43] rounded-full shadow-lg" />
            )}

            {/* Special effects for certain backgrounds */}
            {bg.id === 'complex-pattern' && (
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
                                   radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
                  backgroundSize: '20px 20px, 30px 30px'
                }}
              />
            )}

            {bg.id === 'noise-texture' && (
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Current background description */}
      <div className="mt-4 text-xs text-muted-foreground">
        {backgrounds.find(bg => bg.id === activeBackground)?.description}
      </div>
    </div>
  );
}