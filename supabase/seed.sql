-- Demo seed (run after creating auth users in Supabase Dashboard)
-- Replace the UUIDs below with real auth.users ids after signup.

-- Example:
-- Tutor email: amelia@mentra.app
-- Student email: daniel@student.app

-- insert into public.profiles (id, full_name, email, role, primary_subject)
-- values
--   ('00000000-0000-0000-0000-000000000001', 'Amelia Rose', 'amelia@mentra.app', 'tutor', 'Mathematics'),
--   ('00000000-0000-0000-0000-000000000002', 'Daniel Miller', 'daniel@student.app', 'student', null);

-- insert into public.students (id, tutor_id, user_id, full_name, email, subjects, notes, progress)
-- values
--   ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Daniel Miller', 'daniel@student.app', array['Calculus','A-Level Mathematics'], 'Strong algebra foundations.', 82),
--   ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', null, 'Sophia Khan', 'sophia@student.app', array['Chemistry'], 'Needs mechanism practice.', 68),
--   ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', null, 'James Murphy', 'james@student.app', array['Physics'], 'Visual learner.', 61);

-- insert into public.study_sessions (id, tutor_id, student_id, title, topic, scheduled_at, started_at, duration_minutes, status, guest_join_code)
-- values
--   ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Calculus — Integration by parts', 'Integration by parts', date_trunc('day', now()) + interval '10 hours', date_trunc('day', now()) + interval '10 hours', 60, 'live', 'CALC32');

-- Until Supabase is connected, the web app uses built-in demo data automatically.
select 'Mentra seed placeholder ready — use demo mode or wire auth user ids.' as info;
