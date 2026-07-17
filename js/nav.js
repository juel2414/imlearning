// js/nav.js — 공통 네비게이션 v3 (미니멀 셀렉트샵 스타일)
(function () {
  'use strict';

  // ── CSS 주입 ────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    /* 스크롤 그림자 */
    '#site-navbar{transition:box-shadow .25s;}',
    '#site-navbar.scrolled{box-shadow:0 1px 8px rgba(0,0,0,.04)!important;}',

    /* 메뉴 간격·글꼴 — 절제된 톤 */
    '.navbar-menu{gap:2.5rem!important;}',
    '.navbar-menu>li>a{font-size:14px!important;font-weight:400!important;',
    'color:#333!important;transition:color .12s,font-weight .12s!important;',
    'text-decoration:none!important;}',
    '.navbar-menu>li>a:hover,.navbar-menu>li>a.active{',
    'font-weight:700!important;color:#111!important;}',
    /* 전강좌 무제한 */
    '.navbar-menu>li>a.nb-pass{color:var(--green,#2D9B6F)!important;font-weight:600!important;}',
    '.navbar-menu>li>a.nb-pass:hover{font-weight:700!important;}',

    /* 햄버거 */
    '.nb-ham{display:none;align-items:center;justify-content:center;flex-direction:column;',
    'gap:5px;width:40px;height:40px;background:none;border:none;cursor:pointer;',
    'border-radius:8px;padding:8px;flex-shrink:0;}',
    '.nb-ham span{display:block;width:20px;height:1.5px;background:#333;',
    'border-radius:2px;transition:transform .25s,opacity .25s;}',
    '.nb-ham.open span:nth-child(1){transform:translateY(6.5px) rotate(45deg);}',
    '.nb-ham.open span:nth-child(2){opacity:0;transform:scaleX(0);}',
    '.nb-ham.open span:nth-child(3){transform:translateY(-6.5px) rotate(-45deg);}',

    /* 오버레이 */
    '.nb-overlay{display:none;position:fixed;top:0;right:0;bottom:0;left:0;',
    'background:rgba(0,0,0,.25);z-index:89;pointer-events:none;}',
    '.nb-overlay.open{display:block;pointer-events:auto;}',

    /* 검색 버튼 */
    '#nb-search-btn{display:flex;align-items:center;justify-content:center;',
    'width:36px;height:36px;border:none;background:none;cursor:pointer;',
    'border-radius:8px;color:#444;flex-shrink:0;font-size:17px;}',
    '#nb-search-btn:hover{background:#f5f5f5;}',

    /* 검색 드롭다운 */
    '#nb-search-drop{display:none;position:fixed;top:64px;left:0;right:0;',
    'background:#fff;border-bottom:1px solid rgba(0,0,0,.06);',
    'padding:16px;z-index:200;box-shadow:0 4px 16px rgba(0,0,0,.06);}',
    '#nb-search-drop.open{display:flex;gap:8px;align-items:center;}',
    '#nb-search-input{flex:1;padding:11px 16px;border:1px solid rgba(0,0,0,.1);',
    'border-radius:10px;font-size:15px;outline:none;font-family:inherit;}',
    '#nb-search-input:focus{border-color:var(--green,#2D9B6F);}',
    '#nb-search-go{padding:11px 20px;background:var(--green,#2D9B6F);color:#fff;',
    'border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;white-space:nowrap;}',
    '#nb-search-close{padding:11px 14px;border:1px solid rgba(0,0,0,.1);',
    'border-radius:10px;background:#fff;font-size:14px;cursor:pointer;}',

    /* 모바일 인증 */
    '#nb-mob-auth{display:none;}',

    /* 드롭다운 공통 (사용자 메뉴 등) */
    '.nb-dropdown{position:relative;}',
    '.nb-dd-menu{display:none;position:absolute;top:calc(100% + 10px);left:50%;',
    'transform:translateX(-50%);background:#fff;border-radius:14px;',
    'box-shadow:0 4px 20px rgba(0,0,0,.08);',
    'padding:6px;min-width:160px;z-index:200;border:1px solid rgba(0,0,0,.06);}',
    '.nb-dropdown:hover .nb-dd-menu{display:block;}',
    '.nb-dd-menu a{display:block!important;padding:9px 14px!important;border-radius:8px!important;',
    'font-size:13px!important;font-weight:400!important;',
    'color:#333!important;text-decoration:none!important;',
    'transition:background .1s!important;white-space:nowrap!important;}',
    '.nb-dd-menu a:hover{background:#f5f5f5!important;color:#111!important;}',
    '.nb-dd-divider{height:1px;background:rgba(0,0,0,.06);margin:5px 6px;}',
    '.nb-dd-label{padding:5px 14px 3px;font-size:11px;font-weight:600;',
    'color:#bbb;text-transform:uppercase;letter-spacing:.06em;',
    'display:block;pointer-events:none;}',
    '.nb-caret{font-size:9px;margin-left:2px;display:inline-block;',
    'transition:transform .2s;opacity:.4;}',
    '.nb-dropdown:hover .nb-caret{transform:rotate(180deg);opacity:.7;}',
    '.nb-dropdown::after{content:"";position:absolute;top:100%;left:-20px;right:-20px;height:14px;}',

    /* ── 강좌 메가메뉴 (데스크톱) ─────────────────────────── */
    '.nb-mega-menu{',
    'display:none;position:fixed;top:64px;',
    'left:50%;transform:translateX(-50%);background:#fff;border-radius:16px;',
    'box-shadow:0 4px 20px rgba(0,0,0,.06);',
    'border:1px solid rgba(0,0,0,.05);z-index:200;',
    'padding:28px 36px;width:min(96vw,1300px);}',
    '.nb-dropdown.mega-open .nb-mega-menu{',
    'display:grid;grid-template-columns:repeat(6,minmax(130px,1fr));gap:0;',
    'animation:megaFadeIn .18s ease-out both;}',
    '@keyframes megaFadeIn{',
    'from{opacity:0;transform:translateX(-50%) translateY(-4px)}',
    'to{opacity:1;transform:translateX(-50%) translateY(0)}}',

    /* 썸네일 */
    '.mega-col-thumb{display:block;width:100%;height:78px;',
    'background:#f4f4f4;border-radius:8px;overflow:hidden;',
    'margin-bottom:14px;text-decoration:none;}',
    '.mega-col-thumb img{width:100%;height:100%;object-fit:cover;display:block;',
    'transition:transform .3s ease;}',
    '.mega-col-thumb:hover img{transform:scale(1.04);}',

    /* 카테고리 열 */
    '.mega-col{display:flex;flex-direction:column;gap:0;padding:0 28px;}',
    '.mega-col:first-child{padding-left:0;}',
    '.mega-col:last-child{padding-right:0;}',
    '.mega-col:not(:first-child){border-left:1px solid rgba(0,0,0,.06);}',

    /* 카테고리 라벨 (절제된, 회색) */
    '.mega-col-title{font-size:11px!important;font-weight:600!important;',
    'color:#aaa!important;letter-spacing:0.5px!important;',
    'display:block!important;padding:0 0 10px!important;',
    'border-bottom:1px solid rgba(0,0,0,.06)!important;',
    'margin-bottom:2px!important;text-decoration:none!important;',
    'border-radius:0!important;transition:color .12s!important;',
    'text-transform:uppercase!important;}',
    '.mega-col-title::before{content:"●";color:#2D9B6F;',
    'font-size:8px;margin-right:5px;vertical-align:1px;}',
    '.mega-col-title:hover{color:#777!important;}',

    /* 서브 라벨 */
    '.mega-col-sublabel{font-size:10px!important;font-weight:700!important;',
    'color:#ddd!important;text-transform:uppercase!important;',
    'letter-spacing:.08em!important;padding:10px 0 2px!important;',
    'display:block!important;pointer-events:none!important;}',

    /* 하위 항목 — 여백과 절제 */
    '.mega-col-items{display:flex;flex-direction:column;gap:0;}',
    '.mega-col a:not(.mega-col-title):not(.mega-col-thumb){',
    'font-size:13px!important;color:#222!important;font-weight:400!important;',
    'text-decoration:none!important;padding:0!important;border-radius:0!important;',
    'display:block!important;line-height:1.9!important;',
    'transition:color .12s!important;white-space:nowrap!important;',
    'overflow:hidden!important;text-overflow:ellipsis!important;',
    'background:transparent!important;}',
    '.mega-col a:not(.mega-col-title):not(.mega-col-thumb):hover{',
    'color:var(--green,#2D9B6F)!important;',
    'text-decoration:underline!important;text-underline-offset:2px!important;',
    'text-decoration-thickness:1px!important;background:transparent!important;}',

    /* 아코디언 버튼 데스크톱에선 숨김 */
    '.mega-acc-btn{display:none;}',

    /* 모바일 반응형 */
    '@media(max-width:768px){',
    '.nb-ham{display:flex;}',
    '.navbar-right{display:none!important;}',
    '#nb-search-btn{display:flex;}',
    '.navbar-menu{',
    'display:flex!important;',
    'position:fixed!important;top:0!important;right:0!important;bottom:0!important;left:auto!important;',
    'width:min(300px,82vw)!important;background:#fff!important;',
    'flex-direction:column!important;align-items:flex-start!important;',
    'padding:72px 0 32px!important;gap:0!important;',
    'z-index:90!important;box-shadow:-4px 0 24px rgba(0,0,0,.08)!important;',
    'transform:translateX(100%)!important;',
    'transition:transform .28s cubic-bezier(.4,0,.2,1)!important;',
    'overflow-y:auto!important;margin:0!important;list-style:none!important;}',
    '.navbar-menu.nb-open{transform:translateX(0)!important;}',
    '.navbar-menu li{width:100%!important;}',
    /* 일반 메뉴 항목 */
    '.navbar-menu>li>a{',
    'display:block!important;padding:13px 24px!important;',
    'font-size:14px!important;font-weight:400!important;',
    'color:#333!important;border-bottom:1px solid rgba(0,0,0,.05)!important;',
    'border-radius:0!important;transition:color .12s!important;}',
    '.navbar-menu>li>a:hover,.navbar-menu>li>a.active{',
    'color:#111!important;font-weight:600!important;background:transparent!important;}',
    '#nb-mob-auth{display:flex!important;flex-direction:column;gap:8px;',
    'width:100%;padding:16px 24px;margin-top:4px;}',
    '#nb-mob-auth a,#nb-mob-auth button{',
    'display:block!important;width:100%!important;text-align:center!important;',
    'padding:12px!important;border-radius:10px!important;',
    'font-size:14px!important;font-weight:600!important;',
    'cursor:pointer!important;text-decoration:none!important;box-sizing:border-box!important;}',
    '#nb-search-drop{top:0;position:sticky;}',
    /* 모바일 메가메뉴: 세로 아코디언 */
    '.nb-mega-menu{display:block!important;position:static!important;',
    'transform:none!important;box-shadow:none!important;border:none!important;',
    'background:transparent!important;padding:0!important;',
    'border-radius:0!important;min-width:auto!important;animation:none!important;}',
    '.mega-col-thumb{display:none!important;}',
    '.mega-col{border-bottom:1px solid rgba(0,0,0,.05)!important;',
    'padding:0!important;border-left:none!important;}',
    /* 모바일 카테고리 제목: 터치 영역 넉넉하게, 얇은 글씨 */
    '.mega-col-title{',
    'padding:13px 24px!important;font-size:13px!important;font-weight:500!important;',
    'color:#555!important;letter-spacing:0!important;text-transform:none!important;',
    'border-bottom:none!important;margin-bottom:0!important;',
    'display:flex!important;justify-content:space-between!important;',
    'align-items:center!important;border-radius:0!important;',
    'transition:color .12s!important;}',
    '.mega-col-title::before{display:none!important;}',
    '.mega-col-title::after{content:"▾";font-size:11px;color:#ccc;',
    'transition:transform .2s;flex-shrink:0;}',
    '.mega-col.open .mega-col-title{color:#111!important;font-weight:600!important;}',
    '.mega-col.open .mega-col-title::after{transform:rotate(180deg);}',
    '.mega-col-items{display:none!important;flex-direction:column!important;',
    'padding:0 0 8px 24px!important;}',
    '.mega-col.open .mega-col-items{display:flex!important;}',
    '.mega-col a:not(.mega-col-title):not(.mega-col-thumb){',
    'padding:10px 0!important;font-size:14px!important;line-height:1.5!important;',
    'border-radius:0!important;white-space:normal!important;',
    'border-bottom:1px solid rgba(0,0,0,.04)!important;}',
    '.mega-col a:not(.mega-col-title):not(.mega-col-thumb):last-child{border-bottom:none!important;}',
    '.mega-col-sublabel{padding:6px 0 2px!important;font-size:10px!important;color:#ccc!important;}',
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
    '    <li class="nb-dropdown">',
    '      <a href="courses.html">강좌 <span class="nb-caret">▾</span></a>',
    '      <div class="nb-mega-menu" id="nb-mega-body">',
    '      </div>',
    '    </li>',
    '    <li><a href="pass.html" class="nb-pass">전강좌 무제한</a></li>',
    '    <li><a href="https://imbooks.kr" target="_blank" rel="noopener">아이엠북스</a></li>',
    '    <li><a href="notices.html">공지사항</a></li>',
    '    <li><a href="reviews.html">후기</a></li>',
    '    <li><a href="about.html">소개</a></li>',
    '    <li id="nb-admin-li" style="display:none"><a href="admin/index.html" style="color:#2D9B6F!important;font-weight:600!important;">어드민</a></li>',
    '    <li id="nb-mob-auth-li"><div id="nb-mob-auth">',
    '      <a href="login.html" class="btn btn-outline btn-sm">로그인</a>',
    '      <a href="signup.html" class="btn btn-primary btn-sm">회원가입</a>',
    '    </div></li>',
    '  </ul>',
    '  <button id="nb-search-btn" aria-label="검색"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" stroke-width="1.8"/><line x1="11.5" y1="11.5" x2="16" y2="16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>',
    '  <div class="navbar-right" id="nb-right">',
    '    <a href="login.html" class="btn btn-outline btn-sm">로그인</a>',
    '    <a href="signup.html" class="btn btn-primary btn-sm">회원가입</a>',
    '  </div>',
    '  <button class="nb-ham" id="nb-ham" aria-label="메뉴 열기">',
    '    <span></span><span></span><span></span>',
    '  </button>',
    '</div>',
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

  // ── 스크롤 그림자 ─────────────────────────────────────────────────
  window.addEventListener('scroll', function () {
    navEl.classList.toggle('scrolled', window.scrollY > 0);
  }, { passive: true });

  // ── HTML 이스케이프 (XSS 방어) ──────────────────────────────────────
  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── 메가메뉴 동적 로드 (subcategory 기준 6열) ────────────────────
  var MEGA_CATS = [
    { key: 'faith',          label: '신앙',          catParam: 'faith' },
    { key: 'school_subject', label: '학교교과',      catParam: 'school',  badge: '인기', badgeColor: '#C6860B' },
    { key: 'ged',            label: '검정고시',      catParam: 'ged',     badge: 'NEW',  badgeColor: '#2D9B6F' },
    { key: 'teacher_parent', label: '부모·교사',     catParam: 'edu',     badge: '추천', badgeColor: '#2D9B6F' },
    { key: 'english_test',   label: '영어',          catParam: 'english' },
    { key: 'freepass',       label: '전강좌 무제한', catParam: 'freepass' },
  ];

  function loadMegaCourses() {
    var sb = window.supabaseClient;
    if (!sb) { setTimeout(loadMegaCourses, 100); return; }
    var body = document.getElementById('nb-mega-body');
    if (!body) return;
    sb.from('courses')
      .select('id,title,subcategory,thumbnail_url')
      .not('subcategory', 'is', null)
      .eq('status', 'active')
      .order('students', { ascending: false })
      .then(function (res) {
        if (!res.data) return;
        // group by subcategory
        var groups = {};
        MEGA_CATS.forEach(function (c) { groups[c.key] = []; });
        res.data.forEach(function (course) {
          if (groups[course.subcategory]) groups[course.subcategory].push(course);
        });

        var html = '';
        MEGA_CATS.forEach(function (cat) {
          var courses = groups[cat.key] || [];
          var items = courses.map(function (c) {
            return '<a href="course-detail.html?id=' + c.id + '">' + esc(c.title) + '</a>';
          }).join('');
          // thumbnail: first course image
          var thumbUrl = courses.length && courses[0].thumbnail_url ? courses[0].thumbnail_url : '';
          var catHref = 'courses.html?cat=' + (cat.catParam || 'all');
          var thumbHtml = thumbUrl
            ? '<a href="' + catHref + '" class="mega-col-thumb">' +
              '<img src="' + esc(thumbUrl) + '" alt=""></a>'
            : '<a href="' + catHref + '" class="mega-col-thumb" style="background:#f0f0f0;"></a>';
          var badgeHtml = cat.badge
            ? '<span class="mega-cat-badge" style="background:' + cat.badgeColor + '">' + cat.badge + '</span>'
            : '';
          html += '<div class="mega-col">' +
            thumbHtml +
            '<a href="' + catHref + '" class="mega-col-title">' + cat.label + badgeHtml + '</a>' +
            '<div class="mega-col-items">' + items + '</div>' +
            '</div>';
        });
        body.innerHTML = html;
      })
      .catch(function () {});
  }
  loadMegaCourses();

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
  menu.querySelectorAll('a:not(.mega-col-title)').forEach(function (a) { a.addEventListener('click', closeMenu); });

  // ── 메가메뉴 데스크톱 hover ──────────────────────────────────────────
  var ddItem = menu.querySelector('.nb-dropdown');
  var leaveTimer;
  if (ddItem) {
    ddItem.addEventListener('mouseenter', function () {
      clearTimeout(leaveTimer);
      if (window.innerWidth > 768) ddItem.classList.add('mega-open');
    });
    ddItem.addEventListener('mouseleave', function () {
      leaveTimer = setTimeout(function () { ddItem.classList.remove('mega-open'); }, 80);
    });
    var megaMenu = ddItem.querySelector('.nb-mega-menu');
    if (megaMenu) {
      megaMenu.addEventListener('mouseenter', function () { clearTimeout(leaveTimer); });
      megaMenu.addEventListener('mouseleave', function () {
        leaveTimer = setTimeout(function () { ddItem.classList.remove('mega-open'); }, 80);
      });
    }
  }

  // ── 메가메뉴 모바일 아코디언 (이벤트 위임) ────────────────────────
  menu.addEventListener('click', function (e) {
    var titleLink = e.target.closest('.mega-col-title');
    if (!titleLink) return;
    if (window.innerWidth > 768) return;
    var col = titleLink.closest('.mega-col');
    if (col.classList.contains('open')) {
      col.classList.remove('open');
      return;
    }
    e.preventDefault();
    menu.querySelectorAll('.mega-col.open').forEach(function (c) { c.classList.remove('open'); });
    col.classList.add('open');
  });

  // ── 현재 페이지 활성화 ────────────────────────────────────────────
  var curPath   = (window.location.pathname.split('/').pop() || 'index.html');
  var curSearch = window.location.search;

  menu.querySelectorAll('a').forEach(function (a) {
    var href    = a.getAttribute('href') || '';
    var hPath   = href.split('?')[0];
    var hSearch = href.includes('?') ? href.slice(href.indexOf('?')) : '';
    if (hPath === curPath && (!hSearch || hSearch === curSearch)) a.classList.add('active');
    if (hPath === 'courses.html' && !hSearch && curPath === 'course-detail.html') a.classList.add('active');
    if (curPath === 'courses.html' && hPath === 'courses.html' && hSearch) {
      var hp = new URLSearchParams(hSearch);
      var cp = new URLSearchParams(curSearch);
      if (hp.get('subcategory') && hp.get('subcategory') === cp.get('subcategory')) {
        a.classList.add('active');
      }
      if (hp.get('cat') && hp.get('cat') === cp.get('cat') && !hp.get('sub')) {
        a.classList.add('active');
      }
    }
  });

  // ── 로그아웃 (전역) ───────────────────────────────────────────────
  window.navLogout = function () {
    var sb = window.supabaseClient;
    if (sb) sb.auth.signOut().then(function () { window.location.href = 'index.html'; });
    else window.location.href = 'index.html';
  };

  // ── 관리자 바 ────────────────────────────────────────────────────
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
      links = [{ label: '✏️ 이 강좌 편집', href: 'admin/courses.html?edit=' + encodeURIComponent(id) }];
    } else if (path === 'about.html' || path === 'contact.html') {
      links = [{ label: '⚙️ 사이트 설정', href: 'admin/settings.html' }];
    }
    return links;
  }

  function buildAdminBar() {
    if (document.getElementById(AB_ID)) return;

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

  function initAuth() {
    var sb = window.supabaseClient;
    if (!sb) { setTimeout(initAuth, 30); return; }

    sb.auth.onAuthStateChange(function (event, session) {
      var user = session ? session.user : null;
      updateAuth(user, false);
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

  // ── 상단 배너 공지 ────────────────────────────────────────────
  var BANNER_KEY = 'iml_banner_dismissed';
  var BANNER_ID  = 'im-notice-banner';

  var bannerStyle = document.createElement('style');
  bannerStyle.textContent = [
    '#im-notice-banner{',
    'display:none;width:100%;background:#2D9B6F;color:#fff;',
    'font-size:13px;z-index:101;',
    'position:sticky;top:0;',
    'animation:bnrSlide .3s ease;}',
    '@keyframes bnrSlide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}',
    '#im-notice-banner.open{display:flex;align-items:center;gap:10px;',
    'padding:10px 18px;justify-content:space-between;flex-wrap:wrap;}',
    '.bnr-type{font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;',
    'background:rgba(255,255,255,.18);border-radius:4px;padding:2px 7px;flex-shrink:0;}',
    '.bnr-text{flex:1;min-width:0;font-weight:600;line-height:1.4;word-break:keep-all;}',
    '.bnr-right{display:flex;align-items:center;gap:10px;flex-shrink:0;}',
    '.bnr-link{font-size:11px;color:rgba(255,255,255,.8);text-decoration:none;white-space:nowrap;}',
    '.bnr-link:hover{color:#fff;text-decoration:underline;}',
    '.bnr-dismiss{background:none;border:none;color:rgba(255,255,255,.7);',
    'cursor:pointer;font-size:16px;padding:2px 6px;line-height:1;border-radius:4px;}',
    '.bnr-dismiss:hover{color:#fff;background:rgba(255,255,255,.15);}',
    'body.has-notice-banner #site-navbar{top:40px!important;}',
    'body.has-admin-bar #im-notice-banner{top:36px!important;}',
    'body.has-admin-bar.has-notice-banner #site-navbar{top:76px!important;}',
  ].join('');
  document.head.appendChild(bannerStyle);

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function showNoticeBanner(notice) {
    if (document.getElementById(BANNER_ID)) return;
    var typeMap = { notice:'📢 공지', event:'🎉 이벤트', info:'ℹ️ 안내' };
    var banner = document.createElement('div');
    banner.id = BANNER_ID;
    banner.innerHTML =
      '<span class="bnr-type">' + (typeMap[notice.type] || '📢 공지') + '</span>' +
      '<span class="bnr-text">' + String(notice.title || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</span>' +
      '<div class="bnr-right">' +
        (notice.content ? '<a href="notices.html" class="bnr-link">자세히 보기 →</a>' : '') +
        '<button class="bnr-dismiss" onclick="dismissBanner()" title="닫기">✕</button>' +
      '</div>';
    banner.classList.add('open');

    var nb = document.getElementById('site-navbar');
    if (nb && nb.parentNode) {
      nb.parentNode.insertBefore(banner, nb);
    } else {
      document.body.insertBefore(banner, document.body.firstChild);
    }
    document.body.classList.add('has-notice-banner');
  }

  window.dismissBanner = function () {
    var b = document.getElementById(BANNER_ID);
    if (b) b.remove();
    document.body.classList.remove('has-notice-banner');
    localStorage.setItem(BANNER_KEY, todayStr());
  };

  function initNoticeBanner() {
    if (localStorage.getItem(BANNER_KEY) === todayStr()) return;
    var sb = window.supabaseClient;
    if (!sb) { setTimeout(initNoticeBanner, 80); return; }
    sb.from('notices')
      .select('id,title,content,type')
      .eq('display_mode', 'banner')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(function (res) { if (res.data) showNoticeBanner(res.data); })
      .catch(function () {});
  }

  initNoticeBanner();
})();
