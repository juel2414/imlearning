import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const resHeaders = { ...CORS_HEADERS, 'Content-Type': 'application/json' };

  try {
    // 1. 인증 토큰으로 유저 확인
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: '인증 토큰 없음' }), { status: 401, headers: resHeaders });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const PORTONE_API_SECRET = Deno.env.get('PORTONE_API_SECRET') ?? '';

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // JWT에서 유저 정보 추출
    const { data: { user }, error: authError } = await sb.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: '인증 실패' }), { status: 401, headers: resHeaders });
    }

    // 2. 요청 파라미터 파싱
    const body = await req.json();
    const { paymentId, courseId, amount, couponCode, couponId } = body;
    const isFree = amount === 0;

    if (!courseId || amount === undefined) {
      return new Response(JSON.stringify({ success: false, error: '필수 파라미터 누락' }), { status: 400, headers: resHeaders });
    }

    if (!isFree && !paymentId) {
      return new Response(JSON.stringify({ success: false, error: '필수 파라미터 누락' }), { status: 400, headers: resHeaders });
    }

    // ── 무료 수강 신청 경로 ──────────────────────────────────────────
    if (isFree) {
      // 보안: DB에서 실제 강좌 가격 확인
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

      // 강좌 자체가 무료(0 또는 null)인지 확인
      let allowFree = !actualPrice;

      // 쿠폰이 전액 할인하는 경우
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

      // 중복 수강 신청 방지 (user_id + course_id 기준)
      const { data: existing } = await sb.from('orders')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', Number(courseId))
        .eq('status', 'paid')
        .maybeSingle();

      if (existing) {
        return new Response(
          JSON.stringify({ success: true, orderId: existing.id, duplicate: true }),
          { headers: resHeaders }
        );
      }

      // 무료 주문 생성
      const freePaymentId = `free-${user.id}-${courseId}-${Date.now()}`;
      const { data: order, error: orderError } = await sb.from('orders').insert({
        user_id: user.id,
        course_id: Number(courseId),
        course_name: course?.title ?? '강좌',
        payment_id: freePaymentId,
        amount: 0,
        original_amount: actualPrice,
        coupon_code: couponCode ?? null,
        status: 'paid',
        progress: 0,
      }).select().single();

      if (orderError) {
        return new Response(
          JSON.stringify({ success: false, error: `주문 저장 실패: ${orderError.message}` }),
          { status: 500, headers: resHeaders }
        );
      }

      // 쿠폰 사용 횟수 증가
      if (couponId) {
        const { data: coup } = await sb.from('coupons').select('used_count').eq('id', couponId).single();
        if (coup) {
          await sb.from('coupons').update({ used_count: coup.used_count + 1 }).eq('id', couponId);
        }
      }

      return new Response(JSON.stringify({ success: true, orderId: order.id }), { headers: resHeaders });
    }

    // ── 유료 결제 검증 경로 ─────────────────────────────────────────
    // 3. 포트원 결제 검증 (API Secret이 설정된 경우)
    if (PORTONE_API_SECRET) {
      const portoneRes = await fetch(
        `https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
        { headers: { 'Authorization': `PortOne ${PORTONE_API_SECRET}` } }
      );

      if (!portoneRes.ok) {
        const errText = await portoneRes.text();
        return new Response(
          JSON.stringify({ success: false, error: `포트원 검증 실패: ${errText}` }),
          { status: 400, headers: resHeaders }
        );
      }

      const payment = await portoneRes.json();

      if (payment.status !== 'PAID') {
        return new Response(
          JSON.stringify({ success: false, error: `결제 미완료: ${payment.status}` }),
          { status: 400, headers: resHeaders }
        );
      }

      if (payment.amount?.total !== amount) {
        return new Response(
          JSON.stringify({ success: false, error: `금액 불일치 (포트원: ${payment.amount?.total}, 요청: ${amount})` }),
          { status: 400, headers: resHeaders }
        );
      }
    }
    // PORTONE_API_SECRET 미설정 시: 개발/테스트 모드 (포트원 서버 검증 생략)

    // 4. 중복 주문 방지
    const { data: existing } = await sb.from('orders')
      .select('id')
      .eq('payment_id', paymentId)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ success: true, orderId: existing.id, duplicate: true }),
        { headers: resHeaders }
      );
    }

    // 5. 강좌 이름 조회 후 orders 테이블에 저장
    const { data: course } = await sb.from('courses').select('title').eq('id', Number(courseId)).single();

    const { data: order, error: orderError } = await sb.from('orders').insert({
      user_id: user.id,
      course_id: Number(courseId),
      course_name: course?.title ?? '강좌',
      payment_id: paymentId,
      amount: amount,
      original_amount: amount,
      coupon_code: couponCode ?? null,
      status: 'paid',
      progress: 0,
    }).select().single();

    if (orderError) {
      return new Response(
        JSON.stringify({ success: false, error: `주문 저장 실패: ${orderError.message}` }),
        { status: 500, headers: resHeaders }
      );
    }

    // 6. 쿠폰 사용 횟수 증가
    if (couponId) {
      const { data: coup } = await sb.from('coupons').select('used_count').eq('id', couponId).single();
      if (coup) {
        await sb.from('coupons').update({ used_count: coup.used_count + 1 }).eq('id', couponId);
      }
    }

    return new Response(JSON.stringify({ success: true, orderId: order.id }), { headers: resHeaders });

  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, error: String(e) }),
      { status: 500, headers: resHeaders }
    );
  }
});
