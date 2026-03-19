-- ============================================================
-- Altair Curriculum — Supabase Schema
-- Run this entire file in your Supabase SQL editor.
-- It is safe to run multiple times (uses IF NOT EXISTS).
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Role enum ────────────────────────────────────────────────
do $$ begin
  create type user_role as enum (
    'student',
    'teacher',
    'school_admin',
    'moderator',
    'superadmin'
  );
exception when duplicate_object then null;
end $$;

-- ── Status enums ─────────────────────────────────────────────
do $$ begin
  create type verification_status as enum (
    'pending',
    'verified',
    'rejected'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type moderation_status as enum (
    'pending',
    'under_review',
    'approved',
    'rejected',
    'needs_changes'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type submission_type as enum (
    'new_school',
    'ownership_claim',
    'school_edit',
    'curriculum_feedback'
  );
exception when duplicate_object then null;
end $$;

-- ── Profiles ─────────────────────────────────────────────────
-- One row per auth.users entry. Created automatically by trigger.
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null,
  display_name    text,
  role            user_role not null default 'student',
  account_status  text not null default 'active' check (account_status in ('active', 'suspended', 'banned')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update updated_at automatically
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ── Schools ──────────────────────────────────────────────────
create table if not exists public.schools (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null,
  country             text not null,
  type                text not null check (type in ('public', 'private')),
  curriculum_usage    text not null check (curriculum_usage in ('partial', 'majority', 'full')),
  description         text not null,
  website             text,
  featured            boolean not null default false,
  badge               text check (badge in ('certified', 'advanced')),
  verification_status verification_status not null default 'pending',
  owner_id            uuid references public.profiles(id) on delete set null,
  submitted_by        uuid references public.profiles(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

drop trigger if exists schools_updated_at on public.schools;
create trigger schools_updated_at
  before update on public.schools
  for each row execute procedure public.set_updated_at();

-- ── Ownership claims ──────────────────────────────────────────
create table if not exists public.ownership_claims (
  id              uuid primary key default uuid_generate_v4(),
  school_id       uuid not null references public.schools(id) on delete cascade,
  claimant_id     uuid not null references public.profiles(id) on delete cascade,
  evidence_url    text,
  evidence_notes  text,
  status          verification_status not null default 'pending',
  reviewed_by     uuid references public.profiles(id) on delete set null,
  reviewed_at     timestamptz,
  created_at      timestamptz not null default now(),
  -- One active claim per school at a time
  unique (school_id, claimant_id)
);

-- ── Moderation queue ─────────────────────────────────────────
create table if not exists public.moderation_queue (
  id              uuid primary key default uuid_generate_v4(),
  submission_type submission_type not null,
  submitted_by    uuid not null references public.profiles(id) on delete cascade,
  school_id       uuid references public.schools(id) on delete cascade,
  payload         jsonb not null default '{}',
  status          moderation_status not null default 'pending',
  moderator_id    uuid references public.profiles(id) on delete set null,
  moderator_note  text,
  reviewed_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists moderation_queue_updated_at on public.moderation_queue;
create trigger moderation_queue_updated_at
  before update on public.moderation_queue
  for each row execute procedure public.set_updated_at();

-- ── Audit log ─────────────────────────────────────────────────
create table if not exists public.audit_log (
  id          uuid primary key default uuid_generate_v4(),
  actor_id    uuid references public.profiles(id) on delete set null,
  action      text not null,
  target_type text not null,
  target_id   uuid,
  metadata    jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

-- Helper: insert audit log entry (callable from triggers or RPC)
create or replace function public.log_action(
  p_actor_id    uuid,
  p_action      text,
  p_target_type text,
  p_target_id   uuid,
  p_metadata    jsonb default '{}'
) returns void language plpgsql security definer as $$
begin
  insert into public.audit_log (actor_id, action, target_type, target_id, metadata)
  values (p_actor_id, p_action, p_target_type, p_target_id, p_metadata);
end;
$$;

-- ── RLS: enable on all tables ─────────────────────────────────
alter table public.profiles         enable row level security;
alter table public.schools          enable row level security;
alter table public.ownership_claims enable row level security;
alter table public.moderation_queue enable row level security;
alter table public.audit_log        enable row level security;

-- ── Helper: get current user role ────────────────────────────
create or replace function public.current_role_name()
returns text language sql stable security definer as $$
  select role::text from public.profiles where id = auth.uid();
$$;

-- ── RLS policies: profiles ────────────────────────────────────
drop policy if exists "Profiles: read own" on public.profiles;
create policy "Profiles: read own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Profiles: moderator and superadmin read all" on public.profiles;
create policy "Profiles: moderator and superadmin read all"
  on public.profiles for select
  using (public.current_role_name() in ('moderator', 'superadmin'));

drop policy if exists "Profiles: update own display_name" on public.profiles;
create policy "Profiles: update own display_name"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Profiles: superadmin update role" on public.profiles;
create policy "Profiles: superadmin update role"
  on public.profiles for update
  using (public.current_role_name() = 'superadmin');

-- ── RLS policies: schools ─────────────────────────────────────
drop policy if exists "Schools: public read verified" on public.schools;
create policy "Schools: public read verified"
  on public.schools for select
  using (verification_status = 'verified');

drop policy if exists "Schools: owner and moderator read all" on public.schools;
create policy "Schools: owner and moderator read all"
  on public.schools for select
  using (
    auth.uid() = owner_id
    or public.current_role_name() in ('moderator', 'superadmin')
  );

drop policy if exists "Schools: insert via moderation only" on public.schools;
create policy "Schools: insert via moderation only"
  on public.schools for insert
  with check (public.current_role_name() in ('moderator', 'superadmin'));

drop policy if exists "Schools: owner update pending review" on public.schools;
create policy "Schools: owner update pending review"
  on public.schools for update
  using (
    auth.uid() = owner_id
    and verification_status = 'verified'
  );

drop policy if exists "Schools: moderator update any" on public.schools;
create policy "Schools: moderator update any"
  on public.schools for update
  using (public.current_role_name() in ('moderator', 'superadmin'));

-- ── RLS policies: ownership_claims ────────────────────────────
drop policy if exists "Claims: read own" on public.ownership_claims;
create policy "Claims: read own"
  on public.ownership_claims for select
  using (auth.uid() = claimant_id);

drop policy if exists "Claims: moderator read all" on public.ownership_claims;
create policy "Claims: moderator read all"
  on public.ownership_claims for select
  using (public.current_role_name() in ('moderator', 'superadmin'));

drop policy if exists "Claims: insert own" on public.ownership_claims;
create policy "Claims: insert own"
  on public.ownership_claims for insert
  with check (auth.uid() = claimant_id);

drop policy if exists "Claims: moderator update" on public.ownership_claims;
create policy "Claims: moderator update"
  on public.ownership_claims for update
  using (public.current_role_name() in ('moderator', 'superadmin'));

-- ── RLS policies: moderation_queue ───────────────────────────
drop policy if exists "Queue: read own submissions" on public.moderation_queue;
create policy "Queue: read own submissions"
  on public.moderation_queue for select
  using (auth.uid() = submitted_by);

drop policy if exists "Queue: moderator read all" on public.moderation_queue;
create policy "Queue: moderator read all"
  on public.moderation_queue for select
  using (public.current_role_name() in ('moderator', 'superadmin'));

drop policy if exists "Queue: authenticated insert" on public.moderation_queue;
create policy "Queue: authenticated insert"
  on public.moderation_queue for insert
  with check (auth.uid() is not null and auth.uid() = submitted_by);

drop policy if exists "Queue: moderator update" on public.moderation_queue;
create policy "Queue: moderator update"
  on public.moderation_queue for update
  using (public.current_role_name() in ('moderator', 'superadmin'));

-- ── RLS policies: audit_log ───────────────────────────────────
drop policy if exists "Audit: superadmin read all" on public.audit_log;
create policy "Audit: superadmin read all"
  on public.audit_log for select
  using (public.current_role_name() = 'superadmin');

drop policy if exists "Audit: no direct insert" on public.audit_log;
-- audit_log is written only via the log_action() security-definer function,
-- so no direct insert policy is needed for normal users.

-- ── Indexes for common queries ────────────────────────────────
create index if not exists idx_schools_status   on public.schools (verification_status);
create index if not exists idx_schools_country  on public.schools (country);
create index if not exists idx_schools_owner    on public.schools (owner_id);
create index if not exists idx_queue_status     on public.moderation_queue (status);
create index if not exists idx_queue_type       on public.moderation_queue (submission_type);
create index if not exists idx_queue_submitter  on public.moderation_queue (submitted_by);
create index if not exists idx_audit_actor      on public.audit_log (actor_id);
create index if not exists idx_audit_target     on public.audit_log (target_id);
