"""Sinh src/fonts/*.css chỉ gồm 3 subset cần cho tiếng Việt/Latin (latin, latin-ext, vietnamese),
để bản build không phải đóng gói hàng chục subset không dùng tới (Cyrillic, Greek, CJK…).
Chạy lại: python3 scripts/gen-fonts.py  (sau khi cập nhật gói @fontsource-variable/*)"""
import re, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
KEEP = ('latin', 'latin-ext', 'vietnamese')
FONTS = {'google-sans-flex': 'google-sans-flex', 'roboto-flex': 'roboto-flex', 'inter': 'inter'}
for name, pkg in FONTS.items():
    base = ROOT / 'node_modules' / '@fontsource-variable' / pkg
    css = (base / 'wght.css').read_text(encoding='utf-8')
    out = [f'/* Tự sinh bởi scripts/gen-fonts.py – chỉ các subset: {", ".join(KEEP)} */']
    for m in re.finditer(r'/\*\s*([a-z0-9-]+?)-wght-normal\s*\*/\s*(@font-face\s*\{.*?\})', css, re.S):
        tag, block = m.group(1), m.group(2)
        subset = tag[len(pkg) + 1:]
        if subset not in KEEP:
            continue
        block = re.sub(r"url\(\./files/", f"url(../../node_modules/@fontsource-variable/{pkg}/files/", block)
        out.append(f'/* {subset} */\n{block}')
    (ROOT / 'src' / 'fonts' / f'{name}.css').write_text('\n'.join(out) + '\n', encoding='utf-8')
    print(name, len(out) - 1, 'subsets')
