/* ── 시즌 테마 ───────────────────────────────────────────────────────────
   설날·추석·성탄절처럼 때에 맞춰 화면을 꾸민다.
   관리자 랜딩 편집에서 켜고 끈다. 설정은 landing_config 의 season 칸에 있다.
     { "active": true, "theme": "chuseok" }
   꺼져 있으면 아무것도 하지 않는다. 장식은 원래 화면 위에 얹기만 하고
   자리나 크기는 건드리지 않는다.
   ──────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var THEMES = {
    chuseok: {
      label: '추석',
      greet: '한가위 잘 보내세요',
      decorate: function (hero) {
        // 글 뒤에 깔리는 밤 풍경
        var back = document.createElement('div');
        back.className = 'season-deco';
        back.setAttribute('aria-hidden', 'true');
        back.innerHTML =
          '<div class="sn-trim"></div>' +
          '<div class="sn-halo"></div>' +
          '<div class="sn-moon"></div>' +
          stars() +
          cloud('sn-cloud-1') +
          cloud('sn-cloud-2') +
          pine() +
          scene();
        hero.appendChild(back);

        // 글 앞으로 흩날리는 단풍잎
        var front = document.createElement('div');
        front.className = 'season-deco-front';
        front.setAttribute('aria-hidden', 'true');
        front.innerHTML = leaves();
        hero.appendChild(front);
      },
    },
  };

  // 같은 자리에는 늘 같은 값이 나오는 흩뜨림
  function jitter(n) { var v = Math.sin(n * 12.9898) * 43758.5453; return v - Math.floor(v); }
  function r(n) { return Math.round(n * 10) / 10; }

  /* ── 하늘 ───────────────────────────────────────────────────────── */

  function stars() {
    var pts = [
      [6, 16], [13, 32], [21, 11], [28, 26], [35, 7], [43, 19],
      [52, 9], [58, 28], [64, 14], [71, 24], [78, 8], [84, 30],
      [90, 17], [96, 27], [17, 44], [47, 38], [75, 41], [88, 46]
    ];
    return pts.map(function (p, i) {
      var s = 1.5 + jitter(i * 7) * 2.2;
      return '<span class="sn-star" style="left:' + p[0] + '%;top:' + p[1] + '%;' +
        'width:' + r(s) + 'px;height:' + r(s) + 'px;' +
        'animation-duration:' + r(3 + jitter(i * 3) * 4) + 's;' +
        'animation-delay:-' + r(jitter(i * 11) * 5) + 's"></span>';
    }).join('');
  }

  function cloud(cls) {
    return '<div class="sn-cloud ' + cls + '">' +
      '<svg viewBox="0 0 300 80" fill="currentColor" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M40 64 C 14 64, 10 40, 34 36 C 34 16, 64 10, 76 26 C 88 8, 124 10, 130 30 ' +
      'C 152 22, 176 34, 174 50 C 196 48, 206 64, 188 64 Z"/>' +
      '<path d="M196 66 C 178 66, 176 50, 192 48 C 194 34, 216 32, 222 44 ' +
      'C 234 34, 256 40, 256 54 C 274 54, 278 66, 264 66 Z" opacity=".8"/>' +
      '</svg></div>';
  }

  /* ── 소나무 가지 ─────────────────────────────────────────────────
     왼쪽 위 모서리에서 뻗어 나온다. 솔잎은 가지 끝마다 부챗살로 퍼진다. */

  function needles(cx, cy, dir, n, len, off) {
    var d = '';
    for (var i = 0; i < n; i++) {
      var a = dir + (i / (n - 1) - 0.5) * 2.1;             // 부챗살이 벌어지는 각
      a += (jitter(cx * 3 + cy + i + off) - 0.5) * 0.16;   // 가지런하지 않게
      var L = len * (0.6 + jitter(cx + cy * 2 + i + off) * 0.55);
      d += 'M' + r(cx) + ' ' + r(cy);
      d += 'L' + r(cx + Math.cos(a) * L) + ' ' + r(cy + Math.sin(a) * L);
    }
    return d;
  }

  function pine() {
    var branch =
      'M-14 8 C 54 24, 116 52, 188 90 C 228 112, 262 132, 292 154';
    var subs = [
      'M86 38 C 78 62, 72 78, 66 96',
      'M162 72 C 168 98, 172 114, 178 132',
      'M238 112 C 228 134, 222 148, 214 166'
    ];
    var clusters = [
      [30, 18, -1.9, 26, 30], [92, 42, -1.6, 26, 32], [152, 68, -2.1, 24, 28],
      [212, 100, -1.7, 26, 31], [280, 146, -1.9, 26, 30],
      [64, 100, 1.5, 24, 28], [180, 138, 1.4, 24, 29], [210, 172, 1.7, 22, 26],
      [126, 52, 0.9, 20, 24], [246, 124, 1.1, 20, 25],
      [58, 30, -2.4, 20, 26], [128, 76, -1.3, 20, 27], [252, 130, -2.3, 20, 27]
    ];
    // 짙은 잎을 먼저 깔고 밝은 잎을 그 위에 얹어 덤불처럼 보이게 한다
    var dark = clusters.map(function (c) { return needles(c[0], c[1] + 2, c[2], c[3], c[4] * 1.06, 7); }).join('');
    var lite = clusters.map(function (c) { return needles(c[0], c[1], c[2], c[3], c[4] * 0.9, 0); }).join('');

    return '<div class="sn-pine">' +
      '<svg viewBox="0 0 340 200" xmlns="http://www.w3.org/2000/svg">' +
      '<path class="sn-bough" d="' + branch + '"/>' +
      subs.map(function (s) { return '<path class="sn-bough sn-bough-sm" d="' + s + '"/>'; }).join('') +
      '<path class="sn-needle-d" d="' + dark + '"/>' +
      '<path class="sn-needle" d="' + lite + '"/>' +
      '</svg></div>';
  }

  /* ── 땅 ──────────────────────────────────────────────────────────
     산 능선, 억새, 기와 담장을 그림 하나에 담는다. 그래야 화면 폭이
     바뀌어도 서로의 자리가 흐트러지지 않는다. 담장 위가 지면이고,
     억새는 담장 뒤에서 자란다. */

  var VW = 1440, VH = 460, WALL_TOP = 340, SOIL = 352;

  // 꺾인 점들을 이어 능선을 만든다. 봉우리는 살짝 둥글린다.
  function ridge(pts, rad) {
    var d = 'M' + pts[0][0] + ' ' + VH + ' L' + pts[0][0] + ' ' + pts[0][1];
    for (var i = 1; i < pts.length - 1; i++) {
      var p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1];
      d += ' L' + r(p1[0] + (p0[0] - p1[0]) * rad) + ' ' + r(p1[1] + (p0[1] - p1[1]) * rad);
      d += ' Q' + p1[0] + ' ' + p1[1] +
           ' ' + r(p1[0] + (p2[0] - p1[0]) * rad) + ' ' + r(p1[1] + (p2[1] - p1[1]) * rad);
    }
    var last = pts[pts.length - 1];
    d += ' L' + last[0] + ' ' + last[1] + ' L' + last[0] + ' ' + VH + ' Z';
    return d;
  }

  function hills() {
    var far = ridge([
      [-60, 322], [104, 196], [238, 286], [372, 176], [508, 280],
      [648, 166], [796, 282], [934, 188], [1078, 288], [1218, 174],
      [1352, 276], [1500, 322]
    ], 0.16);
    var near = ridge([
      [-60, 356], [92, 276], [230, 340], [368, 264], [502, 338],
      [646, 270], [792, 344], [928, 278], [1070, 342], [1216, 272],
      [1358, 338], [1500, 356]
    ], 0.16);
    return '<path class="sn-hill-far" d="' + far + '"/>' +
      '<path class="sn-hill-far-line" d="' + far + '"/>' +
      '<path class="sn-hill-near" d="' + near + '"/>' +
      '<path class="sn-hill-near-line" d="' + near + '"/>';
  }

  // 억새 한 줄기. 아래에서 위로 자라는 제 좌표계에 그린 뒤 제자리로 옮긴다.
  function reed(h, lean, seed) {
    var bend = lean * 0.22;
    var P = h * 0.34;
    var side = seed % 2 ? 1 : -1;
    var tipX = bend + P * 0.34 * side, tipY = -h - P;
    var cX = bend + P * 0.06 * side, cY = -h - P * 0.62;

    var stalk = 'M0 0 Q ' + r(bend * 0.35) + ' ' + r(-h * 0.52) + ' ' + r(bend) + ' ' + r(-h);
    var spine = 'M' + r(bend) + ' ' + r(-h) + ' Q ' + r(cX) + ' ' + r(cY) + ' ' + r(tipX) + ' ' + r(tipY);

    // 이삭의 잔털 — 척추를 따라 좌우로 갈라져 아래로 늘어진다
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

  function reedRow(cls, baseY, minH, spread, step) {
    var sways = ['sn-sway', 'sn-sway-2', 'sn-sway-3', 'sn-sway-4'];
    var body = '', x = -10, i = 0;
    while (x < VW + 20) {
      var h = minH + ((i * 37) % spread);
      var lean = ((i * 53) % 25) - 12;
      body += '<g class="' + sways[i % 4] + '">' +
                '<g transform="translate(' + x + ',' + baseY + ') rotate(' + lean + ')">' +
                  reed(h, lean, i) +
                '</g></g>';
      x += step + ((i * 17) % 18);
      i++;
    }
    return '<g class="' + cls + '">' + body + '</g>';
  }

  // 기와 담장 — 위에 수막새가 잘게 줄지어 앉고, 아래는 전돌 벽이다.
  function wall() {
    var out = '';
    var P = 18, R = 9;                                   // 기와 한 장의 폭과 반지름
    var top = WALL_TOP, roofBot = WALL_TOP + 30;

    var ridgePath = 'M0 ' + top;
    for (var x = 0; x < VW; x += P) ridgePath += ' A ' + R + ' ' + R + ' 0 0 1 ' + (x + P) + ' ' + top;
    out += '<path class="sn-wall-roof" d="' + ridgePath +
           ' L' + VW + ' ' + roofBot + ' L0 ' + roofBot + ' Z"/>';

    var grooves = '';
    for (var g = P; g < VW; g += P) grooves += 'M' + g + ' ' + (top - 1) + ' L' + g + ' ' + (roofBot - 3);
    out += '<path class="sn-wall-groove" d="' + grooves + '"/>';

    out += '<rect class="sn-wall-eave" x="0" y="' + roofBot + '" width="' + VW + '" height="9"/>';
    out += '<rect class="sn-wall-body" x="0" y="' + (roofBot + 9) + '" width="' + VW +
           '" height="' + (VH - roofBot - 9) + '"/>';

    // 전돌 — 가로 줄눈에 세로 줄눈을 한 칸씩 엇갈려 쌓는다
    var bricks = '', row = 0;
    for (var by = roofBot + 27; by < VH; by += 17) {
      bricks += 'M0 ' + by + ' L' + VW + ' ' + by;
      for (var bx = (row % 2 ? 0 : 23); bx < VW; bx += 46) {
        bricks += 'M' + bx + ' ' + by + ' L' + bx + ' ' + Math.min(by + 17, VH);
      }
      row++;
    }
    out += '<path class="sn-wall-brick" d="' + bricks + '"/>';

    // 달빛이 닿은 기와 윗선
    var lit = 'M0 ' + top;
    for (var lx = 0; lx < VW; lx += P) lit += ' A ' + R + ' ' + R + ' 0 0 1 ' + (lx + P) + ' ' + top;
    out += '<path class="sn-wall-lit" d="' + lit + '"/>';
    return out;
  }

  function scene() {
    return '<div class="sn-scene">' +
      '<svg viewBox="0 0 ' + VW + ' ' + VH + '" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">' +
      hills() +
      reedRow('sn-reeds-far', SOIL - 8, 70, 50, 34) +
      reedRow('sn-reeds', SOIL, 92, 70, 38) +
      wall() +
      '</svg></div>';
  }

  /* ── 단풍잎 ─────────────────────────────────────────────────────── */

  // 단풍잎 — 한 점에서 갈라져 나온 다섯 갈래. 갈래 하나는 볼록한 렌즈꼴이다.
  var LOBES = [
    [-90, 15.5, 4.6], [-137, 12.8, 4.1], [-43, 12.8, 4.1],
    [-176, 9.2, 3.2], [-4, 9.2, 3.2]
  ];
  var LEAF = (function () {
    var bx = 14, by = 20, d = '';
    LOBES.forEach(function (lo) {
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

  var LEAF_HUES = ['#E4552F', '#F0902B', '#C9362C', '#EFBB47', '#D9663A', '#E8A33A', '#CF4A2E'];

  function leaves() {
    var out = '';
    for (var i = 0; i < 8; i++) {
      var j = jitter(i * 5 + 1), k = jitter(i * 9 + 4);
      var size = 16 + j * 10;
      var hue = LEAF_HUES[i % LEAF_HUES.length];
      out += '<span class="sn-leaf" style="left:' + r(5 + i * 12 + k * 7) + '%;' +
        'animation-duration:' + r(16 + j * 12) + 's;animation-delay:-' + r(k * 24) + 's">' +
        '<span class="sn-leaf-i" style="animation-duration:' + r(4 + k * 4) + 's;' +
        'animation-delay:-' + r(j * 4) + 's">' +
        '<svg viewBox="0 0 28 30" width="' + r(size) + '" height="' + r(size * 30 / 28) + '" ' +
        'xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M14 20 L14 28" stroke="' + hue + '" stroke-width="1.6" stroke-linecap="round" fill="none"/>' +
        '<path d="' + LEAF + '" fill="' + hue + '"/>' +
        '</svg></span></span>';
    }
    return out;
  }

  /* ── 인사말 ─────────────────────────────────────────────────────── */

  function greetPill(text) {
    var p = document.createElement('div');
    p.className = 'sn-greet';
    p.innerHTML = '<span class="sn-greet-dot"></span><span></span>';
    p.lastChild.textContent = text;
    return p;
  }

  function apply(theme) {
    var t = THEMES[theme];
    if (!t) return;
    document.documentElement.classList.add('season-' + theme);

    var hero = document.querySelector('[data-section="hero"]');
    if (!hero) return;                        // 히어로가 없는 화면은 색만 따라간다
    if (hero.querySelector('.season-deco')) return;

    t.decorate(hero);

    // 인사말은 슬로건 위에 놓는다
    if (t.greet) {
      var eyebrow = hero.querySelector('.lp-eyebrow');
      if (eyebrow && eyebrow.parentNode) {
        eyebrow.parentNode.insertBefore(greetPill(t.greet), eyebrow);
      }
    }
  }

  function start() {
    var sb = window.supabaseClient;
    if (!sb) { setTimeout(start, 80); return; }
    sb.from('landing_config').select('value').eq('key', 'season').maybeSingle()
      .then(function (res) {
        var v = res && res.data && res.data.value;
        if (v && v.active && v.theme) apply(v.theme);
      })
      .catch(function () {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
