// Vibrato Pro — Worker chạy cùng Cloudflare Pages (chế độ _worker.js, đăng bằng kéo thả).
// - /api/health : trạng thái
// - /api/coach  : HLV AI qua Claude API (key: biến bí mật ANTHROPIC_API_KEY; mã khoá tuỳ chọn: COACH_PASSCODE)
// - /vendor/mediapipe/hand_landmarker.task : lấy model nhìn tay từ Google (nguồn chính thức) và lưu đệm
// - còn lại: file tĩnh của app
// Biến môi trường tuỳ chọn: CLAUDE_MODEL (mặc định claude-haiku-5-5), ANTHROPIC_BASE_URL (chỉ để test).

const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const DEFAULT_MODEL = 'claude-haiku-5-5';
// Cloudflare hay chạy project này ở Hồng Kông (người dùng VN) — Anthropic chặn vùng đó (403).
// Nên gọi Claude qua Worker "vibrato-coach" đặt cố định ở Mỹ (aws:us-east-1). Ghi đè bằng biến ANTHROPIC_BASE_URL nếu cần.
const DEFAULT_BASE = 'https://vibrato-coach.hydennguyen86.workers.dev/aa952da55d945893a1aeda24';

const SYSTEM_PROMPT = `Bạn là giáo viên violin chuyên dạy vibrato cho người lớn tự học. Nói tiếng Việt tự nhiên, ngắn, thẳng thắn, ấm áp nhưng không khen sáo rỗng.

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
- Số liệu camera tay (nếu có) chỉ là thử nghiệm để tham khảo, đừng kết luận chắc chắn từ nó.`;

// Phần "Độ mượt" (kind 'legato'): legato, đổi vĩ, chuyển dây. Level gọi là M1…M50.
const SYSTEM_PROMPT_LEGATO = `Bạn là giáo viên violin chuyên dạy legato, đổi vĩ và chuyển dây cho người lớn tự học. Nói tiếng Việt tự nhiên, ngắn, thẳng thắn, ấm áp nhưng không khen sáo rỗng.

Quy tắc bắt buộc:
- Chỉ dựa vào SỐ LIỆU được cung cấp. Không bịa con số, không nói về điều không có trong số liệu.
- Tối đa 110 chữ. Văn bản thuần: không markdown, không dấu *, không gạch đầu dòng, không emoji.
- Câu đầu: điều quan trọng nhất rút ra từ số liệu, nêu 1–2 con số cụ thể kèm đơn vị (ms, dB, cents, Hz, %; viết số thập phân bằng dấu phẩy).
- 1–2 câu tiếp: nguyên nhân kỹ thuật có khả năng nhất và cách sửa bằng cảm giác cơ thể cụ thể.
- Dòng cuối bắt đầu đúng bằng "Bước tiếp:" và nêu MỘT việc cụ thể (tập gì, bao lâu, metronome bao nhiêu).
- Level của phần Độ mượt gọi là M1 đến M50. Chỉ nhắc level đang xét; riêng khi số liệu có dòng LEVEL KẾ TIẾP thì được gợi ý đúng level đó. Không gợi ý level nào khác, không nhắc level L của phần vibrato.
- Ngưỡng chấm chưa được kiểm trên tiếng đàn thật: nói "số đo cho thấy", không khẳng định tuyệt đối. Nếu lượt đạt, chỉ ra chỉ số sát ngưỡng nhất để giữ.
- Micro không biết vĩ đang ở gốc, giữa hay ngọn, không thấy khuỷu tay hay cổ tay: không kết luận về vùng vĩ hay tư thế, chỉ được nhắc học viên tự kiểm.
- Nếu có LỖI CẢ LƯỢT (không nghe thấy tiếng, tiếng quá ít, sai nốt) thì nói cách để lượt sau đo được hoặc kéo đúng nốt.

Kiến thức nền:
- Hở tiếng lúc chuyển dây: cánh tay tới mức dây mới quá muộn. Chuẩn bị khuỷu tay trước phách, để lông vĩ chạm cả hai dây một thoáng rồi mới rời dây cũ, giữ tốc độ và sức nặng vĩ.
- Tiếng tạp lúc chuyển dây: đập vĩ xuống dây mới, hoặc quệt sang dây thừa vì vung tay quá đà. Chuyển động nhỏ hơn, lông vĩ không rời dây, cổ tay và ngón tay làm phần cuối.
- Sụt hoặc hở tiếng lúc đổi vĩ: cánh tay dừng hẳn rồi mới quay lại. Ngón tay và cổ tay mềm dẫn đổi chiều, giữ sức nặng trên dây qua điểm đổi.
- Chuyển chậm hoặc sai cao độ lúc vừa tới: ngón tay trái đặt sau khi vĩ đã sang dây. Đặt ngón xuống trước, vĩ sang sau.
- Vibrato đơ sau điểm đổi: tay trái ngừng rung khi tay phải bận. Rung liên tục qua điểm đổi; sang nốt mới thì ngón đặt xuống là rung ngay, rung xuống dưới nốt.
- Lệch nhịp: đổi vĩ hoặc chuyển dây sớm hay muộn so với phách; nghe metronome và chuẩn bị trước phách.
- Không đều tiếng trong nốt: tốc độ hoặc sức nặng vĩ thay đổi giữa chừng; chia vĩ đều theo số phách.
- Điều kiện qua level do học viên tự chọn (xem dòng TIẾN ĐỘ QUA LEVEL). Qua một level thì mọi level Độ mượt trước đó cũng tính là đã qua.`;

