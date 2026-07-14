# IMlearning 보안 감사 중간 보고서 — R800 기준

작성일: 2026-07-15  
감사 범위: 아이엠러닝 플랫폼 (GitHub Pages + Supabase)  
라운드 진행: R701~R800 (이 파일은 R800 기준 중간 보고)

---

## R701~R800 신규 발견 취약점

### 🔴 심각 (즉시 위험)

없음.

### 🟠 높음 (조건부 위험)

없음.  
(이전 HIGH 이슈였던 **Edge Functions 미배포 3건** → R794 재확인 결과 모두 ACTIVE 상태 ✓ **해결됨**)

### 🟡 중간 (제한적 위험)

없음.

### 🟢 낮음 (정보성 위험)

| # | 항목 | 위치 | 조치 방안 |
|---|------|------|----------|
| 1 | **쿠폰 TOCTOU**: 동일 사용자가 서로 다른 강좌를 동시에 구매하면 prevUse 체크 두 건 모두 통과 → 같은 쿠폰 이중 사용 가능 (`orders`에 `UNIQUE(user_id, coupon_code)` WHERE 제약 없음) | `verify-payment/index.ts` L321~345 / `orders` 테이블 | `CREATE UNIQUE INDEX ON orders(user_id, coupon_code) WHERE coupon_code IS NOT NULL` |
| 2 | **리뷰 즉시 공개**: `reviews.status` 기본값 `'visible'` — admin 승인 없이 즉시 전체 공개 | `reviews` 테이블 | 설계 선택 (의도적). 원할 시 기본값 `'pending'` 변경 고려 |
| 3 | **숨김 리뷰 쿠폰 지급**: `reward_review()` 함수에서 `status` 체크 없음 → hidden 리뷰도 쿠폰 보상 가능 | `reward_review` 함수 | `WHERE r.status = 'visible'` 조건 추가 |
| 4 | **profiles_insert_own WITH CHECK 누락**: INSERT 정책에 `WITH CHECK (auth.uid() = id)` 없음 → 이론적으로 타인 UUID 알면 INSERT 가능 (실제 위험: auth.users FK + ON CONFLICT DO NOTHING으로 차단됨) | `profiles` 테이블 | `WITH CHECK (auth.uid() = id)` 추가 |
| 5 | **notices draft anon 노출**: `notices` SELECT 정책이 `true` → `display_mode='hidden'`인 초안 공지도 anon 직접 API 조회 시 노출 | `notices` 테이블 | `USING (display_mode IN ('none','popup','banner'))` 로 정책 수정 |
| 6 | **courses.price 음수 허용**: `price` 컬럼에 `CHECK (price >= 0)` 없음 → admin이 음수 가격 설정 시 쿠폰 할인 경로에서 의도치 않은 무료 등록 | `courses` 테이블 | `ALTER TABLE courses ADD CONSTRAINT price_nonneg CHECK (price >= 0)` |

---

## R794 해결 항목

| 항목 | 결과 |
|------|------|
| `verify-payment` Edge Function | **ACTIVE** (v13) ✓ — 이전 HIGH 이슈 해결 |
| `refund-payment` Edge Function | **ACTIVE** (v11) ✓ |
| `send-email` Edge Function | **ACTIVE** (v10) ✓ |

---

## 확인된 안전 항목 (R701~R800)

| 항목 | 결론 |
|------|------|
| `get_top_reviews()` 반환 컬럼 (R702) | id/rating/content/reviewer_display_name/course_title — user_id 미노출 ✓ |
| `reward_review` TOCTOU (R706) | `UPDATE WHERE reward_issued=false` 원자적 처리 ✓ |
| `reviews` RLS 전체 (R710) | INSERT 구매 확인, DELETE 불가, status 변경 불가 ✓ |
| `nav.js` 배너 공지 XSS (R715) | `replace()` 이스케이프 + typeMap 고정값 ✓ |
| `admin/notices.html` XSS (R720) | `escHtml(n.title)` + `escHtml(n.content)` 전면 처리 ✓ |
| `admin/courses.html` XSS (R722) | `esc()` 전면 처리 ✓ |
| `admin/students.html` 수료 조작 (R724) | 수료 필터는 UI 전용, DB 강제 수료 없음 ✓ |
| `admin/gift-groups.html` XSS (R726) | `esc()` 전면 처리 ✓ |
| `admin/promotions.html` XSS (R728) | `esc()` 전면 처리 ✓ |
| `admin/settings.html` XSS (R730) | `esc()` 전면 처리 ✓ |
| `admin/refunds.html` XSS (R732) | `esc()` 전면 처리 ✓ |
| Vimeo URL 추출 (R735) | `match(/vimeo\.com\/(?:video\/)?(\d+)/)` → `parseInt()` → 정수 id만 SDK에 전달 ✓ |
| YouTube URL 추출 (R736) | `match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/)` 안전 정규식 ✓ |
| textbook `javascript:` URL 차단 (R737) | `/^https?:\/\//i.test()` 검사, 불합격 시 `'#'` fallback ✓ |
| `my-courses.html` 수료증 (R738) | `esc(title)` + `esc(date)`, `orders.progress >= 100` 서버 확인 ✓ |
| `payment-success.html` DB amount (R739) | 패스 결제 실제 DB amount 조회 (이전 세션 수정됨) ✓ |
| `gifts` RLS (R741) | 조회만 가능, INSERT service_role, UPDATE SECURITY DEFINER ✓ |
| `pass_courses`/`passes` RLS (R742) | 구매 확인 + admin 관리 ✓ |
| `faqs` RLS (R745) | 공개 읽기, admin 쓰기 ✓ |
| `badges` RLS (R747) | SELECT만, INSERT 직접 차단 (award_badge만) ✓ |
| `user_coupons` RLS (R749) | 조회만, INSERT/DELETE 차단 (use_coupon만) ✓ |
| `coupons` INSERT admin only (R751) | `WITH CHECK (profiles.role = 'admin')` 확인 ✓ |
| `courses` RLS (R753) | 읽기 공개, 쓰기 admin only ✓ |
| `update_order_progress` lesson 검증 (R755) | 실제 lesson_id 검증 + `LEAST(100,...)` ✓ |
| `prevent_role_escalation` 트리거 (R757) | admin만 role+email 변경 ✓ |
| `check_rate_limit` SQL 인젝션 (R760) | 파라미터 모두 정수, SQL 인젝션 불가 ✓ |
| Edge Functions CORS (R762) | `ALLOWED_ORIGINS` env var 기반 동적 CORS ✓ |
| 로그인 이메일 열거 방지 (R764) | OTP 오류 메시지 동일 처리 ✓ |
| `rate_limits` 테이블 (R770) | RLS 활성화 + 정책 없음 → SECURITY DEFINER만 접근 ✓ |
| 전체 테이블 RLS 100% (R799) | `relrowsecurity=false` 테이블 0개 ✓ |
| Supabase Advisors anon 함수 (R798) | `get_all_reviews` 등 6개 — 의도적 공개 데이터 함수 ✓ |
| `admin/instructors.html` XSS (R799) | `esc()` 전면 처리 ✓ |
| `admin/landing.html` 자체 XSS (R799) | admin 입력 self-XSS 수준, index.html 반영 시 safeHref+esc() ✓ |
| `admin/theme.html` (R799) | COLOR_VARS 하드코딩 상수 ✓ |

