-- ============================================================
-- ACHIEVERS LAW HUB — SUPABASE SCHEMA
-- Run this once in Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. PROFILES (extends Supabase's built-in auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'student', -- 'student' or 'admin'
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever someone signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 2. COURSES + LESSONS
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  blurb text,
  part text, -- e.g. "I", "II" for display ordering
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  body text,               -- written content (mixed: yours or admin-authored)
  attachment_url text,     -- optional uploaded file (pdf/docx) from Supabase Storage
  position int not null default 0
);

create table if not exists quiz_questions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  question text not null,
  options jsonb not null,   -- array of strings
  correct_index int not null,
  position int not null default 0
);

create table if not exists course_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  completed_lesson_ids jsonb not null default '[]',
  quiz_passed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- 3. ARTICLES
create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  tag text,
  excerpt text,
  body text,
  attachment_url text,      -- optional uploaded source document
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- 4. CASE LAW EXPLAINERS
create table if not exists case_law (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  area text,
  summary text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- 5. RESEARCHER ENGAGEMENT REQUESTS
create table if not exists researcher_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  client_name text not null,
  email text not null,
  topic text not null,
  duration text not null,
  description text not null,
  status text not null default 'pending', -- pending, quoted, in-progress, delivered, paid
  fee text,
  created_at timestamptz not null default now()
);

-- 6. TUTORIAL BOOKINGS
create table if not exists tutorial_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  student_name text not null,
  email text not null,
  subject text not null,
  student_type text not null, -- 'nigerian' or 'international'
  hours numeric not null,
  currency text not null,
  rate numeric not null,
  total numeric not null,
  preferred_time text not null,
  status text not null default 'pending', -- pending, confirmed, completed, paid
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table courses enable row level security;
alter table lessons enable row level security;
alter table quiz_questions enable row level security;
alter table course_progress enable row level security;
alter table articles enable row level security;
alter table case_law enable row level security;
alter table researcher_requests enable row level security;
alter table tutorial_bookings enable row level security;

-- Helper: is the current user an admin?
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- Profiles: users see their own; admins see all
create policy "profiles_select_own_or_admin" on profiles
  for select using (auth.uid() = id or is_admin());
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- Public content (courses/lessons/quiz/articles/case_law): readable by any
-- signed-in user, writable only by admins.
create policy "courses_read_all" on courses for select using (auth.uid() is not null);
create policy "courses_admin_write" on courses for all using (is_admin()) with check (is_admin());

create policy "lessons_read_all" on lessons for select using (auth.uid() is not null);
create policy "lessons_admin_write" on lessons for all using (is_admin()) with check (is_admin());

create policy "quiz_read_all" on quiz_questions for select using (auth.uid() is not null);
create policy "quiz_admin_write" on quiz_questions for all using (is_admin()) with check (is_admin());

create policy "articles_read_all" on articles for select using (auth.uid() is not null);
create policy "articles_admin_write" on articles for all using (is_admin()) with check (is_admin());

create policy "case_law_read_all" on case_law for select using (auth.uid() is not null);
create policy "case_law_admin_write" on case_law for all using (is_admin()) with check (is_admin());

-- Progress: users manage only their own; admins can view all
create policy "progress_owner" on course_progress
  for all using (auth.uid() = user_id or is_admin())
  with check (auth.uid() = user_id);

-- Researcher requests: user can insert + see their own; admin sees/edits all
create policy "requests_insert_own" on researcher_requests
  for insert with check (auth.uid() = user_id);
create policy "requests_select_own_or_admin" on researcher_requests
  for select using (auth.uid() = user_id or is_admin());
create policy "requests_admin_update" on researcher_requests
  for update using (is_admin());

-- Tutorial bookings: same pattern
create policy "bookings_insert_own" on tutorial_bookings
  for insert with check (auth.uid() = user_id);
create policy "bookings_select_own_or_admin" on tutorial_bookings
  for select using (auth.uid() = user_id or is_admin());
create policy "bookings_admin_update" on tutorial_bookings
  for update using (is_admin());

-- ============================================================
-- STORAGE (run in Storage section, or via SQL if your project allows it)
-- Create a bucket named "uploads" (public read) from the Supabase
-- Dashboard > Storage > New Bucket. Then run:
-- ============================================================
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

create policy "uploads_public_read" on storage.objects
  for select using (bucket_id = 'uploads');
create policy "uploads_admin_write" on storage.objects
  for insert with check (bucket_id = 'uploads' and is_admin());
create policy "uploads_admin_update" on storage.objects
  for update using (bucket_id = 'uploads' and is_admin());
create policy "uploads_admin_delete" on storage.objects
  for delete using (bucket_id = 'uploads' and is_admin());

-- ============================================================
-- MAKE YOURSELF ADMIN
-- After you sign up on the live site with adeoluwaolodude@gmail.com,
-- run this once (see README step 6):
-- ============================================================
-- update profiles set role = 'admin' where email = 'adeoluwaolodude@gmail.com';

-- ============================================================
-- SEED CONTENT — mixed placeholder + slots for your real papers.
-- Edit the body text below, or just replace it later from the Admin
-- dashboard once the site is live (Admin > Courses/Articles > Edit).
-- ============================================================
insert into courses (slug, title, blurb, part) values
  ('aviation-law', 'Foundations of Nigerian Aviation Law', 'How Nigerian aviation law is built from international convention down to carrier conduct on the tarmac.', 'I'),
  ('odr-essentials', 'Online Dispute Resolution Essentials', 'A grounded introduction to ODR, borrowing lessons from Singapore and Brazil for a Nigerian context.', 'II')
on conflict (slug) do nothing;

insert into lessons (course_id, title, body, position)
select id, 'Sources of Aviation Law in Nigeria',
  'Placeholder lesson text — replace from the Admin dashboard with an excerpt from your own published research.', 1
from courses where slug = 'aviation-law'
on conflict do nothing;

insert into articles (slug, title, tag, excerpt, body) values
  ('oscola', 'Understanding OSCOLA Citation for Nigerian Legal Writing', 'Legal Writing',
   'OSCOLA was not built with Nigerian law reports in mind, so adapting it well means knowing where the standard bends.',
   'Placeholder article body — replace from the Admin dashboard, or upload your original paper as an attachment.')
on conflict (slug) do nothing;
