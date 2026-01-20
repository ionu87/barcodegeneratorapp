import { useState, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { BarcodeFormat, BARCODE_FORMATS, validateInput } from '@/lib/barcodeUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Download, Shuffle, Play, Loader2, FileArchive } from 'lucide-react';
import { toast } from 'sonner';

export function BatchGenerator() {
  const [format, setFormat] = useState<BarcodeFormat>('CODE39');
  const [values, setValues] = useState('');
  const [count, setCount] = useState(10);
  const [stringLength, setStringLength] = useState(8);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateRandomString = (length: number, numeric: boolean = false): string => {
    const chars = numeric 
      ? '0123456789'
      : '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateRandomValues = () => {
    const isNumericOnly = ['EAN13', 'EAN8', 'UPC', 'ITF14', 'ITF', 'CODE128C', 'MSI', 'MSI10', 'MSI11', 'pharmacode'].includes(format);
    
    let length = stringLength;
    // Adjust length for specific formats
    if (format === 'EAN13') length = 12;
    if (format === 'EAN8') length = 7;
    if (format === 'UPC') length = 11;
    if (format === 'ITF14') length = 13;
    if (format === 'ITF' && length % 2 !== 0) length = Math.max(2, length - 1);
    

    const randomValues: string[] = [];
    for (let i = 0; i < count; i++) {
      randomValues.push(generateRandomString(length, isNumericOnly));
    }
    setValues(randomValues.join('\n'));
    toast.success(`Generated ${count} random values`);
  };

  const generateBarcodes = async () => {
    const valueList = values.split('\n').map(v => v.trim()).filter(v => v);
    
    if (valueList.length === 0) {
      toast.error('Please enter at least one value');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const folder = zip.folder('barcodes');

      for (let i = 0; i < valueList.length; i++) {
        const value = valueList[i];
        const validation = validateInput(value, format);
        
        if (!validation.valid) {
          console.warn(`Skipping invalid value: ${value} - ${validation.message}`);
          continue;
        }

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        
        try {
          JsBarcode(svg, value, {
            format: format,
            width: 2,
            height: 100,
            displayValue: true,
            fontSize: 16,
            lineColor: '#000000',
            background: '#FFFFFF',
            margin: 10,
            font: 'monospace',
          });

          // Convert SVG to PNG
          const svgData = new XMLSerializer().serializeToString(svg);
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx?.drawImage(img, 0, 0);
              resolve();
            };
            img.onerror = reject;
            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
          });

          const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
          if (blob && folder) {
            folder.file(`${value}.png`, blob);
          }
        } catch (e) {
          console.warn(`Failed to generate barcode for: ${value}`, e);
        }

        setProgress(((i + 1) / valueList.length) * 100);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `barcodes-${format}-${Date.now()}.zip`;
      link.click();
      
      toast.success(`Downloaded ${valueList.length} barcodes`);
    } catch (error) {
      console.error('Batch generation error:', error);
      toast.error('Failed to generate barcodes');
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Format Selection */}
      <div className="space-y-2">
        <Label>Barcode Format</Label>
        <Select value={format} onValueChange={(v) => setFormat(v as BarcodeFormat)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover max-h-[300px]">
            {BARCODE_FORMATS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Random Generation Controls */}
      <div className="p-4 bg-terminal-bg rounded-lg space-y-4">
        <p className="text-sm font-mono terminal-text">Random Generator</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">Count</Label>
            <Input
              type="number"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
              min={1}
              max={1000}
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">String Length</Label>
            <Input
              type="number"
              value={stringLength}
              onChange={(e) => setStringLength(Math.max(1, Math.min(20, parseInt(e.target.value) || 8)))}
              min={1}
              max={20}
              className="font-mono"
            />
          </div>
        </div>

        <Button onClick={generateRandomValues} variant="outline" className="w-full gap-2">
          <Shuffle className="h-4 w-4" />
          Generate {count} Random Values
        </Button>
      </div>

      {/* Values Input */}
      <div className="space-y-2">
        <Label>Values (one per line)</Label>
        <Textarea
          value={values}
          onChange={(e) => setValues(e.target.value)}
          placeholder="Enter barcode values, one per line..."
          className="min-h-[150px] font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          {values.split('\n').filter(v => v.trim()).length} values entered
        </p>
      </div>

      {/* Progress */}
      {isGenerating && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            Generating... {Math.round(progress)}%
          </p>
        </div>
      )}

      {/* Generate Button */}
      <Button 
        onClick={generateBarcodes} 
        className="w-full gap-2"
        disabled={isGenerating || !values.trim()}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <FileArchive className="h-4 w-4" />
            Download All as ZIP
          </>
        )}
      </Button>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
