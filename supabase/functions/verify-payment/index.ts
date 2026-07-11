import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://juel2414.github.io',
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

async function uniqueGiftCode(sb: ReturnType<typeof createClient>) {
  for (let i = 0; i < 6; i++) {
    const code = randomGiftCode();
    const { data } = await sb.from('gifts').select('id').eq('gift_code', code).maybeSingle();
    if (!data) return code;
  }
  throw new Error('선물 코드 생성 실패');
}

interface CourseRow {
  title: string;
  price: number;
  discount_price: number | null;
  discount_start: string | null;
  discount_end: string | null;
}

function calcServerPrice(course: CourseRow, now: Date): number {
  let price = course.price ?? 0;
  if (course.discount_price != null) {
    const inRange =
      !course.discount_start || !course.discount_end ||
      (now >= new Date(course.discount_start) && now <= new Date(course.discount_end));
    if (inRange) price = course.discount_price;
  }
  return price;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS });
  const resHeaders = { ...CORS_HEADERS, 'Content-Type': 'application/json' };

  const err = (msg: string, status = 400) =>
    new Response(JSON.stringify({ success: false, error: msg }), { status, headers: resHeaders });

  try {
    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '').trim();
    if (!token) return err('인증 토큰 없음', 401);

    const SUPABASE_URL            = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const PORTONE_API_SECRET       = Deno.env.get('PORTONE_API_SECRET') ?? '';
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: { user }, error: authError } = await sb.auth.getUser(token);
    if (authError || !user) return err('인증 실패', 401);

    // ── Rate limiting: 10회 / 10분 / 사용자 ───────────────────────────
    const { data: rlOk } = await sb.rpc('check_rate_limit', {
      p_key: `pay:${user.id}`, p_max: 10, p_window_secs: 600,
    });
    if (!rlOk) return err('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', 429);

    const body = await req.json();
    const { paymentId, courseId, amount, couponCode, couponId, isGift, recipientEmail, message,
            isPass, passId } = body;
    const isFree = amount === 0 && !isGift && !isPass;

    // ══════════════════════════════════════════════════════════════════
    // ── 프리패스 결제 분기 ────────────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════
    if (isPass) {
      if (!passId || amount === undefined || amount === null)
        return err('필수 파라미터 누락 (passId, amount)');
      if (!paymentId) return err('결제 ID 누락');

      // 1. passes 테이블에서 price, duration_days 조회 (서버사이드 검증)
      const { data: pass } = await sb.from('passes')
        .select('id, name, price, duration_days')
        .eq('id', Number(passId))
        .eq('status', 'active')
        .single();
      if (!pass) return err('유효하지 않은 프리패스 상품입니다', 404);

      // 2. PortOne 결제 금액 검증
      if (PORTONE_API_SECRET) {
        const pr = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
          { headers: { 'Authorization': `PortOne ${PORTONE_API_SECRET}` } });
        if (!pr.ok) return err(`포트원 검증 실패: ${await pr.text()}`);
        const payment = await pr.json();
        if (payment.status !== 'PAID') return err(`결제 미완료: ${payment.status}`);
        if (payment.amount?.total !== amount) return err('금액 불일치');
      }
      if (amount !== pass.price) return err(`결제금액 불일치 (예상: ${pass.price}원)`);

      // 중복 결제 확인
      const { data: existingPay } = await sb.from('orders')
        .select('id').eq('payment_id', paymentId).maybeSingle();
      if (existingPay)
        return new Response(JSON.stringify({ success: true, pass: true, duplicate: true }), { headers: resHeaders });

      // 3. pass_courses에서 강좌 목록 조회
      const { data: passCourses } = await sb.from('pass_courses')
        .select('course_id, courses(title)')
        .eq('pass_id', Number(passId));
      if (!passCourses || passCourses.length === 0)
        return err('프리패스에 포함된 강좌가 없습니다', 500);

      // 만료일 계산
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (pass.duration_days || 365));

      // 4. 각 강좌에 대해 orders 삽입 (개별 구매 영구 주문이 있으면 건너뜀)
      let insertedCount = 0;
      for (const pc of passCourses) {
        // 이미 만료 없는 영구 주문이 있으면 스킵
        const { data: perm } = await sb.from('orders')
          .select('id, expires_at')
          .eq('user_id', user.id)
          .eq('course_id', pc.course_id)
          .eq('status', 'paid')
          .is('expires_at', null)
          .maybeSingle();
        if (perm) continue; // 영구 수강권 보유 → 프리패스로 덮어쓰지 않음

        const courseTitle = (pc as any).courses?.title ?? '강좌';
        const { error: oErr } = await sb.from('orders').insert({
          user_id: user.id,
          course_id: pc.course_id,
          course_name: courseTitle,
          payment_id: paymentId + '-' + pc.course_id,
          amount: 0,          // 강좌별 금액은 0 (패스 전체 금액은 별도 집계)
          original_amount: 0,
          status: 'paid',
          progress: 0,
          expires_at: expiresAt.toISOString(),
        });
        if (!oErr) insertedCount++;
      }

      // 패스 자체 결제 기록 (pass 전체 금액, course_id = null 불가하므로 첫 강좌 ID 사용)
      await sb.from('orders').insert({
        user_id: user.id,
        course_id: passCourses[0].course_id,
        course_name: pass.name,
        payment_id: paymentId,
        amount: pass.price,
        original_amount: pass.price,
        status: 'paid',
        progress: 0,
        expires_at: expiresAt.toISOString(),
      }).select().maybeSingle();

      try {
        await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ type: 'payment', data: { courseName: pass.name, amount: pass.price } }),
        });
      } catch (e) { console.error('영수증 메일 실패(무시):', e); }

      return new Response(JSON.stringify({
        success: true, pass: true, courseCount: insertedCount,
        expiresAt: expiresAt.toISOString(),
      }), { headers: resHeaders });
    }

    // ══════════════════════════════════════════════════════════════════
    // ── 기본 파라미터 검증 ──────────────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════
    if (!courseId || amount === undefined || amount === null) return err('필수 파라미터 누락');
    if (typeof amount !== 'number' || !Number.isInteger(amount) || amount < 0) return err('유효하지 않은 금액');
    if (!isFree && !paymentId) return err('필수 파라미터 누락');

    const courseId_n = Number(courseId);
    if (!Number.isInteger(courseId_n) || courseId_n <= 0) return err('유효하지 않은 강좌 ID');

    // ── 강좌 조회 + 서버사이드 가격 계산 (모든 경로 공통) ─────────────
    const { data: course } = await sb.from('courses')
      .select('title, price, discount_price, discount_start, discount_end, thumbnail_url')
      .eq('id', courseId_n).single();
    if (!course) return err('강좌를 찾을 수 없습니다', 404);

    const now = new Date();
    const serverBasePrice = calcServerPrice(course as CourseRow, now);
    const originalAmount  = serverBasePrice;

    // ── 무료 수강 신청 (amount === 0, 선물 아님) ──────────────────────
    if (isFree) {
      let allowFree = serverBasePrice === 0;
      if (!allowFree && couponId) {
        const { data: coupon } = await sb.from('coupons')
          .select('discount_type, discount_value, expires_at, max_uses, used_count, min_amount')
          .eq('id', couponId).eq('status', 'active').single();
        if (coupon) {
          if (coupon.expires_at && new Date(coupon.expires_at) < now)
            return err('만료된 쿠폰입니다');
          if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses)
            return err('쿠폰 사용 한도를 초과했습니다');
          const discounted = coupon.discount_type === 'rate'
            ? serverBasePrice * (1 - coupon.discount_value / 100)
            : serverBasePrice - coupon.discount_value;
          allowFree = discounted <= 0;
        }
      }

      if (!allowFree)
        return err('이 강좌는 무료 등록이 허용되지 않습니다.', 403);

      if (couponCode) {
        const { data: prevUse } = await sb.from('orders')
          .select('id').eq('user_id', user.id).eq('coupon_code', couponCode)
          .eq('status', 'paid').maybeSingle();
        if (prevUse) return err('이미 사용한 쿠폰입니다');
      }

      const { data: existing } = await sb.from('orders')
        .select('id').eq('user_id', user.id).eq('course_id', courseId_n).eq('status', 'paid').maybeSingle();
      if (existing) return new Response(JSON.stringify({ success: true, orderId: existing.id, duplicate: true }), { headers: resHeaders });

      const { data: order, error: orderError } = await sb.from('orders').insert({
        user_id: user.id, course_id: courseId_n, course_name: course.title ?? '강좌',
        payment_id: `free-${user.id}-${courseId}-${Date.now()}`,
        amount: 0, original_amount: originalAmount,
        coupon_code: couponCode ?? null, status: 'paid', progress: 0,
      }).select().single();
      if (orderError) return err(`주문 저장 실패: ${orderError.message}`, 500);

      if (couponId) await sb.rpc('use_coupon', { p_coupon_id: couponId });
      return new Response(JSON.stringify({ success: true, orderId: order.id }), { headers: resHeaders });
    }

    // ── PortOne 결제 검증 (유료 공통) ─────────────────────────────────
    if (PORTONE_API_SECRET) {
      const pr = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
        { headers: { 'Authorization': `PortOne ${PORTONE_API_SECRET}` } });
      if (!pr.ok) return err(`포트원 검증 실패: ${await pr.text()}`);
      const payment = await pr.json();
      if (payment.status !== 'PAID') return err(`결제 미완료: ${payment.status}`);
      if (payment.amount?.total !== amount) return err('금액 불일치');
    }

    // ── 선물 결제 ────────────────────────────────────────────────────
    if (isGift) {
      if (amount !== serverBasePrice)
        return err(`결제금액 불일치 (예상: ${serverBasePrice}원)`);

      const { data: dupe } = await sb.from('gifts').select('gift_code').eq('payment_id', paymentId).maybeSingle();
      if (dupe) return new Response(JSON.stringify({ success: true, gift: true, giftCode: dupe.gift_code, duplicate: true }), { headers: resHeaders });

      const { data: prof } = await sb.from('profiles').select('name').eq('id', user.id).maybeSingle();
      const code = await uniqueGiftCode(sb);

      const { error: gErr } = await sb.from('gifts').insert({
        gift_code: code, course_id: courseId_n,
        sender_id: user.id, sender_name: prof?.name ?? null,
        recipient_email: recipientEmail || null, message: message || null,
        amount, payment_id: paymentId, status: 'pending',
      });
      if (gErr) return err(`선물 저장 실패: ${gErr.message}`, 500);

      if (recipientEmail) {
        try {
          await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ type: 'gift', data: {
              recipientEmail, courseName: course.title ?? '강좌',
              senderName: prof?.name ?? '', message: message || '', giftCode: code,
              thumbnailUrl: (course as any).thumbnail_url ?? '',
            }}),
          });
        } catch (e) { console.error('선물 메일 실패(무시):', e); }
      }
      return new Response(JSON.stringify({ success: true, gift: true, giftCode: code }), { headers: resHeaders });
    }

    // ── 일반 결제: 서버사이드 쿠폰 검증 + 가격 확인 ────────────────
    let expectedAmount = serverBasePrice;
    if (couponId) {
      const { data: coupon } = await sb.from('coupons')
        .select('discount_type, discount_value, expires_at, max_uses, used_count, min_amount')
        .eq('id', couponId).eq('status', 'active').single();

      if (!coupon)
        return err('유효하지 않은 쿠폰입니다');
      if (coupon.expires_at && new Date(coupon.expires_at) < now)
        return err('만료된 쿠폰입니다');
      if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses)
        return err('쿠폰 사용 한도를 초과했습니다');
      if (coupon.min_amount != null && serverBasePrice < coupon.min_amount)
        return err(`최소 결제금액 ${Number(coupon.min_amount).toLocaleString('ko-KR')}원 이상 사용 가능한 쿠폰입니다`);

      const discount = coupon.discount_type === 'rate'
        ? Math.floor(serverBasePrice * (coupon.discount_value / 100))
        : Number(coupon.discount_value);
      expectedAmount = Math.max(0, serverBasePrice - discount);
    }

    if (couponCode) {
      const { data: prevUse } = await sb.from('orders')
        .select('id').eq('user_id', user.id).eq('coupon_code', couponCode)
        .eq('status', 'paid').maybeSingle();
      if (prevUse) return err('이미 사용한 쿠폰입니다');
    }

    if (amount !== expectedAmount)
      return err(`결제금액 불일치 (예상: ${expectedAmount}원)`);

    const { data: existing } = await sb.from('orders').select('id').eq('payment_id', paymentId).maybeSingle();
    if (existing) return new Response(JSON.stringify({ success: true, orderId: existing.id, duplicate: true }), { headers: resHeaders });

    const { data: order, error: orderError } = await sb.from('orders').insert({
      user_id: user.id, course_id: courseId_n, course_name: course.title ?? '강좌',
      payment_id: paymentId, amount, original_amount: originalAmount,
      coupon_code: couponCode ?? null, status: 'paid', progress: 0,
    }).select().single();
    if (orderError) return err(`주문 저장 실패: ${orderError.message}`, 500);

    try {
      await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'payment', data: { courseName: course.title ?? '강좌', amount } }),
      });
    } catch (e) { console.error('영수증 메일 실패(무시):', e); }

    if (couponId) await sb.rpc('use_coupon', { p_coupon_id: couponId });
    return new Response(JSON.stringify({ success: true, orderId: order.id }), { headers: resHeaders });

  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: String(e) }), { status: 500, headers: resHeaders });
  }
});