const LEGATO_CODE_VI = { NO_SOUND: 'không nghe thấy tiếng đàn (có tiếng dưới 12% thời gian)',
  TOO_SHORT: 'tiếng đàn quá ít để chấm (có tiếng dưới 40% thời gian)', WRONG_NOTE: 'quá nửa số nốt lệch hơn 80 cents, có thể kéo sai nốt hoặc sai dây' };

function buildLegatoPrompt(b) {
  const o = (x) => (x && typeof x === 'object' && !Array.isArray(x) ? x : {});
  const a = (x, n) => (Array.isArray(x) ? x.slice(0, n) : []);
  const t = (x, max) => (typeof x === 'string' ? s(x, max) : ''); // chỉ nhận chuỗi
  const n = (x) => (x != null && x !== '' && Number.isFinite(+x) ? +x : '?');
  const L = [], lv = o(b.level), g = o(b.legato);
  L.push('LOẠI: Nhận xét ngay sau một lượt tập phần Độ mượt (legato, đổi vĩ, chuyển dây)');
  if (Number.isFinite(+lv.id) && +lv.id > 0) {
    L.push(`LEVEL ĐANG XÉT: M${Math.round(+lv.id)} – ${t(lv.title, 80)}. Loại bài: ${t(lv.kind, 40) || '—'}. Nhịp ${n(lv.bpm)} BPM. Mục tiêu: ${t(lv.goal, 200)}`);
  }
  L.push(`LƯỢT TẬP VỪA RỒI: ${g.pass ? 'ĐẠT' : 'CHƯA ĐẠT'}, ${n(g.nOk)}/${n(g.nChecks)} chỉ số đạt.`);
  if (t(g.code, 30)) L.push('LỖI CẢ LƯỢT: ' + (LEGATO_CODE_VI[g.code] || t(g.code, 30)));
  const lines = a(g.lines, 14).map((x) => t(x, 260)).filter(Boolean);
  if (lines.length) L.push('PHIẾU CHẤM (từng chỉ số):\n' + lines.join('\n'));
  const fails = a(g.fails, 8).map((f) => (f && typeof f === 'object' ? t(f.title, 80) || t(f.code, 40) : t(f, 40))).filter(Boolean);
  if (fails.length) L.push('CHỈ SỐ TRƯỢT: ' + fails.join('; '));
  const gt = g.gate;
  if (gt && typeof gt === 'object') L.push(`TIẾN ĐỘ QUA LEVEL: đạt ${n(gt.passCount)}/${n(gt.neededPasses)} lần, ${n(gt.dayCount)}/${n(gt.neededDays)} ngày${gt.justPassed ? ' — VỪA QUA LEVEL' : ''}`);
  const rep = a(g.repeated, 5).filter((x) => x && typeof x === 'object' && (t(x.title, 80) || t(x.code, 40))).map((x) => `${t(x.title, 80) || t(x.code, 40)} ×${n(x.count)}`);
  if (rep.length) L.push('LỖI LẶP LẠI 14 NGÀY (số lần): ' + rep.join(', '));
  if (g.passed != null || g.total != null) L.push(`Đã qua ${n(g.passed)}/${n(g.total)} level Độ mượt.`);
  const nx = o(g.next);
  if (g.pass && Number.isFinite(+nx.id) && +nx.id > 0) L.push(`LEVEL KẾ TIẾP (được gợi ý khi lượt này đạt): M${Math.round(+nx.id)} – ${t(nx.title, 80)}`);
  const tips = a(lv.tips, 4).map((x) => t(x, 200)).filter(Boolean);
  if (tips.length) L.push('MẸO CỦA LEVEL: ' + tips.join(' '));
  const mis = a(lv.mistakes, 4).map((x) => t(x, 200)).filter(Boolean);
  if (mis.length) L.push('LỖI THƯỜNG GẶP CỦA LEVEL: ' + mis.join(' '));
  return 'SỐ LIỆU:\n' + L.join('\n') + '\n\nHãy viết nhận xét theo đúng quy tắc.';
}

