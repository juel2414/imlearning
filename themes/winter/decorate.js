/* ── 겨울 장식 붙이기 ───────────────────────────────────────────────────
   어느 자리에 무엇을 얹을지 여기서 정한다. 그림은 themes/winter/motifs.js
   가, 색과 자리는 theme.css 가 맡는다.

   강좌 카드나 빈 상태처럼 나중에 그려지는 것이 있어서, 화면이 바뀔 때마다
   다시 훑는다. 이미 꾸민 자리는 표시를 남겨 두 번 붙지 않게 한다.
   ──────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var M = window.SeasonMotifs || {};        // 공통 — 반짝임·별가루
  var W = window.SeasonMotifsWinter || {};  // 겨울 — 눈송이·전나무·눈사람
  var C = window.SeasonCopy || {};
  var r = M.round || function (n) { return Math.round(n * 10) / 10; };

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

  /* ══ 헤더 — 로고 옆 작은 눈송이 ═══════════════════════════════════ */

  function doNav() {
    var logo = document.querySelector('.navbar-logo, .top-logo-bar a');
    if (!logo || !once(logo, 'flake')) return;
    logo.style.display = 'inline-flex';
    logo.style.alignItems = 'center';
    logo.appendChild(make('span', 'sn-nav-flake', W.flake(3)));
  }

  /* ══ 눈 내리는 밤하늘 히어로 ══════════════════════════════════════ */

  /* 별 — 오른쪽 위에서 왼쪽 아래로 물결처럼 차례로 반짝인다.
     자리에서 지연 시간을 뽑으므로 같은 대각선에 있는 별은 함께 빛난다. */
  var STAR_CYCLE = 3.4;
  var STAR_SWEEP = 2.4;

  /* 겨울 별자리 — 오리온과 북두칠성을 성글게 둔다. 자리는 글줄을 피해 뺀다. */
  var CONSTS = [
    /* 오리온 */
    [[8,8],[12,11],[10,17],[6,20],[4,14],[8,8]],
    [[9,13],[10,15],[11,17]],
    /* 북두칠성 */
    [[86,6],[89,8],[92,7],[95,9],[94,13],[90,14],[87,12]],
    /* 작은 삼각 */
    [[83,40],[87,37],[90,41],[83,40]],
    [[5,43],[8,40],[12,43],[10,48]]
  ];
  function constellations() {
    var g = CONSTS.map(function (pts) {
      var d = pts.map(function (p, i) {
        return (i ? 'L' : 'M') + p[0] + ' ' + p[1];
      }).join(' ');
      var dots = pts.map(function (p) {
        return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="0.28"/>';
      }).join('');
      return '<path d="' + d + '"/>' + dots;
    }).join('');
    return '<svg class="sn-consts" viewBox="0 0 100 60" preserveAspectRatio="none" ' +
      'xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + g + '</svg>';
  }

  function stars(n) {
    var out = '', N = n || 180;
    for (var i = 0; i < N; i++) {
      var x = M.jitter(i * 3 + 1) * 98 + 1;
      var y = M.jitter(i * 7 + 5) * 62 + 2;
      // 대부분은 티끌만 하게, 열에 하나쯤만 도드라지게
      var j = M.jitter(i * 11 + 2);
      var s = (j > 0.9 ? 2.6 + j * 2.2 : 0.8 + j * 1.5);
      // 오른쪽 위가 0, 왼쪽 아래가 1
      var d = ((100 - x) + y) / 200;
      out += '<span class="sn-star" style="left:' + r(x) + '%;top:' + r(y) + '%;' +
        'width:' + r(s) + 'px;height:' + r(s) + 'px;' +
        'animation-duration:' + STAR_CYCLE + 's;' +
        'animation-delay:' + r(d * STAR_SWEEP) + 's"></span>';
    }
    return out;
  }

  /* 네 갈래 반짝임 — 크고 또렷한 것을 드문드문. 글줄 한가운데는 피한다. */
  var SPARK_TINT = ['#FFF4D6', '#E4F1FF', '#DCE6FF', '#FFFFFF', '#FFE8A8'];
  function sparkles(n) {
    var out = '';
    for (var i = 0; i < n; i++) {
      var x = M.jitter(i * 19 + 4) * 96 + 2;
      var y = M.jitter(i * 23 + 8) * 70 + 3;
      if (x > 33 && x < 67 && y > 22 && y < 62) x = x < 50 ? x - 18 : x + 18;
      var k = M.jitter(i * 29 + 1);
      var s = 9 + k * k * 16;
      var d = ((100 - x) + y) / 200;
      out += '<span class="sn-spark" style="left:' + r(x) + '%;top:' + r(y) + '%;' +
        'width:' + r(s) + 'px;height:' + r(s) + 'px;color:' +
        SPARK_TINT[i % SPARK_TINT.length] + ';' +
        'animation-duration:' + STAR_CYCLE + 's;animation-delay:' +
        r(d * STAR_SWEEP + 0.4) + 's">' + M.sparkle() + '</span>';
    }
    return out;
  }

  /* 눈가루 — 바닥에서 아주 천천히 떠오르는 작은 빛. 추석의 반딧불 자리다. */
  function motes(n) {
    var out = '', N = n || 20;
    for (var i = 0; i < N; i++) {
      var x = M.jitter(i * 13 + 3) * 96 + 2;
      var y = 18 + M.jitter(i * 17 + 9) * 46;
      var s = 2.2 + M.jitter(i * 5 + 2) * 2.4;
      out += '<span class="sn-mote" style="left:' + r(x) + '%;top:' + r(y) + '%;' +
        'width:' + r(s) + 'px;height:' + r(s) + 'px;' +
        'animation-duration:' + r(7 + M.jitter(i * 7) * 7) + 's;' +
        'animation-delay:-' + r(M.jitter(i * 3) * 10) + 's"></span>';
    }
    return out;
  }

  /* 내리는 눈 — 겉은 아래로, 속은 좌우로 흔들린다. 결정은 저마다 다르다. */
  function snow(n) {
    var out = '';
    for (var i = 0; i < (n || 16); i++) {
      var j = M.jitter(i * 5 + 1), k = M.jitter(i * 9 + 4);
      var size = 9 + j * 17;
      out += '<span class="sn-snow" style="left:' + r(2 + i * (96 / (n || 16)) + k * 5) + '%;' +
        'width:' + r(size) + 'px;height:' + r(size) + 'px;' +
        'opacity:' + r(0.45 + k * 0.5) + ';' +
        'animation-duration:' + r(13 + j * 14) + 's;animation-delay:-' + r(k * 26) + 's">' +
        '<span class="sn-snow-i" style="animation-duration:' + r(5 + k * 5) + 's;' +
        'animation-delay:-' + r(j * 5) + 's">' + W.flake(i) + '</span></span>';
    }
    return out;
  }

  // full 이면 땅 풍경까지, 아니면 하늘만
  function doHero() {
    var heroes = [
      { el: document.querySelector('[data-section="hero"]'), full: true },
      { el: document.querySelector('.inst-hero'), full: false },
      { el: document.querySelector('.pass-hero'), full: false }
    ];
    heroes.forEach(function (h) {
      if (!h.el || !once(h.el, 'hero')) return;
      rel(h.el);

      var back = make('div', 'sn-deco',
        '<span class="sn-star-big">' + W.star() + '</span>' +
        '<span class="sn-aurora"></span>' +
        M.starDust('sn-dust') + stars() + sparkles(h.full ? 30 : 16) +
        constellations() +
        motes(h.full ? 20 : 11) +
        '<span class="sn-cl sn-cl-1">' + W.snowCloud() + '</span>' +
        '<span class="sn-cl sn-cl-2">' + W.snowCloud() + '</span>' +
        (h.full ? '<span class="sn-cl sn-cl-3">' + W.snowCloud() + '</span>' +
                  '<span class="sn-cl sn-cl-4">' + W.snowCloud() + '</span>' : '') +
        '<span class="sn-garland">' + W.lights(9) + '</span>' +
        (h.full ? '<span class="sn-garland sn-garland-2">' + W.lights(7) + '</span>' : ''));
      h.el.appendChild(back);

      h.el.appendChild(make('div', 'sn-deco-front', snow(h.full ? 16 : 10) +
        (h.full ? '<span class="sn-hero-holly">' + W.holly() + '</span>' : '')));

      // 전나무 숲은 강좌 카드 판 안에 넣는다. 판보다 앞, 흰 카드보다 뒤라
      // 글을 가리지 않으면서 모서리까지 들어온다. 추석의 억새 자리다.
      var show = h.full && h.el.querySelector('.lp-hero-showcase');
      if (show && once(show, 'firs')) {
        rel(show);
        show.appendChild(make('span', 'sn-firs sn-firs-l',
          W.firRow({ width: 300, height: 210, minS: 0.5, spread: 0.5, step: 54 })));
        show.appendChild(make('span', 'sn-firs sn-firs-r',
          W.firRow({ width: 300, height: 210, minS: 0.52, spread: 0.46, step: 58 })));
        // 눈사람은 오른쪽 숲 곁에 세운다. 흰 카드가 늘 앞에 서도록 판 안에 넣는다.
        show.appendChild(make('span', 'sn-hero-man', W.snowman()));
      }

      // 니트 액자. 메뉴바 아래 니트 선과 나란히 놓이면 띠가 둘로 보여서,
      // 액자를 쓴 화면에서는 메뉴바 선을 지우도록 표를 남긴다.
      var frame = make('div', 'sn-frame');
      frame.appendChild(make('span', 'sn-frame-ice',
        W.icicles({ width: 1440, height: 56, len: 36 })));
      h.el.appendChild(frame);
      document.documentElement.classList.add('sn-framed');

      // 인사말은 눈썹 문구 위에 놓는다
      var eyebrow = h.el.querySelector('.lp-eyebrow, .inst-hero-eye, .pass-eyebrow-text');
      if (eyebrow && eyebrow.parentNode && C.greet) {
        var g = make('div', 'sn-greet',
          '<span class="sn-greet-dot"></span><span class="sn-greet-t"></span>');
        g.removeAttribute('aria-hidden');          // 인사말은 읽히게 둔다
        g.querySelector('.sn-greet-t').textContent = C.greet;
        eyebrow.parentNode.insertBefore(g, eyebrow);
      }
    });
  }

  /* ══ 섹션 구분선 — 쌓인 눈 ════════════════════════════════════════ */

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

  // 사진이 큰 강좌 카드(.lp-ccard)는 뺀다. 무늬가 사진 위로 얹혀 지저분해진다.
  var CARD_SEL = '.lp-pcard, .lp-fcard, .lp-rcard, .lp-faq-item, ' +
                 '.lp-cert-vis, .side-ad, .side-review';

  function doCards() {
    document.querySelectorAll(CARD_SEL).forEach(function (card) {
      if (!once(card, 'frost')) return;
      rel(card);
      // 서리 테두리와 귀퉁이 결정은 theme.css 가 그린다
    });

    document.querySelectorAll('.course-card').forEach(function (card) {
      if (!once(card, 'corner')) return;
      // 섬네일 사진 위에 얹으면 묻힌다. 흰 본문 귀에 붙인다.
      var host = card.querySelector('.course-body') || card;
      rel(host);
      host.appendChild(make('span', 'sn-corner', W.flake(7)));
    });
  }

  /* ══ 밝은 화면들 ══════════════════════════════════════════════════
     흰 바탕은 밤으로 덮지 않는다. 글자 대비가 무너지기 때문이다.
     대신 눈송이·눈더미·니트 띠로만 계절을 알린다. */

  // 머리글 오른쪽 위에 얹는 큰 눈송이
  var LIGHT_HEADS = ['.about-hero', '.terms-hero', '.notices-header', '.gift-card-outer'];
  // 솔방울을 놓는 자리
  var CONE_HEADS = ['.res-header', '.gc-header'];
  // 뒤에 눈더미 한 줄을 까는 자리
  var DIVIDER_AFTER = ['.about-hero', '.terms-hero', '.notices-header', '.res-header'];
  // 아래에 니트 선을 긋는 자리
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

    // 선물하기에는 리스가 어울린다
    var gift = document.querySelector('.gift-card-outer, .gift-page-wrap');
    if (gift && once(gift, 'wreath')) {
      rel(gift);
      gift.appendChild(make('span', 'sn-wreath-mark', W.wreath()));
    }

    // 문의하기에는 촛불 하나
    var ct = document.querySelector('.contact-panel, .contact-inner');
    if (ct && once(ct, 'candle')) {
      rel(ct);
      ct.appendChild(make('span', 'sn-candle-mark', W.candle()));
    }
  }

  /* ══ 칸 꾸미기 — 제목 아래 무늬, 구석에 눈송이 ═══════════════════
     설지로 바꾼 칸이 허전하지 않게, 글을 가리지 않는 것들만 얹는다. */
  var DECO_SECS = ['[data-section="personas"]', '[data-section="features"]',
                   '[data-section="online"]', '[data-section="instructors"]',
                   '[data-section="courses"]', '[data-section="reviews"]',
                   '[data-section="certificate"]', '[data-section="faq"]'];

  function doSectionDeco() {
    // 칸 제목 아래에 무늬 한 줄. 칸마다 다른 것이 나오도록 다섯 가지를 돌려 쓴다.
    var HEAD_ORN = [
      function (i) { return ['sn-ho-knit',  W.knitRow(i, null, { count: 7, w: 36 })]; },
      function ()  { return ['sn-ho-drift', W.drift()]; },
      function (i) { return ['sn-ho-flakes',
        '<span>' + W.flake(i + 2) + '</span>' +
        '<span>' + W.flake(i + 5) + '</span>' +
        '<span>' + W.flake(i + 9) + '</span>']; },
      function ()  { return ['sn-ho-band',
        '<i class="sn-ho-bar"></i><i class="sn-ho-dot"></i><i class="sn-ho-bar"></i>']; },
      function ()  { return ['sn-ho-star',
        '<i class="sn-ho-rule"></i>' + W.flake(21) + '<i class="sn-ho-rule"></i>']; }
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

      // 큰 눈송이 하나 — 아주 옅게 깔아 서리 결처럼 보이게
      sec.appendChild(make('span', 'sn-wm ' + (i % 2 ? 'sn-wm-r' : 'sn-wm-l'), W.flake(i * 3)));

      // 작은 결정 두어 개 — 떨어지지 않고 가만히 놓인다
      sec.appendChild(make('span', 'sn-still sn-still-1', W.flake(i + 31)));
      sec.appendChild(make('span', 'sn-still sn-still-2', W.flake(i + 47)));
    });
  }

  /* ══ 구석 그림 — 밋밋한 칸과 화면에 겨울 것을 하나씩 놓는다 ══════
     글 위를 덮지 않도록 칸의 바깥 모서리에만 붙이고 뒤로 깐다. */
  var SCENES = [
    // [자리, 무엇, 표 이름]
    ['[data-section="personas"]', function () { return W.snowman(); },  'man'],
    ['[data-section="online"]',   function () {
        return '<span class="sn-s-a">' + W.fir(2) + '</span>' +
               '<span class="sn-s-b">' + W.fir(5) + '</span>'; },       'firs'],
    ['[data-section="features"]', function () { return W.wreath(); },   'wreath'],
    ['[data-section="reviews"]',  function () { return W.pinecone(); }, 'cone'],
    ['.reviews-header',           function () { return W.pinecone(); }, 'cone'],
    ['.my-header',                function () { return W.snowman(); },  'man'],
    ['.search-hero',              function () { return W.holly(); },    'holly'],
    ['.pass-hero-inner',          function () { return W.holly(); },    'holly'],
    // 강좌 목록 — 인기 강좌 자리에 솔방울 하나
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
    // 랜딩은 CTA 섹션 안, 강좌 목록은 목록 머리 위
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
    f.appendChild(make('div', 'sn-footer-ice', W.icicles({ width: 1440, height: 58, len: 40 })));
    f.appendChild(make('div', 'sn-footer-firs',
      W.firRow({ width: 1440, height: 150, minS: 0.4, spread: 0.34, step: 76, slice: true })));
    f.appendChild(make('div', 'sn-footer-man', W.snowman()));

    if (C.footerGreet) {
      var bottom = f.querySelector('.footer-bottom') || f.querySelector('.container');
      if (bottom && bottom.parentNode) {
        var g = make('div', 'sn-footer-greet',
          W.flake(13) + '<span class="sn-footer-greet-t"></span>');
        g.removeAttribute('aria-hidden');
        g.querySelector('.sn-footer-greet-t').textContent = C.footerGreet;
        bottom.parentNode.insertBefore(g, bottom.nextSibling);
      }
    }
  }

  /* ══ 로그인·회원가입·비밀번호 재설정 카드 ═════════════════════════ */

  function doAuth() {
    document.querySelectorAll('.auth-card, .success-card').forEach(function (card) {
      if (!once(card, 'wreath')) return;
      rel(card);
      card.appendChild(make('span', 'sn-card-wreath', W.wreath()));
    });
  }

  /* ══ 빈 상태 — 눈사람으로 바꾼다 ══════════════════════════════════ */

  function doEmpty() {
    document.querySelectorAll('.empty-state-icon, .empty-result-icon').forEach(function (ic) {
      if (!once(ic, 'art')) return;
      ic.innerHTML = '<span class="sn-empty-art">' + W.snowman() + '</span>';
      ic.setAttribute('aria-hidden', 'true');
    });
    // 아이콘 자리가 따로 없는 빈 상태에는 앞에 끼워 넣는다
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
  }

  /* ══ 카피 갈아 끼우기 ═════════════════════════════════════════════
     원래 문구와 똑같을 때만 바꾼다. 관리자가 고쳐 둔 글은 건드리지 않는다. */

  function doCopy() {
    (C.swap || []).forEach(function (s) {
      document.querySelectorAll(s.sel).forEach(function (el) {
        if (el.textContent.trim() !== s.from) return;
        if (!once(el, 'copy')) return;
        el.textContent = s.to;
      });
    });
  }

  /* ══ 자리 맞추기 ══════════════════════════════════════════════════ */

  // 한 군데가 넘어져도 나머지는 붙이되, 무슨 일인지는 남긴다.
  function warn(where, e) {
    if (window.console && console.warn) console.warn('[season] ' + where + ' 실패', e);
  }

  /* 전나무 숲은 카드 판 안에 붙어 있어서, 화면이 넓으면 판 바깥 여백만큼
     가장자리가 빈다. 그 여백을 재서 그만큼 옆으로 늘려 화면 끝까지 채운다. */
  function placeFirs() {
    var hero = document.querySelector('[data-section="hero"]');
    var show = hero && hero.querySelector('.lp-hero-showcase');
    var l = hero && hero.querySelector('.sn-firs-l');
    var rg = hero && hero.querySelector('.sn-firs-r');
    if (!show || !l || !rg) return;
    var hr = hero.getBoundingClientRect(), sr = show.getBoundingClientRect();
    var over = window.innerWidth <= 768 ? 120 : 200;   // 판 위로 걸치는 몫
    var offL = Math.max(0, Math.round(sr.left - hr.left));
    var offR = Math.max(0, Math.round(hr.right - sr.right));
    l.style.left  = -offL + 'px'; l.style.width = (offL + over) + 'px';
    rg.style.right = -offR + 'px'; rg.style.width = (offR + over) + 'px';
  }

  /* 메뉴바가 히어로 윗부분을 얼마나 덮는지 잰다. 공지 띠를 닫으면
     메뉴바가 올라가 덮는 높이가 달라진다. 니트 액자와 고드름이 이 값을 쓴다.
     스크롤한 뒤에는 고정 메뉴바 자리가 달라져 재지 않는다. */
  function placeFrame() {
    if (window.scrollY > 4) return;
    var nav = document.getElementById('site-navbar') || document.querySelector('.navbar');
    var navBottom = nav ? nav.getBoundingClientRect().bottom : 0;
    document.querySelectorAll('[data-sn-hero]').forEach(function (h) {
      var cover = Math.max(0, Math.round(navBottom - h.getBoundingClientRect().top));
      if (cover > 160) cover = 0;          // 페이지 한가운데 있는 히어로는 덮이지 않는다
      h.style.setProperty('--sn-nav', cover + 'px');
    });
  }

  function scan() {
    try { doNav(); } catch (e) { warn('doNav', e); }
    try { doHero(); } catch (e) { warn('doHero', e); }
    try { placeFrame(); } catch (e) { warn('placeFrame', e); }
    try { placeFirs(); } catch (e) { warn('placeFirs', e); }
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

    var rt = null;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { placeFrame(); placeFirs(); }, 150);
    });

    // 늦게 오는 자료를 위해 몇 번 더
    [700, 1800, 3500].forEach(function (t) { setTimeout(scan, t); });
  };
})();
