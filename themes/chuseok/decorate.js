/* ── 추석 장식 붙이기 ───────────────────────────────────────────────────
   어느 자리에 무엇을 얹을지 여기서 정한다. 그림은 themes/motifs.js 가,
   색과 자리는 theme.css 가 맡는다.

   강좌 카드나 빈 상태처럼 나중에 그려지는 것이 있어서, 화면이 바뀔 때마다
   다시 훑는다. 이미 꾸민 자리는 표시를 남겨 두 번 붙지 않게 한다.
   ──────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var M = window.SeasonMotifs;
  var C = window.SeasonCopy || {};

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

  /* ══ 헤더 — 로고 옆 작은 달 ═══════════════════════════════════════ */

  function doNav() {
    var logo = document.querySelector('.navbar-logo, .top-logo-bar a');
    if (!logo || !once(logo, 'moon')) return;
    logo.style.display = 'inline-flex';
    logo.style.alignItems = 'center';
    logo.appendChild(make('span', 'sn-nav-moon', M.moon()));
  }

  /* ══ 밤하늘 히어로 ════════════════════════════════════════════════ */

  var r = M.round;


  /* 별 — 오른쪽 위에서 왼쪽 아래로 물결처럼 차례로 반짝인다.
     자리에서 지연 시간을 뽑으므로 같은 대각선에 있는 별은 함께 빛난다.
     주기를 모두 같게 둬야 물결이 흐트러지지 않는다. */
  var STAR_CYCLE = 3.2;   // 한 번 반짝이는 데 걸리는 시간
  var STAR_SWEEP = 2.4;   // 대각선 끝에서 끝까지 번지는 데 걸리는 시간

  /* 별자리 — 별 몇 개를 가는 선으로 잇는다. 시안의 밤하늘처럼
     성글게 셋만 놓는다. 자리는 글줄을 피해 좌우로 뺀다. */
  var CONSTS = [
    [[9,10],[13,7],[17,10],[16,15],[11,16],[9,10]],
    [[87,6],[90,9],[94,7],[97,11]],
    [[82,40],[85,37],[89,40],[92,36],[95,40]],
    [[6,44],[9,41],[13,44],[11,49]]
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

  /* 네 갈래 별 — 시안처럼 크고 또렷한 별을 드문드문. 글줄 한가운데는 피한다. */
  var SPARK_TINT = ['#FFF4D6', '#FFF4D6', '#DCE6FF', '#FFE0EC', '#FFE8A8'];
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
        'width:' + r(s) + 'px;height:' + r(s) + 'px;color:' + SPARK_TINT[i % SPARK_TINT.length] + ';' +
        'animation-duration:' + STAR_CYCLE + 's;animation-delay:' + r(d * STAR_SWEEP + 0.4) + 's">' +
        M.sparkle() + '</span>';
    }
    return out;
  }

  /* 반딧불 — 노란 점빛. 천천히 밝아졌다 사그라들며 조금씩 떠오른다. */
  function fireflies(n) {
    var out = '', N = n || 22;
    for (var i = 0; i < N; i++) {
      var x = M.jitter(i * 13 + 3) * 96 + 2;
      var y = 14 + M.jitter(i * 17 + 9) * 44;
      var s = 2.6 + M.jitter(i * 5 + 2) * 2.6;
      out += '<span class="sn-ff" style="left:' + r(x) + '%;top:' + r(y) + '%;' +
        'width:' + r(s) + 'px;height:' + r(s) + 'px;' +
        'animation-duration:' + r(4 + M.jitter(i * 7) * 5) + 's;' +
        'animation-delay:-' + r(M.jitter(i * 3) * 8) + 's"></span>';
    }
    return out;
  }

  // 단풍잎 — 받은 그림 두 장을 번갈아 쓴다
  function leaves(n) {
    var out = '';
    for (var i = 0; i < (n || 8); i++) {
      var j = M.jitter(i * 5 + 1), k = M.jitter(i * 9 + 4);
      var size = 26 + j * 18;
      out += '<span class="sn-leaf' + (i % 3 === 2 ? ' sn-leaf-green' : '') + '" style="left:' + r(5 + i * 12 + k * 7) + '%;' +
        'width:' + r(size) + 'px;' +
        'animation-duration:' + r(16 + j * 12) + 's;animation-delay:-' + r(k * 24) + 's">' +
        '<span class="sn-leaf-i" style="animation-duration:' + r(4 + k * 4) + 's;' +
        'animation-delay:-' + r(j * 4) + 's">' +
        M.piece(i % 2 ? 'mapleR' : 'mapleO') +
        '</span></span>';
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
      var cs = getComputedStyle(h.el);
      if (cs.position === 'static') h.el.style.position = 'relative';

      var back = make('div', 'sn-deco',
        // 달은 빛무리까지 그려진 그림이라 따로 후광을 두지 않는다
        // 토끼를 달 안에 넣어야 달 크기가 바뀌어도 늘 붙어 있다
        '<span class="sn-moon">' + M.piece('moon') +
          '<span class="sn-peek">' + M.piece('peek') + '</span></span>' +
        '<span class="sn-milky"></span>' + M.starDust('sn-dust') + stars() + sparkles(h.full ? 30 : 16) +
        constellations() +
        fireflies(h.full ? 22 : 12) +
        '<span class="sn-ck sn-ck-1">' + M.cloudKr() + '</span>' +
        '<span class="sn-ck sn-ck-2">' + M.cloudKr() + '</span>' +
        (h.full ? '<span class="sn-ck sn-ck-3">' + M.cloudKr() + '</span>' +
                  '<span class="sn-ck sn-ck-4">' + M.cloudKr() + '</span>' : '') +
        '<span class="sn-pine">' + M.pineKr() + '</span>' +
        // 솔가지에 송편을 얹는다
        (h.full ? '<span class="sn-pine2">' + M.pineKr() + '</span>' : '') +
        '');
      h.el.appendChild(back);

      h.el.appendChild(make('div', 'sn-deco-front', leaves(h.full ? 8 : 5) +
        (h.full ? '<span class="sn-norigae">' + M.norigae() + '</span>' +
                  // 소반 그림에 송편 그릇까지 들어 있다
                  '<span class="sn-soban">' + M.soban() + '</span>' +
                  // 억새와 들꽃을 한 덩어리로 묶어 양옆 모서리에 세운다.
                  // 강좌 카드 판이 폭을 거의 다 차지해서, 판 모서리 앞에 걸친다.
                  '' : '')));

      // 억새·들꽃은 강좌 카드 판 안에 넣는다. 판보다 앞, 흰 카드보다 뒤라
      // 글을 가리지 않으면서 모서리까지 들어온다.
      var show = h.full && h.el.querySelector('.lp-hero-showcase');
      if (show && once(show, 'reeds')) {
        if (getComputedStyle(show).position === 'static') show.style.position = 'relative';
        show.appendChild(make('span', 'sn-reeds-l', M.reedsArt()));
        show.appendChild(make('span', 'sn-reeds-r', M.reedsArt()));
      }

      // 색동 액자. 메뉴바 아래 색동 선과 나란히 놓이면 띠가 둘로 보여서,
      // 액자를 쓴 화면에서는 메뉴바 선을 지우도록 표를 남긴다.
      h.el.appendChild(make('div', 'sn-frame'));
      document.documentElement.classList.add('sn-framed');   // 화면 폭 계산에 쓴다
      if (h.full) h.el.appendChild(make('div', 'sn-shield', M.piece('shield')));

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

  /* ══ 섹션 구분선 ══════════════════════════════════════════════════ */

  function doDividers() {
    ['features', 'reviews', 'faq'].forEach(function (name) {
      var sec = document.querySelector('[data-section="' + name + '"]');
      if (!sec || !once(sec, 'div')) return;
      // 형제로 끼우면 안 된다. 랜딩은 섹션을 전부 떼었다 순서대로 다시 붙이는데,
      // 그때 섹션이 아닌 것만 제자리에 남아 화면 맨 위로 밀려 올라간다.
      // 섹션 안에 넣으면 섹션을 따라 같이 움직인다.
      var d = make('div', 'sn-divider', M.cloudDivider());
      sec.insertBefore(d, sec.firstChild);
    });
  }

  /* ══ 강좌 카드 — 모서리 문양 ══════════════════════════════════════ */

  /* 랜딩 카드에도 같은 귀 장식을 붙인다 */
  var CARD_SEL = '.lp-pcard, .lp-fcard, .lp-ccard, .lp-rcard, .lp-faq-item';

  function doCards() {
    document.querySelectorAll(CARD_SEL).forEach(function (card) {
      if (!once(card, 'corner')) return;
      if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
      card.appendChild(make('span', 'sn-corner sn-corner-lp', M.cornerOrnament()));
    });

    document.querySelectorAll('.course-card').forEach(function (card) {
      if (!once(card, 'corner')) return;
      // 섬네일 사진 위에 얹으면 금색이 묻힌다. 흰 본문 귀에 붙인다.
      var host = card.querySelector('.course-body') || card;
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      host.appendChild(make('span', 'sn-corner', M.cornerOrnament()));
    });
  }

  /* ══ 밝은 화면들 ══════════════════════════════════════════════════
     흰 바탕은 밤으로 덮지 않는다. 글자 대비가 무너지기 때문이다.
     대신 달·구름문양·색동으로만 계절을 알린다. */

  // 머리글 오른쪽 위에 얹는 작은 달
  var LIGHT_HEADS = ['.about-hero', '.terms-hero', '.notices-header', '.gift-card-outer'];
  // 윷 네 가락을 놓는 자리
  var YUT_HEADS = ['.res-header', '.gc-header'];
  // 뒤에 구름문양 한 줄을 까는 자리
  var DIVIDER_AFTER = ['.about-hero', '.terms-hero', '.notices-header', '.res-header'];
  // 아래에 색동 선을 긋는 자리
  var SAEKDONG_UNDER = ['.notice-tabs', '.my-tabs', '.res-cats', '.courses-list-header'];

  function doLight() {
    LIGHT_HEADS.forEach(function (sel) {
      var el = document.querySelector(sel);
      if (!el || !once(el, 'lmoon')) return;
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      el.appendChild(make('span', 'sn-head-moon', M.moon()));
    });

    YUT_HEADS.forEach(function (sel) {
      var el = document.querySelector(sel);
      if (!el || !once(el, 'yut')) return;
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      el.appendChild(make('span', 'sn-yut-mark', M.yut()));
    });

    DIVIDER_AFTER.forEach(function (sel) {
      var el = document.querySelector(sel);
      if (!el || !el.parentNode || !once(el, 'ldiv')) return;
      el.parentNode.insertBefore(make('div', 'sn-divider', M.cloudDivider()), el.nextSibling);
    });

    SAEKDONG_UNDER.forEach(function (sel) {
      var el = document.querySelector(sel);
      if (!el || !once(el, 'saek')) return;
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      el.appendChild(make('span', 'sn-saekdong-line'));
    });

    // 선물하기는 보자기 매듭이 어울린다
    var gift = document.querySelector('.gift-card-outer, .gift-page-wrap');
    if (gift && once(gift, 'knot')) {
      if (getComputedStyle(gift).position === 'static') gift.style.position = 'relative';
      gift.appendChild(make('span', 'sn-knot-mark', M.knot()));
    }

    // 문의하기에는 청사초롱 하나
    var ct = document.querySelector('.contact-panel, .contact-inner');
    if (ct && once(ct, 'lantern')) {
      if (getComputedStyle(ct).position === 'static') ct.style.position = 'relative';
      ct.appendChild(make('span', 'sn-lantern-mark', M.lantern()));
    }
  }

  /* ══ 칸 꾸미기 — 제목 아래 구름 선, 구석에 구름무늬와 낙엽 ═══════
     한지로 바꾼 칸이 허전하지 않게, 글을 가리지 않는 것들만 얹는다. */
  var DECO_SECS = ['[data-section="personas"]', '[data-section="features"]',
                   '[data-section="online"]', '[data-section="instructors"]',
                   '[data-section="courses"]', '[data-section="reviews"]',
                   '[data-section="certificate"]', '[data-section="faq"]'];

  function doSectionDeco() {
    // 칸 제목 아래에 구름 선 한 줄
    document.querySelectorAll('.lp-head').forEach(function (head) {
      if (!once(head, 'hcloud')) return;
      head.appendChild(make('div', 'sn-head-cloud', M.cloudDivider()));
    });

    DECO_SECS.forEach(function (sel, i) {
      var sec = document.querySelector(sel);
      if (!sec || !once(sec, 'secdeco')) return;
      if (getComputedStyle(sec).position === 'static') sec.style.position = 'relative';
      if (getComputedStyle(sec).overflow === 'visible') sec.style.overflow = 'hidden';

      // 구름무늬 한 조각 — 아주 옅게 깔아 한지 결처럼 보이게
      var side = i % 2 ? 'sn-wm-r' : 'sn-wm-l';
      sec.appendChild(make('span', 'sn-wm ' + side, M.cloudKr()));

      // 낙엽 두어 장 — 떨어지지 않고 가만히 놓인다
      sec.appendChild(make('span', 'sn-still sn-still-1',
        M.piece(i % 2 ? 'mapleR' : 'mapleO')));
      sec.appendChild(make('span', 'sn-still sn-still-2',
        M.piece(i % 2 ? 'mapleO' : 'mapleR')));
    });
  }

  /* ══ 구석 그림 — 밋밋한 칸과 화면에 수확물을 하나씩 놓는다 ═══════
     히어로 아래 돗자리 띠를 걷어 내고, 그 그림들을 여기로 흩어 놓았다.
     글 위를 덮지 않도록 칸의 바깥 모서리에만 붙이고 뒤로 깐다. */
  var SCENES = [
    // [자리, 무엇, 표 이름]
    ['[data-section="personas"]', function () { return M.rabbit(); },          'rabbit'],
    ['[data-section="online"]',   function () {
        return '<span class="sn-s-a">' + M.piece('pumpkin') + '</span>' +
               '<span class="sn-s-b">' + M.piece('squash')  + '</span>'; },    'harvest'],
    // 돗자리 그림에 윷판과 밤이 이미 들어 있다
    ['[data-section="features"]', function () { return M.piece('mat'); },      'yutmat'],
    ['[data-section="reviews"]',  function () { return M.piece('chestnut'); }, 'chestnut'],
    ['.reviews-header',           function () { return M.piece('chestnut'); }, 'chestnut'],
    ['.my-header',                function () { return M.rabbit(); },          'rabbit'],
    ['.search-hero',              function () { return M.piece('pumpkin'); },  'harvest1'],
    ['.pass-hero-inner',          function () { return M.piece('squash'); },   'harvest1']
  ];

  function doScenes() {
    SCENES.forEach(function (row) {
      var el = document.querySelector(row[0]);
      if (!el || !once(el, 'scene')) return;
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
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
      '<span class="sn-cta-art" aria-hidden="true">' + M.moon() + '</span>' +
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

  /* ══ 푸터 ═════════════════════════════════════════════════════════ */

  function doFooter() {
    var f = document.querySelector('.footer');
    if (!f || !once(f, 'foot')) return;
    f.appendChild(make('div', 'sn-footer-band', M.reedBand()));
    f.appendChild(make('div', 'sn-footer-rabbit', M.rabbit()));

    if (C.footerGreet) {
      var bottom = f.querySelector('.footer-bottom') || f.querySelector('.container');
      if (bottom && bottom.parentNode) {
        var g = make('div', 'sn-footer-greet',
          M.moon() + '<span class="sn-footer-greet-t"></span>');
        g.removeAttribute('aria-hidden');
        g.querySelector('.sn-footer-greet-t').textContent = C.footerGreet;
        bottom.parentNode.insertBefore(g, bottom.nextSibling);
      }
    }
  }

  /* ══ 로그인·회원가입·비밀번호 재설정 카드 ═════════════════════════ */

  function doAuth() {
    document.querySelectorAll('.auth-card, .success-card').forEach(function (card) {
      if (!once(card, 'moon')) return;
      if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
      card.appendChild(make('span', 'sn-card-moon', M.moon()));
    });
  }

  /* ══ 빈 상태 — 송편과 토끼로 바꾼다 ═══════════════════════════════ */

  function doEmpty() {
    document.querySelectorAll('.empty-state-icon, .empty-result-icon').forEach(function (ic) {
      if (!once(ic, 'art')) return;
      ic.innerHTML = '<span class="sn-empty-art">' + M.rabbitMortar() + '</span>';
      ic.setAttribute('aria-hidden', 'true');
    });
    // 아이콘 자리가 따로 없는 빈 상태에는 앞에 끼워 넣는다
    document.querySelectorAll('.empty-state').forEach(function (box) {
      if (box.querySelector('.sn-empty-art')) return;
      if (!once(box, 'art')) return;
      box.insertBefore(make('div', 'sn-empty-art sn-empty-art-wide', M.songpyeonSet()), box.firstChild);
    });
  }

  /* ══ 404 ══════════════════════════════════════════════════════════ */

  function do404() {
    var art = document.getElementById('nf-art');
    if (!art || !once(art, 'nf')) return;
    art.innerHTML = M.rabbitMortar();
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

  /* ══ 전체 훑기 ════════════════════════════════════════════════════ */

  // 한 군데가 넘어져도 나머지는 붙이되, 무슨 일인지는 남긴다.
  function warn(where, e) {
    if (window.console && console.warn) console.warn('[season] ' + where + ' 실패', e);
  }

  // 랜딩은 섹션을 전부 떼었다 순서대로 다시 붙인다. 그때 섹션이 아닌
  // 돗자리 줄만 제자리에 남아 화면 맨 위로 밀린다. 매번 제자리로 되돌린다.
  /* 억새·들꽃은 카드 판 안에 붙어 있어서, 화면이 넓으면 판 바깥 여백만큼
     가장자리가 빈다. 그 여백을 재서 그만큼 옆으로 늘려 화면 끝까지 채운다. */
  function placeReeds() {
    var hero = document.querySelector('[data-section="hero"]');
    var show = hero && hero.querySelector('.lp-hero-showcase');
    var l = hero && hero.querySelector('.sn-reeds-l');
    var r = hero && hero.querySelector('.sn-reeds-r');
    if (!show || !l || !r) return;
    var hr = hero.getBoundingClientRect(), sr = show.getBoundingClientRect();
    var over = window.innerWidth <= 768 ? 118 : 190;   // 판 위로 걸치는 몫
    var offL = Math.max(0, Math.round(sr.left - hr.left));
    var offR = Math.max(0, Math.round(hr.right - sr.right));
    l.style.left  = -offL + 'px'; l.style.width = (offL + over) + 'px';
    r.style.right = -offR + 'px'; r.style.width = (offR + over) + 'px';
  }

  /* 들꽃 밑단을 강좌 카드 판 바닥에 맞춘다. 판 아래 단계 안내 띠의 높이가
     화면 폭마다 달라서 CSS 로는 못 박는다. 판이 없으면 히어로 바닥에 둔다. */
  function placeFlowers() {
    var hero = document.querySelector('[data-section="hero"]');
    if (!hero) return;
    var fl = hero.querySelectorAll('.sn-flowers');
    if (!fl.length) return;
    var panel = hero.querySelector('.lp-hero-img');
    var gap = -6;
    if (panel && panel.offsetHeight) {
      gap = Math.round(hero.getBoundingClientRect().bottom - panel.getBoundingClientRect().bottom) - 4;
      // 좁은 화면은 판이 폭을 다 차지해 버튼과 겹친다. 판 아래 틈으로 조금 내린다.
      if (window.innerWidth <= 768) gap -= 18;
    }
    for (var i = 0; i < fl.length; i++) fl[i].style.bottom = gap + 'px';
  }

  /* 메뉴바가 히어로 윗부분을 얼마나 덮는지 잰다. 공지 띠를 닫으면
     메뉴바가 올라가 덮는 높이가 달라진다. 색동 액자와 방패가 이 값을 쓴다.
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
    try { placeFlowers(); } catch (e) { warn('placeFlowers', e); }
    try { placeFrame(); } catch (e) { warn('placeFrame', e); }
    try { placeReeds(); } catch (e) { warn('placeReeds', e); }
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
      rt = setTimeout(function () { placeFlowers(); placeFrame(); placeReeds(); }, 150);
    });

    // 늦게 오는 자료를 위해 몇 번 더
    [700, 1800, 3500].forEach(function (t) { setTimeout(scan, t); });
  };
})();
