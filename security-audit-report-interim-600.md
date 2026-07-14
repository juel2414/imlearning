# IMlearning 보안 감사 중간 보고서 — R600 기준

작성일: 2026-07-15  
감사 범위: 아이엠러닝 플랫폼 (GitHub Pages + Supabase)  
라운드 진행: R501~R600 (이 파일은 R600 기준 중간 보고)

---

## R501~R600 신규 발견 및 수정 취약점

### 🔴 심각 (즉시 위험)

없음.

### 🟠 높음 (조건부 위험)

| # | 항목 | 파일/테이블 | 조치 |
|---|------|------------|------|
| 1 | `course-materials` 스토리지 버킷 `public=true` — 파일 URL을 알면 인증 없이 누구나 교재(PDF/Word) 다운로드 가능 | storage.buckets | `public=false` 변경 + `course-detail.html` / `admin/courses.html` Signed URL (1시간) 방식으로 교체 |

### 🟡 중간 (제한적 위험)

| # | 항목 | 파일/테이블 | 조치 |
|---|------|------------|------|
| 2 | `nav.js` `getContextLinks` Reflected XSS — `course-detail.html?id=` URL 파라미터가 admin bar href에 이스케이프 없이 삽입, 관리자에게 조작 URL 전송 시 XSS 실행 | `js/nav.js` | `encodeURIComponent(id)` 적용 |
| 3 | `payment-success.html` 패스 결제 영수증 금액 조작 — `courseId` 없는 경우(패스) URL `amount` 파라미터 그대로 이메일 발송 | `payment-success.html` | `course_id IS NULL` 조건으로 DB `orders` 실제 `amount` 조회 후 사용 |
| 4 | `lookup_coupon` anon 권한 — 인증 없는 사용자가 rate limit 없이 쿠폰 코드 브루트포스 가능 | `lookup_coupon` 함수 | `REVOKE EXECUTE FROM anon` |

---

## R501~R500에서 수정된 항목 (이전 세션 — 이미 보고됨)

R500 중간 보고서(`security-audit-report-interim-500.md`) 참조.

---

## 확인된 안전 항목 (R501~R600 추가)

| 항목 | 결론 |
|------|------|
| `lookup_coupon` rate limit (R501) | authenticated 사용자 30회/시간 (이전 세션 수정) ✓ |
| 선물 환불 `total_seconds` (R506) | `lessons.duration_seconds` 기반으로 수정 ✓ |
| pass 환불 cascade (R510) | 개별 course orders cascade 수정 ✓ |
| `prevent_role_escalation` 트리거 (R542) | role + email 변경 모두 admin만 허용 ✓ |
| `get_my_coupons` 함수 (R523) | 본인 쿠폰만 반환, 상태 계산 정확 ✓ |
| `use_coupon` TOCTOU 방지 (R524) | atomic UPDATE + ROW_COUNT ✓ |
| `admin_grant_course` 함수 (R525) | admin 체크, 중복 방지, 강좌 존재 확인 ✓ |
| `handle_new_user` 트리거 (R530) | `role='user'` 고정, ON CONFLICT DO NOTHING ✓ |
| Storage RLS 정책 전체 (R533) | course-materials: 구매/패스/선물+환불/만료 ✓; thumbnails: 공개 ✓; landing-images: admin 쓰기 ✓ |
| gifts.status='refunded' storage 차단 (R534) | 환불 시 status 변경 → storage RLS 차단 ✓ |
| theme_config / textbooks / course_textbooks RLS (R539~R540) | 공개 읽기 + admin 쓰기, RLS 활성화 ✓ |
| study_logs RLS (R541) | 본인 ALL (WITH CHECK), admin SELECT ✓ |
| course_files RLS (R540) | 구매/패스/선물+환불/만료 체크 완벽 ✓ |
| `verify-payment` isFree 경로 (R549) | serverBasePrice=0 또는 쿠폰으로 discounted≤0인 경우만 허용 ✓ |
| `verify-payment` 일반/선물/패스 결제 (R550~R551) | PortOne+DB 이중 금액 검증, TOCTOU 방지 ✓ |
| `verify-payment` 패스 amount 음수 (R552) | pass.price(DB) 비교로 차단 ✓ |
| 쿠폰 음수 금액 (R547) | `Math.max(0, serverBasePrice - discount)` ✓ |
| `reviews` RLS (R548) | DELETE 없음, INSERT 구매 체크, status 불변 ✓ |
| `gift-preview` XSS (R558) | `esc()` + `encodeURIComponent` + `JSON.stringify` ✓ |
| `get_gift_by_code` 이메일 마스킹 (R559) | `regexp_replace` 적용 ✓ |
| `notices.html` XSS (R565) | `escHtml(n.content)` + `escHtml(n.title)` ✓ |
| `update_order_progress` 수료 조작 방지 (R566) | 실제 lesson_id 검증 + LEAST(100,...) ✓ |
| `award_badge` 타인 배지 수여 불가 (R583) | `auth.uid()` 고정, 허용 목록 검증 ✓ |
| `reward_review` TOCTOU 방지 (R587) | atomic UPDATE WHERE reward_issued=false ✓ |
| `accept_gift` 동시 수락 방지 (R585) | FOR UPDATE 락 ✓ |
| 이메일 템플릿 XSS (R572~R574) | `esc()` 전면 적용, `encodeURIComponent(giftCode)` ✓ |
| 쿠폰 중복 사용 방지 (R588) | prevUse 체크 + use_coupon atomic UPDATE ✓ |
| `admin/students.html` 개인정보 (R592) | DB RLS 이중 인증, 의도적 admin 범위 ✓ |
| courses 삭제 cascade (R579) | gifts: NO ACTION(의도적 보호), orders: SET NULL(만료 없는 영구 주문이어서 패스 오인 불가) ✓ |
| `check_rate_limit` 고정 윈도우 (R584) | 경계 2×p_max 버스트 — 이미 낮은 위험으로 기록됨 |
| 전체 29개 테이블 RLS (R599) | 100% 활성화 ✓ |
| `main.js` innerHTML (R528) | 숫자 계산 결과만 삽입 ✓ |
| `nav.js` admin bar HTML (R529) | 정적 링크, 사용자 데이터 없음 (id만 encodeURIComponent로 수정) ✓ |

