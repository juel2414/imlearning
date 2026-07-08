// js/nav.js — 공통 네비게이션 v1
// 모든 프론트엔드 페이지에서 로드. <nav.navbar> 또는 .top-logo-bar 를 자동 교체.
(function () {
  'use strict';

  // ── 햄버거 & 모바일 메뉴 CSS ──────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    '.nb-ham{display:none;align-items:center;justify-content:center;flex-direction:column;',
    'gap:6px;width:40px;height:40px;background:none;border:none;cursor:pointer;',
    'border-radius:8px;padding:8px;flex-shrink:0;}',
    '.nb-ham span{display:block;width:22px;height:2px;',
    'background:var(--black,#111);border-radius:2px;',
    'transition:transform .25s,opacity .25s,width .25s;}',
    '.nb-ham.open span:nth-child(1){transform:translateY(8px) rotate(45deg);}',
    '.nb-ham.open span:nth-child(2){opacity:0;transform:scaleX(0);}',
    '.nb-ham.open span:nth-child(3){transform:translateY(-8px) rotate(-45deg);}',
    '.nb-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);',
    'z-index:89;backdrop-filter:blur(2px);}',
    '.nb-overlay.open{display:block;}',
    '#nb-mob-auth{display:none;}',
    '@media(max-width:768px){',
    '.nb-ham{display:flex;}',
    '.navbar-right{display:none!important;}',
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
    '}'
  ].join('');
  document.head.appendChild(style);

  // ── 네비 HTML ────────────────────────────────────────────────
  var navEl = document.createElement('nav');
  navEl.className = 'navbar';
  navEl.id = 'site-navbar';
  navEl.innerHTML = [
    '<div class="navbar-inner">',
    '  <a href="index.html" class="navbar-logo">',
    '    <span class="navbar-logo-text">아이엠<span>러닝</span></span>',
    '  </a>',
    '  <ul class="navbar-menu" id="nb-menu">',
    '    <li><a href="courses.html">강좌</a></li>',
    '    <li><a href="courses.html?cat=faith">신앙</a></li>',
    '    <li><a href="courses.html?cat=edu">교사·부모</a></li>',
    '    <li><a href="courses.html?cat=mission">캠프·사역</a></li>',
    '    <li><a href="courses.html?cat=english">영어·시험</a></li>',
    '    <li><a href="courses.html?cat=freepass">전강좌 무제한</a></li>',
    '    <li><a href="about.html">소개</a></li>',
    '    <li id="nb-mob-auth-li"><div id="nb-mob-auth">',
    '      <a href="login.html" class="btn btn-outline btn-sm">로그인</a>',
    '      <a href="signup.html" class="btn btn-primary btn-sm">회원가입</a>',
    '    </div></li>',
    '  </ul>',
    '  <div class="navbar-right" id="nb-right">',
    '    <a href="login.html" class="btn btn-outline btn-sm">로그인</a>',
    '    <a href="signup.html" class="btn btn-primary btn-sm">회원가입</a>',
    '  </div>',
    '  <button class="nb-ham" id="nb-ham" aria-label="메뉴 열기">',
    '    <span></span><span></span><span></span>',
    '  </button>',
    '</div>',
    '<div class="nb-overlay" id="nb-overlay"></div>'
  ].join('');

  // ── 기존 네비 교체 또는 맨 앞 삽입 ───────────────────────────
  var existingNav     = document.querySelector('nav.navbar');
  var existingLogoBar = document.querySelector('.top-logo-bar');
  if (existingNav) {
    existingNav.parentNode.replaceChild(navEl, existingNav);
  } else if (existingLogoBar) {
    existingLogoBar.parentNode.replaceChild(navEl, existingLogoBar);
  } else {
    document.body.insertBefore(navEl, document.body.firstChild);
  }

  // ── 햄버거 동작 ──────────────────────────────────────────────
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

  // ── 현재 페이지 활성화 ───────────────────────────────────────
  var curPath   = (window.location.pathname.split('/').pop() || 'index.html');
  var curSearch = window.location.search;

  menu.querySelectorAll('a').forEach(function (a) {
    var href    = a.getAttribute('href') || '';
    var hPath   = href.split('?')[0];
    var hSearch = href.includes('?') ? href.slice(href.indexOf('?')) : '';
    // 정확히 일치
    if (hPath === curPath && (!hSearch || hSearch === curSearch)) {
      a.classList.add('active');
    }
    // courses.html: 강좌 상세 페이지에서도 '강좌' 활성화 (카테고리 없을 때)
    if (hPath === 'courses.html' && !hSearch && curPath === 'course-detail.html') {
      a.classList.add('active');
    }
  });

  // ── 인증 상태 반영 ───────────────────────────────────────────
  function updateAuth(user) {
    var right   = document.getElementById('nb-right');
    var mobAuth = document.getElementById('nb-mob-auth');
    if (user) {
      var loggedIn = [
        '<a href="my-courses.html" class="btn btn-outline btn-sm"',
        ' style="color:var(--green);border-color:var(--green);">나의 강의실</a>',
        '<button class="btn btn-primary btn-sm" onclick="navLogout()">로그아웃</button>'
      ].join('');
      var mobIn = [
        '<a href="my-courses.html" class="btn btn-outline btn-sm">나의 강의실</a>',
        '<button class="btn btn-primary btn-sm" onclick="navLogout()">로그아웃</button>'
      ].join('');
      if (right)   right.innerHTML   = loggedIn;
      if (mobAuth) mobAuth.innerHTML = mobIn;
    } else {
      var loggedOut = [
        '<a href="login.html" class="btn btn-outline btn-sm">로그인</a>',
        '<a href="signup.html" class="btn btn-primary btn-sm">회원가입</a>'
      ].join('');
      if (right)   right.innerHTML   = loggedOut;
      if (mobAuth) mobAuth.innerHTML = loggedOut;
    }
  }

  async function checkAuth() {
    var sb = window.supabaseClient;
    if (!sb) return;
    try {
      var res = await sb.auth.getUser();
      updateAuth(res.data && res.data.user ? res.data.user : null);
    } catch (e) { /* Supabase 준비 안 됐을 때 기본값 유지 */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuth);
  } else {
    checkAuth();
  }
})();
