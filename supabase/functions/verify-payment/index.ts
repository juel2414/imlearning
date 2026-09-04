import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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

// 개인에게 발급된 쿠폰인지 확인한다. user_coupons 에 주인이 적혀 있으면
// 그 사람만 쓸 수 있고, 아무 행도 없으면 공개 프로모션 코드로 본다.
// 예전에는 이 확인이 없어 남의 쿠폰 코드를 알면 그대로 쓸 수 있었다.
async function ownsCoupon(sb: any, couponId: string, userId: string): Promise<boolean> {
  const { data: issued } = await sb.from('user_coupons')
    .select('user_id').eq('coupon_id', couponId);
  if (!issued || issued.length === 0) return true;         // 공개 쿠폰
  return issued.some((r: any) => r.user_id === userId);
}

// customData 를 꺼낸다. 브라우저가 문자열로 넣으면 포트원 SDK 가 그것을
// 다시 한 번 문자열로 감싸 돌려준다. 그래서 한 번 파싱하면 객체가 아니라
// 문자열이 나온다. 이걸 놓쳐서 결제를 통째로 흘렸다. 객체가 될 때까지 푼다.
function parseCustomData(payment: any): any {
  var v = payment && payment.customData;
  for (var i = 0; i < 3; i++) {
    if (v == null) return null;
    if (typeof v === 'object') return v;
    try { v = JSON.parse(v); } catch (e) { return null; }
  }
  return typeof v === 'object' ? v : null;
}

