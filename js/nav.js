// js/nav.js — 공통 네비게이션 v2
// 검색 아이콘, 어드민 메뉴, 로그인 개인화 포함
(function () {
  'use strict';

  // ── CSS 주입 ────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    /* 햄버거 */
    '.nb-ham{display:none;align-items:center;justify-content:center;flex-direction:column;',
    'gap:6px;width:40px;height:40px;background:none;border:none;cursor:pointer;',
    'border-radius:8px;padding:8px;flex-shrink:0;}',
    '.nb-ham span{display:block;width:22px;height:2px;background:var(--black,#111);',
    'border-radius:2px;transition:transform .25s,opacity .25s;}',
    '.nb-ham.open span:nth-child(1){transform:translateY(8px) rotate(45deg);}',
    '.nb-ham.open span:nth-child(2){opacity:0;transform:scaleX(0);}',
    '.nb-ham.open span:nth-child(3){transform:translateY(-8px) rotate(-45deg);}',

    /* 오버레이 */
    '.nb-overlay{display:none;position:fixed;top:0;right:0;bottom:0;left:0;background:rgba(0,0,0,.4);',
    'z-index:89;pointer-events:none;}',
    '.nb-overlay.open{display:block;pointer-events:auto;}',

    /* 검색 버튼 */
    '#nb-search-btn{display:flex;align-items:center;justify-content:center;',
    'width:36px;height:36px;border:none;background:none;cursor:pointer;',
    'border-radius:8px;color:var(--black,#111);flex-shrink:0;font-size:18px;}',
    '#nb-search-btn:hover{background:var(--green-light,#E8F5EE);}',

    /* 검색 드롭다운 */
    '#nb-search-drop{display:none;position:fixed;top:64px;left:0;right:0;',
    'background:#fff;border-bottom:1px solid rgba(0,0,0,.08);',
    'padding:16px;z-index:200;box-shadow:0 8px 24px rgba(0,0,0,.08);}',
    '#nb-search-drop.open{display:flex;gap:8px;align-items:center;}',
    '#nb-search-input{flex:1;padding:11px 16px;border:1.5px solid rgba(0,0,0,.1);',
    'border-radius:10px;font-size:15px;outline:none;font-family:inherit;}',
    '#nb-search-input:focus{border-color:var(--green,#2D9B6F);}',
    '#nb-search-go{padding:11px 20px;background:var(--green,#2D9B6F);color:#fff;',
    'border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;white-space:nowrap;}',
    '#nb-search-close{padding:11px 14px;border:1.5px solid rgba(0,0,0,.1);',
    'border-radius:10px;background:#fff;font-size:14px;cursor:pointer;}',

    /* 모바일 인증 */
    '#nb-mob-auth{display:none;}',

    /* 모바일 반응형 */
    '@media(max-width:768px){',
    '.nb-ham{display:flex;}',
    '.navbar-right{display:none!important;}',
    '#nb-search-btn{display:flex;}',
    '.navbar-menu{',
    'display:flex!important;',
    'position:fixed!important;top:0!important;right:0!important;bottom:0!important;left:auto!important;',
    'width:min(280px,75vw)!important;background:#fff!important;',
    'flex-direction:column!important;align-items:flex-start!important;',
    'padding:72px 12px 32px!important;gap:2px!important;',
    'z-index:90!important;box-shadow:-8px 0 40px rgba(0,0,0,.12)!important;',
    'transform:translateX(100%)!important;',
    'transition:transform .3s cubic-bezier(.4,0,.2,1)!important;',
    'overflow-y:auto!important;margin:0!important;list-style:none!important;}',
    '.navbar-menu.nb-open{transform:translateX(0)!important;}',
    '.navbar-menu li{width:100%!important;}',
    '.navbar-menu li a{display:block!important;padding:11px 16px!important;',
    'font-size:15px!important;border-radius:10px!important;',
    'color:var(--gray-700,#3d3d3d)!important;font-weight:500!important;',
    'transition:background .15s!important;text-decoration:none!important;}',
    '.navbar-menu li a:hover,.navbar-menu li a.active{',
    'background:var(--green-light,#E8F5EE)!important;color:var(--green,#2D9B6F)!important;}',
    '#nb-mob-auth{display:flex!important;flex-direction:column;gap:8px;',
    'width:100%;padding:12px 0;margin-top:8px;',
    'border-top:1px solid rgba(0,0,0,.07);}',
    '#nb-mob-auth a,#nb-mob-auth button{',
    'display:block!important;width:100%!important;text-align:center!important;',
    'padding:12px!important;border-radius:10px!important;',
    'font-size:14px!important;font-weight:700!important;',
    'cursor:pointer!important;text-decoration:none!important;box-sizing:border-box!important;}',
    '#nb-search-drop{top:0;position:sticky;}',
    '}',
  ].join('');
  document.head.appendChild(style);

  // ── 네비 HTML ────────────────────────────────────────────────────
  var navEl = document.createElement('nav');
  navEl.className = 'navbar';
  navEl.id = 'site-navbar';
  navEl.innerHTML = [
    '<div class="navbar-inner">',
    '  <a href="index.html" class="navbar-logo">',
    '    <img src="images/logo-horizontal.png" alt="아이엠러닝" style="height:38px;width:auto;display:block;">',
    '  </a>',
    '  <ul class="navbar-menu" id="nb-menu">',
    '    <li><a href="courses.html">강좌</a></li>',
    '    <li><a href="https://imbooks.kr" target="_blank" rel="noopener">아이엠북스</a></li>',
    '    <li><a href="courses.html?cat=faith">신앙</a></li>',
    '    <li><a href="courses.html?cat=edu">교사·부모</a></li>',
    '    <li><a href="courses.html?cat=mission">캠프·사역</a></li>',
    '    <li><a href="courses.html?cat=english">영어·시험</a></li>',
    '    <li><a href="courses.html?cat=freepass">전강좌 무제한</a></li>',
    '    <li><a href="notices.html">공지사항</a></li>',
    '    <li><a href="about.html">소개</a></li>',
    '    <li id="nb-admin-li" style="display:none"><a href="admin/index.html" style="color:#2D9B6F!important;font-weight:700!important;">어드민</a></li>',
    '    <li id="nb-mob-auth-li"><div id="nb-mob-auth">',
    '      <a href="login.html" class="btn btn-outline btn-sm">로그인</a>',
    '      <a href="signup.html" class="btn btn-primary btn-sm">회원가입</a>',
    '    </div></li>',
    '  </ul>',
    '  <button id="nb-search-btn" aria-label="검색">🔍</button>',
    '  <div class="navbar-right" id="nb-right">',
    '    <a href="login.html" class="btn btn-outline btn-sm">로그인</a>',
    '    <a href="signup.html" class="btn btn-primary btn-sm">회원가입</a>',
    '  </div>',
    '  <button class="nb-ham" id="nb-ham" aria-label="메뉴 열기">',
    '    <span></span><span></span><span></span>',
    '  </button>',
    '</div>',
    /* 검색 드롭다운 */
    '<div id="nb-search-drop">',
    '  <input id="nb-search-input" type="search" placeholder="강좌, 강사, 키워드 검색..." autocomplete="off">',
    '  <button id="nb-search-go">검색</button>',
    '  <button id="nb-search-close">✕</button>',
    '</div>',
    '<div class="nb-overlay" id="nb-overlay"></div>',
  ].join('');

  // ── 기존 네비 교체 ────────────────────────────────────────────────
  var existingNav     = document.querySelector('nav.navbar');
  var existingLogoBar = document.querySelector('.top-logo-bar');
  if (existingNav) {
    existingNav.parentNode.replaceChild(navEl, existingNav);
  } else if (existingLogoBar) {
    existingLogoBar.parentNode.replaceChild(navEl, existingLogoBar);
  } else {
    document.body.insertBefore(navEl, document.body.firstChild);
  }

  // ── 검색 동작 ─────────────────────────────────────────────────────
  var searchBtn   = document.getElementById('nb-search-btn');
  var searchDrop  = document.getElementById('nb-search-drop');
  var searchInput = document.getElementById('nb-search-input');
  var searchGo    = document.getElementById('nb-search-go');
  var searchClose = document.getElementById('nb-search-close');

  function doSearch() {
    var q = searchInput.value.trim();
    if (q) window.location.href = 'search.html?q=' + encodeURIComponent(q);
  }

  searchBtn.addEventListener('click', function () {
    searchDrop.classList.toggle('open');
    if (searchDrop.classList.contains('open')) searchInput.focus();
  });
  searchClose.addEventListener('click', function () {
    searchDrop.classList.remove('open');
    searchInput.value = '';
  });
  searchGo.addEventListener('click', doSearch);
  searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') doSearch();
    if (e.key === 'Escape') { searchDrop.classList.remove('open'); searchInput.value = ''; }
  });

  // ── 햄버거 동작 ───────────────────────────────────────────────────
  var ham     = document.getElementById('nb-ham');
  var menu    = document.getElementById('nb-menu');
  var overlay = document.getElementById('nb-overlay');

  function openMenu()  {
    menu.classList.add('nb-open');
    ham.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    menu.classList.remove('nb-open');
    ham.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  ham.addEventListener('click', function () {
    if (menu.classList.contains('nb-open')) closeMenu(); else openMenu();
  });
  overlay.addEventListener('click', closeMenu);
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  // ── 현재 페이지 활성화 ────────────────────────────────────────────
  var curPath   = (window.location.pathname.split('/').pop() || 'index.html');
  var curSearch = window.location.search;

  menu.querySelectorAll('a').forEach(function (a) {
    var href    = a.getAttribute('href') || '';
    var hPath   = href.split('?')[0];
    var hSearch = href.includes('?') ? href.slice(href.indexOf('?')) : '';
    if (hPath === curPath && (!hSearch || hSearch === curSearch)) a.classList.add('active');
    if (hPath === 'courses.html' && !hSearch && curPath === 'course-detail.html') a.classList.add('active');
  });

  // ── 로그아웃 (전역) ───────────────────────────────────────────────
  window.navLogout = function () {
    var sb = window.supabaseClient;
    if (sb) sb.auth.signOut().then(function () { window.location.href = 'index.html'; });
    else window.location.href = 'index.html';
  };

  // ── 관리자 바 (WordPress 스타일) ──────────────────────────────────
  var AB_ID = 'im-admin-bar';

  function getContextLinks() {
    var path   = window.location.pathname.split('/').pop() || 'index.html';
    var params = new URLSearchParams(window.location.search);
    var id     = params.get('id');
    var links  = [];
    if (path === 'index.html' || path === '') {
      links = [
        { label: '🖼️ 배너 편집',   href: 'admin/banners.html' },
        { label: '🏠 랜딩 편집',   href: 'admin/landing.html' },
      ];
    } else if (path === 'courses.html') {
      links = [{ label: '+ 새 강좌', href: 'admin/courses.html' }];
    } else if (path === 'course-detail.html' && id) {
      links = [{ label: '✏️ 이 강좌 편집', href: 'admin/courses.html?edit=' + id }];
    } else if (path === 'about.html' || path === 'contact.html') {
      links = [{ label: '⚙️ 사이트 설정', href: 'admin/settings.html' }];
    }
    return links;
  }

  function buildAdminBar() {
    if (document.getElementById(AB_ID)) return;

    // CSS
    var abStyle = document.createElement('style');
    abStyle.textContent = [
      '#im-admin-bar{position:fixed;top:0;left:0;right:0;height:36px;',
      'background:#1a1a1a;color:rgba(255,255,255,.75);',
      'display:flex;align-items:center;justify-content:space-between;',
      'padding:0 14px;z-index:9999;font-size:12px;gap:8px;box-sizing:border-box;}',
      '#im-admin-bar a,#im-admin-bar button{',
      'color:rgba(255,255,255,.75);text-decoration:none;',
      'padding:3px 9px;border-radius:4px;border:none;background:none;',
      'cursor:pointer;font-size:12px;font-family:inherit;white-space:nowrap;}',
      '#im-admin-bar a:hover,#im-admin-bar button:hover{color:#fff;background:rgba(255,255,255,.12);}',
      '.ab-left,.ab-right{display:flex;align-items:center;gap:2px;}',
      '.ab-brand{color:#2D9B6F!important;font-weight:800!important;padding:3px 10px 3px 4px!important;',
      'border-right:1px solid rgba(255,255,255,.12)!important;margin-right:4px!important;}',
      '.ab-divider{width:1px;height:14px;background:rgba(255,255,255,.15);margin:0 4px;}',
      '.ab-ctx{color:#fff!important;background:rgba(45,155,111,.25)!important;}',
      '.ab-ctx:hover{background:rgba(45,155,111,.45)!important;}',
      'body.has-admin-bar{padding-top:36px;}',
      'body.has-admin-bar .navbar,body.has-admin-bar #site-navbar{top:36px!important;}',
      '@media(max-width:768px){.ab-right .ab-hide-m{display:none;}}',
    ].join('');
    document.head.appendChild(abStyle);

    var ctxLinks = getContextLinks();
    var ctxHtml  = ctxLinks.map(function (l) {
      return '<a href="' + l.href + '" class="ab-ctx">' + l.label + '</a>';
    }).join('');

    var bar = document.createElement('div');
    bar.id  = AB_ID;
    bar.innerHTML =
      '<div class="ab-left">' +
        '<span class="ab-brand">⚙️ 관리자</span>' +
        ctxHtml +
      '</div>' +
      '<div class="ab-right">' +
        '<a href="admin/courses.html" class="ab-hide-m">강좌 추가</a>' +
        '<a href="admin/notices.html" class="ab-hide-m">공지 추가</a>' +
        '<a href="admin/students.html" class="ab-hide-m">수강생</a>' +
        '<div class="ab-divider ab-hide-m"></div>' +
        '<a href="admin/index.html" style="color:#2D9B6F!important;font-weight:700;">대시보드</a>' +
        '<button onclick="navLogout()" style="color:#ff6b6b!important;">로그아웃</button>' +
      '</div>';

    document.body.insertBefore(bar, document.body.firstChild);
    document.body.classList.add('has-admin-bar');
  }

  function destroyAdminBar() {
    var bar = document.getElementById(AB_ID);
    if (bar) bar.remove();
    document.body.classList.remove('has-admin-bar');
  }

  // ── 네비 인증 상태 갱신 ─────────────────────────────────────────
  function updateAuth(user, isAdmin) {
    var right   = document.getElementById('nb-right');
    var mobAuth = document.getElementById('nb-mob-auth');
    var adminLi = document.getElementById('nb-admin-li');

    if (adminLi) adminLi.style.display = isAdmin ? '' : 'none';

    // 관리자 바
    if (isAdmin) buildAdminBar();
    else destroyAdminBar();

    if (user) {
      if (right) right.innerHTML =
        '<a href="my-courses.html" class="btn btn-outline btn-sm" style="color:var(--green);border-color:var(--green);">나의 강의실</a>' +
        '<button class="btn btn-primary btn-sm" onclick="navLogout()">로그아웃</button>';
      if (mobAuth) mobAuth.innerHTML =
        '<a href="my-courses.html" class="btn btn-outline btn-sm">나의 강의실</a>' +
        (isAdmin ? '<a href="admin/index.html" class="btn btn-outline btn-sm">어드민</a>' : '') +
        '<button class="btn btn-primary btn-sm" onclick="navLogout()">로그아웃</button>';
    } else {
      var out =
        '<a href="login.html" class="btn btn-outline btn-sm">로그인</a>' +
        '<a href="signup.html" class="btn btn-primary btn-sm">회원가입</a>';
      if (right)   right.innerHTML   = out;
      if (mobAuth) mobAuth.innerHTML = out;
    }
  }

  // ── onAuthStateChange: 초기 세션 + 이후 상태 변경 모두 처리 ─
  // INITIAL_SESSION 이벤트로 로컬 저장 세션을 즉시 읽으므로
  // getUser() 네트워크 요청 없이 빠르게 로그인 상태를 반영함
  function initAuth() {
    var sb = window.supabaseClient;
    if (!sb) { setTimeout(initAuth, 30); return; }

    sb.auth.onAuthStateChange(function (event, session) {
      var user = session ? session.user : null;
      updateAuth(user, false); // admin 확인 전 즉시 렌더
      if (user) {
        sb.from('profiles').select('role').eq('id', user.id).maybeSingle()
          .then(function (res) {
            var isAdmin = !!(res.data && res.data.role === 'admin');
            updateAuth(user, isAdmin);
          })
          .catch(function () {});
      }
    });
  }

  initAuth();
})();
