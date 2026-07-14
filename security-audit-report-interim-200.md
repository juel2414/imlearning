# IMlearning 보안 감사 중간 보고서 — R200 기준

작성일: 2026-07-15  
감사 범위: 아이엠러닝 플랫폼 (GitHub Pages + Supabase)  
라운드 진행: R1~R200 (이 파일은 R200 기준 중간 보고)

---

## 수정 완료된 취약점

### 🔴 심각 (즉시 위험)

| # | 항목 | 파일/테이블 | 조치 |
|---|------|------------|------|
| 1 | `profiles` role 에스컬레이션 — `with_check: null`으로 일반 사용자가 `role='admin'` 직접 설정 가능 | `profiles` RLS | `no_profile_escalation` 트리거 + email 보호 통합 |
| 2 | `coupons` SELECT `qual:true` — 전체 쿠폰 코드 열거 가능 | `coupons` RLS | admin-only 정책 + `lookup_coupon()` 함수 생성 |
| 3 | `use_coupon` 직접 호출 — 인증 사용자가 임의 쿠폰 `used_count` 소진 | `use_coupon()` | authenticated/anon/public REVOKE |
| 4 | `contacts_insert` WITH CHECK `true` — 비인증 사용자 무제한 스팸 INSERT | `contacts` RLS | 정책 삭제 + `send-email` 함수에 통합 (IP rate limit 경유 강제) |
| 5 | `award_badge` 자가 수여 — 임의 배지 타입 자가 발급 | `award_badge()` | authenticated/anon/public REVOKE |
| 6 | `check_rate_limit` 공개 접근 — 타인 user_id로 rate limit 소진 공격 | `check_rate_limit()` | authenticated/anon/public REVOKE |

### 🟠 높음 (조건부 위험)

| # | 항목 | 파일/테이블 | 조치 |
|---|------|------------|------|
| 7 | `refund-payment` TOCTOU — SELECT→체크→PortOne→UPDATE 중복 환불 가능 | `refund-payment/index.ts` | atomic UPDATE로 `processing` 상태 선점 |
| 8 | `gift` 환불 경로 3개 TOCTOU — accepted/pending/already_owned 경로 | `refund-payment/index.ts` | 각 경로 `refund_processing` 상태 선점 추가 |
| 9 | `reward_review` 중복 쿠폰 — 같은 review_id로 반복 호출 시 쿠폰 다중 발급 | `reviews`, `reward_review()` | `reward_issued` 플래그 + atomic UPDATE |
| 10 | `course_files` RLS — pass 만료/환불 체크 누락 + 선물 수령자 조건 누락 | `course_files` RLS | 정책 전면 교체 (`expires_at`, `refund_status`, gift 조건 추가) |
| 11 | `courses` SELECT `qual:true` — hidden 강좌 43개 API 직접 노출 | `courses` RLS | `status='active' OR admin` 조건 추가 |
| 12 | `index.html` XSS — 히어로 슬로건/trust 항목 `innerHTML` 미이스케이프 | `index.html` | `esc()` 함수 적용 |
| 13 | `lessons_curriculum` SECURITY DEFINER VIEW — 뷰 생성자 권한으로 `lessons` RLS 우회 | `lessons_curriculum` view | `WITH (security_invoker = true)` 재생성 |
| 14 | `orders.payment_id` UNIQUE 제약 누락 — 경쟁 조건으로 중복 결제 레코드 가능 | `orders` | `PARTIAL UNIQUE INDEX WHERE payment_id IS NOT NULL` |

### 🟡 중간 (제한적 위험)

| # | 항목 | 파일/테이블 | 조치 |
|---|------|------------|------|
| 15 | Edge Functions CORS 하드코딩 — 도메인 마이그레이션 시 브라우저 API 전면 차단 | `verify-payment`, `refund-payment`, `send-email` | 동적 origin 체크 + `SITE_ORIGIN` env var (로컬 수정, 미배포) |
| 16 | `send-email` contact_inquiry IP rate limit 누락 | `send-email/index.ts` | `check_rate_limit('contact:{ip}', 5, 3600)` 추가 |
| 17 | `course-materials` 버킷 비인증 접근 — 파일 목록 조회 및 다운로드 | `storage.objects` | `auth.uid() IS NOT NULL` 조건 추가 |
| 18 | trigger 함수 불필요한 RPC 노출 | `prevent_video_progress_manipulation`, `prevent_role_escalation` | anon/public/authenticated REVOKE |

