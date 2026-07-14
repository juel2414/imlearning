# IMlearning 보안 감사 중간 보고서 — R700 기준

작성일: 2026-07-15  
감사 범위: 아이엠러닝 플랫폼 (GitHub Pages + Supabase)  
라운드 진행: R631~R700 (이 파일은 R700 기준 중간 보고)

---

## R631~R700 신규 발견 및 수정 취약점

### 🔴 심각 (즉시 위험)

없음.

### 🟠 높음 (조건부 위험)

없음.

### 🟡 중간 (제한적 위험)

| # | 항목 | 파일 | 조치 |
|---|------|------|------|
| 1 | `index.html` hero CTA href에 `javascript:` URL 필터 누락 — admin 계정 탈취 시 `cta1_url`/`cta2_url`에 `javascript:` 삽입으로 일반 사용자 Stored XSS 가능 (line 1036 CTA 섹션은 이미 필터 있었음) | `index.html` | `safeHref()` 함수 추가 — `:` 포함 + `http`로 시작 안 하면 fallback URL 사용 |

---

## 확인된 안전 항목 (R631~R700)

| 항목 | 결론 |
|------|------|
| `reviews` UNIQUE (user_id, course_id) (R627) | 동일 강좌 중복 리뷰 방지 ✓ |
| `progress` UNIQUE (user_id, course_id, lesson_id) (R630) | 중복 진도 저장 방지 ✓ |
| `admin/banners.html` 권한 체크 (R633) | `getSession()` + `profiles.role==='admin'` 이중 체크 ✓ |
| `theme_config` RLS (R638) | 읽기 공개, 쓰기 admin only (USING+WITH CHECK) ✓ |
| `lessons` RLS (R631) | `is_free_preview=true` → anon 포함 공개, 구매/패스/선물 → 유료 접근 ✓ |
| `orders` SET NULL (강좌 삭제 시) (R635) | course_name 유지로 패스와 혼동 없음 ✓ |
| `reviews` RLS (R657) | admin_all → DELETE 가능, 일반 사용자 DELETE 불가 ✓ |
| `refund-payment` 전체 (R641) | TOCTOU 방지, PortOne 롤백, watchRatio 기반, 패스 cascade ✓ |
| `send-email` 전체 (R642) | 모든 타입 rate limit/인증/URL 검증 ✓ |
| `im_recent` localStorage (R644) | DB bigint id 저장, esc() 처리 ✓ |
| `admin/reviews.html` (R656) | esc() 전면 처리, r.id는 bigint ✓ |
| `admin/students.html` 수료 (R656) | "수료"는 필터 드롭다운이며 DB 강제 수료 없음 ✓ |
| `admin_grant_course` 함수 (R652) | admin 체크, 중복 방지, 강좌 존재 확인 ✓ |
| `award_badge` 함수 (R652) | badge_type 허용 목록, ON CONFLICT DO NOTHING ✓ |
| `gift.html` 렌더링 (R658) | 모든 DB 데이터 esc() 처리 ✓ |
| `BADGE_DEFINITIONS` (R660) | badges.js 하드코딩, DB 미사용 ✓ |
| `search.html` 검색어 (R662) | 검색어가 innerHTML에 미삽입, 강사 필터 esc() ✓ |
| `courseCard` 함수 (R662) | esc() 전면 처리, 숫자 타입 href ✓ |
| `instructor.html` (R665) | 전체 esc() 처리 ✓ |
| `pass.html` (R667) | 전체 esc() 처리 ✓ |
| `login.html` next= 파라미터 (R661) | `//`/`http`/`:` 포함 시 null 처리 ✓ |
| `reset-password.html` (R680) | redirectTo는 window.location.origin 기반 ✓ |
| `prevent_video_progress_manipulation` 트리거 (R671) | actual_watched_seconds 감소 금지, total_seconds 증가 금지 ✓ |
| `wishlists`/`study_plans` RLS (R673) | 본인 전용 ✓ |
| `contacts` RLS (R675) | admin 읽기, 직접 INSERT 차단 (send-email service_role) ✓ |
| `accept_gift` 함수 (R678) | FOR UPDATE 락, pending 외 차단, 만료/이메일/중복 체크 ✓ |
| `study_logs` RLS WITH CHECK (R682) | 타인 삽입 불가, admin 조회만 ✓ |
| `orders` RLS (R688) | INSERT/DELETE 기본 거부, UPDATE admin만, SELECT 본인/admin ✓ |
| `video_progress` RLS (R695) | INSERT에 구매+lessons.sort_order 검증 포함 ✓ |
| `badges` RLS (R696) | SELECT만, INSERT 직접 차단 (award_badge 함수만) ✓ |
| `user_coupons` RLS (R697) | 조회만 가능, INSERT/DELETE 차단 (use_coupon 함수만) ✓ |
| `gifts` RLS (R698) | 조회만, INSERT는 service_role, UPDATE는 SECURITY DEFINER ✓ |
| `video_progress` FK (R691) | course_id/user_id ON DELETE CASCADE ✓ |
| `lessons`/`wishlists`/`badges`/`review_request_logs` FK (R692) | 적절한 CASCADE ✓ |

