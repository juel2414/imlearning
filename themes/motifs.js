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

  /* ── 달토끼 — 달 안에서 둘이 마주 서서 방아를 찧는다 ────────────
     흰 몸에 굵은 먹선, 긴 귀, 볼 홍조. 오른쪽 토끼는 왼쪽을 뒤집어 쓴다. */
  /* ── 달토끼 ──────────────────────────────────────────────────────
     이것만 그림 파일을 쓴다. 나머지 모티프는 전부 코드로 그린다.
     받은 원본은 격자무늬가 화소로 박혀 있었다. 노란 달과 검은 테두리를
     걷어 내고 토끼·절구·공이만 남겨 바깥을 투명으로 돌린 것을 쓴다.
     원본은 같은 폴더에 -source 로 남겨 뒀다.
     주소는 뿌리에서 잡는다. 404 처럼 없는 주소로 들어온 화면에서도
     상대 경로가 어긋나지 않는다. */
  var ART = '/images/season/chuseok-';

  /* 이름 → [파일, 폭, 높이, 미리 받을지]
     받은 그림을 배경만 벗겨 쓴다. 첫 화면에 안 보이는 것은 늦게 받는다. */
  var PIECES = {
    moon:    ['moon',          824, 496, 1],
    peek:    ['rabbit-peek',   267, 351, 1],
    shield:  ['shield',        248, 240, 1],
    pine:    ['pine',          484, 400, 1],
    mapleO:  ['maple-orange',  170, 168, 1],
    mapleR:  ['maple-red',     160, 170, 1],
    rabbit:  ['rabbit',        520, 408, 1],
    mat:     ['mat',           990, 277, 0],
    pumpkin: ['pumpkin',       325, 288, 0],
    squash:  ['squash',        345, 246, 0],
    chestnut:['chestnut',      259, 182, 0]
  };

  // 그림 조각 하나를 <img> 로 낸다. 담는 자리가 크기를 정한다.
  function piece(name, cls) {
    var p = PIECES[name];
    if (!p) return '';
    return '<img class="sn-art sn-art-' + name + ' ' + (cls || '') + '" ' +
      'src="' + ART + p[0] + '.png" alt="" aria-hidden="true" decoding="async" ' +
      'loading="' + (p[3] ? 'eager' : 'lazy') + '" ' +
      'width="' + p[1] + '" height="' + p[2] + '">';
  }

  function rabbit(cls) { return piece('rabbit', 'sn-m-rabbit ' + (cls || '')); }

  // 예전 이름으로도 부를 수 있게 둔다 — 빈 상태와 404 가 쓴다
  function rabbitMortar(cls) { return rabbit(cls); }

  /* ── 송편 — 반달 모양. 쑥·치자·흰·분홍으로 빚는다 ──────────────── */
  var SONGPYEON_HUES = {
    ssuk:  ['#5E8C4A', '#416633'],
    chija: ['#F2CC5E', '#C79B2E'],
    white: ['#F5F1E6', '#C9C0AC'],
    pink:  ['#F2A7B8', '#CF7387']
  };

  function songpyeonBody(kind) {
    var h = SONGPYEON_HUES[kind] || SONGPYEON_HUES.white;
    return '<path d="M5 58 C 7 24, 26 7, 50 7 C 74 7, 93 24, 95 58 ' +
      'C 74 63, 26 63, 5 58 Z" fill="' + h[0] + '" stroke="' + h[1] + '" ' +
      'stroke-width="2.6" stroke-linejoin="round"/>' +
      '<path d="M17 36 C 25 21, 37 14, 50 14" stroke="#fff" stroke-opacity=".5" ' +
      'stroke-width="6" stroke-linecap="round" fill="none"/>' +
      '<g fill="#fff" transform="translate(64,32)">' +
      '<circle r="3.6" cx="0" cy="-4.5"/><circle r="3.6" cx="4.3" cy="1"/>' +
      '<circle r="3.6" cx="-4.3" cy="1"/><circle r="3.6" cx="2.7" cy="5.8"/>' +
      '<circle r="3.6" cx="-2.7" cy="5.8"/>' +
      '</g>' +
      '<circle cx="64" cy="33" r="2.4" fill="#F2CC5E"/>';
  }

  function songpyeon(cls, kind) {
    return svg('0 0 100 72', songpyeonBody(kind), cls || 'sn-m-songpyeon');
  }

  // 솔잎 위에 송편 여러 개 — 자리가 넉넉할 때
  function songpyeonSet(cls) {
    var needles = '';
    for (var i = 0; i < 54; i++) {
      var x = 10 + (i * 29) % 184, y = 88 + (i * 17) % 30;
      var a = ((i * 53) % 130 - 65) * Math.PI / 180;
      needles += 'M' + x + ' ' + y + ' L' + r(x + Math.cos(a) * 24) +
                 ' ' + r(y + Math.sin(a) * 24);
    }
    function one(dx, dy, sc, kind) {
      return '<g transform="translate(' + dx + ',' + dy + ') scale(' + sc + ')">' +
        songpyeonBody(kind) + '</g>';
    }
    return svg('0 0 200 130',
      '<path d="' + needles + '" stroke="#3E7A4E" stroke-width="2" ' +
      'stroke-linecap="round" opacity=".65" fill="none"/>' +
      one(4, 26, 0.74, 'ssuk') + one(64, 14, 0.80, 'chija') +
      one(126, 28, 0.72, 'pink') + one(46, 58, 0.68, 'white'),
      cls || 'sn-m-songpyeon-set');
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

  /* 억새 한 무더기 — 가로로 눕힌 띠와 달리 위로 솟는다.
     화면 아래 양옆에 세워 두면 바람에 흔들리는 수풀처럼 보인다. */
  function reedClump(cls) {
    return svg('0 0 420 300',
      reedRow({ width: 420, baseY: 296, minH: 120, spread: 110, step: 30, cls: 'sn-reeds-far' }) +
      reedRow({ width: 420, baseY: 300, minH: 160, spread: 130, step: 34, cls: 'sn-reeds' }),
      cls || 'sn-m-reedclump');
  }

  // 억새만 따로 한 띠로 — 푸터나 좁은 자리에 쓴다
  function reedBand(cls) {
    return svg('0 0 1440 140',
      reedRow({ width: 1440, baseY: 138, minH: 60, spread: 44, step: 46, cls: 'sn-reeds-far' }) +
      reedRow({ width: 1440, baseY: 140, minH: 78, spread: 52, step: 52, cls: 'sn-reeds' }),
      cls || 'sn-m-reedband', 'preserveAspectRatio="none"');
  }

  /* ── 윷 — 반으로 켠 나무 네 가락. 등에 X 자국이 있다 ───────────── */
  function yutStick(x, y, rot, marks) {
    var m = '';
    for (var i = 0; i < marks; i++) {
      var my = -20 + i * 18;
      m += 'M-4.5 ' + (my - 4.5) + ' L4.5 ' + (my + 4.5) +
           ' M4.5 ' + (my - 4.5) + ' L-4.5 ' + (my + 4.5);
    }
    return '<g transform="translate(' + x + ',' + y + ') rotate(' + rot + ')">' +
      '<rect class="sn-y-body" x="-9" y="-34" width="18" height="68" rx="9"/>' +
      '<rect class="sn-y-face" x="-5" y="-30" width="10" height="60" rx="5"/>' +
      (m ? '<path class="sn-y-mark" d="' + m + '"/>' : '') +
      '</g>';
  }

  function yut(cls) {
    return svg('0 0 150 130',
      yutStick(28, 60, -20, 3) + yutStick(62, 54, 9, 2) +
      yutStick(96, 62, -7, 3) + yutStick(124, 76, 62, 0),
      cls || 'sn-m-yut');
  }

  /* ── 전통 구름무늬 — 봉긋한 등에 말린 꼬리 ────────────────────────
     뭉게구름과 달리 윤곽이 또렷하고 안쪽에 결을 한 겹 더 그린다. */
  function cloudKr(cls) {
    return svg('0 0 300 150',
      // 몸통 — 봉긋한 덩이 넷이 겹치고, 아랫배는 물결친다
      '<path class="sn-ck-body" d="M34 112 ' +
      'C 16 112, 6 96, 20 84 ' +
      'C 8 62, 32 42, 54 56 ' +
      'C 56 24, 100 14, 116 44 ' +
      'C 134 14, 184 20, 188 54 ' +
      'C 218 38, 254 54, 250 82 ' +
      'C 274 80, 292 98, 278 114 ' +
      'C 250 126, 224 108, 196 118 ' +
      'C 168 128, 140 108, 112 118 ' +
      'C 82 128, 56 110, 34 112 Z"/>' +
      // 왼쪽 끝에 말린 꼬리
      '<path class="sn-ck-curl" d="M34 112 C 16 114, 2 102, 8 88 ' +
      'C 14 76, 32 76, 34 88 C 36 97, 27 101, 22 96"/>' +
      // 안쪽 결 — 덩이마다 한 줄씩
      '<path class="sn-ck-line" d="M42 92 C 52 74, 74 70, 88 82"/>' +
      '<path class="sn-ck-line" d="M116 82 C 128 64, 154 62, 166 76"/>' +
      '<path class="sn-ck-line" d="M196 90 C 208 76, 232 74, 242 86"/>',
      cls || 'sn-m-cloudkr');
  }

  /* ── 노리개 — 끈, 매듭, 둥근 패, 술 ─────────────────────────────── */
  function norigae(cls) {
    return svg('0 0 64 210',
      '<path class="sn-nr-cord" d="M32 0 L32 62"/>' +
      // 매듭 — 네모 매듭을 단순하게
      '<path class="sn-nr-knot" d="M32 60 L44 72 L32 84 L20 72 Z"/>' +
      '<path class="sn-nr-knot-in" d="M32 66 L38 72 L32 78 L26 72 Z"/>' +
      // 둥근 패
      '<circle class="sn-nr-ring" cx="32" cy="112" r="24"/>' +
      '<circle class="sn-nr-face" cx="32" cy="112" r="17"/>' +
      '<path class="sn-nr-gleam" d="M22 104 C 26 99, 34 98, 39 101"/>' +
      // 아래 매듭과 술
      '<path class="sn-nr-knot" d="M32 134 L41 144 L32 154 L23 144 Z"/>' +
      '<path class="sn-nr-tassel" d="M24 152 L21 204 M28 153 L26 206 M32 154 L32 207 ' +
      'M36 153 L38 206 M40 152 L43 204"/>' +
      '<ellipse class="sn-nr-cap" cx="32" cy="153" rx="11" ry="5"/>',
      cls || 'sn-m-norigae');
  }

  /* ── 소반 — 송편 접시를 올려 두는 낮은 상 ───────────────────────── */
  function soban(cls) {
    return svg('0 0 220 120',
      '<ellipse class="sn-sb-top" cx="110" cy="30" rx="98" ry="22"/>' +
      '<path class="sn-sb-edge" d="M12 30 C 12 44, 56 54, 110 54 C 164 54, 208 44, 208 30 ' +
      'L208 40 C 208 54, 164 64, 110 64 C 56 64, 12 54, 12 40 Z"/>' +
      '<path class="sn-sb-leg" d="M44 60 C 40 78, 34 92, 26 106 C 36 104, 44 92, 52 70 Z"/>' +
      '<path class="sn-sb-leg" d="M176 60 C 180 78, 186 92, 194 106 C 184 104, 176 92, 168 70 Z"/>' +
      '<path class="sn-sb-leg" d="M104 64 C 103 82, 103 96, 104 112 L116 112 ' +
      'C 117 96, 117 82, 116 64 Z"/>',
      cls || 'sn-m-soban');
  }

  /* ── 들꽃 한 무더기 — 화면 아래 모서리에 놓는다 ─────────────────
     왼쪽 가장자리(x=0)에 몰리고 안쪽으로 갈수록 성기고 낮아진다.
     오른쪽에 둘 때는 쓰는 쪽에서 좌우로 뒤집는다. */
  var PETAL = ['#F6F2E6', '#F5D46A', '#F0A2BE', '#C7A6E8', '#F3B278'];
  function flowerClump(cls) {
    var w = 360, base = 260, out = '';
    // 가장자리일수록 1, 안쪽 끝이 0
    var edge = function (x) { return 1 - x / w; };

    // 풀잎 — 가장자리에 빽빽하게
    var grass = '';
    for (var i = 0; i < 70; i++) {
      var gx = Math.pow(jitter(i * 7 + 1), 1.7) * w;
      var gh = (26 + jitter(i * 5) * 50) * (0.45 + edge(gx) * 0.9);
      var lean = (jitter(i * 3) - 0.35) * 40;
      grass += 'M' + r(gx) + ' ' + base + ' Q ' + r(gx + lean * 0.4) + ' ' + r(base - gh * 0.55) +
               ' ' + r(gx + lean) + ' ' + r(base - gh);
    }
    out += '<path class="sn-fl-grass" d="' + grass + '"/>';

    // 꽃 — 줄기째 한 묶음으로 흔든다
    var sways = ['sn-sway', 'sn-sway-2', 'sn-sway-3', 'sn-sway-4'];
    for (var k = 0; k < 22; k++) {
      var fx = 8 + Math.pow(jitter(k * 7 + 3), 1.5) * (w - 40);
      var fh = (46 + jitter(k * 11) * 70) * (0.5 + edge(fx) * 0.85);
      var fy = base - fh;
      var bend = (jitter(k * 17) - 0.5) * 22;
      var hx = fx + bend;
      var col = PETAL[k % PETAL.length];
      var rad = 6 + jitter(k * 13) * 5;
      var g = '<path class="sn-fl-stem" d="M' + r(fx) + ' ' + base + ' Q ' + r(fx) + ' ' +
              r(base - fh * 0.5) + ' ' + r(hx) + ' ' + r(fy) + '"/>';
      // 잎 하나
      if (k % 3 === 0) {
        var ly = base - fh * 0.35;
        g += '<path class="sn-fl-leaf" d="M' + r(fx) + ' ' + r(ly) + ' q 14 -12 26 -6 q -12 12 -26 6 Z"/>';
      }
      var pet = '';
      for (var q = 0; q < 5; q++) {
        var a = Math.PI * 2 * q / 5 - Math.PI / 2;
        pet += '<circle cx="' + r(hx + Math.cos(a) * rad * 0.82) + '" cy="' +
               r(fy + Math.sin(a) * rad * 0.82) + '" r="' + r(rad * 0.62) + '"/>';
      }
      g += '<g fill="' + col + '">' + pet + '</g>' +
           '<circle class="sn-fl-eye" cx="' + r(hx) + '" cy="' + r(fy) + '" r="' + r(rad * 0.34) + '"/>';
      out += '<g class="' + sways[k % 4] + '">' + g + '</g>';
    }
    return svg('0 0 ' + w + ' ' + base, out, cls || 'sn-m-flowers');
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
    svg: svg, jitter: jitter, round: r, piece: piece,
    moon: moon, rabbit: rabbit, rabbitMortar: rabbitMortar,
    songpyeon: songpyeon, songpyeonSet: songpyeonSet, yut: yut,
    reed: reed, reedRow: reedRow, reedBand: reedBand, reedClump: reedClump,
    cloudDivider: cloudDivider, cornerOrnament: cornerOrnament,
    lantern: lantern, knot: knot,
    cloudKr: cloudKr,
    norigae: norigae, soban: soban, flowerClump: flowerClump
  };
})();
