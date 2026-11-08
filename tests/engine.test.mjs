// Kiểm tra độ chính xác bộ đo bằng tín hiệu tổng hợp: node tests/engine.test.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const code = fs.readFileSync(path.join(here, '../src/engine.js'), 'utf8');
const sandbox = { console, Math, Float32Array, Float64Array, Array, Object, Set, Date, JSON, Number, String };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const { yin, rmsDb, analyzeTrack, hzToAbsCents } = sandbox.VE._core;

const SR = 48000, A4 = 440;
let seed = 12345;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

// Tạo tiếng dây: 12 hài, biên độ 1/k, cents(t) do hàm truyền vào
function synth(seconds, centsFn, f0, snrDb) {
  const n = Math.floor(seconds * SR);
  const out = new Float32Array(n);
  const phases = Array.from({ length: 12 }, () => rnd() * 2 * Math.PI);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const c = centsFn(t);
    if (c == null) { out[i] = 0; continue; }
    const f = f0 * Math.pow(2, c / 1200);
    ph += (2 * Math.PI * f) / SR;
    let s = 0;
    for (let k = 1; k <= 12; k++) if (f * k < SR / 2.2) s += Math.sin(k * ph + phases[k - 1]) / k;
    out[i] = 0.2 * s;
  }
  if (snrDb != null) {
    let p = 0; for (let i = 0; i < n; i++) p += out[i] * out[i];
    const sigma = Math.sqrt(p / n / Math.pow(10, snrDb / 10));
    for (let i = 0; i < n; i++) out[i] += sigma * gauss();
  }
  return out;
}

// Giống trình duyệt: mỗi 12 ms lấy 4096 mẫu cuối, YIN trên cửa sổ 22 ms
function track(sig, minHz = 180) {
  const hop = Math.round(0.012 * SR), W = 1024, need = W + Math.floor(SR / minHz) + 2;
  const tr = [];
  for (let end = need; end <= sig.length; end += hop) {
    const view = sig.subarray(end - need, end);
    const db = rmsDb(view, W);
    let c = null;
    if (db > -50) {
      const p = yin(view, SR, minHz, 2600, W, 0.12);
      if (p && p.aperiodicity < 0.25) c = hzToAbsCents(p.hz, A4);
    }
    tr.push({ t: end / SR, c });
  }
  return tr;
}

let fails = 0, total = 0;
function check(name, cond, info) {
  total++;
  if (!cond) fails++;
  console.log(`${cond ? '✓' : '✗'} ${name}${info ? '  ' + info : ''}`);
}
const fmt = (m) => `rate=${m.rate?.toFixed(3)} width=${m.width?.toFixed(1)} reg=${m.regularity?.toFixed(0)} center=${m.center} peakOff=${m.peakOffset?.toFixed(1)} reason=${m.reason}`;

// 1) Cao độ tĩnh
for (const hz of [196, 293.66, 440, 659.26, 987.77, 1318.51, 2093]) {
  const sig = synth(0.2, () => 0, hz);
  const p = yin(sig.subarray(sig.length - 1300), SR, 180, 2600, 1024, 0.12);
  const err = 1200 * Math.log2(p.hz / hz);
  check(`cao độ ${hz} Hz`, Math.abs(err) < (hz > 1000 ? 2 : 1), `sai ${err.toFixed(2)} cents`);
}

// 2) Vibrato rung dưới nốt, nhiều tốc độ và độ rộng
const vib = (r, w, offset = -w / 2, jitter = 0) => {
  let phase = 0, lastT = 0, rr = r;
  return (t) => {
    const dt = t - lastT; lastT = t;
    phase += 2 * Math.PI * rr * dt;
    if (jitter && phase > 2 * Math.PI) { phase -= 2 * Math.PI; rr = r * (1 + jitter * (rnd() * 2 - 1)); }
    return offset + (w / 2) * Math.sin(phase);
  };
};
for (const r of [1, 2, 3, 4.4, 5.5, 6.5, 7.5]) {
  for (const w of [15, 30, 50, 70]) {
    const sig = synth(5, vib(r, w), 554.37); // C#5
    const win = Math.max(3, Math.min(5, 3.5 / (r * 0.9)));
    const m = analyzeTrack(track(sig), { windowSec: win });
    const okR = m.valid && Math.abs(m.rate - r) <= Math.max(0.05, 0.03 * r);
    const okW = m.valid && Math.abs(m.width - w) <= Math.max(3, 0.12 * w);
    check(`vibrato ${r} Hz, ${w} cents`, okR && okW && m.center === 'below' && m.regularity >= 90, fmt(m));
  }
}

