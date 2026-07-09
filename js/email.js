// 아이엠러닝 이메일 발송 헬퍼 (Resend + Supabase Edge Function)
(function () {
  const SEND_EMAIL_URL = 'https://lvglkxjzraznwnfilxvy.supabase.co/functions/v1/send-email';

  async function sendEmail(type, data) {
    try {
      const client = window.supabaseClient || (typeof sb !== 'undefined' ? sb : null);
      let token = null;

      // welcome 이메일은 세션 없이도 발송 (가입 직후)
      if (type !== 'welcome' && client) {
        const { data: { session } } = await client.auth.getSession();
        if (!session || !session.access_token) return;
        token = session.access_token;
      }

      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = 'Bearer ' + token;

      fetch(SEND_EMAIL_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ type, data: data || {} }),
      }).catch(function (e) { console.warn('[email] 발송 오류:', e); });
    } catch (e) {
      console.warn('[email] 오류:', e);
    }
  }

  window.sendEmail = sendEmail;
})();