---

## 미해결 이슈 목록 (R631~R700 추가)

| 우선순위 | 이슈 | 비고 |
|---------|------|------|
| 낮음 | `progress.course_id` FK 없음 (R687) | 강좌 삭제 시 고아 레코드 발생, 보안 이슈 아니나 데이터 정합성 |
| 낮음 | `profiles.email` ↔ `auth.users.email` 동기화 없음 (R646) | 이메일 변경 시 new_course 발송에 구 이메일 사용될 수 있음 |

---

## 누적 미해결 이슈 목록 (전체)

| 우선순위 | 이슈 | 비고 |
|---------|------|------|
| 높음 | Edge Functions 3개 미배포 | 로컬 변경 완료 |
| 중간 | 비밀번호 유출 보호 비활성화 | Supabase Dashboard → Auth → Password Security |
| 낮음 | `gift-preview` SITE_URL 하드코딩 | 도메인 전환 시 env var로 변경 필요 |
| 낮음 | `check_rate_limit` 고정 윈도우 방식 | 경계에서 최대 2×p_max 버스트 가능 |
| 낮음 | `get_gift_by_code` anon rate limit 없음 | 코드 공간 2.8조로 실용적 위험 낮음 |
| 낮음 | `study_logs` 과거 날짜 INSERT 가능 | studied_at <= now() 제약 없음 |
| 낮음 | Vimeo 도메인 화이트리스트 미확인 | Vimeo 대시보드에서 설정 확인 필요 |
| 낮음 | GitHub Pages CSP 헤더 추가 불가 | meta CSP 태그 고려 |
| 낮음 | `progress.lesson_id`(text) vs `lessons.id`(bigint) 타입 불일치 | 장기적 스키마 통일 필요 |
| 낮음 | `lessons.duration_seconds` NULL 허용 | 신규 강좌 설정 누락 시 watchRatio=0 → 즉시 환불 가능 |
| 낮음 | `progress` DELETE 가능 | 본인 진도 삭제 후 재INSERT로 수료증 조작 가능하나 법적 효력 없음 |
| 낮음 | 수료증 클라이언트 생성 | 서버 검증 없음, 위조 가능하나 법적 효력 없음 |
| 낮음 | PortOne webhook 없음 | PortOne 자체 취소 이벤트 DB 미반영 가능 |
| 낮음 | `video_progress` UPDATE lesson_number 변경 가능 | actual_watched_seconds 감소 방지 있고 환불에서 미사용 |
| 낮음 | `progress.course_id` FK 없음 | 강좌 삭제 시 고아 레코드 |
| 낮음 | `profiles.email` 동기화 트리거 없음 | 이메일 변경 시 불일치 가능 |
| 낮음 | 배지 조건 클라이언트-서버 불일치 | award_badge()에서 조건 재검증 없음, 배지는 장식 목적 |
| 낮음 | admin 본인 role 강등 가능 | prevent_role_escalation: 본인이 admin이면 role='user'로 변경 가능 |

---

## 다음 감사 방향 (R701~R800)

- [ ] `admin/courses.html` 강좌 등록/수정 데이터 XSS 전체 검토
- [ ] `course-detail.html` 상세 페이지 전체 XSS + 구매 플로우
- [ ] `verify-payment` Edge Function 패스 구매 동시 호출 시나리오
- [ ] Edge Function `send-email` HTML 이메일 템플릿 XSS
- [ ] `reward_review` 함수 TOCTOU 재확인
- [ ] `get_top_reviews` 함수 데이터 노출 범위
- [ ] admin/notices.html 공지사항 관리
- [ ] 강의 목록 영상 URL API 직접 조회 시도
- [ ] 수료증 위조 시나리오 상세 분석
- [ ] Supabase Advisors 확인 (자동 보안 권고 사항)
