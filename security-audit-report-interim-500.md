# IMlearning 보안 감사 중간 보고서 — R500 기준

작성일: 2026-07-15  
감사 범위: 아이엠러닝 플랫폼 (GitHub Pages + Supabase)  
라운드 진행: R401~R500 (이 파일은 R500 기준 중간 보고)

---

## R401~R500 신규 발견 및 수정 취약점

### 🔴 심각 (즉시 위험)

없음.

### 🟠 높음 (조건부 위험)

없음.

### 🟡 중간 (제한적 위험)

| # | 항목 | 파일/테이블 | 조치 |
|---|------|------------|------|
| 1 | `payment-success.html` 영수증 이메일 `amount` URL 파라미터 조작 — 직접 접근으로 `?amount=0` 설정 시 위조 영수증 이메일 발송 가능 | `payment-success.html` | DB `orders` 테이블에서 실제 `amount` 조회 후 발송 |
| 2 | `send-email` `type='welcome'` — 인증 없이 임의 이메일 제출 가능 + rate limit 없음 → 이메일 열거 공격 가능 | `send-email/index.ts` | IP rate limit (시간당 10회) 추가 + 이메일 비존재 시에도 동일 응답 반환 |
| 3 | `wishlists` INSERT WITH CHECK 없음 — 임의 user_id로 타인 위시리스트에 항목 추가 가능 | `wishlists` RLS | `WITH CHECK (auth.uid() = user_id)` 추가 |
| 4 | `notices` INSERT admin 체크 없음 — 인증된 모든 사용자가 공지사항 INSERT 가능 | `notices` RLS | `WITH CHECK (get_my_role() = 'admin')` 추가 |

---

## R400까지 수정된 항목 (요약)

R400 중간 보고서(`security-audit-report-interim-400.md`) 참조.  
심각 2건, 높음 8건, 중간 7건 수정 완료.

---

## 확인된 안전 항목 (R401~R500 추가)

| 항목 | 결론 |
|------|------|
| `verify-payment` 패스 처리 | 서버에서 `passes.price` 조회 + PortOne 검증 + amount 비교 ✓ |
| `orders.payment_id` UNIQUE 제약 | 동시 결제 레이스컨디션 DB 레벨 방지 ✓ |
| `lessons` RLS `expires_at` 체크 | 일반구매/패스 모두 만료 후 접근 차단 ✓ |
| `course_files` RLS | 구매/패스/선물 + 환불/만료 체크 완벽 ✓ |
| `prevent_role_escalation` 트리거 | role/email 변경 시 non-admin 차단 ✓ |
| 24개 SECURITY DEFINER 함수 | 전부 `search_path=public` 설정 ✓ |
| `progress` INSERT WITH CHECK | 구매/패스/선물 확인 + `lesson_id` DB 검증 ✓ |
| `reviews` INSERT WITH CHECK | 구매/패스/선물 + 환불/만료 체크 ✓ |
| `reviews` UPDATE status 불변 | WITH CHECK `status = (subquery)` ✓ |
| `video_progress` UPDATE | 트리거로 `actual_watched_seconds` 감소 금지 ✓ |
| `badges` SELECT | 본인 + admin만 조회 ✓ |
| `study_plans` ALL | WITH CHECK(uid=user_id) ✓ |
| `wishlists` SELECT/DELETE | 본인만 ✓ |
| `contacts` 테이블 | SELECT admin only, INSERT service_role 전용 ✓ |
| `gift_groups`, `instructors`, `textbooks` | 공개 읽기, admin 쓰기 ✓ |
| `featured_courses` | `active=true` 공개, admin 쓰기 ✓ |
| `landing_config` | 공개 읽기, admin 쓰기 ✓ |
| `faqs` | `is_visible=true` 공개, admin 쓰기 ✓ |
| `courses` RLS | admin INSERT/UPDATE/DELETE WITH CHECK ✓ |
| `rate_limits` | SECURITY DEFINER 함수 전용 접근 ✓ |
| `awards_badge` 배지 유형 검증 | 허용 목록 체크 ✓ |
| admin 페이지 14개 | 클라이언트 role 체크 + DB RLS 이중 방어 ✓ |
| `reviews_insert_own` 패스 만료 체크 | `expires_at > now()` ✓ |
| `INSERT with_check=null` 전수 조사 | 없음 (모두 수정) ✓ |
| `get_newly_completed_courses` admin 체크 | 내부 SELECT로 role 확인 ✓ |
| `get_course_textbooks` | 공개 교재 정보만 반환 ✓ |

