# Handoff: 아이엠러닝(IMlearning) 브랜드 심볼 세트

## Overview
아이엠러닝(온라인 교육 플랫폼)의 **글로시(입체 광택) 라인의 브랜드 아이콘 14종**입니다.
강좌 평점, 위시리스트, 수강 상태, 수료/성취, 선물, 콘텐츠, 성장, 계정, 신앙, 공동체(집) 등
서비스 전반에서 쓰이는 UI 심볼 세트입니다. 슬로건: *I'M Learning, I'M Running*.

## About the Design Files
이 번들의 `icons/*.svg`는 **바로 사용 가능한 프로덕션 SVG 자산**입니다(HTML 프로토타입과 달리 그대로 배포/임포트 가능).
`preview/`의 `IMlearning Symbol Set.dc.html`는 14종을 한눈에 보는 **비교용 미리보기**일 뿐이며,
실제 코드베이스에는 이 HTML을 옮기는 게 아니라 **SVG 파일들을 프로젝트의 아이콘 시스템에 통합**하면 됩니다
(React `import`, `<img>`, SVG 스프라이트, 아이콘 컴포넌트 등 기존 패턴에 맞게).

## Fidelity
**High-fidelity.** 최종 색상·형태·그라데이션·하이라이트가 확정된 상태입니다. 좌표/색상 값을 그대로 신뢰해도 됩니다.

## The icon system (construction spec)
모든 아이콘은 동일한 규칙으로 만들어졌습니다. 새 아이콘을 추가할 때도 이 규칙을 따르세요.

- **Canvas**: `viewBox="0 0 32 32"`, 중앙 정렬. 16~48px 사용 가정(20px에서도 형태 유지 검증됨).
- **Fill 방식**: 선(stroke)이 아니라 **면(fill)** 기반. 배경 칩/배지 없음.
- **글로시 3요소**:
  1. **세로 선형 그라데이션** (위 밝은 톤 → 아래 진한 톤). `<linearGradient x1=0 y1=0 x2=0 y2=1>`.
  2. **흰색 스페큘러 하이라이트**: 오브젝트 상단/좌상단에 `fill="#fff"` `opacity 0.16~0.35`의 ellipse 또는 gloss 밴드.
  3. **흰색 음각 디테일**: 키홀·리본·별·문 등 세부는 `fill="#fff" opacity 0.82~0.95`로 처리(선 대신 흰색 knockout).
- **깊이 보조**: 겹치는 면은 `fill="#000" opacity 0.1~0.14`(또는 톤 맞춘 어두운색)로 살짝 눌러 층 구분.

## Design Tokens — Glossy palette
각 그라데이션은 `[top, bottom]` 두 스톱. 채도/명도를 맞춰 하모니를 이룹니다.

| 토큰 | Top | Bottom | 사용 아이콘 |
|---|---|---|---|
| green (brand) | `#63C99B` | `#248C61` | lock-open, completion, sprout |
| grey (inactive) | `#C6D0CB` | `#93A29A` | heart-outline, lock-closed, star-half의 빈 반쪽 |
| red | `#FF7A7A` | `#E23B3B` | heart-filled |
| gold | `#FBD46A` | `#EFA31C` | star, star-half, trophy |
| blue | `#6FBAF0` | `#2E77D0` | book |
| coral | `#FF9C8A` | `#F0617E` | gift |
| purple | `#B49BF0` | `#7B4FD6` | faith |
| teal | `#5CD1C6` | `#1C9C93` | profile |
| orange | `#FFB264` | `#F07E1C` | house |

브랜드 코어 그린: **#2D9B6F** (그린 그라데이션의 대표값).

## Icons (14) — 파일 · 용도 · 상태
| 파일 | 한글 | 용도 | 색상 |
|---|---|---|---|
| `star.svg` | 별점 | 강좌 평점(가득 찬 별) | gold |
| `star-half.svg` | 별점 반개 | 평점 0.5 표현(좌 gold / 우 grey) | gold + grey |
| `heart-outline.svg` | 찜하기 · 빈 상태 | 위시리스트 미추가(비활성) | grey |
| `heart-filled.svg` | 찜하기 · 활성 | 위시리스트 추가(활성) | red |
| `lock-closed.svg` | 수강 · 잠김 | 미수강/잠김(비활성) | grey |
| `lock-open.svg` | 수강 · 열림 | 수강 가능(고리가 우상단으로 열림) | green |
| `completion.svg` | 수료 | 강좌 완료·수료증(체크 씰+리본) | green |
| `trophy.svg` | 트로피 | 성취/뱃지 시스템 | gold |
| `gift.svg` | 선물하기 | 강의 선물 | coral |
| `book.svg` | 책 | 강좌/콘텐츠 일반(위로 펼쳐진 책) | blue |
| `sprout.svg` | 새싹 · 성장 | 성장/발전 뱃지, "함께 성장합니다" | green |
| `profile.svg` | 프로필 | 마이페이지/계정 | teal |
| `faith.svg` | 신앙 | 신앙 카테고리(십자가) | purple |
| `house.svg` | 공동체 · 집 | 커뮤니티/추천, "온 교회가 함께" | orange |

**상태 규칙**: 활성 = 카테고리 색, 비활성 = grey. 하트/자물쇠는 활성·비활성 두 파일로 분리 제공.
(초기 스펙의 `badge`는 `trophy`로, `community`(악수)는 `house`로 대체됨.)

## Integration notes (개발자용)
- **정적 색상**: 각 SVG 내부에 그라데이션이 하드코딩돼 있어 그대로 쓰면 됩니다.
- **동적 색상이 필요하면**: 그라데이션 스톱을 `currentColor`/CSS 변수로 바꾸거나, 팔레트 토큰을 CSS/디자인시스템 변수로 옮기세요.
- **평점 렌더링**: 별 0.5 단위는 `star.svg` + `star-half.svg` + `heart-outline`류의 빈 별(필요 시 grey `star`) 조합으로 구성.
- **접근성**: 인터랙티브 토글(찜/자물쇠)은 `role`/`aria-pressed`·`aria-label` 부여. 장식용은 `aria-hidden`.
- **히트 타깃**: 아이콘 자체는 16~24px여도 클릭 영역은 44px 이상 확보.
- 새 아이콘은 위 "construction spec"과 팔레트를 따르면 세트 일관성이 유지됩니다.

## Files
- `icons/*.svg` — 14종 프로덕션 아이콘(각 `viewBox 0 0 32 32`)
- `preview/IMlearning Symbol Set.dc.html` — 비교용 미리보기(참고용, 배포 대상 아님)
