-- 019 — correct the founding-admin seed.
--
-- 015_report_intake.sql seeded admin on 'coachhowkins@gmail.com' (double h).
-- The account that actually exists — and the one handed to App Review — is
-- 'coachowkins@gmail.com' (single h). The consequence of the typo is that the
-- Reports Inbox renders nothing for the person reviewing the app, which reads
-- as an unmoderated UGC surface under Guideline 1.2.
--
-- Idempotent: safe to re-run, and safe if the misspelled account never existed.

update public.zone_members set is_admin = true
where user_id in (
  select id from auth.users
  where lower(email) in (
    'howkins.ops@gmail.com',
    'coachowkins@gmail.com',
    'coachhowkins@gmail.com'  -- kept: harmless if unused, avoids a second fix
  )
);
