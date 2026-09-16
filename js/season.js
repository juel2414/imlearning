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
      // 히어로 안에 달·구름·억새를 얹는다
      decorate: function (hero) {
        var d = document.createElement('div');
        d.className = 'season-deco';
        d.setAttribute('aria-hidden', 'true');
        d.innerHTML =
          '<div class="sn-moon"></div>' +
          '<div class="sn-ground"></div>' +
          cloud('sn-cloud-1') +
          cloud('sn-cloud-2') +
          reeds('sn-reeds-far') +
          reeds('');
        hero.appendChild(d);
      },
    },
  };

  function cloud(cls) {
    return '<div class="sn-cloud ' + cls + '">' +
      '<svg viewBox="0 0 300 80" fill="currentColor" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M40 64 C 14 64, 10 40, 34 36 C 34 16, 64 10, 76 26 C 88 8, 124 10, 130 30 ' +
      'C 152 22, 176 34, 174 50 C 196 48, 206 64, 188 64 Z"/>' +
      '<path d="M196 66 C 178 66, 176 50, 192 48 C 194 34, 216 32, 222 44 ' +
      'C 234 34, 256 40, 256 54 C 274 54, 278 66, 264 66 Z" opacity=".8"/>' +
      '</svg></div>';
  }

  // 억새 한 줄. 줄기마다 흔들리는 시각을 달리해 바람처럼 보이게 한다.
  // 줄기 하나는 아래에서 위로 자라는 제 좌표계에서 그린 뒤 제자리로 옮긴다.
  function reed(h, lean, seed) {
    var bend = lean * 0.22;                 // 줄기가 휘는 정도
    var P = h * 0.34;                       // 이삭 길이
    var side = seed % 2 ? 1 : -1;           // 이삭이 늘어지는 쪽
    var tipX = bend + P * 0.34 * side, tipY = -h - P;
    var cX = bend + P * 0.06 * side, cY = -h - P * 0.62;

    var stalk = 'M0 0 Q ' + (bend * 0.35) + ' ' + (-h * 0.52) + ' ' + bend + ' ' + (-h);
    var spine = 'M' + bend + ' ' + (-h) + ' Q ' + cX + ' ' + cY + ' ' + tipX + ' ' + tipY;

    // 이삭의 잔털 — 척추를 따라 좌우로 갈라져 아래로 늘어진다
    var hairs = '', N = 22;
    for (var i = 1; i <= N; i++) {
      var t = i / N;
      var mt = 1 - t;
      var px = mt * mt * bend + 2 * mt * t * cX + t * t * tipX;
      var py = mt * mt * (-h) + 2 * mt * t * cY + t * t * tipY;
      var j = jitter(seed * 31 + i);                  // 털마다 길이와 각도를 흩는다
      var len = P * 0.38 * (0.28 + 0.72 * Math.sin(Math.PI * t)) * (0.7 + 0.6 * j);
      var sgn = i % 2 ? 1 : -1;
      var drop = 0.34 + 0.40 * t + 0.2 * j;           // 끝으로 갈수록 더 늘어진다
      var ex = px + sgn * len * (0.92 - 0.25 * j), ey = py + len * drop;
      var qx = px + sgn * len * 0.60, qy = py + len * (drop * 0.12);
      hairs += 'M' + r(px) + ' ' + r(py) + ' Q ' + r(qx) + ' ' + r(qy) + ' ' + r(ex) + ' ' + r(ey);
    }

    return '<path class="sn-stalk" d="' + stalk + '"/>' +
           '<path class="sn-stalk" d="' + spine + '"/>' +
           '<path class="sn-plume" d="' + hairs + '"/>';
  }

  // 같은 자리에는 늘 같은 값이 나오는 흩뜨림
  function jitter(n) { var v = Math.sin(n * 12.9898) * 43758.5453; return v - Math.floor(v); }

  function r(n) { return Math.round(n * 10) / 10; }

  function reeds(cls) {
    var sways = ['sn-sway', 'sn-sway-2', 'sn-sway-3', 'sn-sway-4'];
    var body = '', x = -6, i = 0;
    while (x < 1034) {
      var h = 78 + ((i * 37) % 62);          // 높이를 섞어 줄 세운 티를 없앤다
      var lean = ((i * 53) % 25) - 12;
      body += '<g class="' + sways[i % 4] + '">' +
                '<g transform="translate(' + x + ',160) rotate(' + lean + ')">' +
                  reed(h, lean, i) +
                '</g></g>';
      x += 26 + ((i * 17) % 15);
      i++;
    }
    return '<div class="sn-reeds ' + cls + '">' +
      '<svg viewBox="0 0 1024 160" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">' +
      body + '</svg></div>';
  }

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
