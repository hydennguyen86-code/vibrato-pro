#!/usr/bin/env python3
"""Vibrato Pro — máy chủ chạy trên Mac (chỉ dùng thư viện chuẩn của Python).

  - Phục vụ app (index.html) và thư viện nhìn tay MediaPipe ở /vendor/mediapipe/
  - /api/health : trạng thái máy chủ, model nhìn tay, AI
  - /api/coach  : HLV AI — gửi số liệu tập cho Ollama (trên Mac) hoặc Claude API
Chỉ lắng nghe 127.0.0.1; iPhone vào qua Tailscale Serve (https).

Chạy: python3 server.py [--port 8787] [--coach auto|ollama|claude|mock]
"""
import argparse
import json
import mimetypes
import os
import re
import sys
import threading
import time
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HERE = Path(__file__).resolve().parent
MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
DEFAULT_CONFIG = {
    "provider": "auto",                # auto | ollama | claude
    "ollama_url": "http://127.0.0.1:11434",
    "ollama_model": "auto",            # auto = tự chọn model hợp nhất đã cài
    "anthropic_api_key": "",           # hoặc biến môi trường ANTHROPIC_API_KEY
    "claude_model": "claude-haiku-5-5",
    "anthropic_base_url": "https://api.anthropic.com",
}
mimetypes.add_type("text/javascript", ".mjs")
mimetypes.add_type("text/javascript", ".js")
mimetypes.add_type("application/wasm", ".wasm")
mimetypes.add_type("application/octet-stream", ".task")


def log(*a):
    print(time.strftime("%H:%M:%S"), *a, flush=True)


# ───────────────────────── Cấu hình & thư mục ─────────────────────────
def find_app_dir():
    for p in (HERE / "app", HERE.parent / "dist"):
        if (p / "index.html").exists():
            return p
    sys.exit("Không tìm thấy app (thư mục app/index.html).")


def find_vendor_dir(app_dir):
    for p in (app_dir / "vendor", HERE / "vendor", HERE.parent / "vendor"):
        if (p / "mediapipe").exists():
            return p
    return app_dir / "vendor"


def load_config():
    cfg = dict(DEFAULT_CONFIG)
    f = Path(os.environ.get("VIBRATO_CONFIG") or (HERE / "config.json"))
    if f.exists():
        try:
            cfg.update({k: v for k, v in json.loads(f.read_text(encoding="utf-8")).items() if not k.startswith("_")})
        except Exception as e:  # noqa: BLE001
            log("⚠️  config.json lỗi, dùng mặc định:", e)
    if not cfg.get("anthropic_api_key"):
        cfg["anthropic_api_key"] = os.environ.get("ANTHROPIC_API_KEY", "")
    return cfg


def ensure_model(vendor_dir):
    target = vendor_dir / "mediapipe" / "hand_landmarker.task"
    if target.exists() and target.stat().st_size > 1_000_000:
        return True
    target.parent.mkdir(parents=True, exist_ok=True)
    log("Đang tải model nhìn tay từ Google (≈ 8 MB, chỉ lần đầu)…")
    try:
        tmp = target.with_suffix(".part")
        with urllib.request.urlopen(MODEL_URL, timeout=60) as r, open(tmp, "wb") as out:
            while True:
                chunk = r.read(1 << 16)
                if not chunk:
                    break
                out.write(chunk)
        tmp.rename(target)
        log("✓ Đã tải model nhìn tay.")
        return True
    except Exception as e:  # noqa: BLE001
        log("⚠️  Không tải được model nhìn tay (camera tay sẽ tắt):", e)
        return False


# ───────────────────────── Gọi HTTP ─────────────────────────
def http_json(url, payload=None, headers=None, timeout=10):
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json", **(headers or {})},
                                 method="POST" if data is not None else "GET")
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


# ───────────────────────── Nhà cung cấp AI ─────────────────────────
OLLAMA_PREF = [r"qwen3(?!.*(30b|32b|70b|235b))", r"qwen2\.5:(7b|14b)", r"qwen2\.5(?!.*(32b|72b))", r"gemma3(?!.*27b)",
               r"llama3\.1:8b", r"llama3", r"mistral", r"phi"]


