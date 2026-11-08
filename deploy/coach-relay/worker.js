// vibrato-coach: trạm trung chuyển nhỏ, chạy ở Mỹ (placement region), để gọi Claude API
// không bị chặn khi Cloudflare chạy project vibrato ở Hồng Kông.
// Chỉ nhận đường dẫn bắt đầu bằng TOKEN. API key do project vibrato gửi kèm (x-api-key), relay không lưu.
const TOKEN = 'aa952da55d945893a1aeda24';
const UPSTREAM = 'https://api.anthropic.com';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const prefix = '/' + TOKEN;
    if (!url.pathname.startsWith(prefix + '/')) return new Response('Not found', { status: 404 });
    const rest = url.pathname.slice(prefix.length);
    if (rest === '/where') {
      // Cho biết Worker đang thực sự gọi ra ngoài từ trung tâm dữ liệu nào
      let trace = '';
      try { trace = await (await fetch('https://www.cloudflare.com/cdn-cgi/trace')).text(); } catch (e) { trace = 'err ' + (e && e.message); }
      const pick = (k) => ((trace.match(new RegExp('^' + k + '=(.*)$', 'm')) || [])[1] || null);
      return Response.json({ egressColo: pick('colo'), egressLoc: pick('loc'), inboundColo: request.cf && request.cf.colo });
    }
    if (rest !== '/v1/messages' || request.method !== 'POST') return new Response('Not found', { status: 404 });
    const key = request.headers.get('x-api-key');
    if (!key) return new Response('Missing key', { status: 400 });
    const r = await fetch(UPSTREAM + '/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': request.headers.get('anthropic-version') || '2023-06-01',
      },
      body: await request.text(),
    });
    return new Response(r.body, { status: r.status, headers: { 'content-type': r.headers.get('content-type') || 'application/json' } });
  },
};
