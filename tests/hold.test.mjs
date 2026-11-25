// Đồng hồ "giữ đạt" khi đổi cung (SPEC §13): node tests/hold.test.mjs
// Giả lập đúng vòng lặp của createSession: mỗi 0,25 s chạy analyzeTrack + evaluate + makeHold trên track 6 s gần nhất.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const sb = { console, Math, Float32Array, Float64Array, Array, Object, Set, Date, JSON, Number, String };
sb.globalThis = sb; vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(here, '../src/levels.js'), 'utf8'), sb);
vm.runInContext(fs.readFileSync(path.join(here, '../src/engine.js'), 'utf8'), sb);
const { yin, rmsDb, analyzeTrack, evaluate, hzToAbsCents, makeHold, HOLD } = sb.VE._core;
const SR = 48000;
let seed = 4242;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const gauss = () => { let u = 0; while (!u) u = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd()); };

// vibrato rung dưới nốt; gaps = [[t0, t1], …] là các khoảng hở tiếng; có nhiễu nền SNR 30 dB
function synth(secs, rate, width, midi, gaps) {
  const f0 = 440 * Math.pow(2, (midi - 69) / 12), n = Math.floor(secs * SR), sig = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR, c = -width / 2 + (width / 2) * Math.sin(2 * Math.PI * rate * t);
    ph += (2 * Math.PI * f0 * Math.pow(2, c / 1200)) / SR;
    let g = 1; for (const [a, b] of gaps) if (t >= a && t < b) g = 0;
    let s = 0; if (g) for (let k = 1; k <= 8; k++) s += Math.sin(k * ph) / k;
    sig[i] = 0.2 * s + 0.004 * gauss();
  }
  return sig;
}
function run(level, sig) {
  const crit = level.criteria;
  const windowSec = Math.max(3, Math.min(5, 3.5 / crit.rate[0])), noteJump = Math.max(90, crit.width[1] + 30);
  const hop = 576, W = 1024, need = W + 268;
  const hold = makeHold({ rateLo: crit.rate[0] });
  let track = [], last = 0, maxHeld = 0, passAt = null, paused = false;
  for (let end = need; end <= sig.length; end += hop) {
    const t = end / SR, v = sig.subarray(end - need, end);
    const p = rmsDb(v, W) > -50 ? yin(v, SR, 180, 2600, W, 0.12) : null;
    track.push({ t, c: p && p.aperiodicity < 0.25 ? hzToAbsCents(p.hz, 440) : null });
    while (track[0].t < t - 6) track.shift();
    if (t - last >= 0.25) {
      const dt = last ? t - last : 0; last = t;
      const m = analyzeTrack(track, { windowSec, noteJump });
      const held = hold.update(t, dt, m, evaluate(m, crit).allOk, track);
      paused = paused || hold.paused;
      if (held > maxHeld) maxHeld = held;
      if (held >= crit.holdSec && passAt == null) passAt = t;
    }
  }
  return { maxHeld, passAt, paused, graces: hold.graces };
}
let fails = 0, total = 0;
const check = (name, cond, info = '') => { total++; if (!cond) fails++; console.log(`${cond ? '✓' : '✗'} ${name}  ${info}`); };
const fmt = (r) => `giữ tối đa ${r.maxHeld.toFixed(2)} s, đạt lúc ${r.passAt == null ? '—' : r.passAt.toFixed(2) + ' s'}`;

const L45 = sb.LEVELS.find((l) => l.id === 45);
const { rate, width, midi } = L45.demo, need = L45.criteria.holdSec;
check('ngưỡng nằm một chỗ (HOLD)', HOLD.gapMaxSec === 0.3 && HOLD.recoverSec === 1.5 && HOLD.maxGraces >= 1);
check(`L45 cần giữ ${need} s, mỗi cung 4 s`, need >= 4.5, `holdSec=${need}`);

