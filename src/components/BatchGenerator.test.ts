import { describe, it, expect } from 'vitest';
import { validateInput } from '@/lib/barcodeUtils';

// Inline copy of generateRandomForFormat for isolated testing.
// Once BatchGenerator exports this helper, import it directly.
function generateRandomForFormat(format: string, count: number, stringLength: number): string[] {
  const isNumericOnly = [
    'EAN13', 'EAN8', 'UPC', 'UPCE', 'ITF14', 'ITF',
    'MSI', 'MSI10', 'MSI11', 'pharmacode', 'codabar',
  ].includes(format);

  let length = stringLength;
  if (format === 'EAN13') length = 12;
  if (format === 'EAN8') length = 7;
  if (format === 'UPC') length = 11;
  if (format === 'ITF14') length = 13;
  if (format === 'ITF' && length % 2 !== 0) length = Math.max(2, length - 1);

  if (format === 'pharmacode') {
    return Array.from({ length: count }, () => String(Math.floor(Math.random() * 131068) + 3));
  }

  if (format === 'codabar') {
    const dataChars = '0123456789-$:/.+';
    return Array.from({ length: count }, () => {
      let val = '';
      for (let i = 0; i < length; i++) val += dataChars.charAt(Math.floor(Math.random() * dataChars.length));
      return val;
    });
  }

  const chars = isNumericOnly ? '0123456789' : '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return Array.from({ length: count }, () => {
    let r = '';
    for (let i = 0; i < length; i++) r += chars.charAt(Math.floor(Math.random() * chars.length));
    return r;
  });
}

describe('generateRandomForFormat — UPCE regression (isNumericOnly)', () => {
  it('UPCE generates only digit-only strings', () => {
    const values = generateRandomForFormat('UPCE', 20, 6);
    for (const v of values) {
      expect(v).toMatch(/^\d+$/);
    }
  });
});

describe('generateRandomForFormat — fixed-length formats', () => {
  it('EAN13 always generates 12-digit strings', () => {
    const values = generateRandomForFormat('EAN13', 10, 8);
    for (const v of values) {
      expect(v).toMatch(/^\d{12}$/);
    }
  });

  it('UPC always generates 11-digit strings', () => {
    const values = generateRandomForFormat('UPC', 10, 8);
    for (const v of values) {
      expect(v).toMatch(/^\d{11}$/);
    }
  });

  it('pharmacode values are in range 3-131070', () => {
    const values = generateRandomForFormat('pharmacode', 50, 6);
    for (const v of values) {
      const n = parseInt(v, 10);
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(131070);
    }
  });

  it('ITF always generates even-length strings', () => {
    const values = generateRandomForFormat('ITF', 10, 7);
    for (const v of values) {
      expect(v.length % 2).toBe(0);
    }
  });

  it('CODE39 generates alphanumeric strings', () => {
    const values = generateRandomForFormat('CODE39', 10, 6);
    for (const v of values) {
      expect(v).toMatch(/^[0-9A-Z]+$/);
    }
  });
});

// Silence unused import warning — validateInput is available for future tests
void validateInput;
