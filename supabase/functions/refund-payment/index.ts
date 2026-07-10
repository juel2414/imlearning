import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://juel2414.github.io',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 1. 유저 인증 확인
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: '인증이 필요합니다.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: '인증 실패' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Rate limiting: 5회 / 10분 / 사용자
    const { data: rlOk } = await supabase.rpc('check_rate_limit', {
      p_key: `refund:${user.id}`, p_max: 5, p_window_secs: 600,
    });
    if (!rlOk) {
      return new Response(JSON.stringify({ success: false, error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. 역할 조회 (admin 여부 확인용)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'

    // 3. 요청 본문 파싱
    const body = await req.json()
    const { orderId, giftCode } = body

    // ── 선물 취소·환불 경로 ──────────────────────────────────────────────
    if (giftCode) {
      const { data: gift, error: giftErr } = await supabase
        .from('gifts').select('*').eq('gift_code', giftCode).maybeSingle()

      if (giftErr || !gift) {
        return new Response(JSON.stringify({ success: false, error: '선물을 찾을 수 없습니다.' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      if (gift.sender_id !== user.id) {
        return new Response(JSON.stringify({ success: false, error: '권한이 없습니다.' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      if (!['pending', 'already_owned'].includes(gift.status)) {
        return new Response(JSON.stringify({ success: false, error: `취소할 수 없는 상태입니다: ${gift.status}` }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const refundAmount = gift.amount || 0
      const newStatus = gift.status === 'already_owned' ? 'refunded' : 'cancelled'

      if (refundAmount > 0 && gift.payment_id) {
        const portoneSecret = Deno.env.get('PORTONE_API_SECRET')
        if (portoneSecret) {
          const portoneRes = await fetch(
            `https://api.portone.io/payments/${gift.payment_id}/cancel`,
            {
              method: 'POST',
              headers: { Authorization: `PortOne ${portoneSecret}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ reason: '선물 취소 환불', amount: refundAmount }),
            }
          )
          if (!portoneRes.ok) {
            const errText = await portoneRes.text()
            return new Response(JSON.stringify({ success: false, error: 'PortOne 환불 실패: ' + errText }), {
              status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
          }
        }
      }

      await supabase.from('gifts').update({ status: newStatus }).eq('gift_code', giftCode)

      return new Response(JSON.stringify({ success: true, refund_amount: refundAmount, status: newStatus }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!orderId) {
      return new Response(JSON.stringify({ success: false, error: 'orderId가 필요합니다.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 4. 주문 조회
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, amount, created_at, user_id, course_id, payment_id, refund_status')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return new Response(JSON.stringify({ success: false, error: '주문을 찾을 수 없습니다.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 권한 체크: admin이거나 본인 주문만 가능
    if (!isAdmin && order.user_id !== user.id) {
      return new Response(JSON.stringify({ success: false, error: '권한이 없습니다.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (order.refund_status && order.refund_status !== 'none') {
      return new Response(JSON.stringify({ success: false, error: '이미 처리된 환불 요청입니다.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 5. video_progress에서 시청 비율 계산
    const { data: vpData } = await supabase
      .from('video_progress')
      .select('actual_watched_seconds, total_seconds')
      .eq('user_id', order.user_id)
      .eq('course_id', order.course_id)

    let totalWatched = 0
    let totalDuration = 0
    if (vpData && vpData.length > 0) {
      for (const vp of vpData) {
        totalWatched += vp.actual_watched_seconds || 0
        totalDuration += vp.total_seconds || 0
      }
    }
    const watchRatio = totalDuration > 0 ? totalWatched / totalDuration : 0

    // 6. 구매 후 경과 일수 계산
    const daysSincePurchase =
      (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24)

    // 7. 환불 금액 및 상태 결정
    let refundAmount = 0
    let refundStatus = 'rejected'
    let message = ''

    if (watchRatio === 0) {
      // 수강 시작 전 → 전액 환불
      refundAmount = order.amount
      refundStatus = 'refunded'
      message = '수강 시작 전 전액 환불'
    } else if (daysSincePurchase <= 7 && watchRatio < 1 / 3) {
      // 7일 이내 + 1/3 미만 시청 → 2/3 환불
      refundAmount = Math.floor(order.amount * (2 / 3))
      refundStatus = 'partial'
      message = '7일 이내 1/3 미만 시청 — 결제금액의 2/3 환불'
    } else if (daysSincePurchase <= 7 && watchRatio < 1 / 2) {
      // 7일 이내 + 1/3~1/2 시청 → 1/2 환불
      refundAmount = Math.floor(order.amount * (1 / 2))
      refundStatus = 'partial'
      message = '7일 이내 1/3~1/2 시청 — 결제금액의 1/2 환불'
    } else {
      // 1/2 이상 시청 OR 7일 초과 → 환불 불가
      refundAmount = 0
      refundStatus = 'rejected'
      message = '1/2 이상 시청 또는 7일 초과 — 환불 불가'
    }

    // 8. 환불 가능한 경우 PortOne 취소 API 호출
    if (refundAmount > 0 && order.payment_id) {
      const portoneSecret = Deno.env.get('PORTONE_API_SECRET')
      const portoneRes = await fetch(
        `https://api.portone.io/payments/${order.payment_id}/cancel`,
        {
          method: 'POST',
          headers: {
            Authorization: `PortOne ${portoneSecret}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reason: isAdmin ? '관리자 환불 처리' : '수강생 환불 신청',
            amount: refundAmount,
          }),
        }
      )

      if (!portoneRes.ok) {
        const errText = await portoneRes.text()
        return new Response(
          JSON.stringify({ success: false, error: 'PortOne 환불 실패: ' + errText }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
    }

    // 9. orders 테이블 업데이트
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        refund_status: refundStatus,
        refund_amount: refundAmount,
        refunded_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      return new Response(
        JSON.stringify({ success: false, error: '주문 업데이트 실패: ' + updateError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        refund_amount: refundAmount,
        refund_status: refundStatus,
        message,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '서버 오류'
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
