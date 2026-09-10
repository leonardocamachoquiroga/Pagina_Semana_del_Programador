create table if not exists public.teams (
  id text primary key check (id ~ '^[0-9]{4}$'),
  name text not null check (char_length(btrim(name)) between 2 and 80),
  members text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.teams enable row level security;

revoke all on table public.teams from anon, authenticated;
grant select on table public.teams to anon, authenticated;

drop policy if exists "Anyone can read active teams" on public.teams;
create policy "Anyone can read active teams"
  on public.teams
  for select
  to anon, authenticated
  using (active = true);