// 3) Dây Sol (thấp) và Mi (cao)
for (const [hz, label] of [[220, 'dây Sol A3'], [1318.5, 'dây Mi E6']]) {
  const sig = synth(4, vib(5.5, 30), hz);
  const m = analyzeTrack(track(sig), { windowSec: 3 });
  check(`vibrato trên ${label}`, m.valid && Math.abs(m.rate - 5.5) < 0.17 && Math.abs(m.width - 30) < 4 && m.center === 'below', fmt(m));
}

// 4) Rung đối xứng quanh nốt → "Trên nốt"
{
  const m = analyzeTrack(track(synth(4, vib(5, 40, 0), 554.37)), { windowSec: 3 });
  check('rung đối xứng → trên nốt', m.center === 'above', fmt(m));
}
// 5) Cả dao động thấp hơn nốt → "Thấp cả nốt"
{
  const m = analyzeTrack(track(synth(4, vib(5, 30, -15 - 25), 554.37)), { windowSec: 3 });
  check('thấp cả nốt', m.center === 'flat', fmt(m));
}
// 6) Có nhiễu 20 dB và 12 dB
for (const snr of [20, 12]) {
  const m = analyzeTrack(track(synth(4, vib(5.5, 30), 554.37, snr)), { windowSec: 3 });
  check(`nhiễu SNR ${snr} dB`, m.valid && Math.abs(m.rate - 5.5) < 0.2 && Math.abs(m.width - 30) < 5 && m.center === 'below', fmt(m));
}
// 7) Nhịp không đều → độ đều giảm rõ
{
  const even = analyzeTrack(track(synth(4, vib(5, 35), 554.37)), { windowSec: 3 });
  const uneven = analyzeTrack(track(synth(4, vib(5, 35, -17.5, 0.6), 554.37)), { windowSec: 3 });
  check('nhịp lệch ±60% → độ đều thấp hơn', uneven.regularity < 90 && even.regularity - uneven.regularity > 8,
    `đều=${even.regularity.toFixed(0)} lệch=${uneven.regularity.toFixed(0)}`);
}
// 8) Biên độ không đều → độ đều giảm
{
  let lastT = 0, ph = 0, amp = 35;
  const fn = (t) => { ph += 2 * Math.PI * 5 * (t - lastT); lastT = t; if (ph > 2 * Math.PI) { ph -= 2 * Math.PI; amp = 35 * (0.5 + rnd()); } return -amp / 2 + (amp / 2) * Math.sin(ph); };
  const m = analyzeTrack(track(synth(4, fn, 554.37)), { windowSec: 3 });
  check('biên độ thất thường → độ đều thấp', m.regularity < 85, fmt(m));
}
// 9) Đổi nốt giữa chừng (lên 1 cung) → đo đúng đoạn cuối
{
  const v = vib(5.5, 30);
  const m = analyzeTrack(track(synth(4.5, (t) => v(t) + (t > 2.2 ? 200 : 0), 554.37)), { windowSec: 3, noteJump: 90 });
  check('đổi nốt giữa cửa sổ', m.valid && Math.abs(m.rate - 5.5) < 0.2 && Math.abs(m.width - 30) < 5 && m.refMidi === 75, fmt(m) + ` ref=${m.refMidi}`);
}
// 10) Ngừng đàn → không còn chấm
{
  const v = vib(5.5, 30);
  const m = analyzeTrack(track(synth(4, (t) => (t < 3.2 ? v(t) : null), 554.37)), { windowSec: 3 });
  check('ngừng đàn → NO_SIGNAL', !m.valid && m.reason === 'NO_SIGNAL', fmt(m));
}
// 11) Tiếng thẳng không rung
{
  const m = analyzeTrack(track(synth(4, () => 0, 554.37)), { windowSec: 3 });
  check('tiếng thẳng → không có chu kỳ', !m.valid, fmt(m));
}
// 12) Trôi cao độ chậm 30 cents trong 3 s vẫn đo đúng
{
  const v = vib(5, 30);
  const m = analyzeTrack(track(synth(4, (t) => v(t) + 10 * t, 554.37)), { windowSec: 3 });
  check('trôi cao độ chậm', m.valid && Math.abs(m.rate - 5) < 0.15 && Math.abs(m.width - 30) < 4, fmt(m));
}
// 13) Viola dây Đô (C3 130.8 Hz)
{
  const sig = synth(4, vib(5, 30), 130.81);
  const m = analyzeTrack(track(sig, 120), { windowSec: 3 });
  check('viola dây Đô C3', m.valid && Math.abs(m.rate - 5) < 0.15 && Math.abs(m.width - 30) < 4, fmt(m));
}

console.log(`\n${total - fails}/${total} đạt`);
process.exit(fails ? 1 : 0);
