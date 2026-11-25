// Bộ chấm Độ mượt trên tín hiệu tổng hợp (có nhiễu, có tiếng metronome lọt micro): node tests/legato-engine.test.mjs
// Luật: mẫu "mượt" phải đạt; mỗi mẫu lỗi phải trượt ĐÚNG chỉ số của nó và không kéo chỉ số khác trượt theo.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const sb = { console, Math, Float32Array, Float64Array, Int8Array, Array, Object, Set, Date, JSON, Number, String };
sb.globalThis = sb; vm.createContext(sb);
for (const f of ['legato-levels.js', 'engine.js', 'legato-engine.js']) vm.runInContext(fs.readFileSync(path.join(here, '../src', f), 'utf8'), sb, { filename: f });
const LG = sb.VE.legato, K = LG.core;
const lv = (id) => LG.level(id);

let fails = 0, total = 0;
function check(name, cond, info) { total++; if (!cond) fails++; console.log(`${cond ? '✓' : '✗'} ${name}${info ? '  ' + info : ''}`); }
const failing = (r) => r.order.filter((id) => !r.checks[id].ok);
const brief = (r) => `${r.pass ? 'ĐẠT' : 'trượt'}${r.code ? ' ' + r.code : ''} [${failing(r).join(',')}] ` + r.order.map((id) => `${id}=${r.checks[id].value}`).join(' ');
const O = { sr: 48000, snrDb: 30, clicks: true };
const sim = (id, pat, o) => K.simulate(lv(id), pat, Object.assign({}, O, o || {}));
const only = (r, ids) => failing(r).join(',') === ids.join(',');

// ── 0) kế hoạch lượt tập
{
  const p = K.plan(lv(9)); // Rê–La luyến, 4 phách một vĩ, 60 bpm, 4 vòng
  check('plan: 16 phách, 8 nốt, 7 điểm chuyển dây', p.totalBeats === 16 && p.segs.length === 8 && p.bounds.length === 7 && p.bounds.every((b) => b.kind === 'cross'), `beats=${p.totalBeats} segs=${p.segs.length}`);
  check('plan: chuyển dây trong vĩ và tại điểm đổi vĩ xen kẽ', p.bounds.map((b) => +b.bowChange).join('') === '0101010');
  const q = K.plan(lv(1));
  check('plan: nốt dài bị cắt tại điểm đổi vĩ → 3 điểm đổi vĩ', q.bounds.length === 3 && q.bounds.every((b) => b.kind === 'bow' && b.bowChange) && q.bows.map((b) => b.dir).join() === 'down,up,down,up');
  check('plan: đếm vào 1 ô nhịp', q.countInBeats === 4 && Math.abs(q.countInSec - 4) < 1e-9);
  check('noteToMidi', K.noteToMidi('A4') === 69 && K.noteToMidi('F#4') === 66 && K.noteToMidi('G3') === 55 && K.noteToMidi('Bb3') === 58);
  const c2 = K.criteriaOf({ tier: 2, criteria: { cross: { maxGapMs: 99 }, timing: false } });
  check('criteriaOf: tier + ghi đè + tắt chỉ số', c2.cross.maxGapMs === 99 && c2.cross.maxTransMs === LG.TIERS[2].cross.maxTransMs && c2.timing === false && c2.bow.maxDipDb === LG.TIERS[2].bow.maxDipDb);
}

// ── 1) Đổi vĩ (M2: dây La buông)
let r = sim(2, 'smooth');
check('đổi vĩ · mượt → đạt', r.pass && r.checks.bow && r.checks.even && r.checks.pitch && !r.checks.cross, brief(r));
r = sim(2, 'bowgap');
check('đổi vĩ · hụt tiếng → chỉ trượt "bow", mã bow_gap', only(r, ['bow']) && r.checks.bow.fail === 'bow_gap' && r.checks.bow.worstGapMs >= 60 && r.checks.bow.tip.fix.length > 20, brief(r) + ` hở=${r.checks.bow.worstGapMs} ms`);
check('đổi vĩ · hụt tiếng → đo được độ sụt > 20 dB và báo 3/3 lần', r.checks.bow.worst > 20 && r.checks.bow.bad === 3 && r.checks.bow.n === 3);
r = sim(2, 'uneven');
check('đổi vĩ · đuối tiếng → chỉ trượt "even"', only(r, ['even']), brief(r));
r = sim(2, 'wrongnote');
check('một nốt duy nhất mà kéo sai → WRONG_NOTE, trượt "pitch"', r.code === 'WRONG_NOTE' && !r.valid && only(r, ['pitch']) && Math.abs(r.checks.pitch.worst + 100) < 8, brief(r));
r = sim(2, 'silent');
check('không có tiếng → NO_SOUND, không chấm', r.code === 'NO_SOUND' && !r.valid && !r.pass && r.order.length === 0, `voiced=${r.raw.voicedPct}%`);

