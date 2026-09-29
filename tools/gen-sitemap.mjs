/**
 * sitemap.xml 을 다시 만든다.  실행:  node tools/gen-sitemap.mjs
 *
 * 강좌가 늘거나 공개 상태가 바뀌면 다시 돌려서 커밋하면 된다.
 * 읽기 전용이고, 브라우저가 쓰는 것과 같은 공개 키만 쓴다.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const ORIGIN = 'https://imlearning.co.kr';

// 키는 따로 적어두지 않는다. 브라우저용 파일에서 그대로 읽어 쓴다.
const client = readFileSync(new URL('../js/supabase-client.js', import.meta.url), 'utf8');
const URL_    = client.match(/const SUPABASE_URL\s*=\s*'([^']+)'/)[1];
const ANONKEY = client.match(/const SUPABASE_ANON_KEY\s*=\s*'([^']+)'/)[1];

// 검색에 담을 정적 페이지. 로그인·결제·개인 화면은 여기에 없다.
const PAGES = [
  '',                    // 홈
  'courses.html',
  'about.html',
  'instructor.html',
  'reviews.html',
  'notices.html',
  'resources.html',
  'pass.html',
  'contact.html',
  'terms.html',
];

/** 그 파일이 마지막으로 바뀐 날. 없으면 오늘. */
function lastmodOf(file) {
  if (!file) file = 'index.html';
  try {
    const d = execSync(`git log -1 --format=%cs -- ${file}`, { encoding: 'utf8' }).trim();
    if (d) return d;
  } catch (_) {}
  return new Date().toISOString().slice(0, 10);
}

const res = await fetch(`${URL_}/rest/v1/courses?select=id,created_at&status=eq.active&order=id`, {
  headers: { apikey: ANONKEY, Authorization: `Bearer ${ANONKEY}` },
});
if (!res.ok) throw new Error(`강좌를 못 읽었다: ${res.status} ${await res.text()}`);
const courses = await res.json();

const entries = [
  ...PAGES.map(p => ({ loc: `${ORIGIN}/${p}`, lastmod: lastmodOf(p) })),
  ...courses.map(c => ({
    loc: `${ORIGIN}/course-detail.html?id=${c.id}`,
    lastmod: (c.created_at || '').slice(0, 10),
  })),
];

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  entries.map(e =>
    '  <url>\n' +
    `    <loc>${e.loc.replace(/&/g, '&amp;')}</loc>\n` +
    (e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>\n` : '') +
    '  </url>\n').join('') +
  '</urlset>\n';

writeFileSync(new URL('../sitemap.xml', import.meta.url), xml);
console.log(`sitemap.xml 작성 — 정적 ${PAGES.length}쪽 + 강좌 ${courses.length}개 = ${entries.length}개 주소`);
