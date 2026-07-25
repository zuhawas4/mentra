-- Tutor payment invoices (tracked in Mentra; not a payment processor)
create type public.payment_status as enum ('draft', 'sent', 'paid', 'overdue', 'cancelled');

create table if not exists public.payment_invoices (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.profiles (id) on delete cascade,
  student_id uuid references public.students (id) on delete set null,
  student_name text not null,
  title text not null,
  amount_cents int not null check (amount_cents >= 0),
  currency text not null default 'USD',
  status public.payment_status not null default 'draft',
  due_at timestamptz,
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payment_invoices_tutor_id_idx on public.payment_invoices (tutor_id);

alter table public.payment_invoices enable row level security;

create policy "Tutors manage own invoices"
  on public.payment_invoices for all
  using (auth.uid() = tutor_id)
  with check (auth.uid() = tutor_id);

alter publication supabase_realtime add table public.payment_invoices;
