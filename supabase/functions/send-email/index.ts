import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SITE_URL = 'https://juel2414.github.io/imlearning'
const FROM = '아이엠러닝 <noreply@imlearning.co.kr>'
const BRAND = '#2D9B6F'

function base(body: string) {
  return `<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>아이엠러닝</title></head>
<body style="margin:0;padding:0;background:#f2f7f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f7f5;padding:32px 12px;">
  <tr><td align="center">
    <table width="100%" style="max-width:560px;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">
      <tr>
        <td style="background:${BRAND};padding:26px 32px;text-align:center;">
          <span style="color:#fff;font-size:24px;font-weight:900;letter-spacing:-0.5px;">아이엠러닝</span>
          <span style="color:rgba(255,255,255,.65);font-size:12px;display:block;margin-top:2px;letter-spacing:2px;">IM LEARNING</span>
        </td>
      </tr>
      <tr><td style="padding:36px 32px 28px;">${body}</td></tr>
      <tr>
        <td style="padding:18px 32px 26px;border-top:1px solid #eee;text-align:center;">
          <p style="margin:0;color:#aaa;font-size:11px;line-height:1.8;">
            본 메일은 아이엠러닝 회원 대상 자동 발송 메일입니다.<br>
            수신거부 문의: <a href="mailto:imkorea.mission@gmail.com" style="color:${BRAND};text-decoration:none;">imkorea.mission@gmail.com</a><br>
            <span style="color:#ccc;">© 2026 아이엠러닝. All rights reserved.</span>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body></html>`
}

function welcomeHtml(name: string) {
  return base(`
    <h1 style="margin:0 0 10px;color:#111;font-size:22px;font-weight:900;">환영합니다, ${name}님! 🎉</h1>
    <p style="margin:0 0 24px;color:#555;font-size:14px;line-height:1.8;">
      아이엠러닝 가족이 되신 것을 진심으로 환영합니다.<br>
      검정고시, 영어, 신앙 교육까지 — 모든 배움을 한 곳에서 시작하세요.
    </p>
    <div style="background:#f0faf5;border-radius:10px;padding:20px 24px;margin-bottom:28px;">
      <p style="margin:0 0 10px;color:${BRAND};font-size:13px;font-weight:700;">✅ 이런 강좌들이 있어요</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:5px 0;color:#333;font-size:13px;">📚</td><td style="padding:5px 0;color:#333;font-size:13px;">검정고시 전 과목 (중졸·고졸)</td></tr>
        <tr><td style="padding:5px 0;color:#333;font-size:13px;">🌎</td><td style="padding:5px 0;color:#333;font-size:13px;">토익 입문 ~ 중급 (왕기초 포함)</td></tr>
        <tr><td style="padding:5px 0;color:#333;font-size:13px;">✝️</td><td style="padding:5px 0;color:#333;font-size:13px;">신앙 성장 & 부모·선교 교육</td></tr>
        <tr><td style="padding:5px 0;color:#333;font-size:13px;">🎓</td><td style="padding:5px 0;color:#333;font-size:13px;">리뉴젠아카데미 전 과목</td></tr>
      </table>
    </div>
    <div style="text-align:center;">
      <a href="${SITE_URL}/courses.html" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:15px;font-weight:800;">강좌 둘러보기 →</a>
    </div>
  `)
}

function paymentHtml(courseName: string, amount: number) {
  const amtStr = Number(amount).toLocaleString('ko-KR')
  const dateStr = new Date().toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric' })
  return base(`
    <div style="text-align:center;margin-bottom:28px;">
      <div style="width:60px;height:60px;background:#f0faf5;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:14px;">✅</div>
      <h1 style="margin:0 0 6px;color:#111;font-size:21px;font-weight:900;">결제가 완료됐습니다!</h1>
      <p style="margin:0;color:#666;font-size:13px;">아래 영수증을 확인해주세요.</p>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e8e8;border-radius:10px;overflow:hidden;margin-bottom:28px;">
      <tr style="background:#fafafa;"><td style="padding:13px 18px;color:#888;font-size:12px;font-weight:600;width:36%;border-bottom:1px solid #eee;">강좌명</td><td style="padding:13px 18px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #eee;">${courseName}</td></tr>
      <tr><td style="padding:13px 18px;color:#888;font-size:12px;font-weight:600;border-bottom:1px solid #eee;">결제 금액</td><td style="padding:13px 18px;color:${BRAND};font-size:18px;font-weight:900;border-bottom:1px solid #eee;">₩${amtStr}</td></tr>
      <tr style="background:#fafafa;"><td style="padding:13px 18px;color:#888;font-size:12px;font-weight:600;">결제일시</td><td style="padding:13px 18px;color:#444;font-size:13px;">${dateStr}</td></tr>
    </table>
    <div style="text-align:center;">
      <a href="${SITE_URL}/my-courses.html" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:15px;font-weight:800;">수강 시작하기 →</a>
    </div>
    <p style="margin:20px 0 0;color:#aaa;font-size:12px;text-align:center;">환불 정책은 강좌 상세 페이지에서 확인하실 수 있습니다.</p>
  `)
}