class Coach:
    def __init__(self, cfg, forced=None):
        self.cfg = cfg
        self.forced = forced if forced and forced != "auto" else None
        self._ollama = {"ok": False, "model": None, "at": 0}
        self.lock = threading.Lock()

    # Ollama có chạy không, dùng model nào
    def ollama_state(self, fresh=False):
        with self.lock:
            if not fresh and time.time() - self._ollama["at"] < 15:
                return self._ollama
        st = {"ok": False, "model": None, "at": time.time(), "models": []}
        try:
            tags = http_json(self.cfg["ollama_url"].rstrip("/") + "/api/tags", timeout=1.5)
            names = [m.get("name", "") for m in tags.get("models", [])]
            names = [n for n in names if "embed" not in n.lower()]
            st["models"] = names
            want = self.cfg.get("ollama_model", "auto")
            if want and want != "auto":
                st["model"] = want if want in names or any(n.startswith(want) for n in names) else None
            else:
                for pat in OLLAMA_PREF:
                    hit = next((n for n in names if re.search(pat, n, re.I)), None)
                    if hit:
                        st["model"] = hit
                        break
                if not st["model"] and names:
                    st["model"] = names[0]
            st["ok"] = bool(st["model"])
        except Exception:  # noqa: BLE001
            pass
        with self.lock:
            self._ollama = st
        return st

    def claude_configured(self):
        return bool(self.cfg.get("anthropic_api_key"))

    def pick(self, requested="auto"):
        want = self.forced or (requested if requested in ("ollama", "claude") else None) or self.cfg.get("provider", "auto")
        if want == "mock":
            return "mock"
        if want == "ollama":
            return "ollama" if self.ollama_state()["ok"] else None
        if want == "claude":
            return "claude" if self.claude_configured() else None
        if self.ollama_state()["ok"]:
            return "ollama"
        if self.claude_configured():
            return "claude"
        return None

    def health(self, requested="auto"):
        o = self.ollama_state()
        return {
            "active": self.pick(requested),
            "ollama": {"ok": o["ok"], "model": o["model"]},
            "claude": {"configured": self.claude_configured(), "model": self.cfg.get("claude_model")},
        }

    def ask(self, provider, system, user):
        if provider == "mock":
            time.sleep(0.8)
            return ("Tốc độ đã ổn, nhưng độ đều còn thấp so với ngưỡng. Thường là do ngón cái bóp khi bắt đầu tăng tốc.\n"
                    "Bước tiếp: tập lại level hiện tại ở metronome chậm hơn 6 nhịp trong 5 phút."), "mock-model"
        if provider == "ollama":
            o = self.ollama_state()
            body = {"model": o["model"], "stream": False, "think": False,
                    "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
                    "options": {"temperature": 0.4, "num_predict": 450}}
            try:
                j = http_json(self.cfg["ollama_url"].rstrip("/") + "/api/chat", body, timeout=55)
            except urllib.error.HTTPError as e:
                if e.code == 400:  # model không hỗ trợ "think" → gửi lại không có trường này
                    body.pop("think", None)
                    j = http_json(self.cfg["ollama_url"].rstrip("/") + "/api/chat", body, timeout=55)
                else:
                    raise
            return (j.get("message") or {}).get("content", ""), o["model"]
        if provider == "claude":
            model = self.cfg.get("claude_model") or "claude-haiku-5-5"
            j = http_json(self.cfg["anthropic_base_url"].rstrip("/") + "/v1/messages",
                          {"model": model, "max_tokens": 2000, "system": system,
                           "messages": [{"role": "user", "content": user}]},
                          headers={"x-api-key": self.cfg["anthropic_api_key"], "anthropic-version": "2023-06-01"}, timeout=55)
            text = "".join(b.get("text", "") for b in j.get("content", []) if b.get("type") == "text")
            return text, model
        raise RuntimeError("Không có AI")


