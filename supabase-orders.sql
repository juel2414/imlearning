-- ============================================
-- 아이엠러닝 · orders (수강 신청/결제 내역) 테이블
-- Supabase SQL Editor에서 실행하세요.
-- ============================================

create table if not exists public.orders (
  id              bigint generated always as identity primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  course_id       bigint references public.courses(id) on delete set null,
  course_name     text,                         -- 강좌 삭제 대비 스냅샷
  payment_id      text,                         -- PortOne 결제 고유번호
  amount          integer not null default 0,   -- 실제 결제 금액
  original_amount integer,                      -- 할인 전 정가
  status          text not null default 'paid', -- paid | cancelled | refunded
  progress        integer not null default 0,   -- 수강 진행률 0~100
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 조회 성능용 인덱스
create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_course_id_idx on public.orders(course_id);

-- updated_at 자동 갱신 트리거
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ============================================
-- Row Level Security (RLS)
-- 사용자는 '자신의' 주문만 보고 만들 수 있어야 함
-- ============================================
alter table public.orders enable row level security;

drop policy if exists "본인 주문 조회" on public.orders;
create policy "본인 주문 조회"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "본인 주문 생성" on public.orders;
create policy "본인 주문 생성"
  on public.orders for insert
  with check (auth.uid() = user_id);

drop policy if exists "본인 주문 수정" on public.orders;
create policy "본인 주문 수정"
  on public.orders for update
  using (auth.uid() = user_id);

-- ⚠️ 보안 메모
-- 현재는 결제 성공 후 브라우저(course-detail.html)에서 직접 insert 합니다.
-- 운영 단계에서는 PortOne 결제내역을 서버(Supabase Edge Function)에서
-- 재검증한 뒤 service_role 로 기록하도록 옮기는 것을 권장합니다.
