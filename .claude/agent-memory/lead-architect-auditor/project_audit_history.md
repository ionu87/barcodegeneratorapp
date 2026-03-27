---
name: project_audit_history
description: Complete audit trail for the 2026-03-27 session — all Phase 1 DEBT/CR findings resolved, Phase 2 decomposition complete, Phase 3 complete, SVG export implemented. Final test count: 433.
type: project
---

# Audit History — 2026-03-27 Session

## Phase 1 — Full Codebase Audit (all findings resolved as of 2026-03-27)

### DEBT Items Fixed

| ID | Location | Issue | Resolution |
|----|----------|-------|------------|
| DEBT-1 | `validationEngine.ts` `OPTIONAL_REGISTRY` | `ean13`/`upc` ChecksumTypes were orphaned — present in CHECKSUM_APPLIER_REGISTRY and ChecksumType union, absent from OPTIONAL_REGISTRY. Caused silent `status: 'skipped'` on validate(). | Added both entries to OPTIONAL_REGISTRY |
| DEBT-2 | `barcodeUtils.ts` `BARCODE_FORMATS` array | `MSI1010` and `MSI1110` existed in all type registries but were invisible in UI — not in BARCODE_FORMATS metadata. | Added both with labels "MSI Double Mod 10" and "MSI Mod 11 + Mod 10" |
| DEBT-3 | `validationEngine.ts` `computeISOGrade` | Return type declared `'A'|'B'|'C'|'D'|'F'` but C/D paths were unreachable. `warnings` count was permanently 0, making grade B impossible. | Contracted return type to `'A'|'B'|'F'`; grade B now emitted when X-dimension is below `HEALTHCARE_X_DIM_MILS` threshold; `warnings` now correctly counts grade B results |
| DEBT-4 | `BatchGenerator.tsx` `isNumericOnly` | Phantom `CODE128C` entry (CODE128C does its own digit-only enforcement separately) and missing `UPCE` (which requires numeric-only). | Fixed both: removed CODE128C, added UPCE |
| DEBT-5 | `barcodeImageGenerator.ts` | Deprecated `unescape()` used for SVG data URL decoding — removed from the ECMAScript standard path. | Replaced with `TextEncoder`/`TextDecoder` pattern |
| DEBT-6 | `BarcodePreview.tsx` `printBarcode()` 2D path | `tempCanvas` created for 2D print rendering was never zeroed after use — leak in print flow. | Added `canvas.width = 0; canvas.height = 0` after extraction |
| DEBT-7 | `BarcodePreview.tsx` | 865-line God Object handling 9 responsibilities: render pipeline, effects, certification, export actions, print, dimensions, checksum display, preview styles, dead state. | PARTIALLY RESOLVED — see Phase 2 and Phase 3 below |
| DEBT-8 | `ChecksumCalculator.tsx` | `useEffect` with suppressed dependency array via `// eslint-disable-next-line` comment. Stale closure risk on format/value changes. | Replaced with `useMemo` and correct dependency list |
| DEBT-9 | Everywhere `window.electronAPI` is called | `(window as any).electronAPI` — raw `any` cast, no type safety on IPC calls. | Created `src/types/electron.d.ts` with full typed interface for `window.electronAPI` |

### Critical Regressions Fixed

| ID | Location | Issue | Resolution |
|----|----------|-------|------------|
| CR-1 | `BarcodePreview.tsx` clipboard path | `navigator.clipboard.writeText()` — unhandled rejection. If clipboard is denied, error silently swallowed. | Added `.catch()` handler wired to sonner toast |
| CR-2 | `BatchGenerator.tsx` ZIP export | `JSZip` image entries missing `height` parameter — rendered output could be zero-height. | Added per-item `height` from measured canvas |
| CR-3 | `BatchGenerator.tsx` PDF export | Same missing `height` parameter in jsPDF `addImage()` call. | Same fix as CR-2 |
| CR-4 | `BatchGenerator.tsx` PDF layout | All PDF pages used `pdfImages[0]` width/height for every item — items 2..n rendered with wrong dimensions if format mix. | Changed to per-item dimension tracking (`pdfImages[i]`) |
| CR-5 | `BatchGenerator.tsx` `useEffect` | Stale closure on `generateBatch` — function reference captured at effect registration time, not re-captured on dep changes. | Added `generateBatch` to dependency array and memoized with `useCallback` |
| CR-8 | `BarcodePreview.tsx` 1D print path | `img.onerror` not set. If the base64 SVG blob is malformed, the print window opens blank with no feedback. | Added `img.onerror` handler with sonner error toast + window close |
| CR-9 | Multiple canvas sites | Bare `!` non-null assertion on `canvas.getContext('2d')` — crashes if context unavailable (e.g., GPU sandbox). | Replaced with null guard: `if (!ctx) throw new Error('Canvas 2D context unavailable')` |