const FAIL_VI = { rate_low: 'tốc độ chậm hơn ngưỡng', rate_high: 'tốc độ nhanh hơn ngưỡng', reg_low: 'độ đều thấp',
  width_narrow: 'rung quá hẹp', width_wide: 'rung quá rộng', center_above: 'rung lên trên nốt', center_flat: 'đặt ngón thấp cả nốt' };
const CENTER_VI = { below: 'dưới nốt (đúng)', above: 'trên nốt (sai hướng)', flat: 'thấp cả nốt' };
const ST_VI = { passed: 'đã qua', current: 'đang mở', locked: 'khoá' };

const vn = (x, d = 1) => (x == null || Number.isNaN(+x) ? '—' : (+x).toFixed(d).replace('.', ','));
const s = (x, max = 300) => String(x == null ? '' : x).slice(0, max); // giới hạn độ dài chuỗi từ client

function critText(c) {
  if (!c || !c.rate) return 'level tự kiểm (không đo bằng micro)';
  return `tốc độ ${vn(c.rate[0])}–${vn(c.rate[1])} Hz; độ đều ≥ ${c.regularityMin}%; độ rộng ${c.width[0]}–${c.width[1]} cents; phải rung dưới nốt; giữ đạt ${c.holdSec} giây`;
}

function buildUserPrompt(b) {
  const L = [];
  L.push('LOẠI: ' + (b.kind === 'week' ? 'Nhận xét tuần' : 'Nhận xét ngay sau một lần đo'));
  const lv = b.level || {}, sm = b.summary || {}, cur = sm.currentLevel || {};
  if (lv.id) {
    L.push(`LEVEL ĐANG XÉT: L${+lv.id} – ${s(lv.title, 80)}. Mục tiêu: ${s(lv.goal, 200)}`);
    L.push('TIÊU CHÍ ĐẠT: ' + critText(lv.criteria));
  }
  if (cur.id && cur.id !== lv.id) L.push(`LEVEL HIỆN TẠI CỦA HỌC VIÊN: L${+cur.id} – ${s(cur.title, 80)}`);
  const t = b.take;
  if (t) {
    L.push(`LẦN ĐO VỪA RỒI: ${t.pass ? 'ĐẠT' : 'CHƯA ĐẠT'}. Tốc độ ${vn(t.rate, 2)} Hz, độ đều ${vn(t.regularity, 0)}%, độ rộng ${vn(t.width)} cents, tâm cao độ ${CENTER_VI[t.center] || '—'}, dài ${vn(t.durationSec, 0)} giây.`);
    if (Array.isArray(t.fails) && t.fails.length) L.push('CHỈ SỐ TRƯỢT: ' + t.fails.slice(0, 6).map((f) => FAIL_VI[f] || s(f, 30)).join(', '));
    const g = t.gate;
    if (g) L.push(`TIẾN ĐỘ QUA LEVEL: đạt ${+g.passCount}/${+g.neededPasses} lần, ${+g.dayCount}/${+g.neededDays} ngày${g.justPassed ? ' — VỪA QUA LEVEL' : ''}`);
    const h = t.hand;
    if (h) L.push(`CAMERA TAY (thử nghiệm, tham khảo): nguồn rung ${s(h.sourceLabel, 20)}, khớp đầu ngón ${s(h.dipLabel, 20)}, đồng bộ ${s(h.syncLabel, 20)}.`);
  }
  const daily = Array.isArray(sm.daily) ? sm.daily.slice(0, 31) : [];
  if (daily.length) {
    const parts = daily.filter((d) => d.minutes || d.rate != null).map((d) =>
      `${s(d.day, 10).slice(5)}: ${+d.minutes || 0} phút` + (d.rate != null ? `, TB ${vn(d.rate, 2)} Hz/${vn(d.width)} cents` : ''));
    L.push(`NHẬT KÝ ${daily.length} NGÀY: ${parts.length ? parts.join('; ') : 'chưa tập ngày nào'}. Chuỗi ngày liên tiếp: ${+sm.streakDays || 0}. Đã qua ${+sm.levelsPassed || 0}/100 level.`);
  }
  const fc = sm.failCounts || {};
  const fk = Object.keys(fc).filter((k) => FAIL_VI[k]);
  if (fk.length) L.push('LỖI LẶP LẠI (số lần): ' + fk.sort((a, b2) => fc[b2] - fc[a]).map((k) => `${FAIL_VI[k]} ×${+fc[k]}`).join(', '));
  const rt = Array.isArray(sm.recentTakes) ? sm.recentTakes.slice(0, 8) : [];
  if (rt.length && b.kind === 'week') L.push('CÁC LẦN ĐO GẦN NHẤT: ' + rt.map((x) => `L${+x.levelId} ${x.pass ? 'đạt' : 'trượt'} ${vn(x.rate, 1)} Hz/${vn(x.regularity, 0)}%`).join('; '));
  const sl = Array.isArray(sm.stageLevels) ? sm.stageLevels.slice(0, 16) : [];
  if (sl.length) L.push('CÁC LEVEL TRONG VÒNG (chỉ được gợi ý các level này): ' + sl.map((x) => `L${+x.id} ${s(x.title, 60)} (${ST_VI[x.status] || ''})`).join('; '));
  if (Array.isArray(lv.tips) && lv.tips.length) L.push('MẸO CỦA LEVEL: ' + lv.tips.slice(0, 4).map((x) => s(x, 200)).join(' '));
  if (Array.isArray(lv.mistakes) && lv.mistakes.length) L.push('LỖI THƯỜNG GẶP CỦA LEVEL: ' + lv.mistakes.slice(0, 4).map((x) => s(x, 200)).join(' '));
  return 'SỐ LIỆU:\n' + L.join('\n') + '\n\nHãy viết nhận xét theo đúng quy tắc.';
}