# ───────────────────────── Câu lệnh cho HLV ─────────────────────────
SYSTEM_PROMPT = """Bạn là giáo viên violin chuyên dạy vibrato cho người lớn tự học. Nói tiếng Việt tự nhiên, ngắn, thẳng thắn, ấm áp nhưng không khen sáo rỗng.

Quy tắc bắt buộc:
- Chỉ dựa vào SỐ LIỆU được cung cấp. Không bịa con số, không nói về điều không có trong số liệu.
- Tối đa 110 chữ. Văn bản thuần: không markdown, không dấu *, không gạch đầu dòng, không emoji.
- Câu đầu: điều quan trọng nhất rút ra từ số liệu, nêu 1–2 con số cụ thể (viết số thập phân bằng dấu phẩy).
- 1–2 câu tiếp: nguyên nhân kỹ thuật có khả năng nhất và cách sửa bằng cảm giác cơ thể cụ thể.
- Dòng cuối bắt đầu đúng bằng "Bước tiếp:" và nêu MỘT việc cụ thể (tập level nào, bao lâu, metronome bao nhiêu). Chỉ nhắc level có trong danh sách được cung cấp.

Kiến thức nền:
- Vibrato đúng: ngón lăn về phía cuộn đàn, cao độ dao động từ nốt XUỐNG dưới. "Trên nốt" = đang lăn cả về phía ngựa đàn. "Thấp cả nốt" = đặt ngón thấp, cần chỉnh nốt trước khi rung.
- Độ đều thấp thường do ngón cái bóp, gồng vai, hoặc tăng tốc khi chưa vững; sửa bằng chậm lại và thả lỏng.
- Quá rộng khi nhanh → thu nhỏ chuyển động; quá hẹp → để khớp đầu ngón mềm hơn, dùng thêm cánh tay/cổ tay.
- Tốc độ thấp hơn ngưỡng → bám theo metronome; cao hơn → đang vội.
- Điều kiện qua level do học viên tự chọn (xem dòng TIẾN ĐỘ QUA LEVEL). Qua một level thì mọi level trước đó cũng tính là đã qua; có thể nhảy thẳng tới level khó hơn nếu đã vững.
- Số liệu camera tay (nếu có) chỉ là thử nghiệm để tham khảo, đừng kết luận chắc chắn từ nó."""

FAIL_VI = {"rate_low": "tốc độ chậm hơn ngưỡng", "rate_high": "tốc độ nhanh hơn ngưỡng", "reg_low": "độ đều thấp",
           "width_narrow": "rung quá hẹp", "width_wide": "rung quá rộng", "center_above": "rung lên trên nốt",
           "center_flat": "đặt ngón thấp cả nốt"}
CENTER_VI = {"below": "dưới nốt (đúng)", "above": "trên nốt (sai hướng)", "flat": "thấp cả nốt"}


def vn(x, d=1):
    if x is None:
        return "—"
    s = f"{x:.{d}f}" if isinstance(x, (int, float)) else str(x)
    return s.replace(".", ",")


def crit_text(c):
    if not c:
        return "level tự kiểm (không đo bằng micro)"
    return (f"tốc độ {vn(c['rate'][0])}–{vn(c['rate'][1])} Hz; độ đều ≥ {c['regularityMin']}%; "
            f"độ rộng {c['width'][0]}–{c['width'][1]} cents; phải rung dưới nốt; giữ đạt {c['holdSec']} giây")


