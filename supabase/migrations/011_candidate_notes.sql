-- Migration 011: candidate_notes table for internal notes on candidates
create table if not exists public.candidate_notes (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  company_id uuid not null references public.companies(id) on delete cascade,
  author_id uuid not null,
  author_name text,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index idx_candidate_notes_candidate on public.candidate_notes(candidate_id);
create index idx_candidate_notes_company on public.candidate_notes(company_id);
create index idx_candidate_notes_application on public.candidate_notes(application_id);

-- RLS
alter table public.candidate_notes enable row level security;

create policy "Company members can view notes"
  on public.candidate_notes for select
  using (
    company_id in (
      select company_id from public.company_users where user_id = auth.uid()
    )
  );

create policy "Company members can insert notes"
  on public.candidate_notes for insert
  with check (
    company_id in (
      select company_id from public.company_users where user_id = auth.uid()
    )
  );

create policy "Authors can update their notes"
  on public.candidate_notes for update
  using (author_id = auth.uid());

create policy "Authors can delete their notes"
  on public.candidate_notes for delete
  using (author_id = auth.uid());
