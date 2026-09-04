import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// ── 포트원 웹훅 ──────────────────────────────────────────────────────
// 결제가 승인되면 포트원이 이 함수를 서버에서 직접 부른다. 브라우저와
// 무관하게 도착하므로, 사용자가 결제 직후 탭을 닫든 통신이 끊기든
// 주문·선물은 여기서 만들어진다. verify-payment 를 그대로 다시 부르는
// 이유는 검증과 발급 로직이 한 벌만 있어야 어긋나지 않기 때문이다.
//
// 필요한 환경변수
//   PORTONE_WEBHOOK_SECRET  포트원 콘솔에서 발급한 whsec_... 값
//   PORTONE_API_SECRET      결제 단건 조회용
//   SUPABASE_SERVICE_ROLE_KEY / SUPABASE_URL

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Standard Webhooks 규격. 서명은 `id.timestamp.본문` 을 HMAC-SHA256 한 값이다.
async function verifySignature(secret: string, id: string, ts: string, raw: string, header: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    b64ToBytes(secret.startsWith('whsec_') ? secret.slice(6) : secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${id}.${ts}.${raw}`));
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));
  // 헤더에는 "v1,<서명> v1,<서명>" 처럼 여러 개가 올 수 있다.
  return header.split(' ').some((part) => {
    const sig = part.includes(',') ? part.split(',')[1] : part;
    return timingSafeEqual(sig, expected);
  });
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });

  const SUPABASE_URL   = Deno.env.get('SUPABASE_URL')!;
  const SERVICE_KEY    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const WEBHOOK_SECRET = Deno.env.get('PORTONE_WEBHOOK_SECRET') ?? '';
  const API_SECRET     = Deno.env.get('PORTONE_API_SECRET') ?? '';

  const raw = await req.text();

  // ── 서명 확인 ──────────────────────────────────────────────────────
  // 시크릿이 없으면 아무나 주문을 만들 수 있으므로 아예 받지 않는다.
  if (!WEBHOOK_SECRET) {
    console.error('PORTONE_WEBHOOK_SECRET 미설정 — 웹훅을 거부함');
    return new Response('webhook secret not configured', { status: 500 });
  }
  const id = req.headers.get('webhook-id') ?? '';
  const ts = req.headers.get('webhook-timestamp') ?? '';
  const sig = req.headers.get('webhook-signature') ?? '';
  if (!id || !ts || !sig || !(await verifySignature(WEBHOOK_SECRET, id, ts, raw, sig))) {
    console.error('웹훅 서명 불일치', { id, ts });
    return new Response('invalid signature', { status: 401 });
  }
  // 재전송 공격 방지: 5분보다 오래된 것은 버린다.
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) {
    return new Response('stale timestamp', { status: 401 });
  }

  let evt: any = null;
  try { evt = JSON.parse(raw); } catch { return new Response('bad json', { status: 400 }); }

  // 서명을 통과한 요청은 무엇이든 한 줄 남긴다. 나중에 "웹훅이 왔는데
  // 왜 아무 일도 안 일어났나" 를 볼 때 이 줄이 있고 없고가 크다.
  const type = String(evt?.type ?? '');
  console.log('[웹훅] 도착', type, evt?.data?.paymentId ?? '(결제번호 없음)');

  // 승인된 결제만 처리한다. 취소·실패는 별도 흐름이라 여기서 건드리지 않는다.
  if (type !== 'Transaction.Paid') {
    console.log('[웹훅] 처리 대상 아님 — 넘김', type);
    return new Response(JSON.stringify({ skipped: type }), { status: 200 });
  }

  const paymentId = evt?.data?.paymentId;
  if (!paymentId) return new Response('no paymentId', { status: 400 });

  try {
    // ── 결제 단건 조회 ───────────────────────────────────────────────
    // 무엇을 결제한 것인지는 customData 에 실려 있다. 결제 요청 때
    // 브라우저가 넣어 보낸 값을 포트원이 그대로 보관하고 있다.
    const pr = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
      { headers: { 'Authorization': `PortOne ${API_SECRET}` } });
    if (!pr.ok) {
      console.error('결제 조회 실패', paymentId, await pr.text());
      return new Response('lookup failed', { status: 502 });
    }
    const payment = await pr.json();
    if (payment.status !== 'PAID') {
      return new Response(JSON.stringify({ skipped: payment.status }), { status: 200 });
    }

    let ctx: any = null;
    try { ctx = JSON.parse(payment.customData || 'null'); } catch {}
    if (!ctx || !ctx.userId || !ctx.kind) {
      // customData 가 붙기 전에 만들어진 결제이거나 형식이 깨진 경우.
      // 사람이 확인해야 하므로 실패로 남겨 포트원이 재시도하지 않게 200 을 준다.
      console.error('customData 없음 — 수동 확인 필요', paymentId, payment.customData);
      return new Response(JSON.stringify({ needsManualReview: true, paymentId }), { status: 200 });
    }

    // ── verify-payment 에 그대로 넘긴다 ──────────────────────────────
    // 금액·쿠폰 검증과 중복 방지는 모두 그쪽에 이미 있다.
    const body: Record<string, unknown> = {
      userId:    ctx.userId,
      paymentId,
      amount:    ctx.amount,
    };
    if (ctx.kind === 'pass') {
      body.isPass = true;
      body.passId = ctx.passId;
    } else if (ctx.kind === 'gift') {
      body.isGift         = true;
      body.courseId       = ctx.courseId;
      body.recipientEmail = ctx.recipientEmail ?? null;
      body.message        = ctx.message ?? null;
    } else {
      body.courseId   = ctx.courseId;
      body.couponCode = ctx.couponCode ?? null;
      body.couponId   = ctx.couponId ?? null;
    }

    const vr = await fetch(`${SUPABASE_URL}/functions/v1/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SERVICE_KEY}` },
      body: JSON.stringify(body),
    });
    const out = await vr.json().catch(() => ({}));

    if (!out?.success) {
      // 여기서 500 을 주면 포트원이 재시도한다. 일시적 오류라면 그 사이 복구된다.
      console.error('웹훅 처리 실패', paymentId, out);
      return new Response(JSON.stringify({ ok: false, out }), { status: 500 });
    }

    console.log('웹훅 처리 완료', paymentId, ctx.kind, out.duplicate ? '(이미 처리됨)' : '(신규)');
    return new Response(JSON.stringify({ ok: true, duplicate: !!out.duplicate }), { status: 200 });

  } catch (e) {
    console.error('웹훅 오류', paymentId, String(e));
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
});
