# IMlearning 보안 감사 중간 보고서 — R400 기준

작성일: 2026-07-15  
감사 범위: 아이엠러닝 플랫폼 (GitHub Pages + Supabase)  
라운드 진행: R301~R400 (이 파일은 R400 기준 중간 보고)

---

## R301~R400 신규 발견 및 수정 취약점

### 🔴 심각 (즉시 위험)

없음.

### 🟠 높음 (조건부 위험)

| # | 항목 | 파일/테이블 | 조치 |
|---|------|------------|------|
| 1 | `video_progress` total_seconds 조작 → 환불 규정 우회 — 가짜 lesson에 `total_seconds=9999999` INSERT 후 watchRatio≈0 → 전액 환불 | `video_progress` RLS, `refund-payment/index.ts` | video_progress INSERT에 lesson_number 검증 + 구매 확인 추가; refund-payment에서 `total_seconds`를 `lessons.duration_seconds` 기반으로 계산 |
| 2 | 쿠폰 TOCTOU — 주문 생성 후 `use_coupon` 호출로 동시 요청 시 두 사용자가 동일 쿠폰(max_uses=1) 중복 사용 | `verify-payment/index.ts` | `use_coupon`을 주문 생성 전으로 이동 + 반환값 확인 |
| 3 | `reward_review` TOCTOU — `reward_issued` SELECT→체크→UPDATE 패턴, 동시 요청 시 쿠폰 2개 발급 | `reward_review()` | atomic UPDATE (`WHERE reward_issued = false`) 선점 방식으로 교체 |

### 🟡 중간 (제한적 위험)

| # | 항목 | 파일/테이블 | 조치 |
|---|------|------------|------|
| 4 | `progress` INSERT lesson_id 검증 없음 → fake lesson_id + completed=true로 수료율 100% 조작 가능 | `progress` RLS, `update_order_progress()` | `progress` INSERT WITH CHECK에 `EXISTS(lessons WHERE 'lesson-'||id::text = lesson_id)` 검증 추가; `update_order_progress()`에도 동일 검증 추가 |
| 5 | 리뷰 삭제 후 재작성 → 쿠폰 재수령 — `reviews_delete_own` 정책으로 삭제 가능, 새 리뷰 작성 시 `reward_issued=false`로 시작 | `reviews` RLS | `reviews_delete_own` 정책 삭제 (admin만 삭제 가능) |
| 6 | `video_progress` INSERT에 구매 확인 없음 — 비구매자가 lesson_number 임의 설정 가능 | `video_progress` RLS | `own_video_progress_insert` 정책에 구매/패스/선물 확인 + lesson_number 검증 추가 |

---

## R300까지 수정된 항목 (요약)

R300 중간 보고서(`security-audit-report-interim-300.md`) 참조.  
심각 2건, 높음 5건, 중간 3건 수정 완료.

---

## 확인된 안전 항목 (R301~R400 추가)

| 항목 | 결론 |
|------|------|
| `accept_gift` 레이스 컨디션 | `FOR UPDATE` 락으로 동시 수락 방지 ✓ |
| `gift_code` 생성 | `crypto.getRandomValues()` CSPRNG + 30자 × 8자리 = 6.56조 경우의 수 ✓ |
| `video_progress` DELETE | RLS 기본 거부 (DELETE 정책 없음) ✓ |
| `orders` RLS | INSERT/UPDATE/DELETE 정책 없음 → 기본 거부; UPDATE는 admin-only ✓ |
| `passes`, `pass_courses` RLS | admin 쓰기, `status='active'` 공개 ✓ |
| `coupons` RLS | admin-only SELECT ✓ |
| `user_coupons` | 본인 SELECT, INSERT는 SECURITY DEFINER 함수 전용 ✓ |
| `use_coupon` 실행 권한 | postgres/service_role 전용 ✓ |
| `verify-payment` isFree 경로 | `serverBasePrice === 0` 서버 재계산으로 유료 강좌 무료 등록 차단 ✓ |
| `verify-payment` 일반 결제 | `amount === expectedAmount` 서버 가격 검증 + PortOne 이중 검증 ✓ |
| `verify-payment` 선물 결제 | `amount !== serverBasePrice` 체크 ✓ |
| `refund-payment` admin 권한 | `!isAdmin && order.user_id !== user.id` → 403 ✓ |
| `lessons_curriculum` 뷰 | `security_invoker=true` + `video_url` 미포함 ✓ |
| `lessons` RLS | `is_free_preview` 공개 + 구매/패스/선물 수령자 전체 강의 접근 ✓ |
| `admin_grant_course` | 내부 admin 체크 + 중복 방지 ✓ |
| `progress` UNIQUE 제약 | `(user_id, course_id, lesson_id)` 중복 레코드 방지 ✓ |
| `reviews` UNIQUE 제약 | `(user_id, course_id)` 동일 강좌 중복 리뷰 방지 ✓ |
| `handle_new_user` 트리거 | `role='user'` 고정, `ON CONFLICT DO NOTHING` ✓ |
| `gift.html`, `payment-success.html` XSS | `esc()` 전면 적용 ✓ |
| `my-courses.html` XSS | `esc()`, `gEsc()` 전면 적용 ✓ |
| `admin/courses.html` XSS | `escHtml()` 전면 적용 ✓ |
| `review_request_logs` RLS | admin-only ✓ |
| 수료증 생성 | `esc(title)`, `esc(date)`, 사용자 이름 미포함 ✓ |
| anon 함수 7개 | 마케팅/공개 데이터 — 의도적 ✓ |
| 함수 실행 권한 전체 | service_role 전용 5개, authenticated 15개, anon 7개 — 모두 의도적 ✓ |

