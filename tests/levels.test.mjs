// Kiểm tra 100 level: node tests/levels.test.mjs
// 1) đủ trường theo SPEC §2  2) tín hiệu mẫu (level.demo) qua đúng tiêu chí của chính level đó
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const sb = { console, Math, Float32Array, Float64Array, Array, Object, Set, Date, JSON, Number, String };
sb.globalThis = sb;
vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(here, '../src/levels.js'), 'utf8'), sb);
vm.runInContext(fs.readFileSync(path.join(here, '../src/engine.js'), 'utf8'), sb);
const { LEVELS, STAGES } = sb;
const { yin, rmsDb, analyzeTrack, evaluate, hzToAbsCents } = sb.VE._core;

let fails = 0;
const bad = (msg) => { fails++; console.log('✗ ' + msg); };

if (LEVELS.length !== 100) bad('số level = ' + LEVELS.length);
LEVELS.forEach((l, i) => {
  if (l.id !== i + 1) bad(`thứ tự id ${l.id} ở vị trí ${i}`);
  const st = STAGES.find((s) => s.id === l.stage);
  if (!st || l.id < st.range[0] || l.id > st.range[1]) bad(`L${l.id} sai vòng ${l.stage}`);
  for (const k of ['title', 'goal', 'mode', 'bpm', 'cyclesPerBeat', 'steps', 'tips', 'mistakes', 'demo', 'anim', 'youtube'])
    if (l[k] == null) bad(`L${l.id} thiếu ${k}`);
  if (!l.steps.length || !l.tips.length || !l.mistakes.length) bad(`L${l.id} mảng rỗng`);
  if (!['tap', 'polish', 'slide', 'arm', 'wrist', 'finger', 'shift', 'swell'].includes(l.anim.type)) bad(`L${l.id} anim ${l.anim.type}`);
  if (l.mode === 'self' && (!l.selfCheck || !l.selfSeconds)) bad(`L${l.id} self thiếu checklist`);
  if (l.mode === 'measure') {
    const c = l.criteria;
    if (!c || !c.rate || !c.width || c.regularityMin == null || !c.holdSec) bad(`L${l.id} thiếu criteria`);
    if (c.rate[0] >= c.rate[1] || c.width[0] >= c.width[1]) bad(`L${l.id} khoảng tiêu chí sai`);
  }
  if (!l.youtube.title || !l.youtube.query) bad(`L${l.id} youtube`);
});
const self = LEVELS.filter((l) => l.mode === 'self').map((l) => l.id);
console.log(`Level tự kiểm: ${self[0]}–${self[self.length - 1]} (${self.length}), đo bằng micro: ${100 - self.length}`);

// Tín hiệu mẫu của từng level đo phải tự đạt
const SR = 48000;
function synthTrack(rate, width, midi, secs) {
  const f0 = 440 * Math.pow(2, (midi - 69) / 12);
  const n = Math.floor(secs * SR), sig = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR, c = -width / 2 + (width / 2) * Math.sin(2 * Math.PI * rate * t);
    ph += (2 * Math.PI * f0 * Math.pow(2, c / 1200)) / SR;
    let s = 0; for (let k = 1; k <= 8; k++) if (f0 * k < 20000) s += Math.sin(k * ph) / k;
    sig[i] = 0.2 * s;
  }
  const hop = 576, W = 1024, need = W + 268, tr = [];
  for (let end = need; end <= n; end += hop) {
    const v = sig.subarray(end - need, end);
    const p = rmsDb(v, W) > -50 ? yin(v, SR, 180, 2600, W, 0.12) : null;
    tr.push({ t: end / SR, c: p && p.aperiodicity < 0.25 ? hzToAbsCents(p.hz, 440) : null });
  }
  return tr;
}
let measured = 0;
for (const l of LEVELS.filter((x) => x.mode === 'measure')) {
  const c = l.criteria;
  const win = Math.max(3, Math.min(5, 3.5 / c.rate[0]));
  const m = analyzeTrack(synthTrack(l.demo.rate, l.demo.width, l.demo.midi, win + 0.5), { windowSec: win });
  const ev = evaluate(m, c);
  measured++;
  if (!ev.allOk) bad(`L${l.id} âm mẫu không tự đạt: rate=${m.rate?.toFixed(2)} [${c.rate}] width=${m.width?.toFixed(1)} [${c.width}] reg=${m.regularity?.toFixed(0)} center=${m.center}`);
}
console.log(`${measured} level đo: âm mẫu ${fails ? 'có lỗi' : 'đều tự đạt'}`);
console.log(fails ? `\n${fails} lỗi` : '\nTất cả đạt');
process.exit(fails ? 1 : 0);
