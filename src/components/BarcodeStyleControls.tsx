import { BarcodeConfig, getDefaultConfig } from '@/lib/barcodeUtils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Palette, Ruler, Maximize2, RotateCcw } from 'lucide-react';

interface BarcodeStyleControlsProps {
  config: BarcodeConfig;
  onChange: (config: BarcodeConfig) => void;
}

export function BarcodeStyleControls({ config, onChange }: BarcodeStyleControlsProps) {
  const defaults = getDefaultConfig();

  const resetDimensions = () => {
    onChange({
      ...config,
      width: defaults.width,
      height: defaults.height,
      margin: defaults.margin,
      fontSize: defaults.fontSize,
      scale: defaults.scale,
    });
  };

  return (
    <div className="space-y-8">
      {/* Dimensions */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Ruler className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold">Dimensions</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetDimensions}
            className="gap-1.5 h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>

        <div className="space-y-5 pl-1">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <Label className="text-muted-foreground">Bar Width</Label>
              <span className="font-mono text-primary font-medium">{config.width}px</span>
            </div>
            <Slider
              value={[config.width]}
              onValueChange={([value]) => onChange({ ...config, width: value })}
              min={1}
              max={5}
              step={0.5}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <Label className="text-muted-foreground">Height</Label>
              <span className="font-mono text-primary font-medium">{config.height}px</span>
            </div>
            <Slider
              value={[config.height]}
              onValueChange={([value]) => onChange({ ...config, height: value })}
              min={30}
              max={200}
              step={5}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <Label className="text-muted-foreground">Margin</Label>
              <span className="font-mono text-primary font-medium">{config.margin}px</span>
            </div>
            <Slider
              value={[config.margin]}
              onValueChange={([value]) => onChange({ ...config, margin: value })}
              min={0}
              max={30}
              step={2}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <Label className="text-muted-foreground">Font Size</Label>
              <span className="font-mono text-primary font-medium">{config.fontSize}px</span>
            </div>
            <Slider
              value={[config.fontSize]}
              onValueChange={([value]) => onChange({ ...config, fontSize: value })}
              min={10}
              max={28}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Output Scale */}
      <div className="space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Maximize2 className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold">Output Size</span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            type="button"
            onClick={() => onChange({ ...config, scale: 0.5 })}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              config.scale === 0.5
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-secondary/80 text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            Small
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...config, scale: 1 })}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              config.scale === 1
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-secondary/80 text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            Medium
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...config, scale: 2 })}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              config.scale === 2
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-secondary/80 text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            Large
          </button>
        </div>

        <div className="space-y-3 pl-1">
          <div className="flex justify-between text-sm">
            <Label className="text-muted-foreground">Custom Scale</Label>
            <span className="font-mono text-primary font-medium">{config.scale.toFixed(1)}x</span>
          </div>
          <Slider
            value={[config.scale]}
            onValueChange={([value]) => onChange({ ...config, scale: value })}
            min={0.25}
            max={4}
            step={0.25}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            0.25x = tiny labels • 1x = standard • 4x = large prints
          </p>
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Palette className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold">Colors</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">Line Color</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={config.lineColor}
                onChange={(e) => onChange({ ...config, lineColor: e.target.value })}
                className="w-12 h-12 rounded-xl border-2 border-border/50 cursor-pointer bg-transparent"
              />
              <Input
                value={config.lineColor}
                onChange={(e) => onChange({ ...config, lineColor: e.target.value })}
                className="font-mono text-xs h-12 rounded-xl bg-secondary/50 border-border/50"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">Background</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={config.background}
                onChange={(e) => onChange({ ...config, background: e.target.value })}
                className="w-12 h-12 rounded-xl border-2 border-border/50 cursor-pointer bg-transparent"
              />
              <Input
                value={config.background}
                onChange={(e) => onChange({ ...config, background: e.target.value })}
                className="font-mono text-xs h-12 rounded-xl bg-secondary/50 border-border/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Display Options */}
      <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border/30">
        <Label htmlFor="display-value" className="text-sm font-medium cursor-pointer">
          Show Value Text
        </Label>
        <Switch
          id="display-value"
          checked={config.displayValue}
          onCheckedChange={(checked) => onChange({ ...config, displayValue: checked })}
        />
      </div>
    </div>
  );
}