---

## 미배포 변경사항 (Edge Functions)

**로컬 파일 수정 완료, Supabase 배포 필요:**

| 함수 | 변경 내용 |
|------|---------|
| `verify-payment` | 동적 CORS + `SITE_ORIGIN` env var + 쿠폰 TOCTOU 수정 (use_coupon 순서 변경) |
| `refund-payment` | 동적 CORS + TOCTOU 수정 + PortOne 실패 롤백 + `total_seconds`를 `lessons.duration_seconds` 기반 계산 |
| `send-email` | 동적 CORS + contact_inquiry DB 저장 통합 |

> `supabase login` 후 `supabase functions deploy` 3개 함수 배포 필요

---

## 미해결 이슈 목록

| 우선순위 | 이슈 | 비고 |
|---------|------|------|
| 높음 | Edge Functions 3개 미배포 | 로컬 변경 완료 |
| 중간 | `course-materials` 구매자 체크 — 현재 인증 사용자 전체 접근 가능 | 스토리지 RLS 수정 필요 |
| 중간 | 비밀번호 유출 보호 비활성화 | Supabase Dashboard → Auth → Password Security |
| 중간 | `lookup_coupon` rate limit 없음 — 예측 가능한 코드 브루트포스 가능 | 예: `SAVE20`, `DISCOUNT30` 패턴 |
| 낮음 | `get_gift_by_code` anon rate limit 없음 | 코드 공간 6.56조로 실용적 위험 낮음 |
| 낮음 | `study_logs` 과거 날짜 INSERT 가능 | 배지 보상 없음, 낮은 위험 |
| 낮음 | Vimeo 도메인 화이트리스트 미확인 | Vimeo 대시보드에서 설정 확인 필요 |
| 낮음 | GitHub Pages CSP 헤더 추가 불가 | meta CSP 태그 고려 |
| 낮음 | `course-thumbnails` 버킷 파일 목록 공개 | Advisor WARN, 썸네일은 공개 정보 |
| 낮음 | `progress.lesson_id`(text) vs `lessons.id`(bigint) 타입 불일치 | 장기적 스키마 통일 필요 |
| 낮음 | `admin/landing.html` self-XSS (admin 신뢰) | 낮은 위험 |

---

## 다음 감사 방향 (R401~R500)

- [ ] Edge Functions 배포 후 동작 검증
- [ ] `course-materials` 스토리지 구매자 체크 강화
- [ ] `study_logs` 구매 확인 추가 (선택적)
- [ ] `banners` 테이블 RLS 확인
- [ ] 프리패스 만료 후 강좌 접근 차단 시나리오 재검증
- [ ] 동시 패스 구매 시나리오 (레이스컨디션)
- [ ] 환불 처리 후 progress 레코드 처리 (cleanup 없음)
- [ ] 이메일 변경 공격 시나리오 (Supabase Auth 이메일 변경 플로우)
- [ ] `profiles` 이름 길이 제한 없음 (DoS 고려)
- [ ] 선물 수락 후 강좌 삭제 시 orders 처리
- [ ] 미인증 진입 후 결제 완료 시나리오 (payment-success.html)
