import { ScanBarcode, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export function Header() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check initial theme
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="border-b border-border/50 glass-panel sticky top-0 z-50">
      <div className="container mx-auto px-4 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg neon-glow">
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
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-4 py-2 rounded-full">
              <span className="neon-text font-semibold">20+</span>
              <span>formats supported</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="theme-toggle h-10 w-10 rounded-xl border-border/50 bg-secondary/50 hover:bg-secondary/80"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-primary" />
              ) : (
                <Moon className="h-5 w-5 text-primary" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
