import { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { BarcodeConfig } from '@/lib/barcodeUtils';
import { Download, Copy, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface BarcodePreviewProps {
  config: BarcodeConfig;
  isValid: boolean;
  errorMessage: string;
}

export function BarcodePreview({ config, isValid, errorMessage }: BarcodePreviewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current || !isValid || !config.text.trim()) {
      setRenderError(null);
      return;
    }

    try {
      JsBarcode(svgRef.current, config.text, {
        format: config.format,
        width: config.width,
        height: config.height,
        displayValue: config.displayValue,
        fontSize: config.fontSize,
        lineColor: config.lineColor,
        background: config.background,
        margin: config.margin,
        font: 'JetBrains Mono',
      });
      setRenderError(null);
    } catch (error) {
      console.error('Barcode render error:', error);
      setRenderError(error instanceof Error ? error.message : 'Failed to render barcode');
    }
  }, [config, isValid]);

  const downloadBarcode = async () => {
    if (!svgRef.current || !canvasRef.current) return;

    const svg = svgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const link = document.createElement('a');
      link.download = `barcode-${config.format}-${config.text}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('Barcode downloaded successfully');
    };

    img.src = url;
  };

  const copyToClipboard = async () => {
    if (!svgRef.current || !canvasRef.current) return;

    const svg = svgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = async () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      try {
        canvas.toBlob(async (blob) => {
          if (blob) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            setCopied(true);
            toast.success('Copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
          }
        }, 'image/png');
      } catch (error) {
        toast.error('Failed to copy to clipboard');
      }
    };

    img.src = url;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Preview</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            disabled={!isValid || !!renderError}
            className="gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button
            size="sm"
            onClick={downloadBarcode}
            disabled={!isValid || !!renderError}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download PNG
          </Button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-muted/50 rounded-lg border-2 border-dashed border-border p-8 min-h-[300px] relative overflow-hidden">
        {/* Scanner effect overlay */}
        {isValid && !renderError && config.text.trim() && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="scanner-line absolute left-0 right-0 h-0.5 bg-primary" />
          </div>
        )}

        {!config.text.trim() ? (
          <div className="text-center text-muted-foreground">
            <p className="font-medium">Enter a value to generate barcode</p>
            <p className="text-sm mt-1">Your barcode will appear here</p>
          </div>
        ) : !isValid ? (
          <div className="text-center text-destructive flex flex-col items-center gap-2">
            <AlertCircle className="h-8 w-8" />
            <p className="font-medium">{errorMessage}</p>
          </div>
        ) : renderError ? (
          <div className="text-center text-destructive flex flex-col items-center gap-2">
            <AlertCircle className="h-8 w-8" />
            <p className="font-medium">Render Error</p>
            <p className="text-sm">{renderError}</p>
          </div>
        ) : (
          <div className="bg-barcode-bg p-4 rounded-lg shadow-lg glow-border">
            <svg ref={svgRef} />
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