def build_user_prompt(b):
    lines = []
    kind = b.get("kind")
    lines.append("LOẠI: " + ("Nhận xét tuần" if kind == "week" else "Nhận xét ngay sau một lần đo"))
    lv = b.get("level") or {}
    s = b.get("summary") or {}
    cur = s.get("currentLevel") or {}
    if lv:
        lines.append(f"LEVEL ĐANG XÉT: L{lv.get('id')} – {lv.get('title')}. Mục tiêu: {lv.get('goal')}")
        lines.append("TIÊU CHÍ ĐẠT: " + crit_text(lv.get("criteria")))
    if cur and cur.get("id") != lv.get("id"):
        lines.append(f"LEVEL HIỆN TẠI CỦA HỌC VIÊN: L{cur.get('id')} – {cur.get('title')}")
    t = b.get("take")
    if t:
        res = "ĐẠT" if t.get("pass") else "CHƯA ĐẠT"
        lines.append(f"LẦN ĐO VỪA RỒI: {res}. Tốc độ {vn(t.get('rate'), 2)} Hz, độ đều {vn(t.get('regularity'), 0)}%, "
                     f"độ rộng {vn(t.get('width'))} cents, tâm cao độ {CENTER_VI.get(t.get('center'), '—')}, dài {vn(t.get('durationSec'), 0)} giây.")
        if t.get("fails"):
            lines.append("CHỈ SỐ TRƯỢT: " + ", ".join(FAIL_VI.get(f, f) for f in t["fails"]))
        g = t.get("gate") or {}
        if g:
            lines.append(f"TIẾN ĐỘ QUA LEVEL: đạt {g.get('passCount')}/{g.get('neededPasses')} lần, {g.get('dayCount')}/{g.get('neededDays')} ngày"
                         + (" — VỪA QUA LEVEL" if g.get("justPassed") else ""))
        h = t.get("hand")
        if h:
            lines.append(f"CAMERA TAY (thử nghiệm, tham khảo): nguồn rung {h.get('sourceLabel', '—')}, khớp đầu ngón {h.get('dipLabel', '—')}, "
                         f"đồng bộ {h.get('syncLabel', '—')}.")
    daily = s.get("daily") or []
    if daily:
        parts = []
        for d in daily:
            if d.get("minutes") or d.get("rate") is not None:
                parts.append(f"{d['day'][5:]}: {d.get('minutes', 0)} phút"
                             + (f", TB {vn(d['rate'], 2)} Hz/{vn(d['width'])} cents" if d.get("rate") is not None else ""))
        lines.append(f"NHẬT KÝ {len(daily)} NGÀY: " + ("; ".join(parts) if parts else "chưa tập ngày nào") +
                     f". Chuỗi ngày liên tiếp: {s.get('streakDays', 0)}. Đã qua {s.get('levelsPassed', 0)}/100 level.")
    fc = s.get("failCounts") or {}
    if fc:
        lines.append("LỖI LẶP LẠI (số lần): " + ", ".join(f"{FAIL_VI.get(k, k)} ×{v}" for k, v in sorted(fc.items(), key=lambda x: -x[1])))
    rt = s.get("recentTakes") or []
    if rt and kind == "week":
        lines.append("CÁC LẦN ĐO GẦN NHẤT: " + "; ".join(
            f"L{x['levelId']} {'đạt' if x['pass'] else 'trượt'} {vn(x.get('rate'), 1)} Hz/{vn(x.get('regularity'), 0)}%" for x in rt[:8]))
    sl = s.get("stageLevels") or []
    if sl:
        st_vi = {"passed": "đã qua", "current": "đang mở", "locked": "khoá"}
        lines.append("CÁC LEVEL TRONG VÒNG (chỉ được gợi ý các level này): " + "; ".join(
            f"L{x['id']} {x['title']} ({st_vi.get(x['status'], x['status'])})" for x in sl))
    if lv.get("tips"):
        lines.append("MẸO CỦA LEVEL: " + " ".join(lv["tips"]))
    if lv.get("mistakes"):
        lines.append("LỖI THƯỜNG GẶP CỦA LEVEL: " + " ".join(lv["mistakes"]))
    return "SỐ LIỆU:\n" + "\n".join(lines) + "\n\nHãy viết nhận xét theo đúng quy tắc."


def clean_text(text):
    text = re.sub(r"<think>.*?</think>", "", text or "", flags=re.S | re.I)
    text = re.sub(r"^\s*(#+|[-*•]\s+)", "", text, flags=re.M)
    text = text.replace("**", "").replace("__", "").strip()
    return text[:1200]


