/* ── 시즌 테마 로더 ──────────────────────────────────────────────────────
   설날·추석·성탄절처럼 때에 맞춰 사이트를 꾸민다.

   설정은 Supabase 의 landing_config 테이블, season 칸에 있다.
     {
       "mode":      "auto" | "on" | "off",
       "theme":     "chuseok",
       "starts_at": "2026-09-20",
       "ends_at":   "2026-09-29"
     }
   mode 가 on 이면 늘 켜고, off 면 늘 끄고, auto 면 기간 안에서만 켠다.
   기간은 보는 사람 브라우저 시계로 따진다. 장식이라 그 정도면 된다.

   꺼져 있으면 테마 파일을 아예 내려받지 않는다. 평소에는 설정 한 줄만 읽는다.

   테마를 하나 더 만들려면 themes/<이름>/ 폴더를 chuseok 과 같은 모양으로
   만들고 아래 THEMES 에 이름만 더하면 된다.
   ──────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var THEMES = ['chuseok'];          // 쓸 수 있는 테마 이름
  // 테마 파일을 고칠 때마다 올린다. 안 올리면 돌아온 사람은 옛 파일을 본다.
  var VER = '9';

  // 이 파일이 themes/loader.js 로 불렸다는 전제로 themes/ 의 주소를 찾는다.
  // 페이지가 하위 폴더(admin/)에 있어도 맞게 나온다.
  var BASE = (function () {
    var me = document.currentScript;
    if (me && me.src) return me.src.replace(/loader\.js.*$/, '');
    return 'themes/';
  })();

  if (window.__seasonLoaded) return;
  window.__seasonLoaded = true;

  /* ── 설정 읽기 ─────────────────────────────────────────────────── */

  function read(cb) {
    var sb = window.supabaseClient;
    if (!sb) { setTimeout(function () { read(cb); }, 80); return; }
    sb.from('landing_config').select('value').eq('key', 'season').maybeSingle()
      .then(function (res) { cb((res && res.data && res.data.value) || null); })
      .catch(function () { cb(null); });
  }

  // 오늘이 기간 안인가. 날짜만 보고 끝날은 포함한다.
  function inRange(cfg) {
    var today = new Date();
    var ymd = today.getFullYear() + '-' +
      String(today.getMonth() + 1).padStart(2, '0') + '-' +
      String(today.getDate()).padStart(2, '0');
    if (cfg.starts_at && ymd < cfg.starts_at) return false;
    if (cfg.ends_at   && ymd > cfg.ends_at)   return false;
    return true;
  }

  function decide(cfg) {
    if (!cfg) return null;
    // 예전 형태 { active: true, theme: 'chuseok' } 도 받아 준다
    var mode = cfg.mode || (cfg.active ? 'on' : 'off');
    var name = cfg.theme;
    if (!name || THEMES.indexOf(name) < 0) return null;
    if (mode === 'off') return null;
    if (mode === 'auto' && !inRange(cfg)) return null;
    return name;
  }

  /* ── 테마 파일 불러오기 ─────────────────────────────────────────── */

  function css(href) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
    return l;
  }

  function js(src) {
    return new Promise(function (done) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = done;
      s.onerror = done;
      document.head.appendChild(s);
    });
  }

  function turnOn(name) {
    var root = document.documentElement;
    root.setAttribute('data-season', name);
    root.classList.add('season-' + name);          // 예전 규칙과의 호환

    // 소개 페이지는 배경 사진이 body::before 한 장으로 깔린다.
    // 그 한 장만 가려내려면 화면을 알아보는 표가 필요하다.
    var markPage = function () {
      if (document.querySelector('.about-hero')) root.classList.add('sn-page-about');
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', markPage);
    } else {
      markPage();
    }

    // 색이 먼저 와야 글이 잠깐 엉뚱한 색으로 보이지 않는다
    css(BASE + 'base.css?v=' + VER);
    css(BASE + name + '/theme.css?v=' + VER);

    js(BASE + 'motifs.js?v=' + VER)
      .then(function () { return js(BASE + name + '/copy.js?v=' + VER); })
      .then(function () { return js(BASE + name + '/decorate.js?v=' + VER); })
      .then(function () {
        var run = window.SeasonDecorate;
        if (typeof run !== 'function') return;
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', run);
        } else {
          run();
        }
      });
  }

  read(function (cfg) {
    var name = decide(cfg);
    if (name) turnOn(name);
  });
})();
