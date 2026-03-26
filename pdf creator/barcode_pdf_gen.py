"""
barcode_pdf_gen.py — High-precision label sheet generator (A4, ReportLab).

Auto-discovers PNG files and arranges them into a grid with an interactive editor.
Run: python barcode_pdf_gen.py
"""

import glob
import os
import sys
import time
from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

COLUMNS = [
    {"rect_w": 75 * mm, "rect_h": 21 * mm, "img_w": 66 * mm, "img_h": 16 * mm},
    {"rect_w": 50 * mm, "rect_h": 21 * mm, "img_w": 41 * mm, "img_h": 16 * mm},
    {"rect_w": 41 * mm, "rect_h": 21 * mm, "img_w": 32 * mm, "img_h": 16 * mm},
]
COLS_PER_ROW = len(COLUMNS)

FORMAT_CHECKSUM_TYPE = {
    "CODE39": "Mod 43", "codabar": "Mod 16",
    "ITF": "Mod 10", "MSI": "Mod 10/11",
}

BORDER_WIDTH = 0.2 * mm
MARGIN_TOP = 20 * mm
MARGIN_BOTTOM = 15 * mm
ROW_SPACING = 12 * mm
TEXT_OFFSET = 4 * mm
FONT_SIZE = 7

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def prompt(msg: str) -> str:
    """Read a line from stdin, flushing stdout first (fixes PowerShell buffering)."""
    sys.stdout.write(msg)
    sys.stdout.flush()
    try:
        return input().strip()
    except (EOFError, KeyboardInterrupt):
        print()
        return ""


def parse_filename(filepath: str) -> tuple[str, str]:
    """Parse format and data from 'barcode-FORMAT-DATA.png'."""
    name = os.path.splitext(os.path.basename(filepath))[0]
    if name.startswith("barcode-"):
        parts = name.split("-", 2)
        if len(parts) == 3:
            return parts[1], parts[2]
        if len(parts) == 2:
            return "", parts[1]
    return "", name


def make_label(filepath: str, col_idx: int) -> dict:
    """Create a label dict for a file placed in a given column."""
    col = COLUMNS[col_idx]
    fmt, data = parse_filename(filepath)
    return {
        "rect_w": col["rect_w"], "rect_h": col["rect_h"],
        "img_w": col["img_w"], "img_h": col["img_h"],
        "image": filepath, "format": fmt, "data": data,
    }


def empty_label(col_idx: int) -> dict:
    """Create an empty placeholder for a column."""
    col = COLUMNS[col_idx]
    return {
        "rect_w": col["rect_w"], "rect_h": col["rect_h"],
        "img_w": col["img_w"], "img_h": col["img_h"],
        "image": "", "format": "", "data": "",
    }


def find_all_pngs() -> list[str]:
    """All PNG files in the script directory."""
    return sorted(glob.glob(os.path.join(SCRIPT_DIR, "*.png")))


def best_fit_column(image_path: str) -> int:
    """Pick the column whose width the image fills best."""
    with Image.open(image_path) as img:
        aspect = img.width / img.height
    # Try widest columns first; pick first with >= 70% width fill
    by_width = sorted(range(COLS_PER_ROW), key=lambda i: COLUMNS[i]["img_w"], reverse=True)
    for idx in by_width:
        col = COLUMNS[idx]
        fill = (col["img_h"] * aspect) / col["img_w"]
        if fill >= 0.7:
            return idx
    return by_width[-1]


def annotation_text(label: dict) -> str:
    """Build the text shown below a rectangle."""
    fmt = label.get("format", "")
    data = label.get("data", "")
    if not data:
        return ""
    chk = FORMAT_CHECKSUM_TYPE.get(fmt, "")
    if fmt and chk:
        return f"{fmt} | {data} — {chk}"
    if fmt:
        return f"{fmt} | {data}"
    return data


# ---------------------------------------------------------------------------
# Auto-assign
# ---------------------------------------------------------------------------

def auto_assign() -> dict[int, list[dict]]:
    """Auto-place all PNGs into best-fit columns."""
    buckets = {i: [] for i in range(COLS_PER_ROW)}
    for fp in find_all_pngs():
        col_idx = best_fit_column(fp)
        buckets[col_idx].append(make_label(fp, col_idx))
        col = COLUMNS[col_idx]
        print(f"  {os.path.basename(fp)} -> col {col_idx+1} ({col['rect_w']/mm:.0f}x{col['rect_h']/mm:.0f}mm)")
    return buckets


