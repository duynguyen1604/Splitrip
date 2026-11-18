create extension if not exists pgcrypto with schema extensions;

do $$ begin
  create type public.member_role as enum ('owner', 'member');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.member_status as enum ('active', 'left', 'removed');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.trip_status as enum ('active', 'locked', 'archived');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.expense_category as enum ('lodging', 'transport', 'food', 'tickets', 'other');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.split_type as enum ('equal', 'amount', 'percent', 'shares');
exception when duplicate_object then null; end $$;

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  destination text,
  start_date date,
  end_date date,
  invite_code text not null unique default upper(translate(encode(extensions.gen_random_bytes(9), 'base64'), '+/=', 'XYZ')),
  invite_enabled boolean not null default true,
  status public.trip_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint trip_dates_valid check (start_date is null or end_date is null or end_date >= start_date)
);

create table if not exists public.trip_members (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete restrict,
  user_id uuid references auth.users(id) on delete set null,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 30),
  role public.member_role not null default 'member',
  status public.member_status not null default 'active',
  created_at timestamptz not null default now(),
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  deleted_at timestamptz
);
create unique index if not exists trip_members_trip_user_unique on public.trip_members(trip_id, user_id) where user_id is not null;
create unique index if not exists trip_members_one_owner on public.trip_members(trip_id) where role = 'owner' and deleted_at is null;
create index if not exists trip_members_user_active on public.trip_members(user_id, status) where deleted_at is null;
create index if not exists trip_members_trip_created on public.trip_members(trip_id, created_at) where deleted_at is null;

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete restrict,
  client_id uuid not null,
  title text not null check (char_length(btrim(title)) between 1 and 100),
  amount bigint not null check (amount between 1 and 1000000000),
  paid_by uuid not null references public.trip_members(id) on delete restrict,
  category public.expense_category not null default 'other',
  spent_on date not null default current_date,
  split_type public.split_type not null default 'equal',
  created_by uuid not null references public.trip_members(id) on delete restrict,
  seq_no integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (trip_id, client_id),
  unique (trip_id, seq_no)
);
create index if not exists expenses_trip_date on public.expenses(trip_id, spent_on desc) where deleted_at is null;

create table if not exists public.expense_splits (
  expense_id uuid not null references public.expenses(id) on delete restrict,
  member_id uuid not null references public.trip_members(id) on delete restrict,
  owed_amount bigint not null check (owed_amount >= 0),
  weight integer,
  primary key (expense_id, member_id)
);
create index if not exists expense_splits_member on public.expense_splits(member_id);

create or replace function public.is_trip_member(p_trip uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.trip_members m
    where m.trip_id = p_trip and m.user_id = auth.uid()
      and m.status = 'active' and m.deleted_at is null
  );
$$;

alter table public.trips enable row level security;
alter table public.trip_members enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_splits enable row level security;

drop policy if exists trips_member_select on public.trips;
create policy trips_member_select on public.trips for select to authenticated
  using (deleted_at is null and public.is_trip_member(id));
drop policy if exists trip_members_member_select on public.trip_members;
create policy trip_members_member_select on public.trip_members for select to authenticated
  using (deleted_at is null and public.is_trip_member(trip_id));
drop policy if exists expenses_member_select on public.expenses;
create policy expenses_member_select on public.expenses for select to authenticated
  using (deleted_at is null and public.is_trip_member(trip_id));
drop policy if exists expense_splits_member_select on public.expense_splits;
create policy expense_splits_member_select on public.expense_splits for select to authenticated
  using (exists (
    select 1 from public.expenses e
    where e.id = expense_id and e.deleted_at is null and public.is_trip_member(e.trip_id)
  ));

revoke insert, update, delete on public.trips, public.trip_members, public.expenses, public.expense_splits from anon, authenticated;
grant select on public.trips, public.trip_members, public.expenses, public.expense_splits to authenticated;

create or replace function public.create_trip(p_name text, p_display_name text)
returns table (trip_id uuid, member_id uuid, invite_code text)
language plpgsql security definer
set search_path = ''
as $$
declare
  v_trip_id uuid;
  v_member_id uuid;
  v_code text;
