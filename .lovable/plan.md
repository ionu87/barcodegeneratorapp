

# Fix Batch Screen Issues

## 1. Fix Barcode Label Duplication

The barcode value appears twice because:
- `barcodeImageGenerator.ts` passes `displayValue: true` to JsBarcode, which renders the value text inside the barcode image itself
- The print window and PDF export then add a second label (`<span>` / `pdf.text()`) below the image

**Fix**: Set `displayValue: false` in `barcodeImageGenerator.ts` so the PNG images contain only the barcode bars. The value text will be rendered separately in print/PDF layouts with proper styling, giving full control over text quality and positioning.

## 2. Improve Barcode Value Text Quality

For small output sizes, the text rendered by JsBarcode at `fontSize: 16 * scale` becomes blurry and tiny.

**Fix**: Since we're removing `displayValue` from the image generator, the text in print/PDF will be rendered as actual HTML text (print) or PDF text (jsPDF), which is always sharp regardless of barcode scale. For the batch preview (new), render the value as a separate HTML element with consistent font sizing.

## 3. Add Batch Preview (Isolated State)

Currently the right-side preview panel always shows the Generate tab's barcode. When the Batch tab is active, it should show the batch-generated barcodes instead.

**Changes**:
- Add `generatedImages` state to `BatchGenerator` that stores generated barcode image results
- After any generation action (ZIP/PDF/Print), also populate a preview array
- Add a dedicated "Generate Preview" button that generates images for preview only
- Create a `BatchPreview` component that displays the generated barcode images in a grid
- In `Index.tsx`, track the active tab. When "batch" tab is active, show `BatchPreview` instead of `BarcodePreview` in the right panel
- The batch preview state is entirely owned by `BatchGenerator` -- no shared state with Generate/Effects/Checksum

**Files**:
- New: `src/components/BatchPreview.tsx` - Grid display of batch barcode images with Print button
- Modified: `src/components/BatchGenerator.tsx` - Add `generatedImages` state, pass to preview via callback
- Modified: `src/pages/Index.tsx` - Track active tab, conditionally render BatchPreview or BarcodePreview

## 4. Print Button Consistency

Replace the current "Print All" full-width outline button with a Print button matching the BarcodePreview style:
- Same styling: `variant="outline" size="sm"` with `rounded-xl h-10 px-4 border-border/50 bg-secondary hover:bg-secondary/90`
- Place it in the BatchPreview header (next to a Copy-like position), not in the controls panel
- Remove the "Print All" button from the BatchGenerator controls; printing is triggered from the preview panel

## 5. Fix Blank Page After Print

The print window remains open as `about:blank` after printing.

**Fix**: Add an `afterprint` event listener to the print window that calls `printWindow.close()`. This applies to both the batch print and the single barcode print in BarcodePreview.

## Technical Details

### File Changes

**`src/lib/barcodeImageGenerator.ts`**:
- Change `displayValue: true` to `displayValue: false` in both `generateBarcodeImage` and `generateBarcodeBlob`
- This eliminates the duplicate label since the value text is no longer baked into the PNG

**`src/components/BatchPreview.tsx`** (new file):
- Receives `images: BarcodeImageResult[]` and `onPrint: () => void` as props
- Header row with "Batch Preview" title and Print button (matching BarcodePreview button style)
- Grid layout showing all generated barcode images
- Each image shows the barcode with a centered, sharp text label below it (HTML text, not baked into image)
- Empty state when no images are generated yet

**`src/components/BatchGenerator.tsx`**:
- Add `generatedImages` state: `BarcodeImageResult[]`
- Add `onImagesGenerated` callback prop to pass images up to parent
- Add a "Generate Preview" button that generates all barcode images and stores them
- Remove the "Print All" button (moved to BatchPreview)
- ZIP and PDF generation also update `generatedImages`

**`src/pages/Index.tsx`**:
- Add `activeTab` state tracking which tab is selected
- Add `batchImages` state: `BarcodeImageResult[]`
- Add `batchPrint` callback
- When `activeTab === 'batch'`, render `BatchPreview` in the right panel instead of `BarcodePreview`
- Other tabs continue showing `BarcodePreview` as before

**`src/components/BarcodePreview.tsx`**:
- Fix the print window to close after printing by adding `afterprint` event:
```
printWindow.addEventListener('afterprint', () => printWindow.close());
```

### Print Window Fix (both batch and single)
```
// After window.print() is called:
printWindow.addEventListener('afterprint', () => {
  printWindow.close();
});
```

### BatchPreview Layout
- Header: "Batch Preview" title + Print button (same style as BarcodePreview)
- Body: Scrollable grid of barcode cards
- Each card: barcode image (crisp rendering CSS) + centered monospace value label below
- Empty state: icon + "Generate barcodes in the Batch tab" message

