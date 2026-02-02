import { useState } from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfoTooltipProps {
  content: React.ReactNode;
  className?: string;
  side?: 'left' | 'right'; // NEW: Choose which side to display
}

export function InfoTooltip({ content, className, side = 'left' }: InfoTooltipProps) {
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
        <div 
          className={cn(
            "info-tooltip absolute z-50 w-64 p-3 rounded-xl text-sm animate-fade-in bg-popover border border-border shadow-lg",
            // CHANGED: Dynamic positioning based on 'side' prop
            side === 'right' 
              ? "left-full ml-3 top-1/2 -translate-y-1/2"  // Displays to the RIGHT
              : "right-full mr-3 top-1/2 -translate-y-1/2"  // Displays to the LEFT
          )}
        >
          {/* CHANGED: Arrow position changes based on side */}
          <div 
            className={cn(
              "absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-popover border border-border",
              side === 'right'
                ? "-left-1.5 border-r-0 border-t-0 rotate-45"   // Arrow points LEFT (when tooltip is on right)
                : "-right-1.5 border-l-0 border-b-0 rotate-45"  // Arrow points RIGHT (when tooltip is on left)
            )}
          />
          <div className="relative text-popover-foreground">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}