# ───────────────────────── HTTP ─────────────────────────
class Handler(BaseHTTPRequestHandler):
    server_version = "VibratoPro/2"

    def log_message(self, fmt, *args):  # gọn log
        if "/api/" in (self.path or ""):
            log(self.command, self.path.split("?")[0], args[1] if len(args) > 1 else "")

    def send_json(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_HEAD(self):
        self.serve_static(head=True)

    def do_GET(self):
        path = self.path.split("?")[0]
        if path == "/api/health":
            q = dict(p.split("=", 1) for p in self.path.split("?", 1)[1].split("&") if "=" in p) if "?" in self.path else {}
            self.send_json(200, {"ok": True, "auth": "none", "hand": (APP["vendor"] / "mediapipe" / "hand_landmarker.task").exists(),
                                 "coach": APP["coach"].health(q.get("provider", "auto"))})
            return
        self.serve_static()

    def do_POST(self):
        if self.path.split("?")[0] != "/api/coach":
            self.send_json(404, {"error": "not found"})
            return
        try:
            n = int(self.headers.get("Content-Length") or 0)
            if n > 200_000:
                raise ValueError("quá lớn")
            b = json.loads(self.rfile.read(n).decode("utf-8"))
        except Exception:  # noqa: BLE001
            self.send_json(400, {"error": "Dữ liệu không hợp lệ", "code": "AI_ERROR"})
            return
        coach = APP["coach"]
        provider = coach.pick(b.get("provider", "auto"))
        if not provider:
            self.send_json(503, {"error": "Chưa có AI nào chạy", "code": "AI_DOWN"})
            return
        try:
            t0 = time.time()
            text, model = coach.ask(provider, SYSTEM_PROMPT, build_user_prompt(b))
            text = clean_text(text)
            if not text:
                raise RuntimeError("AI trả về rỗng")
            log(f"HLV ({provider} · {model}) {time.time() - t0:.1f}s")
            self.send_json(200, {"text": text, "provider": provider, "model": model})
        except urllib.error.HTTPError as e:
            detail = ""
            try:
                detail = e.read().decode("utf-8")[:300]
            except Exception:  # noqa: BLE001
                pass
            log("⚠️  AI lỗi HTTP", e.code, detail)
            self.send_json(502, {"error": f"AI lỗi ({e.code})", "code": "AI_ERROR"})
        except Exception as e:  # noqa: BLE001
            code = "TIMEOUT" if "timed out" in str(e).lower() else "AI_ERROR"
            log("⚠️  AI lỗi:", e)
            self.send_json(504 if code == "TIMEOUT" else 502, {"error": str(e)[:200], "code": code})

    def serve_static(self, head=False):
        path = self.path.split("?")[0]
        if path in ("/", ""):
            f = APP["app"] / "index.html"
        elif path.startswith("/vendor/"):
            f = (APP["vendor"] / path[len("/vendor/"):]).resolve()
            if APP["vendor"].resolve() not in f.parents:
                self.send_error(403)
                return
        else:
            f = (APP["app"] / path.lstrip("/")).resolve()
            if APP["app"].resolve() not in f.parents and f != APP["app"].resolve():
                self.send_error(403)
                return
        if not f.is_file():
            self.send_error(404)
            return
        ctype = mimetypes.guess_type(str(f))[0] or "application/octet-stream"
        size = f.stat().st_size
        self.send_response(200)
        self.send_header("Content-Type", ctype + ("; charset=utf-8" if ctype.startswith("text/") else ""))
        self.send_header("Content-Length", str(size))
        self.send_header("Cache-Control", "no-cache" if f.name == "index.html" else "public, max-age=86400")
        self.end_headers()
        if head:
            return
        with open(f, "rb") as fh:
            while True:
                chunk = fh.read(1 << 16)
                if not chunk:
                    break
                try:
                    self.wfile.write(chunk)
                except (BrokenPipeError, ConnectionResetError):
                    return


APP = {}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8787)
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--coach", default=None, help="auto | ollama | claude | mock")
    ap.add_argument("--no-download", action="store_true")
    a = ap.parse_args()
    app_dir = find_app_dir()
    vendor = find_vendor_dir(app_dir)
    cfg = load_config()
    APP.update(app=app_dir, vendor=vendor, coach=Coach(cfg, a.coach))
    if not a.no_download:
        ensure_model(vendor)
    h = APP["coach"].health()
    log(f"App: {app_dir}")
    log(f"Camera tay: {'sẵn sàng' if (vendor / 'mediapipe' / 'hand_landmarker.task').exists() else 'thiếu model'}")
    o = h["ollama"]
    log(f"Ollama: {'chạy, model ' + o['model'] if o['ok'] else 'chưa chạy hoặc chưa có model'}")
    log(f"Claude API: {'đã có key' if h['claude']['configured'] else 'chưa cấu hình'}")
    log(f"HLV AI đang dùng: {h['active'] or 'chưa có'}")
    srv = ThreadingHTTPServer((a.host, a.port), Handler)
    log(f"Máy chủ chạy tại http://{a.host}:{a.port}  (Ctrl+C để dừng)")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        log("Đã dừng.")


if __name__ == "__main__":
    main()
