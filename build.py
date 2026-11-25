#!/usr/bin/env python3
"""Ghép src/* thành một file dist/index.html tự chứa."""
import pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "src"

def read(name, optional=False):
    p = SRC / name
    if not p.exists():
        if optional:
            return ""
        sys.exit(f"Thiếu {p}")
    return p.read_text(encoding="utf-8")

# Phần Độ mượt (docs/SPEC-LEGATO.md). File của worker là tuỳ chọn: thiếu thì bỏ qua, app vẫn build được.
LEGATO_CSS = ["legato-list.css", "legato-take.css"]
LEGATO_DATA = ["legato-levels.js", "legato-content.js", "legato-videos.js"]   # legato-levels.js bắt buộc
LEGATO_SCREENS = ["legato-list.js", "legato-take.js"]                          # nạp TRƯỚC ui.js, đăng ký qua window.VP_EXT
SEP = "\n</script>\n<script>\n"   # mỗi file một thẻ <script>: file này lỗi cú pháp không kéo sập file khác

def main():
    html = read("index.template.html")
    css = [read("ui.css")] + [read(n, True) for n in LEGATO_CSS]
    data = [read("levels.js"), read(LEGATO_DATA[0])] + [read(n, True) for n in LEGATO_DATA[1:]]
    engine = [read("engine.js") + "\n" + read("hand.js"), read("legato-engine.js")]
    ui = [read(n, True) for n in LEGATO_SCREENS] + [read("ui.js")]
    parts = {
        "/*__CSS__*/": "\n".join(c for c in css if c),
        "//__LEVELS__": SEP.join(d for d in data if d),
        "//__ENGINE__": SEP.join(engine),
        "//__UI__": SEP.join(u for u in ui if u),
    }
    for key, val in parts.items():
        if key not in html:
            sys.exit(f"Template thiếu placeholder {key}")
        # tránh đóng thẻ script sớm (giữ nguyên các SEP do build chèn)
        if key != "/*__CSS__*/":
            val = SEP.join(seg.replace("</script", "<\\/script") for seg in val.split(SEP))
        html = html.replace(key, val, 1)
    out = ROOT / "dist" / "index.html"
    out.parent.mkdir(exist_ok=True)
    out.write_text(html, encoding="utf-8")
    print(f"OK {out} ({out.stat().st_size/1024:.0f} KB)")

if __name__ == "__main__":
    main()
