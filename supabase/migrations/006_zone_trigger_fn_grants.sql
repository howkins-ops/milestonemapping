-- ============================================================
-- 006_zone_trigger_fn_grants — tighten trigger function grants
-- Trigger functions fire regardless of the caller's EXECUTE
-- privilege (checked at trigger creation, by owner postgres),
-- so authenticated/service-facing execute is unnecessary.
-- Clears "authenticated_security_definer_function_executable"
-- advisor warnings for the three az_trg_* functions.
-- ============================================================

revoke execute on function public.az_trg_reaction_notify() from public, anon, authenticated;
revoke execute on function public.az_trg_comment_notify() from public, anon, authenticated;
revoke execute on function public.az_trg_message_notify() from public, anon, authenticated;
