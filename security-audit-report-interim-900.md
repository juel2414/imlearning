# IMlearning 보안 감사 중간 보고서 — R900 기준

작성일: 2026-07-15  
감사 범위: 아이엠러닝 플랫폼 (GitHub Pages + Supabase)  
라운드 진행: R801~R900 (이 파일은 R900 기준 중간 보고)

---

## R801~R900 신규 발견 취약점

### 🔴 심각 (즉시 위험)

없음.

### 🟠 높음 (조건부 위험)

없음.

### 🟡 중간 (제한적 위험)

없음.

### 🟢 낮음 (정보성 위험)

| # | 항목 | 위치 | 조치 방안 |
|---|------|------|----------|
| 1 | **`send-review-requests` 무인증 접근**: `verify_jwt:false` + 내부 인증 없음 → 누구나 호출 가능. 단, 실제로 아무것도 하지 않음 (아래 기능 버그 참조). DB 쿼리 부하 유발 가능. | `send-review-requests` Edge Function | `verify_jwt:true`로 변경 또는 내부 secret key 체크 추가 |
| 2 | **`send-review-requests` 완전 동작 불가** (기능 버그): service_role key로 `get_newly_completed_courses()` 호출 시 `auth.uid()=null` → admin 체크 실패 → 빈 배열 반환. 이메일 발송 0건. pg_cron이 매일 실행하지만 아무것도 안 함. | `send-review-requests` Edge Function + `get_newly_completed_courses` 함수 | 함수를 admin_token 방식으로 변경하거나 `send-review-requests`에서 직접 SQL 조회 |
| 3 | **`get_active_pass` anon EXECUTE 없음**: `pass.html`에서 비로그인 사용자가 패스 정보 조회 시 권한 없음 오류 → 패스 상품 정보 미노출. | `get_active_pass()` 함수 | `GRANT EXECUTE ON FUNCTION public.get_active_pass() TO anon` |

---

## R864 대기 항목 (user 승인 필요)

```sql
GRANT EXECUTE ON FUNCTION public.get_active_pass() TO anon;
```

→ `pass.html` 비로그인 사용자도 패스 상품 정보 볼 수 있도록 허용. 이 함수는 `status='active'`인 패스 공개 정보만 반환하므로 보안 위험 없음.

---

## 확인된 안전 항목 (R801~R900)

| 항목 | 결론 |
|------|------|
| `study_plans` RLS (R820) | ALL with USING+WITH CHECK (auth.uid()=user_id) ✓ |
| `wishlists` RLS (R821) | SELECT/INSERT/DELETE 본인 전용, UPDATE 없음 ✓ |
| `progress_insert_own` WITH CHECK (R820) | `auth.uid()=user_id` + 구매 확인 + `'lesson-'||l.id::text = progress.lesson_id` ✓ (R759 LOW 이슈 오탐 — 해결됨) |
| `progress_delete_own` (R822) | DELETE 가능하나 법적 효력 없는 수료증 — LOW 유지 |
| `badges` RLS (R823) | SELECT 본인+admin만, INSERT/UPDATE/DELETE 차단 ✓ |
| `course_files` RLS (R824) | 구매+패스+선물+환불+만료 완전 체크 ✓ |
| `reviews` 상태 불변 (R825) | UPDATE status self-check subquery로 변경 불가 ✓ |
| `orders` INSERT/DELETE 차단 (R826) | 정책 없음 → blocked, UPDATE admin only ✓ |
| `theme_config` RLS (R827) | public SELECT, admin ALL ✓ |
| `faqs` RLS (R828) | is_visible=true 공개 읽기, admin ALL ✓ |
| `get_learning_averages` (R830) | aggregate only, user_id 미노출 ✓ |
| `admin_grant_course` (R831) | admin 체크 + granted_by/grant_type/grant_reason 감사 추적 ✓ |
| `set_user_role` (R832) | admin 체크 + role 허용 목록 + last_admin 보호 ✓ |
| `prevent_video_progress_manipulation` (R833) | watched_seconds 감소 금지, total_seconds 증가 금지 ✓ |
| `get_newly_completed_courses` anon 호출 (R841) | SECURITY DEFINER이지만 auth.uid()=null → admin 체크 실패 → 빈 결과 (데이터 미노출) ✓ |
| `review_request_logs` RLS (R898) | admin only ALL (WITH CHECK 포함) ✓ |
| `signup.html` 이메일 인증 (R860) | identities.length 체크로 미인증 계정 재가입 방지 ✓ |
| `get_active_pass` status 필터 (R864) | `status='active'` 조건 있어 만료 패스 미노출 ✓ |
| pg_cron `send-review-requests-daily` (R896) | `0 15 * * *` 스케줄로 실행되나 실제 아무것도 안 함 (기능 버그) |
| `check_rate_limit` 고정 윈도우 (R899) | 기존 LOW 이슈 재확인 |

