/* ── 겨울 모티프 ────────────────────────────────────────────────────────
   겨울 테마에 쓰는 그림을 전부 여기서 코드로 그린다. 장식용 그림 파일은
   한 장도 받지 않는다. 사진 세 장(설경 배경·섹션 배경)만 파일을 쓴다.

   레퍼런스로 받은 에셋의 모양을 목표로 삼는다 —
   전나무는 눈 얹힌 가지, 전구는 따뜻한 빛무리, 고드름은 통통한 눈 둔덕.

   함수는 모두 SVG 문자열을 돌려주고, 색은 theme.css 가 클래스로 준다.
   공통 모티프(반짝임·별가루)는 themes/motifs.js 것을 그대로 쓴다.
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
  function uid(p) { return 'sn-' + p + (++seq); }

  /* 점들을 부드럽게 잇는다. 점을 조절점으로 쓰고 중점을 지나가게 해서,
     눈처럼 둥글둥글한 윤곽이 나온다. close 면 처음으로 돌아와 닫는다. */
  function blob(pts, close) {
    if (pts.length < 3) return '';
    var p = close ? pts.concat([pts[0], pts[1]]) : pts;
    var mid = function (a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; };
    var m0 = mid(p[0], p[1]);
    var d = 'M' + r(m0[0]) + ' ' + r(m0[1]);
    for (var i = 1; i < p.length - 1; i++) {
      var m = mid(p[i], p[i + 1]);
      d += ' Q ' + r(p[i][0]) + ' ' + r(p[i][1]) + ' ' + r(m[0]) + ' ' + r(m[1]);
    }
    return d + (close ? ' Z' : '');
  }

  /* ── 눈송이 ──────────────────────────────────────────────────────
     육각 결정. 가지 하나를 그려 60도씩 여섯 번 돌린다. 레퍼런스처럼
     가지마다 잔가지가 한 겹 더 붙어 깃털처럼 보이게 한다. */

  function flakeArm(seed, fine) {
    var out = '<path d="M0 0 L0 -46"/>';
    var BR = [[0.30, 15], [0.47, 13], [0.63, 10], [0.78, 7.5], [0.90, 5]];
    for (var i = 0; i < BR.length; i++) {
      var y = -46 * BR[i][0];
      var len = BR[i][1] * (0.76 + jitter(seed * 7 + i * 3) * 0.5);
      var up = len * 0.78;
      for (var sd = -1; sd <= 1; sd += 2) {
        var ex = sd * len, ey = y - up;
        out += '<path d="M0 ' + r(y) + ' L' + r(ex) + ' ' + r(ey) + '"/>';
        if (!fine) continue;
        // 잔가지 — 큰 가지 위에 작은 깃이 두 개씩
        for (var k = 1; k <= 2; k++) {
          var t = k / 3;
          var bx = ex * t, by = y + (ey - y) * t;
          var sl = len * 0.34 * (1 - t * 0.45);
          out += '<path d="M' + r(bx) + ' ' + r(by) + ' L' + r(bx + sd * sl * 0.5) +
            ' ' + r(by - sl * 0.9) + '"/>';
          out += '<path d="M' + r(bx) + ' ' + r(by) + ' L' + r(bx + sd * sl * 0.95) +
            ' ' + r(by + sl * 0.28) + '"/>';
        }
      }
    }
    // 끝 갈래
    out += '<path d="M0 -46 L6 -38.5"/><path d="M0 -46 L-6 -38.5"/>';
    return out;
  }

  // fine 을 끄면 잔가지를 빼고 가볍게 그린다. 작게 쓰는 자리용.
  function flakeBody(seed, fine) {
    var arm = flakeArm((seed || 0) + 1, fine !== false), g = '';
    for (var k = 0; k < 6; k++) {
      g += '<g transform="rotate(' + (k * 60) + ')">' + arm + '</g>';
    }
    return '<g class="sn-fl-line">' + g + '</g>' +
      '<circle r="3.6" class="sn-fl-core"/>';
  }

  function flake(seed, cls, fine) {
    return svg('-54 -54 108 108', flakeBody(seed, fine), cls || 'sn-m-flake');
  }

  /* ── 별 — 큰 빛무리를 두른 겨울 별 ─────────────────────────────── */

  function star(cls) {
    var id = uid('ws');
    var main = 'M0 -36 Q 7 -8 27 0 Q 7 8 0 55 Q -7 8 -27 0 Q -7 -8 0 -36 Z';
    var diag = 'M0 -21 Q 4 -4 16 0 Q 4 4 0 21 Q -4 4 -16 0 Q -4 -4 0 -21 Z';
    return '<svg viewBox="-72 -72 144 144" class="' + (cls || 'sn-m-star') + '" ' +
      'xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      '<defs><radialGradient id="' + id + '">' +
        '<stop offset="0%"   stop-color="#FFFBEC" stop-opacity=".92"/>' +
        '<stop offset="24%"  stop-color="#F3C87A" stop-opacity=".42"/>' +
        '<stop offset="58%"  stop-color="#C8DCEF" stop-opacity=".17"/>' +
        '<stop offset="100%" stop-color="#C8DCEF" stop-opacity="0"/>' +
      '</radialGradient></defs>' +
      '<circle r="70" fill="url(#' + id + ')"/>' +
      '<g transform="rotate(45)"><path d="' + diag + '" fill="#F3C87A" opacity=".72"/></g>' +
      '<path d="' + main + '" fill="#FFFBEC"/>' +
      '<circle r="5.2" fill="#fff"/>' +
      '</svg>';
  }

  /* ── 전나무 ──────────────────────────────────────────────────────
     매끈한 삼각형이 아니라 가지를 한 겹씩 쌓는다. 가지마다 바로 위에
     흰 선을 하나 더 그어 눈이 얹힌 것처럼 보이게 한다. 레퍼런스의
     소나무 띠가 이 모양이다.

     levels 로 가지 수를 조절한다. 푸터처럼 작게 쓰는 자리는 적게. */

  /* 선만 그어서는 나무가 안 된다. 가지 끝을 이어 톱니 실루엣을 먼저 채우고,
     그 위에 눈을 얹는다. 눈을 가지만큼 길게 그으면 나무가 하얘지므로
     가지 위쪽 절반에만, 가늘게 얹는다. */
  function firBody(seed, levels) {
    var s = (seed || 0) + 1;
    var N = levels || 16;
    var H = 182;
    var lv = [];
    for (var i = 0; i < N; i++) {
      var t = i / (N - 1);                       // 0 아래 → 1 꼭대기
      var y = 8 - t * H;
      // 전나무는 생각보다 좁다. 높이의 1/3 쯤이 밑동 폭이어야 나무로 보인다.
      var reach = ((1 - t) * (1 - t) * 0.40 + (1 - t) * 0.60) * 37 + 4;
      reach *= 0.82 + jitter(s * 7 + i * 5) * 0.32;   // 층마다 들쭉날쭉해야 산다
      lv.push({ y: y, w: reach, d: reach * 0.62 + 4 });
    }

    // ── 실루엣 — 꼭대기에서 오른쪽을 타고 내려왔다 왼쪽으로 올라간다 ──
    var apex = lv[N - 1].y - 9;
    var d = 'M0 ' + r(apex);
    var k;
    for (k = N - 1; k >= 0; k--) {               // 오른쪽
      d += ' L' + r(lv[k].w * 0.26) + ' ' + r(lv[k].y - 3) +
           ' L' + r(lv[k].w) + ' ' + r(lv[k].y + lv[k].d);
    }
    d += ' L0 ' + r(lv[0].y + lv[0].d * 0.5);
    for (k = 0; k < N; k++) {                    // 왼쪽 (거슬러 올라간다)
      d += ' L' + r(-lv[k].w) + ' ' + r(lv[k].y + lv[k].d) +
           ' L' + r(-lv[k].w * 0.26) + ' ' + r(lv[k].y - 3);
    }
    d += ' Z';

    var out = '<path class="sn-fr-trunk" d="M-3.4 14 L3.4 14 L2.2 -14 L-2.2 -14 Z"/>' +
              '<path class="sn-fr-body" d="' + d + '"/>';

    // ── 눈 — 가지 위쪽에만 짧게 ──
    var snow = '';
    for (k = 0; k < N; k++) {
      if (k % 2 && k < N - 2) continue;          // 한 층 걸러야 덜 답답하다
      var L = lv[k];
      for (var sd = -1; sd <= 1; sd += 2) {
        snow += '<path d="M' + r(sd * L.w * 0.16) + ' ' + r(L.y - 2) +
          ' Q ' + r(sd * L.w * 0.55) + ' ' + r(L.y - 3.5) +
          ' ' + r(sd * L.w * 0.88) + ' ' + r(L.y + L.d * 0.52 - 2) + '"/>';
      }
    }
    return out + '<g class="sn-fr-sn">' + snow + '</g>';
  }

  function fir(seed, cls, levels) {
    return svg('-62 -186 124 200', firBody(seed, levels), cls || 'sn-m-fir');
  }

  /* 전나무 숲 한 띠 — 나무를 매번 새로 그리면 path 가 수천 개가 된다.
     본보기 몇 그루만 defs 에 두고 <use> 로 심는다. */
  function firRow(opt) {
    var o = opt || {};
    var W = o.width || 1440, H = o.height || 210, baseY = o.baseY || H - 2;
    var kinds = o.kinds || 5, levels = o.levels || 13;
    var defs = '';
    for (var k = 0; k < kinds; k++) {
      defs += '<g id="' + (o.idPrefix || 'snfir') + k + '">' + firBody(k * 3 + 1, levels) + '</g>';
    }
    var body = '', x = -28, i = 0;
    while (x < W + 48) {
      var sc = (o.minS || 0.46) + jitter(i * 17 + 3) * (o.spread || 0.46);
      var far = jitter(i * 23 + 5) > 0.52;
      var k2 = i % kinds;
      body += '<use href="#' + (o.idPrefix || 'snfir') + k2 + '" class="' +
        (far ? 'sn-fr-far' : 'sn-fr-near') + '" transform="translate(' + r(x) + ',' +
        r(baseY + (far ? -9 : 0)) + ') scale(' + r(far ? sc * 0.76 : sc) + ')"/>';
      x += (o.step || 58) * sc + jitter(i * 11 + 1) * 26;
      i++;
    }
    return svg('0 0 ' + W + ' ' + H, '<defs>' + defs + '</defs>' + body,
      o.cls || 'sn-m-firrow', o.slice ? 'preserveAspectRatio="xMidYMax slice"' : '');
  }

  /* ── 전구 줄 ─────────────────────────────────────────────────────
     레퍼런스처럼 줄 두 가닥이 엇갈려 늘어지고, 알전구마다 따뜻한
     빛무리가 번진다. 전구는 켜지는 때를 달리해 빛이 줄을 타고 흐른다. */

  function lightStrand(W, sag, y0, n, seed, idp) {
    var out = '<path class="sn-lt-cord" d="M0 ' + r(y0) + ' Q ' + r(W / 2) + ' ' +
      r(y0 + sag * 1.32) + ' ' + W + ' ' + r(y0) + '"/>';
    for (var i = 1; i <= n; i++) {
      var t = i / (n + 1);
      var x = W * t;
      var y = y0 + Math.sin(Math.PI * t) * sag;
      // 줄을 따라 조금씩 기울어 매달린다
      var tilt = (jitter(seed * 13 + i) - 0.5) * 16;
      // 꼭지는 줄에 바로 붙고, 알은 꼭지에 물려 있어야 한다.
      // 사이를 띄우면 전구가 공중에 뜬 것처럼 보인다.
      out += '<g class="sn-lt-b" style="animation-delay:' + r(i * 0.23 + seed * 0.4) + 's" ' +
        'transform="translate(' + r(x) + ',' + r(y) + ') rotate(' + r(tilt) + ')">' +
        '<circle class="sn-lt-halo" cy="12" r="19" fill="url(#' + idp + ')"/>' +
        '<path class="sn-lt-cap" d="M-3 -2 h6 v5.4 h-6 z"/>' +
        '<path class="sn-lt-glass" d="M-4.6 3 C -10 6, -11 20, 0 20 ' +
          'C 11 20, 10 6, 4.6 3 Z"/>' +
        '<ellipse class="sn-lt-core" cy="12" rx="3.6" ry="4.6"/>' +
        '</g>';
    }
    return out;
  }

  function lights(n, cls, opt) {
    var o = opt || {};
    var W = o.width || 520, sag = o.sag || 54, N = n || 11;
    var id = uid('ltg');
    var defs = '<defs><radialGradient id="' + id + '">' +
      '<stop offset="0%"  stop-color="#FFE9B5" stop-opacity=".85"/>' +
      '<stop offset="38%" stop-color="#F3C87A" stop-opacity=".34"/>' +
      '<stop offset="100%" stop-color="#F3C87A" stop-opacity="0"/>' +
      '</radialGradient></defs>';
    var body = lightStrand(W, sag, 6, N, 1, id);
    if (o.two !== false) {
      // 두 번째 가닥은 조금 더 늘어지고 전구도 하나 적다
      body += lightStrand(W, sag * 1.34, 2, N - 1, 2, id);
    }
    return svg('0 0 ' + W + ' ' + r(sag * 1.34 + 46), defs + body,
      cls || 'sn-m-lights');
  }

  /* ── 눈 둔덕과 고드름 ────────────────────────────────────────────
     레퍼런스의 snow-caps 처럼, 통통하게 부푼 눈이 모서리에 얹히고
     그 아래로 고드름이 길이를 달리해 매달린다. */

  function icicle(x, w, h, seed) {
    // 위는 두껍고 아래로 갈수록 가늘어지다 뾰족하게 끝난다
    var hx = w / 2;
    return 'M' + r(x) + ' 0' +
      ' C ' + r(x + hx * 0.18) + ' ' + r(h * 0.42) + ', ' +
              r(x + hx * 0.72) + ' ' + r(h * 0.70) + ', ' + r(x + hx) + ' ' + r(h) +
      ' C ' + r(x + w - hx * 0.72) + ' ' + r(h * 0.70) + ', ' +
              r(x + w - hx * 0.18) + ' ' + r(h * 0.42) + ', ' + r(x + w) + ' 0 Z';
  }

  function snowCap(opt) {
    var o = opt || {};
    var W = o.width || 1440;
    var rise = o.rise || 26;          // 모서리 위로 부푸는 높이
    var hang = o.hang || 16;          // 모서리 아래로 흘러내리는 깊이
    var ice = o.ice == null ? 34 : o.ice;   // 고드름 최대 길이
    var seed = o.seed || 1;
    var base = rise + 2;              // 담는 것의 윗변이 여기
    var i;

    // 아랫자락을 먼저 뽑아 둔다. 고드름이 이 선에 매달려야 하기 때문이다.
    var m = Math.max(5, Math.round(W / 150)), bot = [];
    for (i = 0; i <= m; i++) {
      bot.push(base + hang * (0.3 + 0.7 * jitter(seed * 7 + i * 5)));
    }
    var botAt = function (x) {
      var t = Math.max(0, Math.min(m, x / W * m));
      var k = Math.min(m - 1, Math.floor(t)), f = t - k;
      return bot[k] * (1 - f) + bot[k + 1] * f;
    };

    // 윤곽 한 바퀴 — 왼쪽 바깥 → 윗 능선 → 오른쪽 바깥 → 아랫자락
    var loop = [[-12, base + hang * 0.55]];
    var n = Math.max(6, Math.round(W / 118));
    for (i = 0; i <= n; i++) {
      loop.push([W * i / n, base - rise * (0.40 + 0.60 * jitter(seed * 11 + i * 3))]);
    }
    loop.push([W + 12, base + hang * 0.55]);
    for (i = m; i >= 0; i--) loop.push([W * i / m, bot[i]]);

    var out = '<path class="sn-ic-snow" d="' + blob(loop, true) + '"/>';
    // 능선 아래 밝은 결 한 줄 — 눈이 두툼해 보인다
    var lit = [];
    for (i = 0; i <= n; i++) {
      lit.push([W * i / n, loop[i + 1][1] + rise * 0.34 + 2]);
    }
    out += '<path class="sn-ic-lit" d="' + blob(lit) + '"/>';

    // 고드름 — 아랫자락에서 바로 내려온다
    if (ice > 0) {
      var icy = '', x2 = 8, k = 0;
      while (x2 < W - 10) {
        var iw = 5 + jitter(seed * 5 + k * 3) * 8;
        var ih = 9 + jitter(seed * 9 + k * 7) * ice;
        var y0 = botAt(x2 + iw / 2) - 4;
        icy += '<g transform="translate(0,' + r(y0) + ')"><path class="sn-ic-ice" d="' +
          icicle(x2, iw, ih, k) + '"/></g>';
        x2 += iw + 5 + jitter(seed * 3 + k) * 30;
        k++;
      }
      out = '<g class="sn-ic-ices">' + icy + '</g>' + out;
    }
    return svg('0 0 ' + W + ' ' + r(base + hang + ice + 12), out,
      o.cls || 'sn-m-snowcap', 'preserveAspectRatio="none"');
  }

  /* ── 눈 언덕 — 섹션 아래에 쌓인 눈 ──────────────────────────────── */

  function snowBank(cls, seed) {
    var W = 1440, H = 120, s = seed || 3;
    var far = [], near = [];
    // 양 끝을 화면 밖까지 빼야 가장자리가 비스듬히 잘리지 않는다
    for (var i = -1; i <= 10; i++) {
      far.push([W * i / 9, 46 - jitter(s * 11 + (i + 1) * 3) * 22]);
    }
    for (var j = -1; j <= 8; j++) {
      near.push([W * j / 7, 74 - jitter(s * 5 + (j + 1) * 7) * 20]);
    }
    var close = ' L' + W + ' ' + H + ' L0 ' + H + ' Z';
    return svg('0 0 ' + W + ' ' + H,
      '<path class="sn-bank-far"  d="' + blob(far) + close + '"/>' +
      '<path class="sn-bank-near" d="' + blob(near) + close + '"/>',
      cls || 'sn-m-bank', 'preserveAspectRatio="none"');
  }

  /* ── 눈 쌓인 학사모 ──────────────────────────────────────────────
     히어로의 주인공. 기존 배경 사진의 학사모를 겨울 모습으로 옮긴 것이다.
     판은 비스듬히 눕히고, 위쪽 면에 눈을 얹고, 술을 오른쪽으로 늘어뜨린다. */

  function gradCap(cls) {
    var id = uid('gcs');
    var out =
      // 사진 위에 놓이므로 판이 배경보다 밝아야 물체로 보인다.
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0.3" y2="1">' +
        '<stop offset="0%"   stop-color="#51709E"/>' +
        '<stop offset="55%"  stop-color="#36507D"/>' +
        '<stop offset="100%" stop-color="#22355C"/>' +
      '</linearGradient></defs>' +
      // 모자 몸통 — 판 아래로 보이는 부분
      '<path class="sn-gc-body" d="M-44 4 C -47 36, -31 60, 0 60 ' +
        'C 31 60, 47 36, 44 4 C 28 22, -28 22, -44 4 Z"/>' +
      // 판
      '<path class="sn-gc-board" fill="url(#' + id + ')" ' +
        'd="M0 -52 L98 -6 L0 40 L-98 -6 Z"/>' +
      // 판 윗면의 결 — 천 느낌
      '<path class="sn-gc-rim" d="M0 -52 L98 -6 L0 40"/>' +
      '<path class="sn-gc-grain" d="M-40 6 L0 -12 M28 -24 L70 -6"/>' +
      // 눈 — 왼쪽 위 '모서리를 따라' 쌓인다. 면 전체를 덮으면 종이처럼 보인다.
      '<path class="sn-gc-snow" d="M-98 -6 L0 -52 L12 -46 ' +
        'C -4 -38, -22 -30, -42 -21 C -62 -12, -80 -6, -90 -2 ' +
        'C -95 0, -98 -2, -98 -6 Z"/>' +
      // 능선 위로 봉긋한 덩이 몇 개 — 눈이 두툼해 보인다
      '<path class="sn-gc-snow" d="M-74 -17 C -66 -26, -52 -28, -46 -22 ' +
        'C -54 -20, -64 -16, -74 -17 Z"/>' +
      '<path class="sn-gc-snow" d="M-34 -32 C -26 -41, -10 -43, -4 -37 ' +
        'C -14 -35, -24 -32, -34 -32 Z"/>' +
      // 왼쪽 귀퉁이에 조금 흘러내린 자국
      '<path class="sn-gc-snow" d="M-98 -6 C -92 1, -82 5, -72 3 ' +
        'C -78 9, -90 9, -96 3 C -98 1, -99 -3, -98 -6 Z"/>' +
      // 술 — 단추에서 오른쪽으로 건너가 늘어진다
      '<path class="sn-gc-cord" d="M0 -8 C 26 -10, 52 -16, 74 -22 ' +
        'C 84 -25, 90 -18, 88 -6 C 86 10, 84 28, 86 44"/>' +
      '<path class="sn-gc-fringe" d="M86 44 L78 86 M86 44 L84 90 M86 44 L90 89 ' +
        'M86 44 L96 84 M86 44 L73 78 M86 44 L100 76"/>' +
      '<circle class="sn-gc-knot" cx="86" cy="45" r="6"/>' +
      '<circle class="sn-gc-btn" cx="0" cy="-8" r="6.5"/>';
    return svg('-130 -96 260 210', out, cls || 'sn-m-gradcap');
  }

  /* ── 서리 고사리 — 유리에 낀 성에 ────────────────────────────────
     줄기 하나에 깃을 붙이고, 깃마다 잔깃을 또 붙인다. */

  function fernArm(x, y, ang, len, wd, depth) {
    var ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
    var out = '<path d="M' + r(x) + ' ' + r(y) + ' L' + r(ex) + ' ' + r(ey) +
      '" stroke-width="' + r(wd) + '"/>';
    if (depth <= 0) return out;
    var n = depth > 1 ? 11 : 4;
    for (var i = 1; i <= n; i++) {
      var t = i / (n + 1);
      var px = x + Math.cos(ang) * len * t, py = y + Math.sin(ang) * len * t;
      var sl = len * 0.40 * (1 - t * 0.72);
      out += fernArm(px, py, ang - 0.66, sl, wd * 0.6, depth - 1);
      out += fernArm(px, py, ang + 0.66, sl, wd * 0.6, depth - 1);
    }
    return out;
  }

  // 왼쪽 위 모서리에서 자라는 모양. 쓰는 쪽에서 뒤집어 네 귀에 쓴다.
  function frostCorner(cls) {
    var g = '<g class="sn-fc-line">' +
      fernArm(0, 0, 0.72, 96, 2.6, 2) +
      fernArm(0, 0, 0.30, 70, 2.0, 2) +
      fernArm(0, 0, 1.18, 66, 2.0, 2) +
      '</g>';
    return svg('-6 -6 118 118', g, cls || 'sn-m-frost');
  }

  /* ── 눈사람 — 빈 화면과 404 의 주인공 ───────────────────────────── */

  function snowman(cls) {
    var out =
      '<ellipse class="sn-sm-shadow" cx="0" cy="8" rx="40" ry="7"/>' +
      '<path class="sn-sm-arm" d="M-21 -58 L-48 -76 M-40 -71 L-47 -64 M-44 -74 L-45 -84"/>' +
      '<path class="sn-sm-arm" d="M21 -58 L49 -70 M41 -67 L48 -60 M45 -69 L47 -79"/>' +
      '<circle class="sn-sm-body" cx="0" cy="-28" r="32"/>' +
      '<circle class="sn-sm-body" cx="0" cy="-73" r="23"/>' +
      '<circle class="sn-sm-body" cx="0" cy="-108" r="17"/>' +
      '<circle class="sn-sm-coal" cx="0" cy="-36" r="3.1"/>' +
      '<circle class="sn-sm-coal" cx="0" cy="-24" r="3.1"/>' +
      '<circle class="sn-sm-coal" cx="0" cy="-12" r="3.1"/>' +
      '<path class="sn-sm-scarf" d="M-19 -92 C -8 -85, 8 -85, 19 -92 ' +
        'C 20 -86, 20 -82, 19 -78 C 8 -71, -8 -71, -19 -78 Z"/>' +
      '<path class="sn-sm-scarf" d="M12 -80 C 20 -74, 24 -62, 21 -50 ' +
        'L10 -52 C 13 -62, 12 -72, 7 -78 Z"/>' +
      '<circle class="sn-sm-coal" cx="-6" cy="-113" r="2.6"/>' +
      '<circle class="sn-sm-coal" cx="6"  cy="-113" r="2.6"/>' +
      '<path class="sn-sm-nose" d="M0 -108 L19 -103 L0 -101 Z"/>' +
      '<path class="sn-sm-smile" d="M-7 -100 Q 0 -95 7 -100"/>' +
      '<path class="sn-sm-hat" d="M-18 -119 C -17 -134, -8 -141, 0 -141 ' +
        'C 8 -141, 17 -134, 18 -119 Z"/>' +
      '<path class="sn-sm-hat-br" d="M-19 -122 h38 v7 h-38 z"/>' +
      '<circle class="sn-sm-hat" cx="0" cy="-146" r="6"/>';
    return svg('-62 -158 124 176', out, cls || 'sn-m-snowman');
  }

  /* ── 리스 ──────────────────────────────────────────────────────── */

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

  /* ── 호랑가시 ──────────────────────────────────────────────────── */

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

  /* ── 솔방울 ────────────────────────────────────────────────────── */

  function pinecone(cls) {
    var out = '<path class="sn-pc-stem" d="M0 -2 L0 8"/>';
    for (var i = 0; i < 8; i++) {
      var y = -6 - i * 8.6;
      var n = i < 2 ? 2 : 3;
      var sp = 7.6 - i * 0.55;
      var rx = 6.6 - i * 0.48, ry = 5.4 - i * 0.34;
      for (var k = 0; k < n; k++) {
        var x = (k - (n - 1) / 2) * sp;
        out += '<ellipse class="sn-pc-sc" cx="' + r(x) + '" cy="' + r(y) +
          '" rx="' + r(rx) + '" ry="' + r(ry) + '"/>';
      }
    }
    return svg('-26 -84 52 96', out, cls || 'sn-m-pinecone');
  }

  /* ── 촛불 ──────────────────────────────────────────────────────── */

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

  /* ── 니트 무늬 띠 ──────────────────────────────────────────────── */

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

  /* ── 눈구름 ────────────────────────────────────────────────────── */

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

  /* ── 눈더미 구분선 ─────────────────────────────────────────────── */

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

  window.SeasonMotifsWinter = {
    blob: blob,
    flake: flake, flakeBody: flakeBody,
    star: star,
    fir: fir, firBody: firBody, firRow: firRow,
    lights: lights,
    snowCap: snowCap, snowBank: snowBank, icicle: icicle,
    gradCap: gradCap, frostCorner: frostCorner,
    drift: drift,
    holly: holly, pinecone: pinecone,
    snowman: snowman, wreath: wreath, candle: candle,
    knitRow: knitRow, snowCloud: snowCloud
  };
})();
