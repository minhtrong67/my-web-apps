#!/usr/bin/env python3
"""
Chụp đúng 4 ảnh giới thiệu vào thư mục screenshots/ (dùng cho README và landing page):
  01-home.png        Trang chủ (sáng)
  02-calendar.png    Lịch tháng + chi tiết ngày (tối)
  03-countdown.png   Đếm ngược ngày lễ (sáng)
  04-settings.png    Cài đặt: accordion màu/phông chữ, cỡ chữ 3 mức, khối tác giả & Claude AI (sáng)

Chạy:  npm run build && python3 scripts/screenshots.py
Cần:   pip install playwright && playwright install chromium
Ngày được cố định ở 23/11/2026 (Rằm 15/10 âm lịch — có ngày chay) để ảnh luôn giống nhau.
Icon Material Symbols và font được nạp từ node_modules (không cần mạng).
"""
import json, pathlib, subprocess, time, urllib.request
from datetime import datetime
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "screenshots"
OUT.mkdir(exist_ok=True)
for old in OUT.glob("*"):
    old.unlink()  # chỉ giữ đúng 4 ảnh mới

PORT = 4173
BASE = f"http://localhost:{PORT}"
SYMBOLS = ROOT / "node_modules/material-symbols/material-symbols-outlined.woff2"
SYMBOLS_CSS = (
    "@font-face{font-family:'Material Symbols Outlined';font-style:normal;font-weight:100 700;"
    f"src:url({BASE}/__symbols.woff2) format('woff2');}}"
)

SHOTS = [
    ("01-home.png", "/#/", "light"),
    ("02-calendar.png", "/#/lich", "dark"),
    ("03-countdown.png", "/#/dem-nguoc", "light"),
    ("04-settings.png", "/#/cai-dat", "light"),
]

server = subprocess.Popen(["npx", "vite", "preview", "--port", str(PORT), "--strictPort"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
try:
    for _ in range(60):
        try:
            urllib.request.urlopen(BASE, timeout=1)
            break
        except Exception:
            time.sleep(0.5)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        for name, route, mode in SHOTS:
            ctx = browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=2, locale="vi-VN", color_scheme=mode)
            ctx.add_init_script(
                "localStorage.setItem('calendar-pro:settings', %s)"
                % json.dumps(json.dumps({"themeMode": mode, "color": "pink", "language": "vi", "fontFamily": "google-sans-flex", "fontSize": "vua"}))
            )
            page = ctx.new_page()
            page.clock.set_fixed_time(datetime(2026, 11, 23, 9, 30, 0))
            page.route("https://fonts.googleapis.com/**", lambda r: r.fulfill(status=200, content_type="text/css", body=SYMBOLS_CSS))
            page.route("https://fonts.gstatic.com/**", lambda r: r.abort())
            page.route("**/__symbols.woff2", lambda r: r.fulfill(status=200, content_type="font/woff2", body=SYMBOLS.read_bytes()))
            page.goto(BASE + route)
            page.wait_for_function("document.documentElement.classList.contains('icons-ready')")
            page.evaluate("document.fonts.ready")
            page.wait_for_timeout(1800)  # đợi animation vào trang (stagger, số cuộn, sóng) kết thúc
            if route.endswith("cai-dat"):
                # Cuộn xuống cuối: thấy các accordion (đang đóng, kèm giá trị hiện tại), cỡ chữ 3 mức và khối tác giả / Claude AI
                page.evaluate("window.scrollTo({top: document.documentElement.scrollHeight, behavior: 'instant'})")
                page.wait_for_timeout(1400)
            page.mouse.move(1380, 860)
            page.screenshot(path=str(OUT / name))
            ctx.close()
        browser.close()
finally:
    server.terminate()
print("✔ đã chụp", ", ".join(n for n, *_ in SHOTS))