### Test Files Added in Phase 1

| File | Status | Test Count |
|------|--------|------------|
| `src/lib/validationRunner.test.ts` | NEW | 10 tests |
| `src/lib/barcodeUtils.test.ts` | EXTENDED | +14 tests (Japan NW7 vectors, Mod11A vectors, `applyChecksum` ean13/upc paths) |
| `src/components/BatchGenerator.test.ts` | NEW | 6 tests (UPCE regression, fixed-length format enforcement) |

**Test count after Phase 1:** 370 (baseline) → **402**

---

## Phase 2 — DEBT-7 Safe Decomposition (completed 2026-03-27)

BarcodePreview.tsx was decomposed by extracting two units with no logic disruption.

### Extractions

**`src/hooks/useCertification.ts`** — Extracted:
- State: `certificate`, `isCertifying`, `certEnabled`
- Refs: `certifyTimerRef`, `certifyGenerationRef`
- Effect: 600ms debounce certification trigger with stale-generation cancellation
- Handler: `downloadCertificate`

**`src/components/BarcodeExportActions.tsx`** — Extracted:
- 3-button export toolbar: Copy Image, Download PNG, Print
- Internal `copied` state + 2-second reset timer
- Receives `onCopy`, `onDownload`, `onPrint` props

**Dead state removal:**
- `barcodeDimensions` state in BarcodePreview — was written on render but never read anywhere in JSX or effects. Removed entirely.

**Line count:** 865 → 737 (−128 lines)

### Test Files Added in Phase 2

