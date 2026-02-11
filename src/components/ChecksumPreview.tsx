import { useEffect, useRef, useMemo, useCallback } from 'react';
import JsBarcode from 'jsbarcode';
import { AlertCircle, Calculator, Printer } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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

  useEffect(() => {
    if (!svgRef.current || !value) return;
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
      // silent
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

  const printChecksums = useCallback(() => {
    if (applicable.length === 0) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) { toast.error('Pop-up blocked. Please allow pop-ups.'); return; }

    // Build SVG barcodes in the print window
    const cards = applicable.map(v => `
      <div class="cell">
        <p class="label">${v.name}</p>
        <svg id="bc-${v.name.replace(/[^a-zA-Z0-9]/g, '_')}"></svg>
        <span class="value">${v.fullValue}</span>
      </div>
    `).join('');

    printWindow.document.write(`<!DOCTYPE html><html><head><title>Checksum Barcodes</title>
      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3/dist/JsBarcode.all.min.js"><\/script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: monospace; padding: 15mm; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
        .cell { display: flex; flex-direction: column; align-items: center; break-inside: avoid; padding: 10px; border: 1px solid #eee; border-radius: 8px; }
        .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #666; margin-bottom: 6px; }
        .cell svg { max-width: 100%; height: auto; }
        .value { margin-top: 6px; font-size: 13px; font-family: 'Courier New', monospace; color: #000; font-weight: 600; letter-spacing: 0.05em; }
        @media print { body { padding: 10mm; } .cell { break-inside: avoid; } }
      </style></head><body><div class="grid">${cards}</div>
      <script>
        window.addEventListener('afterprint', function() { window.close(); });
        ${applicable.map(v => {
          const id = `bc-${v.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
          return `try { JsBarcode("#${id}", "${v.fullValue}", { format: "CODE128", width: 1.5, height: 60, displayValue: false, margin: 5 }); } catch(e) {}`;
        }).join('\n')}
        setTimeout(function() { window.print(); }, 200);
      <\/script></body></html>`);
    printWindow.document.close();
  }, [applicable]);

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
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-muted-foreground">{applicable.length} variants</span>
          {applicable.length > 0 && (
            <Button
              size="sm"
              onClick={printChecksums}
              className="gap-2 rounded-xl h-10 px-4 download-btn text-white font-medium"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          )}
        </div>
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
