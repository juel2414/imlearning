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
    var ver = window.SeasonVer ? '?v=' + window.SeasonVer : '';
    return '<img class="sn-art sn-art-' + name + ' ' + (cls || '') + '" ' +
      'src="' + ART + p[0] + '.png' + ver + '" alt="" aria-hidden="true" decoding="async" ' +
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
    var bend = lean * 0.22, P = h * 0.5;
    var side = seed % 2 ? 1 : -1;
    var tipX = bend + P * 0.40 * side, tipY = -h - P;
    var cX = bend + P * 0.10 * side, cY = -h - P * 0.6;

    var stalk = 'M0 0 Q ' + r(bend * 0.35) + ' ' + r(-h * 0.52) + ' ' + r(bend) + ' ' + r(-h);
    var spine = 'M' + r(bend) + ' ' + r(-h) + ' Q ' + r(cX) + ' ' + r(cY) + ' ' + r(tipX) + ' ' + r(tipY);

    function at(t) {
      var mt = 1 - t;
      return [mt * mt * bend + 2 * mt * t * cX + t * t * tipX,
              mt * mt * (-h) + 2 * mt * t * cY + t * t * tipY];
    }
    function tangent(t) {
      var mt = 1 - t;
      var dx = 2 * mt * (cX - bend) + 2 * t * (tipX - cX);
      var dy = 2 * mt * (cY + h)   + 2 * t * (tipY - cY);
      var n = Math.sqrt(dx * dx + dy * dy) || 1;
      return [dx / n, dy / n];
    }

    /* 잔털 — 축에서 비스듬히, 촘촘하고 가늘게. 끝은 아래로 처진다.
       빗살처럼 보이지 않게 각도와 길이를 낱낱이 흩뜨린다. */
    var hairs = '', M = 78;
    for (var k = 1; k <= M; k++) {
      var t = Math.pow(k / M, 0.92);
      var q = at(t), tg = tangent(t);
      var j = jitter(seed * 37 + k), j2 = jitter(seed * 53 + k * 3);
      var sgn = k % 2 ? 1 : -1;
      // 축을 기준으로 60~85도 벌어진 방향
      var ang = (58 + j * 30) * Math.PI / 180 * sgn;
      var dx = tg[0] * Math.cos(ang) - tg[1] * Math.sin(ang);
      var dy = tg[0] * Math.sin(ang) + tg[1] * Math.cos(ang);
      var len = P * 0.3 * (0.28 + 0.72 * Math.sin(Math.PI * Math.pow(t, 0.75))) * (0.55 + 0.9 * j2);
      var ex = q[0] + dx * len, ey = q[1] + dy * len + len * 0.45;   // 끝이 처진다
      var qx = q[0] + dx * len * 0.55, qy = q[1] + dy * len * 0.55 + len * 0.08;
      hairs += 'M' + r(q[0]) + ' ' + r(q[1]) + ' Q ' + r(qx) + ' ' + r(qy) + ' ' + r(ex) + ' ' + r(ey);
    }
    return '<path class="sn-stalk" d="' + stalk + '"/>' +
           '<path class="sn-plume" d="' + hairs + '"/>' +
           '<path class="sn-spine" d="' + spine + '"/>';
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
      reedRow({ width: 420, baseY: 296, minH: 116, spread: 104, step: 22, cls: 'sn-reeds-far' }) +
      reedRow({ width: 420, baseY: 300, minH: 152, spread: 124, step: 26, cls: 'sn-reeds' }),
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

  /* 억새·들꽃 — 식물마다 층을 나눠 따로 흔들린다.
     자리 값은 그림을 쪼갤 때 뽑았다. 밑동(ox%, 100%)을 축으로 돈다. */
  var REED_PARTS = [
    { f: 'reeds-p1', k: 'p', l: 8.491, t: 3.48, w: 24.764, ox: 1.0 },
    { f: 'reeds-p2', k: 'p', l: 20.991, t: 17.795, w: 27.241, ox: 1.6 },
    { f: 'reeds-p3', k: 'p', l: 39.505, t: 33.612, w: 25.0, ox: 3.4 },
    { f: 'reeds-p4', k: 'p', l: 10.731, t: 24.912, w: 16.274, ox: 2.2 },
    { f: 'reeds-p5', k: 'p', l: 28.892, t: 39.464, w: 18.632, ox: 10.3 },
    { f: 'reeds-f1', k: 'f', l: 7.901, t: 64.693, w: 15.448, ox: 63.8 },
    { f: 'reeds-f2', k: 'f', l: 22.17, t: 72.918, w: 10.024, ox: 50.3 },
    { f: 'reeds-f3', k: 'f', l: 52.476, t: 92.295, w: 8.491, ox: 52.3 },
    { f: 'reeds-f4', k: 'f', l: 64.741, t: 86.442, w: 8.019, ox: 46.4 },
    { f: 'reeds-f5', k: 'f', l: 70.991, t: 77.98, w: 7.665, ox: 46.2 },
    { f: 'reeds-f6', k: 'f', l: 32.075, t: 77.268, w: 5.307, ox: 59.0 },
    { f: 'reeds-f7', k: 'f', l: 34.906, t: 76.794, w: 6.84, ox: 32.2 },
    { f: 'reeds-f8', k: 'f', l: 41.038, t: 87.154, w: 13.325, ox: 49.1 },
    { f: 'reeds-f9', k: 'f', l: 3.184, t: 77.664, w: 8.019, ox: 49.0 },
    { f: 'reeds-f10', k: 'f', l: 0.0, t: 90.792, w: 4.953, ox: 69.7 },
    { f: 'reeds-f11', k: 'f', l: 49.882, t: 89.764, w: 6.84, ox: 40.5 },
    { f: 'reeds-f12', k: 'f', l: 43.042, t: 85.256, w: 9.552, ox: 9.0 },
    { f: 'reeds-f13', k: 'f', l: 0.0, t: 82.725, w: 2.948, ox: 69.0 },
    { f: 'reeds-f14', k: 'f', l: 50.118, t: 96.17, w: 4.009, ox: 39.3 },
    { f: 'reeds-f15', k: 'f', l: 16.627, t: 94.43, w: 3.184, ox: 36.8 },
    { f: 'reeds-f16', k: 'f', l: 0.0, t: 93.797, w: 2.476, ox: 22.6 },
    { f: 'reeds-f17', k: 'f', l: 34.906, t: 83.2, w: 4.363, ox: 22.7 },
    { f: 'reeds-f18', k: 'f', l: 35.849, t: 86.284, w: 4.245, ox: 26.2 },
    { f: 'reeds-f19', k: 'f', l: 32.665, t: 96.882, w: 6.368, ox: 27.7 },
    { f: 'reeds-f20', k: 'f', l: 42.335, t: 91.346, w: 5.542, ox: 69.3 },
    { f: 'reeds-f21', k: 'f', l: 40.566, t: 81.381, w: 4.481, ox: 80.2 },
    { f: 'reeds-f22', k: 'f', l: 43.868, t: 87.154, w: 4.599, ox: 46.1 },
    { f: 'reeds-f23', k: 'f', l: 36.203, t: 97.673, w: 4.953, ox: 47.1 },
    { f: 'reeds-f24', k: 'f', l: 31.014, t: 68.569, w: 3.42, ox: 43.7 },
    { f: 'reeds-f25', k: 'f', l: 31.368, t: 64.693, w: 3.538, ox: 64.4 },
    { f: 'reeds-f26', k: 'f', l: 34.198, t: 68.094, w: 3.656, ox: 55.2 }
  ];

  function reedsArt(cls) {
    var ver = window.SeasonVer ? '?v=' + window.SeasonVer : '';
    var img = function (name, klass, style) {
      return '<img class="' + klass + '" src="' + ART + name + '.png' + ver + '" alt="" ' +
             'aria-hidden="true" decoding="async"' + (style ? ' style="' + style + '"' : '') + '>';
    };
    var out = img('reeds-base', 'sn-reed-base');
    for (var i = 0; i < REED_PARTS.length; i++) {
      var p = REED_PARTS[i];
      var plume = p.k === 'p';
      var dur = plume ? 4.4 + jitter(i * 7 + 1) * 3.2 : 3.0 + jitter(i * 11 + 3) * 2.6;
      var amp = plume ? 3.4 + jitter(i * 5 + 2) * 2.6 : 2.0 + jitter(i * 3 + 5) * 2.0;
      var del = -jitter(i * 13 + 7) * dur;
      out += img(p.f, 'sn-reed-part',
        'left:' + p.l + '%;top:' + p.t + '%;width:' + p.w + '%;' +
        'transform-origin:' + p.ox + '% 100%;' +
        '--sn-a:' + r(amp) + 'deg;' +
        'animation-duration:' + r(dur) + 's;animation-delay:' + r(del) + 's');
    }
    return '<span class="' + (cls || 'sn-reed-art') + '">' + out + '</span>';
  }

  /* ── 완자무늬 귀 — 액자 모서리에 얹는다. 두 줄 테두리와 이어지도록
     팔이 위·왼쪽으로 뻗는다. ── */
  function wanjaCorner(cls) {
    return svg('0 0 34 34',
      '<g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="square">' +
      // 가운데 네모
      '<path d="M11 11 H23 V23 H11 Z"/>' +
      // 위·왼쪽으로 뻗는 팔과 갈고리
      '<path d="M17 11 V2 H27"/><path d="M11 17 H2 V27"/>' +
      '<path d="M23 17 H31"/><path d="M17 23 V31"/>' +
      '</g>',
      cls || 'sn-m-wanja');
  }

  /* ── 겹아치 — 단청의 산·구름 무늬. 아치를 앞뒤로 포갠다.
     앞 아치가 뒤를 가려야 겹쳐 보이므로 속을 바탕색으로 채운다. ── */
  function archRow(seed, cls, opt) {
    var o = opt || {};
    var s = seed || 0;
    var n = o.count || 5;
    var base = 62, out = '', x = 4, maxX = 0;
    for (var i = 0; i < n; i++) {
      var t = Math.abs(i - (n - 1) / 2) / ((n - 1) / 2 || 1);   // 가운데가 가장 높다
      var w = (o.w || 76) * (1 - t * 0.3);
      var rr = w / 2;
      var sh = rr * 0.16;                                        // 곧은 옆면은 짧게
      var g = '<path class="sn-ar-fill" d="M' + r(x) + ' ' + base +
              ' V ' + r(base - sh) +
              ' A ' + r(rr) + ' ' + r(rr) + ' 0 0 1 ' + r(x + w) + ' ' + r(base - sh) +
              ' V ' + base + ' Z"/>';
      for (var k = 1; k <= 2; k++) {                             // 안쪽 겹선 둘
        var d = k * 6.2, r2 = rr - d;
        if (r2 < 5) break;
        g += '<path class="sn-ar-line" d="M' + r(x + d) + ' ' + base +
             ' V ' + r(base - sh) +
             ' A ' + r(r2) + ' ' + r(r2) + ' 0 0 1 ' + r(x + w - d) + ' ' + r(base - sh) +
             ' V ' + base + '"/>';
      }
      out += g;
      maxX = x + w;
      x += w * 0.64;                                             // 앞 아치가 뒤를 문다
    }
    out += '<path class="sn-ar-line sn-ar-thin" d="M0 ' + (base + 3) + ' H' + r(maxX + 4) +
           ' M0 ' + (base + 7) + ' H' + r(maxX + 4) + '"/>';
    return svg('0 0 ' + r(maxX + 4) + ' 72', out, cls || 'sn-m-arch',
      o.stretch ? 'preserveAspectRatio="none"' : '');
  }

  /* ── 전통 구름 — 뭉게진 몸체에 끝이 말린 꼬리 ────────────────────
     참고한 그림을 그대로 베끼지 않고 결만 따서 코드로 그린다.
     seed 를 바꾸면 봉우리 수와 꼬리 길이가 달라진다. */
  function cloudSilk(seed, cls) {
    var s = seed || 0;
    var lobes = 4 + Math.round(jitter(s * 7 + 1) * 2);      // 봉우리 4~6
    var body = '';
    var x = 52, y = 58, prev = 0;
    for (var i = 0; i < lobes; i++) {
      var t = i / (lobes - 1);
      var rx = 17 + jitter(s * 11 + i) * 13;
      var ry = rx * (0.72 + jitter(s * 5 + i) * 0.3);
      var cy = y - 8 - Math.sin(Math.PI * t) * (12 + jitter(s * 3 + i) * 10);
      body += '<ellipse cx="' + r(x) + '" cy="' + r(cy) + '" rx="' + r(rx) + '" ry="' + r(ry) + '"/>';
      prev = x;
      x += rx * 1.25;
    }
    // 몸체 아래를 평평하게 메워 한 덩어리로 만든다
    body += '<path d="M40 ' + r(y - 4) + ' L' + r(prev + 12) + ' ' + r(y - 4) +
            ' Q ' + r(prev + 6) + ' ' + r(y + 10) + ' ' + r(prev - 14) + ' ' + r(y + 10) +
            ' L54 ' + r(y + 10) + ' Q 40 ' + r(y + 8) + ' 40 ' + r(y - 4) + ' Z"/>';

    // 왼쪽 꼬리 — 길게 뻗다가 끝이 말린다
    var tail = 'M46 ' + r(y + 2) +
      ' C 30 ' + r(y + 16) + ', 10 ' + r(y + 18) + ', 6 ' + r(y + 8) +
      ' C 3 ' + r(y + 1) + ', 12 ' + r(y - 5) + ', 18 ' + r(y - 1) +
      ' C 22 ' + r(y + 2) + ', 20 ' + r(y + 8) + ', 15 ' + r(y + 7) +
      ' C 12 ' + r(y + 6) + ', 12 ' + r(y + 2) + ', 15 ' + r(y + 2) +
      ' C 13 ' + r(y + 5) + ', 17 ' + r(y + 6) + ', 18 ' + r(y + 3) +
      ' C 20 ' + r(y - 1) + ', 10 ' + r(y - 1) + ', 10 ' + r(y + 7) +
      ' C 10 ' + r(y + 14) + ', 28 ' + r(y + 10) + ', 44 ' + r(y - 2) + ' Z';
    body += '<path d="' + tail + '"/>';

    // 오른쪽 끝 말림 — 안쪽으로 한 바퀴
    var ex = prev + 10;
    body += '<path d="M' + r(ex) + ' ' + r(y - 12) +
      ' C ' + r(ex + 16) + ' ' + r(y - 20) + ', ' + r(ex + 26) + ' ' + r(y - 6) +
      ', ' + r(ex + 14) + ' ' + r(y + 2) +
      ' C ' + r(ex + 6) + ' ' + r(y + 7) + ', ' + r(ex - 2) + ' ' + r(y + 2) +
      ', ' + r(ex) + ' ' + r(y - 4) +
      ' C ' + r(ex + 2) + ' ' + r(y - 8) + ', ' + r(ex + 9) + ' ' + r(y - 7) +
      ', ' + r(ex + 8) + ' ' + r(y - 2) +
      ' C ' + r(ex + 12) + ' ' + r(y - 6) + ', ' + r(ex + 6) + ' ' + r(y - 14) +
      ', ' + r(ex) + ' ' + r(y - 12) + ' Z"/>';

    return svg('0 0 ' + r(ex + 34) + ' 100', '<g class="sn-cs-body">' + body + '</g>',
      cls || 'sn-m-cloudsilk');
  }

  /* ── 민화풍 소나무 ───────────────────────────────────────────────
     먹선 두른 갈색 가지에, 부채꼴로 펼친 솔잎 뭉치를 얹는다.
     가지는 왼쪽 가장자리에서 들어온다. 오른쪽에 둘 때는 쓰는 쪽에서 뒤집는다. */
  var PINE_BRANCHES = [
    // [점들, 시작 굵기, 끝 굵기]
    [[[-24,150],[40,166],[110,160],[180,150],[250,176],[320,196],[396,188]], 30, 9],
    [[[96,160],[118,118],[150,84],[196,62]], 14, 5],
    [[[180,150],[214,112],[258,98],[300,74]], 12, 5],
    [[[250,176],[292,222],[346,244],[414,250]], 11, 4],
    [[[320,196],[364,160],[430,140]], 9, 4],
    [[[40,166],[34,208],[62,238]], 9, 4]
  ];
  var PINE_PADS = [
    // [x, 밑단 y, 폭]
    [196, 64, 112], [128, 92, 84], [302, 76, 104], [248, 104, 70],
    [430, 142, 116], [398, 190, 92], [414, 252, 128], [346, 246, 86],
    [66, 240, 90], [20, 150, 74]
  ];
  function pinePad(x, y, w) {
    var h = w * 0.44;
    var shape = function (cx, cy, ww, hh) {
      return 'M' + r(cx - ww / 2) + ' ' + r(cy) +
        ' C ' + r(cx - ww / 2) + ' ' + r(cy - hh * 1.3) + ', ' + r(cx + ww / 2) + ' ' + r(cy - hh * 1.3) +
        ', ' + r(cx + ww / 2) + ' ' + r(cy) +
        ' Q ' + r(cx + ww / 4) + ' ' + r(cy + hh * 0.2) + ' ' + r(cx) + ' ' + r(cy + hh * 0.06) +
        ' Q ' + r(cx - ww / 4) + ' ' + r(cy + hh * 0.2) + ' ' + r(cx - ww / 2) + ' ' + r(cy) + ' Z';
    };
    var lines = '';
    for (var i = 0; i <= 12; i++) {
      var a = Math.PI * (1.06 + 0.88 * i / 12);
      lines += 'M' + r(x) + ' ' + r(y + h * 0.04) + ' L' +
        r(x + Math.cos(a) * w * 0.46) + ' ' + r(y + Math.sin(a) * h * 0.92);
    }
    // 큰 뭉치는 양옆 아래에 작은 뭉치를 겹쳐 구름처럼 부풀린다
    var sub = '';
    if (w >= 84 && !pinePad.inner) {
      pinePad.inner = true;
      sub = pinePad(x - w * 0.34, y + h * 0.16, w * 0.6) + pinePad(x + w * 0.34, y + h * 0.16, w * 0.6);
      pinePad.inner = false;
    }
    return sub +
           '<path class="sn-pn-pad" d="' + shape(x, y, w, h) + '"/>' +
           '<path class="sn-pn-top" d="' + shape(x, y - h * 0.22, w * 0.7, h * 0.66) + '"/>' +
           '<path class="sn-pn-needle" d="' + lines + '"/>';
  }
  function pineKr(cls) {
    var outline = '', wood = '';
    PINE_BRANCHES.forEach(function (b) {
      var pts = b[0], n = pts.length - 1;
      for (var i = 0; i < n; i++) {
        var w = b[1] + (b[2] - b[1]) * (i / Math.max(1, n - 1));
        var d = 'M' + pts[i][0] + ' ' + pts[i][1] + ' L' + pts[i + 1][0] + ' ' + pts[i + 1][1];
        outline += '<path class="sn-pn-ink" d="' + d + '" stroke-width="' + r(w + 5) + '"/>';
        wood += '<path class="sn-pn-wood" d="' + d + '" stroke-width="' + r(w) + '"/>';
      }
    });
    // 껍질 결
    var bark = 'M58 162 q 12 -4 22 2 M132 156 q 10 -5 20 0 M214 160 q 10 3 18 10 ' +
               'M280 186 q 10 2 18 8 M150 96 q 6 -6 14 -8';
    var pads = PINE_PADS.map(function (p) { return pinePad(p[0], p[1], p[2]); }).join('');
    return svg('0 0 500 320', outline + wood +
      '<path class="sn-pn-bark" d="' + bark + '"/>' + pads, cls || 'sn-m-pine');
  }

  /* 네 갈래로 빛나는 별 — 한 점짜리 별 사이에 드문드문 섞는다 */
  function sparkle(cls) {
    return svg('-10 -10 20 20',
      '<path d="M0 -10 Q 0.9 -0.9 10 0 Q 0.9 0.9 0 10 Q -0.9 0.9 -10 0 Q -0.9 -0.9 0 -10 Z"/>',
      cls || 'sn-m-sparkle');
  }

  /* 은하수 가루 — 오른쪽 위에서 왼쪽 아래로 흐르는 띠를 따라 뿌린다.
     slice 로 채워서 폭이 달라도 점이 찌그러지지 않는다. */
  function starDust(cls, n) {
    var out = '', N = n || 340;
    for (var i = 0; i < N; i++) {
      var t = jitter(i * 3 + 7);
      var off = (jitter(i * 5 + 1) + jitter(i * 7 + 2) - 1) * 150;
      var x = 1360 - t * 1240 + off * 0.45;
      var y = 60 + t * 700 + off * 0.9;
      var k = jitter(i * 11 + 5);
      out += '<circle cx="' + r(x) + '" cy="' + r(y) + '" r="' + r(0.5 + k * k * k * 2) +
        '" opacity="' + r(0.25 + jitter(i * 13) * 0.65) + '"/>';
    }
    return svg('0 0 1440 900', out, cls || 'sn-m-dust', 'preserveAspectRatio="xMidYMid slice"');
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

  /* ── 소반 — 개다리소반 위에 흰 그릇, 그 안에 송편을 소복이 ───────── */
  function soban(cls) {
    function one(dx, dy, sc, kind) {
      return '<g transform="translate(' + dx + ',' + dy + ') scale(' + sc + ')">' +
        songpyeonBody(kind) + '</g>';
    }
    return svg('0 0 240 200',
      // 다리 — 바깥으로 휘었다 안으로 들어오는 개다리
      '<path class="sn-sb-leg" d="M44 126 C 26 146, 22 170, 40 192 L50 192 C 40 172, 44 150, 60 132 Z"/>' +
      '<path class="sn-sb-leg" d="M196 126 C 214 146, 218 170, 200 192 L190 192 C 200 172, 196 150, 180 132 Z"/>' +
      '<path class="sn-sb-leg sn-sb-back" d="M82 130 C 76 150, 78 168, 88 186 L96 186 C 88 168, 88 150, 94 134 Z"/>' +
      '<path class="sn-sb-leg sn-sb-back" d="M158 130 C 164 150, 162 168, 152 186 L144 186 C 152 168, 152 150, 146 134 Z"/>' +
      // 운각 — 상판 아래 구름 모양 턱
      '<path class="sn-sb-apron" d="M34 118 L206 118 L200 134 C 184 138, 176 128, 160 136 ' +
      'C 146 142, 134 132, 120 138 C 106 132, 94 142, 80 136 C 64 128, 56 138, 40 134 Z"/>' +
      // 상판
      '<path class="sn-sb-edge" d="M14 106 C 14 118, 60 128, 120 128 C 180 128, 226 118, 226 106 L226 114 ' +
      'C 226 126, 180 136, 120 136 C 60 136, 14 126, 14 114 Z"/>' +
      '<ellipse class="sn-sb-top" cx="120" cy="106" rx="106" ry="20"/>' +
      '<path class="sn-sb-shine" d="M40 100 C 70 92, 110 90, 150 91"/>' +
      // 그릇 뒷전
      '<ellipse class="sn-bw-rim" cx="120" cy="58" rx="54" ry="9"/>' +
      // 송편
      one(70, 30, 0.40, 'ssuk') + one(100, 24, 0.42, 'pink') + one(132, 30, 0.40, 'chija') +
      one(84, 10, 0.38, 'white') + one(116, 6, 0.40, 'ssuk') + one(100, 40, 0.36, 'chija') +
      // 그릇 몸통 — 송편 아랫부분을 덮는다
      '<path class="sn-bw-body" d="M66 58 Q 120 74 174 58 Q 172 100 120 104 Q 68 100 66 58 Z"/>' +
      '<path class="sn-bw-band" d="M76 76 Q 120 88 164 76"/>',
      cls || 'sn-m-soban');
  }

  /* ── 들꽃 한 무더기 — 화면 아래 모서리에 놓는다 ─────────────────
     먹선을 두른 민화풍. 데이지·미나리아재비·코스모스·튤립·도라지꽃을 섞는다.
     왼쪽 가장자리(x=0)에 몰리고 안쪽으로 갈수록 성기고 낮아진다.
     오른쪽에 둘 때는 쓰는 쪽에서 좌우로 뒤집는다. */
  var FLOWER_KINDS = ['daisy', 'butter', 'cosmos', 'tulip', 'bell', 'daisy', 'butter'];
  function petals(x, y, s, n, rx, ry, dist, cls) {
    var out = '';
    for (var q = 0; q < n; q++) {
      var a = 360 * q / n;
      out += '<ellipse class="' + cls + '" cx="' + r(x) + '" cy="' + r(y - s * dist) + '" rx="' +
        r(s * rx) + '" ry="' + r(s * ry) + '" transform="rotate(' + r(a) + ' ' + r(x) + ' ' + r(y) + ')"/>';
    }
    return out;
  }
  function flowerHead(kind, x, y, s) {
    if (kind === 'daisy') {
      return petals(x, y, s, 10, 0.24, 0.52, 0.56, 'sn-fl-daisy') +
        '<circle class="sn-fl-core" cx="' + r(x) + '" cy="' + r(y) + '" r="' + r(s * 0.3) + '"/>';
    }
    if (kind === 'cosmos') {
      return petals(x, y, s, 8, 0.3, 0.55, 0.56, 'sn-fl-cosmos') +
        '<circle class="sn-fl-core" cx="' + r(x) + '" cy="' + r(y) + '" r="' + r(s * 0.24) + '"/>';
    }
    if (kind === 'butter') {
      return petals(x, y, s, 5, 0.42, 0.46, 0.5, 'sn-fl-butter') +
        '<circle class="sn-fl-core2" cx="' + r(x) + '" cy="' + r(y) + '" r="' + r(s * 0.22) + '"/>';
    }
    if (kind === 'tulip') {
      return '<path class="sn-fl-tulip" d="M' + r(x - s * 0.62) + ' ' + r(y - s * 0.3) +
        ' Q ' + r(x - s * 0.74) + ' ' + r(y - s * 1.3) + ' ' + r(x - s * 0.3) + ' ' + r(y - s * 1.16) +
        ' L ' + r(x) + ' ' + r(y - s * 0.72) + ' L ' + r(x + s * 0.3) + ' ' + r(y - s * 1.16) +
        ' Q ' + r(x + s * 0.74) + ' ' + r(y - s * 1.3) + ' ' + r(x + s * 0.62) + ' ' + r(y - s * 0.3) +
        ' Q ' + r(x) + ' ' + r(y + s * 0.5) + ' ' + r(x - s * 0.62) + ' ' + r(y - s * 0.3) + ' Z"/>';
    }
    // bell — 도라지꽃, 다섯 갈래 별꽃
    return petals(x, y, s, 5, 0.3, 0.56, 0.52, 'sn-fl-bell') +
      '<circle class="sn-fl-core3" cx="' + r(x) + '" cy="' + r(y) + '" r="' + r(s * 0.16) + '"/>';
  }
  function flowerClump(cls) {
    var w = 360, base = 260, out = '';
    var edge = function (x) { return 1 - x / w; };

    var grass = '';
    for (var i = 0; i < 60; i++) {
      var gx = Math.pow(jitter(i * 7 + 1), 1.7) * w;
      var gh = (30 + jitter(i * 5) * 54) * (0.45 + edge(gx) * 0.9);
      var lean = (jitter(i * 3) - 0.35) * 40;
      var gw = 3 + jitter(i * 9) * 3;
      grass += 'M' + r(gx - gw) + ' ' + base + ' Q ' + r(gx + lean * 0.4) + ' ' + r(base - gh * 0.55) +
               ' ' + r(gx + lean) + ' ' + r(base - gh) + ' Q ' + r(gx + lean * 0.3) + ' ' + r(base - gh * 0.5) +
               ' ' + r(gx + gw) + ' ' + base + ' Z';
    }
    out += '<path class="sn-fl-grass" d="' + grass + '"/>';

    var sways = ['sn-sway', 'sn-sway-2', 'sn-sway-3', 'sn-sway-4'];
    for (var k = 0; k < 20; k++) {
      var fx = 8 + Math.pow(jitter(k * 7 + 3), 1.5) * (w - 40);
      var fh = (50 + jitter(k * 11) * 74) * (0.5 + edge(fx) * 0.85);
      var fy = base - fh;
      var hx = fx + (jitter(k * 17) - 0.5) * 22;
      var size = 13 + jitter(k * 13) * 8;
      var g = '<path class="sn-fl-stem" d="M' + r(fx) + ' ' + base + ' Q ' + r(fx) + ' ' +
              r(base - fh * 0.5) + ' ' + r(hx) + ' ' + r(fy) + '"/>';
      if (k % 2 === 0) {
        var ly = base - fh * 0.32, dir = k % 4 ? 1 : -1;
        g += '<path class="sn-fl-leaf" d="M' + r(fx) + ' ' + r(ly) + ' q ' + (dir * 14) + ' -16 ' + (dir * 30) +
             ' -10 q ' + (dir * -12) + ' 14 ' + (dir * -30) + ' 10 Z"/>';
      }
      g += flowerHead(FLOWER_KINDS[k % FLOWER_KINDS.length], hx, fy, size);
      out += '<g class="' + sways[k % 4] + '">' + g + '</g>';
    }
    return svg('0 0 ' + w + ' ' + base, out, cls || 'sn-m-flowers');
  }

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
    norigae: norigae, soban: soban, flowerClump: flowerClump, reedsArt: reedsArt, cloudSilk: cloudSilk, archRow: archRow, wanjaCorner: wanjaCorner, pineKr: pineKr, sparkle: sparkle, starDust: starDust
  };
})();
