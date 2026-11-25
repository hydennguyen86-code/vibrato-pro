// Kiểm tra 50 level Độ mượt: node tests/legato-levels.test.mjs
// 1) đúng schema (docs/SPEC-LEGATO.md §3)  2) nội dung/video của worker (nếu đã có) đúng khuôn
// 3) mẫu "mượt" của từng level tự đạt  4) mẫu lỗi trọng tâm của từng level trượt đúng chỉ số
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const sb = { console, Math, Float32Array, Float64Array, Int8Array, Array, Object, Set, Date, JSON, Number, String };
sb.globalThis = sb; vm.createContext(sb);
const loaded = [];
for (const f of ['legato-levels.js', 'legato-content.js', 'legato-videos.js', 'engine.js', 'legato-engine.js']) {
  const p = path.join(here, '../src', f);
  if (fs.existsSync(p)) { vm.runInContext(fs.readFileSync(p, 'utf8'), sb, { filename: f }); loaded.push(f); }
}
const LG = sb.VE.legato, K = LG.core;
const LEVELS = LG.levels(), STAGES = LG.stages();
let fails = 0;
const bad = (m) => { fails++; console.log('✗ ' + m); };
const QUICK = process.argv.includes('--quick'); // chỉ kiểm schema + nội dung, bỏ phần giả lập (worker nội dung dùng)

// ── 1) schema khung
if (LEVELS.length !== 50) bad('số level = ' + LEVELS.length);
if (STAGES.length !== 6) bad('số vòng = ' + STAGES.length);
const FIRST = { G: 55, D: 62, A: 69, E: 76 }; // midi dây buông
LEVELS.forEach((l, i) => {
  if (l.id !== i + 1) bad(`thứ tự id ${l.id} ở vị trí ${i}`);
  const st = STAGES.find((s) => s.id === l.stage);
  if (!st || l.id < st.range[0] || l.id > st.range[1]) bad(`M${l.id} sai vòng ${l.stage}`);
  if (!['bow', 'note', 'cross'].includes(l.kind)) bad(`M${l.id} kind ${l.kind}`);
  if (!l.title || !(l.bpm >= 40 && l.bpm <= 120) || !(l.beatsPerBow >= 1) || !(l.reps >= 1) || ![1, 2, 3].includes(l.tier)) bad(`M${l.id} thiếu/sai trường cơ bản`);
  if (!Array.isArray(l.pattern) || !l.pattern.length) { bad(`M${l.id} pattern rỗng`); return; }
  l.pattern.forEach((p) => {
    const open = FIRST[p.string];
    if (open == null || p.midi == null || !(p.finger >= 0 && p.finger <= 4) || !(p.beats > 0)) return bad(`M${l.id} nốt ${p.note} sai khuôn`);
    const up = p.midi - open; // ngón 0..4 ở thế 1: cách dây buông 0..7 nửa cung
    if (up < 0 || up > 7 || (p.finger === 0) !== (up === 0)) bad(`M${l.id} nốt ${p.note} không khớp dây ${p.string} ngón ${p.finger}`);
  });
  const pl = K.plan(l);
  const kinds = new Set(pl.bounds.map((b) => b.kind));
  if (l.kind === 'cross' && !kinds.has('cross')) bad(`M${l.id} ghi chuyển dây nhưng không có điểm chuyển dây`);
  if (l.kind === 'note' && (!kinds.has('note') || kinds.has('cross'))) bad(`M${l.id} đổi nốt: phải có đổi nốt và không chuyển dây`);
  if (l.kind === 'bow' && (kinds.has('note') || kinds.has('cross'))) bad(`M${l.id} đổi vĩ: không được đổi nốt`);
  if (pl.totalSec < 8 || pl.totalSec > 20) bad(`M${l.id} lượt tập dài ${pl.totalSec.toFixed(1)} s (cần 8–20 s)`);
  if (pl.bounds.length < 3) bad(`M${l.id} chỉ có ${pl.bounds.length} điểm đổi`);
  if (l.vibrato) {
    if (pl.segs.some((s) => s.t1 - s.t0 < 0.9)) bad(`M${l.id} có vibrato nhưng nốt ngắn hơn 0,9 s`);
    if (l.pattern.some((p) => p.finger === 0)) bad(`M${l.id} có vibrato nhưng dùng dây buông`);
  }
  // ── 2) nội dung (fallback của engine hoặc của worker)
  for (const k of ['goal', 'steps', 'tips', 'mistakes', 'feel', 'youtube', 'videos', 'criteria', 'kindLabel']) if (l[k] == null) bad(`M${l.id} thiếu ${k}`);
  if (!l.steps.length || !l.tips.length || !l.mistakes.length) bad(`M${l.id} mảng hướng dẫn rỗng`);
  if (!l.youtube.title || !l.youtube.query) bad(`M${l.id} thiếu link tìm kiếm dự phòng`);
  l.videos.forEach((v) => { if (!/^https:\/\/(www\.)?(youtube\.com\/watch\?v=[\w-]{11}|youtu\.be\/[\w-]{11})/.test(v.url) || !v.title) bad(`M${l.id} video sai khuôn: ${v.url}`); });
  Object.keys(l.fixes || {}).forEach((c) => { if (!LG.TIPS[c]) bad(`M${l.id} fixes có mã lạ: ${c}`); });
});
const nCross = LEVELS.filter((l) => l.kind === 'cross').length, firstCross = LEVELS.find((l) => l.kind === 'cross');
if (nCross < 20) bad('chuyển dây chỉ có ' + nCross + ' level');
if (!firstCross || firstCross.id > 10) bad('chuyển dây xuất hiện quá muộn');
const C = sb.LEGATO_CONTENT;
if (C) {
  let n = 0;
  LEVELS.forEach((l) => {
    const c = C[l.id]; if (!c) return bad(`legato-content.js thiếu M${l.id}`);
    n++;
    if (!c.goal || c.goal.length < 15) bad(`M${l.id} goal quá ngắn`);
    if (!(c.steps && c.steps.length >= 3 && c.steps.length <= 5)) bad(`M${l.id} steps phải 3–5 ý`);
    if (!(c.tips && c.tips.length >= 2 && c.tips.length <= 3)) bad(`M${l.id} tips phải 2–3 ý`);
    if (!(c.mistakes && c.mistakes.length >= 1 && c.mistakes.length <= 3)) bad(`M${l.id} mistakes phải 1–3 ý`);
    if (!c.feel || c.feel.length < 15) bad(`M${l.id} thiếu feel`);
    if (!(c.selfCheck && c.selfCheck.length >= 1 && c.selfCheck.length <= 3)) bad(`M${l.id} selfCheck phải 1–3 ý`);
  });
  console.log(`Nội dung của worker: ${n}/50 level`);
} else console.log('Chưa có legato-content.js: dùng nội dung dự phòng của engine');
console.log(sb.LEGATO_VIDEOS ? `Video: ${LEVELS.filter((l) => l.videos.length).length}/50 level có video cụ thể` : 'Chưa có legato-videos.js: chỉ có link tìm kiếm dự phòng');
console.log(`Đã nạp: ${loaded.join(', ')} · chuyển dây ${nCross}/50 level, từ M${firstCross && firstCross.id}`);

