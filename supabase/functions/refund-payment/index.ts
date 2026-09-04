import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_ORIGINS = new Set<string>(
  ['https://juel2414.github.io', Deno.env.get('SITE_ORIGIN') || ''].filter(Boolean)
);

function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin) ? origin : 'https://juel2414.github.io',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

Deno.serve(async (req: Request) => {
  const cors = corsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
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
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: '인증 실패' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    // Rate limiting: 5회 / 10분 / 사용자
    const { data: rlOk } = await supabase.rpc('check_rate_limit', {
      p_key: `refund:${user.id}`, p_max: 5, p_window_secs: 600,
    });
    if (!rlOk) {
      return new Response(JSON.stringify({ success: false, error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }), {
        status: 429, headers: { ...cors, 'Content-Type': 'application/json' },
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
          status: 404, headers: { ...cors, 'Content-Type': 'application/json' },
        })
      }
      if (!isAdmin && gift.sender_id !== user.id) {
        return new Response(JSON.stringify({ success: false, error: '권한이 없습니다.' }), {
          status: 403, headers: { ...cors, 'Content-Type': 'application/json' },
        })
      }

      // ── 수락된 선물 환불 (수락 후 7일 이내 + 수령자 1/3 미만 시청) ──
      if (gift.status === 'accepted') {
        const acceptedAt = gift.accepted_at ? new Date(gift.accepted_at) : null
        if (!acceptedAt) {
          return new Response(JSON.stringify({ success: false, error: '수락 시각 정보가 없습니다.' }), {
            status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
          })
        }
        const daysSince = (Date.now() - acceptedAt.getTime()) / (1000 * 60 * 60 * 24)
        if (!isAdmin && daysSince > 7) {
          return new Response(JSON.stringify({ success: false, error: '수락 후 7일이 지나 환불이 불가합니다.' }), {
            status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
          })
        }

        const { data: vpData } = await supabase
          .from('video_progress')
          .select('actual_watched_seconds')
          .eq('user_id', gift.recipient_id)
          .eq('course_id', gift.course_id)

        const { data: giftLessons } = await supabase
          .from('lessons')
          .select('duration_seconds')
          .eq('course_id', gift.course_id)

        let totalWatched = 0
        for (const vp of vpData || []) totalWatched += vp.actual_watched_seconds || 0
        const totalDuration = (giftLessons || []).reduce((s, l) => s + (l.duration_seconds || 0), 0)
        const watchRatio = totalDuration > 0 ? totalWatched / totalDuration : (totalWatched > 0 ? 1 : 0)
        if (!isAdmin && watchRatio >= 1 / 3) {
          return new Response(JSON.stringify({ success: false, error: '수령자가 강의를 1/3 이상 시청해 환불이 불가합니다.' }), {
            status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
          })
        }

        // TOCTOU 방지: atomic UPDATE로 'refund_processing' 선점
        const { data: claimedGift } = await supabase
          .from('gifts')
          .update({ status: 'refund_processing' })
          .eq('gift_code', giftCode)
          .eq('status', 'accepted')
          .select('id')
          .maybeSingle()
        if (!claimedGift) {
          return new Response(JSON.stringify({ success: false, error: '이미 처리 중이거나 처리된 환불 요청입니다.' }), {
            status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
          })
        }

        const refundAmount = gift.amount || 0
        if (refundAmount > 0 && gift.payment_id) {
          const portoneSecret = Deno.env.get('PORTONE_API_SECRET')
          if (portoneSecret) {
            const portoneRes = await fetch(
              `https://api.portone.io/payments/${gift.payment_id}/cancel`,
              {
                method: 'POST',
                headers: { Authorization: `PortOne ${portoneSecret}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: '선물 환불 (수령 후)', amount: refundAmount }),
              }
            )
            if (!portoneRes.ok) {
              const errText = await portoneRes.text()
              await supabase.from('gifts').update({ status: 'accepted' }).eq('gift_code', giftCode)
              return new Response(JSON.stringify({ success: false, error: 'PortOne 환불 실패: ' + errText }), {
                status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
              })
            }
          }
        }

        const { error: giftUpdateErr } = await supabase.from('gifts').update({ status: 'refunded' }).eq('gift_code', giftCode)
        if (giftUpdateErr) {
          return new Response(JSON.stringify({ success: false, error: '선물 상태 업데이트 실패: ' + giftUpdateErr.message }), {
            status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
          })
        }

        // 수령자 order도 환불 처리 → 수강 접근 차단
        await supabase.from('orders')
          .update({ refund_status: 'refunded', refund_amount: refundAmount, refunded_at: new Date().toISOString() })
          .eq('user_id', gift.recipient_id)
          .eq('course_id', gift.course_id)
          .eq('payment_id', gift.payment_id)

        // ── 받은 분에게 알린다 ──────────────────────────────────────
        // 이미 내 강의실에 들어와 있던 강좌가 말없이 사라지면 고장으로
        // 오해한다. 누가 왜 회수했는지 알려 준다. 알림 실패가 환불을
        // 되돌리면 안 되므로 오류는 삼킨다.
        if (gift.recipient_id) {
          try {
            const { data: gc } = await supabase.from('courses')
              .select('title').eq('id', gift.course_id).maybeSingle()
            const senderName = gift.sender_name || '보내신 분'
            await supabase.from('notifications').insert({
              user_id: gift.recipient_id,
              type: 'gift_refunded',
              title: '선물이 취소되었어요',
              body: `${senderName}님이 「${gc?.title ?? '강좌'}」 선물을 취소했습니다. `
                  + '해당 강좌는 더 이상 수강할 수 없습니다.',
              link: 'my-courses.html?tab=gifts',
            })
          } catch (e) {
            console.error('선물 환불 알림 실패(무시):', e)
          }
        }

        return new Response(JSON.stringify({ success: true, refund_amount: refundAmount, status: 'refunded' }), {
          headers: { ...cors, 'Content-Type': 'application/json' },
        })
      }

      if (!['pending', 'already_owned'].includes(gift.status)) {
        return new Response(JSON.stringify({ success: false, error: `취소할 수 없는 상태입니다: ${gift.status}` }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        })
      }

      const origGiftStatus = gift.status
      const refundAmount = gift.amount || 0
      const newStatus = gift.status === 'already_owned' ? 'refunded' : 'cancelled'

      // TOCTOU 방지: atomic UPDATE로 'refund_processing' 선점
      const { data: claimedGift2 } = await supabase
        .from('gifts')
        .update({ status: 'refund_processing' })
        .eq('gift_code', giftCode)
        .in('status', ['pending', 'already_owned'])
        .select('id')
        .maybeSingle()
      if (!claimedGift2) {
        return new Response(JSON.stringify({ success: false, error: '이미 처리 중이거나 처리된 환불 요청입니다.' }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        })
      }

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
            await supabase.from('gifts').update({ status: origGiftStatus }).eq('gift_code', giftCode)
            return new Response(JSON.stringify({ success: false, error: 'PortOne 환불 실패: ' + errText }), {
              status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
            })
          }
        }
      }

      const { error: updateErr } = await supabase.from('gifts').update({ status: newStatus }).eq('gift_code', giftCode)
      if (updateErr) {
        return new Response(JSON.stringify({ success: false, error: '상태 업데이트 실패: ' + updateErr.message }), {
          status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ success: true, refund_amount: refundAmount, status: newStatus }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    if (!orderId) {
      return new Response(JSON.stringify({ success: false, error: 'orderId가 필요합니다.' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    // 4. 주문 조회 (권한 확인용)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, amount, created_at, user_id, course_id, payment_id, refund_status')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return new Response(JSON.stringify({ success: false, error: '주문을 찾을 수 없습니다.' }), {
        status: 404,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    // 권한 체크: admin이거나 본인 주문만 가능
    if (!isAdmin && order.user_id !== user.id) {
      return new Response(JSON.stringify({ success: false, error: '권한이 없습니다.' }), {
        status: 403,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    // TOCTOU 방지: atomic UPDATE로 'processing' 상태 선점 — 이미 처리 중이면 0 rows 반환
    const { data: claimed } = await supabase
      .from('orders')
      .update({ refund_status: 'processing' })
      .eq('id', orderId)
      .or('refund_status.is.null,refund_status.eq.none')
      .select('id')
      .maybeSingle()

    if (!claimed) {
      return new Response(JSON.stringify({ success: false, error: '이미 처리 중이거나 처리된 환불 요청입니다.' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    // 5. 시청 비율 계산
    // totalDuration: lessons.duration_seconds 합산 (서버 데이터 — 클라이언트 조작 불가)
    // totalWatched: video_progress.actual_watched_seconds 합산 (트리거로 감소 금지)
    const { data: vpData } = await supabase
      .from('video_progress')
      .select('actual_watched_seconds')
      .eq('user_id', order.user_id)
      .eq('course_id', order.course_id)

    const { data: lessonsData } = await supabase
      .from('lessons')
      .select('duration_seconds')
      .eq('course_id', order.course_id)

    let totalWatched = 0
    if (vpData && vpData.length > 0) {
      for (const vp of vpData) totalWatched += vp.actual_watched_seconds || 0
    }
    const totalDuration = (lessonsData || []).reduce((s, l) => s + (l.duration_seconds || 0), 0)
    // totalDuration=0(미설정)이고 시청 기록이 있으면 완료로 간주 → 환불 차단
    const watchRatio = totalDuration > 0
      ? totalWatched / totalDuration
      : (totalWatched > 0 ? 1 : 0)

    // 6. 구매 후 경과 일수 계산
    const daysSincePurchase =
      (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24)

    // 7. 환불 금액 및 상태 결정
    let refundAmount = 0
    let refundStatus = 'rejected'
    let message = ''

    if (isAdmin) {
      // 어드민: 시청률·기간 무관 전액 강제 환불
      refundAmount = order.amount
      refundStatus = 'refunded'
      message = '관리자 강제 환불'
    } else if (watchRatio === 0) {
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
      if (portoneSecret) {
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
          // PortOne 실패 시 processing 상태 롤백 → 사용자가 재시도 가능
          await supabase.from('orders').update({ refund_status: null }).eq('id', orderId)
          return new Response(
            JSON.stringify({ success: false, error: 'PortOne 환불 실패: ' + errText }),
            {
              status: 500,
              headers: { ...cors, 'Content-Type': 'application/json' },
            }
          )
        }
      }
    }

    // 9. orders 테이블 최종 상태 업데이트
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        refund_status: refundStatus,
        refund_amount: refundAmount,
        refunded_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    // 패스 주문(course_id=null) 환불 시 강좌별 orders도 만료 처리
    if ((refundStatus === 'refunded' || refundStatus === 'partial') && order.course_id === null) {
      await supabase
        .from('orders')
        .update({ refund_status: refundStatus, refund_amount: 0, refunded_at: new Date().toISOString() })
        .eq('user_id', order.user_id)
        .like('payment_id', order.payment_id + '-%')
        .or('refund_status.is.null,refund_status.eq.none')
    }

    if (updateError) {
      return new Response(
        JSON.stringify({ success: false, error: '주문 업데이트 실패: ' + updateError.message }),
        {
          status: 500,
          headers: { ...cors, 'Content-Type': 'application/json' },
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
      { headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '서버 오류'
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
