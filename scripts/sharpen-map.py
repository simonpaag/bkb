#!/usr/bin/env python3
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1] / "public" / "maps"
SCALE = 3


def pep(im: Image.Image) -> Image.Image:
    im = im.filter(ImageFilter.UnsharpMask(radius=1.8, percent=165, threshold=2))
    im = ImageEnhance.Color(im).enhance(1.18)
    im = ImageEnhance.Contrast(im).enhance(1.12)
    im = ImageEnhance.Brightness(im).enhance(1.04)
    im = im.filter(ImageFilter.UnsharpMask(radius=0.8, percent=80, threshold=1))
    return im


#!/usr/bin/env python3
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1] / "public" / "maps"
SCALE = 3


def pep(im: Image.Image) -> Image.Image:
    im = im.filter(ImageFilter.UnsharpMask(radius=1.8, percent=165, threshold=2))
    im = ImageEnhance.Color(im).enhance(1.18)
    im = ImageEnhance.Contrast(im).enhance(1.12)
    im = ImageEnhance.Brightness(im).enhance(1.04)
    im = im.filter(ImageFilter.UnsharpMask(radius=0.8, percent=80, threshold=1))
    return im


def main() -> None:
    original = Image.open(ROOT / "kanal-original.jpg").convert("RGB")
    hi = original.resize(
        (original.width * SCALE, original.height * SCALE),
        Image.Resampling.LANCZOS,
    )
    rotated = hi.rotate(-45, expand=True, resample=Image.Resampling.BICUBIC)
    crop = rotated.crop(
        (
            1 * SCALE,
            545 * SCALE,
            1435 * SCALE,
            875 * SCALE,
        )
    )
    out = pep(crop)
    out.save(ROOT / "kanal-horizontal.jpg", quality=92, optimize=True, subsampling=1)
    numbered = pep(Image.open(ROOT / "kanal-numreret.jpg").convert("RGB"))
    numbered.save(ROOT / "kanal-numreret.jpg", quality=90, optimize=True, subsampling=1)
    print("horizontal", out.size)
    print("numbered", numbered.size)


if __name__ == "__main__":
    main()



if __name__ == "__main__":
    main()
