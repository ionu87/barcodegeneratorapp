import { describe, it, expect, vi } from 'vitest';
import { runValidationSuite } from './validationRunner';

vi.mock('./barcodeImageGenerator', () => ({
  generateBarcodeImage: vi.fn().mockResolvedValue({
    dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQABNl7BcQAAAABJRU5ErkJggg==',
    width: 10, height: 10, value: '', widthMm: 0.1, heightMm: 0.1,
  }),
}));
vi.mock('@zxing/browser', () => ({
  BrowserMultiFormatReader: vi.fn().mockImplementation(() => ({
    decodeFromImageUrl: vi.fn().mockRejectedValue(new Error('NotFoundException')),
  })),
  BarcodeFormat: {
    QR_CODE: 0, AZTEC: 1, DATA_MATRIX: 2, PDF_417: 3,
    CODE_128: 4, CODE_39: 5, CODE_93: 6,
    EAN_13: 7, EAN_8: 8, UPC_A: 9, UPC_E: 10,
    ITF: 11, CODABAR: 12,
  },
}));
vi.mock('@zxing/library', () => ({
  DecodeHintType: { POSSIBLE_FORMATS: 0, TRY_HARDER: 1, ALLOWED_LENGTHS: 2 },
  NotFoundException: class NotFoundException extends Error {},
  FormatException: class FormatException extends Error {},
  ChecksumException: class ChecksumException extends Error {},
}));

describe('runValidationSuite', () => {
  it('returns total count matching input test cases', async () => {
    const result = await runValidationSuite([
      { value: 'HELLO', format: 'CODE39' },
      { value: 'WORLD', format: 'CODE39' },
    ]);
    expect(result.total).toBe(2);
  });

  it('certificates array length matches total', async () => {
    const result = await runValidationSuite([{ value: 'HELLO', format: 'CODE39' }]);
    expect(result.certificates).toHaveLength(1);
  });

  it('testLabel is applied from TestCase.label', async () => {
    const result = await runValidationSuite([{ value: 'HELLO', format: 'CODE39', label: 'my-label' }]);
    expect(result.certificates[0].testLabel).toBe('my-label');
  });

  it('falls back to "Test N" when label is omitted', async () => {
    const result = await runValidationSuite([{ value: 'HELLO', format: 'CODE39' }]);
    expect(result.certificates[0].testLabel).toBe('Test 1');
  });

  it('passed count = certificates graded A or B', async () => {
    const result = await runValidationSuite([{ value: 'HELLO', format: 'CODE39' }]);
    const expected = result.certificates.filter((c) => c.isoGrade === 'A' || c.isoGrade === 'B').length;
    expect(result.passed).toBe(expected);
  });

  it('failed count = certificates graded F', async () => {
    const result = await runValidationSuite([{ value: 'HELLO', format: 'CODE39' }]);
    const expected = result.certificates.filter((c) => c.isoGrade === 'F').length;
    expect(result.failed).toBe(expected);
  });

  it('warnings count = certificates graded B', async () => {
    const result = await runValidationSuite([{ value: 'HELLO', format: 'CODE39' }]);
    const expected = result.certificates.filter((c) => c.isoGrade === 'B').length;
    expect(result.warnings).toBe(expected);
  });

  it('durationMs is a non-negative number', async () => {
    const result = await runValidationSuite([{ value: 'HELLO', format: 'CODE39' }]);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
    expect(typeof result.durationMs).toBe('number');
  });

  it('invokes onProgress callback for each case', async () => {
    const progress = vi.fn();
    await runValidationSuite(
      [{ value: 'HELLO', format: 'CODE39' }, { value: 'WORLD', format: 'CODE39' }],
      progress,
    );
    expect(progress).toHaveBeenCalledTimes(2);
    expect(progress).toHaveBeenNthCalledWith(1, 1, 2, expect.any(Object));
    expect(progress).toHaveBeenNthCalledWith(2, 2, 2, expect.any(Object));
  });

  it('empty test cases returns zero totals and empty certificates', async () => {
    const result = await runValidationSuite([]);
    expect(result.total).toBe(0);
    expect(result.certificates).toHaveLength(0);
    expect(result.passed).toBe(0);
    expect(result.failed).toBe(0);
  });
});
