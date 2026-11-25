// Tiến độ phần Độ mượt (riêng, dùng chung passMode): node tests/legato-store.test.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
let NOW = new Date(2026, 10, 25, 9, 0, 0).getTime();
class FakeDate extends Date { constructor(...a) { if (a.length) super(...a); else super(NOW); } static now() { return NOW; } }
function fresh(ls = {}) {
  const localStorage = { getItem: (k) => ls[k] ?? null, setItem: (k, v) => { ls[k] = String(v); } };
  const sb = { console, Math, Float32Array, Float64Array, Int8Array, Array, Object, Set, JSON, Number, String, Date: FakeDate, localStorage };
  sb.globalThis = sb; vm.createContext(sb);
  for (const f of ['levels.js', 'legato-levels.js', 'engine.js', 'legato-engine.js']) vm.runInContext(fs.readFileSync(path.join(here, '../src', f), 'utf8'), sb);
  return { VE: sb.VE, ls };
}
let fails = 0;
const check = (n, c, info = '') => { if (!c) fails++; console.log(`${c ? '✓' : '✗'} ${n} ${info}`); };
const day = (d) => { NOW = new Date(2026, 10, 25 + d, 9, 0, 0).getTime(); };
const rep = (pass, fails_ = []) => ({ pass, valid: true, nOk: pass ? 3 : 2, nChecks: 3, fails: fails_, order: ['bow'], checks: { bow: { value: 4.2, ok: pass } }, durationSec: 16 });

let { VE, ls } = fresh(); day(0);
const S = VE.legato.store;
check('lúc đầu: M1 current, còn lại open', S.status(1) === 'current' && [2, 9, 50].every((i) => S.status(i) === 'open') && S.currentLevel() === 1 && S.passedCount() === 0);
let g = S.recordTake(1, rep(false, ['bow_gap']));
check('trượt → chưa qua, có ghi lượt', !g.levelPassed && S.takes(1).length === 1 && S.takes(1)[0].fails[0] === 'bow_gap' && S.takes(1)[0].vals.bow.v === 4.2);
g = S.recordTake(1, rep(true));
check('Nhanh: đạt 1 lần là qua', g.levelPassed && g.justPassed && g.neededPasses === 1 && S.currentLevel() === 2);
g = S.recordTake(12, rep(true));
check('nhảy M12 và đạt → M2–11 qua theo', g.justPassed && [2, 5, 11].every((i) => S.status(i) === 'passed') && S.currentLevel() === 13 && S.passedCount() === 12);
check('KHÔNG lan sang 100 level vibrato', VE.store.currentLevel() === 1 && VE.store.status(1) === 'current' && VE.store.takes(30).length === 0);
VE.store.recordTake(40, { pass: true, mode: 'measure', durationSec: 5 });
check('qua L40 vibrato KHÔNG lan sang Độ mượt', S.currentLevel() === 13 && S.status(20) === 'open' && VE.store.currentLevel() === 41);
check('lưu khoá riêng trong localStorage', !!ls['vibratoPro.legato.v1'] && !!ls['vibratoPro.v1'] && !/legato/.test(ls['vibratoPro.v1']));
check('failCounts + best', S.failCounts(14).bow_gap === 1 && S.best(1).pass === true);

// dùng chung passMode
({ VE, ls } = fresh()); day(0); VE.settings.set({ passMode: 'thorough' });
const T = VE.legato.store;
T.recordTake(9, rep(true)); T.recordTake(9, rep(true)); g = T.recordTake(9, rep(true));
check('Kỹ: 3 lần cùng ngày chưa qua', !g.levelPassed && g.neededPasses === 3 && g.neededDays === 2 && g.passCount === 3 && g.dayCount === 1);
VE.settings.set({ passMode: 'standard' });
check('đổi sang Chuẩn → M9 qua ngay, M1–8 qua theo', T.status(9) === 'passed' && T.status(1) === 'passed' && T.currentLevel() === 10);
VE.settings.set({ passMode: 'thorough' });
T.recordTake(20, rep(true)); T.recordTake(20, rep(true)); T.recordTake(20, rep(true)); day(1);
g = T.recordTake(20, rep(true));
check('Kỹ: sang ngày thứ 2 thì qua', g.levelPassed && g.justPassed && g.dayCount === 2);

// nạp lại từ localStorage; reset riêng
const again = fresh(ls).VE;
check('tải lại trang vẫn còn tiến độ', again.legato.store.status(20) === 'passed' && again.legato.store.takes(30).length === 7);
again.legato.store.reset();
check('reset Độ mượt không xoá cài đặt/tiến độ vibrato', again.legato.store.currentLevel() === 1 && again.settings.get().passMode === 'thorough');
// dữ liệu hỏng không làm sập
const broken = fresh({ 'vibratoPro.legato.v1': '{oops' }).VE;
check('localStorage hỏng → bắt đầu sạch', broken.legato.store.currentLevel() === 1);
// payload cho HLV AI
const P = again.legato.coach.payload(Object.assign(rep(false, ['bow_gap']), { levelId: 1, order: ['bow'], checks: { bow: { label: 'Liền tiếng khi đổi vĩ', text: 'sụt 12 dB', target: 'sụt ≤ 10 dB', ok: false, detail: 'd' } }, tips: [{ code: 'bow_gap', title: 'Hở tiếng lúc đổi vĩ' }] }));
check('coach.payload: kind legato, có dòng số liệu', P.kind === 'legato' && P.level.id === 1 && P.legato.lines.length === 1 && /CHƯA/.test(P.legato.lines[0]) && P.legato.total === 50);

console.log(fails ? `\n${fails} lỗi` : '\nTất cả đạt');
process.exit(fails ? 1 : 0);
