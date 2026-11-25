// Kiểm deploy/_worker.js: HLV AI hiểu kind 'legato' mà không đổi hành vi 'take'/'week'.
// node tests/worker_legato.test.mjs   (máy chủ Claude giả ở 127.0.0.1:8815, không gọi ra mạng ngoài)
import http from 'node:http';
import crypto from 'node:crypto';

let fails = 0, total = 0;
const check = (n, c, info = '') => { total++; if (!c) fails++; console.log(`${c ? '✓' : '✗'} ${n} ${c ? '' : info}`); };

const mod = await import('../deploy/_worker.js');
check('_worker.js chỉ có export default', JSON.stringify(Object.keys(mod)) === '["default"]', Object.keys(mod).join(','));
const W = mod.default;

// ── Máy chủ Claude giả
const PORT = 8815;
let sent = [];
const srv = http.createServer((req, res) => {
  let d = ''; req.on('data', (c) => (d += c)); req.on('end', () => {
    let body = null; try { body = JSON.parse(d); } catch (e) { /* bỏ qua */ }
    sent.push({ path: req.url, headers: req.headers, body });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ content: [{ type: 'text', text: 'Số đo cho thấy hở 108 ms.\nBước tiếp: tập lại M9 ở 60 BPM.' }], stop_reason: 'end_turn' }));
  });
});
await new Promise((r) => srv.listen(PORT, '127.0.0.1', r));

const baseEnv = { ANTHROPIC_API_KEY: 'test-key', ANTHROPIC_BASE_URL: 'http://127.0.0.1:' + PORT, ASSETS: { fetch: () => new Response('asset') } };
let ip = 0;
async function call(path, { body, env = baseEnv, headers = {}, method = 'POST' } = {}) {
  const h = { 'CF-Connecting-IP': '10.0.0.' + (++ip % 250), ...headers }; // tránh giới hạn 20 lần/phút/IP
  const init = { method, headers: h };
  if (body !== undefined) init.body = typeof body === 'string' ? body : JSON.stringify(body);
  const r = await W.fetch(new Request('https://x' + path, init), env, { waitUntil() {} });
  let j = null; try { j = await r.clone().json(); } catch (e) { /* không phải JSON */ }
  return { status: r.status, j };
}
const last = () => sent[sent.length - 1];