begin
  if auth.uid() is null then raise exception 'Cần có phiên đăng nhập để tạo chuyến.'; end if;
  if p_name is null or char_length(btrim(p_name)) not between 1 and 80 then
    raise exception 'Tên chuyến cần từ 1 đến 80 ký tự.';
  end if;
  if p_display_name is null or char_length(btrim(p_display_name)) not between 1 and 30 then
    raise exception 'Tên hiển thị cần từ 1 đến 30 ký tự.';
  end if;
  insert into public.trips(name) values (btrim(p_name))
    returning id, trips.invite_code into v_trip_id, v_code;
  insert into public.trip_members(trip_id, user_id, display_name, role)
    values (v_trip_id, auth.uid(), btrim(p_display_name), 'owner') returning id into v_member_id;
  return query select v_trip_id, v_member_id, v_code;
end;
$$;

create or replace function public.join_trip_by_code(p_code text, p_display_name text)
returns table (trip_id uuid, member_id uuid)
language plpgsql security definer
set search_path = ''
as $$
declare
  v_trip public.trips%rowtype;
  v_member_id uuid;
begin
  if auth.uid() is null then raise exception 'Cần có phiên đăng nhập để tham gia.'; end if;
  if p_display_name is null or char_length(btrim(p_display_name)) not between 1 and 30 then
    raise exception 'Tên hiển thị cần từ 1 đến 30 ký tự.';
  end if;
  select t.* into v_trip from public.trips t
    where upper(t.invite_code) = upper(btrim(p_code)) and t.deleted_at is null
      and t.invite_enabled and t.status = 'active';
  if not found then raise exception 'Mã mời không hợp lệ hoặc chuyến đã đóng nhận thành viên.'; end if;
  select m.id into v_member_id from public.trip_members m
    where m.trip_id = v_trip.id and m.user_id = auth.uid() and m.deleted_at is null;
  if v_member_id is null then
    insert into public.trip_members(trip_id, user_id, display_name, role)
      values (v_trip.id, auth.uid(), btrim(p_display_name), 'member') returning id into v_member_id;
  else
    update public.trip_members set display_name = btrim(p_display_name), status = 'active', left_at = null
      where id = v_member_id;
  end if;
  return query select v_trip.id, v_member_id;
end;
$$;

create or replace function public.add_expense(
  p_trip_id uuid,
  p_client_id uuid,
  p_title text,
  p_amount bigint,
  p_paid_by uuid,
  p_category public.expense_category,
  p_spent_on date,
  p_splits jsonb
)
returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  v_actor uuid;
  v_expense_id uuid;
  v_seq integer;
  v_split_total numeric;
  v_rows integer;