# ---------------------------------------------------------------------------
# Interactive editor
# ---------------------------------------------------------------------------

def used_images(buckets: dict[int, list[dict]]) -> set[str]:
    return {l["image"] for b in buckets.values() for l in b if l["image"]}


def show_layout(buckets: dict[int, list[dict]]):
    max_depth = max((len(b) for b in buckets.values()), default=0)
    if max_depth == 0:
        max_depth = 1  # show at least one empty row

    print()
    # Header
    header = "       "
    for ci in range(COLS_PER_ROW):
        w = COLUMNS[ci]["rect_w"] / mm
        h = COLUMNS[ci]["rect_h"] / mm
        header += f"Col {ci+1} ({w:.0f}x{h:.0f}mm)".ljust(32)
    print(header)
    print("  " + "-" * (5 + 32 * COLS_PER_ROW))

    # Rows
    for ri in range(max_depth):
        line = f"  R{ri+1}:  "
        for ci in range(COLS_PER_ROW):
            if ri < len(buckets[ci]) and buckets[ci][ri]["image"]:
                name = os.path.basename(buckets[ci][ri]["image"])
                # Truncate long names
                if len(name) > 28:
                    name = name[:25] + "..."
                line += name.ljust(32)
            else:
                line += "---".ljust(32)
        print(line)
    print()


def show_available(buckets: dict[int, list[dict]]):
    used = used_images(buckets)
    available = [f for f in find_all_pngs() if f not in used]
    if available:
        print("  Available images:")
        for i, f in enumerate(available, 1):
            print(f"    {i}. {os.path.basename(f)}")
    else:
        print("  All images are placed.")
    print()


def show_help():
    print("""
  Commands:
    generate                       Generate the PDF now
    auto                           Auto-assign all images to best-fit columns
    rescan                         Re-scan folder for new/removed images
    remove <row> <col>             Remove image from a cell
    add <col> <filename>           Add image to a column
    replace <row> <col> <filename> Replace image in a cell
    move <r1> <c1> <r2> <c2>      Move image between cells
    clear                          Remove all images
    clear <col>                    Remove all from a column
    list                           Show available images
    quit                           Exit
""")


def resolve_file(name: str) -> str | None:
    """Resolve a filename to a full path. Returns None if not found."""
    path = os.path.join(SCRIPT_DIR, name)
    if os.path.isfile(path):
        return path
    # Try case-insensitive match
    for f in os.listdir(SCRIPT_DIR):
        if f.lower() == name.lower():
            return os.path.join(SCRIPT_DIR, f)
    return None


