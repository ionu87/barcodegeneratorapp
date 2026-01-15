import { BarcodeConfig, BarcodeFormat, BARCODE_FORMATS, ChecksumType, getApplicableChecksums } from '@/lib/barcodeUtils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Barcode, Settings2, Palette, Ruler, Hash } from 'lucide-react';

interface BarcodeControlsProps {
  config: BarcodeConfig;
  onChange: (config: BarcodeConfig) => void;
  isValid: boolean;
  errorMessage: string;
}

export function BarcodeControls({ config, onChange, isValid, errorMessage }: BarcodeControlsProps) {
  const selectedFormat = BARCODE_FORMATS.find(f => f.value === config.format);
  const applicableChecksums = getApplicableChecksums(config.format);

  return (
    <div className="space-y-6">
      {/* Format Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Barcode className="h-4 w-4 text-primary" />
          <span>Barcode Format</span>
        </div>
        <Select
          value={config.format}
          onValueChange={(value) => onChange({ ...config, format: value as BarcodeFormat, checksumType: 'none' })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] bg-popover">
            {BARCODE_FORMATS.map((format) => (
              <SelectItem key={format.value} value={format.value}>
                <div className="flex flex-col">
                  <span className="font-medium">{format.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedFormat && (
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded-md">
            <p className="font-medium">{selectedFormat.description}</p>
            <p className="mt-1 font-mono text-[10px]">Valid: {selectedFormat.validChars}</p>
          </div>
        )}
      </div>

      {/* Value Input */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Settings2 className="h-4 w-4 text-primary" />
          <span>Value</span>
        </div>
        <Input
          value={config.text}
          onChange={(e) => onChange({ ...config, text: e.target.value })}
          placeholder="Enter barcode value..."
          className={`font-mono ${!isValid && config.text ? 'border-destructive focus-visible:ring-destructive' : ''}`}
        />
        {!isValid && config.text && (
          <p className="text-xs text-destructive">{errorMessage}</p>
        )}
      </div>

      {/* Checksum */}
      {applicableChecksums.length > 1 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Hash className="h-4 w-4 text-primary" />
            <span>Checksum</span>
          </div>
          <Select
            value={config.checksumType}
            onValueChange={(value) => onChange({ ...config, checksumType: value as ChecksumType })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {applicableChecksums.map((checksum) => (
                <SelectItem key={checksum.value} value={checksum.value}>
                  {checksum.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {config.checksumType !== 'none' 
              ? 'Checksum will be auto-appended to the barcode value'
              : 'No checksum will be added'}
          </p>
        </div>
      )}

      {/* Dimensions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Ruler className="h-4 w-4 text-primary" />
          <span>Dimensions</span>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label>Bar Width</Label>
              <span className="font-mono text-muted-foreground">{config.width}px</span>
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

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label>Height</Label>
              <span className="font-mono text-muted-foreground">{config.height}px</span>
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

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label>Margin</Label>
              <span className="font-mono text-muted-foreground">{config.margin}px</span>
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

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label>Font Size</Label>
              <span className="font-mono text-muted-foreground">{config.fontSize}px</span>
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
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Palette className="h-4 w-4 text-primary" />
          <span>Colors</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">Line Color</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={config.lineColor}
                onChange={(e) => onChange({ ...config, lineColor: e.target.value })}
                className="w-10 h-10 rounded-md border border-input cursor-pointer"
              />
              <Input
                value={config.lineColor}
                onChange={(e) => onChange({ ...config, lineColor: e.target.value })}
                className="font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Background</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={config.background}
                onChange={(e) => onChange({ ...config, background: e.target.value })}
                className="w-10 h-10 rounded-md border border-input cursor-pointer"
              />
              <Input
                value={config.background}
                onChange={(e) => onChange({ ...config, background: e.target.value })}
                className="font-mono text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Display Options */}
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <Label htmlFor="display-value" className="text-sm cursor-pointer">
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
