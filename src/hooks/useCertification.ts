import { useState, useRef, useEffect, useCallback } from 'react';
import { BarcodeConfig } from '@/lib/barcodeUtils';
import { ValidationService, ValidationCertificate } from '@/lib/validationService';
import { toast } from 'sonner';

export interface UseCertificationResult {
  certificate: ValidationCertificate | null;
  isCertifying: boolean;
  certEnabled: boolean;
  setCertEnabled: (v: boolean) => void;
  downloadCertificate: () => void;
}

export function useCertification(
  config: BarcodeConfig,
  isValid: boolean,
): UseCertificationResult {
  const [certificate, setCertificate] = useState<ValidationCertificate | null>(null);
  const [isCertifying, setIsCertifying] = useState(false);
  const [certEnabled, setCertEnabled] = useState(false);
  const certifyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const certifyGenerationRef = useRef(0);

  useEffect(() => {
    if (!certEnabled || !isValid || !config.text.trim()) {
      setCertificate(null);
      setIsCertifying(false);
      if (certifyTimerRef.current) clearTimeout(certifyTimerRef.current);
      return;
    }
    if (certifyTimerRef.current) clearTimeout(certifyTimerRef.current);
    const generation = ++certifyGenerationRef.current;
    setIsCertifying(true);
    certifyTimerRef.current = setTimeout(async () => {
      const svc = new ValidationService();
      const cert = await svc.certify(config);
      if (certifyGenerationRef.current === generation) {
        setCertificate(cert);
        setIsCertifying(false);
      }
    }, 600);
    return () => {
      if (certifyTimerRef.current) clearTimeout(certifyTimerRef.current);
    };
  }, [config, isValid, certEnabled]);

  const downloadCertificate = useCallback(() => {
    if (!certificate) return;
    const json = JSON.stringify(certificate, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `cert-${config.format}-${Date.now()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Certificate downloaded');
  }, [certificate, config.format]);

  return { certificate, isCertifying, certEnabled, setCertEnabled, downloadCertificate };
}