def interactive_edit(buckets: dict[int, list[dict]]) -> dict[int, list[dict]] | None:
    show_layout(buckets)
    show_help()

    while True:
        cmd = prompt("  > ")
        if not cmd:
            continue

        parts = cmd.split()
        action = parts[0].lower()

        if action in ("generate", "gen"):
            total = sum(len(b) for b in buckets.values())
            if total == 0:
                print("  No images in layout. Add some first.")
                continue
            output_path = os.path.join(SCRIPT_DIR, "label_sheet.pdf")
            try:
                rows = build_rows(buckets)
                render_pdf(rows, output_path)
                print("  You can keep editing and type 'generate' again to update.\n")
            except PermissionError:
                print("  ERROR: Cannot write PDF — close it in your viewer first!")
            continue

        if action == "quit":
            return None

        if action == "auto":
            for ci in range(COLS_PER_ROW):
                buckets[ci].clear()
            buckets = auto_assign()
            print()
            show_layout(buckets)
            continue

        if action == "rescan":
            new_pngs = find_all_pngs()
            current = used_images(buckets)
            added = [f for f in new_pngs if f not in current]
            removed = [f for f in current if f not in new_pngs]
            # Remove labels for deleted files
            for ci in range(COLS_PER_ROW):
                buckets[ci] = [l for l in buckets[ci] if l["image"] not in removed]
            if removed:
                print(f"  Removed {len(removed)} missing image(s).")
            if added:
                print(f"  Found {len(added)} new image(s):")
                for f in added:
                    print(f"    {os.path.basename(f)}")
            if not added and not removed:
                print("  No changes found.")
            print()
            show_layout(buckets)
            show_available(buckets)
            continue

        if action == "help":
            show_help()
            continue

        if action == "list":
            show_available(buckets)
            continue

        if action == "clear":
            if len(parts) == 1:
                for ci in range(COLS_PER_ROW):
                    buckets[ci].clear()
                print("  Cleared all.")
            elif len(parts) == 2:
                try:
                    ci = int(parts[1]) - 1
                except ValueError:
                    print("  Usage: clear <col>")
                    continue
                if 0 <= ci < COLS_PER_ROW:
                    buckets[ci].clear()
                    print(f"  Cleared column {ci+1}.")
                else:
                    print(f"  Column must be 1-{COLS_PER_ROW}.")
            show_layout(buckets)
            continue

        if action == "remove":
            if len(parts) != 3:
                print("  Usage: remove <row> <col>")
                continue
            try:
                ri, ci = int(parts[1]) - 1, int(parts[2]) - 1
            except ValueError:
                print("  Usage: remove <row> <col>  (numbers)")
                continue
            if not (0 <= ci < COLS_PER_ROW):
                print(f"  Column must be 1-{COLS_PER_ROW}.")
            elif not (0 <= ri < len(buckets[ci])):
                print(f"  Column {ci+1} has {len(buckets[ci])} row(s).")
            else:
                name = os.path.basename(buckets[ci].pop(ri)["image"])
                print(f"  Removed {name}")
            show_layout(buckets)
            continue

        if action == "add":
            if len(parts) != 3:
                print("  Usage: add <col> <filename>")
                continue
            try:
                ci = int(parts[1]) - 1
            except ValueError:
                print("  Usage: add <col> <filename>")
                continue
            if not (0 <= ci < COLS_PER_ROW):
                print(f"  Column must be 1-{COLS_PER_ROW}.")
                continue
            fp = resolve_file(parts[2])
            if not fp:
                print(f"  File not found: {parts[2]}")
                show_available(buckets)
                continue
            buckets[ci].append(make_label(fp, ci))
            print(f"  Added {os.path.basename(fp)} to column {ci+1}.")
            show_layout(buckets)
            continue

        if action == "replace":
            if len(parts) != 4:
                print("  Usage: replace <row> <col> <filename>")
                continue
            try:
                ri, ci = int(parts[1]) - 1, int(parts[2]) - 1
            except ValueError:
                print("  Usage: replace <row> <col> <filename>")
                continue
            if not (0 <= ci < COLS_PER_ROW):
                print(f"  Column must be 1-{COLS_PER_ROW}.")
                continue
            if not (0 <= ri < len(buckets[ci])):
                print(f"  Column {ci+1} has {len(buckets[ci])} row(s).")
                continue
            fp = resolve_file(parts[3])
            if not fp:
                print(f"  File not found: {parts[3]}")
                show_available(buckets)
                continue
            buckets[ci][ri] = make_label(fp, ci)
            print(f"  Replaced with {os.path.basename(fp)}.")
            show_layout(buckets)
            continue

        if action == "move":
            if len(parts) != 5:
                print("  Usage: move <row> <col> <row> <col>")
                continue
            try:
                r1, c1, r2, c2 = int(parts[1])-1, int(parts[2])-1, int(parts[3])-1, int(parts[4])-1
            except ValueError:
                print("  Usage: move <row> <col> <row> <col>  (numbers)")
                continue
            if not (0 <= c1 < COLS_PER_ROW):
                print(f"  Source column must be 1-{COLS_PER_ROW}.")
            elif not (0 <= r1 < len(buckets[c1])):
                print(f"  Column {c1+1} has {len(buckets[c1])} row(s).")
            elif not (0 <= c2 < COLS_PER_ROW):
                print(f"  Destination column must be 1-{COLS_PER_ROW}.")
            else:
                label = buckets[c1].pop(r1)
                col = COLUMNS[c2]
                label.update({
                    "rect_w": col["rect_w"], "rect_h": col["rect_h"],
                    "img_w": col["img_w"], "img_h": col["img_h"],
                })
                pos = min(r2, len(buckets[c2]))
                buckets[c2].insert(pos, label)
                print(f"  Moved to R{pos+1} C{c2+1}.")
            show_layout(buckets)
            continue

        print("  Unknown command. Type 'help' for options.")


