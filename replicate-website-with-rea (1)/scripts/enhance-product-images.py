#!/usr/bin/env python3
"""Studio-finish the product photos.

For every catalogue image this:
  1. re-cuts the packshot from public/products/raw (flood-fill the backdrop),
  2. removes the white fringe by un-premultiplying the alpha,
  3. sharpens and lifts contrast / colour,
  4. adds a studio rim light along the top-left edge,
  5. adds a soft contact shadow so the device sits in space,
  6. rebuilds colour variants with a real hue rotation (keeps texture detail),
  7. redraws the accessories with gradients, highlights and texture.

Run: python3 scripts/enhance-product-images.py
"""
from __future__ import annotations

import colorsys
import math
import shutil
import subprocess
from collections import deque
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path("public/products")
RAW = Path("assets/products-raw")  # source packshots, kept out of the served bundle
SIZE = 1000
WEB_SIZE = 800  # final published resolution
SHADOW_COLOR = (26, 24, 32)  # neutral, so it never tints the product colour


# --------------------------------------------------------------------------- cut

def flood_cut(im: Image.Image, fuzz: int = 30) -> Image.Image:
    """Erase the backdrop connected to the image edges."""
    im = im.convert("RGBA")
    pix = im.load()
    w, h = im.size
    corners = [pix[1, 1][:3], pix[w - 2, 1][:3], pix[1, h - 2][:3], pix[w - 2, h - 2][:3]]
    bg = tuple(sum(c[i] for c in corners) // 4 for i in range(3))

    def near(p) -> bool:
        return all(abs(p[i] - bg[i]) <= fuzz for i in range(3))

    seen = bytearray(w * h)
    q: deque[tuple[int, int]] = deque()
    for x in range(0, w, 3):
        q.append((x, 0))
        q.append((x, h - 1))
    for y in range(0, h, 3):
        q.append((0, y))
        q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h:
            continue
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        p = pix[x, y]
        if not near(p):
            continue
        pix[x, y] = (p[0], p[1], p[2], 0)
        q.append((x + 1, y))
        q.append((x - 1, y))
        q.append((x, y + 1))
        q.append((x, y - 1))
    return im


def pad_square(im: Image.Image, size: int = SIZE, pad: float = 0.10) -> Image.Image:
    im = im.convert("RGBA")
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    w, h = im.size
    inner = int(size * (1 - 2 * pad))
    scale = min(inner / w, inner / h)
    nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.alpha_composite(im, ((size - nw) // 2, (size - nh) // 2))
    return canvas


# --------------------------------------------------------------------- finishing

def dehalo(im: Image.Image, erode: int = 3, passes: int = 5) -> Image.Image:
    """Kill the light fringe left by the cut-out.

    Erodes the matte by a pixel, then propagates real interior colour outward into
    the remaining semi-transparent edge so no backdrop shows through.
    """
    r, g, b, a = im.convert("RGBA").split()
    if erode > 1:
        a = a.filter(ImageFilter.MinFilter(erode))
    rgb = Image.merge("RGB", (r, g, b))
    opaque = a.point(lambda p: 255 if p >= 248 else 0)
    filled = rgb
    for _ in range(passes):
        blur = filled.filter(ImageFilter.GaussianBlur(3))
        filled = Image.composite(rgb, blur, opaque)
    out = filled.convert("RGBA")
    out.putalpha(a)
    return out


def top_left_gradient(size: int) -> Image.Image:
    """255 at the top-left corner fading to 0 at the bottom-right."""
    w = h = size
    vert = Image.linear_gradient("L").resize((w, h)).transpose(Image.Transpose.FLIP_TOP_BOTTOM)
    horiz = vert.transpose(Image.Transpose.ROTATE_270)
    return ImageChops.multiply(vert, horiz)


def rim_light(im: Image.Image, strength: int = 42, width: int = 5) -> Image.Image:
    """Thin bright edge on the lit side — reads as studio lighting.

    Kept subtle: a strong white rim looks like a halo around dark devices when
    they float on the dark hero gradient.
    """
    a = im.split()[-1]
    ring = ImageChops.subtract(a, a.filter(ImageFilter.MinFilter(width)))
    mask = ImageChops.multiply(ring, top_left_gradient(im.size[0]))
    mask = mask.point(lambda p: min(255, int(p * strength / 100)))
    white = Image.new("RGBA", im.size, (255, 255, 255, 255))
    out = im.copy()
    out.paste(white, (0, 0), mask)
    return out


def contact_shadow(im: Image.Image) -> Image.Image:
    """Soft elliptical shadow under the product."""
    w, h = im.size
    a = im.split()[-1]
    bbox = a.getbbox()
    if not bbox:
        return im
    x0, y0, x1, y1 = bbox
    bw = x1 - x0
    cy = min(h - 6, y1 - int((y1 - y0) * 0.04))
    rx = int(bw * 0.46)
    ry = max(10, int(bw * 0.055))
    layer = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(layer)
    d.ellipse((w // 2 - rx, cy - ry, w // 2 + rx, cy + ry), fill=150)
    layer = layer.filter(ImageFilter.GaussianBlur(max(12, rx // 6)))
    layer = layer.point(lambda p: int(p * 0.30))
    shadow = Image.new("RGBA", (w, h), SHADOW_COLOR + (0,))
    shadow.putalpha(layer)
    out = Image.alpha_composite(shadow, im)
    return out


def white_balance(rgb: Image.Image, alpha: Image.Image, strength: float = 0.85) -> Image.Image:
    """Remove the warm cast the packshots picked up.

    Averages the brightest visible pixels (specular highlights, which should be
    neutral white), derives per-channel gains and applies a clamped correction.
    """
    hi = [0, 0, 0]
    n = 0
    for (r, g, b), a in zip(rgb.getdata(), alpha.getdata()):
        if a > 200 and r + g + b >= 620:
            hi[0] += r
            hi[1] += g
            hi[2] += b
            n += 1
    if n < 200:
        return rgb
    mean = [c / n for c in hi]
    target = max(mean)
    gains = [min(1.14, max(0.90, target / c)) if c > 0 else 1.0 for c in mean]
    lut = []
    for c in range(3):
        g = 1.0 + (gains[c] - 1.0) * strength
        lut += [min(255, max(0, int(i * g))) for i in range(256)]
    return rgb.point(lut)


def polish(src: Image.Image, shadow: bool = True, bright: float = 1.0, contrast: float = 1.07) -> Image.Image:
    """Full finishing pass on an RGBA image."""
    alpha = src.split()[-1]
    rgb = white_balance(src.convert("RGB"), alpha)
    rgb = rgb.filter(ImageFilter.UnsharpMask(radius=2.2, percent=95, threshold=2))
    rgb = ImageEnhance.Contrast(rgb).enhance(contrast)
    rgb = ImageEnhance.Color(rgb).enhance(1.10)
    if abs(bright - 1.0) > 0.01:
        rgb = ImageEnhance.Brightness(rgb).enhance(bright)
    im = rgb.convert("RGBA")
    im.putalpha(alpha)
    im = dehalo(im)
    im = rim_light(im)
    if shadow:
        im = contact_shadow(im)
    return im


# ----------------------------------------------------------------------- variants

def dominant_hsv(path: Path) -> tuple[float, float, float]:
    im = Image.open(path).convert("RGBA")
    im.thumbnail((90, 90))
    opaque = [(r, g, b) for r, g, b, a in im.getdata() if a > 200]
    if not opaque:
        return 0.0, 0.0, 0.0
    hsv = [colorsys.rgb_to_hsv(r / 255, g / 255, b / 255) for r, g, b in opaque]
    sx = sum(math.sin(2 * math.pi * h) for h, _, _ in hsv) / len(hsv)
    sy = sum(math.cos(2 * math.pi * h) for h, _, _ in hsv) / len(hsv)
    hue = (math.atan2(sy, sx) / (2 * math.pi)) % 1.0
    return hue * 360, sum(s for _, s, _ in hsv) / len(hsv), sum(v for _, _, v in hsv) / len(hsv)


def hex_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def make_variant(
    base: Path, color: str, sat: float = 1.0, bright: float = 1.0, gamma: float = 1.0, mix: float | None = None
) -> Image.Image:
    """Recolour a packshot without losing any of its detail.

    Each pixel keeps its own luminance (so highlights, shading, screen and lens
    detail survive) but is re-expressed in the target hue/saturation. `gamma` > 1
    lifts dark bases into silver. `mix` blends a little of the original back so
    glass and metal do not look like flat plastic.
    """
    src = Image.open(base).convert("RGBA")
    alpha = src.split()[-1]
    rgb = src.convert("RGB")
    lum = rgb.convert("L")

    th, ts, tv = colorsys.rgb_to_hsv(*[c / 255 for c in hex_rgb(color)])
    tl = tv * (1 - ts / 2)  # HSV -> HSL lightness
    ts_hsl = 0.0 if tl in (0.0, 1.0) else (tv - tl) / min(tl, 1 - tl)
    s = max(0.0, min(1.0, ts_hsl * sat))

    # lightness curve shared by the tint and the neutral highlight grey
    curve = []
    for i in range(256):
        l0 = i / 255
        if abs(gamma - 1.0) > 0.01:
            l0 = l0 ** (1 / gamma)
        curve.append(int(max(0.0, min(1.0, l0 * bright)) * 255))
    lum_adj = lum.point(curve)

    lut_r, lut_g, lut_b = [], [], []
    for i in range(256):
        r, g, b = colorsys.hls_to_rgb(th, curve[i] / 255, s)
        lut_r.append(int(r * 255))
        lut_g.append(int(g * 255))
        lut_b.append(int(b * 255))
    tinted = Image.merge("RGB", (lum.point(lut_r), lum.point(lut_g), lum.point(lut_b)))

    # Specular highlights stay neutral grey, like a real studio photo — otherwise
    # the recolour paints the glare in the body colour and the shot looks warm/dirty.
    grey = Image.merge("RGB", (lum_adj, lum_adj, lum_adj))
    hl = lum_adj.point(lambda i: int(255 * max(0.0, (i / 255 - 0.60) / 0.40) ** 1.3))
    tinted = Image.composite(grey, tinted, hl.point(lambda p: int(p * 0.88)))

    if mix is None:
        # strongly coloured bodies need a faithful tint; silver/black keep a touch
        # of the original so metal and glass do not look painted on
        mix = 0.93 if s > 0.12 else 0.86
    out = Image.blend(rgb, tinted, mix)
    im = out.convert("RGBA")
    im.putalpha(alpha)
    return im


# -------------------------------------------------------------------- accessories

def vgrad(w: int, h: int, top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    g = Image.linear_gradient("L").resize((w, h))  # 0 top -> 255 bottom
    base = Image.new("RGB", (w, h), top)
    other = Image.new("RGB", (w, h), bottom)
    return Image.composite(other, base, g)


def soft_highlight(size: tuple[int, int], box: tuple[int, int, int, int], opacity: int = 120) -> Image.Image:
    layer = Image.new("L", size, 0)
    d = ImageDraw.Draw(layer)
    d.ellipse(box, fill=opacity)
    return layer.filter(ImageFilter.GaussianBlur(size[0] // 22))


def draw_charger(path: Path) -> None:
    im = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    body = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(body)
    x0, y0, x1, y1 = 300, 230, 700, 700
    grad = vgrad(x1 - x0, y1 - y0, (255, 255, 255), (214, 216, 222)).resize((SIZE, SIZE))
    mask = Image.new("L", (SIZE, SIZE), 0)
    ImageDraw.Draw(mask).rounded_rectangle((x0, y0, x1, y1), 56, fill=255)
    # source must be RGBA: pasting an RGB image into RGBA writes colour but leaves alpha 0
    body.paste(grad.convert("RGBA"), (0, 0), mask)
    d = ImageDraw.Draw(body)
    d.rounded_rectangle((x0, y0, x1, y1), 56, outline=(196, 199, 206, 255), width=3)
    # top gloss
    gloss = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    gloss.paste(Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 255)), (0, 0),
                soft_highlight((SIZE, SIZE), (x0 + 40, y0 + 10, x1 - 40, y0 + 200), 150))
    body = Image.alpha_composite(body, gloss)
    d = ImageDraw.Draw(body)
    # USB-C ports with inner tongues
    for cx in (420, 580):
        d.rounded_rectangle((cx - 42, 420, cx + 42, 462), 18, fill=(38, 40, 46, 255))
        d.rounded_rectangle((cx - 34, 428, cx + 34, 454), 12, fill=(16, 17, 20, 255))
        d.rounded_rectangle((cx - 26, 436, cx + 26, 446), 5, fill=(196, 199, 206, 255))
    # prongs
    for px in (400, 560):
        d.rounded_rectangle((px, 700, px + 40, 790), 8, fill=(176, 180, 186, 255))
        d.rounded_rectangle((px + 6, 700, px + 16, 790), 4, fill=(226, 229, 233, 255))
    im = Image.alpha_composite(im, body)
    im = pad_square(im, SIZE, 0.08)
    im.save(path, "PNG", optimize=True)


def draw_cable(path: Path) -> None:
    im = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # braided loop: several offset strokes for depth
    for wdt, col in ((30, (12, 12, 14, 255)), (22, (34, 34, 38, 255)), (8, (72, 72, 78, 180))):
        d.arc((210, 250, 790, 830), 200, 520, fill=col, width=wdt)
        d.arc((270, 300, 730, 780), 20, 250, fill=col, width=wdt)
    # braid texture
    for i in range(46):
        a = 200 + i * 7
        x = 210 + (i % 12) * 48
        y = 250 + (i // 12) * 140
        d.arc((x, y, x + 40, y + 40), a, a + 40, fill=(96, 96, 104, 90), width=3)
    # connectors
    for (cx, cy) in ((170, 430), (790, 560)):
        d.rounded_rectangle((cx - 56, cy - 34, cx + 56, cy + 34), 16, fill=(186, 190, 196, 255))
        d.rounded_rectangle((cx - 56, cy - 34, cx + 56, cy - 12), 12, fill=(226, 229, 233, 200))
        d.rounded_rectangle((cx - 92, cy - 20, cx - 56, cy + 20), 8, fill=(52, 54, 60, 255))
        d.rounded_rectangle((cx + 56, cy - 16, cx + 92, cy + 16), 6, fill=(150, 154, 160, 255))
    im = pad_square(im, SIZE, 0.08)
    im.save(path, "PNG", optimize=True)


def draw_case(path: Path) -> None:
    """Clear shockproof case — a translucent moulded shell, built with composites
    (pasting an RGB gradient into an RGBA canvas silently leaves alpha at 0)."""
    x0, y0, x1, y1 = 320, 110, 680, 890

    # putalpha sets the matte exactly; Image.composite with a partial-alpha mask
    # blends the alpha band too and leaves the shell washed out.
    grad = vgrad(x1 - x0, y1 - y0, (240, 246, 250), (194, 208, 218)).resize((SIZE, SIZE)).convert("RGB")
    shell = Image.new("L", (SIZE, SIZE), 0)
    ImageDraw.Draw(shell).rounded_rectangle((x0, y0, x1, y1), 96, fill=236)
    grad.putalpha(shell)
    body = grad.convert("RGBA")

    d = ImageDraw.Draw(body)
    d.rounded_rectangle((x0, y0, x1, y1), 96, outline=(146, 161, 172, 255), width=10)
    d.rounded_rectangle((x0 + 16, y0 + 16, x1 - 16, y1 - 16), 84, outline=(226, 235, 240, 200), width=3)
    # camera cutout with a raised ring and two lens holes
    d.rounded_rectangle((x0 + 34, y0 + 40, x0 + 214, y0 + 220), 54, fill=(26, 30, 36, 90), outline=(146, 160, 170, 235), width=6)
    for cx, cy in ((x0 + 92, y0 + 100), (x0 + 156, y0 + 162)):
        d.ellipse((cx - 28, cy - 28, cx + 28, cy + 28), outline=(170, 182, 192, 240), width=5)
        d.ellipse((cx - 13, cy - 13, cx + 13, cy + 13), fill=(14, 18, 24, 150))
    # side buttons
    d.rounded_rectangle((x0 - 12, y0 + 210, x0 + 4, y0 + 320), 6, fill=(168, 181, 190, 240))
    d.rounded_rectangle((x1 - 4, y0 + 260, x1 + 12, y0 + 350), 6, fill=(168, 181, 190, 240))

    # glossy diagonal sheen
    sheen = Image.new("L", (SIZE, SIZE), 0)
    ImageDraw.Draw(sheen).polygon(
        [(x0 + 56, y1 - 30), (x0 + 150, y1 - 30), (x1 - 56, y0 + 50), (x1 - 140, y0 + 50)], fill=70
    )
    sheen = sheen.filter(ImageFilter.GaussianBlur(16))
    veil = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    veil.putalpha(sheen.point(lambda p: int(p * 0.75)))
    body = Image.alpha_composite(body, veil)

    im = pad_square(body, SIZE, 0.06)
    im.save(path, "PNG", optimize=True)


def draw_speaker(path: Path) -> None:
    im = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    x0, y0, x1, y1 = 90, 190, 910, 610
    grad = vgrad(x1 - x0, y1 - y0, (46, 178, 174), (12, 96, 96)).resize((SIZE, SIZE))
    mask = Image.new("L", (SIZE, SIZE), 0)
    ImageDraw.Draw(mask).rounded_rectangle((x0, y0, x1, y1), 200, fill=255)
    im.paste(grad.convert("RGBA"), (0, 0), mask)
    d = ImageDraw.Draw(im)
    # fabric grille
    for i in range(20):
        for j in range(7):
            cx = x0 + 90 + i * 36
            cy = y0 + 90 + j * 42
            d.ellipse((cx, cy, cx + 9, cy + 9), fill=(8, 62, 62, 130))
    # rubber end caps
    for cx in (x0 + 60, x1 - 60):
        d.ellipse((cx - 62, y0 + 20, cx + 62, y1 - 20), fill=(16, 112, 110, 255))
        d.ellipse((cx - 40, y0 + 60, cx + 40, y1 - 60), fill=(28, 140, 138, 255))
    # control strip + LED
    d.rounded_rectangle((x0 + 250, y0 + 26, x1 - 250, y0 + 54), 14, fill=(10, 74, 74, 220))
    for i in range(5):
        d.ellipse((x0 + 290 + i * 60, y0 + 32, x0 + 306 + i * 60, y0 + 48), fill=(198, 244, 50, 255))
    # top gloss
    gloss = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    gloss.paste(Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 255)), (0, 0),
                soft_highlight((SIZE, SIZE), (x0 + 120, y0 - 10, x1 - 120, y0 + 150), 110))
    im = Image.alpha_composite(im, gloss)
    im = pad_square(im, SIZE, 0.10)
    im.save(path, "PNG", optimize=True)


# --------------------------------------------------------------------------- main

BASES = {
    "iphone-15-pro-max.png": ("iphone-15-pro-max.png", 30),
    "iphone-15.png": ("iphone-15-blue.png", 30),
    "iphone-13.png": ("iphone-13-midnight.png", 30),
    "galaxy-s24-ultra.png": ("galaxy-s24-ultra.png", 30),
    "galaxy-z-flip5.png": ("galaxy-z-flip5.png", 32),
    "macbook-air-m2.png": ("macbook-air-m2.png", 28),
    "macbook-pro-14.png": ("macbook-pro-14.png", 28),
    "ipad-pro.png": ("ipad-pro.png", 30),
    "apple-watch-s9.png": ("apple-watch-s9.png", 28),
    "airpods-pro-2.png": ("airpods-pro-2.png", 12),
}

# base, dest, colour, saturation, brightness, gamma, post-brightness
VARIANTS: list[tuple[str, str, str, float, float, float, float]] = [
    ("iphone-15-pro-max.png", "iphone-14-pro.png", "#5b4b6e", 1.0, 1.0, 1.0, 1.0),
    ("iphone-13.png", "iphone-12-pro-max.png", "#2f4a5e", 1.0, 1.0, 1.15, 1.0),
    ("iphone-13.png", "iphone-12.png", "#7fc79c", 1.0, 1.0, 1.40, 1.0),
    ("iphone-13.png", "iphone-11.png", "#26262a", 1.0, 0.95, 1.0, 1.0),
    ("galaxy-s24-ultra.png", "galaxy-s23-ultra.png", "#1b1d21", 1.0, 0.95, 1.0, 1.0),
    ("galaxy-s24-ultra.png", "galaxy-s23-fe.png", "#7fd8a8", 1.0, 1.0, 1.35, 1.0),
    ("galaxy-s24-ultra.png", "galaxy-a54.png", "#bcd95f", 1.0, 1.0, 1.35, 1.0),
    ("macbook-air-m2.png", "macbook-air-m1.png", "#d7dade", 1.0, 1.0, 2.35, 1.04),
    ("macbook-air-m2.png", "dell-xps-13.png", "#c3c8ce", 1.0, 1.0, 2.05, 1.0),
    ("macbook-pro-14.png", "thinkpad-x1.png", "#1b1d21", 1.0, 0.9, 1.0, 1.0),
    ("macbook-air-m2.png", "hp-elitebook.png", "#b4bac1", 1.0, 1.0, 1.80, 1.0),
    ("macbook-air-m2.png", "acer-swift.png", "#ccd1d7", 1.0, 1.0, 2.60, 1.06),
    ("ipad-pro.png", "ipad-air.png", "#8bb6dc", 1.0, 1.0, 1.25, 1.0),
    ("ipad-pro.png", "ipad-9.png", "#d9dcdf", 1.0, 1.0, 2.30, 1.04),
    ("ipad-pro.png", "galaxy-tab-s8.png", "#3b3d43", 1.0, 0.95, 1.0, 1.0),
    ("apple-watch-s9.png", "apple-watch-s8.png", "#e2d6c2", 1.0, 1.0, 1.40, 1.0),
    ("apple-watch-s9.png", "apple-watch-se.png", "#d2d5d9", 1.0, 1.0, 2.20, 1.04),
    ("apple-watch-s9.png", "galaxy-watch-6.png", "#2b2d33", 1.0, 0.9, 1.0, 1.0),
]


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)

    # 1. bases straight from the raw packshots
    for out_name, (raw_name, fuzz) in BASES.items():
        src = RAW / raw_name
        if not src.exists():
            print("skip (no raw)", out_name)
            continue
        print("base ", out_name)
        im = flood_cut(Image.open(src), fuzz=fuzz)
        im = polish(pad_square(im, SIZE))
        im.save(ROOT / out_name, "PNG", optimize=True)

    # headphones came from an external cutout
    hp = Path("/tmp/extra/e1.png")
    if hp.exists():
        print("base  sony-wh-1000xm4.png")
        im = pad_square(Image.open(hp).convert("RGBA"), SIZE)
        polish(im).save(ROOT / "sony-wh-1000xm4.png", "PNG", optimize=True)

    # 2. hue-rotated variants from the cleaned bases
    for base, dest, color, sat, bright, gamma, post in VARIANTS:
        bp = ROOT / base
        if not bp.exists():
            print("skip variant (no base)", dest)
            continue
        print("var  ", dest)
        im = make_variant(bp, color, sat, bright, gamma)
        polish(im, bright=post).save(ROOT / dest, "PNG", optimize=True)

    # AirPods 3 share the Pro packshot
    shutil.copyfile(ROOT / "airpods-pro-2.png", ROOT / "airpods-3.png")

    # 3. accessories with real shading
    print("draw accessories")
    draw_charger(ROOT / "charger.png")
    draw_cable(ROOT / "cable.png")
    draw_case(ROOT / "case.png")
    draw_speaker(ROOT / "jbl-flip-6.png")
    for name in ("charger.png", "cable.png", "case.png", "jbl-flip-6.png"):
        im = Image.open(ROOT / name)
        polish(im, shadow=True).save(ROOT / name, "PNG", optimize=True)

    # 4. ship at web size as WebP (cards render ~250px, product page ~450px)
    print("publish webp")
    for p in sorted(ROOT.glob("*.png")):
        im = Image.open(p).convert("RGBA")
        if im.size[0] > WEB_SIZE:
            im = im.resize((WEB_SIZE, WEB_SIZE), Image.Resampling.LANCZOS)
        webp = p.with_suffix(".webp")
        im.save(webp, "WEBP", quality=90, method=6, exact=True)
        p.unlink()  # the PNG was only an intermediate

    files = sorted(ROOT.glob("*.webp"))
    total = sum(p.stat().st_size for p in files)
    print(f"\ndone: {len(files)} images, {total // 1024} KB total")
    for p in files:
        print(f"  {p.name:26} {p.stat().st_size // 1024:5}k")


if __name__ == "__main__":
    main()
