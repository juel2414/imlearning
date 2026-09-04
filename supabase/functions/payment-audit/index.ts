import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ── 결제 대사(對査) ──────────────────────────────────────────────────
// 포트원에 승인된 결제와 우리 DB의 주문·선물을 맞춰 보고, 짝이 없는
// 결제를 찾아낸다. 돈은 빠져나갔는데 아무 기록이 없는 건을 사람이
// 눈으로 확인하기 위한 장치다. 웹훅이 막아 주지만, 웹훅 자체가
// 실패할 수도 있으므로 마지막 그물을 하나 더 둔다.

const ALLOWED_ORIGINS = new Set<string>(
  ['https://juel2414.github.io', Deno.env.get('SITE_ORIGIN') || ''].filter(Boolean)
);

function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin) ? origin : 'https://juel2414.github.io',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

Deno.serve(async (req: Request) => {
  const cors = corsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  const h = { ...cors, 'Content-Type': 'application/json' };
  const err = (msg: string, status = 400) =>
    new Response(JSON.stringify({ success: false, error: msg }), { status, headers: h });

  try {
    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '').trim();
    if (!token) return err('인증 토큰 없음', 401);

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const API_SECRET   = Deno.env.get('PORTONE_API_SECRET') ?? '';
    const STORE_ID     = Deno.env.get('PORTONE_STORE_ID') ?? '';
    if (!API_SECRET) return err('PORTONE_API_SECRET 미설정', 500);

    const sb = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: { user }, error: authErr } = await sb.auth.getUser(token);
    if (authErr || !user) return err('인증 실패', 401);

    const { data: profile } = await sb.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin' && profile?.role !== 'super_admin')
      return err('권한이 없습니다', 403);

    const body = await req.json().catch(() => ({}));
    const days = Math.min(Math.max(Number(body.days) || 7, 1), 90);
    const until = new Date();
    const from  = new Date(until.getTime() - days * 24 * 3600 * 1000);

    // ── 포트원에서 승인된 결제 목록을 가져온다 ────────────────────────
    const paid: any[] = [];
    for (let page = 0; page < 20; page++) {
      // 포트원 V2 다건 조회는 GET 인데 본문을 requestBody 쿼리에 실어 보낸다.
      const query = {
        page: { number: page, size: 100 },
        filter: {
          storeId: STORE_ID || undefined,
          status: ['PAID'],
          timestampType: 'STATUS_CHANGED_AT',
          from:  from.toISOString(),
          until: until.toISOString(),
        },
      };
      const sres = await fetch(
        'https://api.portone.io/payments?requestBody=' + encodeURIComponent(JSON.stringify(query)),
        { headers: { 'Authorization': `PortOne ${API_SECRET}` } },
      );
      if (!sres.ok) return err(`포트원 조회 실패: ${await sres.text()}`, 502);
      const j = await sres.json();
      const items = j.items ?? [];
      paid.push(...items);
      if (items.length < 100) break;
    }

    if (paid.length === 0)
      return new Response(JSON.stringify({ success: true, days, checked: 0, orphans: [] }), { headers: h });

    // ── 우리 DB 와 맞춰 본다 ──────────────────────────────────────────
    const ids = paid.map((p) => p.id).filter(Boolean);
    const { data: orders } = await sb.from('orders').select('payment_id').in('payment_id', ids);
    const { data: gifts }  = await sb.from('gifts').select('payment_id').in('payment_id', ids);
    const known = new Set([
      ...(orders ?? []).map((o: any) => o.payment_id),
      ...(gifts  ?? []).map((g: any) => g.payment_id),
    ]);

    const orphans = paid
      .filter((p) => !known.has(p.id))
      .map((p) => ({
        paymentId:  p.id,
        orderName:  p.orderName ?? '',
        amount:     p.amount?.total ?? null,
        paidAt:     p.paidAt ?? p.statusChangedAt ?? null,
        customer:   p.customer?.name ?? p.customer?.email ?? '',
        customData: p.customData ?? null,
      }));

    return new Response(JSON.stringify({
      success: true, days, checked: paid.length, orphanCount: orphans.length, orphans,
    }), { headers: h });

  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: String(e) }), { status: 500, headers: h });
  }
});
