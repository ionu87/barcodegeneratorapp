import { QualityLevel, QUALITY_LEVELS } from '@/lib/barcodeUtils';
import { cn } from '@/lib/utils';

interface QualitySegmentedControlProps {
  value: QualityLevel;
  onChange: (value: QualityLevel) => void;
}

const qualityOptions = [
  { value: 'C' as QualityLevel, label: 'Low (C)' },
  { value: 'B' as QualityLevel, label: 'Medium (B)' },
  { value: 'A' as QualityLevel, label: 'High (A)' },
];

export function QualitySegmentedControl({ value, onChange }: QualitySegmentedControlProps) {
  return (
    <div className="segmented-control flex rounded-xl p-1 gap-1">
      {qualityOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          data-active={value === option.value}
          className={cn(
            "segmented-option flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200",
            value === option.value
              ? "bg-primary text-primary-foreground neon-glow"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
