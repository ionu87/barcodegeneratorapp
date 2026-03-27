---
name: project_remaining_debt
description: Technical debt items deferred after the full 2026-03-27 session (Phase 1–3 + SVG export all complete). Four deferred items, all by deliberate architectural decision, not oversight.
type: project
---

# Remaining Technical Debt — Post-Session State (2026-03-27)

All items below were evaluated across Phase 1, Phase 2, Phase 3, and the SVG export sprint. They were NOT addressed by deliberate decision. Each has a documented reason for deferral.

**Current baseline:** BarcodePreview.tsx at 509 lines, 433 tests passing.

---

## 1. `usePrintBarcode` Hook Extraction

**What:** `printBarcode()` in `BarcodePreview.tsx` contains nested closures `openPrintWindow` and `dispatchPrint`. The IPC call `window.electronAPI.openPrintWindow()` lives inside `dispatchPrint`. The browser path now uses an `openSvgPrintWindow` helper with inline SVG.

**Why deferred:** Moving an IPC call into a reusable hook (`usePrintBarcode.ts`) before the preload bridge is formally audited would compound security debt. The type declaration in `src/types/electron.d.ts` was created in Phase 1 (DEBT-9), but the IPC call itself has not been traced through `electron/preload.js` to confirm the handler sanitizes the payload on the main-process side.

**Prerequisite to extraction:**
1. Audit `electron/preload.js` — confirm `openPrintWindow` IPC handler sanitizes all arguments before passing to `BrowserWindow`.
2. Confirm no raw HTML or user data flows from renderer to main process through this channel.
3. Audit whether the handler can accept SVG data URLs — currently the Electron print path is hardcoded to PNG (by design, see AD-9).
4. Only then extract to `src/hooks/usePrintBarcode.ts`.

**Risk if ignored:** An IPC channel that accepts unsanitized renderer-side data is an escalation path in Electron's threat model. The XSS fix from the 2026-03-24 audit addressed `electron/main.js`'s print preview template — the preload bridge on the renderer side is the remaining exposure.

---

## 2. PixelEffectsProcessor Unification

**What:** Two modules contain duplicated canvas render logic:
- `renderExportCanvas` in `src/hooks/useBarcodeRenderer.ts` (extracted in Phase 3)
- `generateBarcodeImage` in `barcodeImageGenerator.ts`

The duplication covers: 1D render path (SVG → Canvas), 2D render path (bwip-js direct), effects application, and output encoding (base64 in the generator, Blob URL in the preview).

**Why deferred:** `barcodeImageGenerator.ts` is consumed by both `BatchGenerator.tsx` and the validation pipeline (`ValidationService`). Merging the effects pipeline into it would:
- Couple a headless renderer to the UI effects system (`ImageEffects.tsx`)
- Force `BatchGenerator` and `ValidationService` to carry the effects dependency even when not generating visual output
- Violate AD-4 (barcodeImageGenerator must remain effects-free)

**The correct approach (future sprint):** Introduce a `RenderPipeline` abstraction that both `barcodeImageGenerator` and `useBarcodeRenderer` delegate to for the raw canvas operations, while keeping effects as an optional post-processing stage that `barcodeImageGenerator` never touches.

**Risk if ignored:** The two render paths will continue to drift. Any fix applied to one (e.g., a JsBarcode options change) must be manually applied to the other. This has already happened at least once.

---

## 3. BarcodePreview JSX Componentization

**What:** `BarcodePreview.tsx` (509 lines after Phase 3) still contains JSX-level responsibilities that could be further componentized:
- `getPreviewStyles()` inline style computation
- Checksum info panel
- Dimensions display panel
- Certification result panel
- Effects debug bar

**Why deferred:** These are UI-only concerns with no logic to test. No critical God Object violations remain — the dangerous logic responsibilities have all been extracted. This is pure cosmetic decomposition.

**Priority:** Low. No architectural risk. Address opportunistically.

---

## 4. SVG Export for Electron Print Path

**What:** `printBarcode()` in `BarcodePreview.tsx` sends a PNG data URL to the Electron IPC `printBarcode` handler. The browser path was upgraded to inline SVG (AD-9), but the Electron path was deliberately kept as PNG.

**Why deferred:** It is unknown whether `electron/main.js`'s `printBarcode` IPC handler can accept an SVG data URL without modification. Changing the data format sent over an unaudited IPC channel is a [BLOCKER]-level Electron security concern (AD-3, AD-9).

**Prerequisite:** Full audit of `electron/main.js` printBarcode handler to verify SVG data URL is safe to pass and correctly processed. Tied to item 1 above (preload audit).

**Risk if ignored:** Electron print output remains rasterized PNG even though the barcode could be printed as vector SVG at physical dimensions. Quality loss for print-heavy workflows. Not a correctness bug.

---

## Tracking Note

Items 1 and 4 are blocked by the same prerequisite: an audit of the Electron print IPC path (`electron/preload.js` → `electron/main.js`). Address them together.

Item 2 is the most significant architectural debt. It is load-bearing — do not collapse it into any sprint without re-reading AD-4 and the RenderPipeline rationale.

Item 3 is cosmetic and can be done opportunistically.

See `project_architecture_decisions.md` for the formal decision records behind items 1, 2, and 4.
