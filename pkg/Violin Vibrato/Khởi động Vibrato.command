#!/bin/zsh
# Vibrato Pro — nhấp đúp để chạy máy chủ cho iPhone (qua Tailscale).
# Dừng: đóng cửa sổ Terminal này hoặc bấm Ctrl+C.
cd "$(dirname "$0")" || exit 1
PORT=8787
echo "════════════════════════════════════════"
echo "   Vibrato Pro — máy chủ trên Mac"
echo "════════════════════════════════════════"

# 1) Tìm Python 3 (không cài thêm gì)
PY=""
for c in python3 "$HOME/anaconda3/bin/python3" "$HOME/miniconda3/bin/python3" "$HOME/opt/anaconda3/bin/python3" \
         /opt/homebrew/bin/python3 /usr/local/bin/python3 /usr/bin/python3; do
  if command -v "$c" >/dev/null 2>&1 && "$c" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 8) else 1)' 2>/dev/null; then
    PY="$c"; break
  fi
done
if [[ -z "$PY" ]]; then
  echo "✗ Không tìm thấy Python 3. Cài từ https://www.python.org/downloads/ rồi chạy lại."
  read -k1 "?Bấm phím bất kỳ để đóng…"; exit 1
fi
echo "✓ Python: $PY"

# 2) Ollama (HLV AI trên Mac)
if curl -s --max-time 1 http://127.0.0.1:11434/api/tags >/dev/null; then
  echo "✓ Ollama đang chạy"
elif [[ -d /Applications/Ollama.app ]]; then
  echo "… Mở Ollama"; open -a Ollama; sleep 4
else
  echo "! Chưa thấy Ollama — HLV AI sẽ dùng Claude API nếu đã điền key trong config.json"
fi

# 3) Tailscale: đưa máy chủ lên https cho iPhone
TS=""
for c in tailscale /Applications/Tailscale.app/Contents/MacOS/Tailscale /opt/homebrew/bin/tailscale /usr/local/bin/tailscale; do
  if command -v "$c" >/dev/null 2>&1; then TS="$c"; break; fi
done
URL=""
if [[ -n "$TS" ]]; then
  "$TS" serve --bg $PORT >/tmp/vibrato-ts.log 2>&1
  if grep -qi "https" /tmp/vibrato-ts.log && grep -qi "enable\|admin\|login" /tmp/vibrato-ts.log; then
    echo "! Tailscale cần bật HTTPS một lần. Làm theo hướng dẫn dưới đây rồi chạy lại file này:"
    cat /tmp/vibrato-ts.log
  fi
  DNS=$("$TS" status --json 2>/dev/null | "$PY" -c 'import json,sys
try: print(json.load(sys.stdin)["Self"]["DNSName"].rstrip("."))
except Exception: pass')
  [[ -n "$DNS" ]] && URL="https://$DNS"
else
  echo "! Chưa thấy Tailscale — cài từ App Store hoặc https://tailscale.com/download rồi chạy lại."
fi

echo "────────────────────────────────────────"
if [[ -n "$URL" ]]; then
  echo "📱 Trên iPhone (đã bật Tailscale), mở Safari và vào:"
  echo ""
  echo "      $URL"
  echo ""
  echo "   Rồi bấm Chia sẻ → Thêm vào Màn hình chính để dùng như app."
fi
echo "💻 Trên Mac: http://127.0.0.1:$PORT"
echo "────────────────────────────────────────"

# 4) Giữ Mac không ngủ khi máy chủ chạy, rồi chạy máy chủ
caffeinate -dimsu -w $$ &
trap '[[ -n "$TS" ]] && "$TS" serve --https=443 off >/dev/null 2>&1; echo "Đã dừng."' EXIT
"$PY" server.py --port $PORT
