# Barcode Generator - Project Overview

## What It Does

**Barcode Generator** is a desktop/web application for generating, customizing, and exporting barcodes. It has four main features, accessible via tabs:

### 1. Single Barcode Generation (Generate tab)
- Select from **20+ barcode formats** across two categories:
  - **1D barcodes**: CODE 39, CODE 93, CODE 128, EAN-13, EAN-8, EAN-5, EAN-2, UPC-A, UPC-E, ITF-14, ITF, MSI (and variants), Pharmacode, Codabar
  - **2D barcodes**: QR Code, Aztec Code, Data Matrix, PDF417
- Customize dimensions (bar width, height, margin, font size), output scale (0.25x–4x), colors (line color and background), quality level (A/B/C with blur simulation), and checksum type
- Live preview updates as you type, with validation per format
- Download as PNG, copy to clipboard, or print (with native Electron print dialog or browser fallback)

### 2. Image Effects (Effects tab)
- Post-processing pipeline applied to the barcode image: scale, contrast, brightness, blur, noise, rotation, perspective skew, line thickness, and line spacing
- Effects are applied both to the live preview (via CSS transforms/filters) and to the exported image (via canvas pixel manipulation)

### 3. Batch Generation (Batch tab)
- Enter multiple values (one per line) or auto-generate random values
- Preview all barcodes in a grid
- Export as **ZIP** (individual PNGs via jszip) or **PDF** (grid layout via jspdf)
- Print all barcodes at once via a popup window

### 4. Checksum Calculator (Checksum tab)
- Standalone tool: enter any value and instantly see check digits computed with **14 different algorithms** (Luhn, Mod 10/11/43/16, EAN-13, UPC-A, Japan NW-7, JRC, PZN, 7 Check DR, etc.)
- Copy any result to clipboard

### Other Features
- **Dark/light theme toggle** (manual class-based switching on `<html>`)
- Input validation per format with descriptive error messages
- Checksum normalization: for formats with built-in check digits (EAN-13, UPC, etc.), the check digit is stripped before passing to the rendering library, which recalculates it

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend framework** | React 18 + TypeScript |
| **Build tool** | Vite 5 (with SWC plugin for fast compilation) |
| **Desktop packaging** | Electron 28 + electron-builder |
| **Styling** | Tailwind CSS v4 + shadcn/ui (Radix primitives) |
| **1D barcode rendering** | JsBarcode (renders to SVG, converted to canvas for export) |
| **2D barcode rendering** | bwip-js (renders directly to canvas) |
| **PDF export** | jsPDF |
| **ZIP export** | JSZip |
| **Icons** | lucide-react |
| **Toast notifications** | sonner |
| **Routing** | react-router-dom v6 (HashRouter for Electron `file://` compatibility) |
| **State management** | React useState/useCallback lifted to `Index.tsx` |
| **Printing** | Electron IPC (`ipcRenderer.send('print-barcode', dataUrl)`) with browser `window.print()` fallback |

The project was originally scaffolded with **Lovable** (indicated by the `.lovable/` directory and `lovable-tagger` dependency). The Electron main process uses `nodeIntegration: true` / `contextIsolation: false` for direct IPC access from the renderer. Windows is the primary build target (NSIS installer + portable).
