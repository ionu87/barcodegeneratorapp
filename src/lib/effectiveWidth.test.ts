import { describe, it, expect } from 'vitest';

// The formula used in BarcodePreview's useMemo to compute the integer bar width.
// Math.ceil is used (not round) so that 5 mil and 7.5 mil produce distinct widths at 300 DPI:
//   round(1.5)=2, round(2.25)=2 → same; ceil(1.5)=2, ceil(2.25)=3 → different.
const calcEffectiveWidth = (mil: number, dpi: number): number =>
  Math.max(1, Math.ceil((mil * dpi) / 1000));

// ---------------------------------------------------------------------------
// calcEffectiveWidth — known test cases
// ---------------------------------------------------------------------------
describe('calcEffectiveWidth', () => {
  it('7.5 mil @ 300 DPI → 3', () => {
    // 7.5 * 300 / 1000 = 2.25 → ceil → 3 (round would give 2, same as 5 mil — that's the bug)
    expect(calcEffectiveWidth(7.5, 300)).toBe(3);
  });

  it('5 mil @ 300 DPI → 2', () => {
    // 5 * 300 / 1000 = 1.5 → ceil → 2
    expect(calcEffectiveWidth(5, 300)).toBe(2);
  });

  it('5 mil and 7.5 mil @ 300 DPI produce DIFFERENT widths (regression: Math.round collapsed both to 2)', () => {
    // The core bug: Math.round(1.5)=2 and Math.round(2.25)=2 — identical, no visual change.
    // Math.ceil(1.5)=2 and Math.ceil(2.25)=3 — distinct, user sees different bar density.
    expect(calcEffectiveWidth(5, 300)).not.toBe(calcEffectiveWidth(7.5, 300));
  });

  it('7.5 mil @ 600 DPI → 5', () => {
    // 7.5 * 600 / 1000 = 4.5 → round → 5 (rounds half up in JS)
    expect(calcEffectiveWidth(7.5, 600)).toBe(5);
  });

  it('5 mil @ 600 DPI → 3', () => {
    // 5 * 600 / 1000 = 3.0 → 3
    expect(calcEffectiveWidth(5, 600)).toBe(3);
  });

  it('10 mil @ 300 DPI → 3', () => {
    // 10 * 300 / 1000 = 3.0 → 3
    expect(calcEffectiveWidth(10, 300)).toBe(3);
  });

  it('7.5 mil @ 96 DPI → 1 (clamped from 0.72)', () => {
    // 7.5 * 96 / 1000 = 0.72 → round → 1 → max(1, 1) = 1
    expect(calcEffectiveWidth(7.5, 96)).toBe(1);
  });

  it('5 mil @ 96 DPI → 1 (clamped from 0.48)', () => {
    // 5 * 96 / 1000 = 0.48 → round → 0 → max(1, 0) = 1
    expect(calcEffectiveWidth(5, 96)).toBe(1);
  });

  it('4 mil @ 300 DPI (slider min) → 2', () => {
    // 4 * 300 / 1000 = 1.2 → ceil → 2
    expect(calcEffectiveWidth(4, 300)).toBe(2);
  });

  it('40 mil @ 600 DPI (slider max) → 24', () => {
    // 40 * 600 / 1000 = 24.0 → 24
    expect(calcEffectiveWidth(40, 600)).toBe(24);
  });
});

// ---------------------------------------------------------------------------
// Bar position consistency
// ---------------------------------------------------------------------------
describe('bar position consistency', () => {
  it('integer width produces uniform spacing at 10 bar positions', () => {
    const w = 2; // integer width (e.g. from calcEffectiveWidth(7.5, 300))
    const positions = Array.from({ length: 10 }, (_, i) => Math.round(i * w));
    for (let i = 0; i < positions.length; i++) {
      expect(positions[i]).toBe(i * w);
    }
  });

  it('integer width w=3: all positions are exact multiples of w', () => {
    const w = 3;
    for (let i = 0; i < 10; i++) {
      expect(Math.round(i * w) % w).toBe(0);
    }
  });

  it('fractional width 2.25 produces inconsistent spacing after rounding', () => {
    const w = 2.25; // hypothetical fractional width
    const positions = Array.from({ length: 10 }, (_, i) => Math.round(i * w));
    // At some point the gap between consecutive bars differs
    const gaps = positions.slice(1).map((pos, i) => pos - positions[i]);
    const allEqual = gaps.every((g) => g === gaps[0]);
    // Fractional widths cause rounding drift — not all gaps will be equal
    expect(allEqual).toBe(false);
  });

  it('fractional width 1.5 produces inconsistent spacing after rounding', () => {
    const w = 1.5;
    const positions = Array.from({ length: 10 }, (_, i) => Math.round(i * w));
    const gaps = positions.slice(1).map((pos, i) => pos - positions[i]);
    const allEqual = gaps.every((g) => g === gaps[0]);
    // 1.5 alternates between rounds-up and rounds-down creating uneven gaps
    expect(allEqual).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Combined formula: Math.max(1, Math.round(effectiveWidth * scale))
// This is the value that must be passed to JsBarcode — not the unrounded product.
// ---------------------------------------------------------------------------

const calcJsBarcodeWidth = (mil: number, dpi: number, scale: number): number => {
  const effectiveWidth = Math.max(1, Math.ceil((mil * dpi) / 1000));
  return Math.max(1, Math.round(effectiveWidth * scale));
};

describe('JsBarcode width (effectiveWidth × scale) — always integer ≥ 1', () => {
  // Scale slider steps: 0.25 → 4.0 in 0.25 increments
  const scaleValues = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 3.0, 4.0];
  const presets: [number, number][] = [
    [5, 300], [7.5, 300], [5, 600], [7.5, 600], [10, 300], [7.5, 96],
  ];

  for (const [mil, dpi] of presets) {
    for (const scale of scaleValues) {
      it(`${mil} mil @ ${dpi} DPI × scale ${scale} → integer ≥ 1`, () => {
        const w = calcJsBarcodeWidth(mil, dpi, scale);
        expect(Number.isInteger(w)).toBe(true);
        expect(w).toBeGreaterThanOrEqual(1);
      });
    }
  }

  it('5 mil @ 300 DPI × scale 0.75 — without fix this would be 1.5 (fractional)', () => {
    // effectiveWidth = Math.round(1.5) = 2; 2 * 0.75 = 1.5 → must round to 2
    expect(calcJsBarcodeWidth(5, 300, 0.75)).toBe(2);
  });

  it('7.5 mil @ 300 DPI × scale 1.25 — effectiveWidth=ceil(2.25)=3, 3×1.25=3.75 → 4', () => {
    // effectiveWidth = ceil(2.25) = 3; 3 * 1.25 = 3.75 → round → 4
    expect(calcJsBarcodeWidth(7.5, 300, 1.25)).toBe(4);
  });

  it('5 mil @ 600 DPI × scale 0.5 — without fix this would be 1.5 (fractional)', () => {
    // effectiveWidth = 3; 3 * 0.5 = 1.5 → must round to 2
    expect(calcJsBarcodeWidth(5, 600, 0.5)).toBe(2);
  });

  it('7.5 mil @ 600 DPI × scale 0.5 — without fix this would be 2.5 (fractional)', () => {
    // effectiveWidth = 5; 5 * 0.5 = 2.5 → must round to 3
    expect(calcJsBarcodeWidth(7.5, 600, 0.5)).toBe(3);
  });
});