// ── 3–4) giả lập
if (!QUICK) {
  const O = { sr: 24000, harmonics: 6, snrDb: 30, clicks: true };
  const failing = (r) => r.order.filter((id) => !r.checks[id].ok).join(',');
  let sims = 0;
  for (const l of LEVELS) {
    const r = K.simulate(l, 'smooth', O); sims++;
    if (!r.pass) bad(`M${l.id} mẫu mượt không đạt: [${failing(r)}] ${r.code || ''}`);
    const focal = l.kind === 'bow' ? ['bowgap', 'bow'] : l.kind === 'cross' ? ['crossgap', 'cross'] : ['crossgap', 'join'];
    const f = K.simulate(l, focal[0], O); sims++;
    if (failing(f) !== focal[1]) bad(`M${l.id} mẫu ${focal[0]} phải trượt đúng [${focal[1]}], thực tế [${failing(f)}]`);
    if (l.vibrato) {
      const v = K.simulate(l, 'vibfreeze', O); sims++;
      if (failing(v) !== 'vibCont') bad(`M${l.id} mẫu vibfreeze phải trượt đúng [vibCont], thực tế [${failing(v)}]`);
    }
  }
  console.log(`${sims} lượt giả lập trên 50 level`);
}
console.log(fails ? `\n${fails} lỗi` : '\nTất cả đạt');
process.exit(fails ? 1 : 0);
