import { BarcodeConfig, BarcodeFormat, BARCODE_FORMATS, ChecksumType, getApplicableChecksums } from '@/lib/barcodeUtils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Barcode, Hash } from 'lucide-react';
import { QualitySegmentedControl } from '@/components/QualitySegmentedControl';
import { InfoTooltip } from '@/components/InfoTooltip';

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Barcode className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold">Barcode Format</span>
          </div>
{selectedFormat && (
            <InfoTooltip
              content={
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${selectedFormat.category === '2D' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {selectedFormat.category}
                    </span>
                    <span className="font-medium">{selectedFormat.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedFormat.description}</p>
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-semibold text-foreground shrink-0">Accepted Symbols:</span>
                      <span className="text-xs font-mono text-muted-foreground">{selectedFormat.validChars}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-semibold text-foreground shrink-0">Length:</span>
                      <span className="text-xs font-mono text-primary">{selectedFormat.lengthHint}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-semibold text-foreground shrink-0">Validation:</span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {selectedFormat.category === '2D' 
                          ? 'Any valid text input accepted' 
                          : selectedFormat.validChars.includes('0-9 only') 
                            ? 'Numeric input only, auto-validated'
                            : 'Alphanumeric, special chars validated'}
                      </span>
                    </div>
                  </div>
                </div>
              }
            />
          )}
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
      </div>

      {/* Value Input */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Hash className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold">Value</span>
        </div>
        <div className="relative">
          <Input
            value={config.text}
            onChange={(e) => onChange({ ...config, text: e.target.value })}
            placeholder="Enter barcode value..."
            className={`font-mono h-14 rounded-xl bg-secondary/50 border-border/50 pr-20 text-lg glow-input transition-all duration-200 ${!isValid && config.text ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-mono text-muted-foreground bg-secondary/80 px-2 py-1 rounded-md">
            {config.text.length} <span className="text-xs">chars</span>
          </div>
        </div>
        {!isValid && config.text && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{errorMessage}</p>
        )}
      </div>

      {/* Quality Selection - Segmented Control */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <span className="font-semibold">Quality</span>
        </div>
        <QualitySegmentedControl
          value={config.quality}
          onChange={(value) => onChange({ ...config, quality: value })}
        />
      </div>

      {/* Checksum */}
      {applicableChecksums.length > 1 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" />
              </svg>
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

    </div>
  );
}