function completionHtml(courseName: string) {
  const dateStr = new Date().toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric' })
  return base(`
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:52px;margin-bottom:14px;">🎓</div>
      <h1 style="margin:0 0 8px;color:#111;font-size:22px;font-weight:900;">수료를 축하드립니다!</h1>
      <p style="margin:0;color:#666;font-size:14px;line-height:1.7;">끝까지 완주하신 것, 정말 대단해요! 👏</p>
    </div>
    <div style="background:linear-gradient(135deg,#f0faf5,#e0f5ec);border:1.5px solid ${BRAND};border-radius:12px;padding:24px;margin-bottom:28px;text-align:center;">
      <p style="margin:0 0 4px;color:${BRAND};font-size:12px;font-weight:700;letter-spacing:1px;">수 료 증</p>
      <p style="margin:0 0 8px;color:#222;font-size:17px;font-weight:900;">${courseName}</p>
      <p style="margin:0;color:#888;font-size:12px;">수료일: ${dateStr}</p>
    </div>
    <div style="text-align:center;margin-bottom:20px;">
      <a href="${SITE_URL}/my-courses.html" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:15px;font-weight:800;">나의 강의실 확인하기 →</a>
    </div>
    <p style="margin:0;color:#888;font-size:13px;text-align:center;">더 많은 강좌에 도전해보세요!</p>
    <div style="text-align:center;margin-top:12px;">
      <a href="${SITE_URL}/courses.html" style="color:${BRAND};font-size:13px;text-decoration:none;font-weight:600;">다른 강좌 보러가기 →</a>
    </div>
  `)
}

function newCourseHtml(courseTitle: string, courseId: string | number, thumbnailUrl?: string) {
  const thumb = thumbnailUrl
    ? `<img src="${thumbnailUrl}" alt="" style="width:100%;max-width:480px;border-radius:10px;display:block;margin:0 auto 20px;">`
    : `<div style="background:#f0faf5;border-radius:10px;padding:32px;font-size:40px;text-align:center;margin-bottom:20px;">📚</div>`
  return base(`
    <div style="text-align:center;">
      <span style="display:inline-block;background:#fef9e7;color:#d97706;padding:4px 14px;border-radius:20px;font-size:11px;font-weight:800;letter-spacing:1px;margin-bottom:16px;">🆕 NEW OPEN</span>
      ${thumb}
      <h1 style="margin:0 0 8px;color:#111;font-size:20px;font-weight:900;">새 강좌가 오픈됐어요!</h1>
      <p style="margin:0 0 6px;color:${BRAND};font-size:17px;font-weight:800;">${courseTitle}</p>
      <p style="margin:0 0 28px;color:#666;font-size:13px;line-height:1.7;">아이엠러닝에 새 강좌가 추가됐습니다.<br>지금 바로 확인해보세요!</p>
      <a href="${SITE_URL}/course-detail.html?id=${courseId}" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:15px;font-weight:800;">강좌 보러가기 →</a>
    </div>
  `)
}