# ---------------------------------------------------------------------------
# PDF rendering
# ---------------------------------------------------------------------------

def draw_label(c: canvas.Canvas, x: float, y: float, label: dict):
    rect_w, rect_h = label["rect_w"], label["rect_h"]
    img_w, img_h = label["img_w"], label["img_h"]

    # Rectangle
    c.setStrokeColorRGB(0, 0, 0)
    c.setLineWidth(BORDER_WIDTH)
    c.rect(x, y, rect_w, rect_h, stroke=1, fill=0)

    # Image (centered, right-side up)
    img_path = label["image"]
    if img_path and os.path.isfile(img_path):
        img_x = x + (rect_w - img_w) / 2
        img_y = y + (rect_h - img_h) / 2
        c.drawImage(
            ImageReader(img_path), img_x, img_y,
            width=img_w, height=img_h,
            preserveAspectRatio=True, anchor="c",
        )
    else:
        pass  # empty or missing file — just the rectangle

    # Annotation (only if a barcode image is placed)
    text = annotation_text(label)
    if text and img_path and os.path.isfile(img_path):
        c.setFont("Helvetica", FONT_SIZE)
        c.drawCentredString(x + rect_w / 2, y - TEXT_OFFSET, text)


def build_rows(buckets: dict[int, list[dict]]) -> list[list[dict]]:
    max_depth = max((len(b) for b in buckets.values()), default=0)
    rows = []
    for ri in range(max_depth):
        row = []
        has_image = False
        for ci in range(COLS_PER_ROW):
            if ri < len(buckets[ci]):
                row.append(buckets[ci][ri])
                has_image = True
            else:
                row.append(empty_label(ci))
        if has_image:
            rows.append(row)
    return rows


def render_pdf(rows: list[list[dict]], output_path: str):
    # A4 portrait: 210mm wide x 297mm tall
    page_w = 210 * mm
    page_h = 297 * mm
    c = canvas.Canvas(output_path, pagesize=(page_w, page_h))
    c.setPageSize((page_w, page_h))

    print(f"  Page size: {page_w/mm:.0f}mm x {page_h/mm:.0f}mm (portrait)")
    print(f"  Total columns width: {sum(col['rect_w'] for col in COLUMNS)/mm:.0f}mm")

    col_widths = [col["rect_w"] for col in COLUMNS]
    total_w = sum(col_widths)
    gap = (page_w - total_w) / (COLS_PER_ROW + 1)

    col_x = []
    x = gap
    for w in col_widths:
        col_x.append(x)
        x += w + gap

    def draw_header(y):
        c.setFont("Helvetica-Bold", 9)
        for ci, col in enumerate(COLUMNS):
            cx = col_x[ci] + col_widths[ci] / 2
            c.drawCentredString(cx, y, f"{col['rect_w']/mm:.0f} x {col['rect_h']/mm:.0f} mm")

    cursor_y = page_h - MARGIN_TOP
    need_header = True

    for row in rows:
        row_h = max(l["rect_h"] for l in row)
        space_needed = row_h + TEXT_OFFSET + FONT_SIZE

        if cursor_y - space_needed < MARGIN_BOTTOM:
            c.showPage()
            cursor_y = page_h - MARGIN_TOP
            need_header = True

        if need_header:
            draw_header(cursor_y)
            cursor_y -= 6 * mm
            need_header = False

        for ci, label in enumerate(row):
            offset = (col_widths[ci] - label["rect_w"]) / 2
            draw_label(c, col_x[ci] + offset, cursor_y - row_h, label)

        cursor_y -= row_h + ROW_SPACING

    c.save()
    print(f"\n  PDF saved: {output_path}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    output_path = os.path.join(SCRIPT_DIR, "label_sheet.pdf")
    all_pngs = find_all_pngs()

    if not all_pngs:
        print(f"No PNG files found in {SCRIPT_DIR}")
        print("Place barcode images in this folder and run again.")
        return

    print(f"Found {len(all_pngs)} image(s). Type 'auto' to assign, 'help' for commands.\n")

    buckets = {i: [] for i in range(COLS_PER_ROW)}
    interactive_edit(buckets)


if __name__ == "__main__":
    main()
