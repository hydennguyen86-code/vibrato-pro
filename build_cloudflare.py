#!/usr/bin/env python3
"""Tạo thư mục kéo thả cho Cloudflare Pages: cloudflare/vibrato/"""
import pathlib, shutil, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent
OUT = ROOT / "cloudflare" / "vibrato"
LIMIT = 25 * 1024 * 1024  # 25 MiB mỗi file

subprocess.run([sys.executable, str(ROOT / "build.py")], check=True)
if OUT.exists():
    shutil.rmtree(OUT)
(OUT / "vendor" / "mediapipe" / "wasm").mkdir(parents=True)
shutil.copy(ROOT / "dist" / "index.html", OUT / "index.html")
shutil.copy(ROOT / "deploy" / "_worker.js", OUT / "_worker.js")
src = ROOT / "vendor" / "mediapipe"
shutil.copy(src / "vision_bundle.mjs", OUT / "vendor" / "mediapipe" / "vision_bundle.mjs")
for f in (src / "wasm").iterdir():
    shutil.copy(f, OUT / "vendor" / "mediapipe" / "wasm" / f.name)
# model nhìn tay KHÔNG kèm theo: _worker.js lấy từ Google khi cần

files = [p for p in OUT.rglob("*") if p.is_file()]
big = [p for p in files if p.stat().st_size > LIMIT]
if big:
    sys.exit(f"File vượt 25 MiB: {big}")
total = sum(p.stat().st_size for p in files)
print(f"OK {OUT}  ({len(files)} file, {total/1e6:.1f} MB)")
for p in sorted(files):
    print(f"  {p.relative_to(OUT)}  {p.stat().st_size/1e6:.2f} MB")