### 🟢 낮음 (정보성)

| # | 항목 | 조치 |
|---|------|------|
| 19 | `orders` 복합 인덱스 누락 — `(user_id, course_id)` 쿼리 성능 저하 | `orders_user_course_idx WHERE status='paid'` 추가 |
| 20 | `pg_net` 익스텐션 public 스키마 설치 (Advisor WARN) | 미조치 (낮은 위험) |

---

## 확인된 안전 항목 (수정 불필요)

- `accept_gift`: `FOR UPDATE` 락으로 동시 수락 방지 ✓, 이메일 일치 체크 ✓
- `set_user_role`: 내부 admin 체크 `IS DISTINCT FROM 'admin'` ✓
- `admin_grant_course`: 내부 admin 체크 + RAISE EXCEPTION ✓
- `reward_review`: `user_id IS DISTINCT FROM auth.uid()` 체크 ✓
- `update_order_progress`: `WHERE user_id = auth.uid()` 본인 주문만 ✓
- `progress`/`video_progress` RLS: 본인 only (SELECT/INSERT/UPDATE) ✓
- `user_coupons` RLS: 본인 SELECT only, INSERT는 service role만 ✓
- `login.html` 에러 메시지: `textContent` 사용 — XSS 없음 ✓
- `payment-success.html`: `esc()` + `textContent` — XSS 없음 ✓
- `admin/promotions.html`: `esc()` 전반 적용 ✓
- anon SECURITY DEFINER 함수 6개 (`get_all_reviews` 등): 공개 마케팅 데이터 — 의도적 ✓
- `get_gift_by_code` anon 접근: 선물 수락 전 로그인 전 정보 표시용 — 의도적 ✓

---

## 미배포 변경사항 (Edge Functions)

**로컬 파일 수정 완료, Supabase 배포 필요:**

| 함수 | 변경 내용 |
|------|---------|
| `verify-payment` | 동적 CORS + `SITE_ORIGIN` env var |
| `refund-payment` | 동적 CORS + TOCTOU 수정 + gift 환불 TOCTOU 수정 + PortOne 실패 롤백 |
| `send-email` | 동적 CORS + `SITE_ORIGIN` env var + contact_inquiry DB 저장 통합 |

> `supabase login` 후 `supabase functions deploy` 필요 (MCP 통해 전체 파일 재배포 예정)

---

## 미해결 이슈 목록

| 우선순위 | 이슈 | 비고 |
|---------|------|------|
| 높음 | Edge Functions 미배포 | 로컬 변경사항 있음 |
| 중간 | `course-materials` 구매자 체크 미적용 | 현재 인증 사용자 전체 접근 가능 (직접 URL 접근) |
| 중간 | 비밀번호 유출 보호 비활성화 | Supabase Dashboard → Auth → Password Security에서 활성화 필요 |
| 낮음 | GitHub Pages CSP 헤더 추가 불가 | meta CSP 태그 고려 |
| 낮음 | `coupons` 리뷰 보상 쿠폰 code enumeration | `RVW-` 접두사 패턴 예측 가능하지만 8자리 md5 랜덤 — 실용적 위험 낮음 |

---

## 다음 감사 방향 (R201~R300)

- [ ] 어드민 기능 전수 검토 (students, refunds, reviews, notices, banners)
- [ ] Vimeo 영상 접근 제어 — 비구매자가 Vimeo URL 직접 접근 가능한지
- [ ] `my-courses.html` 진도율 조작 가능성
- [ ] `search.html` — 검색어 XSS/injection
- [ ] `notices.html`, `reviews.html` 공개 페이지 보안
- [ ] `pass.html` 패스 구매 플로우 보안
- [ ] Edge Functions 배포 후 동작 검증
- [ ] `admin/settings.html` 설정 변경 권한 체크
- [ ] Supabase Auth 추가 설정 확인 (이메일 인증 필수 여부, OTP 등)
