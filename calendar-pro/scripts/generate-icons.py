#!/usr/bin/env python3
"""
Sinh toàn bộ icon của Calendar Pro theo Material 3 Expressive (rose):
  - favicon.svg / favicon-square.svg / favicon.ico / favicon-16|48|96.png / favicon.png (32)
  - icon-master.svg, icon-maskable-master.svg  (file gốc để chỉnh sửa)
  - icons/icon-{48..512}.png (any), icon-maskable-*.png, icon-monochrome-512.png, apple-touch-icon-*.png
  - og-image.png (1200x630)

Chạy:  python3 scripts/generate-icons.py     (cần: pip install playwright pillow && playwright install chromium)
Hình "cookie" 9 cánh là một trong các shape của M3 Expressive; màu lấy từ seed Rose #FF2056 (primary #BE003A).
"""
import math, io, pathlib
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
PUB = ROOT / "public"
ICONS = PUB / "icons"
ICONS.mkdir(parents=True, exist_ok=True)

def cookie(cx=512, cy=512, r=470, lobes=9, amp=0.07, n=180):
    pts = []
    for i in range(n):
        th = i / n * 2 * math.pi - math.pi / 2
        rr = r * (1 + amp * math.cos(lobes * (th + math.pi / 2))) / (1 + amp)
        pts.append(f"{cx + rr*math.cos(th):.1f},{cy + rr*math.sin(th):.1f}")
    return "M" + " L".join(pts) + " Z"

GRAD = '<linearGradient id="g" x1="0.1" y1="0" x2="0.9" y2="1"><stop offset="0" stop-color="#FF6B8D"/><stop offset="0.55" stop-color="#F0134F"/><stop offset="1" stop-color="#C20040"/></linearGradient>'

def glyph(detail=True):
    """Trang lịch + trăng lưỡi liềm (âm lịch) + tia sáng."""
    rings = ''
    band = ''
    if detail:
        band = '<g clip-path="url(#pg)"><rect x="262" y="292" width="500" height="150" fill="#FFD9DB"/></g>'
        rings = ('<rect x="356" y="228" width="60" height="136" rx="30" fill="#9C002F" stroke="#FFF8F7" stroke-width="14"/>'
                 '<rect x="608" y="228" width="60" height="136" rx="30" fill="#9C002F" stroke="#FFF8F7" stroke-width="14"/>')
    sparkle = '<path d="M668 520 L679 553 L712 564 L679 575 L668 608 L657 575 L624 564 L657 553 Z" fill="#8E4C9D"/>' if detail else ''
    return f'''
  <defs><clipPath id="pg"><rect x="262" y="292" width="500" height="470" rx="96"/></clipPath>
  <mask id="cr"><rect width="1024" height="1024" fill="#fff"/><circle cx="574" cy="594" r="104" fill="#000"/></mask></defs>
  <rect x="262" y="292" width="500" height="470" rx="96" fill="#FFF8F7"/>
  {band}
  {rings}
  <circle cx="500" cy="622" r="126" fill="#BE003A" mask="url(#cr)"/>
  {sparkle}'''

def glyph_fav():
    return '''
  <defs><mask id="cr"><rect width="1024" height="1024" fill="#fff"/><circle cx="586" cy="500" r="150" fill="#000"/></mask></defs>
  <rect x="232" y="252" width="560" height="560" rx="150" fill="#FFF8F7"/>
  <circle cx="500" cy="552" r="190" fill="#BE003A" mask="url(#cr)"/>
  <path d="M690 560 L704 604 L748 618 L704 632 L690 676 L676 632 L632 618 L676 604 Z" fill="#8E4C9D"/>'''

def glyph_mono():
    return '''
  <defs><mask id="hole"><rect width="1024" height="1024" fill="#fff"/><circle cx="500" cy="622" r="126" fill="#000"/><circle cx="574" cy="594" r="104" fill="#fff"/></mask></defs>
  <g mask="url(#hole)"><rect x="262" y="292" width="500" height="470" rx="96" fill="#fff"/></g>
  <rect x="356" y="228" width="60" height="136" rx="30" fill="#fff"/><rect x="608" y="228" width="60" height="136" rx="30" fill="#fff"/>
  <path d="M668 520 L679 553 L712 564 L679 575 L668 608 L657 575 L624 564 L657 553 Z" fill="#fff"/>'''

def wrap(inner, size=1024, bg=''):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="{size}" height="{size}">{bg}{inner}</svg>'

def scaled(inner, s):
    return f'<g transform="translate(512 512) scale({s}) translate(-512 -512)">{inner}</g>'

COOKIE = cookie()
any_svg = wrap(f'<defs>{GRAD}</defs><path d="{COOKIE}" fill="url(#g)"/>' + glyph(True))
fav_svg = wrap(f'<defs>{GRAD}</defs><path d="{COOKIE}" fill="url(#g)"/>' + glyph_fav())
fav_square = wrap(f'<defs>{GRAD}</defs><rect width="1024" height="1024" rx="240" fill="url(#g)"/><path d="{cookie(r=420)}" fill="#fff" fill-opacity="0.14"/>' + scaled(glyph_fav(), 0.88))
def maskable(scale):
    return wrap(f'<defs>{GRAD}</defs><rect width="1024" height="1024" fill="url(#g)"/><path d="{cookie(r=500)}" fill="#fff" fill-opacity="0.13"/>' + scaled(glyph(True), scale))