// 1) Không hở: đạt như cũ
let r = run(L45, synth(9, rate, width, midi, []));
check('liền tiếng → đạt', r.passAt != null && !r.paused, fmt(r));
// 2) Hở 0,2 s lúc đổi cung (giây thứ 4): đồng hồ tạm dừng rồi chạy tiếp, vẫn đạt
r = run(L45, synth(12, rate, width, midi, [[4, 4.2]]));
check('hở 0,2 s lúc đổi cung → vẫn đạt', r.passAt != null && r.paused && r.graces === 1, fmt(r));
check('thời gian hở và bắt lại không được cộng: đạt trễ hơn bản liền tiếng ít nhất 0,5 s', r.passAt >= run(L45, synth(9, rate, width, midi, [])).passAt + 0.5, fmt(r));
// 3) Hở 0,6 s: về 0 như cũ → trong 8 s không đủ giữ (4 s trước + chưa đủ 5 s sau)
r = run(L45, synth(8, rate, width, midi, [[4, 4.6]]));
check('hở 0,6 s → về 0, không đạt', r.passAt == null && r.maxHeld < need, fmt(r));
// 3b) cùng mẫu đó nhưng hở 0,2 s thì đạt trong 8 s (chứng minh khác biệt là do luật hở)
r = run(L45, synth(8, rate, width, midi, [[4, 4.2]]));
check('cùng độ dài, hở 0,2 s → đạt', r.passAt != null, fmt(r));
// 4) Tiếng ngắt quãng liên tục: mỗi 1,2 s hở 0,2 s → không bao giờ đạt
{
  const gaps = []; for (let t = 1.2; t < 20; t += 1.4) gaps.push([t, t + 0.2]);
  r = run(L45, synth(20, rate, width, midi, gaps));
  check('ngắt quãng 1,2 s kéo / 0,2 s hở → không đạt', r.passAt == null, fmt(r));
}
// 4b) ngắt quãng thưa hơn (2 s kéo / 0,25 s hở) vẫn không đủ: quá số lần ân hạn
{
  const gaps = []; for (let t = 2; t < 24; t += 2.25) gaps.push([t, t + 0.25]);
  r = run(L45, synth(24, rate, width, midi, gaps));
  check('ngắt quãng 2 s kéo / 0,25 s hở → không đạt', r.passAt == null, fmt(r));
}
// 5) Sau khoảng hở mà vibrato hỏng hẳn (tiếng thẳng) → hết 1,5 s ân hạn thì về 0
{
  const n1 = synth(4, rate, width, midi, []), n2 = synth(6, rate, 0.01, midi, [[0, 0.2]]);
  const sig = new Float32Array(n1.length + n2.length); sig.set(n1); sig.set(n2, n1.length);
  r = run(L45, sig);
  check('hở rồi không rung lại → về 0 sau thời gian ân hạn', r.passAt == null && r.paused, fmt(r));
}
// 6) Hai lần đổi cung hở ngắn cách nhau 4 s (đúng nhịp L45) → vẫn đạt; không vượt quá maxGraces
r = run(L45, synth(16, rate, width, midi, [[4, 4.18], [8, 8.18]]));
check('hai lần đổi cung hở 0,18 s → đạt', r.passAt != null && r.graces <= HOLD.maxGraces, fmt(r) + ` ân hạn=${r.graces}`);
// 7) Mọi level đo có đổi cung (vòng 4, L37–50): hở 0,2 s ở giây thứ 3 vẫn đạt
for (const l of sb.LEVELS.filter((x) => x.id >= 37 && x.id <= 50 && x.mode === 'measure')) {
  r = run(l, synth(l.criteria.holdSec + 8, l.demo.rate, l.demo.width, l.demo.midi, [[3, 3.2]]));
  check(`L${l.id} hở 0,2 s → đạt`, r.passAt != null, fmt(r));
}
console.log(`\n${total - fails}/${total} đạt`);
process.exit(fails ? 1 : 0);
