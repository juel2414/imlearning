/* ── 겨울 장식 붙이기 ───────────────────────────────────────────────────
   어느 자리에 무엇을 얹을지 여기서 정한다. 그림은 themes/winter/motifs.js
   가, 색과 자리는 theme.css 가 맡는다.

   히어로는 레이어 여섯 겹으로 쌓는다 —
     1 설경 사진 · 2 아래 경계 녹임 · 3 뒤쪽 눈 · 4 학사모 ·
     5 전구 줄 · 6 앞쪽 눈 · 7 원래 글(건드리지 않는다)

   강좌 카드나 빈 상태처럼 나중에 그려지는 것이 있어서, 화면이 바뀔 때마다
   다시 훑는다. 이미 꾸민 자리는 표시를 남겨 두 번 붙지 않게 한다.
   ──────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var M = window.SeasonMotifs || {};        // 공통 — 반짝임
  var W = window.SeasonMotifsWinter || {};  // 겨울 — 눈송이·전나무·학사모
  var C = window.SeasonCopy || {};
  var r = M.round || function (n) { return Math.round(n * 10) / 10; };

  var BASE = (function () {
    // themes/winter/decorate.js 로 불렸다는 전제로 사진 폴더를 찾는다.
    var s = document.querySelector('script[src*="winter/decorate.js"]');
    if (s && s.src) return s.src.replace(/themes\/winter\/decorate\.js.*$/, '');
    return '';
  })();
  var PHOTO = BASE + 'images/season/winter/';

  var REDUCED = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 설경 사진은 히어로 첫 화면에 바로 보여야 하니 미리 받아 둔다.
  // 나머지 장식은 전부 코드로 그려서 받을 것이 없다.
  (function () {
    if (!document.querySelector('[data-section="hero"], .lp-hero')) return;
    var l = document.createElement('link');
    l.rel = 'preload'; l.as = 'image'; l.href = PHOTO + 'hero-bg.jpg';
    document.head.appendChild(l);
  })();

  // 한 번만 — 이미 손댄 자리면 false
  function once(el, key) {
    if (!el || el.getAttribute('data-sn-' + key)) return false;
    el.setAttribute('data-sn-' + key, '1');
    return true;
  }

  function make(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    e.setAttribute('aria-hidden', 'true');
    return e;
  }

  function rel(el) {
    if (el && getComputedStyle(el).position === 'static') el.style.position = 'relative';
  }

  /* ══ 내리는 눈 — 캔버스 한 장에 rAF ═══════════════════════════════
     DOM 으로 수십 개를 띄우면 스크롤이 무거워진다. 캔버스 하나에 그리고,
     화면 밖으로 나가면 멈춘다. 글이 있는 가운데는 비워 둔다. */

  function startSnow(host, cls, count, opt) {
    if (REDUCED) return null;
    var o = opt || {};
    var cv = make('canvas', cls);
    host.appendChild(cv);
    var ctx = cv.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, flakes = [], raf = null, running = false;

    function size() {
      var b = host.getBoundingClientRect();
      w = Math.max(1, Math.round(b.width));
      h = Math.max(1, Math.round(b.height));
      cv.width = w * dpr; cv.height = h * dpr;
      cv.style.width = w + 'px'; cv.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    /* 글줄을 피해 좌우 가장자리 위주로 뿌린다. 가운데로 가는 것은
       글이 끝나는 아래쪽에만 둔다. */
    function spawnX() {
      if (Math.random() < 0.84) {
        return Math.random() < 0.5
          ? Math.random() * w * 0.27
          : w - Math.random() * w * 0.27;
      }
      return w * 0.27 + Math.random() * w * 0.46;
    }

    function reset(f, first) {
      f.x = spawnX();
      var mid = f.x > w * 0.27 && f.x < w * 0.73;
      f.y = first ? Math.random() * h : -20;
      if (mid) f.y = Math.max(f.y, h * (o.midTop || 0.62));
      f.r = (o.min || 1.4) + Math.random() * (o.span || 2.4);
      f.vy = (o.vy || 18) * (0.5 + f.r / (o.span || 2.4)) / 60;
      f.vx = (Math.random() - 0.5) * 0.28;
      f.sw = Math.random() * Math.PI * 2;
      f.sa = 0.3 + Math.random() * 0.5;
      f.op = (o.op || 0.85) * (0.45 + Math.random() * 0.55);
    }

    function build() {
      flakes = [];
      for (var i = 0; i < count; i++) { var f = {}; reset(f, true); flakes.push(f); }
    }

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i];
        f.y += f.vy;
        f.sw += 0.012;
        f.x += f.vx + Math.sin(f.sw) * f.sa * 0.5;
        if (f.y > h + 16) reset(f, false);
        ctx.globalAlpha = f.op;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, 6.2832);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    function play(on) {
      if (on === running) return;
      running = on;
      if (on) { raf = requestAnimationFrame(frame); }
      else if (raf) { cancelAnimationFrame(raf); raf = null; }
    }

    size(); build(); play(true);

    // 화면 밖으로 나가면 멈춘다
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) {
        play(es[0].isIntersecting);
      }, { threshold: 0 }).observe(host);
    }
    document.addEventListener('visibilitychange', function () {
      play(!document.hidden && running !== false);
    });

    var rt = null;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { size(); build(); }, 180);
    });
    return { play: play };
  }

  function snowCount(front) {
    var narrow = window.innerWidth <= 768;
    // 데스크톱 40개 이하, 모바일 15개 이하 — 앞뒤를 합쳐서 센다
    if (narrow) return front ? 4 : 11;
    return front ? 10 : 28;
  }

  /* 눈 크기. 좁은 화면에서 데스크톱 크기 그대로 쓰면 방울처럼 커 보인다. */
  function snowSize(front) {
    var narrow = window.innerWidth <= 768;
    if (front) {
      return narrow ? { min: 1.3, span: 2.0, vy: 26, op: .85 }
                    : { min: 2.2, span: 3.4, vy: 30, op: .9 };
    }
    return narrow ? { min: .9, span: 1.5, vy: 14, op: .75 }
                  : { min: 1.1, span: 2.2, vy: 16, op: .8 };
  }

  /* ══ 헤더 — 로고 옆 작은 눈송이 ═══════════════════════════════════ */

  function doNav() {
    var logo = document.querySelector('.navbar-logo, .top-logo-bar a');
    if (!logo || !once(logo, 'flake')) return;
    logo.style.display = 'inline-flex';
    logo.style.alignItems = 'center';
    logo.appendChild(make('span', 'sn-nav-flake', W.flake(3, null, false)));
  }

  /* ══ 히어로 — 여섯 겹 ═════════════════════════════════════════════ */

  function doHero() {
    var hero = document.querySelector('[data-section="hero"]');
    if (hero && once(hero, 'hero')) {
      rel(hero);

      // 1 설경 사진
      var photo = make('div', 'sn-hero-photo');
      photo.style.backgroundImage = "url('" + PHOTO + "hero-bg.jpg')";
      hero.appendChild(photo);

      // 3 뒤쪽 눈
      startSnow(hero, 'sn-snow-back', snowCount(false), snowSize(false));

      // 4 학사모 — 기존 배경 사진의 학사모를 겨울 모습으로 옮긴 것
      hero.appendChild(make('div', 'sn-cap', W.gradCap()));

      // 5 전구 줄 — 위쪽에 가로로 반복
      var g = make('div', 'sn-garland');
      g.appendChild(make('span', 'sn-garland-a', W.lights(9, null, { width: 560, sag: 50 })));
      g.appendChild(make('span', 'sn-garland-b', W.lights(9, null, { width: 560, sag: 50 })));
      g.appendChild(make('span', 'sn-garland-c', W.lights(9, null, { width: 560, sag: 50 })));
      hero.appendChild(g);

      // 6 앞쪽 눈 — 조금만, 크게
      startSnow(hero, 'sn-snow-front', snowCount(true), snowSize(true));

      // 서리 — 어두운 아래 귀퉁이에 끼게 둔다. 흰 카드 위에 올리면 안 보인다.
      hero.appendChild(make('span', 'sn-frost sn-frost-bl', W.frostCorner()));
      hero.appendChild(make('span', 'sn-frost sn-frost-br', W.frostCorner()));

      // 7 원래 글 — 자리만 위로 올리고 내용은 건드리지 않는다
      var inner = hero.querySelector('.lp-hero-inner');
      if (inner) { inner.style.position = 'relative'; inner.style.zIndex = '7'; }

      // 인사말은 눈썹 문구 위에
      addGreet(hero);
    }

    // 강사·패스 히어로는 겨울 하늘만 입힌다
    ['.inst-hero', '.pass-hero'].forEach(function (sel) {
      var el = document.querySelector(sel);
      if (!el || !once(el, 'hero')) return;
      rel(el);
      startSnow(el, 'sn-snow-back', window.innerWidth <= 768 ? 8 : 18,
        { min: 1.1, span: 2, vy: 15, op: .75, midTop: 0.5 });
      var g2 = make('div', 'sn-garland sn-garland-sm');
      g2.appendChild(make('span', 'sn-garland-a', W.lights(7, null, { width: 520, sag: 44 })));
      g2.appendChild(make('span', 'sn-garland-b', W.lights(7, null, { width: 520, sag: 44 })));
      el.appendChild(g2);
      addGreet(el);
    });
  }

  function addGreet(host) {
    var eyebrow = host.querySelector('.lp-eyebrow, .inst-hero-eye, .pass-eyebrow-text');
    if (!eyebrow || !eyebrow.parentNode || !C.greet) return;
    if (!once(eyebrow, 'greet')) return;
    var g = make('div', 'sn-greet',
      '<span class="sn-greet-dot"></span><span class="sn-greet-t"></span>');
    g.removeAttribute('aria-hidden');          // 인사말은 읽히게 둔다
    g.querySelector('.sn-greet-t').textContent = C.greet;
    eyebrow.parentNode.insertBefore(g, eyebrow);
  }

  /* ══ 카드 판 — 서리 유리 ══════════════════════════════════════════
     베이지 판을 서리 낀 유리로 바꾸고, 윗변에 눈을 얹고 고드름을 단다.
     고드름은 이 큰 판 한 곳에만. 작은 카드까지 달면 과해진다. */

  /* 강좌 슬라이더는 자료가 오면 판 안을 통째로 다시 그린다. 그때 판 안에
     넣어 둔 장식이 같이 지워진다. 그래서 (1) 눈과 서리는 판이 아니라
     판을 담은 칸에 붙이고, (2) 표 대신 '그게 아직 있나'로 따져
     지워졌으면 다시 붙인다. */
  function doShowcase() {
    var show = document.querySelector('.lp-hero-showcase');
    if (!show) return;
    rel(show);
    var panel = show.querySelector('.lp-hero-img');
    if (!panel) return;

    // 판 윗변에 얹힌 눈 + 고드름. 이 판 한 곳에만 단다.
    if (!show.querySelector('.sn-cap-big')) {
      show.appendChild(make('span', 'sn-cap-big',
        W.snowCap({ width: 1200, rise: 24, hang: 15, ice: 32, seed: 4 })));
    }

    // 떠 있는 작은 통계 카드 — 눈만 조금, 고드름은 없다
    show.querySelectorAll('.lp-scard').forEach(function (c) {
      if (c.querySelector('.sn-cap-sm')) return;
      rel(c);
      c.appendChild(make('span', 'sn-cap-sm',
        W.snowCap({ width: 260, rise: 11, hang: 7, ice: 0, seed: 7 })));
    });

    // 아래 단계 안내 바도 같은 유리로
    var steps = show.querySelector('.hero-steps-card');
    if (steps && !steps.querySelector('.sn-cap-sm')) {
      rel(steps);
      steps.appendChild(make('span', 'sn-cap-sm',
        W.snowCap({ width: 1000, rise: 12, hang: 8, ice: 0, seed: 2 })));
    }
  }

  /* ══ 섹션 구분선 ══════════════════════════════════════════════════ */

  function doDividers() {
    ['features', 'reviews', 'faq'].forEach(function (name) {
      var sec = document.querySelector('[data-section="' + name + '"]');
      if (!sec || !once(sec, 'div')) return;
      // 형제로 끼우면 안 된다. 랜딩은 섹션을 전부 떼었다 순서대로 다시 붙이는데,
      // 그때 섹션이 아닌 것만 제자리에 남아 화면 맨 위로 밀려 올라간다.
      sec.insertBefore(make('div', 'sn-divider', W.drift()), sec.firstChild);
    });
  }

  /* ══ 강좌 카드 — 모서리 눈송이 ════════════════════════════════════ */

  var CARD_SEL = '.lp-pcard, .lp-fcard, .lp-rcard, .lp-faq-item, ' +
                 '.lp-cert-vis, .side-ad, .side-review';

  function doCards() {
    document.querySelectorAll(CARD_SEL).forEach(function (card) {
      if (!once(card, 'frost')) return;
      rel(card);
    });

    document.querySelectorAll('.course-card').forEach(function (card) {
      if (!once(card, 'corner')) return;
      var host = card.querySelector('.course-body') || card;
      rel(host);
      host.appendChild(make('span', 'sn-corner', W.flake(7, null, false)));
    });
  }

  /* ══ 밝은 화면들 ══════════════════════════════════════════════════ */

  var LIGHT_HEADS = ['.about-hero', '.terms-hero', '.notices-header', '.gift-card-outer'];
  var CONE_HEADS = ['.res-header', '.gc-header'];
  var DIVIDER_AFTER = ['.about-hero', '.terms-hero', '.notices-header', '.res-header'];
  var KNIT_UNDER = ['.notice-tabs', '.my-tabs', '.res-cats', '.courses-list-header',
                    '.top-cat-bar'];

  function doLight() {
    LIGHT_HEADS.forEach(function (sel) {
      var el = document.querySelector(sel);
      if (!el || !once(el, 'lflake')) return;
      rel(el);
      el.appendChild(make('span', 'sn-head-flake', W.flake(11)));
    });

    CONE_HEADS.forEach(function (sel) {
      var el = document.querySelector(sel);
      if (!el || !once(el, 'cone')) return;
      rel(el);
      el.appendChild(make('span', 'sn-cone-mark', W.pinecone()));
    });

    DIVIDER_AFTER.forEach(function (sel) {
      var el = document.querySelector(sel);
      if (!el || !el.parentNode || !once(el, 'ldiv')) return;
      el.parentNode.insertBefore(make('div', 'sn-divider', W.drift()), el.nextSibling);
    });

    KNIT_UNDER.forEach(function (sel) {
      var el = document.querySelector(sel);
      if (!el || !once(el, 'knit')) return;
      rel(el);
      el.appendChild(make('span', 'sn-saekdong-line'));
    });

    var gift = document.querySelector('.gift-card-outer, .gift-page-wrap');
    if (gift && once(gift, 'wreath')) {
      rel(gift);
      gift.appendChild(make('span', 'sn-wreath-mark', W.wreath()));
    }

    var ct = document.querySelector('.contact-panel, .contact-inner');
    if (ct && once(ct, 'candle')) {
      rel(ct);
      ct.appendChild(make('span', 'sn-candle-mark', W.candle()));
    }
  }

  /* ══ 칸 꾸미기 ════════════════════════════════════════════════════ */

  var DECO_SECS = ['[data-section="personas"]', '[data-section="features"]',
                   '[data-section="online"]', '[data-section="instructors"]',
                   '[data-section="courses"]', '[data-section="reviews"]',
                   '[data-section="certificate"]', '[data-section="faq"]'];

  function doSectionDeco() {
    var HEAD_ORN = [
      function (i) { return ['sn-ho-knit',  W.knitRow(i, null, { count: 7, w: 36 })]; },
      function ()  { return ['sn-ho-drift', W.drift()]; },
      function (i) { return ['sn-ho-flakes',
        '<span>' + W.flake(i + 2, null, false) + '</span>' +
        '<span>' + W.flake(i + 5) + '</span>' +
        '<span>' + W.flake(i + 9, null, false) + '</span>']; },
      function ()  { return ['sn-ho-band',
        '<i class="sn-ho-bar"></i><i class="sn-ho-dot"></i><i class="sn-ho-bar"></i>']; },
      function ()  { return ['sn-ho-star',
        '<i class="sn-ho-rule"></i>' + W.flake(21, null, false) + '<i class="sn-ho-rule"></i>']; }
    ];
    var hi = 0;
    document.querySelectorAll('.lp-head').forEach(function (head) {
      if (!once(head, 'horn')) return;
      var pick = HEAD_ORN[hi % HEAD_ORN.length](hi);
      hi++;
      head.appendChild(make('div', 'sn-head-orn ' + pick[0], pick[1]));
    });

    DECO_SECS.forEach(function (sel, i) {
      var sec = document.querySelector(sel);
      if (!sec || !once(sec, 'secdeco')) return;
      rel(sec);
      if (getComputedStyle(sec).overflow === 'visible') sec.style.overflow = 'hidden';
      sec.appendChild(make('span', 'sn-wm ' + (i % 2 ? 'sn-wm-r' : 'sn-wm-l'), W.flake(i * 3)));
      sec.appendChild(make('span', 'sn-still sn-still-1', W.flake(i + 31, null, false)));
      sec.appendChild(make('span', 'sn-still sn-still-2', W.flake(i + 47, null, false)));
    });
  }

  /* ══ 구석 그림 ════════════════════════════════════════════════════ */

  var SCENES = [
    ['[data-section="personas"]', function () { return W.snowman(); },  'man'],
    ['[data-section="online"]',   function () {
        return '<span class="sn-s-a">' + W.fir(2, null, 15) + '</span>' +
               '<span class="sn-s-b">' + W.fir(5, null, 15) + '</span>'; },  'firs'],
    ['[data-section="features"]', function () { return W.wreath(); },   'wreath'],
    ['[data-section="reviews"]',  function () { return W.pinecone(); }, 'cone'],
    ['.reviews-header',           function () { return W.pinecone(); }, 'cone'],
    ['.my-header',                function () { return W.snowman(); },  'man'],
    ['.search-hero',              function () { return W.holly(); },    'holly'],
    ['.pass-hero-inner',          function () { return W.holly(); },    'holly'],
    ['.top10-section',            function () { return W.pinecone(); }, 'cone1']
  ];

  function doScenes() {
    SCENES.forEach(function (row) {
      var el = document.querySelector(row[0]);
      if (!el || !once(el, 'scene')) return;
      rel(el);
      if (getComputedStyle(el).overflow === 'visible') el.style.overflow = 'hidden';
      el.appendChild(make('span', 'sn-scene sn-scene-' + row[2], row[1]()));
    });
  }

  /* ══ 시즌 CTA 배너 ════════════════════════════════════════════════ */

  function ctaNode() {
    var c = C.cta || {};
    var box = make('div', 'sn-cta');
    box.removeAttribute('aria-hidden');
    box.innerHTML =
      '<span class="sn-cta-art" aria-hidden="true">' + W.star() + '</span>' +
      '<div class="sn-cta-body">' +
      '  <div class="sn-cta-title">' + (c.title || '') + '</div>' +
      '  <div class="sn-cta-sub"></div>' +
      '</div>' +
      '<a class="sn-btn" href="' + (c.href || 'courses.html') + '"></a>';
    box.querySelector('.sn-cta-sub').textContent = c.sub || '';
    box.querySelector('.sn-btn').textContent = c.btn || '강좌 둘러보기';
    return box;
  }

  function doCta() {
    if (!C.cta) return;
    var host = document.querySelector('[data-section="cta"] .container') ||
               document.querySelector('[data-section="cta"]');
    if (host && once(host, 'cta')) host.insertBefore(ctaNode(), host.firstChild);

    var list = document.querySelector('.courses-list-header');
    if (list && list.parentNode && once(list, 'cta')) {
      var n = ctaNode();
      n.style.marginBottom = '22px';
      list.parentNode.insertBefore(n, list);
    }
  }

  /* ══ 푸터 — 고드름 처마와 전나무 숲 ═══════════════════════════════ */

  function doFooter() {
    var f = document.querySelector('.footer');
    if (!f || !once(f, 'foot')) return;
    f.appendChild(make('div', 'sn-footer-ice',
      W.snowCap({ width: 1440, rise: 14, hang: 12, ice: 30, seed: 6 })));
    f.appendChild(make('div', 'sn-footer-firs',
      W.firRow({ width: 1440, height: 150, minS: 0.4, spread: 0.34, step: 76,
                 levels: 12, slice: true, idPrefix: 'snff' })));
    f.appendChild(make('div', 'sn-footer-man', W.snowman()));

    if (C.footerGreet) {
      var bottom = f.querySelector('.footer-bottom') || f.querySelector('.container');
      if (bottom && bottom.parentNode) {
        var g = make('div', 'sn-footer-greet',
          W.flake(13, null, false) + '<span class="sn-footer-greet-t"></span>');
        g.removeAttribute('aria-hidden');
        g.querySelector('.sn-footer-greet-t').textContent = C.footerGreet;
        bottom.parentNode.insertBefore(g, bottom.nextSibling);
      }
    }
  }

  /* ══ 로그인·회원가입 카드 ═════════════════════════════════════════ */

  function doAuth() {
    document.querySelectorAll('.auth-card, .success-card').forEach(function (card) {
      if (!once(card, 'wreath')) return;
      rel(card);
      card.appendChild(make('span', 'sn-card-wreath', W.wreath()));
      card.appendChild(make('span', 'sn-frost sn-frost-tr', W.frostCorner()));
    });
  }

  /* ══ 빈 상태 ══════════════════════════════════════════════════════ */

  function doEmpty() {
    document.querySelectorAll('.empty-state-icon, .empty-result-icon').forEach(function (ic) {
      if (!once(ic, 'art')) return;
      ic.innerHTML = '<span class="sn-empty-art">' + W.snowman() + '</span>';
      ic.setAttribute('aria-hidden', 'true');
    });
    document.querySelectorAll('.empty-state').forEach(function (box) {
      if (box.querySelector('.sn-empty-art')) return;
      if (!once(box, 'art')) return;
      box.insertBefore(make('div', 'sn-empty-art', W.snowman()), box.firstChild);
    });
  }

  /* ══ 404 ══════════════════════════════════════════════════════════ */

  function do404() {
    var art = document.getElementById('nf-art');
    if (!art || !once(art, 'nf')) return;
    art.innerHTML = W.snowman();
    var nf = C.notFound || {};
    var set = function (id, html) {
      var el = document.getElementById(id);
      if (el && html) el.innerHTML = html;
    };
    set('nf-title', nf.title);
    set('nf-desc', nf.desc);
    var wrap = document.querySelector('.nf-wrap');
    if (wrap && once(wrap, 'snow')) {
      rel(wrap);
      startSnow(wrap, 'sn-snow-back', window.innerWidth <= 768 ? 8 : 16,
        { min: 1.2, span: 2, vy: 15, op: .7, midTop: 0.72 });
    }
  }

  /* ══ 카피 갈아 끼우기 ═════════════════════════════════════════════ */

  function doCopy() {
    (C.swap || []).forEach(function (s) {
      document.querySelectorAll(s.sel).forEach(function (el) {
        if (el.textContent.trim() !== s.from) return;
        if (!once(el, 'copy')) return;
        el.textContent = s.to;
      });
    });
  }

  /* ══ 전체 훑기 ════════════════════════════════════════════════════ */

  function warn(where, e) {
    if (window.console && console.warn) console.warn('[season] ' + where + ' 실패', e);
  }

  function scan() {
    try { doNav(); } catch (e) { warn('doNav', e); }
    try { doHero(); } catch (e) { warn('doHero', e); }
    try { doShowcase(); } catch (e) { warn('doShowcase', e); }
    try { doDividers(); } catch (e) { warn('doDividers', e); }
    try { doCards(); } catch (e) { warn('doCards', e); }
    try { doLight(); } catch (e) { warn('doLight', e); }
    try { doScenes(); } catch (e) { warn('doScenes', e); }
    try { doSectionDeco(); } catch (e) { warn('doSectionDeco', e); }
    try { doCta(); } catch (e) { warn('doCta', e); }
    try { doFooter(); } catch (e) { warn('doFooter', e); }
    try { doAuth(); } catch (e) { warn('doAuth', e); }
    try { doEmpty(); } catch (e) { warn('doEmpty', e); }
    try { do404(); } catch (e) { warn('do404', e); }
    try { doCopy(); } catch (e) { warn('doCopy', e); }
  }

  window.SeasonDecorate = function () {
    scan();

    // 강좌 카드나 빈 상태는 자료를 받아 온 뒤에 그려진다. 화면이 바뀌면 다시 훑되,
    // 우리가 넣은 장식 때문에 또 불리지 않도록 잠깐 묶었다 한 번에 처리한다.
    var timer = null, paused = false;
    var mo = new MutationObserver(function () {
      if (paused) return;
      clearTimeout(timer);
      timer = setTimeout(function () {
        paused = true;
        scan();
        setTimeout(function () { paused = false; }, 0);
      }, 200);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    [700, 1800, 3500].forEach(function (t) { setTimeout(scan, t); });
  };
})();