mask_svg = maskable(1.12)
apple_svg = maskable(1.22)
mono_svg = wrap(scaled(glyph_mono(), 1.0))

(PUB / "icon-master.svg").write_text(any_svg)
(PUB / "icon-maskable-master.svg").write_text(mask_svg)
(PUB / "favicon.svg").write_text(fav_svg)
(PUB / "favicon-square.svg").write_text(fav_square)

OG_HTML = f'''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:GSF;src:url("file://{ROOT}/node_modules/@fontsource-variable/google-sans-flex/files/google-sans-flex-latin-wght-normal.woff2");font-weight:1 1000}}
@font-face{{font-family:GSF;src:url("file://{ROOT}/node_modules/@fontsource-variable/google-sans-flex/files/google-sans-flex-vietnamese-wght-normal.woff2");font-weight:1 1000;unicode-range:U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB}}
*{{box-sizing:border-box;margin:0}} body{{width:1200px;height:630px;background:#FFF8F7;font-family:GSF,system-ui,sans-serif;position:relative;overflow:hidden;color:#22181A}}
.blob{{position:absolute}} .t{{position:absolute;left:84px;top:190px;width:640px}}
h1{{font-size:104px;line-height:.95;letter-spacing:-.04em;font-weight:800;color:#BE003A}}
p{{font-size:34px;line-height:1.3;margin-top:26px;color:#5B3F42;font-weight:500}}
.chips{{position:absolute;left:84px;bottom:76px;display:flex;gap:14px}}
.chip{{padding:12px 26px;border-radius:999px;font-size:25px;font-weight:650}}
</style></head><body>
<svg class="blob" style="right:-120px;top:-150px" width="760" height="760" viewBox="0 0 1024 1024"><path d="{cookie(r=500)}" fill="#FFDADB"/></svg>
<svg class="blob" style="right:90px;top:80px" width="470" height="470" viewBox="0 0 1024 1024">{any_svg[any_svg.index('>')+1:-6]}</svg>
<svg class="blob" style="right:-40px;bottom:-110px" width="330" height="330" viewBox="0 0 1024 1024"><path d="{cookie(lobes=5,amp=.13,r=500)}" fill="#FCD7FF"/></svg>
<div class="t"><h1>Calendar Pro</h1><p>Lịch âm dương, vạn niên và đếm ngược ngày lễ Việt Nam</p></div>
<div class="chips"><span class="chip" style="background:#BE003A;color:#fff">Material 3 Expressive</span><span class="chip" style="background:#FFDAD4;color:#3A0905">Ngày chay · Rằm</span><span class="chip" style="background:#FCD7FF;color:#2C0A35">PWA</span></div>
</body></html>'''
og_path = ROOT / "scripts" / ".og.html"
og_path.write_text(OG_HTML)

with sync_playwright() as p:
    b = p.chromium.launch(args=["--allow-file-access-from-files"])
    pg = b.new_page(device_scale_factor=1)

    def raster(svg, size, transparent=True):
        pg.set_viewport_size({"width": size, "height": size})
        sized = svg.replace('width="1024" height="1024"', f'width="{size}" height="{size}"', 1)  # chỉ đổi thẻ <svg> gốc, không đụng tới mask/clip bên trong
        pg.set_content(f'<html><body style="margin:0;background:transparent">{sized}</body></html>')
        data = pg.screenshot(omit_background=transparent, clip={"x": 0, "y": 0, "width": size, "height": size})
        return Image.open(io.BytesIO(data)).convert("RGBA")

    for s in (48, 72, 96, 128, 144, 192, 256, 384, 512):
        raster(any_svg, s).save(ICONS / f"icon-{s}.png", optimize=True)
    for s in (192, 384, 512):
        raster(mask_svg, s, False).convert("RGB").save(ICONS / f"icon-maskable-{s}.png", optimize=True)
    raster(mono_svg, 512).save(ICONS / "icon-monochrome-512.png", optimize=True)
    for s in (120, 152, 167, 180):
        raster(apple_svg, s, False).convert("RGB").save(ICONS / f"apple-touch-icon-{s}.png", optimize=True)
    raster(apple_svg, 180, False).convert("RGB").save(ICONS / "apple-touch-icon.png", optimize=True)

    fav = {16: "favicon-16.png", 32: "favicon.png", 48: "favicon-48.png", 96: "favicon-96.png"}
    imgs = {}
    for s, name in fav.items():
        imgs[s] = raster(fav_svg, max(s, 64) if s < 48 else s)
        im = raster(fav_svg, s) if s >= 48 else raster(fav_svg, s)
        im.save(PUB / name, optimize=True)
        imgs[s] = im
    imgs[16].save(PUB / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)], append_images=[imgs[32], imgs[48]])

    pg.set_viewport_size({"width": 1200, "height": 630})
    pg.goto(og_path.as_uri())
    pg.wait_for_timeout(600)
    pg.screenshot(path=str(PUB / "og-image.png"), clip={"x": 0, "y": 0, "width": 1200, "height": 630})
    b.close()
og_path.unlink()
print("✔ icons đã được tạo")
