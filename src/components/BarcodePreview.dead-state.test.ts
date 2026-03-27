import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('BarcodePreview dead code audit', () => {
  const source = readFileSync(
    resolve(__dirname, './BarcodePreview.tsx'),
    'utf-8',
  );

  it('barcodeDimensions is not referenced anywhere in the file (dead state removed)', () => {
    expect(source).not.toContain('barcodeDimensions');
  });

  it('setBarcodeDimensions is not referenced anywhere in the file', () => {
    expect(source).not.toContain('setBarcodeDimensions');
  });
});
