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

  /* ── 히어로 아래 — 돗자리에 윷판을 깔고 수확물을 쌓는다 ─────────
     산·억새·담장을 코드로 그리던 것을 걷어 내고, 받은 그림으로 바꿨다. */
  function ground() {
    return make('div', 'sn-ground',
      '<span class="sn-g sn-g-mat">'     + M.piece('mat')     + '</span>' +
      '<span class="sn-g sn-g-pumpkin">' + M.piece('pumpkin') + '</span>' +
      '<span class="sn-g sn-g-squash">'  + M.piece('squash')  + '</span>' +
      '<span class="sn-g sn-g-rabbit">'  + M.rabbit()         + '</span>');
  }

  function stars() {
    var pts = [[6, 16], [13, 32], [21, 11], [28, 26], [35, 7], [43, 19],
               [52, 9], [58, 28], [64, 14], [71, 24], [78, 8], [84, 30],
               [90, 17], [96, 27], [17, 44], [47, 38], [75, 41], [88, 46]];
    return pts.map(function (p, i) {
      var s = 1.5 + M.jitter(i * 7) * 2.2;
      return '<span class="sn-star" style="left:' + p[0] + '%;top:' + p[1] + '%;' +
        'width:' + r(s) + 'px;height:' + r(s) + 'px;' +
        'animation-duration:' + r(3 + M.jitter(i * 3) * 4) + 's;' +
        'animation-delay:-' + r(M.jitter(i * 11) * 5) + 's"></span>';
    }).join('');
  }

  function cloud(cls) {
    return '<div class="sn-cloud ' + cls + '">' +
      '<svg viewBox="0 0 300 80" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M40 64 C 14 64, 10 40, 34 36 C 34 16, 64 10, 76 26 C 88 8, 124 10, 130 30 ' +
      'C 152 22, 176 34, 174 50 C 196 48, 206 64, 188 64 Z"/>' +
      '<path d="M196 66 C 178 66, 176 50, 192 48 C 194 34, 216 32, 222 44 ' +
      'C 234 34, 256 40, 256 54 C 274 54, 278 66, 264 66 Z" opacity=".8"/>' +
      '</svg></div>';
  }

  var LEAF_HUES = ['#E4552F', '#F0902B', '#C9362C', '#EFBB47', '#D9663A', '#E8A33A', '#CF4A2E'];

  function leaves(n) {
    var out = '';
    for (var i = 0; i < (n || 8); i++) {
      var j = M.jitter(i * 5 + 1), k = M.jitter(i * 9 + 4);
      var size = 16 + j * 10, hue = LEAF_HUES[i % LEAF_HUES.length];
      out += '<span class="sn-leaf" style="left:' + r(5 + i * 12 + k * 7) + '%;' +
        'animation-duration:' + r(16 + j * 12) + 's;animation-delay:-' + r(k * 24) + 's">' +
        '<span class="sn-leaf-i" style="animation-duration:' + r(4 + k * 4) + 's;' +
        'animation-delay:-' + r(j * 4) + 's">' +
        '<svg viewBox="0 0 28 30" width="' + r(size) + '" height="' + r(size * 30 / 28) + '" ' +
        'xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<path d="M14 20 L14 28" stroke="' + hue + '" stroke-width="1.6" ' +
        'stroke-linecap="round" fill="none"/>' +
        '<path d="' + M.leafPath + '" fill="' + hue + '"/>' +
        '</svg></span></span>';
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
        '<div class="sn-trim"></div>' +
        '<div class="sn-halo"></div>' +
        '<div class="sn-moon"></div>' +
        stars() + cloud('sn-cloud-1') + cloud('sn-cloud-2') +
        (h.full ? cloud('sn-cloud-3') : '') +
        '<div class="sn-pine">' + M.pineBough() + '</div>' +
        // 솔가지에 송편을 얹는다
        (h.full ? '<span class="sn-perch sn-perch-1">' + M.songpyeon('', 'pink') + '</span>' +
                  '<span class="sn-perch sn-perch-2">' + M.songpyeon('', 'ssuk') + '</span>' +
                  '<span class="sn-perch sn-perch-3">' + M.songpyeon('', 'chija') + '</span>' +
                  '<span class="sn-perch sn-perch-4">' + M.piece('pinecone') + '</span>' : '') +
        '');
      h.el.appendChild(back);

      h.el.appendChild(make('div', 'sn-deco-front', leaves(h.full ? 8 : 5)));

      // 돗자리는 히어로 안에 두면 아래쪽 강좌 카드에 가린다.
      // 히어로 다음 자리에 제 줄로 놓아 자리를 차지하게 한다.
      if (h.full && h.el.parentNode) {
        h.el.parentNode.insertBefore(ground(), h.el.nextSibling);
      }

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

  function doCards() {
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
  function keepGround() {
    var g = document.querySelector('.sn-ground');
    var hero = document.querySelector('[data-section="hero"]');
    if (!g || !hero || !hero.parentNode) return;
    if (hero.nextSibling === g) return;
    hero.parentNode.insertBefore(g, hero.nextSibling);
  }

  function scan() {
    try { doNav(); } catch (e) { warn('doNav', e); }
    try { doHero(); } catch (e) { warn('doHero', e); }
    try { keepGround(); } catch (e) { warn('keepGround', e); }
    try { doDividers(); } catch (e) { warn('doDividers', e); }
    try { doCards(); } catch (e) { warn('doCards', e); }
    try { doLight(); } catch (e) { warn('doLight', e); }
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

    // 늦게 오는 자료를 위해 몇 번 더
    [700, 1800, 3500].forEach(function (t) { setTimeout(scan, t); });
  };
})();
