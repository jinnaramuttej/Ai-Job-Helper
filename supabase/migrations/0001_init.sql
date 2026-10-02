-- AI Job Finder — initial schema, row-level security, and storage.
-- Run in the Supabase SQL editor (or `supabase db push`).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- profiles: one row per auth user. "role" separates students from admins.
create table if not exists public.profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,
  role               text not null default 'student' check (role in ('student', 'admin')),
  name               text not null default '',
  email              text not null default '',
  branch             text not null default '',
  year               text not null default '',
  preferred_location text not null default '',
  skills             text[] not null default '{}',
  preferred_roles    text[] not null default '{}',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table if not exists public.jobs (
  id                   uuid primary key default gen_random_uuid(),
  title                text not null,
  company              text not null,
  location             text not null,
  role                 text not null,
  required_skills      text[] not null default '{}',
  min_experience_years integer not null default 0 check (min_experience_years >= 0),
  summary              text not null default '',
  created_by           uuid references public.profiles (id) on delete set null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create table if not exists public.applications (
  id         uuid primary key default gen_random_uuid(),
  job_id     uuid not null references public.jobs (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  status     text not null default 'applied'
             check (status in ('applied', 'in review', 'rejected', 'accepted')),
  applied_at timestamptz not null default now(),
  constraint applications_student_job_unique unique (student_id, job_id)
);

-- resumes: one stored file per student (Supabase Storage object).
create table if not exists public.resumes (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null unique references public.profiles (id) on delete cascade,
  file_name    text not null,
  storage_path text not null,
  mime_type    text not null default '',
  file_size    integer not null default 0,
  uploaded_at  timestamptz not null default now()
);

-- parsed_resumes: server-side parse result for a resume, editable by the student.
create table if not exists public.parsed_resumes (
  id              uuid primary key default gen_random_uuid(),
  resume_id       uuid not null unique references public.resumes (id) on delete cascade,
  student_id      uuid not null references public.profiles (id) on delete cascade,
  name            text not null default '',
  degree          text not null default '',
  college         text not null default '',
  graduation_year text not null default '',
  skills          text[] not null default '{}',
  raw_text        text not null default '',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists applications_job_id_idx on public.applications (job_id);
create index if not exists applications_student_id_idx on public.applications (student_id);
create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists jobs_created_at_idx on public.jobs (created_at desc);
create index if not exists parsed_resumes_student_id_idx on public.parsed_resumes (student_id);

-- ---------------------------------------------------------------------------
-- Helpers and triggers
-- ---------------------------------------------------------------------------

-- SECURITY DEFINER so admin checks inside policies do not recurse through
-- the policies on public.profiles.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists jobs_set_updated_at on public.jobs;
create trigger jobs_set_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

drop trigger if exists parsed_resumes_set_updated_at on public.parsed_resumes;
create trigger parsed_resumes_set_updated_at
  before update on public.parsed_resumes
  for each row execute function public.set_updated_at();

-- Create a profile automatically for every new auth user. The role comes from
-- sign-up metadata ("role": "admin") and defaults to student.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    case when new.raw_user_meta_data ->> 'role' = 'admin' then 'admin' else 'student' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Students must never be able to promote themselves.
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only admins can change a role';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_change on public.profiles;
create trigger profiles_prevent_role_change
  before update on public.profiles
  for each row execute function public.prevent_role_change();

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.profiles       enable row level security;
alter table public.jobs           enable row level security;
alter table public.applications   enable row level security;
alter table public.resumes        enable row level security;
alter table public.parsed_resumes enable row level security;

-- profiles ------------------------------------------------------------------
drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select to authenticated
  using (id = auth.uid());

drop policy if exists "profiles: admins read all" on public.profiles;
create policy "profiles: admins read all" on public.profiles
  for select to authenticated
  using (public.is_admin());

drop policy if exists "profiles: insert own" on public.profiles;
create policy "profiles: insert own" on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "profiles: admins update all" on public.profiles;
create policy "profiles: admins update all" on public.profiles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- jobs ----------------------------------------------------------------------
drop policy if exists "jobs: everyone signed in can read" on public.jobs;
create policy "jobs: everyone signed in can read" on public.jobs
  for select to authenticated
  using (true);

drop policy if exists "jobs: admins write" on public.jobs;
create policy "jobs: admins write" on public.jobs
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- applications --------------------------------------------------------------
drop policy if exists "applications: students read own" on public.applications;
create policy "applications: students read own" on public.applications
  for select to authenticated
  using (student_id = auth.uid());

drop policy if exists "applications: admins read all" on public.applications;
create policy "applications: admins read all" on public.applications
  for select to authenticated
  using (public.is_admin());

drop policy if exists "applications: students apply for themselves" on public.applications;
create policy "applications: students apply for themselves" on public.applications
  for insert to authenticated
  with check (student_id = auth.uid());

drop policy if exists "applications: students withdraw own" on public.applications;
create policy "applications: students withdraw own" on public.applications
  for delete to authenticated
  using (student_id = auth.uid());

drop policy if exists "applications: admins manage all" on public.applications;
create policy "applications: admins manage all" on public.applications
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- resumes -------------------------------------------------------------------
drop policy if exists "resumes: students manage own" on public.resumes;
create policy "resumes: students manage own" on public.resumes
  for all to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

drop policy if exists "resumes: admins read all" on public.resumes;
create policy "resumes: admins read all" on public.resumes
  for select to authenticated
  using (public.is_admin());

-- parsed_resumes ------------------------------------------------------------
drop policy if exists "parsed_resumes: students manage own" on public.parsed_resumes;
create policy "parsed_resumes: students manage own" on public.parsed_resumes
  for all to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

drop policy if exists "parsed_resumes: admins read all" on public.parsed_resumes;
create policy "parsed_resumes: admins read all" on public.parsed_resumes
  for select to authenticated
  using (public.is_admin());

-- Column-level grants: students may edit their own profile fields, but the
-- "role" column is not grantable to them at all.
grant select on public.profiles to authenticated;
grant insert on public.profiles to authenticated;
grant update (name, branch, year, preferred_location, skills, preferred_roles, updated_at)
  on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- Storage: private bucket for resume files, one folder per student
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false,
  5242880, -- 5 MB
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "resumes bucket: students manage own folder" on storage.objects;
create policy "resumes bucket: students manage own folder" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "resumes bucket: admins read all" on storage.objects;
create policy "resumes bucket: admins read all" on storage.objects
  for select to authenticated
  using (bucket_id = 'resumes' and public.is_admin());