// ── 2) Chuyển dây trong một vĩ (M9) và đúng lúc đổi vĩ (M12)
r = sim(9, 'smooth');
check('chuyển dây · mượt → đạt', r.pass && r.checks.cross.n === 7 && r.checks.cross.value <= 40, brief(r));
r = sim(9, 'crossgap');
check('chuyển dây · hở → chỉ trượt "cross", mã cross_gap', only(r, ['cross']) && r.checks.cross.fail === 'cross_gap' && r.checks.cross.worstGapMs >= 80 && r.checks.cross.worstGapMs <= 140, brief(r) + ` hở=${r.checks.cross.worstGapMs} ms`);
r = sim(9, 'crossnoise');
check('chuyển dây · tiếng tạp → chỉ trượt "cross", mã cross_noise', only(r, ['cross']) && r.checks.cross.fail === 'cross_noise' && r.checks.cross.worstNoiseMs >= 110 && r.checks.cross.worstGapMs <= 30, brief(r) + ` tạp=${r.checks.cross.worstNoiseMs} ms`);
r = sim(9, 'wrongnote');
check('chuyển dây · sai một nốt → chỉ trượt "pitch", không WRONG_NOTE', only(r, ['pitch']) && r.code == null && r.checks.pitch.bad === 4, brief(r));
r = sim(9, 'late');
check('chuyển dây · trễ 260 ms → chỉ trượt "timing", mã timing_late', only(r, ['timing']) && r.checks.timing.fail === 'timing_late' && Math.abs(r.checks.timing.bias - 260) < 30, brief(r));
r = sim(12, 'smooth');
check('chuyển dây lúc đổi vĩ · mượt → đạt', r.pass && !r.checks.bow, brief(r));
r = sim(12, 'crossgap');
check('chuyển dây lúc đổi vĩ · hở → chỉ trượt "cross"', only(r, ['cross']), brief(r));
r = sim(18, 'smooth');
check('bập bênh nhanh 80 bpm (tier 2) · mượt → đạt', r.pass && r.checks.cross.n === 11, brief(r));
r = sim(18, 'crossnoise');
check('bập bênh nhanh · tiếng tạp → chỉ trượt "cross"', only(r, ['cross']), brief(r));

// ── 3) Đổi nốt cùng dây (M19, M25)
r = sim(19, 'smooth');
check('đổi nốt · mượt → đạt, có chỉ số "join", không có "cross"', r.pass && r.checks.join && !r.checks.cross, brief(r));
r = sim(19, 'crossgap');
check('đổi nốt · hở → chỉ trượt "join"', only(r, ['join']) && r.checks.join.fail === 'join_gap', brief(r));
r = sim(25, 'wrongnote');
check('thang 5 nốt · sai một nốt → chỉ trượt "pitch"', only(r, ['pitch']) && r.code == null, brief(r));

// ── 4) Vibrato xuyên đổi vĩ (M36) và xuyên chuyển dây (M43, M47)
r = sim(36, 'smooth');
check('vibrato + đổi vĩ · mượt → đạt, đo đúng 5,5 Hz / 36 cents', r.pass && Math.abs(r.checks.vibRate.value - 5.5) < 0.2 && Math.abs(r.checks.vibWidth.value - 36) < 5 && r.checks.vibCont.value <= 60, brief(r));
r = sim(36, 'vibfreeze');
check('vibrato + đổi vĩ · đơ → chỉ trượt "vibCont", mã vib_freeze', only(r, ['vibCont']) && r.checks.vibCont.fail === 'vib_freeze' && r.checks.vibCont.worst >= 350, brief(r));
r = sim(36, 'bowgap');
check('vibrato + đổi vĩ · hụt tiếng → chỉ trượt "bow"', only(r, ['bow']), brief(r));
r = sim(43, 'smooth');
check('vibrato + chuyển dây · mượt → đạt', r.pass, brief(r));
r = sim(43, 'vibfreeze');
check('vibrato + chuyển dây · đơ → chỉ trượt "vibCont"', only(r, ['vibCont']), brief(r));
r = sim(43, 'crossgap');
check('vibrato + chuyển dây · hở → chỉ trượt "cross"', only(r, ['cross']), brief(r));
r = sim(47, 'crossnoise');
check('vibrato + chuyển dây lúc đổi vĩ · tiếng tạp → chỉ trượt "cross"', only(r, ['cross']), brief(r));
r = K.simulate(lv(36), 'smooth', Object.assign({}, O, { vibRate: 2.6 }));
check('vibrato quá chậm (2,6 Hz) → trượt "vibRate" mã vib_rate_low', failing(r).includes('vibRate') && r.checks.vibRate.fail === 'vib_rate_low', brief(r));
r = K.simulate(lv(36), 'smooth', Object.assign({}, O, { vibWidth: 0.5 }));
check('không rung ở level có vibrato → vib_none, không đạt', !r.pass && r.checks.vibRate.fail === 'vib_none' && !r.checks.vibCont.ok, brief(r));

