// ───── 강좌 시리즈 판별 ─────────────────────────────────────────────
// 강좌 이름에 시리즈가 이미 들어 있다. 복음스쿨_, [영단속], 부모학교강사과정-
// 처럼 표기가 제각각이라 규칙으로 정리한다. 화면 여러 곳에서 같은 기준으로
// 묶여야 하므로 여기 한 곳에만 둔다.
//
// 새 강좌가 기존 표기를 따르면 자동으로 들어간다. 그렇지 않으면 아래
// SERIES 에 한 줄 추가하면 된다.
(function (global) {
  var SERIES = [
    { name: '복음스쿨',        test: /^복음스쿨[_\s]/ },
    { name: '제자스쿨',        test: /^제자스쿨[_\s]/ },
    { name: '소명스쿨',        test: /^소명스쿨[_\s]/ },
    { name: '영단속',          test: /^\[영단속\]|^영단속$|^67패턴/ },
    { name: 'IM선교회 교사교육', test: /^\[IM선교회 교사교육\]/ },
    { name: 'CAS 방과후학교',   test: /^\[CAS/ },
    { name: 'CBUP',           test: /CBUP/ },
    { name: '리뉴젠아카데미',    test: /^리뉴젠아카데미/ },
    { name: '온택 검정고시',    test: /^온택\s*검고/ },
    { name: '부모학교',        test: /^부모학교/ },
    { name: '성교육·성문제',    test: /^\[성교육\]|^\[성문제/ },
    { name: '토익·문법',       test: /^(LC|RC|왕기초 RC|문법마스터)/ },
  ];

  function seriesOf(title) {
    var t = String(title || '').trim();
    for (var i = 0; i < SERIES.length; i++) {
      if (SERIES[i].test.test(t)) return SERIES[i].name;
    }
    return '';   // 시리즈 없음 → 화면에서 "개별 강좌" 로 모은다
  }

  // 시리즈 안에서만 의미 있는 뒷부분. 목록에서 앞머리를 반복하지 않게 한다.
  function shortTitle(title, series) {
    var t = String(title || '').trim();
    if (!series) return t;
    return t
      .replace(/^\[[^\]]+\]\s*/, '')
      .replace(/^[^_]+_\s*/, '')
      .replace(/^온택\s*검고\s*/, '')
      .trim() || t;
  }

  global.courseSeriesOf = seriesOf;
  global.courseShortTitle = shortTitle;
})(window);
