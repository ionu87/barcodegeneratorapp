import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import JsBarcode from 'jsbarcode';
import bwipjs from 'bwip-js';
import { BarcodeConfig, applyChecksum, is2DBarcode, QUALITY_LEVELS } from '@/lib/barcodeUtils';
import { ImageEffectsConfig, getDefaultEffectsConfig } from '@/components/ImageEffects';
import { Download, Copy, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface BarcodePreviewProps {
  config: BarcodeConfig;
  effects?: ImageEffectsConfig;
  isValid: boolean;
  errorMessage: string;
}

const defaultEffects = getDefaultEffectsConfig();

// Map our format names to bwip-js format names
function getBwipFormat(format: string): string {
  const formatMap: Record<string, string> = {
    'qrcode': 'qrcode',
    'azteccode': 'azteccode',
    'datamatrix': 'datamatrix',
    'pdf417': 'pdf417',
  };
  return formatMap[format] || format;
}

export function BarcodePreview({ config, effects = defaultEffects, isValid, errorMessage }: BarcodePreviewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const noiseCanvasRef = useRef<HTMLCanvasElement>(null);
  const barcodeCanvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [barcodeDataUrl, setBarcodeDataUrl] = useState<string | null>(null);

  const is2D = is2DBarcode(config.format);

  // Compute the barcode text with checksum applied
  const barcodeText = useMemo(() => {
    return applyChecksum(config.text, config.format, config.checksumType);
  }, [config.text, config.format, config.checksumType]);

  // Get quality blur level
  const qualityBlur = useMemo(() => {
    return QUALITY_LEVELS.find(q => q.value === config.quality)?.blur || 0;
  }, [config.quality]);

  // Compute effective bar width based on line thickness and spacing
  const effectiveWidth = useMemo(() => {
    if (effects.enableEffects) {
      return config.width * effects.lineThickness;
    }
    return config.width;
  }, [config.width, effects.enableEffects, effects.lineThickness]);

  // Render 1D barcodes with JsBarcode
  useEffect(() => {
    if (is2D || !svgRef.current || !isValid || !config.text.trim()) {
      setRenderError(null);
      return;
    }

    try {
      JsBarcode(svgRef.current, barcodeText, {
        format: config.format,
        width: effectiveWidth,
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
  }, [config, isValid, barcodeText, effectiveWidth, is2D]);

  // Render 2D barcodes with bwip-js
  useEffect(() => {
    if (!is2D || !barcodeCanvasRef.current || !isValid || !config.text.trim()) {
      setBarcodeDataUrl(null);
      return;
    }

    try {
      // Build options based on barcode format
      const bwipOptions: Record<string, unknown> = {
        bcid: getBwipFormat(config.format),
        text: barcodeText,
        scale: Math.max(1, Math.round(effectiveWidth)),
        includetext: config.displayValue,
        textsize: config.fontSize,
        textxalign: 'center',
        backgroundcolor: config.background.replace('#', ''),
        barcolor: config.lineColor.replace('#', ''),
        padding: config.margin,
      };

      // Add format-specific options
      if (config.format === 'pdf417') {
        bwipOptions.height = Math.floor(config.height / 10);
        bwipOptions.width = Math.floor(config.height / 3);
      } else if (config.format === 'qrcode' || config.format === 'azteccode' || config.format === 'datamatrix') {
        // For QR, Aztec, and DataMatrix, don't set width/height - they auto-size based on scale
        // These are square barcodes that size themselves
      }

      bwipjs.toCanvas(barcodeCanvasRef.current, bwipOptions as unknown as Parameters<typeof bwipjs.toCanvas>[1]);
      setBarcodeDataUrl(barcodeCanvasRef.current.toDataURL('image/png'));
      setRenderError(null);
    } catch (error) {
      console.error('2D Barcode render error:', error);
      setRenderError(error instanceof Error ? error.message : 'Failed to render 2D barcode');
      setBarcodeDataUrl(null);
    }
  }, [config, isValid, barcodeText, effectiveWidth, is2D]);

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
    
    // Apply line spacing by stretching horizontally
    const spacingMultiplier = effects.lineSpacing;
    const drawWidth = scaledWidth * spacingMultiplier;
    const offsetX = (scaledWidth - drawWidth) / 2;
    
    // Draw the image with spacing applied
    ctx.drawImage(img, offsetX, 0, drawWidth, scaledHeight);
    
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
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    if (is2D) {
      // For 2D barcodes, use the barcodeCanvasRef directly
      if (!barcodeCanvasRef.current) return;
      
      const sourceCanvas = barcodeCanvasRef.current;
      const img = new Image();
      img.onload = () => {
        if (effects.enableEffects) {
          applyEffects(ctx, canvas, img);
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
        }

        const link = document.createElement('a');
        link.download = `barcode-${config.format}-${barcodeText}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        toast.success('Barcode downloaded successfully');
      };
      img.src = sourceCanvas.toDataURL('image/png');
    } else {
      // For 1D barcodes, use the SVG
      if (!svgRef.current) return;
      
      const svg = svgRef.current;
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
        link.download = `barcode-${config.format}-${barcodeText}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        toast.success('Barcode downloaded successfully');
      };

      img.src = url;
    }
  };

  const copyToClipboard = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const processImage = (img: HTMLImageElement, cleanup?: () => void) => {
      if (effects.enableEffects) {
        applyEffects(ctx, canvas, img);
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      }
      
      cleanup?.();

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

    if (is2D) {
      if (!barcodeCanvasRef.current) return;
      
      const img = new Image();
      img.onload = () => processImage(img);
      img.src = barcodeCanvasRef.current.toDataURL('image/png');
    } else {
      if (!svgRef.current) return;
      
      const svg = svgRef.current;
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => processImage(img, () => URL.revokeObjectURL(url));
      img.src = url;
    }
  };

  // Calculate preview styles for visual effect preview
  const getPreviewStyles = () => {
    // Base quality blur
    const baseBlur = qualityBlur;
    
    // Additional effects blur if enabled
    const effectsBlur = effects.enableEffects ? effects.blur : 0;
    const totalBlur = baseBlur + effectsBlur;
    
    if (!effects.enableEffects) {
      return {
        filter: totalBlur > 0 ? `blur(${totalBlur}px)` : undefined,
      };
    }
    
    return {
      transform: `
        scale(${effects.scale}) 
        scaleX(${effects.lineSpacing})
        rotate(${effects.rotation}deg)
        perspective(1000px) 
        rotateY(${effects.perspective * 0.5}deg)
      `,
      filter: `
        contrast(${effects.contrast})
        brightness(${1 + effects.brightness / 100})
        blur(${totalBlur}px)
      `,
    };
  };

  // Show checksum info if applied
  const checksumInfo = config.checksumType !== 'none' && config.text !== barcodeText 
    ? `Value with checksum: ${barcodeText}`
    : null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Preview</h2>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            disabled={!isValid || !!renderError}
            className="gap-2 rounded-xl h-10 px-4 border-border/50 hover:bg-secondary/80"
          >
            {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button
            size="sm"
            onClick={downloadBarcode}
            disabled={!isValid || !!renderError}
            className="gap-2 rounded-xl h-10 px-4 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            <Download className="h-4 w-4" />
            Download PNG
          </Button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-secondary/50 to-secondary/30 rounded-2xl border border-border/30 p-8 min-h-[350px] relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-30 grid-pattern pointer-events-none" />
        
        {/* Scanner effect overlay */}
        {isValid && !renderError && config.text.trim() && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="scanner-line absolute left-0 right-0 h-1 rounded-full" />
          </div>
        )}

        {!config.text.trim() ? (
          <div className="text-center text-muted-foreground relative z-10">
            <div className="h-16 w-16 rounded-2xl bg-secondary/80 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="font-semibold text-lg">Enter a value to generate barcode</p>
            <p className="text-sm mt-1 text-muted-foreground/70">Your barcode will appear here</p>
          </div>
        ) : !isValid ? (
          <div className="text-center text-destructive flex flex-col items-center gap-3 relative z-10">
            <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8" />
            </div>
            <p className="font-semibold text-lg">{errorMessage}</p>
          </div>
        ) : renderError ? (
          <div className="text-center text-destructive flex flex-col items-center gap-3 relative z-10">
            <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8" />
            </div>
            <p className="font-semibold">Render Error</p>
            <p className="text-sm">{renderError}</p>
          </div>
        ) : (
          <div 
            className="bg-barcode-bg p-6 rounded-2xl shadow-2xl glow-border transition-all duration-300 relative z-10"
            style={getPreviewStyles()}
          >
            {is2D ? (
              barcodeDataUrl ? (
                <img src={barcodeDataUrl} alt="2D Barcode" className="max-w-full" />
              ) : (
                <div className="text-muted-foreground">Loading...</div>
              )
            ) : (
              <svg ref={svgRef} />
            )}
          </div>
        )}
      </div>

      {checksumInfo && (
        <div className="mt-4 p-4 bg-primary/10 rounded-xl border border-primary/20">
          <p className="text-sm font-mono text-primary">{checksumInfo}</p>
        </div>
      )}

      {effects.enableEffects && (
        <div className="mt-4 p-4 bg-terminal-bg rounded-xl">
          <p className="text-xs font-mono terminal-text">
            Effects: scale={effects.scale.toFixed(2)}x | contrast={effects.contrast.toFixed(2)} | 
            blur={effects.blur}px | noise={effects.noise}% | rotation={effects.rotation}° | 
            thickness={effects.lineThickness.toFixed(2)}x | spacing={effects.lineSpacing.toFixed(2)}x
          </p>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={noiseCanvasRef} className="hidden" />
      <canvas ref={barcodeCanvasRef} className="hidden" />
    </div>
  );
}