-- Public, human-readable trip code for payment memos.
-- Keep invite_code private to the invite flow: it grants access to join a trip.
alter table public.trips
  add column if not exists short_code text;

create or replace function public.generate_trip_short_code()
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_code text;
begin
  -- Serialize generation so the uniqueness check also covers concurrent creates.
  perform pg_catalog.pg_advisory_xact_lock(78123456012345::bigint);

  loop
    v_code := pg_catalog.upper(
      pg_catalog.substr(pg_catalog.encode(extensions.gen_random_bytes(4), 'hex'), 1, 6)
    );
    exit when not exists (
      select 1 from public.trips t where t.short_code = v_code
    );
  end loop;

  return v_code;
end;
$$;

update public.trips
set short_code = public.generate_trip_short_code()
where short_code is null;

alter table public.trips
  alter column short_code set default public.generate_trip_short_code(),
  alter column short_code set not null;

create unique index if not exists trips_short_code_unique
  on public.trips(short_code);

revoke all on function public.generate_trip_short_code() from public;
