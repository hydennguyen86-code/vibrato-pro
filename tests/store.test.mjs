// Kiểm tra logic tiến độ v4 (mở khoá mọi level, 3 tốc độ qua level): node tests/store.test.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
let NOW = new Date(2026, 10, 7, 9, 0, 0).getTime();
class FakeDate extends Date {
  constructor(...a) { if (a.length) super(...a); else super(NOW); }
  static now() { return NOW; }
}
function fresh() {
  const ls = {}; const localStorage = { getItem: (k) => ls[k] ?? null, setItem: (k, v) => { ls[k] = String(v); } };
  const sb = { console, Math, Float32Array, Float64Array, Array, Object, Set, JSON, Number, String, Date: FakeDate, localStorage };
  sb.globalThis = sb;
  vm.createContext(sb);
  vm.runInContext(fs.readFileSync(path.join(here, '../src/levels.js'), 'utf8'), sb);
  vm.runInContext(fs.readFileSync(path.join(here, '../src/engine.js'), 'utf8'), sb);
  return sb.VE;
}
let fails = 0;
const check = (n, c, info = '') => { if (!c) fails++; console.log(`${c ? '✓' : '✗'} ${n} ${info}`); };
const day = (d, h = 9) => { NOW = new Date(2026, 10, 7 + d, h, 0, 0).getTime(); };
const pass = (VE, id) => VE.store.recordTake(id, { pass: true, mode: 'measure', durationSec: 10 });

// --- Chế độ Nhanh (mặc định)
let VE = fresh(); day(0);
check('mặc định là Nhanh', VE.settings.get().passMode === 'fast');
check('PASS_MODES có 3 chế độ', VE.PASS_MODES.length === 3);
check('level 1 đang học', VE.store.status(1) === 'current');
check('mọi level khác đều mở (không khoá)', [2, 23, 60, 100].every((i) => VE.store.status(i) === 'open'));
let g = pass(VE, 1);
check('Nhanh: đạt 1 lần là qua', g.levelPassed && g.justPassed && g.neededPasses === 1 && g.neededDays === 1, JSON.stringify(g));
check('chuyển sang level 2', VE.store.currentLevel() === 2);
g = VE.store.recordTake(40, { pass: false, mode: 'measure', durationSec: 10 });
check('trượt thì chưa qua', !g.levelPassed);
g = pass(VE, 40);
check('nhảy thẳng L40 và đạt → qua', g.levelPassed && g.justPassed);
check('L2–L39 tự tính là đã qua', Array.from({ length: 38 }, (_, i) => i + 2).every((i) => VE.store.status(i) === 'passed'));
check('level hiện tại = 41', VE.store.currentLevel() === 41);
check('L41 current, L42 open', VE.store.status(41) === 'current' && VE.store.status(42) === 'open');

// --- Chế độ Chuẩn
VE = fresh(); day(0); VE.settings.set({ passMode: 'standard' });
pass(VE, 5); g = pass(VE, 5);
check('Chuẩn: 2 lần chưa qua', !g.levelPassed && g.neededPasses === 3 && g.neededDays === 1);
g = pass(VE, 5);
check('Chuẩn: 3 lần cùng ngày là qua', g.levelPassed && g.justPassed);
check('Chuẩn: L1–4 qua theo', [1, 2, 3, 4].every((i) => VE.store.status(i) === 'passed'));

// --- Chế độ Kỹ
VE = fresh(); day(0); VE.settings.set({ passMode: 'thorough' });
pass(VE, 10); pass(VE, 10); g = pass(VE, 10);
check('Kỹ: 3 lần cùng ngày chưa qua', !g.levelPassed && g.neededDays === 2, JSON.stringify(g));
day(1); g = pass(VE, 10);
check('Kỹ: sang ngày 2 thì qua', g.levelPassed && g.justPassed);

// --- Đổi chế độ khó → dễ: level đủ lần thì qua ngay
VE = fresh(); day(0); VE.settings.set({ passMode: 'thorough' });
pass(VE, 30); pass(VE, 30); pass(VE, 30);
check('trước khi đổi: L30 chưa qua', VE.store.status(30) !== 'passed');
VE.settings.set({ passMode: 'standard' });
check('đổi sang Chuẩn: L30 qua ngay, L1–29 qua theo', VE.store.status(30) === 'passed' && VE.store.status(1) === 'passed' && VE.store.currentLevel() === 31);

// --- Dữ liệu cũ (chưa có passMode) vẫn chạy, mặc định Nhanh
VE = fresh();
check('dữ liệu cũ: passMode mặc định fast', VE.store.gate(1).neededPasses === 1);

// --- Thống kê cũ vẫn đúng
VE = fresh(); day(0); VE.store.logPractice(600); day(1, 20); VE.store.logPractice(300);
check('chuỗi ngày', VE.store.streak() === 2, 'streak=' + VE.store.streak());
check('heatmap: tối hôm nay 5 phút', VE.store.heat(7).slice(-1)[0].toi === 5);

console.log(fails ? `\n${fails} lỗi` : '\nTất cả đạt');
process.exit(fails ? 1 : 0);
