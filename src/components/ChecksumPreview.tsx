import { useEffect, useRef, useMemo } from 'react';
import JsBarcode from 'jsbarcode';
import { AlertCircle, Calculator } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChecksumVariant {
  name: string;
  fullValue: string;
  applicable: boolean;
}

interface ChecksumPreviewProps {
  variants: ChecksumVariant[];
  inputValue: string;
}

function ChecksumBarcodeCard({ name, value }: { name: string; value: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const hasError = useRef(false);

  useEffect(() => {
    if (!svgRef.current || !value) return;
    hasError.current = false;
    try {
      JsBarcode(svgRef.current, value, {
        format: 'CODE128',
        width: 1.5,
        height: 60,
        displayValue: false,
        margin: 5,
        lineColor: '#000000',
        background: '#ffffff',
        font: 'JetBrains Mono',
      });
    } catch {
      hasError.current = true;
    }
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card/50 border border-border/30">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{name}</p>
      <div className="bg-white rounded-lg p-2 w-full flex justify-center">
        <svg ref={svgRef} className="max-w-full h-auto" />
      </div>
      <span className="text-xs font-mono text-foreground text-center break-all leading-tight font-semibold">
        {value}
      </span>
    </div>
  );
}

export function ChecksumPreview({ variants, inputValue }: ChecksumPreviewProps) {
  const applicable = useMemo(
    () => variants.filter(v => v.applicable && v.fullValue !== '-'),
    [variants]
  );

  if (!inputValue.trim()) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-muted-foreground">Checksum Preview</h2>
        </div>
        <div className="flex-1 flex items-center justify-center elevated-stage rounded-2xl border border-border/30 min-h-[350px] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          </div>
          <div className="absolute inset-0 opacity-20 grid-pattern pointer-events-none" />
          <div className="text-center text-muted-foreground relative z-10">
            <div className="h-16 w-16 rounded-2xl bg-secondary/80 flex items-center justify-center mx-auto mb-4">
              <Calculator className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="font-semibold text-lg">Enter a value in the Checksum tab</p>
            <p className="text-sm mt-1 text-muted-foreground/70">All checksum variants will appear here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-muted-foreground">Checksum Preview</h2>
        <span className="text-xs font-mono text-muted-foreground">{applicable.length} variants</span>
      </div>
      <div className="flex-1 elevated-stage rounded-2xl border border-border/30 min-h-[350px] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="absolute inset-0 opacity-20 grid-pattern pointer-events-none" />
        {applicable.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[350px] relative z-10">
            <div className="text-center text-muted-foreground">
              <div className="h-16 w-16 rounded-2xl bg-secondary/80 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="font-semibold text-lg">No applicable checksums</p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-5 relative z-10">
              {applicable.map((v) => (
                <ChecksumBarcodeCard key={v.name} name={v.name} value={v.fullValue} />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
