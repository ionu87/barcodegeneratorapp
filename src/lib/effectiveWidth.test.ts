import { describe, it, expect } from 'vitest';
import { snapToPixelGrid } from './barcodeUtils';

// The formula used in BarcodePreview's useMemo to compute the integer bar width.
// Math.round gives the nearest achievable whole-pixel width — this matches
// physical reality: the actual printed mil value is modulePixels * 1000 / DPI.
const calcEffectiveWidth = (mil: number, dpi: number): number =>
  Math.max(1, Math.round((mil * dpi) / 1000));

// ---------------------------------------------------------------------------
// calcEffectiveWidth — known test cases
// ---------------------------------------------------------------------------
describe('calcEffectiveWidth', () => {
  it('7.5 mil @ 300 DPI → 2', () => {
    // 7.5 * 300 / 1000 = 2.25 → round → 2 (actual 6.67 mil)
    expect(calcEffectiveWidth(7.5, 300)).toBe(2);
  });

  it('5 mil @ 300 DPI → 2', () => {
    // 5 * 300 / 1000 = 1.5 → round → 2 (JS rounds half-up)
    expect(calcEffectiveWidth(5, 300)).toBe(2);
  });

  it('7.5 mil @ 600 DPI → 5', () => {
    // 7.5 * 600 / 1000 = 4.5 → round → 5
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
    // 7.5 * 96 / 1000 = 0.72 → round → 1 → max(1,1) = 1
    expect(calcEffectiveWidth(7.5, 96)).toBe(1);
  });

  it('5 mil @ 96 DPI → 1 (clamped from 0.48)', () => {
    // 5 * 96 / 1000 = 0.48 → round → 0 → max(1,0) = 1
    expect(calcEffectiveWidth(5, 96)).toBe(1);
  });

  it('4 mil @ 300 DPI (slider min) → 1', () => {
    // 4 * 300 / 1000 = 1.2 → round → 1
    expect(calcEffectiveWidth(4, 300)).toBe(1);
  });

  it('40 mil @ 600 DPI (slider max) → 24', () => {
    // 40 * 600 / 1000 = 24.0 → 24
    expect(calcEffectiveWidth(40, 600)).toBe(24);
  });
});

// ---------------------------------------------------------------------------
// snapToPixelGrid — physical accuracy tests
// ---------------------------------------------------------------------------
describe('snapToPixelGrid', () => {
  it('7.5 mil @ 300 DPI → 2 px, 6.667 actual mil', () => {
    const snap = snapToPixelGrid(7.5, 300);
    expect(snap.modulePixels).toBe(2);
    expect(snap.actualMils).toBeCloseTo(6.667, 2);
    expect(snap.actualMm).toBeCloseTo(0.1693, 3);
    expect(snap.requestedMils).toBe(7.5);
  });

  it('10 mil @ 300 DPI → 3 px, exact 10 mil', () => {
    const snap = snapToPixelGrid(10, 300);
    expect(snap.modulePixels).toBe(3);
    expect(snap.actualMils).toBeCloseTo(10, 5);
    expect(snap.requestedMils).toBe(10);
  });

  it('7.5 mil @ 600 DPI → 5 px, 8.333 actual mil', () => {
    const snap = snapToPixelGrid(7.5, 600);
    expect(snap.modulePixels).toBe(5);
    expect(snap.actualMils).toBeCloseTo(8.333, 2);
  });

  it('5 mil @ 300 DPI → 2 px, 6.667 actual mil', () => {
    const snap = snapToPixelGrid(5, 300);
    expect(snap.modulePixels).toBe(2);
    expect(snap.actualMils).toBeCloseTo(6.667, 2);
  });

  it('5 mil @ 96 DPI → 1 px (clamped), 10.417 actual mil', () => {
    const snap = snapToPixelGrid(5, 96);
    expect(snap.modulePixels).toBe(1);
    // 1 * 1000 / 96 = 10.417 mil — much larger than requested due to low DPI
    expect(snap.actualMils).toBeCloseTo(10.417, 2);
  });

  it('always returns modulePixels ≥ 1', () => {
    const snap = snapToPixelGrid(0.1, 96);
    expect(snap.modulePixels).toBeGreaterThanOrEqual(1);
  });

  it('actualMils round-trips through the formula', () => {
    // For any snap result: modulePixels === round(requestedMils * dpi / 1000)
    // and actualMils === modulePixels * 1000 / dpi
    for (const [mil, dpi] of [[7.5, 300], [5, 600], [10, 96], [20, 300]] as const) {
      const snap = snapToPixelGrid(mil, dpi);
      expect(snap.modulePixels).toBe(Math.max(1, Math.round(mil * dpi / 1000)));
      expect(snap.actualMils).toBeCloseTo(snap.modulePixels * 1000 / dpi, 10);
    }
  });

  it('7.5 mil @ 300 DPI is NOT compliant (actual < 7.5 mil threshold)', () => {
    // This is a critical insight: the user requests 7.5 mil but at 300 DPI
    // the nearest whole pixel gives only 6.67 mil — below the healthcare threshold.
    const snap = snapToPixelGrid(7.5, 300);
    expect(snap.actualMils).toBeLessThan(7.5);
  });

  it('10 mil @ 300 DPI IS compliant (actual ≥ 7.5 mil)', () => {
    const snap = snapToPixelGrid(10, 300);
    expect(snap.actualMils).toBeGreaterThanOrEqual(7.5);
  });
});

