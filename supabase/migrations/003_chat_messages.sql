-- Persist session chat for realtime catch-up + Prisma CRUD
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.study_sessions (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  author_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_session_id_idx on public.chat_messages (session_id);

alter table public.chat_messages enable row level security;

create policy "Participants manage chat messages"
  on public.chat_messages for all
  using (
    exists (
      select 1 from public.study_sessions s
      left join public.students st on st.id = s.student_id
      where s.id = chat_messages.session_id
        and (s.tutor_id = auth.uid() or st.user_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.study_sessions s
      left join public.students st on st.id = s.student_id
      where s.id = chat_messages.session_id
        and (s.tutor_id = auth.uid() or st.user_id = auth.uid())
    )
  );

alter publication supabase_realtime add table public.chat_messages;
