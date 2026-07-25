-- Mentra schema: users profile, students, sessions, notes, board strokes, storage
-- Run in Supabase SQL editor or via CLI.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('tutor', 'student');
create type public.session_status as enum ('scheduled', 'live', 'completed', 'cancelled');

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  avatar_url text,
  role public.user_role not null default 'tutor',
  primary_subject text,
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.profiles (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  full_name text not null,
  email text,
  avatar_url text,
  subjects text[] not null default '{}',
  notes text,
  progress int not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.profiles (id) on delete cascade,
  student_id uuid references public.students (id) on delete set null,
  title text not null,
  topic text,
  scheduled_at timestamptz not null,
  started_at timestamptz,
  ended_at timestamptz,
  duration_minutes int default 60,
  status public.session_status not null default 'scheduled',
  guest_join_code text unique,
  board_snapshot_url text,
  agenda text,
  created_at timestamptz not null default now()
);

create table if not exists public.session_notes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.study_sessions (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.board_strokes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.study_sessions (id) on delete cascade,
  author_id text not null,
  points jsonb not null,
  color text not null,
  width numeric not null,
  tool text not null check (tool in ('pen', 'eraser')),
  created_at timestamptz not null default now()
);

create index if not exists students_tutor_id_idx on public.students (tutor_id);
create index if not exists sessions_tutor_id_idx on public.study_sessions (tutor_id);
create index if not exists sessions_guest_code_idx on public.study_sessions (guest_join_code);
create index if not exists board_strokes_session_id_idx on public.board_strokes (session_id);

alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.study_sessions enable row level security;
alter table public.session_notes enable row level security;
alter table public.board_strokes enable row level security;

-- Profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Students: tutors manage their own
create policy "Tutors manage own students"
  on public.students for all
  using (auth.uid() = tutor_id)
  with check (auth.uid() = tutor_id);

create policy "Linked students can view themselves"
  on public.students for select
  using (auth.uid() = user_id);

-- Sessions
create policy "Tutors manage own sessions"
  on public.study_sessions for all
  using (auth.uid() = tutor_id)
  with check (auth.uid() = tutor_id);

create policy "Students view participating sessions"
  on public.study_sessions for select
  using (
    exists (
      select 1 from public.students st
      where st.id = study_sessions.student_id
        and st.user_id = auth.uid()
    )
  );

-- Guest access via join code: allow anon select of limited session metadata by code
create policy "Anon can resolve guest join codes"
  on public.study_sessions for select
  to anon
  using (guest_join_code is not null);

-- Notes
create policy "Tutors manage notes on own sessions"
  on public.session_notes for all
  using (
    exists (
      select 1 from public.study_sessions s
      where s.id = session_notes.session_id
        and s.tutor_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.study_sessions s
      where s.id = session_notes.session_id
        and s.tutor_id = auth.uid()
    )
  );

create policy "Students read notes for their sessions"
  on public.session_notes for select
  using (
    exists (
      select 1
      from public.study_sessions s
      join public.students st on st.id = s.student_id
      where s.id = session_notes.session_id
        and st.user_id = auth.uid()
    )
  );

-- Board strokes: tutors + participating students
create policy "Participants manage board strokes"
  on public.board_strokes for all
  using (
    exists (
      select 1 from public.study_sessions s
      left join public.students st on st.id = s.student_id
      where s.id = board_strokes.session_id
        and (s.tutor_id = auth.uid() or st.user_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.study_sessions s
      left join public.students st on st.id = s.student_id
      where s.id = board_strokes.session_id
        and (s.tutor_id = auth.uid() or st.user_id = auth.uid())
    )
  );

-- Storage bucket for snapshots
insert into storage.buckets (id, name, public)
values ('board-snapshots', 'board-snapshots', true)
on conflict (id) do nothing;

create policy "Authenticated users upload snapshots"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'board-snapshots');

create policy "Public read snapshots"
  on storage.objects for select
  to public
  using (bucket_id = 'board-snapshots');

-- Realtime
alter publication supabase_realtime add table public.study_sessions;
alter publication supabase_realtime add table public.board_strokes;
