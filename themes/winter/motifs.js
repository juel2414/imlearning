/* ── 겨울 모티프 ────────────────────────────────────────────────────────
   겨울 테마에 쓰는 그림을 전부 여기서 코드로 그린다. 그림 파일은 한 장도
   받지 않는다. 함수는 모두 SVG 문자열을 돌려주고, 색은 되도록
   currentColor 로 받는다. 그래서 쓰는 쪽에서 color 만 정하면 된다.

   공통 모티프(반짝임·별가루)는 themes/motifs.js 에 있는 것을 그대로 쓴다.
   여기 있는 것은 겨울에만 쓰는 것뿐이다.
   ──────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var S = window.SeasonMotifs || {};
  var jitter = S.jitter || function (n) {
    var v = Math.sin(n * 12.9898) * 43758.5453; return v - Math.floor(v);
  };
  var r = S.round || function (n) { return Math.round(n * 10) / 10; };

  function svg(vb, body, cls, extra) {
    return '<svg viewBox="' + vb + '" class="' + (cls || '') + '" ' +
      'xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"' +
      (extra ? ' ' + extra : '') + '>' + body + '</svg>';
  }

  // 그라데이션처럼 id 가 필요한 그림이 있다. 한 쪽에 둘이 있어도 안 겹치게.
  var seq = 0;

  /* ── 눈송이 ──────────────────────────────────────────────────────
     육각 결정. 가지 하나를 그려 60도씩 여섯 번 돌린다.
     씨앗을 달리 주면 가지 길이가 달라져 같은 모양이 두 번 나오지 않는다. */

  function flakeArm(seed) {
    var out = '<path d="M0 0 L0 -44"/>';
    // [축 위 어디쯤, 가지 길이]
    var BR = [[0.32, 14], [0.52, 11], [0.71, 8], [0.86, 5]];
    for (var i = 0; i < BR.length; i++) {
      var y = -44 * BR[i][0];
      var len = BR[i][1] * (0.72 + jitter(seed * 7 + i * 3) * 0.6);
      var up = len * 0.74;
      out += '<path d="M0 ' + r(y) + ' L' + r(len) + ' ' + r(y - up) + '"/>' +
             '<path d="M0 ' + r(y) + ' L' + r(-len) + ' ' + r(y - up) + '"/>';
    }
    // 끝에 작은 세 갈래
    out += '<path d="M0 -44 L5.5 -37.5"/><path d="M0 -44 L-5.5 -37.5"/>';
    return out;
  }

  function flakeBody(seed) {
    var arm = flakeArm((seed || 0) + 1), g = '';
    for (var k = 0; k < 6; k++) {
      g += '<g transform="rotate(' + (k * 60) + ')">' + arm + '</g>';
    }
    return '<g fill="none" stroke="currentColor" stroke-width="3" ' +
      'stroke-linecap="round">' + g + '</g>' +
      '<circle r="3.4" fill="currentColor"/>';
  }

  function flake(seed, cls) {
    return svg('-50 -50 100 100', flakeBody(seed), cls || 'sn-m-flake');
  }

  /* ── 별 — 큰 빛무리를 두른 겨울 별 ───────────────────────────────
     히어로와 배너의 주인공이다. 달 대신 이 별이 하늘을 밝힌다.
     아래로 뻗는 살이 길어서 눈 내리는 하늘에 걸린 것처럼 보인다. */

  function star(cls) {
    var id = 'sn-ws' + (++seq);
    var main = 'M0 -36 Q 7 -8 27 0 Q 7 8 0 55 Q -7 8 -27 0 Q -7 -8 0 -36 Z';
    var diag = 'M0 -21 Q 4 -4 16 0 Q 4 4 0 21 Q -4 4 -16 0 Q -4 -4 0 -21 Z';
    return '<svg viewBox="-72 -72 144 144" class="' + (cls || 'sn-m-star') + '" ' +
      'xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      '<defs><radialGradient id="' + id + '">' +
        '<stop offset="0%"   stop-color="#FFFBEC" stop-opacity=".92"/>' +
        '<stop offset="24%"  stop-color="#FFE7A8" stop-opacity=".42"/>' +
        '<stop offset="58%"  stop-color="#9FD4FF" stop-opacity=".17"/>' +
        '<stop offset="100%" stop-color="#9FD4FF" stop-opacity="0"/>' +
      '</radialGradient></defs>' +
      '<circle r="70" fill="url(#' + id + ')"/>' +
      '<g transform="rotate(45)"><path d="' + diag + '" fill="#FFE7A8" opacity=".72"/></g>' +
      '<path d="' + main + '" fill="#FFFBEC"/>' +
      '<circle r="5.2" fill="#fff"/>' +
      '</svg>';
  }

  /* ── 전나무 ──────────────────────────────────────────────────────
     층을 다섯 겹 쌓고, 각 층 위쪽에만 눈을 얇게 얹는다.
     아랫변이 조금 처져서 가지가 눈 무게로 내려앉은 것처럼 보인다. */

  function tier(y, w, h, droop) {
    return 'M0 ' + r(y - h) +
      ' C ' + r(w * 0.30) + ' ' + r(y - h * 0.55) + ', ' +
              r(w * 0.62) + ' ' + r(y - h * 0.18) + ', ' + r(w) + ' ' + r(y) +
      ' C ' + r(w * 0.55) + ' ' + r(y + droop) + ', ' +
              r(-w * 0.55) + ' ' + r(y + droop) + ', ' + r(-w) + ' ' + r(y) +
      ' C ' + r(-w * 0.62) + ' ' + r(y - h * 0.18) + ', ' +
              r(-w * 0.30) + ' ' + r(y - h * 0.55) + ', 0 ' + r(y - h) + ' Z';
  }

  // 층 위쪽 경사에만 붙는 눈. 위 경계는 층과 같고 아래 경계만 끌어올린다.
  function tierSnow(y, w, h) {
    return 'M0 ' + r(y - h) +
      ' C ' + r(w * 0.30) + ' ' + r(y - h * 0.55) + ', ' +
              r(w * 0.62) + ' ' + r(y - h * 0.18) + ', ' + r(w) + ' ' + r(y) +
      ' C ' + r(w * 0.58) + ' ' + r(y - h * 0.12) + ', ' +
              r(w * 0.33) + ' ' + r(y - h * 0.48) + ', 0 ' + r(y - h * 0.82) +
      ' C ' + r(-w * 0.33) + ' ' + r(y - h * 0.48) + ', ' +
              r(-w * 0.58) + ' ' + r(y - h * 0.12) + ', ' + r(-w) + ' ' + r(y) +
      ' C ' + r(-w * 0.62) + ' ' + r(y - h * 0.18) + ', ' +
              r(-w * 0.30) + ' ' + r(y - h * 0.55) + ', 0 ' + r(y - h) + ' Z';
  }

  // 바닥이 0, 꼭대기가 -186 인 나무 한 그루. 담는 쪽이 크기를 정한다.
  function firBody(seed) {
    var s = (seed || 0) + 1;
    var out = '<path class="sn-fr-trunk" d="M-4.5 6 L4.5 6 L3 -24 L-3 -24 Z"/>';
    var N = 5;
    for (var i = 0; i < N; i++) {
      var y = -18 - i * 28;
      var w = 50 - i * 8.4 + jitter(s * 9 + i * 5) * 3;
      var h = 40 - i * 1.6;
      out += '<path class="sn-fr-tier" d="' + tier(y, w, h, 7) + '"/>' +
             '<path class="sn-fr-snow" d="' + tierSnow(y, w, h) + '"/>';
    }
    // 꼭대기 한 겹
    var ty = -18 - N * 28;
    out += '<path class="sn-fr-tier" d="' + tier(ty, 13, 26, 4) + '"/>' +
           '<path class="sn-fr-snow" d="' + tierSnow(ty, 13, 26) + '"/>';
    return out;
  }

  function fir(seed, cls) {
    return svg('-58 -190 116 200', firBody(seed), cls || 'sn-m-fir');
  }

  /* 전나무 숲 한 띠 — 푸터와 히어로 양옆에 세운다.
     뒤쪽 나무는 흐리게 깔아 거리를 만든다. */
  function firRow(opt) {
    var o = opt || {};
    var W = o.width || 1440, H = o.height || 210, baseY = o.baseY || H - 4;
    var out = '', x = -24, i = 0;
    while (x < W + 44) {
      var sc = (o.minS || 0.46) + jitter(i * 17 + 3) * (o.spread || 0.46);
      var far = jitter(i * 23 + 5) > 0.52;
      out += '<g class="' + (far ? 'sn-fr-far' : 'sn-fr-near') + '" transform="translate(' +
        r(x) + ',' + r(baseY + (far ? -8 : 0)) + ') scale(' + r(far ? sc * 0.78 : sc) + ')">' +
        firBody(i) + '</g>';
      x += (o.step || 58) * sc + jitter(i * 11 + 1) * 26;
      i++;
    }
    return svg('0 0 ' + W + ' ' + H, out, o.cls || 'sn-m-firrow',
      o.slice ? 'preserveAspectRatio="xMidYMax slice"' : '');
  }

  /* ── 전구 줄 ─────────────────────────────────────────────────────
     처진 줄에 알전구를 매단다. 전구마다 켜지는 시각을 달리해
     빛이 줄을 따라 흐르게 한다. */

  var BULB = ['#FFC861', '#FF8E7A', '#8FD6B4', '#9FD4FF', '#FFF0B8'];

  function lights(n, cls) {
    var N = n || 9, W = 420, sag = 52;
    var out = '<path class="sn-lt-cord" d="M0 5 Q ' + (W / 2) + ' ' +
      r(5 + sag * 1.3) + ' ' + W + ' 5"/>';
    for (var i = 1; i <= N; i++) {
      var t = i / (N + 1);
      var x = W * t, y = 5 + Math.sin(Math.PI * t) * sag;
      var tint = BULB[i % BULB.length];
      out += '<g class="sn-lt-b" style="animation-delay:' + r(i * 0.27) + 's" ' +
        'transform="translate(' + r(x) + ',' + r(y) + ')">' +
        '<circle class="sn-lt-halo" cy="15" r="16" fill="' + tint + '"/>' +
        '<path class="sn-lt-cap" d="M-3.6 0 h7.2 v5 h-7.2 z"/>' +
        '<path class="sn-lt-bulb" fill="' + tint + '" ' +
        'd="M-5.6 5 C -9.4 11, -7 20.5, 0 20.5 C 7 20.5, 9.4 11, 5.6 5 Z"/>' +
        '</g>';
    }
    return svg('0 0 ' + W + ' ' + (sag + 44), out, cls || 'sn-m-lights');
  }

  /* ── 눈더미 구분선 ───────────────────────────────────────────────
     칸과 칸 사이에 쌓인 눈. 앞뒤로 두 겹이라 두께가 느껴진다. */

  function drift(cls) {
    return '<svg class="' + (cls || 'sn-divider-svg') + '" viewBox="0 0 1440 56" ' +
      'width="100%" height="56" preserveAspectRatio="none" ' +
      'xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      '<path class="sn-dr-far" d="M0 56 C 120 33, 262 46, 382 37 ' +
        'C 522 27, 642 44, 782 35 C 922 26, 1062 45, 1202 36 ' +
        'C 1312 30, 1382 40, 1440 35 L1440 56 Z"/>' +
      '<path class="sn-dr-near" d="M0 56 C 162 44, 302 54, 442 46 ' +
        'C 602 38, 722 52, 882 45 C 1032 39, 1152 52, 1292 45 ' +
        'C 1362 42, 1412 48, 1440 45 L1440 56 Z"/>' +
      '</svg>';
  }

  /* ── 고드름 ──────────────────────────────────────────────────────
     처마 밑에 매달린다. 액자 윗변과 푸터 윗변에 쓴다. */

  function icicles(opt) {
    var o = opt || {};
    var W = o.width || 1440, H = o.height || 64;
    var out = '<path class="sn-ic-ledge" d="M0 0 H' + W + ' V9 H0 Z"/>';
    var x = 0, i = 0;
    while (x < W) {
      var w = 7 + jitter(i * 7 + 1) * 9;
      var h = 11 + jitter(i * 11 + 3) * (o.len || 40);
      out += '<path class="sn-ic" d="M' + r(x) + ' 5 Q ' + r(x + w * 0.5) + ' ' +
        r(h * 0.66) + ' ' + r(x + w * 0.5) + ' ' + r(h) + ' Q ' + r(x + w * 0.5) +
        ' ' + r(h * 0.66) + ' ' + r(x + w) + ' 5 Z"/>';
      x += w + 2.5 + jitter(i * 5 + 2) * 11;
      i++;
    }
    return svg('0 0 ' + W + ' ' + H, out, o.cls || 'sn-m-icicles',
      'preserveAspectRatio="xMidYMin slice"');
  }

  /* ── 호랑가시 — 가시 돋은 잎과 붉은 열매 ─────────────────────────
     잎 윤곽을 타원에서 뽑아 한 칸씩 번갈아 뾰족하게 민다. */

  function hollyLeaf(L, W2) {
    var pts = [], N = 16, i;
    for (i = 0; i <= N; i++) {
      var t = i / N;
      var base = Math.sin(Math.PI * t) * W2;
      pts.push([base * (i % 2 === 0 ? 1.5 : 0.76), -L * t]);
    }
    var d = 'M0 0';
    for (i = 1; i < pts.length; i++) d += ' L' + r(pts[i][0]) + ' ' + r(pts[i][1]);
    for (i = pts.length - 2; i >= 0; i--) d += ' L' + r(-pts[i][0]) + ' ' + r(pts[i][1]);
    return d + ' Z';
  }

  function holly(cls) {
    var leaf = hollyLeaf(52, 13);
    var out =
      '<g transform="translate(-6 6) rotate(-26)">' +
        '<path class="sn-ho-leaf" d="' + leaf + '"/>' +
        '<path class="sn-ho-rib" d="M0 -3 L0 -48"/></g>' +
      '<g transform="translate(6 8) rotate(32)">' +
        '<path class="sn-ho-leaf" d="' + leaf + '"/>' +
        '<path class="sn-ho-rib" d="M0 -3 L0 -48"/></g>' +
      '<circle class="sn-ho-berry" cx="-6"  cy="10" r="6.4"/>' +
      '<circle class="sn-ho-berry" cx="6.5" cy="13" r="5.8"/>' +
      '<circle class="sn-ho-berry" cx="0"   cy="20" r="5.4"/>' +
      '<circle class="sn-ho-shine" cx="-8"  cy="7.5" r="1.7"/>';
    return svg('-40 -56 80 86', out, cls || 'sn-m-holly');
  }

  /* ── 솔방울 ──────────────────────────────────────────────────────
     비늘을 줄마다 어긋나게 얹는다. 위로 갈수록 좁아진다. */

  function pinecone(cls) {
    var out = '<path class="sn-pc-stem" d="M0 -2 L0 8"/>';
    for (var i = 0; i < 8; i++) {
      var y = -6 - i * 8.6;
      var n = i < 2 ? 2 : 3;
      var sp = 7.6 - i * 0.55;                 // 비늘 사이
      var rx = 6.6 - i * 0.48, ry = 5.4 - i * 0.34;
      for (var k = 0; k < n; k++) {
        var x = (k - (n - 1) / 2) * sp;
        out += '<ellipse class="sn-pc-sc" cx="' + r(x) + '" cy="' + r(y) +
          '" rx="' + r(rx) + '" ry="' + r(ry) + '"/>';
      }
    }
    return svg('-26 -84 52 96', out, cls || 'sn-m-pinecone');
  }

  /* ── 눈사람 — 빈 화면과 404 의 주인공 ────────────────────────────
     목도리를 두르고 당근 코를 달았다. 추석 테마의 토끼 자리다. */

  function snowman(cls) {
    var out =
      '<ellipse class="sn-sm-shadow" cx="0" cy="8" rx="40" ry="7"/>' +
      // 팔 — 나뭇가지
      '<path class="sn-sm-arm" d="M-21 -58 L-48 -76 M-40 -71 L-47 -64 M-44 -74 L-45 -84"/>' +
      '<path class="sn-sm-arm" d="M21 -58 L49 -70 M41 -67 L48 -60 M45 -69 L47 -79"/>' +
      // 몸
      '<circle class="sn-sm-body" cx="0" cy="-28" r="32"/>' +
      '<circle class="sn-sm-body" cx="0" cy="-73" r="23"/>' +
      '<circle class="sn-sm-body" cx="0" cy="-108" r="17"/>' +
      // 단추
      '<circle class="sn-sm-coal" cx="0" cy="-36" r="3.1"/>' +
      '<circle class="sn-sm-coal" cx="0" cy="-24" r="3.1"/>' +
      '<circle class="sn-sm-coal" cx="0" cy="-12" r="3.1"/>' +
      // 목도리
      '<path class="sn-sm-scarf" d="M-19 -92 C -8 -85, 8 -85, 19 -92 ' +
        'C 20 -86, 20 -82, 19 -78 C 8 -71, -8 -71, -19 -78 Z"/>' +
      '<path class="sn-sm-scarf" d="M12 -80 C 20 -74, 24 -62, 21 -50 ' +
        'L10 -52 C 13 -62, 12 -72, 7 -78 Z"/>' +
      // 얼굴
      '<circle class="sn-sm-coal" cx="-6" cy="-113" r="2.6"/>' +
      '<circle class="sn-sm-coal" cx="6"  cy="-113" r="2.6"/>' +
      '<path class="sn-sm-nose" d="M0 -108 L19 -103 L0 -101 Z"/>' +
      '<path class="sn-sm-smile" d="M-7 -100 Q 0 -95 7 -100"/>' +
      // 니트 모자
      '<path class="sn-sm-hat" d="M-18 -119 C -17 -134, -8 -141, 0 -141 ' +
        'C 8 -141, 17 -134, 18 -119 Z"/>' +
      '<path class="sn-sm-hat-br" d="M-19 -122 h38 v7 h-38 z"/>' +
      '<circle class="sn-sm-hat" cx="0" cy="-146" r="6"/>';
    return svg('-62 -158 124 176', out, cls || 'sn-m-snowman');
  }

  /* ── 리스 — 전나무 가지를 둥글게 엮고 리본을 묶는다 ─────────────── */

  function wreath(cls) {
    var out = '', i;
    for (i = 0; i < 26; i++) {
      var a = i / 26 * Math.PI * 2;
      var R = 33 + jitter(i * 7 + 1) * 5;
      var ang = a * 180 / Math.PI + 90 + (jitter(i * 11 + 2) * 36 - 18);
      out += '<g transform="translate(' + r(Math.cos(a) * R) + ',' + r(Math.sin(a) * R) +
        ') rotate(' + r(ang) + ')"><path class="sn-wr-sprig" d="M0 2 L0 -14 ' +
        'M0 -3 L-5.5 -9.5 M0 -3 L5.5 -9.5 M0 -8.5 L-4.5 -14 M0 -8.5 L4.5 -14"/></g>';
    }
    for (i = 0; i < 7; i++) {
      var b = i / 7 * Math.PI * 2 + 0.45;
      out += '<circle class="sn-wr-berry" cx="' + r(Math.cos(b) * 32) + '" cy="' +
        r(Math.sin(b) * 32) + '" r="3.6"/>';
    }
    out += '<path class="sn-wr-bow" d="M-14 35 Q -2 27 0 36 Q -2 45 -14 35 Z"/>' +
           '<path class="sn-wr-bow" d="M14 35 Q 2 27 0 36 Q 2 45 14 35 Z"/>' +
           '<circle class="sn-wr-knot" cx="0" cy="36" r="3.6"/>';
    return svg('-52 -52 104 104', out, cls || 'sn-m-wreath');
  }

  /* ── 촛불 — 문의하기 같은 조용한 자리에 하나 ─────────────────────── */

  function candle(cls) {
    var out =
      '<path class="sn-cd-glow" d="M0 -36 C 13 -36, 18 -20, 18 -8 ' +
        'C 18 6, 9 14, 0 14 C -9 14, -18 6, -18 -8 C -18 -20, -13 -36, 0 -36 Z"/>' +
      '<path class="sn-cd-body" d="M-11 -14 h22 v62 h-22 z"/>' +
      '<path class="sn-cd-drip" d="M-11 -14 C -6 -8, 6 -8, 11 -14 L11 -4 ' +
        'C 6 2, -6 2, -11 -4 Z"/>' +
      '<path class="sn-cd-wick" d="M0 -14 L0 -22"/>' +
      '<path class="sn-cd-flame" d="M0 -46 C 8 -36, 9 -26, 4 -20 ' +
        'C 1 -17, -1 -17, -4 -20 C -9 -26, -8 -36, 0 -46 Z"/>' +
      '<path class="sn-cd-core" d="M0 -37 C 3.5 -31, 4 -26, 1.6 -22.5 ' +
        'C 0.4 -21, -0.4 -21, -1.6 -22.5 C -4 -26, -3.5 -31, 0 -37 Z"/>';
    return svg('-34 -56 68 112', out, cls || 'sn-m-candle');
  }

  /* ── 니트 무늬 띠 — 색동 자리를 대신한다 ──────────────────────────
     북유럽 스웨터처럼 별 모티프와 지그재그를 번갈아 짠다. */

  function knitRow(seed, cls, opt) {
    var o = opt || {}, n = o.count || 7, w = o.w || 36, out = '';
    for (var i = 0; i < n; i++) {
      var x = i * w;
      if ((i + (seed || 0)) % 2) {
        out += '<g transform="translate(' + r(x + w / 2) + ',17)">' +
          '<path class="sn-kn-line" d="M0 -9.5 L0 9.5 M-9.5 0 L9.5 0 ' +
          'M-6.5 -6.5 L6.5 6.5 M-6.5 6.5 L6.5 -6.5"/>' +
          '<path class="sn-kn-line" d="M-4 -7 L4 -7 M-4 7 L4 7 ' +
          'M-7 -4 L-7 4 M7 -4 L7 4"/></g>';
      } else {
        out += '<path class="sn-kn-line" d="M' + r(x) + ' 26 L' + r(x + w * 0.25) +
          ' 9 L' + r(x + w * 0.5) + ' 26 L' + r(x + w * 0.75) + ' 9 L' +
          r(x + w) + ' 26"/>';
      }
    }
    return svg('0 0 ' + (n * w) + ' 34', out, cls || 'sn-m-knit');
  }

  /* ── 눈구름 — 눈을 머금은 둥근 구름 ──────────────────────────────── */

  function snowCloud(cls) {
    return svg('0 0 220 92',
      '<path class="sn-cl-body" d="M24 74 C 7 74, 3 57, 17 51 ' +
        'C 15 33, 35 23, 49 33 C 55 13, 85 9, 97 27 ' +
        'C 111 11, 143 15, 149 35 C 171 29, 193 43, 189 61 ' +
        'C 205 63, 207 75, 193 76 Z"/>' +
      '<path class="sn-cl-line" d="M36 64 C 46 56, 62 55, 72 61"/>' +
      '<path class="sn-cl-line" d="M98 60 C 108 52, 126 52, 136 58"/>',
      cls || 'sn-m-cloud');
  }

  window.SeasonMotifsWinter = {
    flake: flake, flakeBody: flakeBody,
    star: star,
    fir: fir, firBody: firBody, firRow: firRow,
    lights: lights,
    drift: drift, icicles: icicles,
    holly: holly, pinecone: pinecone,
    snowman: snowman, wreath: wreath, candle: candle,
    knitRow: knitRow, snowCloud: snowCloud
  };
})();
