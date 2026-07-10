import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://juel2414.github.io',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 이메일 HTML 인젝션 방지 — 사용자 제공 값은 반드시 이 함수로 이스케이프
function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SITE_URL = 'https://juel2414.github.io/imlearning'
const FROM = '아이엠러닝 <noreply@imlearning.co.kr>'
const BRAND = '#2D9B6F'
const LOGO_URL = 'https://juel2414.github.io/imlearning/images/logo-horizontal.png'

function base(body: string, heroHtml = '') {
  return `<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>아이엠러닝</title></head>
<body style="margin:0;padding:0;background:#f0f4f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f2;padding:28px 12px;">
  <tr><td align="center">
    <table width="100%" style="max-width:580px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.10);">
      <!-- 로고 헤더 -->
      <tr>
        <td style="background:#fff;padding:20px 32px 18px;text-align:center;border-top:4px solid ${BRAND};">
          <img src="${LOGO_URL}" alt="아이엠러닝" style="height:44px;max-width:180px;display:inline-block;" />
        </td>
      </tr>
      ${heroHtml ? `<tr><td>${heroHtml}</td></tr>` : ''}
      <!-- 본문 -->
      <tr><td style="padding:32px 32px 24px;">${body}</td></tr>
      <!-- 푸터 -->
      <tr>
        <td style="background:#f8faf9;padding:20px 32px 24px;border-top:1px solid #eaeaea;text-align:center;">
          <p style="margin:0 0 8px;color:#999;font-size:11px;line-height:1.9;">
            본 메일은 아이엠러닝 회원 대상 자동 발송 메일입니다.<br>
            수신거부 문의: <a href="mailto:imkorea.mission@gmail.com" style="color:${BRAND};text-decoration:none;font-weight:600;">imkorea.mission@gmail.com</a>
          </p>
          <p style="margin:0;color:#ccc;font-size:10px;">© 2026 아이엠러닝. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body></html>`
}

function welcomeHtml(name: string) {
  const hero = `
    <div style="background:linear-gradient(135deg,#2D9B6F 0%,#1e7a54 100%);padding:36px 32px;text-align:center;">
      <div style="font-size:44px;margin-bottom:12px;">🎉</div>
      <h1 style="margin:0 0 10px;color:#fff;font-size:26px;font-weight:900;letter-spacing:-0.5px;">환영합니다, ${esc(name)}님!</h1>
      <p style="margin:0;color:rgba(255,255,255,.85);font-size:14px;line-height:1.7;">
        아이엠러닝 가족이 되신 것을 진심으로 환영합니다.<br>배움의 여정을 지금 시작해보세요.
      </p>
    </div>`;
  return base(`
    <p style="margin:0 0 20px;color:#555;font-size:14px;line-height:1.8;text-align:center;">
      검정고시부터 영어, 신앙 교육까지 — <strong style="color:#111;">모든 배움을 한 곳에서</strong> 만나보세요.
    </p>
    <!-- 강좌 카드 2×2 -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td width="50%" style="padding:6px 6px 6px 0;">
          <div style="background:#f0faf5;border-radius:12px;padding:18px 14px;text-align:center;">
            <div style="font-size:30px;margin-bottom:8px;">📚</div>
            <div style="font-size:13px;font-weight:800;color:#111;margin-bottom:4px;">검정고시</div>
            <div style="font-size:11px;color:#888;">중졸·고졸 전 과목</div>
          </div>
        </td>
        <td width="50%" style="padding:6px 0 6px 6px;">
          <div style="background:#f0f5ff;border-radius:12px;padding:18px 14px;text-align:center;">
            <div style="font-size:30px;margin-bottom:8px;">🌎</div>
            <div style="font-size:13px;font-weight:800;color:#111;margin-bottom:4px;">영어·토익</div>
            <div style="font-size:11px;color:#888;">왕기초 ~ 중급</div>
          </div>
        </td>
      </tr>
      <tr>
        <td width="50%" style="padding:6px 6px 0 0;">
          <div style="background:#fff8f0;border-radius:12px;padding:18px 14px;text-align:center;">
            <div style="font-size:30px;margin-bottom:8px;">✝️</div>
            <div style="font-size:13px;font-weight:800;color:#111;margin-bottom:4px;">신앙·선교</div>
            <div style="font-size:11px;color:#888;">성장 & 부모·교사 교육</div>
          </div>
        </td>
        <td width="50%" style="padding:6px 0 0 6px;">
          <div style="background:#fdf0f5;border-radius:12px;padding:18px 14px;text-align:center;">
            <div style="font-size:30px;margin-bottom:8px;">🎓</div>
            <div style="font-size:13px;font-weight:800;color:#111;margin-bottom:4px;">리뉴젠아카데미</div>
            <div style="font-size:11px;color:#888;">전 과목 무제한</div>
          </div>
        </td>
      </tr>
    </table>
    <div style="text-align:center;">
      <a href="${SITE_URL}/courses.html"
         style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;
                padding:15px 44px;border-radius:10px;font-size:15px;font-weight:800;letter-spacing:-0.3px;">
        강좌 둘러보기 →
      </a>
    </div>
    <p style="margin:20px 0 0;text-align:center;color:#aaa;font-size:12px;">
      궁금한 점이 있으면 언제든지 <a href="mailto:imkorea.mission@gmail.com" style="color:${BRAND};text-decoration:none;">문의</a>해 주세요.
    </p>
  `, hero)
}

