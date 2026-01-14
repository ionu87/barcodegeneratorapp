import { useEffect, useRef, useState, useCallback } from 'react';
import JsBarcode from 'jsbarcode';
import { BarcodeConfig } from '@/lib/barcodeUtils';
import { ImageEffectsConfig } from '@/components/ImageEffects';
import { Download, Copy, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface BarcodePreviewProps {
  config: BarcodeConfig;
  effects: ImageEffectsConfig;
  isValid: boolean;
  errorMessage: string;
}

export function BarcodePreview({ config, effects, isValid, errorMessage }: BarcodePreviewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const noiseCanvasRef = useRef<HTMLCanvasElement>(null);
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

  const applyEffects = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, img: HTMLImageElement) => {
    // Calculate scaled dimensions
    const scaledWidth = Math.round(img.width * effects.scale);
    const scaledHeight = Math.round(img.height * effects.scale);
    
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;
    
    ctx.save();
    
    // Clear canvas
    ctx.fillStyle = config.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Apply rotation
    if (effects.rotation !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((effects.rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }
    
    // Apply perspective (simple skew approximation)
    if (effects.perspective > 0) {
      const skewAmount = effects.perspective * 0.01;
      ctx.transform(1, skewAmount * 0.5, -skewAmount * 0.3, 1, 0, 0);
    }
    
    // Draw the image
    ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
    
    // Apply contrast and brightness
    if (effects.contrast !== 1 || effects.brightness !== 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        // Apply contrast
        data[i] = Math.min(255, Math.max(0, ((data[i] - 128) * effects.contrast) + 128 + effects.brightness));
        data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] - 128) * effects.contrast) + 128 + effects.brightness));
        data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] - 128) * effects.contrast) + 128 + effects.brightness));
      }
      
      ctx.putImageData(imageData, 0, 0);
    }
    
    // Apply noise
    if (effects.noise > 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const noiseAmount = effects.noise * 2.55; // Convert percentage to 0-255 range
      
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * noiseAmount;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
      }
      
      ctx.putImageData(imageData, 0, 0);
    }
    
    ctx.restore();
    
    // Apply blur as CSS filter on canvas
    if (effects.blur > 0) {
      ctx.filter = `blur(${effects.blur}px)`;
      ctx.drawImage(canvas, 0, 0);
      ctx.filter = 'none';
    }
  }, [effects, config.background]);

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
      if (effects.enableEffects) {
        applyEffects(ctx, canvas, img);
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      }
      
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
      if (effects.enableEffects) {
        applyEffects(ctx, canvas, img);
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      }
      
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

  // Calculate preview styles for visual effect preview
  const getPreviewStyles = () => {
    if (!effects.enableEffects) return {};
    
    return {
      transform: `
        scale(${effects.scale}) 
        rotate(${effects.rotation}deg)
        perspective(1000px) 
        rotateY(${effects.perspective * 0.5}deg)
      `,
      filter: `
        contrast(${effects.contrast})
        brightness(${1 + effects.brightness / 100})
        blur(${effects.blur}px)
      `,
    };
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
          <div 
            className="bg-barcode-bg p-4 rounded-lg shadow-lg glow-border transition-all duration-300"
            style={getPreviewStyles()}
          >
            <svg ref={svgRef} />
          </div>
        )}
      </div>

      {effects.enableEffects && (
        <div className="mt-4 p-3 bg-terminal-bg rounded-lg">
          <p className="text-xs font-mono terminal-text">
            Effects Active: scale={effects.scale.toFixed(2)}x, contrast={effects.contrast.toFixed(2)}, 
            blur={effects.blur}px, noise={effects.noise}%, rotation={effects.rotation}°
          </p>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={noiseCanvasRef} className="hidden" />
    </div>
  );
}