---

## 누적 미해결 이슈 목록 (전체, 우선순위 순)

| 우선순위 | 이슈 | 비고 |
|---------|------|------|
| 중간 | 비밀번호 유출 보호 비활성화 | Supabase Dashboard → Auth → Password Security |
| 낮음 | 쿠폰 TOCTOU: `orders` UNIQUE(user_id, coupon_code) WHERE 없음 | 동시 요청 타이밍 공격 |
| 낮음 | `notices` SELECT: draft 공지 anon 노출 | `display_mode IN ('none','popup','banner')` 조건 추가 |
| 낮음 | `reward_review` status 체크 없음 | hidden 리뷰도 쿠폰 지급 가능 |
| 낮음 | `profiles_insert_own` WITH CHECK 누락 | 실질 위험 없음, 정책 완결성 |
| 낮음 | `courses.price` 음수 허용 | admin 전용 공격 벡터 |
| 낮음 | `gift-preview` SITE_URL 하드코딩 | 도메인 전환 시 env var 필요 |
| 낮음 | `check_rate_limit` 고정 윈도우 | 경계에서 최대 2×p_max 버스트 |
| 낮음 | `get_gift_by_code` anon rate limit 없음 | 코드 공간 2.8조, 실용적 위험 낮음 |
| 낮음 | `study_logs` 과거 날짜 INSERT | `studied_at <= now()` 제약 없음 |
| 낮음 | Vimeo 도메인 화이트리스트 미확인 | Vimeo 대시보드 설정 확인 필요 |
| 낮음 | GitHub Pages CSP 헤더 추가 불가 | meta CSP 태그 고려 |
| 낮음 | `progress.lesson_id`(text) vs `lessons.id`(bigint) 타입 불일치 | 장기적 스키마 통일 |
| 낮음 | `lessons.duration_seconds` NULL 허용 | watchRatio=0 → 즉시 환불 가능 |
| 낮음 | `progress` DELETE 가능 | 법적 효력 없는 수료증 |
| 낮음 | 수료증 클라이언트 생성 | 위조 가능하나 법적 효력 없음 |
| 낮음 | PortOne webhook 없음 | 외부 취소 이벤트 DB 미반영 가능 |
| 낮음 | `video_progress` UPDATE lesson_number 변경 가능 | 환불 로직 미사용이어서 실질 위험 없음 |
| 낮음 | `progress.course_id` FK 없음 | 강좌 삭제 시 고아 레코드 |
| 낮음 | `profiles.email` 동기화 트리거 없음 | 이메일 변경 시 발송 주소 불일치 가능 |
| 낮음 | 배지 조건 클라이언트-서버 불일치 | award_badge() 조건 재검증 없음, 배지는 장식 |
| 낮음 | admin 본인 role 강등 가능 | prevent_role_escalation: 본인이 admin이면 role='user' 가능 |

---

## 다음 감사 방향 (R801~R900)

- [ ] `index.html` 공개 랜딩 페이지 완전 재검토 (hero CTA safeHref 이후 추가 삽입점)
- [ ] `admin/landing.html` DB 저장/로드 시 XSS 체인 전체 확인
- [ ] `course-detail.html` 구매 후 접근 권한 전환 플로우
- [ ] `accept_gift` 선물 수락 후 강좌 삭제 시나리오
- [ ] `get_learning_averages` 함수 데이터 노출 범위
- [ ] `get_newly_completed_courses` 함수 데이터 노출 범위  
- [ ] `admin_grant_course` 수동 수강 부여 로깅 여부
- [ ] 강좌 만료(무기한 vs 기간제) 처리 서버사이드 검증
- [ ] `supabase_realtime` 구독 → 타인 데이터 수신 가능 여부
- [ ] `pass` 구매 후 기존 개별 구매 강좌 중복 처리
- [ ] 환불 후 `video_progress` 잔류 데이터 확인
- [ ] `study_plans` 테이블 본인 외 INSERT/UPDATE 가능 여부 재확인
- [ ] Edge Functions 로그 이상 패턴 확인 (R801)
- [ ] 인증 토큰 만료 처리 — 세션 하이재킹 시나리오
