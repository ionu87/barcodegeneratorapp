import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Sparkles, Droplets, Sun, RotateCw, ZoomIn, Waves, CircleDot, Columns, GripVertical } from 'lucide-react';

export interface ImageEffectsConfig {
  scale: number;
  contrast: number;
  brightness: number;
  blur: number;
  noise: number;
  rotation: number;
  perspective: number;
  lineThickness: number;
  lineSpacing: number;
  enableEffects: boolean;
}

interface ImageEffectsProps {
  config: ImageEffectsConfig;
  onChange: (config: ImageEffectsConfig) => void;
}

export function getDefaultEffectsConfig(): ImageEffectsConfig {
  return {
    scale: 1,
    contrast: 1,
    brightness: 0,
    blur: 0,
    noise: 0,
    rotation: 0,
    perspective: 0,
    lineThickness: 1,
    lineSpacing: 1,
    enableEffects: false,
  };
}

export function ImageEffects({ config, onChange }: ImageEffectsProps) {
  const updateConfig = (updates: Partial<ImageEffectsConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-6">
      {/* Enable Effects Toggle */}
      <div className="flex items-center justify-between p-3 bg-terminal-bg rounded-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <Label htmlFor="enable-effects" className="text-sm cursor-pointer text-terminal-text font-mono">
            Enable Image Effects
          </Label>
        </div>
        <Switch
          id="enable-effects"
          checked={config.enableEffects}
          onCheckedChange={(checked) => updateConfig({ enableEffects: checked })}
        />
      </div>

      <div className={`space-y-5 transition-opacity ${config.enableEffects ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        {/* Scale */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ZoomIn className="h-4 w-4 text-muted-foreground" />
            <div className="flex justify-between flex-1 text-sm">
              <Label>Scale</Label>
              <span className="font-mono text-muted-foreground">{config.scale.toFixed(2)}x</span>
            </div>
          </div>
          <Slider
            value={[config.scale]}
            onValueChange={([value]) => updateConfig({ scale: value })}
            min={0.5}
            max={2}
            step={0.05}
            className="w-full"
            disabled={!config.enableEffects}
          />
        </div>

        {/* Contrast */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-muted-foreground" />
            <div className="flex justify-between flex-1 text-sm">
              <Label>Contrast</Label>
              <span className="font-mono text-muted-foreground">{config.contrast.toFixed(2)}</span>
            </div>
          </div>
          <Slider
            value={[config.contrast]}
            onValueChange={([value]) => updateConfig({ contrast: value })}
            min={0.2}
            max={2}
            step={0.05}
            className="w-full"
            disabled={!config.enableEffects}
          />
        </div>

        {/* Brightness */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CircleDot className="h-4 w-4 text-muted-foreground" />
            <div className="flex justify-between flex-1 text-sm">
              <Label>Brightness</Label>
              <span className="font-mono text-muted-foreground">{config.brightness}</span>
            </div>
          </div>
          <Slider
            value={[config.brightness]}
            onValueChange={([value]) => updateConfig({ brightness: value })}
            min={-100}
            max={100}
            step={5}
            className="w-full"
            disabled={!config.enableEffects}
          />
        </div>

        {/* Blur */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-muted-foreground" />
            <div className="flex justify-between flex-1 text-sm">
              <Label>Blur</Label>
              <span className="font-mono text-muted-foreground">{config.blur}px</span>
            </div>
          </div>
          <Slider
            value={[config.blur]}
            onValueChange={([value]) => updateConfig({ blur: value })}
            min={0}
            max={10}
            step={0.5}
            className="w-full"
            disabled={!config.enableEffects}
          />
        </div>

        {/* Noise */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Waves className="h-4 w-4 text-muted-foreground" />
            <div className="flex justify-between flex-1 text-sm">
              <Label>Noise</Label>
              <span className="font-mono text-muted-foreground">{config.noise}%</span>
            </div>
          </div>
          <Slider
            value={[config.noise]}
            onValueChange={([value]) => updateConfig({ noise: value })}
            min={0}
            max={50}
            step={1}
            className="w-full"
            disabled={!config.enableEffects}
          />
        </div>

        {/* Rotation */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <RotateCw className="h-4 w-4 text-muted-foreground" />
            <div className="flex justify-between flex-1 text-sm">
              <Label>Rotation</Label>
              <span className="font-mono text-muted-foreground">{config.rotation}°</span>
            </div>
          </div>
          <Slider
            value={[config.rotation]}
            onValueChange={([value]) => updateConfig({ rotation: value })}
            min={-15}
            max={15}
            step={0.5}
            className="w-full"
            disabled={!config.enableEffects}
          />
        </div>

        {/* Perspective */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 12L22 2v20L2 12z" />
            </svg>
            <div className="flex justify-between flex-1 text-sm">
              <Label>Perspective Skew</Label>
              <span className="font-mono text-muted-foreground">{config.perspective}%</span>
            </div>
          </div>
          <Slider
            value={[config.perspective]}
            onValueChange={([value]) => updateConfig({ perspective: value })}
            min={0}
            max={20}
            step={1}
            className="w-full"
            disabled={!config.enableEffects}
          />
        </div>
        {/* Line Thickness */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <div className="flex justify-between flex-1 text-sm">
              <Label>Line Thickness</Label>
              <span className="font-mono text-muted-foreground">{config.lineThickness.toFixed(2)}x</span>
            </div>
          </div>
          <Slider
            value={[config.lineThickness]}
            onValueChange={([value]) => updateConfig({ lineThickness: value })}
            min={0.5}
            max={2}
            step={0.1}
            className="w-full"
            disabled={!config.enableEffects}
          />
        </div>

        {/* Line Spacing */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Columns className="h-4 w-4 text-muted-foreground" />
            <div className="flex justify-between flex-1 text-sm">
              <Label>Line Spacing</Label>
              <span className="font-mono text-muted-foreground">{config.lineSpacing.toFixed(2)}x</span>
            </div>
          </div>
          <Slider
            value={[config.lineSpacing]}
            onValueChange={([value]) => updateConfig({ lineSpacing: value })}
            min={0.5}
            max={2}
            step={0.1}
            className="w-full"
            disabled={!config.enableEffects}
          />
        </div>
      </div>

      {config.enableEffects && (
        <p className="text-xs text-muted-foreground bg-muted p-2 rounded-md">
          Effects are applied to the downloaded image. Similar to --contrast, --blur, --noise, --rotation parameters.
        </p>
      )}
    </div>
  );
}
