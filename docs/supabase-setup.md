# Supabase setup

## Environment variables checklist

Add these to `.env` (and to your hosting provider's environment settings).

| Variable | Where it is used | Required | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + server | Yes | Project URL, e.g. `https://abcdefgh.supabase.co`. Found in Project settings → API. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + server | Yes | Public anon/publishable key. Safe to expose: row-level security does the enforcement. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only (seed script) | No | Bypasses RLS. Never expose to the browser and never prefix it with `NEXT_PUBLIC_`. |
| `DATABASE_URL` | Local tooling only | No | Left over from the starter template; unused by the Supabase data layer. |

Until the first two are set, `/lib/api.ts` automatically falls back to the
local demo data layer, so the app keeps running.

## Steps

1. Create a Supabase project.
2. Run `supabase/migrations/0001_init.sql` in the SQL editor (or
   `supabase db push`). It creates the tables, triggers, RLS policies, and the
   private `resumes` storage bucket.
3. Copy the URL and anon key into `.env`.
4. Optional: add `SUPABASE_SERVICE_ROLE_KEY` and run `node scripts/seed-supabase.mjs`
   to create a demo admin (`admin@aijobfinder.com` / `admin123`), three students
   (password `student123`), jobs, and applications.
5. Auth → Providers: keep email/password enabled. For the demo, turn off
   "Confirm email" so seeded logins work immediately.
6. Restart `npm run dev` so the new environment variables are picked up.

## How authorization works

- Every browser query runs as the signed-in user; policies decide the rest.
- `public.is_admin()` is `SECURITY DEFINER` so admin checks inside policies do
  not recurse through the policies on `profiles`.
- Students: read all jobs, read/write only their own profile, applications,
  resume, and parsed resume.
- Admins: read everything, and are the only ones who can write jobs.
- Students cannot change their own `role`: the column is excluded from the
  column-level `UPDATE` grant and a trigger rejects the change.
- Resume files live in the private `resumes` bucket under `<user-id>/<file>`;
  storage policies restrict each student to their own folder.

## Resume parsing

`POST /api/resume/parse` (Node runtime) receives the file with the user's
bearer token, uploads it to Storage, extracts text with **pdf-parse** (PDF) or
**mammoth** (DOCX), matches skills against the alias dictionary in
`/lib/skills.ts`, and applies simple patterns for name, degree, college, and
graduation year. It always returns a result — blank fields when nothing
matched — so the editable form on `/resume` can be filled in by hand.
