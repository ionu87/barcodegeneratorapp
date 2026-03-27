import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCertification } from '@/hooks/useCertification';
import { getDefaultConfig } from '@/lib/barcodeUtils';

const mockCertify = vi.hoisted(() => vi.fn());

vi.mock('@/lib/validationService', () => ({
  ValidationService: vi.fn(function(this: any) { this.certify = mockCertify; }),
  HEALTHCARE_X_DIM_MILS: 7.5,
}));

const stubCert = () => ({
  timestamp: new Date().toISOString(),
  symbologyDetected: 'CODE 39',
  rawData: 'TEST',
  decodedData: 'TEST',
  checksumCalculationStatus: { status: 'not_applicable', algorithm: 'none', expected: null, provided: null, message: '' },
  isoGrade: 'A' as const,
  bitPerfectMatch: true,
  roundTripSuccess: true,
  xDimensionMils: 7.5,
  xDimensionCompliant: true,
  scanVerification: 'pass' as const,
  scanVerificationNote: null,
  errors: [],
  testLabel: null,
});

describe('useCertification', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockCertify.mockResolvedValue(stubCert());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('does not certify when certEnabled is false', async () => {
    const config = { ...getDefaultConfig(), text: 'HELLO' };
    const { result } = renderHook(() => useCertification(config, true));
    await act(async () => { vi.advanceTimersByTime(700); });
    expect(mockCertify).not.toHaveBeenCalled();
    expect(result.current.certificate).toBeNull();
  });

  it('does not certify when isValid is false', async () => {
    const config = { ...getDefaultConfig(), text: 'HELLO' };
    const { result } = renderHook(() => useCertification(config, false));
    act(() => { result.current.setCertEnabled(true); });
    await act(async () => { vi.advanceTimersByTime(700); });
    expect(mockCertify).not.toHaveBeenCalled();
  });

  it('does not certify when config.text is empty', async () => {
    const config = { ...getDefaultConfig(), text: '' };
    const { result } = renderHook(() => useCertification(config, true));
    act(() => { result.current.setCertEnabled(true); });
    await act(async () => { vi.advanceTimersByTime(700); });
    expect(mockCertify).not.toHaveBeenCalled();
  });

  it('fires certify after 600ms debounce when conditions are met', async () => {
    const config = { ...getDefaultConfig(), text: 'HELLO' };
    const { result } = renderHook(() => useCertification(config, true));
    act(() => { result.current.setCertEnabled(true); });
    await act(async () => { vi.advanceTimersByTime(599); });
    expect(mockCertify).not.toHaveBeenCalled();
    await act(async () => { vi.advanceTimersByTime(1); });
    expect(mockCertify).toHaveBeenCalledOnce();
    expect(result.current.isCertifying).toBe(false);
  });

  it('sets isCertifying=true while debounce is pending', async () => {
    const config = { ...getDefaultConfig(), text: 'HELLO' };
    const { result } = renderHook(() => useCertification(config, true));
    act(() => { result.current.setCertEnabled(true); });
    await act(async () => { vi.advanceTimersByTime(0); });
    expect(result.current.isCertifying).toBe(true);
    await act(async () => { vi.advanceTimersByTime(700); });
    expect(result.current.isCertifying).toBe(false);
  });

  it('cancels stale generation when config changes rapidly', async () => {
    let config = { ...getDefaultConfig(), text: 'HELLO' };
    const { result, rerender } = renderHook(
      ({ cfg }) => useCertification(cfg, true),
      { initialProps: { cfg: config } },
    );
    act(() => { result.current.setCertEnabled(true); });
    await act(async () => { vi.advanceTimersByTime(300); });
    config = { ...config, text: 'WORLD' };
    rerender({ cfg: config });
    await act(async () => { vi.advanceTimersByTime(700); });
    expect(mockCertify).toHaveBeenCalledOnce();
  });

  it('clears certificate when certEnabled is toggled off', async () => {
    const config = { ...getDefaultConfig(), text: 'HELLO' };
    const { result } = renderHook(() => useCertification(config, true));
    act(() => { result.current.setCertEnabled(true); });
    await act(async () => { vi.advanceTimersByTime(700); });
    expect(result.current.certificate).not.toBeNull();
    act(() => { result.current.setCertEnabled(false); });
    expect(result.current.certificate).toBeNull();
    expect(result.current.isCertifying).toBe(false);
  });

  it('downloadCertificate is a no-op when certificate is null', () => {
    const config = { ...getDefaultConfig(), text: 'HELLO' };
    const { result } = renderHook(() => useCertification(config, true));
    expect(() => result.current.downloadCertificate()).not.toThrow();
  });
});
