-- Streak Dashboard schema
-- Run this in the Supabase SQL editor for your project.
--
-- This app has no login screen — it connects directly with the public
-- anon key. Treat your Supabase URL + anon key as a shared secret: don't
-- publish them anywhere public, and only give the link to people you
-- trust with this data.

create extension if not exists "uuid-ossp";

-- ============================================================
-- Table: time_streaks
-- Tracks elapsed time since a single chosen milestone. The app only
-- ever manages one row here — a trigger below blocks a second insert.
-- ============================================================
create table if not exists public.time_streaks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  start_at timestamptz not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.enforce_single_time_streak()
returns trigger as $$
begin
  if (select count(*) from public.time_streaks) >= 1 then
    raise exception 'Only one time streak is allowed. Delete the existing one first.';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_time_streaks_singleton
  before insert on public.time_streaks
  for each row execute function public.enforce_single_time_streak();

-- ============================================================
-- Table: streak_posts
-- Logbook entries: date, time, duration, description.
-- ============================================================
create table if not exists public.streak_posts (
  id uuid primary key default uuid_generate_v4(),
  post_date date not null,
  post_time time not null,
  duration text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_streak_posts_date on public.streak_posts(post_date desc);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_time_streaks_updated_at
  before update on public.time_streaks
  for each row execute function public.set_updated_at();

create trigger trg_streak_posts_updated_at
  before update on public.streak_posts
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security
-- ------------------------------------------------------------
-- There is no login, so requests reach Supabase using the public
-- "anon" role. RLS is enabled with permissive policies so the app
-- keeps working out of the box for the anon role only — this table
-- is NOT readable/writable by any other Supabase project or role.
-- Your real protection is keeping the project URL + anon key private.
-- ============================================================
alter table public.time_streaks enable row level security;
alter table public.streak_posts enable row level security;

create policy "time_streaks_anon_all" on public.time_streaks
  for all to anon using (true) with check (true);

create policy "streak_posts_anon_all" on public.streak_posts
  for all to anon using (true) with check (true);
