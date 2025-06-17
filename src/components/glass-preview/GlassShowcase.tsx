"use client";

import { Settings, Bell, Search, User, Mail, Calendar, Shield, Download } from 'lucide-react';

interface GlassSettings {
  blur: number;
  backgroundOpacity: number;
  borderOpacity: number;
  shadowIntensity: number;
  tintIntensity: number;
  cornerRadius: number;
}

interface GlassShowcaseProps {
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

export default function GlassShowcase({ settings, background }: GlassShowcaseProps) {
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

  const enhancedButtonStyle = {
    ...enhancedGlassStyle,
    background: `rgba(255, 159, 67, ${settings.backgroundOpacity + 0.05})`,
  };

  const enhancedInputStyle = {
    ...enhancedGlassStyle,
    background: `rgba(0, 0, 0, ${settings.backgroundOpacity * 2})`,
  };

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-semibold mb-6">Component Showcase</h2>
      
      <div className={`relative p-8 rounded-xl ${getBackgroundStyle(background)} overflow-hidden`}>
        {/* Background patterns */}
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

        {background === 'noise-texture' && (
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        )}
        
        <div className="relative space-y-8">
          {/* Navigation Bar */}
          <div style={enhancedGlassStyle} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-lg font-bold text-white">StockSentry</div>
                <nav className="hidden md:flex items-center gap-6">
                  <a href="#" className="text-sm text-white/80 hover:text-white">Dashboard</a>
                  <a href="#" className="text-sm text-white/80 hover:text-white">Inventory</a>
                  <a href="#" className="text-sm text-white/80 hover:text-white">Analytics</a>
                </nav>
              </div>
              <div className="flex items-center gap-3">
                <button style={enhancedInputStyle} className="p-2 text-white/80">
                  <Bell className="w-4 h-4" />
                </button>
                <button style={enhancedInputStyle} className="p-2 text-white/80">
                  <User className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Search Bar */}
              <div style={enhancedInputStyle} className="p-4 flex items-center gap-3">
                <Search className="w-4 h-4 text-white/60" />
                <input 
                  type="text" 
                  placeholder="Search inventory..."
                  className="flex-1 bg-transparent text-white placeholder-white/60 outline-none"
                />
              </div>

              {/* Form Card */}
              <div style={enhancedGlassStyle} className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Add New Item</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/80 mb-2">Item Name</label>
                    <input 
                      type="text" 
                      style={enhancedInputStyle}
                      className="w-full p-3 text-white placeholder-white/60 outline-none"
                      placeholder="Enter item name..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/80 mb-2">Category</label>
                    <select style={enhancedInputStyle} className="w-full p-3 text-white outline-none">
                      <option value="">Select category</option>
                      <option value="electronics">Electronics</option>
                      <option value="tools">Tools</option>
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button style={enhancedButtonStyle} className="flex-1 py-3 text-white font-medium hover:scale-105 transition-transform">
                      Save Item
                    </button>
                    <button style={enhancedInputStyle} className="px-6 py-3 text-white/80 hover:text-white transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div style={enhancedGlassStyle} className="p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">1,247</div>
                  <div className="text-sm text-white/60">Total Items</div>
                </div>
                <div style={enhancedGlassStyle} className="p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">$24.5K</div>
                  <div className="text-sm text-white/60">Total Value</div>
                </div>
              </div>

              {/* Settings Panel */}
              <div style={enhancedGlassStyle} className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Settings
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-white/80">Email Notifications</span>
                    <div style={enhancedButtonStyle} className="w-12 h-6 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-white/80">Auto Backup</span>
                    <div style={enhancedInputStyle} className="w-12 h-6 rounded-full relative">
                      <div className="w-5 h-5 bg-white/60 rounded-full absolute top-0.5 left-0.5"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-white/80">Dark Mode</span>
                    <div style={enhancedButtonStyle} className="w-12 h-6 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button style={enhancedButtonStyle} className="p-3 text-white font-medium hover:scale-105 transition-transform flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button style={enhancedGlassStyle} className="p-3 text-white/80 hover:text-white transition-colors flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Modal Example */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center" style={{ position: 'relative', background: 'rgba(0,0,0,0.3)' }}>
            <div style={enhancedGlassStyle} className="p-6 w-full max-w-md mx-4">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-[#ff9f43]" />
                <h3 className="text-lg font-semibold text-white">Confirm Action</h3>
              </div>
              <p className="text-white/80 mb-6">
                Are you sure you want to delete this item? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button style={enhancedButtonStyle} className="flex-1 py-3 text-white font-medium hover:scale-105 transition-transform">
                  Confirm
                </button>
                <button style={enhancedInputStyle} className="flex-1 py-3 text-white/80 hover:text-white transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}