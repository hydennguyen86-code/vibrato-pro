"""Kiểm tra server.py với Ollama giả và Claude API giả: python3 tests/server_test.py"""
import json
import os
import subprocess
import sys
import tempfile
import threading
import time
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SEEN = {}


class FakeOllama(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def do_GET(self):
        body = json.dumps({"models": [{"name": "nomic-embed-text:latest"}, {"name": "llama3.1:8b"}, {"name": "qwen2.5:7b"}]}).encode()
        self.send_response(200); self.send_header("Content-Type", "application/json"); self.end_headers(); self.wfile.write(body)

    def do_POST(self):
        SEEN["ollama"] = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        text = "<think>suy nghĩ ẩn</think>**Tốc độ 3,2 Hz** đã ổn.\n- Độ đều 58% còn thấp.\nBước tiếp: tập lại L29 năm phút."
        body = json.dumps({"message": {"role": "assistant", "content": text}}).encode()
        self.send_response(200); self.send_header("Content-Type", "application/json"); self.end_headers(); self.wfile.write(body)


class FakeClaude(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def do_POST(self):
        SEEN["claude_headers"] = dict(self.headers)
        SEEN["claude"] = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        body = json.dumps({"content": [{"type": "text", "text": "Nhận xét từ Claude.\nBước tiếp: L30."}]}).encode()
        self.send_response(200); self.send_header("Content-Type", "application/json"); self.end_headers(); self.wfile.write(body)


def serve(h, port):
    s = ThreadingHTTPServer(("127.0.0.1", port), h)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s


def req(url, payload=None):
    data = json.dumps(payload).encode() if payload is not None else None
    r = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST" if data else "GET")
    try:
        with urllib.request.urlopen(r, timeout=20) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())


fails = 0


def check(name, cond, info=""):
    global fails
    fails += 0 if cond else 1
    print(("✓ " if cond else "✗ ") + name + ("  " + str(info) if info else ""))


def start_server(port, cfg, extra=()):
    f = tempfile.NamedTemporaryFile("w", suffix=".json", delete=False)
    json.dump(cfg, f); f.close()
    env = dict(os.environ, VIBRATO_CONFIG=f.name, ANTHROPIC_API_KEY="")
    p = subprocess.Popen([sys.executable, str(ROOT / "server/server.py"), "--port", str(port), "--no-download", *extra],
                         env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    for _ in range(50):
        try:
            urllib.request.urlopen(f"http://127.0.0.1:{port}/api/health", timeout=1)
            return p
        except Exception:
            time.sleep(0.1)
    p.kill(); print(p.stdout.read()); sys.exit("server không chạy")


serve(FakeOllama, 11499)
serve(FakeClaude, 11498)
BODY = {"kind": "take", "provider": "auto",
        "level": {"id": 29, "title": "Giữ rung đều ở 3 Hz", "goal": "Rung 3 lần mỗi phách", "mode": "measure",
                  "criteria": {"rate": [2.7, 3.3], "regularityMin": 60, "width": [25, 60], "center": True, "holdSec": 4},
                  "tips": ["Đếm 1-2-3."], "mistakes": ["Cung nhấn theo nhịp."]},
        "take": {"pass": False, "durationSec": 9, "rate": 3.2, "width": 38, "regularity": 58, "center": "below", "fails": ["reg_low"],
                 "gate": {"passCount": 0, "dayCount": 0, "neededPasses": 3, "neededDays": 2}},
        "summary": {"currentLevel": {"id": 29, "title": "Giữ rung đều ở 3 Hz"}, "streakDays": 2, "levelsPassed": 28,
                    "daily": [{"day": "2026-11-07", "minutes": 12, "rate": 3.1, "width": 40}],
                    "failCounts": {"reg_low": 4}, "recentTakes": [],
                    "stageLevels": [{"id": 29, "title": "Giữ rung đều ở 3 Hz", "status": "current"}, {"id": 30, "title": "Ngón 3 ở 3 Hz", "status": "locked"}]}}

# 1) Ollama
p = start_server(8971, {"ollama_url": "http://127.0.0.1:11499", "anthropic_api_key": ""})
try:
    s, h = req("http://127.0.0.1:8971/api/health")
    check("health: Ollama chọn qwen2.5:7b, bỏ model embed", h["coach"]["ollama"]["model"] == "qwen2.5:7b" and h["coach"]["active"] == "ollama", h["coach"])
    check("health: có model nhìn tay", h["hand"] is True)
    s, r = req("http://127.0.0.1:8971/api/coach", BODY)
    check("coach Ollama trả 200", s == 200, r)
    check("bỏ <think>, markdown, gạch đầu dòng", "<think>" not in r["text"] and "**" not in r["text"] and "\n- " not in r["text"], repr(r["text"]))
    m = SEEN["ollama"]
    check("gửi Ollama: stream=false, think=false, model đúng", m["stream"] is False and m["think"] is False and m["model"] == "qwen2.5:7b")
    user = m["messages"][1]["content"]
    check("câu lệnh có số liệu dấu phẩy", "3,20 Hz" in user and "độ đều thấp" in user and "L30 Ngón 3 ở 3 Hz" in user, user[:300])
    check("system prompt có quy tắc Bước tiếp", "Bước tiếp:" in m["messages"][0]["content"])
    s, r = req("http://127.0.0.1:8971/api/coach", dict(BODY, provider="claude"))
    check("chọn Claude khi chưa có key → 503 AI_DOWN", s == 503 and r["code"] == "AI_DOWN", r)
    with urllib.request.urlopen("http://127.0.0.1:8971/") as resp:
        check("phục vụ index.html", resp.status == 200 and b"Vibrato" in resp.read(2000))
    with urllib.request.urlopen("http://127.0.0.1:8971/vendor/mediapipe/wasm/vision_wasm_internal.wasm") as resp:
        check("wasm đúng MIME", resp.headers["Content-Type"] == "application/wasm")
    try:
        urllib.request.urlopen("http://127.0.0.1:8971/vendor/../server/server.py")
        check("chặn đọc file ngoài thư mục", False)
    except urllib.error.HTTPError as e:
        check("chặn đọc file ngoài thư mục", e.code in (403, 404), e.code)
finally:
    p.kill()

# 2) Claude
p = start_server(8972, {"ollama_url": "http://127.0.0.1:1", "provider": "auto", "anthropic_api_key": "sk-test-123",
                        "anthropic_base_url": "http://127.0.0.1:11498", "claude_model": "claude-haiku-5-5"})
try:
    s, h = req("http://127.0.0.1:8972/api/health")
    check("không có Ollama → tự chuyển Claude", h["coach"]["active"] == "claude", h["coach"])
    s, r = req("http://127.0.0.1:8972/api/coach", BODY)
    check("coach Claude trả 200", s == 200 and r["provider"] == "claude" and "Bước tiếp" in r["text"], r)
    hd = {k.lower(): v for k, v in SEEN["claude_headers"].items()}
    check("gửi Claude: key, version, model", hd.get("x-api-key") == "sk-test-123" and hd.get("anthropic-version") == "2023-06-01"
          and SEEN["claude"]["model"] == "claude-haiku-5-5" and SEEN["claude"]["system"].startswith("Bạn là giáo viên"))
finally:
    p.kill()

# 3) Không có AI nào
p = start_server(8973, {"ollama_url": "http://127.0.0.1:1", "anthropic_api_key": ""})
try:
    s, h = req("http://127.0.0.1:8973/api/health")
    check("không có AI → active null", h["coach"]["active"] is None)
    s, r = req("http://127.0.0.1:8973/api/coach", BODY)
    check("coach → 503 AI_DOWN", s == 503 and r["code"] == "AI_DOWN")
finally:
    p.kill()

print("\nTất cả đạt" if not fails else f"\n{fails} lỗi")
sys.exit(1 if fails else 0)
