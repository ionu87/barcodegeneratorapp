

# Batch Screen Enhancements

## Overview
Add three features to the Batch Generator: Output Size control, direct batch printing, and PDF export. All changes are in `src/components/BatchGenerator.tsx` plus adding the `jspdf` dependency.

## 1. Output Size Control
- Add `scale` state (default: 1) to BatchGenerator
- Add the same UI from BarcodeControls: three preset buttons (Small 0.5x, Medium 1x, Large 2x) and a custom slider (0.25x-4x) with the Maximize2 icon header
- Apply scale to all JsBarcode render params: `width: 2 * scale`, `height: 100 * scale`, `fontSize: 16 * scale`, `margin: 10 * scale`
- Place the Output Size section between Format Selection and Random Generator

## 2. Direct Batch Printing
- Add a "Print All" button with Printer icon
- On click, generate all barcode images as PNG data URLs (with scale applied), then open a print window
- Print window uses a responsive grid layout (2-3 barcodes per row) with each barcode's value as a label underneath
- Apply the same crisp rendering CSS from BarcodePreview: `image-rendering: crisp-edges`, `pixelated`, `-webkit-optimize-contrast`, `print-color-adjust: exact`
- Uses progress bar during image generation, then opens the print dialog
- User can cancel via the browser's native print cancel

## 3. PDF Export
- Install `jspdf` as a new dependency
- Add a "Download as PDF" button with FileText icon
- Generate all barcode images, then create an A4-sized PDF using jspdf
- Arrange barcodes in a grid layout, auto-calculating columns/rows based on image dimensions
- Add page breaks when content exceeds page height
- Print value label below each barcode
- Auto-download with filename `batch_barcodes_YYYY-MM-DD.pdf`

## 4. Button Layout
Replace the single "Download All as ZIP" button with three buttons in a grid:
- **Download as ZIP** (primary, FileArchive icon) - existing functionality
- **Download as PDF** (outline, FileText icon) - new
- **Print All** (outline, Printer icon) - new

All three buttons share the same disabled state (disabled when generating or no values entered).

## Technical Details

### File Changes

**`src/components/BatchGenerator.tsx`**:
- New state: `scale` (number, default 1)
- New imports: `Printer`, `FileText`, `Maximize2` from lucide-react; `jspdf`
- Extract a shared `generateBarcodeImage(value, format, scale)` helper that returns a PNG data URL, used by ZIP, PDF, and Print flows
- The helper uses `normalizeForRendering` from barcodeUtils (matching what BarcodePreview does) and disables canvas image smoothing
- New `printBatchBarcodes()` function: generates images, opens print window with grid layout
- New `exportAsPDF()` function: generates images, creates jspdf document with grid layout, saves file
- Updated UI with Output Size section and three action buttons

**`package.json`**: Add `jspdf` dependency

### Shared Barcode Image Generator
```text
generateBarcodeImage(value, format, scale)
  |-> validate input
  |-> create SVG via JsBarcode (with scaled params)
  |-> serialize SVG -> load as Image -> draw to canvas (imageSmoothingEnabled = false)
  |-> return { dataUrl, width, height }
```

### Print Window Layout
- CSS grid with `grid-template-columns: repeat(auto-fill, minmax(250px, 1fr))`
- Each cell: centered barcode image + value label in monospace font
- Page break handling via `break-inside: avoid`
- Auto-triggers `window.print()` after images load

### PDF Layout
- A4 page (210mm x 297mm) with 15mm margins
- Calculate how many barcodes fit per row based on image width
- 10mm gap between barcodes, 8mm gap between rows
- Auto page-break when exceeding page height
- Value text rendered below each barcode in 8pt font
