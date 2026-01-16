import { ScanBarcode, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                <ScanBarcode className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                <span className="gradient-text">Barcode</span> Generator
              </h1>
              <p className="text-sm text-muted-foreground">
                Create professional barcodes instantly
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-4 py-2 rounded-full">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>20+ formats supported</span>
          </div>
        </div>
      </div>
    </header>
  );
}