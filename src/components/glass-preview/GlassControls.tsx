"use client";

import { Slider } from '@/components/ui/slider';

interface GlassSettings {
  blur: number;
  backgroundOpacity: number;
  borderOpacity: number;
  shadowIntensity: number;
  tintIntensity: number;
  cornerRadius: number;
}

interface GlassControlsProps {
  settings: GlassSettings;
  onSettingsChange: (settings: GlassSettings) => void;
}

export default function GlassControls({ settings, onSettingsChange }: GlassControlsProps) {
  const updateSetting = (key: keyof GlassSettings, value: number) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-semibold mb-6">Glass Effect Controls</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Blur Intensity */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Backdrop Blur</label>
            <span className="text-xs text-muted-foreground">{settings.blur}px</span>
          </div>
          <Slider
            value={[settings.blur]}
            onValueChange={(value) => updateSetting('blur', value[0])}
            min={4}
            max={28}
            step={2}
            className="w-full"
          />
        </div>

        {/* Background Opacity */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Background Opacity</label>
            <span className="text-xs text-muted-foreground">{(settings.backgroundOpacity * 100).toFixed(1)}%</span>
          </div>
          <Slider
            value={[settings.backgroundOpacity]}
            onValueChange={(value) => updateSetting('backgroundOpacity', value[0])}
            min={0.02}
            max={0.4}
            step={0.01}
            className="w-full"
          />
        </div>

        {/* Border Opacity */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Border Opacity</label>
            <span className="text-xs text-muted-foreground">{(settings.borderOpacity * 100).toFixed(1)}%</span>
          </div>
          <Slider
            value={[settings.borderOpacity]}
            onValueChange={(value) => updateSetting('borderOpacity', value[0])}
            min={0.05}
            max={0.5}
            step={0.01}
            className="w-full"
          />
        </div>

        {/* Shadow Intensity */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Shadow Depth</label>
            <span className="text-xs text-muted-foreground">{(settings.shadowIntensity * 100).toFixed(1)}%</span>
          </div>
          <Slider
            value={[settings.shadowIntensity]}
            onValueChange={(value) => updateSetting('shadowIntensity', value[0])}
            min={0.02}
            max={0.3}
            step={0.01}
            className="w-full"
          />
        </div>

        {/* Corner Radius */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Corner Radius</label>
            <span className="text-xs text-muted-foreground">{settings.cornerRadius}px</span>
          </div>
          <Slider
            value={[settings.cornerRadius]}
            onValueChange={(value) => updateSetting('cornerRadius', value[0])}
            min={4}
            max={24}
            step={2}
            className="w-full"
          />
        </div>

        {/* Tint Intensity */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Glass Tint</label>
            <span className="text-xs text-muted-foreground">{(settings.tintIntensity * 100).toFixed(1)}%</span>
          </div>
          <Slider
            value={[settings.tintIntensity]}
            onValueChange={(value) => updateSetting('tintIntensity', value[0])}
            min={0}
            max={0.2}
            step={0.01}
            className="w-full"
          />
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={() => onSettingsChange({
            blur: 12,
            backgroundOpacity: 0.1,
            borderOpacity: 0.2,
            shadowIntensity: 0.1,
            tintIntensity: 0.05,
            cornerRadius: 12,
          })}
          className="px-4 py-2 text-xs glass-btn rounded-lg"
        >
          Current Style
        </button>
        <button
          onClick={() => onSettingsChange({
            blur: 20,
            backgroundOpacity: 0.08,
            borderOpacity: 0.3,
            shadowIntensity: 0.15,
            tintIntensity: 0.1,
            cornerRadius: 16,
          })}
          className="px-4 py-2 text-xs glass-btn rounded-lg"
        >
          Enhanced Glass
        </button>
        <button
          onClick={() => onSettingsChange({
            blur: 24,
            backgroundOpacity: 0.05,
            borderOpacity: 0.4,
            shadowIntensity: 0.2,
            tintIntensity: 0.15,
            cornerRadius: 20,
          })}
          className="px-4 py-2 text-xs glass-btn rounded-lg"
        >
          Ultra Glass
        </button>
      </div>
    </div>
  );
}