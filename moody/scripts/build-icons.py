"""Sinh favicon + app icon + ảnh OG theo Material 3 Expressive (teal).
Chạy: python3 scripts/build-icons.py   (cần playwright + chromium, Pillow)
Hình dạng: "cookie" 12 múi (một trong các shape của M3 Expressive) + khuôn mặt tối giản.
Màu: primary #006a60 · primary-container #9ef2e4 · on-primary-container #005048 (xem src/styles/theme.css).
"""
import math, pathlib
from playwright.sync_api import sync_playwright
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
PUB = ROOT / 'public'
P, PC, ONPC = '#006a60', '#9ef2e4', '#005048'
DP, DPC, DONPC = '#82d5c8', '#005048', '#9ef2e4'  # bản tối

def cookie_path(cx, cy, R, lobes=12, amp=0.042, n=720):
    pts = []
    for i in range(n):
        t = 2 * math.pi * i / n
        r = R * (1 + amp * math.cos(lobes * t))
        pts.append(f'{cx + r * math.cos(t):.2f},{cy + r * math.sin(t):.2f}')
    return 'M' + ' L'.join(pts) + 'Z'

def face(cx, cy, s, color, tilt=-5):
    """Khuôn mặt vẽ trong hệ 512, thu phóng theo s quanh (cx, cy)."""
    return f'''<g transform="translate({cx} {cy}) rotate({tilt}) scale({s}) translate(-256 -256)" fill="{color}">
      <rect x="182" y="196" width="46" height="72" rx="23"/>
      <rect x="284" y="196" width="46" height="72" rx="23"/>
      <path d="M180 314 Q256 384 332 314" fill="none" stroke="{color}" stroke-width="36" stroke-linecap="round"/>
    </g>'''

def icon_svg(size, bg, cookie, ink, R, radius=None, face_scale=None):
    c = size / 2
    fs = face_scale or (R / 190 * 0.98)
    rect = ''
    if bg:
        rect = f'<rect width="{size}" height="{size}" rx="{radius or 0}" fill="{bg}"/>'
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">
  {rect}
  <path d="{cookie_path(c, c, R)}" fill="{cookie}"/>
  {face(c, c, fs, ink)}
</svg>'''

# ---- favicon.svg (tự đổi màu theo chế độ sáng/tối của trình duyệt)
fav = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <style>
    .c{{fill:{P}}} .f{{fill:{PC};stroke:{PC}}}
    @media (prefers-color-scheme: dark){{.c{{fill:{DP}}} .f{{fill:{DPC};stroke:{DPC}}}}}
  </style>
  <path class="c" d="{cookie_path(64, 64, 58, amp=0.042, n=360)}"/>
  <g transform="translate(64 64) rotate(-5) scale(0.30) translate(-256 -256)">
    <rect class="f" x="182" y="196" width="46" height="72" rx="23" stroke="none"/>
    <rect class="f" x="284" y="196" width="46" height="72" rx="23" stroke="none"/>
    <path d="M180 314 Q256 384 332 314" fill="none" class="f" style="fill:none" stroke-width="36" stroke-linecap="round"/>
  </g>
</svg>'''
(PUB / 'favicon.svg').write_text(fav)

any_svg = icon_svg(512, P, PC, ONPC, R=176, radius=116)
mask_svg = icon_svg(512, P, PC, ONPC, R=150)
apple_svg = icon_svg(180, P, PC, ONPC, R=61)
fav_png_svg = icon_svg(256, None, P, PC, R=120)

def html(svg, size):
    return f'<html><body style="margin:0;background:transparent">{svg}</body></html>'

OG = f'''<html><head><style>
@font-face{{font-family:'RF';src:url('file://{ROOT}/node_modules/@fontsource-variable/google-sans-flex/files/google-sans-flex-latin-rond-normal.woff2');font-weight:1 1000}}
@font-face{{font-family:'RF';src:url('file://{ROOT}/node_modules/@fontsource-variable/google-sans-flex/files/google-sans-flex-vietnamese-rond-normal.woff2');font-weight:1 1000;unicode-range:U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB}}
*{{box-sizing:border-box;margin:0}}
body{{width:1200px;height:630px;background:#f4fbf8;font-family:'RF',sans-serif;position:relative;overflow:hidden;color:#161d1c}}
.blob{{position:absolute;right:-120px;top:-140px;width:760px;height:760px;border-radius:50%;background:#9ef2e4;opacity:.55}}
.pill{{position:absolute;left:84px;top:84px;height:48px;padding:0 22px;border-radius:24px;background:#cce8e2;color:#334b47;font-weight:600;font-size:22px;display:flex;align-items:center;letter-spacing:.02em}}
h1{{position:absolute;left:78px;top:176px;font-size:162px;line-height:1;font-weight:760;font-variation-settings:'ROND' 100;letter-spacing:-.02em;color:#006a60}}
p{{position:absolute;left:84px;font-size:38px;line-height:1.25;font-weight:500}}
.p1{{top:372px;width:620px;color:#161d1c}} .p2{{top:428px;width:560px;color:#3f4947;font-size:28px;font-weight:400}}
.moods{{position:absolute;left:84px;bottom:64px;display:flex;gap:14px}}
.moods i{{width:56px;height:56px;border-radius:50%;display:block}}
.moods i:nth-child(2){{border-radius:34%}}
.art{{position:absolute;right:78px;top:92px;width:446px;height:446px}}
</style></head><body>
<div class="blob"></div>
<div class="pill">Material 3 Expressive</div>
<h1>Moody</h1>
<p class="p1">Nhật ký tâm trạng hằng ngày</p>
<p class="p2">Daily mood journal — check in, see trends, export reports</p>
<div class="moods"><i style="background:#F0A34E"></i><i style="background:#8FBF7F"></i><i style="background:#9FB8C8"></i><i style="background:#7D8CB0"></i><i style="background:#C4676B"></i></div>
<div class="art">{icon_svg(446, None, P, PC, R=205)}</div>
</body></html>'''

with sync_playwright() as pw:
    b = pw.chromium.launch()
    def shot(svg, size, out, transparent=True):
        pg = b.new_page(viewport={'width': size, 'height': size})
        pg.set_content(html(svg, size)); pg.wait_for_timeout(100)
        pg.screenshot(path=str(out), omit_background=transparent); pg.close()
    shot(any_svg, 512, PUB / 'icons/icon-512.png')
    shot(mask_svg, 512, PUB / 'icons/icon-maskable-512.png', False)
    shot(apple_svg, 180, PUB / 'apple-touch-icon.png', False)
    shot(fav_png_svg, 256, ROOT / 'scripts/_fav256.png')
    tmp = ROOT / 'scripts/_og.html'; tmp.write_text(OG)
    pg = b.new_page(viewport={'width': 1200, 'height': 630}); pg.goto(tmp.as_uri()); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(800)
    pg.screenshot(path=str(PUB / 'og-image.png')); pg.close(); b.close()

Image.open(PUB / 'icons/icon-512.png').resize((192, 192), Image.LANCZOS).save(PUB / 'icons/icon-192.png')
big = Image.open(ROOT / 'scripts/_fav256.png').convert('RGBA')
big.resize((64, 64), Image.LANCZOS).save(PUB / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
(ROOT / 'scripts/_fav256.png').unlink(); (ROOT / 'scripts/_og.html').unlink()
print('done')
