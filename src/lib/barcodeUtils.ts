// Barcode utility functions

export type BarcodeFormat = 
  | 'CODE39'
  | 'CODE128'
  | 'CODE128A'
  | 'CODE128B'
  | 'CODE128C'
  | 'EAN13'
  | 'EAN8'
  | 'UPC'
  | 'ITF14'
  | 'ITF'
  | 'MSI'
  | 'MSI10'
  | 'MSI11'
  | 'MSI1010'
  | 'MSI1110'
  | 'pharmacode'
  | 'codabar';

export interface BarcodeConfig {
  format: BarcodeFormat;
  text: string;
  width: number;
  height: number;
  displayValue: boolean;
  fontSize: number;
  lineColor: string;
  background: string;
  margin: number;
}

export const BARCODE_FORMATS: { value: BarcodeFormat; label: string; description: string; validChars: string }[] = [
  { 
    value: 'CODE39', 
    label: 'CODE 39', 
    description: 'Alphanumeric, widely used in industrial applications',
    validChars: 'A-Z, 0-9, -, ., $, /, +, %, SPACE'
  },
  { 
    value: 'CODE128', 
    label: 'CODE 128', 
    description: 'High-density, supports full ASCII',
    validChars: 'All ASCII characters (0-127)'
  },
  { 
    value: 'CODE128A', 
    label: 'CODE 128A', 
    description: 'Uppercase and control characters',
    validChars: 'A-Z, 0-9, control chars'
  },
  { 
    value: 'CODE128B', 
    label: 'CODE 128B', 
    description: 'Full ASCII text',
    validChars: 'All printable ASCII'
  },
  { 
    value: 'CODE128C', 
    label: 'CODE 128C', 
    description: 'Numeric only, double density',
    validChars: '0-9 (even length)'
  },
  { 
    value: 'EAN13', 
    label: 'EAN-13', 
    description: 'European Article Number, retail products',
    validChars: '12 or 13 digits'
  },
  { 
    value: 'EAN8', 
    label: 'EAN-8', 
    description: 'Short version of EAN-13',
    validChars: '7 or 8 digits'
  },
  { 
    value: 'UPC', 
    label: 'UPC-A', 
    description: 'Universal Product Code, US retail',
    validChars: '11 or 12 digits'
  },
  { 
    value: 'ITF14', 
    label: 'ITF-14', 
    description: 'Interleaved 2 of 5, shipping containers',
    validChars: '13 or 14 digits'
  },
  { 
    value: 'ITF', 
    label: 'ITF', 
    description: 'Interleaved 2 of 5',
    validChars: 'Even number of digits'
  },
  { 
    value: 'MSI', 
    label: 'MSI', 
    description: 'Modified Plessey, inventory control',
    validChars: '0-9'
  },
  { 
    value: 'MSI10', 
    label: 'MSI Mod 10', 
    description: 'MSI with Mod 10 check digit',
    validChars: '0-9'
  },
  { 
    value: 'MSI11', 
    label: 'MSI Mod 11', 
    description: 'MSI with Mod 11 check digit',
    validChars: '0-9'
  },
  { 
    value: 'pharmacode', 
    label: 'Pharmacode', 
    description: 'Pharmaceutical packaging',
    validChars: 'Number 3-131070'
  },
  { 
    value: 'codabar', 
    label: 'Codabar', 
    description: 'Libraries, blood banks, shipping',
    validChars: '0-9, -, $, :, /, ., +'
  },
];

// Calculate various checksums
export function calculateMod10(input: string): number {
  const digits = input.replace(/\D/g, '').split('').map(Number);
  let sum = 0;
  let isOdd = true;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i];
    if (isOdd) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isOdd = !isOdd;
  }
  
  return (10 - (sum % 10)) % 10;
}

export function calculateMod11(input: string): number {
  const digits = input.replace(/\D/g, '').split('').map(Number).reverse();
  const weights = [2, 3, 4, 5, 6, 7];
  let sum = 0;
  
  for (let i = 0; i < digits.length; i++) {
    sum += digits[i] * weights[i % weights.length];
  }
  
  const remainder = sum % 11;
  return remainder === 0 ? 0 : 11 - remainder;
}

export function calculateCode39Checksum(input: string): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%';
  let sum = 0;
  
  for (const char of input.toUpperCase()) {
    const index = chars.indexOf(char);
    if (index !== -1) {
      sum += index;
    }
  }
  
  return chars[sum % 43];
}

export function calculateEAN13Checksum(input: string): number {
  const digits = input.replace(/\D/g, '').slice(0, 12).split('').map(Number);
  let sum = 0;
  
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }
  
  return (10 - (sum % 10)) % 10;
}

export function calculateUPCChecksum(input: string): number {
  const digits = input.replace(/\D/g, '').slice(0, 11).split('').map(Number);
  let oddSum = 0;
  let evenSum = 0;
  
  for (let i = 0; i < 11; i++) {
    if (i % 2 === 0) {
      oddSum += digits[i];
    } else {
      evenSum += digits[i];
    }
  }
  
  const total = (oddSum * 3) + evenSum;
  return (10 - (total % 10)) % 10;
}

export function validateInput(text: string, format: BarcodeFormat): { valid: boolean; message: string } {
  if (!text.trim()) {
    return { valid: false, message: 'Please enter a value' };
  }

  switch (format) {
    case 'CODE39':
      if (!/^[A-Z0-9\-\.\s\$\/\+\%]+$/i.test(text)) {
        return { valid: false, message: 'CODE 39 only supports A-Z, 0-9, -, ., $, /, +, %, and space' };
      }
      break;
    case 'EAN13':
      if (!/^\d{12,13}$/.test(text)) {
        return { valid: false, message: 'EAN-13 requires exactly 12 or 13 digits' };
      }
      break;
    case 'EAN8':
      if (!/^\d{7,8}$/.test(text)) {
        return { valid: false, message: 'EAN-8 requires exactly 7 or 8 digits' };
      }
      break;
    case 'UPC':
      if (!/^\d{11,12}$/.test(text)) {
        return { valid: false, message: 'UPC-A requires exactly 11 or 12 digits' };
      }
      break;
    case 'ITF14':
      if (!/^\d{13,14}$/.test(text)) {
        return { valid: false, message: 'ITF-14 requires exactly 13 or 14 digits' };
      }
      break;
    case 'ITF':
      if (!/^\d+$/.test(text) || text.length % 2 !== 0) {
        return { valid: false, message: 'ITF requires an even number of digits' };
      }
      break;
    case 'CODE128C':
      if (!/^\d+$/.test(text) || text.length % 2 !== 0) {
        return { valid: false, message: 'CODE 128C requires an even number of digits' };
      }
      break;
    case 'pharmacode':
      const num = parseInt(text, 10);
      if (isNaN(num) || num < 3 || num > 131070) {
        return { valid: false, message: 'Pharmacode requires a number between 3 and 131070' };
      }
      break;
    case 'MSI':
    case 'MSI10':
    case 'MSI11':
    case 'MSI1010':
    case 'MSI1110':
      if (!/^\d+$/.test(text)) {
        return { valid: false, message: 'MSI formats only support digits' };
      }
      break;
  }

  return { valid: true, message: '' };
}

export function getDefaultConfig(): BarcodeConfig {
  return {
    format: 'CODE39',
    text: 'BARCODE123',
    width: 2,
    height: 100,
    displayValue: true,
    fontSize: 16,
    lineColor: '#000000',
    background: '#FFFFFF',
    margin: 10,
  };
}