---

## 미배포 변경사항 (Edge Functions)

**로컬 파일 수정 완료, Supabase 배포 필요:**

| 함수 | 변경 내용 |
|------|---------|
| `verify-payment` | 동적 CORS + `SITE_ORIGIN` env var + 쿠폰 TOCTOU 수정 |
| `refund-payment` | 동적 CORS + TOCTOU 수정 + PortOne 실패 롤백 + `lessons.duration_seconds` 기반 + 패스 환불 cascade |
| `send-email` | 동적 CORS + contact_inquiry DB 저장 + welcome rate limit + 이메일 열거 방지 |

> `supabase login` 후 `supabase functions deploy` 3개 함수 배포 필요

---

## 미해결 이슈 목록

| 우선순위 | 이슈 | 비고 |
|---------|------|------|
| 높음 | Edge Functions 3개 미배포 | 로컬 변경 완료 |
| 중간 | 비밀번호 유출 보호 비활성화 | Supabase Dashboard → Auth → Password Security |
| 낮음 | `gift-preview` SITE_URL 하드코딩 | 도메인 전환 시 env var로 변경 필요 |
| 낮음 | `check_rate_limit` 고정 윈도우 방식 | 경계에서 최대 2×p_max 버스트 가능 |
| 낮음 | `get_gift_by_code` anon rate limit 없음 | 코드 공간 6.56조로 실용적 위험 낮음 |
| 낮음 | `study_logs` 과거 날짜 INSERT 가능 | studied_at <= now() 제약 없음, 배지 보상 없음 |
| 낮음 | Vimeo 도메인 화이트리스트 미확인 | Vimeo 대시보드에서 설정 확인 필요 |
| 낮음 | GitHub Pages CSP 헤더 추가 불가 | meta CSP 태그 고려 |
| 낮음 | `progress.lesson_id`(text) vs `lessons.id`(bigint) 타입 불일치 | 장기적 스키마 통일 필요 |
| 낮음 | `lessons.duration_seconds` NULL 허용 | 신규 강좌 설정 누락 시 watchRatio=0 → 즉시 환불 가능 |
| 낮음 | `progress` DELETE 가능 | 본인 진도 삭제 후 재INSERT로 수료증 조작 가능하나 법적 효력 없음 |
| 낮음 | 수료증 클라이언트 생성 | 서버 검증 없음, 위조 가능하나 법적 효력 없음 |
| 낮음 | PortOne webhook 없음 | PortOne 자체 취소 이벤트 DB 미반영 가능 |
| 낮음 | `video_progress` UPDATE lesson_number 변경 가능 | actual_watched_seconds 감소 방지 있고 환불에서 미사용이므로 실질적 위험 없음 |

---

## 다음 감사 방향 (R601~R700)

- [ ] Edge Functions 배포 후 동작 검증
- [ ] 이메일 인증 필수 여부 확인 (Supabase Auth 설정)
- [ ] Supabase Auth 이메일 변경 플로우 보안 검토
- [ ] 쿠폰 코드 형식 예측 가능성 재검토 (RVW-, SAVE, DISCOUNT 등)
- [ ] 대량 요청 시나리오 (Edge Function 병렬 요청, 연속 결제)
- [ ] 강좌 삭제 후 접근 권한 처리 전체 흐름
- [ ] 미구현 기능(admin/banners.html) 보안 영향 재검토
- [ ] `lessons` RLS 무료 미리보기 + 유료 강의 분리 재검토
- [ ] 수료 요건 서버사이드 검증 (현재 클라이언트에서만 확인)
- [ ] 선물 수락 시나리오 — 발신자 강좌 삭제 후 처리