// ---------------------------------------------------------------------------
// Bar position consistency
// ---------------------------------------------------------------------------
describe('bar position consistency', () => {
  it('integer width produces uniform spacing at 10 bar positions', () => {
    const w = 2;
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
    const w = 2.25;
    const positions = Array.from({ length: 10 }, (_, i) => Math.round(i * w));
    const gaps = positions.slice(1).map((pos, i) => pos - positions[i]);
    const allEqual = gaps.every((g) => g === gaps[0]);
    expect(allEqual).toBe(false);
  });

  it('fractional width 1.5 produces inconsistent spacing after rounding', () => {
    const w = 1.5;
    const positions = Array.from({ length: 10 }, (_, i) => Math.round(i * w));
    const gaps = positions.slice(1).map((pos, i) => pos - positions[i]);
    const allEqual = gaps.every((g) => g === gaps[0]);
    expect(allEqual).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Combined formula: Math.max(1, Math.round(effectiveWidth * scale))
// This is the value passed to JsBarcode — always an integer ≥ 1.
// ---------------------------------------------------------------------------

const calcJsBarcodeWidth = (mil: number, dpi: number, scale: number): number => {
  const effectiveWidth = Math.max(1, Math.round((mil * dpi) / 1000));
  return Math.max(1, Math.round(effectiveWidth * scale));
};

describe('JsBarcode width (effectiveWidth × scale) — always integer ≥ 1', () => {
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

  it('5 mil @ 300 DPI × scale 0.75 — effectiveWidth=round(1.5)=2, 2×0.75=1.5 → 2', () => {
    expect(calcJsBarcodeWidth(5, 300, 0.75)).toBe(2);
  });

  it('7.5 mil @ 300 DPI × scale 1.25 — effectiveWidth=round(2.25)=2, 2×1.25=2.5 → 3', () => {
    expect(calcJsBarcodeWidth(7.5, 300, 1.25)).toBe(3);
  });

  it('5 mil @ 600 DPI × scale 0.5 — effectiveWidth=3, 3×0.5=1.5 → 2', () => {
    expect(calcJsBarcodeWidth(5, 600, 0.5)).toBe(2);
  });

  it('7.5 mil @ 600 DPI × scale 0.5 — effectiveWidth=5, 5×0.5=2.5 → 3', () => {
    expect(calcJsBarcodeWidth(7.5, 600, 0.5)).toBe(3);
  });
});
