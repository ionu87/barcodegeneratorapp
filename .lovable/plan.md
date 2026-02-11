

# Multi-Feature Enhancement Plan

## 1. Batch Auto-Preview (Remove "Generate Preview" Button)

Currently, the Batch tab requires clicking "Generate Preview" to see barcodes. Instead, barcodes will auto-generate whenever the `values` or `format` or `scale` changes.

**Changes in `BatchGenerator.tsx`:**
- Replace the explicit `generatePreview` function with a `useEffect` that triggers whenever `values`, `format`, or `scale` change
- Use a debounce (300ms) to avoid excessive re-renders while typing
- Remove the "Generate Preview" button from the UI
- Call `onImagesGenerated` automatically after generation

## 2. Reset Dimensions Button

Add a "Reset" button next to the "Dimensions" header in `BarcodeControls.tsx`.

**Changes in `BarcodeControls.tsx`:**
- Add a small "Reset" button (using `RotateCcw` icon) next to the Dimensions section header
- On click, reset `width`, `height`, `margin`, `fontSize`, and `scale` to their defaults from `getDefaultConfig()`

## 3. Move Output Size on Generate Screen

Move the Output Size section in `BarcodeControls.tsx` from its current position (after Display Options, lines 300-362) to directly after the Dimensions section (after line 240, before Colors).

## 4. Reset Effects Button

Add a "Reset Effects" button in `ImageEffects.tsx`.

**Changes in `ImageEffects.tsx`:**
- Add a "Reset" button next to the "Enable Image Effects" toggle or at the bottom
- On click, call `onChange(getDefaultEffectsConfig())`

## 5. Print Button on Checksum Preview

Add a Print button to the `ChecksumPreview.tsx` header, matching the style of the BarcodePreview Print button.

**Changes in `ChecksumPreview.tsx`:**
- Add a Print button in the header row (next to the variant count)
- Implement a print function that opens a print window with all checksum variant barcodes in a grid
- Use `afterprint` event to close the window

## 6. Button Style Consistency

Update Copy and Print buttons across all screens to match the Download PNG button's style (the `download-btn` class with filled background).

**Changes across `BarcodePreview.tsx`, `BatchPreview.tsx`, `ChecksumPreview.tsx`:**
- Change Copy and Print buttons from `variant="outline"` with `bg-secondary` to use the same primary styling as Download PNG: `className="gap-2 rounded-xl h-10 px-4 download-btn text-white font-medium"`

## 7. Contrast and Visibility Fixes

Fix the "Enable Image Effects" toggle area and "Random Generator" section which use `bg-terminal-bg` and `terminal-text` -- in light mode, `terminal-bg` is near-black (`240 10% 4%`) and `terminal-text` is red (`0 100% 50%`), making text unreadable.

**Changes in `src/index.css`:**
- Update light mode `--terminal-bg` to a lighter value (e.g., `240 5% 96%` matching secondary)
- Update light mode `--terminal-text` to a readable dark color (e.g., `240 10% 20%`)

**Alternative (component-level, preferred for minimal side effects):**
- In `ImageEffects.tsx`: Change the toggle container from `bg-terminal-bg` to `bg-secondary/50` and label from `text-terminal-text` to `text-foreground`
- In `BatchGenerator.tsx`: Change the Random Generator container from `bg-terminal-bg` to `bg-secondary/50` and text from `terminal-text` to `text-foreground`

## Technical Details

### Files Modified

| File | Changes |
|------|---------|
| `src/components/BatchGenerator.tsx` | Auto-preview via useEffect with debounce; remove Generate Preview button; fix Random Generator contrast |
| `src/components/BarcodeControls.tsx` | Add Reset Dimensions button; move Output Size below Dimensions |
| `src/components/ImageEffects.tsx` | Add Reset Effects button; fix Enable Effects toggle contrast |
| `src/components/ChecksumPreview.tsx` | Add Print button with print window logic |
| `src/components/BarcodePreview.tsx` | Update Copy/Print button styles to match Download PNG |
| `src/components/BatchPreview.tsx` | Update Print button style to match Download PNG |

### Auto-Preview Debounce Logic

```text
useEffect(() => {
  if no values -> clear images, return
  set debounce timer (300ms)
  on trigger -> generate all barcode images async
  call onImagesGenerated(images)
  cleanup: clear timer
}, [values, format, scale])
```

### Reset Dimensions Defaults

Resets to: `width: 2`, `height: 100`, `margin: 10`, `fontSize: 16`, `scale: 1`

### Reset Effects Defaults

Resets to: `getDefaultEffectsConfig()` (scale 1, contrast 1, brightness 0, blur 0, noise 0, rotation 0, perspective 0, lineThickness 1, lineSpacing 1, enableEffects false)

