// Kiểm tra phân tích chuyển động tay bằng điểm khớp tổng hợp: node tests/hand.test.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const sb = { console, Math, Array, Object, Set, JSON, Number, String, Float32Array, Float64Array };
sb.globalThis = sb;
vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(here, '../src/hand.js'), 'utf8'), sb);
const { analyzeHand, pickActive } = sb.VE._handCore;

let seed = 7;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const gauss = () => { let u = 0; while (!u) u = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd()); };

// Bàn tay mẫu (pixel, khung 640×480), cỡ tay cổ tay→đốt giữa ≈ 150 px
const T = [[320, 400], [282, 370], [258, 330], [243, 290], [228, 260], [290, 280], [285, 225], [285, 190], [285, 160],
  [320, 275], [320, 215], [320, 175], [320, 145], [350, 280], [355, 225], [355, 190], [355, 165], [380, 295], [390, 250], [395, 225], [395, 200]];
const rot = (p, c, a) => { const s = Math.sin(a), co = Math.cos(a); const x = p[0] - c[0], y = p[1] - c[1]; return [c[0] + x * co - y * s, c[1] + x * s + y * co]; };

// mode: 'arm' | 'wrist' | 'finger' | 'locked' ; rate Hz ; fps ; noise (tỉ lệ cỡ tay)
function synth({ mode, rate, fps, secs = 3.5, noise = 0.006, dipAmpDeg = 12, armPx = 5, finger = 2 }) {
  const frames = [];
  let t = 0;
  while (t < secs) {
    const ph = 2 * Math.PI * rate * t, s = Math.sin(ph);
    let P = T.map((p) => p.slice());
    if (mode === 'arm' || mode === 'locked') P = P.map((p, i) => [p[0] + armPx * s * (i === 0 ? 0.9 : 1), p[1]]);
    if (mode === 'wrist') P = P.map((p, i) => (i === 0 ? p : rot(p, T[0], 0.035 * s)));
    if (mode === 'finger') P = P.map((p, i) => (i === 0 ? p : [p[0] + 0.6 * s, p[1]]));
    if (mode !== 'locked') { // lăn khớp đầu ngón: xoay đầu ngón quanh khớp DIP
      const [, , dip, tip] = [[5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [17, 18, 19, 20]][finger - 1];
      P[tip] = rot(P[tip], P[dip], ((dipAmpDeg / 2) * Math.PI / 180) * s);
    }
    const sig = noise * 150;
    frames.push({ t, lm: P.map(([x, y]) => ({ x: x + sig * gauss(), y: y + sig * gauss(), z: 0 })), wl: null });
    t += (1 / fps) * (0.85 + 0.3 * rnd()); // khung không đều
  }
  return frames;
}

let fails = 0;
const check = (n, c, info = '') => { if (!c) fails++; console.log(`${c ? '✓' : '✗'} ${n}  ${info}`); };
const fmt = (m) => `src=${m.source} ratio=${m.wristRatio} kAmp=${m.knuckleAmp} dip=${m.dipDeg}°/nền ${m.dipNoise}°(${m.dipLabel}, ngón ${m.activeFinger}) handRate=${m.handRate} sync=${m.syncLabel} fps=${m.fps} note=${m.note}`;

for (const fps of [15, 24, 30]) {
  for (const rate of [2, 4.5, 6]) {
    const a = analyzeHand(synth({ mode: 'arm', rate, fps }), rate);
    check(`cánh tay ${rate} Hz @${fps}fps`, a.source === 'arm' && a.dipOk !== false && (a.activeFinger === 2 || a.activeFinger === null), fmt(a));
    const w = analyzeHand(synth({ mode: 'wrist', rate, fps }), rate);
    check(`cổ tay ${rate} Hz @${fps}fps`, w.source === 'wrist', fmt(w));
  }
}
const fi = analyzeHand(synth({ mode: 'finger', rate: 6, fps: 30, dipAmpDeg: 10 }), 6);
check('rung bằng ngón', fi.source === 'finger' && fi.dipOk === true, fmt(fi));
const lk = analyzeHand(synth({ mode: 'locked', rate: 5, fps: 30 }), 5);
check('ngón khoá cứng (không lăn)', lk.dipOk === false && lk.dipLabel === 'Khoá cứng?', fmt(lk));
const f3 = analyzeHand(synth({ mode: 'arm', rate: 5, fps: 30, finger: 3 }), 5);
check('nhận đúng ngón 3 đang lăn', f3.activeFinger === 3, fmt(f3));

// Đồng bộ: micro báo 5 Hz, tay rung 5 Hz → khớp; tay rung 3 Hz → lệch
const s1 = analyzeHand(synth({ mode: 'arm', rate: 5, fps: 30 }), 5);
check('đồng bộ khi cùng nhịp', s1.syncOk === true && Math.abs(s1.handRate - 5) < 0.2, fmt(s1));
const s2 = analyzeHand(synth({ mode: 'arm', rate: 3, fps: 30 }), 5);
check('lệch nhịp khi tay 3 Hz, tiếng 5 Hz', s2.syncOk === false, fmt(s2));
// Không có micro: tự ước lượng tần số
const s3 = analyzeHand(synth({ mode: 'arm', rate: 4.4, fps: 24 }), null);
check('không có micro → tự đo nhịp tay', s3.source === 'arm' && Math.abs(s3.handRate - 4.4) < 0.2, fmt(s3));
// Nhiễu điểm khớp gấp đôi
const n2 = analyzeHand(synth({ mode: 'arm', rate: 5, fps: 24, noise: 0.012 }), 5);
check('nhiễu điểm khớp 1,2%', n2.source === 'arm' && n2.dipOk !== false, fmt(n2));
const n3 = analyzeHand(synth({ mode: 'locked', rate: 5, fps: 24, noise: 0.012 }), 5);
check('khoá cứng + nhiễu 1,2% → không báo sai "Đang lăn"', n3.dipOk !== true, fmt(n3));
let tp = 0; for (let k = 0; k < 20; k++) { const r = analyzeHand(synth({ mode: 'arm', rate: 5, fps: 30 }), 5); if (r.dipOk === true) tp++; }
check('lăn 12° ở 30fps: phát hiện ≥ 80% số lần', tp >= 16, tp + '/20');
let fp = 0; for (let k = 0; k < 20; k++) { const r = analyzeHand(synth({ mode: 'locked', rate: 5, fps: 30 }), 5); if (r.dipOk === true) fp++; }
check('khoá cứng: báo sai "Đang lăn" ≤ 1/20', fp <= 1, fp + '/20');
// Tay đứng yên
const still = analyzeHand(synth({ mode: 'locked', rate: 5, fps: 30, armPx: 0 }), null);
check('tay đứng yên → chưa đo', still.source === null && still.note != null, fmt(still));
// Khung hình quá chậm
const slow = analyzeHand(synth({ mode: 'arm', rate: 5, fps: 7 }), 5);
check('7 khung/giây → báo quá chậm', !slow.tracking, fmt(slow));
// Chọn tay: tay bấm rung, tay cung kéo chậm 0,5 Hz biên độ lớn
const fret = synth({ mode: 'arm', rate: 5.5, fps: 30 });
const bow = synth({ mode: 'locked', rate: 0.5, fps: 30, armPx: 60, noise: 0.006 });
check('chọn đúng tay đang rung (không nhầm tay cung)', pickActive([bow, fret]) === 1);

console.log(fails ? `\n${fails} lỗi` : '\nTất cả đạt');
process.exit(fails ? 1 : 0);
