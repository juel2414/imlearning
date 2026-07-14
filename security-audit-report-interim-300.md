# IMlearning 보안 감사 중간 보고서 — R300 기준

작성일: 2026-07-15  
감사 범위: 아이엠러닝 플랫폼 (GitHub Pages + Supabase)  
라운드 진행: R201~R300 (이 파일은 R300 기준 중간 보고)

---

## R201~R300 신규 발견 및 수정 취약점

### 🔴 심각 (즉시 위험)

| # | 항목 | 파일/테이블 | 조치 |
|---|------|------------|------|
| 1 | `get_newly_completed_courses` 이메일 노출 — auth.uid() 필터 없이 전체 수강생 이메일 반환 | `get_newly_completed_courses()` | 함수 내부 admin 체크 추가 + REVOKE/GRANT |
| 2 | `update_order_progress(bigint, integer)` 구버전 잔존 — 서버 계산 전환 후 구버전이 오버로드로 공존, 클라이언트 p_progress=100 주입 가능 | `update_order_progress` | 구버전 DROP |

### 🟠 높음 (조건부 위험)

| # | 항목 | 파일/테이블 | 조치 |
|---|------|------------|------|
| 3 | `update_order_progress` 클라이언트 진도율 주입 — 인증 사용자가 API 직접 호출로 p_progress=100 설정 가능 | `update_order_progress()`, `course-detail.html` | 함수를 서버 계산으로 교체 (progress 테이블 기반) |
| 4 | `progress` INSERT 구매 확인 없음 — 구매하지 않은 강좌에 completed=true 레코드 생성 가능 | `progress` RLS | INSERT WITH CHECK에 구매/패스/선물 확인 추가 |
| 5 | `reviews_update_own` WITH CHECK null — status 필드 변경 가능 (hidden→visible) | `reviews` RLS | status 불변 subquery 추가 |

### 🟡 중간 (제한적 위험)

| # | 항목 | 파일/테이블 | 조치 |
|---|------|------------|------|
| 6 | `badges_public_read` qual:true — 모든 사용자 배지(user_id, badge_type, earned_at) 공개 | `badges` RLS | public_read 정책 삭제 + admin SELECT 추가 |
| 7 | `award_badge` 과도한 REVOKE — 배지 수여 기능 완전 장애 | `award_badge()` | authenticated GRANT 복원 |
| 8 | 트리거 함수 authenticated 직접 호출 가능 | `prevent_video_progress_manipulation`, `prevent_role_escalation` | authenticated REVOKE 추가 |

---

## R200까지 수정된 항목 (요약)

R200 중간 보고서(`security-audit-report-interim-200.md`) 참조.

심각 6건, 높음 8건, 중간 4건, 낮음 2건 수정 완료.

---

## 확인된 안전 항목 (R201~R300 추가)

| 항목 | 결론 |
|------|------|
| `instructor.html` XSS | `esc()` 전면 적용 ✓ |
| `reviews.html` XSS | `esc()` 전면 적용 ✓ |
| `contact.html` 직접 DB INSERT | send-email Edge Function 경유만 허용 ✓ |
| `search.html` SQL injection | 클라이언트 JS 필터링 — SQL injection 없음 ✓ |
| `admin/notices.html` ~ `admin/reviews.html` XSS | 전체 `esc()` 전면 적용 ✓ |
| `admin/settings.html` admin_pw | localStorage-only 비밀번호, Supabase 인증과 무관 ✓ |
| `wishlists` RLS | SELECT/INSERT/DELETE 본인만 ✓ |
| `study_plans` RLS | 본인 ALL ✓ |
| `notices`, `faqs`, `featured_courses`, `passes` RLS | 조건부 공개 + admin 쓰기 ✓ |
| `review_request_logs` RLS | admin only ALL ✓ |
| `rate_limits` RLS | 정책 없음 → 기본 거부 (SECURITY DEFINER 함수 전용) ✓ |
| `get_learning_averages` 개인정보 | 집계값만 반환, 개인 user_id 없음 ✓ |
| `get_my_coupons` 타인 쿠폰 | `auth.uid()` 필터 ✓ |
| `set_user_role` 권한 상승 | admin 체크 + last_admin 보호 + 유효 role 검증 ✓ |
| `admin_grant_course` 비admin 호출 | 내부 admin 체크 + RAISE EXCEPTION ✓ |
| `get_active_pass` 개인정보 | 패스/강좌 공개 정보만 반환 ✓ |
| `gift_groups` 공개 노출 | icon/label/category 분류 데이터, 개인정보 없음 ✓ |
| `lookup_coupon` 쿠폰 정보 | `status='active'` 필터 + 코드 일치 검색 ✓ |
| `verify-payment` 쿠폰 처리 | 서버에서 가격·만료·한도 모두 재검증 ✓ |
| 스토리지 버킷 3개 | 적절한 MIME 제한 + admin 업로드 전용 ✓ |
| 모든 29개 공개 테이블 | RLS 활성화 확인 ✓ |

---

## 미배포 변경사항 (Edge Functions)

**로컬 파일 수정 완료, Supabase 배포 필요:**

| 함수 | 변경 내용 |
|------|---------|
| `verify-payment` | 동적 CORS + `SITE_ORIGIN` env var |
| `refund-payment` | 동적 CORS + TOCTOU 수정 + PortOne 실패 롤백 |
| `send-email` | 동적 CORS + contact_inquiry DB 저장 통합 |

> `supabase login` 후 `supabase functions deploy` 3개 함수 배포 필요

---

## 미해결 이슈 목록

| 우선순위 | 이슈 | 비고 |
|---------|------|------|
| 높음 | Edge Functions 3개 미배포 | 로컬 변경 완료 |
| 중간 | `course-materials` 구매자 체크 미적용 | 인증 사용자 전체 파일 접근 가능 |
| 중간 | 비밀번호 유출 보호 비활성화 | Supabase Dashboard → Auth → Password Security |
| 중간 | `course-thumbnails` 버킷 파일 목록 공개 | Advisor WARN, 썸네일은 공개 정보라 낮음 |
| 낮음 | `study_logs` 과거 날짜 INSERT 가능 | 배지 조작 가능하지만 배지 보상 없음 |
| 낮음 | Vimeo 도메인 화이트리스트 미확인 | Vimeo 대시보드에서 설정 확인 필요 |
| 낮음 | GitHub Pages CSP 헤더 추가 불가 | meta CSP 태그 고려 |
| 낮음 | `pg_net` 익스텐션 public 스키마 (Advisor WARN) | 낮은 위험 |
| 낮음 | `progress.lesson_id`(text) vs `lessons.id`(bigint) 타입 불일치 | 진도율 계산 JOIN 불가 — 장기적 스키마 통일 필요 |

---

## 다음 감사 방향 (R301~R400)

- [ ] Edge Functions 배포 후 동작 검증 (CORS, TOCTOU, 이메일)
- [ ] `pass.html` 패스 결제 플로우 전체 재검토
- [ ] `my-courses.html` 수료증 생성 로직 점검 (progress 100% 조작 후 수료증 발급 여부)
- [ ] `admin/courses.html` 강좌 관리 보안
- [ ] `admin/students.html` 환불 처리 플로우 재검토
- [ ] Supabase Auth 추가 설정 — 이메일 인증 필수, OTP 설정
- [ ] `video_progress` 트리거 방어 우회 가능성 재검토
- [ ] `review_request_logs` 리뷰 요청 플로우 보안
- [ ] anon 접근 가능 함수 전체 재검토 — 공개 필요성 재평가
- [ ] 결제 금액 조작 시나리오 전수 점검
