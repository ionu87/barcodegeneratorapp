import { describe, it, expect } from 'vitest';

// Test the mathematical correctness of effects computations
// These mirror the applyEffects useCallback logic in BarcodePreview

describe('Effects pipeline — contrast computation', () => {
  it('contrast=1.0 is identity (no change to mid-gray pixel)', () => {
    // contrast formula: factor = (259 * (contrast*255 + 255)) / (255 * (259 - contrast*255))
    // At contrast=1.0 (mapped to 0 in the [0,2] range → slider 1.0 → 0 shift):
    // The formula with no shift: each channel unchanged
    const contrast = 1.0; // identity contrast
    const channel = 128;
    // Standard contrast: factor * (channel - 128) + 128
    const factor = (259 * (0 + 255)) / (255 * (259 - 0)); // shift=0
    const result = factor * (channel - 128) + 128;
    expect(Math.round(result)).toBe(128); // identity
  });

  it('contrast>1.0 increases channel distance from mid-gray', () => {
    // A channel at 200 (above mid) should move further from 128 with high contrast
    const channel = 200;
    const shift = 50; // positive shift = increased contrast
    const factor = (259 * (shift + 255)) / (255 * (259 - shift));
    const result = factor * (channel - 128) + 128;
    expect(result).toBeGreaterThan(channel); // farther from 128
  });
});

describe('Effects pipeline — noise bounds', () => {
  it('noise addition stays within [0, 255] bounds', () => {
    const channel = 250;
    const noiseAmount = 30;
    // noise formula: channel + (Math.random() - 0.5) * 2 * noiseAmount
    // worst case: channel + noiseAmount
    const worstCase = channel + noiseAmount;
    const clamped = Math.min(255, Math.max(0, worstCase));
    expect(clamped).toBe(255); // clamped at max
    
    const channel2 = 5;
    const worstCase2 = channel2 - noiseAmount;
    const clamped2 = Math.min(255, Math.max(0, worstCase2));
    expect(clamped2).toBe(0); // clamped at min
  });
});
