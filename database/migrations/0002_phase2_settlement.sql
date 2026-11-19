-- Phase 2: Settlement, VietQR, and Bank Accounts

do $$ begin
  create type public.payment_status as enum ('marked_paid', 'confirmed');
exception when duplicate_object then null; end $$;

-- 1. Settlements Table
create table if not exists public.settlements (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete restrict,
  from_member uuid not null references public.trip_members(id) on delete restrict,
  to_member uuid not null references public.trip_members(id) on delete restrict,
  amount bigint not null check (amount between 1 and 1000000000),
  status public.payment_status not null default 'marked_paid',
  marked_at timestamptz not null default now(),
  confirmed_at timestamptz,
  created_by uuid not null references public.trip_members(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint settlements_members_differ check (from_member <> to_member)
);

create index if not exists settlements_trip_status on public.settlements(trip_id, status) where deleted_at is null;
create index if not exists settlements_from_member on public.settlements(from_member) where deleted_at is null;
create index if not exists settlements_to_member on public.settlements(to_member) where deleted_at is null;

-- 2. Member Bank Accounts Table
create table if not exists public.member_bank_accounts (
  member_id uuid primary key references public.trip_members(id) on delete restrict,
  bank_bin text not null check (char_length(btrim(bank_bin)) between 6 and 10),
  account_number text not null check (char_length(btrim(account_number)) between 3 and 30),
  account_name text not null check (char_length(btrim(account_name)) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. RLS Policies
alter table public.settlements enable row level security;
alter table public.member_bank_accounts enable row level security;

drop policy if exists settlements_member_select on public.settlements;
create policy settlements_member_select on public.settlements for select
  using (deleted_at is null and public.is_trip_member(trip_id));

drop policy if exists member_bank_accounts_owner on public.member_bank_accounts;
create policy member_bank_accounts_owner on public.member_bank_accounts for all
  using (
    exists (
      select 1 from public.trip_members m
      where m.id = member_id and m.user_id = public.current_app_user_id() and m.deleted_at is null
    )
  )
  with check (
    exists (
      select 1 from public.trip_members m
      where m.id = member_id and m.user_id = public.current_app_user_id() and m.deleted_at is null
    )
  );

revoke insert, update, delete on public.settlements, public.member_bank_accounts from public;
grant select on public.settlements to current_user;
grant select, insert, update on public.member_bank_accounts to current_user;

-- 4. Update get_trip_balances to include confirmed settlements
create or replace function public.get_trip_balances(p_trip uuid)
returns table (member_id uuid, paid bigint, owed bigint, sent bigint, received bigint, net bigint)
language plpgsql stable security definer
set search_path = ''
as $$
begin
  if public.current_app_user_id() is null or not public.is_trip_member(p_trip) then
    raise exception 'Bạn không có quyền xem số dư chuyến này.';
  end if;

  return query
  with paid_totals as (
    select e.paid_by as member_id, sum(e.amount)::bigint as amount
    from public.expenses e
    where e.trip_id = p_trip and e.deleted_at is null
    group by e.paid_by
  ),
  owed_totals as (
    select s.member_id, sum(s.owed_amount)::bigint as amount
    from public.expense_splits s
    join public.expenses e on e.id = s.expense_id
    where e.trip_id = p_trip and e.deleted_at is null
    group by s.member_id
  ),
  sent_totals as (
    select st.from_member as member_id, sum(st.amount)::bigint as amount
    from public.settlements st
    where st.trip_id = p_trip and st.status = 'confirmed' and st.deleted_at is null
    group by st.from_member
  ),
  received_totals as (
    select st.to_member as member_id, sum(st.amount)::bigint as amount
    from public.settlements st
    where st.trip_id = p_trip and st.status = 'confirmed' and st.deleted_at is null
    group by st.to_member
  )
  select
    m.id,
    coalesce(p.amount, 0)::bigint as paid,
    coalesce(o.amount, 0)::bigint as owed,
    coalesce(s.amount, 0)::bigint as sent,
    coalesce(r.amount, 0)::bigint as received,
    (coalesce(p.amount, 0) - coalesce(o.amount, 0) + coalesce(s.amount, 0) - coalesce(r.amount, 0))::bigint as net
  from public.trip_members m
  left join paid_totals p on p.member_id = m.id
  left join owed_totals o on o.member_id = m.id
  left join sent_totals s on s.member_id = m.id
  left join received_totals r on r.member_id = m.id
  where m.trip_id = p_trip and m.deleted_at is null
  order by m.created_at, m.id;
end;
$$;

-- 5. RPC save_bank_account
create or replace function public.save_bank_account(
  p_member_id uuid,
  p_bank_bin text,
  p_account_number text,
  p_account_name text
)
returns boolean
language plpgsql security definer
set search_path = ''
as $$
declare
  v_member public.trip_members%rowtype;
begin
  if public.current_app_user_id() is null then
    raise exception 'Cần có phiên đăng nhập.';
  end if;

  select * into v_member from public.trip_members
  where id = p_member_id and deleted_at is null;

  if not found then
    raise exception 'Thành viên không tồn tại.';
  end if;

  if v_member.user_id <> public.current_app_user_id() then
    -- Check if caller is trip owner
    if not exists (
      select 1 from public.trip_members m
      where m.trip_id = v_member.trip_id and m.user_id = public.current_app_user_id()
        and m.role = 'owner' and m.status = 'active' and m.deleted_at is null
    ) then
      raise exception 'Bạn chỉ có thể cập nhật thông tin nhận tiền của chính mình.';
    end if;
  end if;

  insert into public.member_bank_accounts(member_id, bank_bin, account_number, account_name, updated_at)
  values (
    p_member_id,
    btrim(p_bank_bin),
    btrim(p_account_number),
    upper(btrim(p_account_name)),
    now()
  )
  on conflict (member_id) do update set
    bank_bin = excluded.bank_bin,
    account_number = excluded.account_number,
    account_name = excluded.account_name,
    updated_at = now();

  return true;
end;
$$;

-- 6. RPC get_payment_target
create or replace function public.get_payment_target(
  p_trip_id uuid,
  p_to_member uuid
)
returns table (
  bank_bin text,
  account_number text,
  account_name text
)
language plpgsql stable security definer
set search_path = ''
as $$
begin
  if public.current_app_user_id() is null or not public.is_trip_member(p_trip_id) then
    raise exception 'Bạn không có quyền truy cập thông tin chuyến này.';
  end if;

  return query
  select b.bank_bin, b.account_number, b.account_name
  from public.member_bank_accounts b
  join public.trip_members m on m.id = b.member_id
  where m.id = p_to_member and m.trip_id = p_trip_id and m.deleted_at is null;
end;
$$;

-- 7. RPC mark_paid
create or replace function public.mark_paid(
  p_trip_id uuid,
  p_to_member uuid,
  p_amount bigint
)
returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  v_from_member uuid;
  v_settlement_id uuid;
begin
  if public.current_app_user_id() is null or not public.is_trip_member(p_trip_id) then
    raise exception 'Bạn không có quyền thực hiện trong chuyến này.';
  end if;

  select m.id into v_from_member
  from public.trip_members m
  where m.trip_id = p_trip_id and m.user_id = public.current_app_user_id()
    and m.status = 'active' and m.deleted_at is null limit 1;

  if v_from_member is null then
    raise exception 'Không xác định được danh tính người gửi.';
  end if;

  if v_from_member = p_to_member then
    raise exception 'Không thể tự chuyển tiền cho chính mình.';
  end if;

  if p_amount is null or p_amount <= 0 or p_amount > 1000000000 then
    raise exception 'Số tiền chuyển không hợp lệ.';
  end if;

  if not exists (
    select 1 from public.trip_members m
    where m.id = p_to_member and m.trip_id = p_trip_id and m.deleted_at is null
  ) then
    raise exception 'Người nhận không thuộc chuyến này.';
  end if;

  insert into public.settlements(
    trip_id, from_member, to_member, amount, status, marked_at, created_by
  )
  values (
    p_trip_id, v_from_member, p_to_member, p_amount, 'marked_paid', now(), v_from_member
  )
  returning id into v_settlement_id;

  return v_settlement_id;
end;
$$;

-- 8. RPC confirm_payment
create or replace function public.confirm_payment(
  p_settlement_id uuid
)
returns boolean
language plpgsql security definer
set search_path = ''
as $$
declare
  v_settlement public.settlements%rowtype;
  v_is_receiver boolean := false;
  v_is_owner boolean := false;
begin
  if public.current_app_user_id() is null then
    raise exception 'Cần có phiên đăng nhập.';
  end if;

  select * into v_settlement
  from public.settlements
  where id = p_settlement_id and deleted_at is null;

  if not found then
    raise exception 'Giao dịch thanh toán không tồn tại.';
  end if;

  if v_settlement.status = 'confirmed' then
    return true;
  end if;

  -- Receiver check
  select exists (
    select 1 from public.trip_members m
    where m.id = v_settlement.to_member and m.user_id = public.current_app_user_id()
      and m.deleted_at is null
  ) into v_is_receiver;

  -- Trip owner check
  select exists (
    select 1 from public.trip_members m
    where m.trip_id = v_settlement.trip_id and m.user_id = public.current_app_user_id()
      and m.role = 'owner' and m.status = 'active' and m.deleted_at is null
  ) into v_is_owner;

  if not v_is_receiver and not v_is_owner then
    raise exception 'Chỉ người nhận tiền hoặc trưởng nhóm mới có quyền xác nhận thanh toán.';
  end if;

  update public.settlements
  set status = 'confirmed', confirmed_at = now(), updated_at = now()
  where id = p_settlement_id;

  return true;
end;
$$;

-- 9. RPC delete_settlement
create or replace function public.delete_settlement(
  p_settlement_id uuid
)
returns boolean
language plpgsql security definer
set search_path = ''
as $$
declare
  v_settlement public.settlements%rowtype;
  v_can_delete boolean := false;
begin
  if public.current_app_user_id() is null then
    raise exception 'Cần có phiên đăng nhập.';
  end if;

  select * into v_settlement
  from public.settlements
  where id = p_settlement_id and deleted_at is null;

  if not found then
    raise exception 'Giao dịch không tồn tại.';
  end if;

  -- Sender, receiver, or trip owner can delete pending settlement
  select exists (
    select 1 from public.trip_members m
    where (m.id = v_settlement.from_member or m.id = v_settlement.to_member or (m.trip_id = v_settlement.trip_id and m.role = 'owner'))
      and m.user_id = public.current_app_user_id() and m.deleted_at is null
  ) into v_can_delete;

  if not v_can_delete then
    raise exception 'Bạn không có quyền hủy giao dịch này.';
  end if;

  update public.settlements
  set deleted_at = now(), updated_at = now()
  where id = p_settlement_id;

  return true;
end;
$$;

-- 10. RPC lock_trip / unlock_trip
create or replace function public.lock_trip(p_trip_id uuid)
returns boolean
language plpgsql security definer
set search_path = ''
as $$
begin
  if public.current_app_user_id() is null then
    raise exception 'Cần có phiên đăng nhập.';
  end if;

  if not exists (
    select 1 from public.trip_members m
    where m.trip_id = p_trip_id and m.user_id = public.current_app_user_id()
      and m.role = 'owner' and m.status = 'active' and m.deleted_at is null
  ) then
    raise exception 'Chỉ người tạo chuyến mới có quyền chốt sổ chi tiêu.';
  end if;

  update public.trips set status = 'locked', updated_at = now()
  where id = p_trip_id and deleted_at is null;

  return true;
end;
$$;

create or replace function public.unlock_trip(p_trip_id uuid)
returns boolean
language plpgsql security definer
set search_path = ''
as $$
begin
  if public.current_app_user_id() is null then
    raise exception 'Cần có phiên đăng nhập.';
  end if;

  if not exists (
    select 1 from public.trip_members m
    where m.trip_id = p_trip_id and m.user_id = public.current_app_user_id()
      and m.role = 'owner' and m.status = 'active' and m.deleted_at is null
  ) then
    raise exception 'Chỉ người tạo chuyến mới có quyền mở lại sổ chi tiêu.';
  end if;

  update public.trips set status = 'active', updated_at = now()
  where id = p_trip_id and deleted_at is null;

  return true;
end;
$$;

-- 11. Grant permissions
grant execute on function public.save_bank_account(uuid, text, text, text) to current_user;
grant execute on function public.get_payment_target(uuid, uuid) to current_user;
grant execute on function public.mark_paid(uuid, uuid, bigint) to current_user;
grant execute on function public.confirm_payment(uuid) to current_user;
grant execute on function public.delete_settlement(uuid) to current_user;
grant execute on function public.lock_trip(uuid) to current_user;
grant execute on function public.unlock_trip(uuid) to current_user;
