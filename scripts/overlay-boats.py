#!/usr/bin/env python3
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1] / "public" / "maps"
ASSETS = Path(
    "/Users/simonpaag/.cursor/projects/Users-simonpaag-BKBolv-rket/assets"
)


def strip_trees(im: Image.Image) -> Image.Image:
    a = np.array(im.convert("RGB"), dtype=np.int16)
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    trees = (g > 110) & (g > r + 18) & (g > b + 5) & (g - r > 15)
    a[trees] = np.array([236, 228, 210], dtype=np.int16)
    return Image.fromarray(a.astype(np.uint8), "RGB")


def illustrated_water(im: Image.Image) -> np.ndarray:
    a = np.array(im.convert("RGB"))
    r, g, b = a[:, :, 0].astype(int), a[:, :, 1].astype(int), a[:, :, 2].astype(int)
    return (b > 170) & (r < 160) & (b > g) & (b - r > 40)


def canal_bbox(mask: np.ndarray) -> tuple[int, int, int, int]:
    rows = np.where(mask.mean(axis=1) > 0.16)[0]
    cols = np.where(mask.mean(axis=0) > 0.04)[0]
    return int(cols[0]), int(rows[0]), int(cols[-1]), int(rows[-1])


def sat_canal_strip(sat: Image.Image) -> Image.Image:
    w, h = sat.size
    strip = sat.crop((0, int(h * 0.36), w, int(h * 0.64)))
    a = np.array(strip)
    lum = a.mean(axis=2)
    keep = lum > 12
    # hide bright Google labels
    labels = lum > 225
    water = a[keep & (lum < 80)]
    if len(water):
        fill = np.median(water, axis=0).astype(np.uint8)
        a[labels] = fill
        keep[labels] = False
    rgba = np.dstack([a, (keep * 255).astype(np.uint8)])
    return Image.fromarray(rgba, "RGBA")


def overlay(styled: Image.Image, sat_crop: Image.Image, dest: Path) -> None:
    styled = styled.convert("RGBA")
    water = illustrated_water(styled)
    x0, y0, x1, y1 = canal_bbox(water)
    target = (x1 - x0 + 1, y1 - y0 + 1)
    boats = sat_canal_strip(sat_crop).resize(target, Image.Resampling.LANCZOS)
    water_img = Image.fromarray((water.astype(np.uint8) * 255), "L")
    water_img = water_img.filter(ImageFilter.MaxFilter(15)).crop((x0, y0, x1 + 1, y1 + 1))
    # keep satellite only on/near the illustrated canal
    alpha = Image.fromarray(
        (
            (np.array(boats.split()[-1]) > 20) & (np.array(water_img) > 80)
        ).astype(np.uint8)
        * 210,
        "L",
    )
    boats.putalpha(alpha)
    out = styled.copy()
    out.paste(boats, (x0, y0), boats)
    out.convert("RGB").save(dest, quality=92, optimize=True)
    print(dest.name, "canal", x0, y0, x1, y1)


def main() -> None:
    sat = Image.open(ROOT / "kanal-horizontal.jpg").convert("RGB")
    w, _ = sat.size
    west = sat.crop((0, 0, int(w * 0.60), sat.size[1]))
    east = sat.crop((int(w * 0.58), 0, w, sat.size[1]))
    overlay(
        strip_trees(Image.open(ASSETS / "kanal-bolvaerket-styled.jpg")),
        west,
        ROOT / "kanal-bolvaerket.jpg",
    )
    overlay(
        strip_trees(Image.open(ASSETS / "kanal-torvegade-styled.jpg")),
        east,
        ROOT / "kanal-torvegade.jpg",
    )
    for p in ROOT.glob("_debug-*.jpg"):
        p.unlink()


if __name__ == "__main__":
    main()