begin
  if auth.uid() is null or not public.is_trip_member(p_trip_id) then
    raise exception 'Bạn không có quyền ghi chi tiêu cho chuyến này.';
  end if;
  select m.id into v_actor from public.trip_members m
    where m.trip_id = p_trip_id and m.user_id = auth.uid()
      and m.status = 'active' and m.deleted_at is null limit 1;
  if p_client_id is null then raise exception 'Thiếu mã khoản chi.'; end if;
  select e.id into v_expense_id from public.expenses e
    where e.trip_id = p_trip_id and e.client_id = p_client_id;
  if v_expense_id is not null then return v_expense_id; end if;
  if p_amount is null or p_amount not between 1 and 1000000000 then
    raise exception 'Số tiền phải từ 1₫ đến 1.000.000.000₫.';
  end if;
  if p_title is null or char_length(btrim(p_title)) not between 1 and 100 then
    raise exception 'Tên khoản chi cần từ 1 đến 100 ký tự.';
  end if;
  if not exists (select 1 from public.trip_members m
    where m.id = p_paid_by and m.trip_id = p_trip_id and m.deleted_at is null) then
    raise exception 'Người trả không thuộc chuyến này.';
  end if;
  if p_splits is null or jsonb_typeof(p_splits) <> 'array' or jsonb_array_length(p_splits) = 0 then
    raise exception 'Chọn ít nhất một người chia khoản chi.';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_splits) x
    where jsonb_typeof(x) <> 'object' or (x->>'owed_amount') !~ '^[0-9]+$'
  ) then raise exception 'Số tiền chia phải là số nguyên không âm.'; end if;
  select count(*), coalesce(sum((x->>'owed_amount')::numeric), 0)
    into v_rows, v_split_total from jsonb_array_elements(p_splits) x;
  if v_split_total <> p_amount then raise exception 'Tổng phần chia phải bằng số tiền khoản chi.'; end if;
  if exists (
    select 1 from jsonb_array_elements(p_splits) x
      left join public.trip_members m
        on m.id = (x->>'member_id')::uuid and m.trip_id = p_trip_id
          and m.status = 'active' and m.deleted_at is null
    where m.id is null
  ) then raise exception 'Danh sách người chia không hợp lệ.'; end if;
  if (select count(distinct x->>'member_id') from jsonb_array_elements(p_splits) x) <> v_rows then
    raise exception 'Danh sách người chia bị trùng.';
  end if;
  perform 1 from public.trips t
    where t.id = p_trip_id and t.status = 'active' and t.deleted_at is null
    for update;
  if not found then
    raise exception 'Chuyến hiện không nhận thêm khoản chi.';
  end if;
  select coalesce(max(e.seq_no), 0) + 1 into v_seq from public.expenses e where e.trip_id = p_trip_id;
  insert into public.expenses(trip_id, client_id, title, amount, paid_by, category, spent_on, split_type, created_by, seq_no)
    values (p_trip_id, p_client_id, btrim(p_title), p_amount, p_paid_by, p_category,
      coalesce(p_spent_on, current_date), 'equal', v_actor, v_seq)
    returning id into v_expense_id;
  insert into public.expense_splits(expense_id, member_id, owed_amount)
    select v_expense_id, (x->>'member_id')::uuid, (x->>'owed_amount')::bigint
      from jsonb_array_elements(p_splits) x;
  return v_expense_id;
end;
$$;

create or replace function public.get_trip_balances(p_trip uuid)
returns table (member_id uuid, paid bigint, owed bigint, sent bigint, received bigint, net bigint)
language plpgsql stable security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_trip_member(p_trip) then
    raise exception 'Bạn không có quyền xem số dư chuyến này.';
  end if;
  return query
  with paid_totals as (
    select e.paid_by as member_id, sum(e.amount)::bigint as amount from public.expenses e
      where e.trip_id = p_trip and e.deleted_at is null group by e.paid_by
  ), owed_totals as (
    select s.member_id, sum(s.owed_amount)::bigint as amount from public.expense_splits s
      join public.expenses e on e.id = s.expense_id
      where e.trip_id = p_trip and e.deleted_at is null group by s.member_id
  )
  select m.id, coalesce(p.amount, 0)::bigint, coalesce(o.amount, 0)::bigint, 0::bigint, 0::bigint,
    (coalesce(p.amount, 0) - coalesce(o.amount, 0))::bigint
  from public.trip_members m
    left join paid_totals p on p.member_id = m.id
    left join owed_totals o on o.member_id = m.id
  where m.trip_id = p_trip and m.deleted_at is null
  order by m.created_at, m.id;
end;
$$;

revoke all on function public.is_trip_member(uuid) from public;
revoke all on function public.create_trip(text, text) from public;
revoke all on function public.join_trip_by_code(text, text) from public;
revoke all on function public.add_expense(uuid, uuid, text, bigint, uuid, public.expense_category, date, jsonb) from public;
revoke all on function public.get_trip_balances(uuid) from public;
grant execute on function public.is_trip_member(uuid) to authenticated;
grant execute on function public.create_trip(text, text) to authenticated;
grant execute on function public.join_trip_by_code(text, text) to authenticated;
grant execute on function public.add_expense(uuid, uuid, text, bigint, uuid, public.expense_category, date, jsonb) to authenticated;
grant execute on function public.get_trip_balances(uuid) to authenticated;

