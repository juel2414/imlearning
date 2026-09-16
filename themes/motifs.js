/* ── 시즌 모티프 ────────────────────────────────────────────────────────
   장식에 쓰는 그림을 전부 여기서 코드로 그린다. 외부 이미지는 쓰지 않는다.
   함수는 모두 SVG 문자열을 돌려주고, 색은 currentColor 로 받는다.
   그래서 쓰는 쪽에서 color 만 정하면 된다.

   테마가 달라져도 모양은 그대로 쓸 수 있는 것들(구름문양, 매듭 같은)은
   여기 두고, 추석에만 쓰는 것도 일단 여기 모아 둔다.
   ──────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  function svg(vb, body, cls, extra) {
    return '<svg viewBox="' + vb + '" class="' + (cls || '') + '" ' +
      'xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"' +
      (extra ? ' ' + extra : '') + '>' + body + '</svg>';
  }

  // 같은 자리에는 늘 같은 값이 나오는 흩뜨림
  function jitter(n) { var v = Math.sin(n * 12.9898) * 43758.5453; return v - Math.floor(v); }
  function r(n) { return Math.round(n * 10) / 10; }

  /* ── 보름달 ──────────────────────────────────────────────────────
     달은 그라디언트가 필요해 SVG 대신 CSS 로 그린다(theme.css 의 .sn-moon).
     여기 것은 작게 찍는 용도 — 로고 옆, 푸터, 빈 상태 같은 자리. */
  function moon(cls) {
    return svg('0 0 40 40',
      '<circle cx="20" cy="20" r="18" fill="currentColor"/>' +
      '<circle cx="14" cy="15" r="4"   fill="#000" opacity=".10"/>' +
      '<circle cx="25" cy="24" r="2.6" fill="#000" opacity=".10"/>' +
      '<circle cx="27" cy="14" r="1.8" fill="#000" opacity=".08"/>',
      cls || 'sn-m-moon');
  }

  /* ── 달토끼 — 앉아서 왼쪽을 보는 옆모습 ────────────────────────── */
  function rabbit(cls) {
    return svg('0 0 100 100',
      '<g fill="currentColor">' +
      '<ellipse cx="58" cy="70" rx="27" ry="22"/>' +                 // 몸
      '<circle cx="34" cy="56" r="15"/>' +                           // 머리
      '<path d="M29 43 C 25 25, 29 11, 35 11 C 41 11, 42 30, 37 45 Z"/>' +  // 귀
      '<path d="M40 44 C 40 27, 47 16, 52 19 C 57 22, 52 35, 47 46 Z"/>' +
      '<circle cx="83" cy="65" r="8"/>' +                            // 꼬리
      '<path d="M34 88 C 34 82, 44 80, 50 84 C 52 88, 44 91, 36 90 Z"/>' +  // 앞발
      '</g>' +
      '<circle cx="28" cy="53" r="2" fill="#000" opacity=".35"/>',   // 눈
      cls || 'sn-m-rabbit');
  }

  /* ── 방아 찧는 토끼 — 빈 상태나 404 처럼 자리가 넉넉할 때 ──────── */
  function rabbitMortar(cls) {
    return svg('0 0 150 112',
      // 절구
      '<g class="sn-m-mortar">' +
      '<path d="M96 74 L146 74 L137 104 L105 104 Z" fill="currentColor" opacity=".45"/>' +
      '<ellipse cx="121" cy="74" rx="25" ry="7" fill="currentColor" opacity=".7"/>' +
      '<ellipse cx="121" cy="74" rx="17" ry="4.5" fill="#000" opacity=".28"/>' +
      '<ellipse cx="121" cy="72" rx="13" ry="3.4" fill="#fff" opacity=".55"/>' +   // 떡
      '</g>' +
      // 절굿공이 — 토끼 앞발에서 절구로 내려간다
      '<g stroke="var(--sn-stem, #6B4A2E)" stroke-linecap="round" fill="none">' +
      '<path d="M63 33 L104 61" stroke-width="7"/>' +
      '</g>' +
      '<ellipse cx="110" cy="65" rx="10" ry="8" fill="var(--sn-stem, #6B4A2E)" ' +
      'transform="rotate(34 110 65)"/>' +
      // 토끼
      '<g fill="currentColor">' +
      '<ellipse cx="46" cy="72" rx="20" ry="26"/>' +
      '<circle cx="47" cy="40" r="14"/>' +
      '<path d="M40 29 C 34 12, 38 0, 44 1 C 50 3, 48 18, 44 31 Z"/>' +
      '<path d="M52 30 C 54 13, 61 4, 66 7 C 70 11, 62 24, 56 32 Z"/>' +
      '<ellipse cx="34" cy="96" rx="12" ry="6"/>' +                                 // 발
      '</g>' +
      // 앞발이 공이를 잡는다
      '<g stroke="currentColor" stroke-width="8" stroke-linecap="round" fill="none">' +
      '<path d="M55 52 L69 38"/><path d="M58 62 L74 45"/>' +
      '</g>' +
      '<circle cx="41" cy="37" r="2.2" fill="#000" opacity=".35"/>',
      cls || 'sn-m-rabbit-mortar');
  }

  /* ── 송편 — 반달 모양, 위에 솔잎 자국 ──────────────────────────── */
  function songpyeon(cls) {
    return svg('0 0 100 72',
      '<path d="M4 57 C 6 24, 26 7, 50 7 C 74 7, 94 24, 96 57 ' +
      'C 74 61, 26 61, 4 57 Z" fill="currentColor"/>' +
      '<path d="M16 34 C 24 20, 36 13, 50 13" stroke="#fff" stroke-opacity=".35" ' +
      'stroke-width="5" stroke-linecap="round" fill="none"/>' +
      '<g stroke="var(--sn-leaf, #3E7A4E)" stroke-opacity=".55" stroke-width="2.4" ' +
      'stroke-linecap="round" fill="none">' +
      '<path d="M36 26 L28 16"/><path d="M42 22 L38 11"/><path d="M62 23 L68 13"/>' +
      '</g>',
      cls || 'sn-m-songpyeon');
  }

  /* ── 감 — 꼭지 네 갈래 ─────────────────────────────────────────── */
  function persimmon(cls) {
    return svg('0 0 100 100',
      '<path d="M50 95 C 24 95, 11 77, 11 58 C 11 38, 28 25, 50 25 ' +
      'C 72 25, 89 38, 89 58 C 89 77, 76 95, 50 95 Z" fill="currentColor"/>' +
      '<path d="M50 30 C 44 30, 38 27, 34 22 C 40 22, 46 24, 50 27 ' +
      'C 54 24, 60 22, 66 22 C 62 27, 56 30, 50 30 Z" fill="#000" opacity=".08"/>' +
      '<g class="sn-m-calyx">' +
      '<path d="M50 16 L64 25 L82 27 L66 34 L50 40 L34 34 L18 27 L36 25 Z" ' +
      'fill="var(--sn-leaf, #3E7A4E)"/>' +
      '<rect x="46" y="4" width="8" height="14" rx="4" fill="var(--sn-stem, #6B4A2E)"/>' +
      '</g>',
      cls || 'sn-m-persimmon');
  }

  /* ── 밤 ─────────────────────────────────────────────────────────── */
  function chestnut(cls) {
    return svg('0 0 100 100',
      '<path d="M50 12 C 62 12, 85 35, 87 62 C 88 78, 73 87, 50 87 ' +
      'C 27 87, 12 78, 13 62 C 15 35, 38 12, 50 12 Z" fill="currentColor"/>' +
      '<path d="M14 64 C 30 74, 70 74, 86 64 C 87 79, 72 87, 50 87 ' +
      'C 28 87, 13 79, 14 64 Z" fill="#000" opacity=".16"/>' +
      '<path d="M47 12 L50 2 L53 12 Z" fill="currentColor"/>' +
      '<path d="M34 34 C 40 28, 48 25, 54 26" stroke="#fff" stroke-opacity=".22" ' +
      'stroke-width="4" stroke-linecap="round" fill="none"/>',
      cls || 'sn-m-chestnut');
  }

  /* ── 단풍잎 — 한 점에서 갈라진 다섯 갈래 ──────────────────────── */
  var LEAF_PATH = (function () {
    var lobes = [[-90, 15.5, 4.6], [-137, 12.8, 4.1], [-43, 12.8, 4.1],
                 [-176, 9.2, 3.2], [-4, 9.2, 3.2]];
    var bx = 14, by = 20, d = '';
    lobes.forEach(function (lo) {
      var a = lo[0] * Math.PI / 180, L = lo[1], W = lo[2];
      var tx = bx + Math.cos(a) * L, ty = by + Math.sin(a) * L;
      var mx = bx + Math.cos(a) * L * 0.5, my = by + Math.sin(a) * L * 0.5;
      var px = -Math.sin(a) * W, py = Math.cos(a) * W;
      d += 'M' + r(bx) + ' ' + r(by) +
           ' Q' + r(mx + px) + ' ' + r(my + py) + ' ' + r(tx) + ' ' + r(ty) +
           ' Q' + r(mx - px) + ' ' + r(my - py) + ' ' + r(bx) + ' ' + r(by) + 'Z';
    });
    return d;
  })();

  function maple(cls) {
    return svg('0 0 28 30',
      '<path d="M14 20 L14 28" stroke="currentColor" stroke-width="1.6" ' +
      'stroke-linecap="round" fill="none"/>' +
      '<path d="' + LEAF_PATH + '" fill="currentColor"/>',
      cls || 'sn-m-maple');
  }

  /* ── 억새 ───────────────────────────────────────────────────────
     한 줄기를 아래에서 위로 자라는 제 좌표계에 그린 뒤 제자리로 옮긴다. */
  function reed(h, lean, seed) {
    var bend = lean * 0.22, P = h * 0.34;
    var side = seed % 2 ? 1 : -1;
    var tipX = bend + P * 0.34 * side, tipY = -h - P;
    var cX = bend + P * 0.06 * side, cY = -h - P * 0.62;

    var stalk = 'M0 0 Q ' + r(bend * 0.35) + ' ' + r(-h * 0.52) + ' ' + r(bend) + ' ' + r(-h);
    var spine = 'M' + r(bend) + ' ' + r(-h) + ' Q ' + r(cX) + ' ' + r(cY) + ' ' + r(tipX) + ' ' + r(tipY);

    var hairs = '', N = 22;
    for (var i = 1; i <= N; i++) {
      var t = i / N, mt = 1 - t;
      var px = mt * mt * bend + 2 * mt * t * cX + t * t * tipX;
      var py = mt * mt * (-h) + 2 * mt * t * cY + t * t * tipY;
      var j = jitter(seed * 31 + i);
      var len = P * 0.38 * (0.28 + 0.72 * Math.sin(Math.PI * t)) * (0.7 + 0.6 * j);
      var sgn = i % 2 ? 1 : -1;
      var drop = 0.34 + 0.40 * t + 0.2 * j;
      var ex = px + sgn * len * (0.92 - 0.25 * j), ey = py + len * drop;
      var qx = px + sgn * len * 0.60, qy = py + len * (drop * 0.12);
      hairs += 'M' + r(px) + ' ' + r(py) + ' Q ' + r(qx) + ' ' + r(qy) + ' ' + r(ex) + ' ' + r(ey);
    }
    return '<path class="sn-stalk" d="' + stalk + '"/>' +
           '<path class="sn-stalk" d="' + spine + '"/>' +
           '<path class="sn-plume" d="' + hairs + '"/>';
  }

  // 억새 한 줄. 줄기마다 흔들리는 시각을 달리해 바람처럼 보이게 한다.
  function reedRow(opt) {
    var o = opt || {};
    var W = o.width || 1440, baseY = o.baseY || 0;
    var minH = o.minH || 92, spread = o.spread || 70, step = o.step || 38;
    var sways = ['sn-sway', 'sn-sway-2', 'sn-sway-3', 'sn-sway-4'];
    var body = '', x = -10, i = 0;
    while (x < W + 20) {
      var h = minH + ((i * 37) % spread);
      var lean = ((i * 53) % 25) - 12;
      body += '<g class="' + sways[i % 4] + '">' +
                '<g transform="translate(' + x + ',' + baseY + ') rotate(' + lean + ')">' +
                  reed(h, lean, i) +
                '</g></g>';
      x += step + ((i * 17) % 18);
      i++;
    }
    return '<g class="' + (o.cls || 'sn-reeds') + '">' + body + '</g>';
  }

  // 억새만 따로 한 띠로 — 푸터나 좁은 자리에 쓴다
  function reedBand(cls) {
    return svg('0 0 1440 140',
      reedRow({ width: 1440, baseY: 138, minH: 60, spread: 44, step: 46, cls: 'sn-reeds-far' }) +
      reedRow({ width: 1440, baseY: 140, minH: 78, spread: 52, step: 52, cls: 'sn-reeds' }),
      cls || 'sn-m-reedband', 'preserveAspectRatio="none"');
  }

  /* ── 소나무 가지 ────────────────────────────────────────────────── */
  function needles(cx, cy, dir, n, len, off) {
    var d = '';
    for (var i = 0; i < n; i++) {
      var a = dir + (i / (n - 1) - 0.5) * 2.1;
      a += (jitter(cx * 3 + cy + i + off) - 0.5) * 0.16;
      var L = len * (0.6 + jitter(cx + cy * 2 + i + off) * 0.55);
      d += 'M' + r(cx) + ' ' + r(cy) + 'L' + r(cx + Math.cos(a) * L) + ' ' + r(cy + Math.sin(a) * L);
    }
    return d;
  }

  function pineBough(cls) {
    var branch = 'M-14 8 C 54 24, 116 52, 188 90 C 228 112, 262 132, 292 154';
    var subs = ['M86 38 C 78 62, 72 78, 66 96',
                'M162 72 C 168 98, 172 114, 178 132',
                'M238 112 C 228 134, 222 148, 214 166'];
    var clusters = [
      [30, 18, -1.9, 26, 30], [92, 42, -1.6, 26, 32], [152, 68, -2.1, 24, 28],
      [212, 100, -1.7, 26, 31], [280, 146, -1.9, 26, 30],
      [64, 100, 1.5, 24, 28], [180, 138, 1.4, 24, 29], [210, 172, 1.7, 22, 26],
      [126, 52, 0.9, 20, 24], [246, 124, 1.1, 20, 25],
      [58, 30, -2.4, 20, 26], [128, 76, -1.3, 20, 27], [252, 130, -2.3, 20, 27]
    ];
    var dark = clusters.map(function (c) { return needles(c[0], c[1] + 2, c[2], c[3], c[4] * 1.06, 7); }).join('');
    var lite = clusters.map(function (c) { return needles(c[0], c[1], c[2], c[3], c[4] * 0.9, 0); }).join('');
    return svg('0 0 340 200',
      '<path class="sn-bough" d="' + branch + '"/>' +
      subs.map(function (s) { return '<path class="sn-bough sn-bough-sm" d="' + s + '"/>'; }).join('') +
      '<path class="sn-needle-d" d="' + dark + '"/>' +
      '<path class="sn-needle" d="' + lite + '"/>',
      cls || 'sn-m-pine');
  }

  /* ── 전통 구름문양 — 섹션 구분선에 이어 붙인다 ──────────────────
     덩어리 하나에 말린 꼬리가 달린 모양. 좌우로 되풀이해도 이가 맞는다. */
  function cloudMotif(cls) {
    return svg('0 0 160 56',
      '<g fill="none" stroke="currentColor" stroke-width="2.6" ' +
      'stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M2 48 C 2 36, 13 30, 23 34 C 26 21, 45 16, 54 27 ' +
      'C 65 18, 82 24, 84 37 C 96 34, 106 40, 107 48"/>' +
      '<path d="M107 48 C 107 36, 119 30, 128 36 C 136 42, 133 53, 124 52 ' +
      'C 118 51, 117 44, 122 42"/>' +
      '<path d="M136 48 L158 48"/>' +
      '<path d="M30 46 C 34 40, 42 38, 48 41"/>' +
      '<path d="M62 44 C 66 38, 74 37, 79 40"/>' +
      '</g>',
      cls || 'sn-m-cloud');
  }

  /* ── 구름문양 구분선 ────────────────────────────────────────────
     SVG 패턴으로 가로로 이어 붙인다. 폭이 얼마든 이가 맞고,
     패턴 안에서도 currentColor 가 살아 있어 색은 쓰는 쪽에서 정한다. */
  var dividerSeq = 0;
  function cloudDivider(cls) {
    var id = 'sn-cloud-pat-' + (++dividerSeq);
    return '<svg class="' + (cls || 'sn-divider-svg') + '" width="100%" height="56" ' +
      'xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" ' +
      'preserveAspectRatio="none">' +
      '<defs><pattern id="' + id + '" width="160" height="56" patternUnits="userSpaceOnUse">' +
      '<g fill="none" stroke="currentColor" stroke-width="2.6" ' +
      'stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M2 48 C 2 36, 13 30, 23 34 C 26 21, 45 16, 54 27 ' +
      'C 65 18, 82 24, 84 37 C 96 34, 106 40, 107 48"/>' +
      '<path d="M107 48 C 107 36, 119 30, 128 36 C 136 42, 133 53, 124 52 ' +
      'C 118 51, 117 44, 122 42"/>' +
      '<path d="M136 48 L160 48"/>' +
      '<path d="M30 46 C 34 40, 42 38, 48 41"/>' +
      '<path d="M62 44 C 66 38, 74 37, 79 40"/>' +
      '</g></pattern></defs>' +
      '<rect width="100%" height="56" fill="url(#' + id + ')"/>' +
      '</svg>';
  }

  /* ── 단청 모서리 문양 — 카드 오른쪽 위 귀에 얹는다 ──────────────── */
  function cornerOrnament(cls) {
    return svg('0 0 46 46',
      '<g fill="none" stroke="currentColor" stroke-linecap="round">' +
      '<path d="M45 2 L45 19 C 45 31, 34 42, 22 42 L5 42" stroke-width="2.1"/>' +
      '<path d="M45 11 L45 19 C 45 26, 37 34, 30 34 L18 34" stroke-width="1.3" opacity=".55"/>' +
      '<path d="M45 27 C 40 27, 37 31, 39 35 C 41 38, 45 37, 45 34" stroke-width="1.6" opacity=".75"/>' +
      '</g>' +
      '<circle cx="41.5" cy="5.5" r="2.2" fill="currentColor"/>',
      cls || 'sn-corner-svg');
  }

  /* ── 청사초롱 ───────────────────────────────────────────────────── */
  function lantern(cls) {
    return svg('0 0 80 126',
      '<path d="M20 22 C 20 6, 60 6, 60 22" fill="none" stroke="currentColor" ' +
      'stroke-width="3" stroke-linecap="round" opacity=".7"/>' +
      '<rect x="24" y="20" width="32" height="11" rx="3" fill="var(--sn-lantern-cap, #B5322C)"/>' +
      '<path d="M24 31 C 15 51, 15 76, 24 96 L56 96 C 65 76, 65 51, 56 31 Z" ' +
      'fill="var(--sn-lantern-body, #2E7F79)"/>' +
      '<g stroke="#fff" stroke-opacity=".28" stroke-width="2" fill="none">' +
      '<path d="M19 45 C 30 49, 50 49, 61 45"/>' +
      '<path d="M17 63 C 30 68, 50 68, 63 63"/>' +
      '<path d="M19 81 C 30 85, 50 85, 61 81"/>' +
      '</g>' +
      '<rect x="24" y="94" width="32" height="11" rx="3" fill="var(--sn-lantern-cap, #B5322C)"/>' +
      '<g stroke="var(--sn-lantern-cap, #B5322C)" stroke-width="2.4" stroke-linecap="round">' +
      '<path d="M34 105 L32 122"/><path d="M40 105 L40 124"/><path d="M46 105 L48 122"/>' +
      '</g>',
      cls || 'sn-m-lantern');
  }

  /* ── 보자기 매듭 — 네 귀를 모아 묶은 보따리 ─────────────────────
     리본처럼 보이지 않게, 아래에 감싼 덩어리를 두고 위에만 매듭을 얹는다. */
  function knot(cls) {
    return svg('0 0 100 100',
      '<g fill="currentColor">' +
      // 감싼 덩어리
      '<path d="M50 44 C 74 44, 88 60, 88 76 C 88 90, 72 96, 50 96 ' +
      'C 28 96, 12 90, 12 76 C 12 60, 26 44, 50 44 Z" opacity=".55"/>' +
      // 천 주름
      '<g stroke="#000" stroke-opacity=".12" stroke-width="2" fill="none">' +
      '<path d="M30 52 C 28 66, 28 80, 32 92"/>' +
      '<path d="M50 47 C 50 64, 50 80, 50 95"/>' +
      '<path d="M70 52 C 72 66, 72 80, 68 92"/>' +
      '</g>' +
      // 매듭 — 양쪽으로 접혀 나온 귀
      '<path d="M50 46 C 40 30, 24 24, 19 32 C 14 41, 30 47, 47 49 Z"/>' +
      '<path d="M50 46 C 60 30, 76 24, 81 32 C 86 41, 70 47, 53 49 Z"/>' +
      // 가운데 묶인 자리
      '<ellipse cx="50" cy="47" rx="10" ry="8"/>' +
      '<path d="M44 40 C 46 34, 54 34, 56 40 C 54 37, 46 37, 44 40 Z" opacity=".8"/>' +
      '</g>',
      cls || 'sn-m-knot');
  }

  window.SeasonMotifs = {
    svg: svg, jitter: jitter, round: r,
    moon: moon, rabbit: rabbit, rabbitMortar: rabbitMortar,
    songpyeon: songpyeon, persimmon: persimmon, chestnut: chestnut,
    maple: maple, leafPath: LEAF_PATH,
    reed: reed, reedRow: reedRow, reedBand: reedBand,
    pineBough: pineBough, cloudMotif: cloudMotif,
    cloudDivider: cloudDivider, cornerOrnament: cornerOrnament,
    lantern: lantern, knot: knot
  };
})();