try {
  // ── (a) kind 'legato'
  const LEGATO = {
    kind: 'legato', provider: 'auto',
    level: { id: 9, title: 'Rê sang La, một vĩ', goal: 'Rê sang La trong một vĩ mà tai không nghe ra chỗ chuyển.', kind: 'Chuyển dây', bpm: 60,
      tips: ['Nâng khuỷu tay trước phách.', 'Giữ sức nặng vĩ.'], mistakes: ['Đập vĩ xuống dây La → nghe tiếng rít.'] },
    legato: { pass: false, code: null, nOk: 4, nChecks: 5,
      lines: ['Liền tiếng khi đổi vĩ: sụt 4,2 dB (ngưỡng sụt ≤ 10 dB · hở ≤ 50 ms) — ĐẠT',
        'Chuyển dây: chuyển 24 ms (ngưỡng chuyển ≤ 150 ms · hở ≤ 60 ms · tạp ≤ 90 ms) — CHƯA. Tệ nhất: hở 108 ms, sụt 24,1 dB · 7/7 lần chuyển dây chưa mượt'],
      fails: [{ code: 'cross_gap', title: 'Hở tiếng lúc chuyển dây' }],
      gate: { passCount: 0, neededPasses: 1, dayCount: 0, neededDays: 1, levelPassed: false, justPassed: false },
      repeated: [{ code: 'cross_gap', title: 'Hở tiếng lúc chuyển dây', count: 3 }], passed: 8, total: 50 },
  };
  sent = [];
  let r = await call('/api/coach', { body: LEGATO });
  const b = last() && last().body;
  check('(a) legato → 200 có text', r.status === 200 && r.j && /Bước tiếp:/.test(r.j.text), JSON.stringify(r));
  check('(a) provider/model trả về', r.j && r.j.provider === 'claude' && r.j.model === 'claude-haiku-5-5');
  check('(a) gọi đúng /v1/messages, có x-api-key giả', last() && last().path === '/v1/messages' && last().headers['x-api-key'] === 'test-key');
  check('(a) body có model, max_tokens 2000', b && b.model === 'claude-haiku-5-5' && b.max_tokens === 2000);
  check('(a) KHÔNG có khoá temperature', b && !('temperature' in b));
  check('(a) system là prompt Độ mượt', b && /legato, đổi vĩ và chuyển dây/.test(b.system) && /M1 đến M50/.test(b.system) && /Bước tiếp:/.test(b.system));
  const u = b ? b.messages[0].content : '';
  check('(a) user chứa "M9"', /LEVEL ĐANG XÉT: M9 – Rê sang La, một vĩ/.test(u), u);
  check('(a) user chứa các dòng số liệu đã gửi', LEGATO.legato.lines.every((x) => u.includes(x)));
  check('(a) user có trượt, tiến độ, lỗi lặp, đã qua', u.includes('CHỈ SỐ TRƯỢT: Hở tiếng lúc chuyển dây') && u.includes('TIẾN ĐỘ QUA LEVEL: đạt 0/1 lần, 0/1 ngày')
    && u.includes('Hở tiếng lúc chuyển dây ×3') && u.includes('Đã qua 8/50 level Độ mượt.') && u.includes('4/5 chỉ số đạt'));
  check('(a) user có mẹo, lỗi thường gặp của level', u.includes('MẸO CỦA LEVEL: Nâng khuỷu tay trước phách.') && u.includes('LỖI THƯỜNG GẶP CỦA LEVEL: Đập vĩ'));
  check('(a) user không có dữ liệu vibrato L', !/\bL\d/.test(u));
  r = await call('/api/coach', { body: { ...LEGATO, legato: { ...LEGATO.legato, code: 'NO_SOUND', pass: false, lines: [] } } });
  check('(a) mã NO_SOUND được diễn giải', r.status === 200 && last().body.messages[0].content.includes('LỖI CẢ LƯỢT: không nghe thấy tiếng đàn'));

  // ── (b) kind 'take' / 'week' giữ nguyên từng ký tự (chuỗi kỳ vọng chụp từ bản gốc HEAD:deploy/_worker.js)
  const TAKE = {
    kind: 'take', provider: 'auto',
    level: { id: 31, title: 'Rung 4 nhịp', goal: 'Rung đều ở 4 nhịp mỗi phách.', criteria: { rate: [4.5, 6], regularityMin: 70, width: [20, 50], holdSec: 4 },
      tips: ['Thả lỏng ngón cái.', 'Rung xuống dưới nốt.'], mistakes: ['Bóp cần đàn.'] },
    take: { pass: false, rate: 5.123, regularity: 64.4, width: 33.25, center: 'above', durationSec: 12.4, fails: ['reg_low', 'center_above'],
      gate: { passCount: 0, neededPasses: 1, dayCount: 0, neededDays: 1, justPassed: false },
      hand: { sourceLabel: 'cổ tay', dipLabel: 'mềm', syncLabel: 'khớp' } },
    summary: { currentLevel: { id: 32, title: 'Rung 4 nhịp nhanh' },
      daily: [{ day: '2026-11-20', minutes: 12, rate: 5.1, width: 30 }, { day: '2026-11-21', minutes: 0 }],
      streakDays: 3, levelsPassed: 30, failCounts: { reg_low: 4, width_wide: 1, bogus: 9 },
      recentTakes: [{ levelId: 31, pass: false, rate: 5.1, regularity: 64 }],
      stageLevels: [{ id: 31, title: 'Rung 4 nhịp', status: 'current' }, { id: 30, title: 'Rung 3 nhịp', status: 'passed' }] },
  };
  const WEEK = { ...TAKE, kind: 'week', take: undefined };
  const EXP_TAKE = "SỐ LIỆU:\nLOẠI: Nhận xét ngay sau một lần đo\nLEVEL ĐANG XÉT: L31 – Rung 4 nhịp. Mục tiêu: Rung đều ở 4 nhịp mỗi phách.\nTIÊU CHÍ ĐẠT: tốc độ 4,5–6,0 Hz; độ đều ≥ 70%; độ rộng 20–50 cents; phải rung dưới nốt; giữ đạt 4 giây\nLEVEL HIỆN TẠI CỦA HỌC VIÊN: L32 – Rung 4 nhịp nhanh\nLẦN ĐO VỪA RỒI: CHƯA ĐẠT. Tốc độ 5,12 Hz, độ đều 64%, độ rộng 33,3 cents, tâm cao độ trên nốt (sai hướng), dài 12 giây.\nCHỈ SỐ TRƯỢT: độ đều thấp, rung lên trên nốt\nTIẾN ĐỘ QUA LEVEL: đạt 0/1 lần, 0/1 ngày\nCAMERA TAY (thử nghiệm, tham khảo): nguồn rung cổ tay, khớp đầu ngón mềm, đồng bộ khớp.\nNHẬT KÝ 2 NGÀY: 11-20: 12 phút, TB 5,10 Hz/30,0 cents. Chuỗi ngày liên tiếp: 3. Đã qua 30/100 level.\nLỖI LẶP LẠI (số lần): độ đều thấp ×4, rung quá rộng ×1\nCÁC LEVEL TRONG VÒNG (chỉ được gợi ý các level này): L31 Rung 4 nhịp (đang mở); L30 Rung 3 nhịp (đã qua)\nMẸO CỦA LEVEL: Thả lỏng ngón cái. Rung xuống dưới nốt.\nLỖI THƯỜNG GẶP CỦA LEVEL: Bóp cần đàn.\n\nHãy viết nhận xét theo đúng quy tắc.";
  const EXP_WEEK = "SỐ LIỆU:\nLOẠI: Nhận xét tuần\nLEVEL ĐANG XÉT: L31 – Rung 4 nhịp. Mục tiêu: Rung đều ở 4 nhịp mỗi phách.\nTIÊU CHÍ ĐẠT: tốc độ 4,5–6,0 Hz; độ đều ≥ 70%; độ rộng 20–50 cents; phải rung dưới nốt; giữ đạt 4 giây\nLEVEL HIỆN TẠI CỦA HỌC VIÊN: L32 – Rung 4 nhịp nhanh\nNHẬT KÝ 2 NGÀY: 11-20: 12 phút, TB 5,10 Hz/30,0 cents. Chuỗi ngày liên tiếp: 3. Đã qua 30/100 level.\nLỖI LẶP LẠI (số lần): độ đều thấp ×4, rung quá rộng ×1\nCÁC LẦN ĐO GẦN NHẤT: L31 trượt 5,1 Hz/64%\nCÁC LEVEL TRONG VÒNG (chỉ được gợi ý các level này): L31 Rung 4 nhịp (đang mở); L30 Rung 3 nhịp (đã qua)\nMẸO CỦA LEVEL: Thả lỏng ngón cái. Rung xuống dưới nốt.\nLỖI THƯỜNG GẶP CỦA LEVEL: Bóp cần đàn.\n\nHãy viết nhận xét theo đúng quy tắc.";
  const SYS_SHA = '8dbdf69c36472e0e29701ddde7aa1be2c049080dcda6c2963696b89d8a6d15fe'; // sha256 của SYSTEM_PROMPT gốc
  const sha = (x) => crypto.createHash('sha256').update(String(x)).digest('hex');
  for (const [name, p, exp] of [['take', TAKE, EXP_TAKE], ['week', WEEK, EXP_WEEK]]) {
    r = await call('/api/coach', { body: p });
    const bb = last().body;
    check(`(b) ${name} → 200`, r.status === 200);
    check(`(b) ${name}: system là prompt vibrato gốc (sha256 khớp)`, sha(bb.system) === SYS_SHA);
    check(`(b) ${name}: user prompt giống hệt bản gốc`, bb.messages[0].content === exp, JSON.stringify(bb.messages[0].content));
    check(`(b) ${name}: body chỉ có model, max_tokens, system, messages`, JSON.stringify(Object.keys(bb)) === '["model","max_tokens","system","messages"]');
  }
  r = await call('/api/coach', { body: { ...TAKE, kind: 'lạ' } });
  check('(b) kind lạ vẫn đi đường cũ', r.status === 200 && sha(last().body.system) === SYS_SHA);

  // ── (c) /api/health
  r = await call('/api/health', { method: 'GET' });
  check('(c) health có legato === true', r.status === 200 && r.j.legato === true);
  check('(c) health giữ các trường cũ', r.j.ok === true && r.j.hand === true && r.j.auth === 'none' && r.j.coach.active === 'claude'
    && r.j.coach.ollama.ok === false && r.j.coach.claude.configured === true && r.j.coach.claude.model === 'claude-haiku-5-5');
  r = await call('/api/health', { method: 'GET', env: { ...baseEnv, ANTHROPIC_API_KEY: '', COACH_PASSCODE: 'p' } });
  check('(c) health không key + có passcode', r.j.legato === true && r.j.auth === 'required' && r.j.coach.active === null && r.j.coach.claude.configured === false);

  // ── (d) passcode
  const envP = { ...baseEnv, COACH_PASSCODE: 'secret-test' };
  for (const [name, p] of [['legato', LEGATO], ['take', TAKE]]) {
    sent = [];
    r = await call('/api/coach', { body: p, env: envP });
    check(`(d) ${name}: thiếu header → 401 AUTH, không gọi Claude`, r.status === 401 && r.j.code === 'AUTH' && sent.length === 0);
    r = await call('/api/coach', { body: p, env: envP, headers: { 'X-Vibrato-Pass': 'sai' } });
    check(`(d) ${name}: sai mã → 401 AUTH`, r.status === 401 && r.j.code === 'AUTH');
    r = await call('/api/coach', { body: p, env: envP, headers: { 'X-Vibrato-Pass': 'secret-test' } });
    check(`(d) ${name}: đúng mã → 200`, r.status === 200);
  }

  // ── (e) payload legato quá khổ / thiếu / sai kiểu
  const BIG = 'x'.repeat(10000);
  const weird = [
    ['lines không phải mảng', { kind: 'legato', level: LEGATO.level, legato: { ...LEGATO.legato, lines: 'abc', fails: 'x', repeated: 5 } }],
    ['level null', { kind: 'legato', level: null, legato: LEGATO.legato }],
    ['thiếu legato', { kind: 'legato' }],
    ['legato là mảng, level là chuỗi', { kind: 'legato', level: 'M9', legato: [1, 2] }],
    ['chuỗi 10.000 ký tự ở mọi trường', { kind: 'legato',
      // tổng thân dưới 200.000 ký tự (giới hạn 413 sẵn có của worker)
      level: { id: 9, title: BIG, goal: BIG, kind: BIG, bpm: BIG, tips: [BIG], mistakes: [BIG] },
      legato: { pass: true, code: BIG, nOk: BIG, nChecks: {}, lines: [BIG], fails: [{ title: BIG }],
        gate: { passCount: BIG, neededPasses: null, justPassed: 1 }, repeated: [{ title: BIG, count: BIG }], passed: BIG, total: 50 } }],
    ['mảng quá dài', { kind: 'legato', level: { id: 9, tips: Array(40).fill('y'.repeat(500)), mistakes: Array(40).fill('z'.repeat(500)) },
      legato: { lines: Array(100).fill('x'.repeat(500)), fails: Array(100).fill({ code: 'cross_gap', title: 'Hở' }),
        repeated: Array(100).fill({ code: 'cross_gap', title: 'Hở', count: 2 }) } }],
    ['phần tử null/số trong mảng', { kind: 'legato', level: { id: 9, tips: [null, 3, {}], mistakes: [undefined] },
      legato: { lines: [null, 42, { a: 1 }], fails: [null, 'cross_gap', 7], repeated: [null, 'x', { count: 'abc' }], gate: 'x' } }],
  ];
  for (const [name, p] of weird) {
    sent = [];
    let ok = true, err = '';
    try { r = await call('/api/coach', { body: p }); } catch (e) { ok = false; err = e.message; }
    const uu = sent[0] && sent[0].body ? sent[0].body.messages[0].content : '';
    check(`(e) ${name}: không ném lỗi, 200`, ok && r.status === 200, err || JSON.stringify(r && r.j));
    check(`(e) ${name}: prompt gọn, không có chuỗi > 300 ký tự liền`, uu.length > 0 && uu.length < 9000 && !/x{301}/.test(uu) && !/NaN|undefined|\[object Object\]/.test(uu), `len=${uu.length} ${uu.slice(0, 300)}`);
    check(`(e) ${name}: vẫn là prompt Độ mượt`, sent[0] && /M1 đến M50/.test(sent[0].body.system));
  }
  sent = [];
  await call('/api/coach', { body: weird[5][1] });
  const ub = sent[0].body.messages[0].content;
  const pl = (ub.split('PHIẾU CHẤM (từng chỉ số):\n')[1] || '').split('\nCHỈ SỐ TRƯỢT')[0].split('\n');
  check('(e) lines cắt còn ≤ 14 dòng, mỗi dòng ≤ 260 ký tự', pl.length === 14 && pl.every((x) => x.length <= 260), `${pl.length}`);
  check('(e) fails ≤ 8, repeated ≤ 5', (ub.match(/CHỈ SỐ TRƯỢT: (.*)/)[1].split('; ').length === 8) && (ub.match(/LỖI LẶP LẠI 14 NGÀY \(số lần\): (.*)/)[1].split(', ').length === 5));
  check('(e) tips/mistakes ≤ 4', ub.match(/MẸO CỦA LEVEL: (.*)/)[1].split(' ').length === 4 && ub.match(/MẸO CỦA LEVEL: (.*)/)[1].split(' ').every((x) => x.length === 200) && ub.match(/LỖI THƯỜNG GẶP CỦA LEVEL: (.*)/)[1].split(' ').length === 4);
  r = await call('/api/coach', { body: '{không phải json' });
  check('(e) body không phải JSON → 400', r.status === 400 && r.j.code === 'AI_ERROR');

  // ── (f) không có ANTHROPIC_API_KEY
  for (const [name, p] of [['legato', LEGATO], ['take', TAKE]]) {
    sent = [];
    r = await call('/api/coach', { body: p, env: { ...baseEnv, ANTHROPIC_API_KEY: undefined } });
    check(`(f) ${name}: không key → 503 AI_DOWN, không gọi Claude`, r.status === 503 && r.j.code === 'AI_DOWN' && sent.length === 0);
  }

  // ── khác: route tĩnh vẫn đi ASSETS
  const ra = await W.fetch(new Request('https://x/index.html'), baseEnv, { waitUntil() {} });
  check('ASSETS vẫn phục vụ file tĩnh', (await ra.text()) === 'asset');
} catch (e) {
  fails++; total++; console.log('✗ lỗi không mong đợi: ' + (e && e.stack));
} finally {
  await new Promise((r) => srv.close(r));
}

console.log(fails ? `✗ ${fails}/${total} kiểm tra hỏng` : `Tất cả đạt (${total}/${total})`);
process.exit(fails ? 1 : 0);
