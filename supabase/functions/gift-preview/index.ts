import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SITE_URL = Deno.env.get('SITE_URL') || "https://juel2414.github.io/imlearning";
const DEFAULT_IMAGE = `${SITE_URL}/images/logo-horizontal.png`;

function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code") || "";
  const realUrl = `${SITE_URL}/gift.html?code=${encodeURIComponent(code)}`;

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  let title = "선물이 도착했어요 🎁";
  let desc = "아이엠러닝에서 강의 선물을 확인해보세요.";
  let image = DEFAULT_IMAGE;

  if (code) {
    try {
      const { data } = await sb.rpc("get_gift_by_code", { p_code: code });
      const g = Array.isArray(data) ? data[0] : data;
      if (g) {
        const who = g.sender_name ? `${g.sender_name}님이` : "누군가";
        title = `${who} 강의를 선물했어요 🎁`;
        desc = g.title ? `${g.title} · 아이엠러닝` : desc;
        if (g.thumbnail_url) image = g.thumbnail_url;
      }
    } catch (_e) {
      // 조회 실패해도 기본값으로 카드는 뜨게 둠
    }
  }

  const html = `<!DOCTYPE html>
<html lang="ko"><head>
<meta charset="utf-8">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(image)}">
<meta property="og:url" content="${esc(realUrl)}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0; url=${esc(realUrl)}">
<title>${esc(title)}</title>
</head><body>
<p>이동 중입니다... <a href="${esc(realUrl)}">여기를 눌러주세요</a></p>
<script>location.href = ${JSON.stringify(realUrl)};</script>
</body></html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
});
