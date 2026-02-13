# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Barcode Generator is a React + TypeScript desktop application packaged with Electron. It generates both 1D barcodes (via JsBarcode) and 2D barcodes (via bwip-js), with features for single/batch generation, image effects, checksum calculation, and export to PNG/PDF/ZIP.

## Commands

- `npm run dev` — Start Vite dev server (localhost:5173)
- `npm run build` — Production build (outputs to `dist/`)
- `npm run electron:build` — Build + package as Electron app (outputs to `dist_electron/`)
- `npm run preview` — Preview production build locally

No test runner or linter is currently configured in scripts. Vitest config exists in `vite.config.ts` but no test files are present.

## Architecture

**Dual rendering pipeline:** The app uses two barcode libraries depending on format:
- **1D barcodes** (CODE39, EAN13, UPC, etc.) → `JsBarcode` renders to SVG, then converted to canvas for export
- **2D barcodes** (QR Code, Aztec, Data Matrix, PDF417) → `bwip-js` renders directly to canvas

The `is2DBarcode()` helper in `src/lib/barcodeUtils.ts` determines which pipeline to use, and `BarcodePreview.tsx` branches rendering logic accordingly.

**Key source files:**
- `src/lib/barcodeUtils.ts` — Core types (`BarcodeFormat`, `BarcodeConfig`), validation, checksum algorithms, format metadata
- `src/lib/barcodeImageGenerator.ts` — Headless barcode-to-PNG generation (used by batch mode)
- `src/components/BarcodePreview.tsx` — Live preview with SVG/canvas rendering, effects pipeline, download/copy/print
- `src/components/BatchGenerator.tsx` — Batch generation with ZIP (jszip) and PDF (jspdf) export
- `src/components/ImageEffects.tsx` — Image post-processing controls (scale, contrast, blur, noise, rotation, perspective)
- `src/components/ChecksumCalculator.tsx` + `ChecksumPreview.tsx` — Standalone checksum tool
- `electron/main.js` — Electron main process with IPC-based print preview

**Single-page layout:** `src/pages/Index.tsx` is the only page. It uses a tabbed interface (Generate / Effects / Batch / Checksum) on the left with a preview panel on the right. State is lifted to Index and passed down via props.

## Key Patterns

- **Path alias:** `@/` maps to `./src/` (configured in both `vite.config.ts` and `tsconfig.json`)
- **UI components:** shadcn/ui (Radix primitives) in `src/components/ui/`, styled with Tailwind CSS v4
- **Routing:** Uses `HashRouter` (required for Electron's `file://` protocol)
- **Vite base path:** Set to `'./'` for Electron compatibility — relative asset paths are critical
- **Print flow:** In Electron, printing goes through IPC (`ipcRenderer.send('print-barcode', dataUrl)`) to open a native print preview window. In browser, it falls back to `window.open()` + `window.print()`
- **Checksum normalization:** For formats with built-in checksums (EAN13, UPC, etc.), `normalizeForRendering()` strips the check digit before passing to JsBarcode, which recalculates it
- **Toast notifications:** Uses `sonner` library (not the shadcn toast)
- **TypeScript config:** Lenient — `noImplicitAny: false`, `strictNullChecks: false`