// 결제와 결제자를 묶는다. 예전에는 결제번호만 알면 남이 낸 돈으로 강좌를
// 받아갈 수 있었다(먼저 검증하는 쪽이 가져간다). 결제 요청 때 넣어 둔
// customData 에 요청자가 적혀 있으므로 그것과 맞춘다.
// customData 가 붙기 전에 만들어진 결제에는 값이 없으므로 그대로 통과시킨다.
function payerMismatch(payment: any, userId: string): boolean {
  const ctx = parseCustomData(payment);
  return !!(ctx && ctx.userId && ctx.userId !== userId);
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
  const cors = corsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  const resHeaders = { ...cors, 'Content-Type': 'application/json' };

  const err = (msg: string, status = 400) =>
    new Response(JSON.stringify({ success: false, error: msg }), { status, headers: resHeaders });

  try {
    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '').trim();
    if (!token) return err('인증 토큰 없음', 401);

    const SUPABASE_URL            = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const PORTONE_API_SECRET       = Deno.env.get('PORTONE_API_SECRET') ?? '';
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();

    // ── 누가 부른 것인가 ──────────────────────────────────────────────
    // 보통은 브라우저가 사용자 토큰을 들고 온다. 그런데 결제창에서 돌아오는
    // 길에 브라우저가 죽으면(탭을 닫거나, 통신이 끊기거나, 앱이 전환되거나)
    // 아무도 이 함수를 부르지 않아 돈만 빠져나가고 주문이 남지 않는다.
    // 그래서 포트원 웹훅이 서버에서 직접 부르는 길을 따로 둔다. 이때는
    // 서비스 롤 키를 들고 오며, 사용자는 body.userId 로 지정한다.
    const isInternal = token === SUPABASE_SERVICE_ROLE_KEY;

    let user: { id: string; email?: string } | null = null;
    if (isInternal) {
      if (!body.userId) return err('내부 호출에 userId 가 없습니다');
      const { data: got, error: getErr } = await sb.auth.admin.getUserById(String(body.userId));
      if (getErr || !got?.user) return err('사용자를 찾을 수 없습니다', 404);
      user = got.user as any;
    } else {
      const { data: { user: u }, error: authError } = await sb.auth.getUser(token);
      if (authError || !u) return err('인증 실패', 401);
      user = u as any;

      // ── Rate limiting: 10회 / 10분 / 사용자 ─────────────────────────
      // 웹훅은 포트원이 재시도할 수 있어야 하므로 이 제한에서 뺀다.
      const { data: rlOk } = await sb.rpc('check_rate_limit', {
        p_key: `pay:${user!.id}`, p_max: 10, p_window_secs: 600,
      });
      if (!rlOk) return err('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', 429);
    }
    if (!user) return err('인증 실패', 401);

    let { paymentId, courseId, amount, couponCode, couponId, isGift, recipientEmail, message,
          isPass, passId } = body;

    // ── 맥락 복원 ─────────────────────────────────────────────────────
    // 모바일에서는 결제창이 페이지 이동으로 뜨기 때문에, 돌아왔을 때
    // sessionStorage 가 비어 있는 일이 드물지 않다(다른 탭으로 돌아오거나,
    // 브라우저가 저장소를 비웠거나). 그러면 브라우저는 무엇을 결제했는지
    // 모른다. 포트원이 customData 를 보관하고 있으므로 그걸로 되살린다.
    if (body.recover && paymentId) {
      if (!PORTONE_API_SECRET) return err('결제 정보를 복원할 수 없습니다', 500);
      const pr = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
        { headers: { 'Authorization': `PortOne ${PORTONE_API_SECRET}` } });
      if (!pr.ok) return err('결제 조회 실패');
      const payment = await pr.json();
      if (payment.status !== 'PAID') return err(`결제 미완료: ${payment.status}`);

      const ctx: any = parseCustomData(payment);
      if (!ctx || !ctx.kind) return err('결제 정보를 복원하지 못했습니다');
      // 남의 결제번호를 넣어 남의 강좌를 받아가지 못하게 한다.
      if (ctx.userId && ctx.userId !== user.id) return err('결제자와 로그인 사용자가 다릅니다', 403);

      amount = ctx.amount;
      if (ctx.kind === 'pass') {
        isPass = true; passId = ctx.passId;
      } else if (ctx.kind === 'gift') {
        isGift = true; courseId = ctx.courseId;
        recipientEmail = ctx.recipientEmail ?? null; message = ctx.message ?? null;
      } else {
        courseId = ctx.courseId;
        couponCode = ctx.couponCode ?? null; couponId = ctx.couponId ?? null;
      }
    }
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
        if (payerMismatch(payment, user.id)) return err('결제자와 로그인 사용자가 다릅니다', 403);
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
      const failed: number[] = [];
      for (const pc of passCourses) {
        // 이미 만료 없는 영구 주문이 있으면 스킵.
        // 환불된 주문은 수강권이 아니므로 제외한다. 예전에는 이걸 빠뜨려,
        // 환불한 강좌가 프리패스 목록에서도 통째로 빠졌다.
        const { data: perm } = await sb.from('orders')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', pc.course_id)
          .eq('status', 'paid')
          .is('expires_at', null)
          .or('refund_status.is.null,refund_status.eq.none')
          .limit(1);
        if (perm && perm.length > 0) continue; // 영구 수강권 보유 → 덮어쓰지 않음

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
        // 실패를 조용히 삼키면 돈은 받고 강좌 몇 개가 빠진 채로 끝난다.
        // 접근 자체는 패스 마커로 열리지만 내 강의실에서 사라지므로 남긴다.
        if (oErr) { failed.push(pc.course_id); console.error('[프리패스] 강좌 주문 실패', pc.course_id, oErr.message); }
        else insertedCount++;
      }
      if (failed.length > 0)
        console.error('[프리패스] 일부 강좌가 목록에 들어가지 못했습니다', paymentId, failed);

      // 패스 자체 결제 기록 (course_id = null = 프리패스 식별자)
      // hasPurchased()와 RLS 정책에서 course_id IS NULL로 패스 보유 여부를 확인함
      await sb.from('orders').insert({
        user_id: user.id,
        course_id: null,
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
        failedCourseIds: failed,
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
      .eq('id', courseId_n).eq('status', 'active').single();
    if (!course) return err('강좌를 찾을 수 없습니다', 404);

    const now = new Date();
    const serverBasePrice = calcServerPrice(course as CourseRow, now);
    const originalAmount  = serverBasePrice;

    // ── 무료 수강 신청 (amount === 0, 선물 아님) ──────────────────────
    if (isFree) {
      let allowFree = serverBasePrice === 0;
      let freeCoupon: any = null;

      if (!allowFree && couponId) {
        const { data: coupon } = await sb.from('coupons')
          .select('code, discount_type, discount_value, expires_at, max_uses, used_count, min_amount')
          .eq('id', couponId).eq('status', 'active').single();
        if (!coupon) return err('유효하지 않은 쿠폰입니다');

        if (coupon.expires_at && new Date(coupon.expires_at) < now)
          return err('만료된 쿠폰입니다');
        if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses)
          return err('쿠폰 사용 한도를 초과했습니다');
        // 유료 경로에는 있는데 여기만 빠져 있었다. 최소 결제금액이 걸린
        // 쿠폰을 0원 경로로 우회해서 쓸 수 있었다.
        if (coupon.min_amount != null && serverBasePrice < coupon.min_amount)
          return err(`최소 결제금액 ${Number(coupon.min_amount).toLocaleString('ko-KR')}원 이상 사용 가능한 쿠폰입니다`);
        if (!(await ownsCoupon(sb, couponId, user.id)))
          return err('본인에게 발급된 쿠폰이 아닙니다', 403);

        const discounted = coupon.discount_type === 'rate'
          ? serverBasePrice * (1 - coupon.discount_value / 100)
          : serverBasePrice - coupon.discount_value;
        allowFree = discounted <= 0;
        freeCoupon = coupon;
      }

      if (!allowFree)
        return err('이 강좌는 무료 등록이 허용되지 않습니다.', 403);

      // 재사용 검사는 DB 가 가진 코드로 한다. 예전에는 브라우저가 보낸
      // couponCode 로만 봐서, 그 값을 빼고 보내면 검사를 건너뛸 수 있었다.
      const freeCode = freeCoupon?.code ?? couponCode;
      if (freeCode) {
        const { data: prevUse } = await sb.from('orders')
          .select('id').eq('user_id', user.id).eq('coupon_code', freeCode)
          .eq('status', 'paid').maybeSingle();
        if (prevUse) return err('이미 사용한 쿠폰입니다');
      }

      const { data: existing } = await sb.from('orders')
        .select('id').eq('user_id', user.id).eq('course_id', courseId_n).eq('status', 'paid').maybeSingle();
      if (existing) return new Response(JSON.stringify({ success: true, orderId: existing.id, duplicate: true }), { headers: resHeaders });

      // use_coupon을 주문 생성 전에 호출: 동시 요청 레이스컨디션 방지
      if (couponId) {
        const { data: couponUsed } = await sb.rpc('use_coupon', { p_coupon_id: couponId });
        if (!couponUsed) return err('쿠폰 사용 한도를 초과했습니다.');
      }

      const { data: order, error: orderError } = await sb.from('orders').insert({
        user_id: user.id, course_id: courseId_n, course_name: course.title ?? '강좌',
        payment_id: `free-${user.id}-${courseId}-${Date.now()}`,
        amount: 0, original_amount: originalAmount,
        coupon_code: freeCode ?? null, status: 'paid', progress: 0,
      }).select().single();
      if (orderError) return err(`주문 저장 실패: ${orderError.message}`, 500);

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
      if (payerMismatch(payment, user.id)) return err('결제자와 로그인 사용자가 다릅니다', 403);
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
    let paidCoupon: any = null;
    if (couponId) {
      const { data: coupon } = await sb.from('coupons')
        .select('code, discount_type, discount_value, expires_at, max_uses, used_count, min_amount')
        .eq('id', couponId).eq('status', 'active').single();

      if (!coupon)
        return err('유효하지 않은 쿠폰입니다');
      if (coupon.expires_at && new Date(coupon.expires_at) < now)
        return err('만료된 쿠폰입니다');
      if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses)
        return err('쿠폰 사용 한도를 초과했습니다');
      if (coupon.min_amount != null && serverBasePrice < coupon.min_amount)
        return err(`최소 결제금액 ${Number(coupon.min_amount).toLocaleString('ko-KR')}원 이상 사용 가능한 쿠폰입니다`);

      if (!(await ownsCoupon(sb, couponId, user.id)))
        return err('본인에게 발급된 쿠폰이 아닙니다', 403);

      const discount = coupon.discount_type === 'rate'
        ? Math.floor(serverBasePrice * (coupon.discount_value / 100))
        : Number(coupon.discount_value);
      expectedAmount = Math.max(0, serverBasePrice - discount);
      paidCoupon = coupon;
    }

    // 재사용 검사는 DB 가 가진 코드로 한다. 브라우저가 보낸 값만 보면
    // 그 값을 빼고 보내는 것으로 검사를 건너뛸 수 있다.
    const paidCode = paidCoupon?.code ?? couponCode;
    if (paidCode) {
      const { data: prevUse } = await sb.from('orders')
        .select('id').eq('user_id', user.id).eq('coupon_code', paidCode)
        .eq('status', 'paid').maybeSingle();
      if (prevUse) return err('이미 사용한 쿠폰입니다');
    }

    if (amount !== expectedAmount)
      return err(`결제금액 불일치 (예상: ${expectedAmount}원)`);

    const { data: existing } = await sb.from('orders').select('id').eq('payment_id', paymentId).maybeSingle();
    if (existing) return new Response(JSON.stringify({ success: true, orderId: existing.id, duplicate: true }), { headers: resHeaders });

    // 동일 사용자+강좌 중복 구매 방지 (환불된 주문 제외)
    const { data: existingCourse } = await sb.from('orders')
      .select('id').eq('user_id', user.id).eq('course_id', courseId_n)
      .eq('status', 'paid')
      .or('refund_status.is.null,refund_status.eq.none')
      .maybeSingle();
    if (existingCourse) return new Response(JSON.stringify({ success: true, orderId: existingCourse.id, duplicate: true }), { headers: resHeaders });

    // use_coupon을 주문 생성 전에 호출: 동시 요청 레이스컨디션 방지
    if (couponId) {
      const { data: couponUsed } = await sb.rpc('use_coupon', { p_coupon_id: couponId });
      if (!couponUsed) return err('쿠폰 사용 한도를 초과했습니다 (동시 사용 충돌).');
    }

    const { data: order, error: orderError } = await sb.from('orders').insert({
      user_id: user.id, course_id: courseId_n, course_name: course.title ?? '강좌',
      payment_id: paymentId, amount, original_amount: originalAmount,
      coupon_code: paidCode ?? null, status: 'paid', progress: 0,
    }).select().single();
    if (orderError) return err(`주문 저장 실패: ${orderError.message}`, 500);

    try {
      await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'payment', data: { courseName: course.title ?? '강좌', amount } }),
      });
    } catch (e) { console.error('영수증 메일 실패(무시):', e); }

    return new Response(JSON.stringify({ success: true, orderId: order.id }), { headers: resHeaders });

  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: String(e) }), { status: 500, headers: resHeaders });
  }
});
