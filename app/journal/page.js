-- ============================================================
-- LAW JOURNAL — submissions with pending/published workflow
-- Run this in Supabase Dashboard > SQL Editor > New Query
-- ============================================================

create table if not exists journal_submissions (
  id uuid primary key default gen_random_uuid(),
  slug text unique,                    -- set only when published
  title text not null,
  author_name text not null,
  author_email text not null,
  category text not null default 'Aviation Law',
  abstract text not null,
  body text,                           -- full article text, optional if attaching a file
  attachment_url text,                 -- optional uploaded PDF/DOCX
  status text not null default 'pending', -- pending, published, rejected
  submitted_at timestamptz not null default now(),
  published_at timestamptz,
  reviewed_by uuid references profiles(id)
);

alter table journal_submissions enable row level security;

-- Anyone (including anonymous visitors) can submit
create policy "journal_insert_anyone" on journal_submissions
  for insert with check (true);

-- Anyone can read published entries; admins can read everything (including pending)
create policy "journal_read_published_or_admin" on journal_submissions
  for select using (status = 'published' or is_admin());

-- Only admins can update (approve/reject) or delete
create policy "journal_admin_update" on journal_submissions
  for update using (is_admin());
create policy "journal_admin_delete" on journal_submissions
  for delete using (is_admin());