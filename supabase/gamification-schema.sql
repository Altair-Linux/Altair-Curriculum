-- ============================================================
-- Altair Curriculum — Gamification Schema Extension
-- Run AFTER schema.sql. Safe to run multiple times.
-- ============================================================

-- ── User progress (single source of truth) ───────────────────
-- Replaces localStorage as the canonical store for XP, level,
-- streak, and completion counts.
create table if not exists public.user_progress (
  user_id          uuid primary key references public.profiles(id) on delete cascade,
  xp               integer not null default 0,
  level            integer not null default 0,
  completed_count  integer not null default 0,
  completed_projects integer not null default 0,
  streak           integer not null default 0,
  best_streak      integer not null default 0,
  last_active_date date,
  updated_at       timestamptz not null default now()
);

drop trigger if exists user_progress_updated_at on public.user_progress;
create trigger user_progress_updated_at
  before update on public.user_progress
  for each row execute procedure public.set_updated_at();

-- Auto-create progress row when profile is created
create or replace function public.handle_new_user_progress()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_progress (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_profile_created_progress on public.profiles;
create trigger on_profile_created_progress
  after insert on public.profiles
  for each row execute procedure public.handle_new_user_progress();

-- ── Completed lessons ─────────────────────────────────────────
-- One row per completed lesson per user.
-- lesson_url is the canonical URL path e.g. /k-2/k-01-what-is-a-computer.html
create table if not exists public.completed_lessons (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  lesson_url   text not null,
  lesson_id    text,
  xp_earned    integer not null default 50,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_url)
);

create index if not exists idx_completed_user    on public.completed_lessons (user_id);
create index if not exists idx_completed_url     on public.completed_lessons (lesson_url);
create index if not exists idx_completed_at      on public.completed_lessons (completed_at desc);

-- ── Earned badges ─────────────────────────────────────────────
create table if not exists public.earned_badges (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  badge_id   text not null,
  earned_at  timestamptz not null default now(),
  unique (user_id, badge_id)
);

create index if not exists idx_badges_user on public.earned_badges (user_id);

-- ── Skill tree progress ───────────────────────────────────────
-- skill_key maps to a section/grade band: k-2, 3-5, 6-8, 9-12
-- status: locked | unlocked | completed
create table if not exists public.skill_progress (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  skill_key  text not null,
  status     text not null default 'locked' check (status in ('locked','unlocked','completed')),
  unlocked_at timestamptz,
  completed_at timestamptz,
  unique (user_id, skill_key)
);

create index if not exists idx_skill_user on public.skill_progress (user_id);

-- ── Unlockable content ────────────────────────────────────────
-- content_key: a stable string identifier for the unlockable
-- content_type: bonus_lesson | mini_project | challenge | easter_egg
create table if not exists public.unlocked_content (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  content_key  text not null,
  content_type text not null check (content_type in ('bonus_lesson','mini_project','challenge','easter_egg')),
  unlocked_at  timestamptz not null default now(),
  unique (user_id, content_key)
);

create index if not exists idx_unlocked_user on public.unlocked_content (user_id);

-- ── Leaderboard view (not a stored table — computed on read) ──
-- A view avoids data duplication and stays in sync automatically.
create or replace view public.leaderboard as
  select
    p.id             as user_id,
    p.display_name,
    up.xp,
    up.level,
    up.completed_count,
    up.streak,
    up.best_streak,
    rank() over (order by up.xp desc) as xp_rank,
    rank() over (order by up.completed_count desc) as lessons_rank
  from public.user_progress up
  join public.profiles p on p.id = up.user_id
  where p.account_status = 'active';

