# Achievers Law Hub — Setup & Deployment

A real Next.js site with Supabase-backed email/password authentication,
content management (with file uploads), an admin dashboard, and email
notifications sent to your inbox.

## What's real here vs. what to know

- **Auth**: real email/password via Supabase Auth (passwords are hashed and
  stored securely by Supabase, not by this code).
- **File uploads**: real, via Supabase Storage — admins can attach PDFs/DOCX
  to articles and lessons.
- **Email notifications**: real, via Resend — sent to whatever address you
  set as `ADMIN_NOTIFY_EMAIL` (yours: adeoluwaolodude@gmail.com) whenever a
  researcher request or tutorial booking comes in.
- **Not included**: reading your actual Gmail inbox inside the dashboard.
  That's a different feature (Google OAuth + Gmail API) and would need its
  own setup — ask me if you want that added later.

## Step 1 — Create a Supabase project

1. Go to supabase.com → New Project. Pick any name/region, set a database password (save it).
2. Once created, go to **SQL Editor** → New Query, paste the entire contents of `supabase/schema.sql`, and run it.
   This creates all tables, security rules, and the `uploads` storage bucket.
3. Go to **Project Settings → API**. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret — never put it in client code)

## Step 2 — Create a Resend account (for email notifications)

1. Go to resend.com → sign up → API Keys → create a key → copy it into `RESEND_API_KEY`.
2. Until you verify your own domain on Resend, emails must be sent from
   `onboarding@resend.dev` (already set in `.env.example`). To send from
   `notifications@achieverslawhub.com` later, verify that domain in Resend's
   dashboard, then update `NOTIFY_FROM_EMAIL`.

## Step 3 — Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values from Steps 1–2.

## Step 4 — Run locally

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Step 5 — Sign up and make yourself admin

1. On the running site, click **Sign in → Create one**, and sign up with
   `adeoluwaolodude@gmail.com`.
2. Check that inbox for Supabase's confirmation email and click the link.
3. Back in Supabase → SQL Editor, run:
   ```sql
   update profiles set role = 'admin' where email = 'adeoluwaolodude@gmail.com';
   ```
4. Sign in again — you'll now see an **Admin Dashboard** link, and the
   `/admin` route will work (add courses, articles, case law, review
   requests/bookings, upload documents).

## Step 6 — Deploy to Vercel

1. Push this project to a GitHub repository.
2. Go to vercel.com → New Project → import that repo.
3. In the Vercel project's **Settings → Environment Variables**, add all six
   variables from your `.env.local`.
4. Deploy. Vercel gives you a live URL (e.g. `achievers-law-hub.vercel.app`);
   you can attach a custom domain afterward under **Settings → Domains**.
5. Optional: set `NEXT_PUBLIC_SITE_URL` to your live URL so notification
   emails link back to the right admin dashboard.

## Adding your real content

Once you're signed in as admin, go to `/admin` → Articles / Courses tabs.
You can paste your own paper text directly into the body field, and/or
attach the original PDF/DOCX as a download — that's the "mixed" content
model: original writing plus your uploaded source documents, side by side.

## A note on the admin passcode from the earlier prototype

There is no separate admin passcode anymore — access to `/admin` is now
controlled by the `role = 'admin'` flag on your real account, enforced by
both the database (Row Level Security) and the site's middleware. That's
the real-security version of what the in-chat prototype was faking.