function giftHtml(courseName: string, senderName: string, message: string, acceptUrl: string) {
  const who = senderName ? `${senderName}님이` : '누군가'
  const msgBlock = message
    ? `<div style="background:#f0faf5;border-radius:10px;padding:16px 20px;margin:0 0 24px;color:#333;font-size:14px;line-height:1.7;">${message}</div>`
    : ''
  return base(`
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:48px;margin-bottom:12px;">🎁</div>
      <h1 style="margin:0 0 8px;color:#111;font-size:22px;font-weight:900;">${who} 강의를 선물했어요!</h1>
      <p style="margin:0;color:#666;font-size:14px;">아래 강좌를 무료로 받아보세요.</p>
    </div>
    <div style="border:1px solid #e8e8e8;border-radius:10px;padding:20px;margin-bottom:24px;text-align:center;">
      <p style="margin:0;color:#222;font-size:17px;font-weight:800;">${courseName}</p>
    </div>
    ${msgBlock}
    <div style="text-align:center;">
      <a href="${acceptUrl}" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:15px;font-weight:800;">선물 받기 →</a>
    </div>
    <p style="margin:20px 0 0;color:#aaa;font-size:12px;text-align:center;">선물은 발급일로부터 1년간 유효합니다.</p>
  `)
}

async function resendSend(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  })
  if (!res.ok) { const e = await res.text(); throw new Error(`Resend ${res.status}: ${e}`) }
  return res.json()
}

async function resendBatch(emails: Array<{ to: string; subject: string; html: string }>) {
  const results = []
  for (let i = 0; i < emails.length; i += 100) {
    const chunk = emails.slice(i, i + 100).map(e => ({ from: FROM, ...e }))
    const res = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(chunk),
    })
    if (!res.ok) { const e = await res.text(); throw new Error(`Resend batch ${res.status}: ${e}`) }
    results.push(await res.json())
  }
  return results
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const ok = (body: unknown) => new Response(JSON.stringify(body), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  const err = (status: number, msg: string) => new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  try {
    const { type, data = {} } = await req.json() as { type: string; data: Record<string, unknown> }
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    if (type === 'welcome') {
      const email = String(data.email || '')
      const name  = String(data.name || '회원')
      if (!email.includes('@')) return err(400, '유효하지 않은 이메일')
      await resendSend(email, '아이엠러닝에 오신 것을 환영합니다! 🎉', welcomeHtml(name))
      return ok({ sent: 1 })
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return err(401, '인증이 필요합니다')
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authErr } = await adminClient.auth.getUser(token)
    if (authErr || !user) return err(401, '유효하지 않은 토큰')

    const { data: profile } = await adminClient.from('profiles').select('name, role').eq('id', user.id).single()

    if (type === 'payment') {
      const courseName = String(data.courseName || '')
      const amount = Number(data.amount || 0)
      await resendSend(user.email!, '[아이엠러닝] 결제가 완료됐습니다', paymentHtml(courseName, amount))
      return ok({ sent: 1 })
    }

    if (type === 'completion') {
      const courseName = String(data.courseName || '')
      await resendSend(user.email!, '[아이엠러닝] 수료를 축하합니다! 🎓', completionHtml(courseName))
      return ok({ sent: 1 })
    }

    if (type === 'gift') {
      const recipientEmail = String(data.recipientEmail || '')
      if (!recipientEmail.includes('@')) return err(400, '받는 사람 이메일이 유효하지 않음')
      const courseName = String(data.courseName || '강좌')
      const senderName = String(data.senderName || '')
      const message = String(data.message || '')
      const giftCode = String(data.giftCode || '')
      const acceptUrl = `${SITE_URL}/gift.html?code=${encodeURIComponent(giftCode)}`
      await resendSend(recipientEmail, '[아이엠러닝] 🎁 강의 선물이 도착했어요', giftHtml(courseName, senderName, message, acceptUrl))
      return ok({ sent: 1 })
    }

    if (type === 'new_course') {
      if ((profile?.role as string) !== 'admin') return err(403, '관리자 권한이 필요합니다')
      const { data: allProfiles } = await adminClient.from('profiles').select('email').not('email', 'is', null)
      if (!allProfiles?.length) return ok({ sent: 0 })
      const courseTitle  = String(data.courseTitle || '')
      const courseId     = data.courseId
      const thumbnailUrl = data.thumbnailUrl as string | undefined
      const emails = allProfiles.map(p => ({
        to: p.email as string,
        subject: '[아이엠러닝] 새 강좌가 오픈됐어요!',
        html: newCourseHtml(courseTitle, courseId as string, thumbnailUrl),
      }))
      await resendBatch(emails)
      return ok({ sent: allProfiles.length })
    }

    return err(400, '알 수 없는 이메일 타입')

  } catch (e) {
    console.error('send-email error:', e)
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
