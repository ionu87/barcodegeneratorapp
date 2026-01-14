import { ScanBarcode } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <ScanBarcode className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Barcode Generator</h1>
            <p className="text-sm text-muted-foreground">
              Generate and customize barcodes instantly
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