-- ── Streak update function (called server-side via RPC) ───────
-- Updates streak atomically and prevents race conditions.
create or replace function public.record_lesson_completion(
  p_user_id    uuid,
  p_lesson_url text,
  p_lesson_id  text,
  p_xp         integer default 50
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_today      date := current_date;
  v_progress   public.user_progress%rowtype;
  v_new_streak integer;
  v_diff_days  integer;
  v_xp_gained  integer := 0;
  v_leveled_up boolean := false;
  v_old_level  integer;
  v_new_level  integer;
begin
  -- Insert completion (idempotent — do nothing if already done)
  insert into public.completed_lessons (user_id, lesson_url, lesson_id, xp_earned)
  values (p_user_id, p_lesson_url, p_lesson_id, p_xp)
  on conflict (user_id, lesson_url) do nothing;

  -- Only award XP if this is a new completion
  if found then
    v_xp_gained := p_xp;

    -- Load current progress (upsert ensures row exists)
    insert into public.user_progress (user_id) values (p_user_id)
    on conflict (user_id) do nothing;

    select * into v_progress from public.user_progress where user_id = p_user_id;

    -- Streak logic
    if v_progress.last_active_date is null then
      v_new_streak := 1;
    else
      v_diff_days := v_today - v_progress.last_active_date;
      if v_diff_days = 0 then
        v_new_streak := v_progress.streak;
      elsif v_diff_days = 1 then
        v_new_streak := v_progress.streak + 1;
      else
        v_new_streak := 1;
      end if;
    end if;

    -- Level thresholds (mirror frontend constants)
    v_old_level := v_progress.level;
    declare
      v_new_xp integer := v_progress.xp + v_xp_gained;
    begin
      v_new_level :=
        case
          when v_new_xp >= 3000 then 7
          when v_new_xp >= 2200 then 6
          when v_new_xp >= 1500 then 5
          when v_new_xp >= 1000 then 4
          when v_new_xp >= 600  then 3
          when v_new_xp >= 300  then 2
          when v_new_xp >= 100  then 1
          else 0
        end;
      v_leveled_up := v_new_level > v_old_level;

      update public.user_progress set
        xp               = v_new_xp,
        level            = v_new_level,
        completed_count  = completed_count + 1,
        streak           = v_new_streak,
        best_streak      = greatest(best_streak, v_new_streak),
        last_active_date = v_today
      where user_id = p_user_id;
    end;
  end if;

  return jsonb_build_object(
    'xp_gained',   v_xp_gained,
    'leveled_up',  v_leveled_up,
    'new_streak',  v_new_streak
  );
end;
$$;

-- ── RLS ───────────────────────────────────────────────────────
alter table public.user_progress     enable row level security;
alter table public.completed_lessons enable row level security;
alter table public.earned_badges     enable row level security;
alter table public.skill_progress    enable row level security;
alter table public.unlocked_content  enable row level security;

-- user_progress: users read/update own; superadmin reads all
drop policy if exists "Progress: own read" on public.user_progress;
create policy "Progress: own read"
  on public.user_progress for select using (auth.uid() = user_id);

drop policy if exists "Progress: own update" on public.user_progress;
create policy "Progress: own update"
  on public.user_progress for update using (auth.uid() = user_id);

drop policy if exists "Progress: superadmin read" on public.user_progress;
create policy "Progress: superadmin read"
  on public.user_progress for select
  using (public.current_role_name() = 'superadmin');

-- completed_lessons: users read own
drop policy if exists "Completions: own read" on public.completed_lessons;
create policy "Completions: own read"
  on public.completed_lessons for select using (auth.uid() = user_id);

drop policy if exists "Completions: no direct insert" on public.completed_lessons;
-- Insertions happen only via record_lesson_completion() security-definer function.
-- Direct inserts from the client are blocked.

-- earned_badges: users read own
drop policy if exists "Badges: own read" on public.earned_badges;
create policy "Badges: own read"
  on public.earned_badges for select using (auth.uid() = user_id);

drop policy if exists "Badges: own insert" on public.earned_badges;
create policy "Badges: own insert"
  on public.earned_badges for insert with check (auth.uid() = user_id);

-- skill_progress: users read/upsert own
drop policy if exists "Skills: own read" on public.skill_progress;
create policy "Skills: own read"
  on public.skill_progress for select using (auth.uid() = user_id);

drop policy if exists "Skills: own upsert" on public.skill_progress;
create policy "Skills: own upsert"
  on public.skill_progress for insert with check (auth.uid() = user_id);

drop policy if exists "Skills: own update" on public.skill_progress;
create policy "Skills: own update"
  on public.skill_progress for update using (auth.uid() = user_id);

-- unlocked_content: users read own
drop policy if exists "Unlocks: own read" on public.unlocked_content;
create policy "Unlocks: own read"
  on public.unlocked_content for select using (auth.uid() = user_id);

drop policy if exists "Unlocks: own insert" on public.unlocked_content;
create policy "Unlocks: own insert"
  on public.unlocked_content for insert with check (auth.uid() = user_id);

-- leaderboard view: all authenticated users can read
drop policy if exists "Leaderboard: authenticated read" on public.user_progress;
create policy "Leaderboard: authenticated read"
  on public.user_progress for select
  using (auth.uid() is not null);

-- ── Indexes ───────────────────────────────────────────────────
create index if not exists idx_progress_xp    on public.user_progress (xp desc);
create index if not exists idx_progress_level on public.user_progress (level desc);
create index if not exists idx_progress_count on public.user_progress (completed_count desc);
