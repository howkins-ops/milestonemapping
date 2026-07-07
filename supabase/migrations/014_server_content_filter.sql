-- ═══════════════════════════════════════════════════════════════════════
-- 014 · SERVER-SIDE CONTENT FILTER
-- Mirrors src/lib/contentFilter.js in Postgres so the Guideline 1.2 filter
-- can't be bypassed by hitting PostgREST directly with the anon key.
-- Scope stays narrow (slurs, CSAM terms, direct violent threats) — everyday
-- profanity is allowed at the app's mature rating.
-- ═══════════════════════════════════════════════════════════════════════

create or replace function public.az_is_objectionable(p_text text)
returns boolean
language plpgsql immutable
as $$
declare
  clean text;
  compacted text;
  run text[];
  patterns text[] := array[
    -- hate slurs (leet-speak normalized below: $→s, @→a, separators stripped)
    '\mn[i1]gg+[ae3]r?s?\M',
    '\mf[a4]gg?[o0]ts?\M',
    '\mk[i1]kes?\M',
    '\msp[i1]cs?\M',
    '\mch[i1]nks?\M',
    '\mwetbacks?\M',
    '\mtr[a4]nn(y|ies)\M',
    '\mr[e3]t[a4]rds?\M',
    -- sexual exploitation of minors
    'child\s*p[o0]rn',
    '\mp[e3]d[o0](phile|s)?\M',
    '\mloli(con)?\M',
    -- direct violent threats
    '\mkill\s+(you|your|yourself|urself|ur\s*self)\M',
    '\mkys\M',
    '\mgo\s+die\M',
    '\mrape\s+(you|your|her|him|them)\M'
  ];
  pat text;
begin
  if p_text is null or p_text = '' then
    return false;
  end if;

  -- normalize: lowercase, leet, strip separators, collapse whitespace
  clean := lower(p_text);
  clean := replace(clean, '$', 's');
  clean := replace(clean, '@', 'a');
  clean := regexp_replace(clean, '[.\-_*+~^|]', '', 'g');
  clean := regexp_replace(clean, '\s+', ' ', 'g');

  foreach pat in array patterns loop
    if clean ~ pat then
      return true;
    end if;
  end loop;

  -- spaced-out evasion ("f a g g 0 t"): compact runs of 3+ single-char
  -- tokens and re-check with boundary-free patterns (mirrors the JS filter)
  for run in select regexp_matches(clean, '(\m\w( \w){2,}\M)', 'g') loop
    compacted := replace(run[1], ' ', '');
    foreach pat in array patterns loop
      if compacted ~ replace(replace(pat, '\m', ''), '\M', '') then
        return true;
      end if;
    end loop;
  end loop;

  return false;
end;
$$;

create or replace function public.az_block_objectionable()
returns trigger
language plpgsql
as $$
declare
  offending text;
begin
  if tg_table_name = 'feed_events' then
    -- scan every string value in the payload (declarations, captions, etc.)
    select string_agg(value, ' ') into offending
    from jsonb_each_text(coalesce(new.payload, '{}'::jsonb));
  else
    offending := new.body;
  end if;

  if public.az_is_objectionable(offending) then
    raise exception 'content_blocked' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_filter_messages on public.messages;
create trigger trg_filter_messages
  before insert or update on public.messages
  for each row execute function public.az_block_objectionable();

drop trigger if exists trg_filter_comments on public.comments;
create trigger trg_filter_comments
  before insert or update on public.comments
  for each row execute function public.az_block_objectionable();

drop trigger if exists trg_filter_feed_events on public.feed_events;
create trigger trg_filter_feed_events
  before insert or update on public.feed_events
  for each row execute function public.az_block_objectionable();