// ── 5) Độ bền: nhiễu, tiếng metronome to, không metronome, trễ micro khác mặc định
for (const [label, o] of [['nhiễu SNR 20 dB', { snrDb: 20 }], ['nhiễu SNR 14 dB', { snrDb: 14 }], ['metronome lọt to gấp 2,5', { clickGain: 2.5 }], ['không có tiếng metronome', { clicks: false }], ['micro trễ 20 ms', { latencyMs: 20 }], ['micro trễ 120 ms', { latencyMs: 120 }]]) {
  const a = sim(9, 'smooth', o), b = sim(9, 'crossgap', o), c = sim(36, 'vibfreeze', o);
  check(`${label}: mượt đạt · hở trượt cross · đơ trượt vibCont`, a.pass && only(b, ['cross']) && only(c, ['vibCont']), `| ${brief(a)} | ${brief(b)} | ${brief(c)}`);
}
// phòng ồn hơn tiếng đàn → có cảnh báo NOISY
r = sim(9, 'smooth', { snrDb: 8 });
check('SNR 8 dB → cảnh báo NOISY', r.warnings.some((w) => w.code === 'NOISY'), `snr=${r.raw.snrDb}`);

// ── 6) Kéo dở chừng → TOO_SHORT
{
  const l = lv(9), pl = K.plan(l), s = K.demoSignal(pl, 'smooth', O);
  s.signal.fill(0, Math.floor((s.countInSec + 0.3 * pl.totalSec) * s.sr));
  const fr = K.extract(s.signal, s.sr, { t0Sec: s.countInSec });
  r = K.analyzeTake(fr, pl, K.criteriaOf(l), {});
  check('chỉ kéo 30% bài → TOO_SHORT', r.code === 'TOO_SHORT' && !r.valid && !r.pass, `voiced=${r.raw.voicedPct}%`);
}
// ── 7) Khuôn của phiếu chấm
r = sim(43, 'crossgap');
{
  const c = r.checks.cross, e = r.events[0], s = r.segments[0];
  const okShape = ['id', 'label', 'group', 'ok', 'value', 'unit', 'text', 'target', 'detail', 'fail', 'tip', 'bad', 'n', 'allowed'].every((k) => k in c)
    && c.tip && c.tip.code === c.fail && c.tip.title && c.tip.fix && r.tips.length === r.fails.length && r.nChecks === r.order.length
    && ['kind', 'beat', 't', 'gapMs', 'dipDb', 'transMs', 'noiseMs', 'timingMs', 'vibFreezeMs', 'ok', 'bad'].every((k) => k in e)
    && ['note', 'string', 'finger', 't0', 't1', 'cents', 'evenDb', 'vib'].every((k) => k in s)
    && ['refDb', 'noiseDb', 'snrDb', 'voicedPct', 'latencyMs', 'hopMs'].every((k) => k in r.raw);
  check('phiếu chấm đủ trường (checks, events, segments, raw, tips)', okShape, JSON.stringify(Object.keys(c)));
  check('level.fixes ghi đè câu sửa', K.analyzeTake(K.extract(K.demoSignal(K.plan(lv(9)), 'crossgap', O).signal, O.sr, { t0Sec: 4 }), K.plan(lv(9)), K.criteriaOf(lv(9)), { fixes: { cross_gap: 'XYZ' } }).checks.cross.tip.fix === 'XYZ');
  check('DEMO_PATTERNS có đủ mẫu mượt + 5 mẫu lỗi bắt buộc', ['smooth', 'bowgap', 'crossgap', 'crossnoise', 'wrongnote', 'vibfreeze'].every((id) => LG.DEMO_PATTERNS.some((p) => p.id === id)));
  check('mọi mã trượt đều có mẹo sửa', r.order.every((id) => r.checks[id].ok || LG.TIPS[r.checks[id].fail]) && Object.values(LG.TIPS).every((t) => t.title && t.fix.length > 30));
}

console.log(`\n${total - fails}/${total} đạt`);
process.exit(fails ? 1 : 0);