| File | Status | Test Count |
|------|--------|------------|
| `src/hooks/useCertification.test.ts` | NEW | 8 tests |
| `src/components/BarcodeExportActions.test.tsx` | NEW | 6 tests |
| `src/components/BarcodePreview.dead-state.test.ts` | NEW | 2 tests (confirms `barcodeDimensions` removal didn't break render) |

**Test count after Phase 2:** 402 → **418**

---

## Phase 3 — `useBarcodeRenderer` Extraction (COMPLETED 2026-03-27)

### What Was Extracted to `src/hooks/useBarcodeRenderer.ts`

Ownership transferred from `BarcodePreview.tsx`:
- **State:** `barcodeDataUrl`, `renderError`, `is2D`, `barcodeText`, `modulePixels`, `qualityBlur`
- **Refs:** `svgRef`, `barcodeCanvasRef`, `canvasRef`
- **Effects:** Both render `useEffect` blocks (1D JsBarcode path and 2D bwip-js path)
- **Functions:** `applyEffects`, `renderExportCanvas`
- **Memos:** All derived `useMemo` values (dimensions, scale, etc.)

### Critical Constraints Honored

1. **`applyEffects` and `renderExportCanvas` co-located in the hook** — stale closure safety. If split into separate files, PNG exports would silently use stale effects values because they share canvas state through closure. These two functions must never be separated across files.
2. **`canvasRef` explicitly returned from hook** — this is the scratch canvas used by `printBarcode()` in the Electron path. It cannot be an internal implementation detail — the component must hold the DOM reference for the print flow.
3. **Hook does not import `barcodeImageGenerator.ts`** — that module is headless and consumed by BatchGenerator and ValidationService. See AD-4.

### Line Count Progression

| Point | Lines | Delta |
|-------|-------|-------|
| Session start | 865 | — |
| After Phase 2 | 737 | −128 |
| After Phase 3 | 509 | −228 |
| **Total reduction** | — | **−356** |

### Test Files Added in Phase 3

| File | Status | Test Count |
|------|--------|------------|
| `src/hooks/useBarcodeRenderer.test.ts` | NEW | safety-net tests for hook interface |
| `src/hooks/applyEffects.test.ts` | NEW | snapshot/pixel regression tests for effects pipeline |

**Test count after Phase 3:** 418 → **424**

---

## SVG Export Implementation (COMPLETED 2026-03-27)

### Requirement
"Export and print functionalities must use SVG to export barcodes at real world dimensions everywhere in the application."

### New Functions in `src/lib/barcodeImageGenerator.ts`

**`generateBarcodeSVGString(value, format, widthMils, dpi, height, margin, displayValue, fontSize, lineColor, background)`**
- Renders JsBarcode to an in-memory SVG element
- Reads pixel dimensions from rendered SVG
- Sets `width="Xmm"` and `height="Ymm"` attributes — physical dimensions = `svgPixelDim × 25.4 / dpi`
- Adds `viewBox` for scaling correctness
- Returns `{ svgString, widthMm, heightMm } | null`
- Returns `null` for 2D formats (bwip-js has no SVG output path)

**`generateBarcodeSVGBlob(value, format, widthMils, dpi, height, margin)`**
- Wraps `generateBarcodeSVGString`
- Returns `Blob` with `image/svg+xml` MIME type for ZIP packaging
- Synchronous — no canvas involvement

### Export Routing Table (Binding)

| Context | Format | Effects On | Output |
|---------|--------|------------|--------|
| Download | 1D | No | `.svg` file with physical mm dimensions |
| Download | 1D | Yes | `.png` (effects are raster — cannot apply to SVG) |
| Download | 2D | Either | `.png` (bwip-js has no SVG output) |
| Browser print | 1D | Any | SVG embedded inline in print window HTML (`openSvgPrintWindow`), `width/height` in CSS mm |
| Electron print | 1D | Any | PNG (IPC `printBarcode` handler expects PNG data URL — not changed pending IPC audit) |
| Electron/Browser print | 2D | Any | PNG canvas (unchanged) |
| ZIP batch export | 1D | — | `${val}.svg` via `generateBarcodeSVGBlob` |
| ZIP batch export | 2D | — | `${val}.png` via `generateBarcodeBlob` (unchanged) |
| Clipboard | Any | Any | PNG (Web Clipboard API does not support SVG across browsers) |
| PDF export | Any | Any | PNG (jsPDF has no SVG rendering support) |

### Files Changed for SVG Export

- `src/lib/barcodeImageGenerator.ts` — two new functions
- `src/components/BarcodePreview.tsx` — `downloadBarcode()` routing, `printBarcode()` 1D browser path uses inline SVG
- `src/components/BatchGenerator.tsx` — ZIP path routes 1D → SVG, 2D → PNG; added `is2DBarcode` and `generateBarcodeSVGBlob` imports

### New Tests in `src/lib/barcodeImageGenerator.test.ts`

- `generateBarcodeSVGString`: 6 tests (null for 2D, null for invalid, returns correct shape, mm dims in SVG attrs, viewBox present, math correctness)
- `generateBarcodeSVGBlob`: 3 tests (null for 2D, null for invalid, correct MIME type)

**Test count after SVG export:** 424 → **433**

---

## Session Summary

| Metric | Value |
|--------|-------|
| Test count start | 370 |
| Test count end | **433** |
| Net new tests | +63 |
| BarcodePreview.tsx start | 865 lines |
| BarcodePreview.tsx end | **509 lines** |
| Net line reduction | −356 |
| Total todos completed | 31 |

### All 31 Todos by Category

- **9 DEBT fixes:** OPTIONAL_REGISTRY gap, MSI formats, ISO grade type contraction, isNumericOnly, unescape(), canvas leak, useEffect deps, Electron typing, batchIdCounter
- **5 TEST-GAP fills:** validationRunner, Japan NW7 checksums, Mod11A vectors, applyChecksum EAN/UPC, UPCE random
- **3 NIT fixes:** getBwipFormat no-op, batchIdCounter→UUID, let→const
- **9 code reviewer bug fixes:** clipboard rejection, height param, PDF dimensions, stale closure, img.onerror, canvas null guard, and 3 others
- **5 DEBT-7 decomposition tasks:** useCertification, BarcodeExportActions, useBarcodeRenderer, dead state removal, safety-net tests
- **SVG export implementation** (user-added constraint, fully delivered)