---

## 미배포 변경사항 (Edge Functions)

**로컬 파일 수정 완료, Supabase 배포 필요:**

| 함수 | 변경 내용 |
|------|---------|
| `verify-payment` | 동적 CORS + `SITE_ORIGIN` env var + 쿠폰 TOCTOU 수정 |
| `refund-payment` | 동적 CORS + TOCTOU 수정 + PortOne 실패 롤백 + `lessons.duration_seconds` 기반 계산 |
| `send-email` | 동적 CORS + contact_inquiry DB 저장 + welcome 타입 rate limit + 이메일 열거 방지 |

> `supabase login` 후 `supabase functions deploy` 3개 함수 배포 필요

---

## 미해결 이슈 목록

| 우선순위 | 이슈 | 비고 |
|---------|------|------|
| 높음 | Edge Functions 3개 미배포 | 로컬 변경 완료 |
| 중간 | 비밀번호 유출 보호 비활성화 | Supabase Dashboard → Auth → Password Security |
| 중간 | `lookup_coupon` rate limit 없음 | 예측 가능한 쿠폰 코드 브루트포스 가능 (`SAVE20` 등) |
| 낮음 | `check_rate_limit` 고정 윈도우 방식 | 경계에서 최대 2×p_max 요청 버스트 가능 |
| 낮음 | `get_gift_by_code` anon rate limit 없음 | 코드 공간 6.56조로 실용적 위험 낮음 |
| 낮음 | `study_logs` 구매 확인 없음 | 배지/보상 없어 실질적 위험 없음 |
| 낮음 | `study_logs` 과거 날짜 INSERT 가능 | studied_at <= now() 제약 없음 |
| 낮음 | Vimeo 도메인 화이트리스트 미확인 | Vimeo 대시보드에서 설정 확인 필요 |
| 낮음 | GitHub Pages CSP 헤더 추가 불가 | meta CSP 태그 고려 |
| 낮음 | `course-thumbnails` 버킷 파일 목록 공개 | 썸네일은 공개 정보, 낮은 위험 |
| 낮음 | `progress.lesson_id`(text) vs `lessons.id`(bigint) 타입 불일치 | 장기적 스키마 통일 필요 |
| 낮음 | `lessons.duration_seconds` NULL 허용 | 신규 강좌 설정 누락 시 watchRatio=0 → 즉시 환불 가능 |
| 낮음 | `progress` DELETE 가능 | 본인 진도 레코드 삭제 가능하나 실질적 이득 없음 |
| 낮음 | 수료증 클라이언트 생성 | 서버 검증 없음, 위조 가능하나 법적 효력 없음 |
| 낮음 | `update_order_progress` 환불 orders 업데이트 | `refund_status` 필터 없음, UI에서 제외 처리로 실질적 피해 없음 |

---

## 다음 감사 방향 (R501~R600)

- [ ] Edge Functions 배포 후 동작 검증
- [ ] `lookup_coupon` rate limit 추가 검토 (DB rate_limits 활용)
- [ ] 이메일 인증 필수 여부 확인 (Supabase Auth 설정)
- [ ] Supabase Auth 이메일 변경 플로우 보안 검토
- [ ] `admin/theme.html`, `admin/landing.html` 심층 검토
- [ ] Vimeo 영상 URL 노출 시나리오 (lessons.video_url 접근 경로)
- [ ] pass 구매 후 환불 시 pass_orders 처리 (강좌별 orders 정리)
- [ ] 선물 환불 시나리오 전체 흐름 재검토
- [ ] 대량 요청 시나리오 (Edge Function 콜드 스타트 + 병렬 요청)
- [ ] `award_badge` 함수 — 구매 확인 없이 배지 수여 (보상 없으므로 낮은 위험이나 재검토)
- [ ] 프리패스 만료 후 진도율/수료증 처리
