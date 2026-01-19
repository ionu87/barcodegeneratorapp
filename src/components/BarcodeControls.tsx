import { BarcodeConfig, BarcodeFormat, BARCODE_FORMATS, ChecksumType, getApplicableChecksums, QualityLevel, QUALITY_LEVELS } from '@/lib/barcodeUtils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Barcode, Settings2, Palette, Ruler, Hash, Sparkles } from 'lucide-react';

interface BarcodeControlsProps {
  config: BarcodeConfig;
  onChange: (config: BarcodeConfig) => void;
  isValid: boolean;
  errorMessage: string;
}

export function BarcodeControls({ config, onChange, isValid, errorMessage }: BarcodeControlsProps) {
  const selectedFormat = BARCODE_FORMATS.find(f => f.value === config.format);
  const applicableChecksums = getApplicableChecksums(config.format);

  const formats1D = BARCODE_FORMATS.filter(f => f.category === '1D');
  const formats2D = BARCODE_FORMATS.filter(f => f.category === '2D');

  return (
    <div className="space-y-8">
      {/* Format Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Barcode className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold">Barcode Format</span>
        </div>
        <Select
          value={config.format}
          onValueChange={(value) => onChange({ ...config, format: value as BarcodeFormat, checksumType: 'none' })}
        >
          <SelectTrigger className="w-full h-12 rounded-xl bg-secondary/50 border-border/50 hover:bg-secondary/80 transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[400px] bg-popover border-border/50 rounded-xl shadow-2xl">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">1D Barcodes</div>
            {formats1D.map((format) => (
              <SelectItem key={format.value} value={format.value} className="rounded-lg mx-1">
                <span className="font-medium">{format.label}</span>
              </SelectItem>
            ))}
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-t border-border/50 mt-2 pt-3">2D Barcodes</div>
            {formats2D.map((format) => (
              <SelectItem key={format.value} value={format.value} className="rounded-lg mx-1">
                <span className="font-medium">{format.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedFormat && (
          <div className="text-sm text-muted-foreground bg-secondary/50 p-4 rounded-xl border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded-md text-xs font-semibold ${selectedFormat.category === '2D' ? 'bg-primary/20 text-primary' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
                {selectedFormat.category}
              </span>
              <p className="font-medium text-foreground">{selectedFormat.description}</p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
              <span>Valid: {selectedFormat.validChars}</span>
              <span className="text-primary font-semibold">Length: {selectedFormat.lengthHint}</span>
            </div>
          </div>
        )}
      </div>

      {/* Value Input */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Settings2 className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold">Value</span>
          </div>
          <span className="text-sm font-mono text-muted-foreground">
            {config.text.length} chars
          </span>
        </div>
        <Input
          value={config.text}
          onChange={(e) => onChange({ ...config, text: e.target.value })}
          placeholder="Enter barcode value..."
          className={`font-mono h-12 rounded-xl bg-secondary/50 border-border/50 focus:bg-background transition-colors modern-input ${!isValid && config.text ? 'border-destructive focus-visible:ring-destructive' : ''}`}
        />
        {!isValid && config.text && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{errorMessage}</p>
        )}
      </div>

      {/* Quality Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold">Quality</span>
        </div>
        <Select
          value={config.quality}
          onValueChange={(value) => onChange({ ...config, quality: value as QualityLevel })}
        >
          <SelectTrigger className="w-full h-12 rounded-xl bg-secondary/50 border-border/50 hover:bg-secondary/80 transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border/50 rounded-xl shadow-2xl">
            {QUALITY_LEVELS.map((quality) => (
              <SelectItem key={quality.value} value={quality.value} className="rounded-lg mx-1">
                <span className="font-medium">{quality.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {QUALITY_LEVELS.find(q => q.value === config.quality) && (
          <p className="text-sm text-muted-foreground">
            {QUALITY_LEVELS.find(q => q.value === config.quality)?.description}
          </p>
        )}
      </div>

      {/* Checksum */}
      {applicableChecksums.length > 1 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Hash className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold">Checksum</span>
          </div>
          <Select
            value={config.checksumType}
            onValueChange={(value) => onChange({ ...config, checksumType: value as ChecksumType })}
          >
            <SelectTrigger className="w-full h-12 rounded-xl bg-secondary/50 border-border/50 hover:bg-secondary/80 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border/50 rounded-xl shadow-2xl">
              {applicableChecksums.map((checksum) => (
                <SelectItem key={checksum.value} value={checksum.value} className="rounded-lg mx-1">
                  {checksum.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {config.checksumType !== 'none' 
              ? 'Checksum will be auto-appended to the barcode value'
              : 'No checksum will be added'}
          </p>
        </div>
      )}

      {/* Dimensions */}
      <div className="space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Ruler className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold">Dimensions</span>
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