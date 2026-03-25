
# Barcodes Guide (7.5 mil, 300 DPI, 40x21 mm)

## What is “mil”
- 1 mil = 0.001 inch
- Used to define the thickness of the smallest barcode line (X-dimension)

## Why mil matters
- Defines smallest bar width
- All bars and spaces are multiples of it

## Common sizes
- 5 mil → very thin, hard to scan
- 7.5 mil → balanced
- 10+ mil → easy to scan

## DPI relationship
- 1 dot = 1 / DPI inch
- mil = (1 / DPI) × 1000

### Example (300 DPI)
- 1 dot = 3.33 mil
- 2 dots ≈ 6.7 mil
- 3 dots ≈ 10 mil

⚠️ Printers use whole dots → 7.5 mil not possible at 300 DPI

---

## Code 39

### Setup
- Narrow = 0.17 mm (2 dots)
- Wide = 0.51 mm

### Width per character
- ≈ 2.72 mm

### Example: ABC123
- Total chars = 8 (including start/stop)
- Width ≈ 21.8 mm
- With quiet zones ≈ 25.2 mm

✔ Fits in 40 mm label

---

## Code 128

### Setup
- 1 module = 0.17 mm
- 1 symbol = 11 modules = 1.87 mm

### Max capacity
- ≈ 16 characters in 40 mm

✔ More efficient than Code 39

---

## Codabar

### Setup
- ≈ 1.3 mm per character

### Max capacity
- ≈ 26 characters

⚠️ Only numbers + limited symbols

---

## ITF (Interleaved 2 of 5)

### Setup
- 0.17 mm per module

### Example: 12345678
- Width ≈ 16.8 mm with margins

✔ Very compact
⚠️ Only numeric

---

## Key Takeaways
- 7.5 mil not achievable at 300 DPI
- Use 2 dots (6.7 mil) or 3 dots (10 mil)
- Code 128 = best balance
- ITF = most compact (numeric only)
- Always include quiet zones

---

## References
https://www.barcodefaq.com/1d/code-39/
https://www.gs1.org/standards/barcodes/x-dimension
