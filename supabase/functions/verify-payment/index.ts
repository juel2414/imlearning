import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function randomGiftCode() {
  const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  let s = '';
  for (const b of bytes) s += A[b % A.length];
  return 'IMGIFT-' + s;
}
async function uniqueGiftCode(sb: any) {
  for (let i = 0; i < 6; i++) {
    const code = randomGiftCode();
    const { data } = await sb.from('gifts').select('id').eq('gift_code', code).maybeSingle();
    if (!data) return code;
  }
  throw new Error('선물 코드 생성 실패');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS });
  const resHeaders = { ...CORS_HEADERS, 'Content-Type': 'application/json' };

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) return new Response(JSON.stringify({ success: false, error: '인증 토큰 없음' }), { status: 401, headers: resHeaders });

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const PORTONE_API_SECRET = Deno.env.get('PORTONE_API_SECRET') ?? '';
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: { user }, error: authError } = await sb.auth.getUser(token);
    if (authError || !user) return new Response(JSON.stringify({ success: false, error: '인증 실패' }), { status: 401, headers: resHeaders });

    const body = await req.json();
    const { paymentId, courseId, amount, couponCode, couponId, isGift, recipientEmail, message } = body;
    const isFree = amount === 0 && !isGift;

    if (!courseId || amount === undefined) {
      return new Response(JSON.stringify({ success: false, error: '필수 파라미터 누락' }), { status: 400, headers: resHeaders });
    }
    if (!isFree && !paymentId) {
      return new Response(JSON.stringify({ success: false, error: '필수 파라미터 누락' }), { status: 400, headers: resHeaders });
    }

    // ── 무료 수강 신청 (amount === 0, 선물 아님) ──────────────────────────
    if (isFree) {
      const { data: course } = await sb.from('courses')
        .select('title, price, discount_price, discount_start, discount_end')
        .eq('id', Number(courseId)).single();

      const now = new Date();
      let actualPrice: number = course?.price ?? 0;
      if (course?.discount_price) {
        if (course.discount_start && course.discount_end) {
          if (now >= new Date(course.discount_start) && now <= new Date(course.discount_end)) {
            actualPrice = course.discount_price;
          }
        } else {
          actualPrice = course.discount_price;
        }
      }

      let allowFree = !actualPrice;
      if (!allowFree && couponId) {
        const { data: coupon } = await sb.from('coupons')
          .select('discount_type, discount_value')
          .eq('id', couponId).eq('status', 'active').single();
        if (coupon) {
          const discounted = coupon.discount_type === 'rate'
            ? actualPrice * (1 - coupon.discount_value / 100)
            : actualPrice - coupon.discount_value;
          allowFree = discounted <= 0;
        }
      }

      if (!allowFree) {
        return new Response(
          JSON.stringify({ success: false, error: '이 강좌는 무료 등록이 허용되지 않습니다.' }),
          { status: 403, headers: resHeaders }
        );
      }

      const { data: existing } = await sb.from('orders')
        .select('id').eq('user_id', user.id).eq('course_id', Number(courseId)).eq('status', 'paid').maybeSingle();
      if (existing) return new Response(JSON.stringify({ success: true, orderId: existing.id, duplicate: true }), { headers: resHeaders });

      const freePaymentId = `free-${user.id}-${courseId}-${Date.now()}`;
      const { data: order, error: orderError } = await sb.from('orders').insert({
        user_id: user.id, course_id: Number(courseId), course_name: course?.title ?? '강좌',
        payment_id: freePaymentId, amount: 0, original_amount: actualPrice,
        coupon_code: couponCode ?? null, status: 'paid', progress: 0,
      }).select().single();

      if (orderError) return new Response(JSON.stringify({ success: false, error: `주문 저장 실패: ${orderError.message}` }), { status: 500, headers: resHeaders });

      if (couponId) {
        const { data: coup } = await sb.from('coupons').select('used_count').eq('id', couponId).single();
        if (coup) await sb.from('coupons').update({ used_count: coup.used_count + 1 }).eq('id', couponId);
      }
      return new Response(JSON.stringify({ success: true, orderId: order.id }), { headers: resHeaders });
    }

    // ── PortOne 결제 검증 (유료 결제 공통) ────────────────────────────────
    if (PORTONE_API_SECRET) {
      const pr = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
        { headers: { 'Authorization': `PortOne ${PORTONE_API_SECRET}` } });
      if (!pr.ok) return new Response(JSON.stringify({ success: false, error: `포트원 검증 실패: ${await pr.text()}` }), { status: 400, headers: resHeaders });
      const payment = await pr.json();
      if (payment.status !== 'PAID') return new Response(JSON.stringify({ success: false, error: `결제 미완료: ${payment.status}` }), { status: 400, headers: resHeaders });
      if (payment.amount?.total !== amount) return new Response(JSON.stringify({ success: false, error: '금액 불일치' }), { status: 400, headers: resHeaders });
    }

    const { data: course } = await sb.from('courses').select('title').eq('id', Number(courseId)).single();

    // ── 선물 결제 ─────────────────────────────────────────────────────────
    if (isGift) {
      const { data: dupe } = await sb.from('gifts').select('gift_code').eq('payment_id', paymentId).maybeSingle();
      if (dupe) return new Response(JSON.stringify({ success: true, gift: true, giftCode: dupe.gift_code, duplicate: true }), { headers: resHeaders });

      const { data: prof } = await sb.from('profiles').select('name').eq('id', user.id).maybeSingle();
      const code = await uniqueGiftCode(sb);

      const { error: gErr } = await sb.from('gifts').insert({
        gift_code: code,
        course_id: Number(courseId),
        sender_id: user.id,
        sender_name: prof?.name ?? null,
        recipient_email: recipientEmail || null,
        message: message || null,
        amount: amount,
        payment_id: paymentId,
        status: 'pending',
      });
      if (gErr) return new Response(JSON.stringify({ success: false, error: `선물 저장 실패: ${gErr.message}` }), { status: 500, headers: resHeaders });

      if (recipientEmail) {
        try {
          await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ type: 'gift', data: {
              recipientEmail, courseName: course?.title ?? '강좌',
              senderName: prof?.name ?? '', message: message || '', giftCode: code,
            }}),
          });
        } catch (e) { console.error('선물 메일 실패(무시):', e); }
      }
      return new Response(JSON.stringify({ success: true, gift: true, giftCode: code }), { headers: resHeaders });
    }

    // ── 일반 결제 ─────────────────────────────────────────────────────────
    const { data: existing } = await sb.from('orders').select('id').eq('payment_id', paymentId).maybeSingle();
    if (existing) return new Response(JSON.stringify({ success: true, orderId: existing.id, duplicate: true }), { headers: resHeaders });

    const { data: order, error: orderError } = await sb.from('orders').insert({
      user_id: user.id, course_id: Number(courseId), course_name: course?.title ?? '강좌',
      payment_id: paymentId, amount, original_amount: amount, coupon_code: couponCode ?? null,
      status: 'paid', progress: 0,
    }).select().single();
    if (orderError) return new Response(JSON.stringify({ success: false, error: `주문 저장 실패: ${orderError.message}` }), { status: 500, headers: resHeaders });

    try {
      await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'payment', data: { courseName: course?.title ?? '강좌', amount } }),
      });
    } catch (e) { console.error('영수증 메일 실패(무시):', e); }

    if (couponId) {
      const { data: coup } = await sb.from('coupons').select('used_count').eq('id', couponId).single();
      if (coup) await sb.from('coupons').update({ used_count: coup.used_count + 1 }).eq('id', couponId);
    }
    return new Response(JSON.stringify({ success: true, orderId: order.id }), { headers: resHeaders });

  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: String(e) }), { status: 500, headers: resHeaders });
  }
});
