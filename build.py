#!/usr/bin/env python3
"""Ghép src/* thành một file dist/index.html tự chứa."""
import pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "src"

def read(name):
    p = SRC / name
    if not p.exists():
        sys.exit(f"Thiếu {p}")
    return p.read_text(encoding="utf-8")

def main():
    html = read("index.template.html")
    parts = {
        "/*__CSS__*/": read("ui.css"),
        "//__LEVELS__": read("levels.js"),
        "//__ENGINE__": read("engine.js") + "\n" + read("hand.js"),
        "//__UI__": read("ui.js"),
    }
    for key, val in parts.items():
        if key not in html:
            sys.exit(f"Template thiếu placeholder {key}")
        # tránh đóng thẻ script sớm
        if key != "/*__CSS__*/":
            val = val.replace("</script", "<\\/script")
        html = html.replace(key, val, 1)
    out = ROOT / "dist" / "index.html"
    out.parent.mkdir(exist_ok=True)
    out.write_text(html, encoding="utf-8")
    print(f"OK {out} ({out.stat().st_size/1024:.0f} KB)")

if __name__ == "__main__":
    main()
