import { useState } from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfoTooltipProps {
  content: React.ReactNode;
  className?: string;
}

export function InfoTooltip({ content, className }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className={cn(
          "h-6 w-6 rounded-full flex items-center justify-center",
          "bg-primary/10 hover:bg-primary/20 transition-all duration-200",
          "border border-primary/30 hover:border-primary/50",
          "hover:neon-glow cursor-help",
          className
        )}
        aria-label="More information"
      >
        <Info className="h-3.5 w-3.5 text-primary" />
      </button>
      
      {isVisible && (
        <div className="info-tooltip absolute z-50 left-full ml-3 top-1/2 -translate-y-1/2 w-64 p-3 rounded-xl text-sm animate-fade-in bg-popover border border-border shadow-lg">
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-popover border-l border-b border-border rotate-45" />
          <div className="relative">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}
