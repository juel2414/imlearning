// js/admin-nav.js — 어드민 공통 사이드바 v1
// 모든 어드민 페이지에서 로드. 기존 사이드바를 숨기고 고정형 공통 사이드바로 교체.
(function () {
  'use strict';

  var cur = window.location.pathname.split('/').pop() || 'index.html';
  if (cur && !cur.includes('.')) cur += '.html';

  var MENUS = [
    { type: 'section', label: '메인' },
    { href: 'index.html',       icon: '📊', label: '대시보드' },
    { type: 'section', label: '강좌 관리' },
    { href: 'courses.html',     icon: '📚', label: '강좌 관리' },
    { href: 'instructors.html', icon: '👨‍🏫', label: '강사 관리' },
    { type: 'section', label: '프로모션' },
    { href: 'promotions.html',  icon: '🎯', label: '프로모션 관리' },
    { type: 'section', label: '콘텐츠' },
    { href: 'notices.html',     icon: '📢', label: '공지사항' },
    { href: 'banners.html',     icon: '🖼️', label: '배너 관리' },
    { href: 'landing.html',     icon: '🏠', label: '랜딩 빌더' },
    { href: 'theme.html',       icon: '🎨', label: '테마 관리' },
    { type: 'section', label: '설정' },
    { href: 'settings.html',    icon: '⚙️', label: '사이트 설정' },
    { href: '../index.html',    icon: '🌐', label: '사이트 보기', blank: true },
    { type: 'logout',           icon: '🚪', label: '로그아웃' },
  ];

  // ── CSS 주입 ──────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    /* 기존 사이드바/햄버거 숨기기 */
    'aside.sidebar,aside.admin-sidebar,nav.sidebar{display:none!important;}',
    '.menu-btn{display:none!important;}',
    /* admin-main 기존 margin-left 초기화 */
    '.admin-main{margin-left:0!important;}',
    /* body 왼쪽 여백 — 고정 사이드바 공간 */
    'body{padding-left:220px;}',

    /* ── 사이드바 본체 ── */
    '#an-sb{position:fixed;top:0;left:0;width:220px;height:100vh;',
    'background:#111318;color:#fff;overflow-y:auto;z-index:300;',
    'display:flex;flex-direction:column;',
    'transform:translateX(0);transition:transform .25s;}',

    /* 로고 */
    '#an-logo{padding:24px 20px;border-bottom:1px solid rgba(255,255,255,.08);flex-shrink:0;}',
    '#an-logo-txt{font-size:16px;font-weight:800;white-space:nowrap;}',
    '#an-logo-txt span{color:#2D9B6F;}',
    '#an-logo-sub{font-size:10px;color:rgba(255,255,255,.35);margin-top:4px;}',

    /* 섹션 제목 */
    '.an-sec{padding:16px 20px 6px;font-size:10px;font-weight:700;',
    'color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:1px;white-space:nowrap;}',

    /* 메뉴 아이템 */
    '.an-item{display:flex;align-items:center;gap:10px;padding:10px 20px;',
    'font-size:13px;color:rgba(255,255,255,.65);white-space:nowrap;',
    'text-decoration:none;cursor:pointer;border:none;background:none;',
    'width:100%;text-align:left;box-sizing:border-box;font-family:inherit;}',
    '.an-item:hover{background:rgba(255,255,255,.06);color:#fff;}',
    '.an-item.active{background:rgba(45,155,111,.15);color:#2D9B6F;font-weight:600;}',

    /* 햄버거 버튼 (모바일만) */
    '#an-ham{display:none;position:fixed;top:14px;left:14px;z-index:350;',
    'width:38px;height:38px;border-radius:8px;background:#111318;color:#fff;',
    'border:none;font-size:16px;cursor:pointer;align-items:center;justify-content:center;}',

    /* 어두운 오버레이 */
    '#an-ov{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:299;}',
    '#an-ov.open{display:block;}',

    /* 모바일 */
    '@media(max-width:768px){',
    '#an-sb{transform:translateX(-100%);}',
    '#an-sb.open{transform:translateX(0);}',
    '#an-ham{display:flex;}',
    'body{padding-left:0!important;}',
    '}',
  ].join('');
  document.head.appendChild(style);

  // ── 사이드바 HTML 빌드 ────────────────────────────────────────────
  var html = [
    '<div id="an-logo">',
    '<div id="an-logo-txt">아이엠<span>러닝</span></div>',
    '<div id="an-logo-sub">관리자 페이지</div>',
    '</div>',
  ].join('');

  MENUS.forEach(function (m) {
    if (m.type === 'section') {
      html += '<div class="an-sec">' + m.label + '</div>';
    } else if (m.type === 'logout') {
      html += '<button class="an-item" id="an-logout">' + m.icon + ' ' + m.label + '</button>';
    } else {
      var active = (m.href === cur) ? ' active' : '';
      var target = m.blank ? ' target="_blank"' : '';
      html += '<a href="' + m.href + '" class="an-item' + active + '"' + target + '>' + m.icon + ' ' + m.label + '</a>';
    }
  });

  // ── DOM 삽입 ──────────────────────────────────────────────────────
  var sb  = document.createElement('aside');
  sb.id   = 'an-sb';
  sb.innerHTML = html;

  var ham = document.createElement('button');
  ham.id  = 'an-ham';
  ham.textContent = '☰';
  ham.setAttribute('aria-label', '메뉴 열기');

  var ov = document.createElement('div');
  ov.id  = 'an-ov';

  // body 맨 앞에 순서대로 삽입
  var ref = document.body.firstChild;
  document.body.insertBefore(sb,  ref);
  document.body.insertBefore(ham, ref);
  document.body.insertBefore(ov,  ref);

  // ── 햄버거 열기/닫기 ──────────────────────────────────────────────
  function openSb()  {
    sb.classList.add('open');
    ov.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeSb() {
    sb.classList.remove('open');
    ov.classList.remove('open');
    document.body.style.overflow = '';
  }

  ham.addEventListener('click', openSb);
  ov.addEventListener('click',  closeSb);
  sb.querySelectorAll('a.an-item').forEach(function (a) {
    a.addEventListener('click', closeSb);
  });

  // ── 로그아웃 ──────────────────────────────────────────────────────
  var logoutBtn = document.getElementById('an-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      sessionStorage.removeItem('admin_auth');
      window.location.href = 'login.html';
    });
  }
})();