---

## 누적 미해결 이슈 목록 (전체, R900 기준)

| 우선순위 | 이슈 | 비고 |
|---------|------|------|
| 중간 | 비밀번호 유출 보호 비활성화 | Supabase Dashboard → Auth → Password Security |
| 중간 | `send-review-requests` 완전 동작 불가 (기능 버그) | service_role+auth.uid()=null → get_newly_completed_courses 빈 결과, review 이메일 발송 0건 |
| 낮음 | `get_active_pass` anon EXECUTE 없음 → pass.html 비로그인 오류 | `GRANT EXECUTE ON FUNCTION public.get_active_pass() TO anon` |
| 낮음 | `send-review-requests` 무인증 접근 가능 | verify_jwt: false + 내부 인증 없음 |
| 낮음 | 쿠폰 TOCTOU: `orders` UNIQUE(user_id, coupon_code) WHERE 없음 | 동시 요청 타이밍 공격 |
| 낮음 | `notices` SELECT: draft 공지 anon 노출 | `display_mode IN ('none','popup','banner')` 조건 추가 |
| 낮음 | `reward_review` status 체크 없음 | hidden 리뷰도 쿠폰 지급 가능 |
| 낮음 | `courses.price` 음수 허용 | `CHECK (price >= 0)` 추가 |
| 낮음 | `send-email` `new_course` thumbnailUrl 미검증 | img src injection (admin-only 공격 벡터) |
| 낮음 | `send-email` `review_request` 타입 미구현 | send-review-requests 수정 시 함께 구현 필요 |
| 낮음 | `gift-preview` SITE_URL 하드코딩 | 도메인 전환 시 env var 필요 |
| 낮음 | `check_rate_limit` 고정 윈도우 | 경계에서 최대 2×p_max 버스트 |
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
| 낮음 | `get_gift_by_code` anon rate limit 없음 | 코드 공간 2.8조, 실용적 위험 낮음 |
| 낮음 | 이메일 인증 활성화 여부 미확인 | Supabase Dashboard → Auth → Email 확인 필요 |

---

## 다음 감사 방향 (R901~R1000)

- [ ] 도메인 전환(L) 카테고리: SITE_URL/SITE_ORIGIN 하드코딩 전체 목록
- [ ] 미구현 기능(K) 카테고리: 배너, reward_review 미작동 기능, 기타
- [ ] 결제 플로우(F) 재확인: PortOne IMP 파라미터 조작 시나리오
- [ ] 강좌 만료(기간제 vs 무기한) 서버 검증
- [ ] 환불 후 `video_progress` 잔류 데이터
- [ ] 패스 구매 후 개별 구매 강좌 중복 처리
- [ ] `admin/landing.html` DB 저장/로드 XSS 체인 전체
- [ ] `send-review-requests` 수정 방안 구체화
- [ ] `get_active_pass` GRANT 적용 (user 승인 후)
- [ ] 최종 보안 보고서 작성 (R1000)