function cleanText(t) {
  return String(t || '').replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/^\s*(#+|[-*•]\s+)/gm, '')
    .replace(/\*\*|__/g, '').trim().slice(0, 1200);
}

const json = (obj, status = 200) => new Response(JSON.stringify(obj), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

function safeEqual(a, b) { // so sánh không lộ thời gian
  a = String(a || ''); b = String(b || '');
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

// Chặn gọi dồn dập (theo từng máy chủ Cloudflare, ước lượng): tối đa 20 lần/phút mỗi IP
const hits = new Map();
function tooMany(ip) {
  const now = Date.now(), w = (hits.get(ip) || []).filter((t) => now - t < 60000);
  w.push(now); hits.set(ip, w);
  if (hits.size > 5000) hits.clear();
  return w.length > 20;
}

async function handleCoach(request, env) {
  if (request.method !== 'POST') return json({ error: 'Chỉ nhận POST', code: 'AI_ERROR' }, 405);
  if (env.COACH_PASSCODE && !safeEqual(request.headers.get('X-Vibrato-Pass'), env.COACH_PASSCODE)) {
    return json({ error: 'Sai hoặc thiếu mã HLV AI', code: 'AUTH' }, 401);
  }
  if (tooMany(request.headers.get('CF-Connecting-IP') || 'x')) return json({ error: 'Gọi quá nhiều, thử lại sau 1 phút', code: 'AI_ERROR' }, 429);
  if (!env.ANTHROPIC_API_KEY) return json({ error: 'Chưa cấu hình Claude API key', code: 'AI_DOWN' }, 503);
  const raw = await request.text();
  if (raw.length > 200000) return json({ error: 'Dữ liệu quá lớn', code: 'AI_ERROR' }, 413);
  let b;
  try { b = JSON.parse(raw); } catch (e) { return json({ error: 'Dữ liệu không hợp lệ', code: 'AI_ERROR' }, 400); }
  const model = env.CLAUDE_MODEL || DEFAULT_MODEL;
  const legato = !!(b && b.kind === 'legato');
  const system = legato ? SYSTEM_PROMPT_LEGATO : SYSTEM_PROMPT;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 50000);
  let r;
  try {
    r = await fetch((env.ANTHROPIC_BASE_URL || DEFAULT_BASE).replace(/\/$/, '') + '/v1/messages', {
      method: 'POST', signal: ctl.signal,
      headers: { 'Content-Type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: 2000, system,
        messages: [{ role: 'user', content: legato ? buildLegatoPrompt(b) : buildUserPrompt(b) }] }),
    });
  } catch (e) {
    clearTimeout(timer);
    return json({ error: e && e.name === 'AbortError' ? 'Claude trả lời quá lâu' : 'Không gọi được Claude', code: e && e.name === 'AbortError' ? 'TIMEOUT' : 'AI_ERROR' }, 504);
  }
  clearTimeout(timer);
  if (!r.ok) {
    let det = '';
    try { const ej = await r.json(); det = ej && ej.error ? `${ej.error.type || ''}: ${ej.error.message || ''}` : ''; } catch (e) { /* không phải JSON */ }
    det = String(det).replace(/sk-ant-[\w-]+/g, 'sk-ant-…').slice(0, 160);
    const msg = r.status === 401 ? 'Claude API key không hợp lệ' : r.status === 429 ? 'Claude đang giới hạn lượt gọi, thử lại sau'
      : r.status === 403 ? 'Claude chặn yêu cầu (403) — có thể do vùng máy chủ hoặc quyền của API key'
      : r.status === 400 ? 'Claude từ chối yêu cầu (hết tiền hoặc sai tên model)' : `Claude lỗi ${r.status}`;
    return json({ error: det ? `${msg} · ${det}` : msg, code: 'AI_ERROR' }, 502);
  }
  const j = await r.json();
  const text = cleanText((j.content || []).filter((c) => c.type === 'text').map((c) => c.text).join(''));
  if (!text) {
    const kinds = (j.content || []).map((c) => c && c.type).join(',') || 'không có';
    return json({ error: `Claude trả về rỗng (stop_reason=${j.stop_reason || '?'}; khối=${kinds})`, code: 'AI_ERROR' }, 502);
  }
  return json({ text, provider: 'claude', model });
}

async function handleModel(request, ctx) {
  const cache = caches.default;
  const key = new Request(new URL(request.url).origin + '/vendor/mediapipe/hand_landmarker.task', { method: 'GET' });
  let res = await cache.match(key);
  if (!res) {
    let up;
    try { up = await fetch(MODEL_URL, { cf: { cacheEverything: true, cacheTtl: 2592000 } }); }
    catch (e) { return new Response('Không tải được model nhìn tay', { status: 502 }); }
    if (!up.ok) return new Response('Không tải được model nhìn tay', { status: 502 });
    res = new Response(up.body, { status: 200, headers: { 'Content-Type': 'application/octet-stream', 'Cache-Control': 'public, max-age=604800' } });
    ctx.waitUntil(cache.put(key, res.clone()));
  }
  if (request.method === 'HEAD') return new Response(null, { status: 200, headers: res.headers });
  return res;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    try {
      if (url.pathname === '/api/health') {
        const configured = !!env.ANTHROPIC_API_KEY;
        return json({ ok: true, hand: true, auth: env.COACH_PASSCODE ? 'required' : 'none',
          coach: { active: configured ? 'claude' : null, ollama: { ok: false, model: null },
            claude: { configured, model: env.CLAUDE_MODEL || DEFAULT_MODEL } }, legato: true });
      }
      if (url.pathname === '/api/coach') return await handleCoach(request, env);
      if (url.pathname.startsWith('/api/')) return json({ error: 'Không có', code: 'AI_ERROR' }, 404);
      if (url.pathname === '/vendor/mediapipe/hand_landmarker.task') return await handleModel(request, ctx);
    } catch (e) {
      return json({ error: 'Lỗi máy chủ: ' + (e && e.message), code: 'AI_ERROR' }, 500);
    }
    return env.ASSETS.fetch(request);
  },
};

// Lưu ý: KHÔNG thêm export nào khác — Cloudflare coi mọi export là một trình xử lý và sẽ báo lỗi.