function paymentHtml(courseName: string, amount: number) {
  const amtStr = Number(amount).toLocaleString('ko-KR')
  const dateStr = new Date().toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric' })
  const hero = `
    <div style="background:linear-gradient(135deg,#2D9B6F 0%,#1e7a54 100%);padding:32px;text-align:center;">
      <div style="font-size:40px;margin-bottom:10px;">✅</div>
      <h1 style="margin:0 0 6px;color:#fff;font-size:22px;font-weight:900;">결제가 완료됐습니다!</h1>
      <p style="margin:0;color:rgba(255,255,255,.85);font-size:13px;">아래 영수증을 확인해주세요.</p>
    </div>`
  return base(`
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #e8e8e8;border-radius:12px;overflow:hidden;margin-bottom:28px;">
      <tr style="background:#f8faf9;">
        <td style="padding:14px 18px;color:#888;font-size:12px;font-weight:700;width:34%;border-bottom:1px solid #eee;letter-spacing:.3px;">강 좌 명</td>
        <td style="padding:14px 18px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #eee;">${esc(courseName)}</td>
      </tr>
      <tr>
        <td style="padding:14px 18px;color:#888;font-size:12px;font-weight:700;border-bottom:1px solid #eee;letter-spacing:.3px;">결제 금액</td>
        <td style="padding:14px 18px;color:${BRAND};font-size:22px;font-weight:900;border-bottom:1px solid #eee;">₩${amtStr}</td>
      </tr>
      <tr style="background:#f8faf9;">
        <td style="padding:14px 18px;color:#888;font-size:12px;font-weight:700;letter-spacing:.3px;">결제 일시</td>
        <td style="padding:14px 18px;color:#555;font-size:13px;">${dateStr}</td>
      </tr>
    </table>
    <div style="text-align:center;margin-bottom:16px;">
      <a href="${SITE_URL}/my-courses.html"
         style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;
                padding:15px 44px;border-radius:10px;font-size:15px;font-weight:800;">
        지금 수강 시작하기 →
      </a>
    </div>
    <p style="margin:0;color:#bbb;font-size:11px;text-align:center;">환불 정책은 강좌 상세 페이지에서 확인하실 수 있습니다.</p>
  `, hero)
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
      <p style="margin:0 0 8px;color:#222;font-size:17px;font-weight:900;">${esc(courseName)}</p>
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
      <p style="margin:0 0 6px;color:${BRAND};font-size:17px;font-weight:800;">${esc(courseTitle)}</p>
      <p style="margin:0 0 28px;color:#666;font-size:13px;line-height:1.7;">아이엠러닝에 새 강좌가 추가됐습니다.<br>지금 바로 확인해보세요!</p>
      <a href="${SITE_URL}/course-detail.html?id=${courseId}" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:15px;font-weight:800;">강좌 보러가기 →</a>
    </div>
  `)
}

function giftHtml(courseName: string, senderName: string, message: string, acceptUrl: string) {
  const who = senderName ? `${esc(senderName)}님이` : '누군가'
  const msgBlock = message
    ? `<div style="background:#f0faf5;border-radius:10px;padding:16px 20px;margin:0 0 24px;color:#333;font-size:14px;line-height:1.7;">${esc(message).replace(/\n/g, '<br>')}</div>`
    : ''
  return base(`
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:48px;margin-bottom:12px;">🎁</div>
      <h1 style="margin:0 0 8px;color:#111;font-size:22px;font-weight:900;">${who} 강의를 선물했어요!</h1>
      <p style="margin:0;color:#666;font-size:14px;">아래 강좌를 무료로 받아보세요.</p>
    </div>
    <div style="border:1px solid #e8e8e8;border-radius:10px;padding:20px;margin-bottom:24px;text-align:center;">
      <p style="margin:0;color:#222;font-size:17px;font-weight:800;">${esc(courseName)}</p>
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
