import { BarcodeImageResult } from '@/lib/barcodeImageGenerator';
import { Button } from '@/components/ui/button';
import { Printer, Layers, FileArchive, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BatchPreviewProps {
  images: BarcodeImageResult[];
  onPrint: () => void;
  onDownloadZip?: () => void;
  onExportPDF?: () => void;
  isGenerating: boolean;
  actionsDisabled?: boolean;
}

export function BatchPreview({ images, onPrint, onDownloadZip, onExportPDF, isGenerating, actionsDisabled }: BatchPreviewProps) {
  const btnDisabled = isGenerating || actionsDisabled;

  return (
    <div className="flex flex-col h-full">
      {/* Header with action buttons */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-muted-foreground">Batch Preview</h2>
        {images.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={onDownloadZip}
              disabled={btnDisabled}
              className="gap-2 rounded-xl h-10 px-4 download-btn text-white font-medium"
            >
              <FileArchive className="h-4 w-4" />
              ZIP
            </Button>
            <Button
              size="sm"
              onClick={onExportPDF}
              disabled={btnDisabled}
              className="gap-2 rounded-xl h-10 px-4 download-btn text-white font-medium"
            >
              <FileText className="h-4 w-4" />
              PDF
            </Button>
            <Button
              size="sm"
              onClick={onPrint}
              disabled={isGenerating}
              className="gap-2 rounded-xl h-10 px-4 download-btn text-white font-medium"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        )}
      </div>

      {/* Preview Area */}
      <div className="flex-1 elevated-stage rounded-2xl border border-border/30 min-h-[350px] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 grid-pattern pointer-events-none" />

        {images.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[350px] relative z-10">
            <div className="text-center text-muted-foreground">
              <div className="h-16 w-16 rounded-2xl bg-secondary/80 flex items-center justify-center mx-auto mb-4">
                <Layers className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="font-semibold text-lg">No batch barcodes yet</p>
              <p className="text-sm mt-1 text-muted-foreground/70">Enter values in the Batch tab to preview them here</p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6 relative z-10">
              {images.map((img, i) => (
                <div
                  key={`${img.value}-${i}`}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card/50 border border-border/30"
                >
                  <img
                    src={img.dataUrl}
                    alt={img.value}
                    className="max-w-full h-auto"
                    style={{
                      imageRendering: 'pixelated',
                    }}
                  />
                  <span className="text-xs font-mono text-foreground text-center break-all leading-tight">
                    {img.value}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {images.length > 0 && (
        <div className="mt-4 p-4 bg-muted rounded-xl border border-border/50">
          <p className="text-xs font-mono text-muted-foreground">
            {images.length} barcode{images.length !== 1 ? 's' : ''} generated
          </p>
        </div>
      )}
    </div>
  );
}
