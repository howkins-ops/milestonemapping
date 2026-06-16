# 25-Phase Comprehensive Build Plan
## Milestone Mapping — The Diamond Path: An Alchemist Quest

**Foundation documents:** `ULTIMATE_DEVELOPER_STORY_GUIDE.md` · `COACHING_DOCS_INDEX.md` · `mapquest-data-model.ts` · `00_MapQuest_Build-Spec.md`

**Build philosophy:**
> Build the story first. Build the mechanics second. Build the UI last.
> Every phase must serve the transformation. If it doesn't move the Seeker closer to Essence, cut it.

---

## THE 25 PHASES AT A GLANCE

| # | Phase Name | Category | Output |
|---|---|---|---|
| 1 | Story Bible Finalization | Foundation | Complete narrative canon |
| 2 | Character Bible | Foundation | All character specs + voice |
| 3 | Database Architecture | Foundation | Full Supabase schema |
| 4 | Design System | Foundation | Colors, type, motion, tokens |
| 5 | World Asset Creation | Foundation | All visual world assets |
| 6 | Auth + Player Profile | Core Systems | Login, onboarding, Day One Snapshot |
| 7 | Quest Map System | Core Systems | 19-chapter interactive map |
| 8 | Shadow Encounter Engine | Core Systems | 5 shadows + trigger logic |
| 9 | Essence Return System | Core Systems | 5 Essence powers + selection UI |
| 10 | Mentor Dialogue System | Core Systems | 3 mentor flows + question engine |
| 11 | Exercise Engine | Core Systems | 18 core exercises + Ch 19 epilogue flow |
| 12 | Daily Proof System | Game Loop | Daily check-in + streak logic |
| 13 | Milestone Progress Map | Game Loop | Visual milestone tracker |
| 14 | Weekly Review System | Game Loop | Weekly action reset + reflection |
| 15 | Awareness Mirror | Game Loop | Shadow detection + pattern recognition |
| 16 | Prologue + Chapters 1–5 | Story Arc | Dream → Declaration → Forest of Lack |
| 17 | Chapters 6–10 | Story Arc | Challenger → Proof Forge → Neon Chapel → Clock Desert → Tower |
| 18 | Chapters 11–15 | Story Arc | Loop Chamber → Change Compass → Ruins → Oasis → False Gold |
| 19 | Chapters 16–19 | Story Arc | Shadow Citadel → Final Stand → Treasure Mirror → Return Home |
| 20 | Reward + Ceremony System | Polish | Completion animations, badges, milestone gifts |
| 21 | Life Purpose Reveal | Climax | The Chapter 18 mirror moment |
| 22 | Notification + Habit Layer | Polish | Push, email, streak guards |
| 23 | Audio + Cinematic Layer | Polish | Ambient sound, narration, transition cinematics |
| 24 | Mobile + PWA | Polish | Responsive, installable, offline-capable |
| 25 | QA · Beta · Launch | Launch | Full test run, soft launch, post-launch roadmap |

---

---

# PHASE 1 — Story Bible Finalization

**Category:** Foundation
**Duration:** 3–5 days
**Owner:** Creative lead (Jon) + Developer lead

## What Gets Built

The story bible is the single source of truth for every piece of writing in the app — every narrative line, mentor question, shadow voice, scene description, and chapter heading. No UI gets built without this locked.

## Deliverables

### 1.1 — Canonical Chapter Titles & Descriptions (19 + Prologue)

Write the final in-app version of each chapter title, one-line teaser, and opening scene narration.

Format for each:
```
Chapter #:    [Title]
Gate Text:    [What appears on the locked gate — 1 sentence]
Opening Line: [First sentence the player reads when chapter unlocks]
Lesson Line:  [What the chapter teaches — used in completion summary]
```

Full chapter list to write:
- Prologue: The Father's Warning
- Chapter 1: The Dream That Would Not Leave
- Chapter 2: The Anchor Mentor and the Why
- Chapter 3: The Future Map
- Chapter 4: The Declaration Gate
- Chapter 5: The Forest of Lack (Broke King)
- Chapter 6: The Challenger Mentor
- Chapter 7: The Proof Forge
- Chapter 8: The Neon Chapel (Addict Saint)
- Chapter 9: The Clock Desert
- Chapter 10: The Tower of Unspoken Words (Silent Prophet)
- Chapter 11: The Loop Chamber
- Chapter 12: The Change Compass
- Chapter 13: The Ruins of What Happened (Raging Victim)
- Chapter 14: The Oasis of Being
- Chapter 15: The False Gold Market (Naive Warrior)
- Chapter 16: The Shadow Citadel
- Chapter 17: The Final Stand
- Chapter 18: The Treasure Mirror
- Chapter 19: The Return Home

### 1.2 — Father Warning Scene Script

Full script for the Prologue cutscene.

Format:
```
[VISUAL: describe scene]
FATHER: "..."
[PLAYER receives: blank map, small mirror, warning]
[NARRATION: ...]
```

### 1.3 — World Location Descriptions

For each map zone, write:
- Visual description (used by artist/AI image generation)
- Emotional tone (what the Seeker feels entering this zone)
- The symbolic meaning of the location

Locations:
- The Home (starting point)
- The Forest of Lack
- The Neon Chapel
- The Tower of Unspoken Words
- The Clock Desert
- The Ruins of What Happened
- The False Gold Market
- The Proof Forge
- The Oasis of Being
- The Shadow Citadel
- The Final Stand cliff
- The Treasure Mirror chamber
- The Return Road

### 1.4 — Story Canon Rules

Lock these decisions so the build stays consistent:

| Decision | Canon Answer |
|---|---|
| Tense | Present tense, second person ("You enter the forest") |
| Player name | "The Seeker" — never "user" or "player" |
| Shadow voice | First-person, present tense, italicized ("*You are behind.*") |
| Mentor voice | Questions only, never statements |
| Essence voice | Declarative, bold ("**Power chooses.**") |
| Chapter unlock feel | Gate opens, not level up |
| Proof action label | "Proof" not "task" or "action" |
| Milestone label | "Map Gate" not "level" or "achievement" |

## Definition of Done

- [ ] All 20 chapter scenes written in final voice
- [ ] Father Warning script complete
- [ ] All 13 world location descriptions written
- [ ] Story canon rules locked and shared with full team
- [ ] Story bible reviewed and approved by Jon

---

---

# PHASE 2 — Character Bible

**Category:** Foundation
**Duration:** 3 days
**Owner:** Creative lead + Visual designer

## What Gets Built

Every character in the story needs a complete profile: voice, appearance, symbolic meaning, what they represent psychologically, and the exact words they use. This gets built before any character art or dialogue is written.

## Deliverables

### 2.1 — The Seeker Profile

```
Name:           The Seeker
Represents:     The player / user
Starting state: Ambition without self-awareness
Ending state:   Essence-aligned, purpose-grounded
Visual:         Young figure, traveling cloak, carries a blank map and small mirror
Voice:          Never speaks (player IS the Seeker — second person narration)
```

### 2.2 — The Father Profile

```
Name:           The Father / The Grounded One
Role:           First mentor figure, prologue only
Represents:     Wisdom before experience
Teaching:       The shadows are inside you
Visual:         Older, calm, weathered; holds a lantern not a weapon
Voice style:    Declarative, warm, measured
Sample lines:
  - "Do not hate the shadows. Do not worship them. Learn them."
  - "The map will not show the road until you declare where you are going."
  - "The mirror will not show your face. It will show who is controlling you."
Appears in:     Prologue, referenced again in Chapter 19
```

### 2.3 — Mentor 1: The Anchor Mentor

```
Name:           The Anchor Mentor / The Rooter
Role:           First major guide, appears in Ch 1, Ch 2, and Ch 3
Represents:     Life Purpose inquiry / Why beneath the goal
Coaching tools: Life Purpose, Futurability, Project Design From Future, Merlin Exercise
Visual:         Still, grounded presence; sits rather than walks; compass around neck
Voice style:    Only questions; never answers; Socratic
Sample lines:
  - "What are you really chasing?"
  - "If this goal were already complete, who would you become?"
  - "Is this a fix from survival, or a possibility from Essence?"
  - "What part of you feels called by this?"
When they appear: Ch 1 (first why session), Ch 2 (futureability), Ch 3 (Future Map)
```

### 2.4 — Mentor 2: The Challenger Mentor

```
Name:           The Challenger Mentor / The Mirror Holder
Role:           Second major guide, appears after first shadow encounter (Ch 6)
Represents:     Responsibility, ownership, At Cause
Coaching tools: Consequences of Choice, Declaration, Power of Promise, Responsibility-At Cause, Victim-At Effect
Visual:         Upright, intense, no-nonsense; holds a mirror not a weapon
Voice style:    Direct challenges from belief — not harsh, but unsparing
Sample lines:
  - "You can have your reasons, or you can have your quest."
  - "Where are you at effect?"
  - "What are you explaining instead of correcting?"
  - "What promise did you make?"
When they appear: Ch 6 (Challenger), Ch 7 (Proof Forge), referenced in Ch 12, Ch 13
```

### 2.5 — Mentor 3: The Alchemist Mentor / The Essence Mentor

```
Name:           The Alchemist Mentor / The Essence Keeper
Role:           Third major guide, appears mid-to-late journey; eventually revealed as the Seeker's higher self
Represents:     Shadow transmutation, Essence return, Being
Coaching tools: Coaching From Being, Coaching From Judgment vs Being, Listening Beyond Reaction, Self-Sabotage and Integrity, Re-Invention, Powerful Stands
Visual:         Ageless, partially translucent; surrounded by five glowing lights (Radiance/Love/Joy/Power/Majesty)
Voice style:    Questions that reveal the shadow; never names the shadow for the Seeker — always asks
Sample lines:
  - "What shadow is speaking right now?"
  - "What is it protecting?"
  - "What Essence is missing?"
  - "What would Love do here?"
  - "What proof action would make this Essence real?"
Reveal:         In Chapter 16, it becomes clear this mentor IS the Seeker's own higher Being
When they appear: Ch 11 (Alchemist Within), Ch 14 (Oasis of Being), Ch 16, Ch 17
```

### 2.6 — The Heartkeeper (Ch 14 sub-character)

```
Name:           The Heartkeeper
Role:           Guide of the Oasis of Being
Represents:     Self-compassion, coaching from Being vs judgment
Teaching:       You cannot shame yourself into transformation
Visual:         Soft light, still water nearby, no armor
Voice style:    Gentle, non-judgmental; mirrors without judgment
Sample lines:
  - "What would compassion say right now?"
  - "What part of you needs to be heard?"
  - "Can you listen without becoming reactive?"
```

### 2.7 — The Five Shadow Character Profiles

For each shadow, write:

**Format:**
```
Shadow Name:        [Name]
Encounter location: [World zone]
First impression:   [What the Seeker thinks they are]
True nature:        [What they actually are]
Voice lines (6):    [The exact thoughts they inject]
Attachment moment:  [When exactly the shadow latches on]
Control symptoms:   [List of behaviors when in control]
Essence return:     [Which Essence breaks the control]
Visual:             [Physical description for artist]
Color:              [Signature color in UI]
```

**Shadow 1: The Broke King**
```
Shadow Name:        The Broke King
Encounter location: The Forest of Lack
First impression:   A fallen ruler who needs help
True nature:        The Seeker's survival mechanism around money and scarcity
Voice lines:
  - "*You are behind.*"
  - "*You lost too much.*"
  - "*You cannot afford to fail.*"
  - "*You should already be further.*"
  - "*You are not safe yet.*"
  - "*You need money before you can be powerful.*"
Attachment moment:  The Seeker leaves the forest — the Broke King follows
Control symptoms:   Scarcity, shame, panic, comparison, fear of investing, obsession with outcome
Essence return:     Power
Visual:             Cracked throne of unpaid bills; crown broken; surrounded by old coins and empty chests
Color:              Deep amber / corroded gold (#B8860B)
```

**Shadow 2: The Addict Saint**
```
Shadow Name:        The Addict Saint
Encounter location: The Neon Chapel
First impression:   A kind, understanding holy figure who offers rest
True nature:        The part of the Seeker that escapes, numbs, and makes comfort holy
Voice lines:
  - "*You have worked hard.*"
  - "*You deserve relief.*"
  - "*You can face it tomorrow.*"
  - "*You are not avoiding — you are recovering.*"
  - "*You need comfort before you can continue.*"
  - "*Escape is compassion.*"
Attachment moment:  When the Seeker is tired and the chapel glows with warmth
Control symptoms:   Numbing, escaping, dopamine-seeking, calling avoidance "healing", shame cycle
Essence return:     Love
Visual:             Glowing chapel, neon religious imagery, soft and welcoming — but no exit visible
Color:              Neon pink / violet glow (#FF6EB4)
```

**Shadow 3: The Silent Prophet**
```
Shadow Name:        The Silent Prophet
Encounter location: The Tower of Unspoken Words
First impression:   A wise teacher full of wisdom he never shares
True nature:        The part that hides the Seeker's voice behind perfectionism and fear of judgment
Voice lines:
  - "*Not yet.*"
  - "*It is not ready.*"
  - "*You need more proof first.*"
  - "*What if they judge you?*"
  - "*What if nobody listens?*"
  - "*Silence is safer.*"
Attachment moment:  When the Seeker is about to speak, publish, or be seen
Control symptoms:   Hiding, perfectionism, delayed posting, not publishing, fear of visibility
Essence return:     Radiance
Visual:             Tall tower filled with unwritten books, blank pages, silent microphones; figure never opens mouth
Color:              Deep indigo / muted silver (#4B0082 / #C0C0C0)
```

**Shadow 4: The Raging Victim**
```
Shadow Name:        The Raging Victim
Encounter location: The Ruins of What Happened
First impression:   A wounded person who deserves validation
True nature:        The part that uses pain as a throne and blame as a shield
Voice lines:
  - "*Look what happened to you.*"
  - "*You should be further ahead.*"
  - "*They took from you.*"
  - "*You lost your chance.*"
  - "*You are allowed to stay stuck.*"
  - "*You are the way you are because of what happened.*"
Attachment moment:  When the Seeker is asked to own a consequence
Control symptoms:   Blame, resentment, drama, storytelling for agreement, waiting for rescue
Essence return:     Majesty
Visual:             Ruined city; broken statues; burned contracts; the figure stands at the center crowned in rubble
Color:              Crimson / ash grey (#8B0000 / #696969)
```

**Shadow 5: The Naive Warrior**
```
Shadow Name:        The Naive Warrior
Encounter location: The False Gold Market
First impression:   A bold, exciting figure who embodies courage
True nature:        The part that rushes, overtrusts, and mistakes urgency for courage
Voice lines:
  - "*Move now.*"
  - "*This is the one.*"
  - "*Trust them.*"
  - "*You are behind, so go faster.*"
  - "*You do not have time to think.*"
  - "*Courage means leap before you look.*"
Attachment moment:  When the Seeker feels behind and a shiny opportunity appears
Control symptoms:   Rushing, overtrusting, chasing shiny objects, skipping discernment, confusing panic with bravery
Essence return:     Joy
Visual:             Market full of shining doors, glittering promises, fast-talking figures; the Warrior runs toward everything
Color:              Bright yellow-gold / electric orange (#FFD700 / #FF8C00)
```

### 2.8 — The Five Essence Powers

For each Essence, write:

```
Essence Name:    [Name]
Power phrase:    [One line — what it gives]
Used against:    [Which shadow]
Visual:          [How it looks when activated in the UI]
Sound:           [Mood description for audio designer]
Player actions:  [What the player does when operating from this Essence]
Activation line: [The line that appears when Essence is chosen]
```

**Radiance**
```
Power phrase:    The power to be seen
Used against:    Silent Prophet
Visual:          Gold-white light emanating outward from the Seeker
Sound:           Clear bell tone, opening, lifting
Player actions:  Speak, post, publish, lead, sell, share, declare
Activation:      "I am no longer hiding from my calling."
```

**Love**
```
Power phrase:    The power to reconnect
Used against:    Addict Saint
Visual:          Warm rose-pink pulse, inward then outward
Sound:           Low hum, heart rhythm, warm resonance
Player actions:  Listen, heal shame, regulate, receive support, choose recovery
Activation:      "I give the part that escapes a safer place to land."
```

**Joy**
```
Power phrase:    The power of clean movement
Used against:    Naive Warrior
Visual:          Bright green-gold sparks, upward motion
Sound:           Playful chime sequence, light and quick
Player actions:  Create, move, discern, take clean action, make the journey light
Activation:      "Wisdom is not hesitation. Wisdom is clean movement."
```

**Power**
```
Power phrase:    The power of ownership
Used against:    Broke King
Visual:          Deep blue-white energy, grounded, stable
Sound:           Low bass resonance, settling, confident
Player actions:  Choose, lead, execute, track money, make decisions, keep promises
Activation:      "Money does not create power. Power creates the ability to hold money."
```

**Majesty**
```
Power phrase:    The power of identity
Used against:    Raging Victim
Visual:          Deep purple crown-light, upright posture
Sound:           Orchestral swell, dignified, spacious
Player actions:  Stand, set standards, tell the truth, own consequences, reclaim dignity
Activation:      "Pain may explain the wound. But pain cannot become the throne."
```

## Definition of Done

- [ ] Father profile complete with 6+ sample lines
- [ ] All 3 mentor profiles complete with voice samples and appearance notes
- [ ] Heartkeeper profile complete
- [ ] All 5 shadow profiles complete with 6 exact voice lines each
- [ ] All 5 Essence profiles complete with activation lines
- [ ] Character bible reviewed by Jon and locked

---

---

# PHASE 3 — Database Architecture

**Category:** Foundation
**Duration:** 3–4 days
**Owner:** Backend developer

## What Gets Built

Full Supabase schema for the entire app. Every table, relationship, RLS policy, and seed data.

## Core Tables

### 3.1 — `users` (extends Supabase auth.users)

```sql
create table public.profiles (
  id            uuid references auth.users primary key,
  display_name  text,
  avatar_url    text,
  timezone      text default 'UTC',
  created_at    timestamptz default now()
);
```

### 3.2 — `quests` (one per user per active milestone)

```sql
create table public.quests (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references profiles(id) on delete cascade,
  -- The goal (the bait)
  goal_raw            text not null,         -- "Sell 200 accounts"
  goal_measurable     text not null,         -- "200 signed accounts by Dec 31"
  goal_deadline       date,
  -- Day One Snapshot (for the Chapter 18 reveal)
  snapshot_who_i_am   text,                  -- who they are on day one
  snapshot_what_chasing text,                -- why they want it
  snapshot_biggest_fear text,                -- fear named on day one
  snapshot_captured_at timestamptz,
  -- Journey state
  current_chapter     int default 0,         -- 0 = prologue not yet seen
  chapters_complete   int[] default '{}',
  -- Purpose reveal
  life_purpose        text,                  -- written in Chapter 18
  life_purpose_revealed_at timestamptz,
  -- Status
  status              text default 'active', -- active | complete | paused
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);
```

### 3.3 — `milestones` (the map gates)

```sql
create table public.milestones (
  id                  uuid primary key default gen_random_uuid(),
  quest_id            uuid references quests(id) on delete cascade,
  title               text not null,
  measurable_result   text not null,
  deadline            date,
  reward_tier         text check (reward_tier in ('small','medium','large')),
  reward              text,
  sequence_order      int not null,          -- position in the map
  complete            boolean default false,
  completed_at        timestamptz,
  created_at          timestamptz default now()
);
```

### 3.4 — `daily_proof` (the streak engine)

```sql
create table public.daily_proof (
  id                  uuid primary key default gen_random_uuid(),
  quest_id            uuid references quests(id) on delete cascade,
  user_id             uuid references profiles(id) on delete cascade,
  proof_date          date not null,
  proof_created       text not null,         -- "what proof did I create today"
  action_completed    text not null,
  avoided             text,
  revealed            text,                  -- "what did today reveal about who I'm becoming"
  milestone_id        uuid references milestones(id),
  chapter_id          int,
  created_at          timestamptz default now(),
  unique(quest_id, proof_date)
);
```

### 3.5 — `shadow_encounters` (shadow system)

```sql
create table public.shadow_encounters (
  id                  uuid primary key default gen_random_uuid(),
  quest_id            uuid references quests(id) on delete cascade,
  user_id             uuid references profiles(id) on delete cascade,
  shadow_type         text check (shadow_type in (
                        'broke_king','addict_saint','silent_prophet',
                        'raging_victim','naive_warrior'
                      )),
  chapter_id          int not null,
  encounter_phase     text check (encounter_phase in (
                        'appeared','attached','controlling','noticed','named','resolved'
                      )),
  shadow_voice_heard  text[],                -- which voice lines triggered
  essence_chosen      text,                  -- which Essence was used to return
  exercise_completed  text,                  -- which exercise broke the control
  proof_action        text,                  -- what real-world action was taken
  resolved_at         timestamptz,
  created_at          timestamptz default now()
);
```

### 3.6 — `exercises` (completed coaching tool sessions)

```sql
create table public.exercise_sessions (
  id                  uuid primary key default gen_random_uuid(),
  quest_id            uuid references quests(id) on delete cascade,
  user_id             uuid references profiles(id) on delete cascade,
  exercise_id         text not null,         -- matches ExerciseId from data model
  chapter_id          int,
  shadow_encounter_id uuid references shadow_encounters(id),
  prompts_answered    jsonb,                 -- { "prompt_key": "user_answer" }
  essence_declared    text,
  declaration_text    text,
  completed_at        timestamptz,
  created_at          timestamptz default now()
);
```

### 3.7 — `weekly_reviews`

```sql
create table public.weekly_reviews (
  id                  uuid primary key default gen_random_uuid(),
  quest_id            uuid references quests(id) on delete cascade,
  user_id             uuid references profiles(id) on delete cascade,
  week_start          date not null,
  week_end            date not null,
  -- Weekly reflection
  proof_count         int default 0,
  milestones_moved    int default 0,
  shadow_controlled   text[],                -- which shadows took control this week
  essence_used        text[],                -- which Essences were returned to
  -- Weekly reset
  weekly_actions      text[],                -- declared actions for next week
  -- Integrity check
  promises_made       int default 0,
  promises_kept       int default 0,
  created_at          timestamptz default now(),
  unique(quest_id, week_start)
);
```

### 3.8 — `mentor_sessions` (tracking which mentor conversations happened)

```sql
create table public.mentor_sessions (
  id                  uuid primary key default gen_random_uuid(),
  quest_id            uuid references quests(id) on delete cascade,
  user_id             uuid references profiles(id) on delete cascade,
  mentor_type         text check (mentor_type in ('anchor','challenger','alchemist','heartkeeper','father')),
  chapter_id          int,
  questions_asked     text[],
  user_responses      jsonb,
  breakthrough_noted  text,
  created_at          timestamptz default now()
);
```

### 3.9 — `streaks` (calculated + cached)

```sql
create table public.streaks (
  user_id             uuid references profiles(id) primary key,
  current_streak      int default 0,
  longest_streak      int default 0,
  last_proof_date     date,
  updated_at          timestamptz default now()
);
```

### 3.10 — `rewards_earned`

```sql
create table public.rewards_earned (
  id                  uuid primary key default gen_random_uuid(),
  quest_id            uuid references quests(id) on delete cascade,
  user_id             uuid references profiles(id) on delete cascade,
  reward_type         text,                  -- 'milestone' | 'streak' | 'shadow_named' | 'essence_unlocked' | 'chapter_complete'
  reward_label        text,
  milestone_id        uuid references milestones(id),
  chapter_id          int,
  earned_at           timestamptz default now()
);
```

## 3.11 — RLS Policies

```sql
-- Users can only see their own data
alter table public.quests enable row level security;
create policy "users own quests" on public.quests
  for all using (auth.uid() = user_id);

-- Apply same pattern to all user tables:
-- daily_proof, shadow_encounters, exercise_sessions,
-- weekly_reviews, mentor_sessions, rewards_earned
```

## 3.12 — Seed Data

- Seed all 20 chapters (Prologue + 19) into a `chapters` reference table
- Seed all 5 shadows into a `shadows` reference table
- Seed all 5 Essences into an `essences` reference table
- Seed all 23 coaching tools into an `exercises` reference table (maps to coaching docs)
- Seed the 3 mentor types into a `mentors` reference table

## 3.13 — Edge Functions

- `calculate_streak` — triggered daily via cron; updates `streaks` table
- `shadow_trigger_check` — evaluates user behavior patterns to suggest shadow encounters
- `chapter_unlock` — validates unlock requirements before advancing chapter
- `life_purpose_reveal` — compares Day One Snapshot to current state for Chapter 18

## Definition of Done

- [ ] All tables created in Supabase dev project
- [ ] All RLS policies applied and tested
- [ ] Seed data loaded (chapters, shadows, essences, exercises, mentors)
- [ ] All 5 edge functions deployed
- [ ] TypeScript types generated from schema (`supabase gen types`)
- [ ] Schema matches `mapquest-data-model.ts` + new additions

---

---

# PHASE 4 — Design System

**Category:** Foundation
**Duration:** 3–4 days
**Owner:** UI/UX designer + Frontend developer

## What Gets Built

The visual language of the entire app. Colors, typography, spacing, motion, and component tokens — all locked before any screen is built.

## 4.1 — Color System

The palette extends the brand neon system (see `brand_colors.md` in memory) with story-specific semantic colors.

### Base

| Token | Value | Use |
|---|---|---|
| `--bg-deep` | `#080d19` | Primary background |
| `--bg-surface` | `#0c1422` | Cards, panels |
| `--bg-raised` | `#101b2e` | Elevated elements |
| `--bg-border` | `rgba(120,160,210,.14)` | Subtle borders |
| `--ink-primary` | `#eaf2fb` | Main text |
| `--ink-muted` | `#8fa3bd` | Secondary text |
| `--ink-dim` | `#62748f` | Tertiary text |

### Essence Colors

| Essence | Token | Hex |
|---|---|---|
| Radiance | `--essence-radiance` | `#ffd166` |
| Love | `--essence-love` | `#f06a8a` |
| Joy | `--essence-joy` | `#7ad97a` |
| Power | `--essence-power` | `#5b8def` |
| Majesty | `--essence-majesty` | `#b67af0` |

### Shadow Colors

| Shadow | Token | Hex |
|---|---|---|
| Broke King | `--shadow-broke-king` | `#B8860B` |
| Addict Saint | `--shadow-addict-saint` | `#FF6EB4` |
| Silent Prophet | `--shadow-silent-prophet` | `#4B0082` |
| Raging Victim | `--shadow-raging-victim` | `#8B0000` |
| Naive Warrior | `--shadow-naive-warrior` | `#FFD700` |

### UI Semantic

| Token | Value | Use |
|---|---|---|
| `--accent-teal` | `#06b6d4` | Primary CTA, links |
| `--accent-amber` | `#ffa94d` | Labels, warnings |
| `--diamond` | `#9fe3ff` | Map gates, milestones |
| `--proof-green` | `#4ade80` | Streak, completion |
| `--glow-teal` | `rgba(6,182,212,.35)` | Glow effects |

## 4.2 — Typography

| Token | Font | Size | Weight | Use |
|---|---|---|---|---|
| `--font-display` | Fraunces (serif, italic available) | 44–84px fluid | 600 | Chapter titles, hero headings |
| `--font-body` | Inter Tight | 15–17px | 400–500 | All body text, prompts |
| `--font-mono` | JetBrains Mono | 11–13px | 400–500 | Labels, codes, gates |
| `--font-shadow-voice` | Inter Tight italic | 16px | 400 | Shadow voice lines |
| `--font-essence` | Fraunces bold | 20px | 600 | Essence activation lines |

## 4.3 — Motion System

All animations use these easing curves:

| Motion Type | Easing | Duration | Use |
|---|---|---|---|
| Enter | `cubic-bezier(0.16, 1, 0.3, 1)` | 380ms | Panels, cards appearing |
| Exit | `cubic-bezier(0.4, 0, 1, 1)` | 220ms | Elements leaving |
| Shadow Attach | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | 600ms | Shadow appears and latches |
| Essence Return | `cubic-bezier(0.16, 1, 0.3, 1)` | 800ms | Essence glow + text reveal |
| Gate Open | `cubic-bezier(0.4, 0, 0.2, 1)` | 1200ms | Chapter gate unlocking |
| Proof Submit | Spring (stiffness 200, damping 20) | — | Proof entry confirmation |

## 4.4 — Spatial System

```
Base unit: 4px
Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128
```

## 4.5 — Component Tokens

Define tokens for every reusable component:

- Quest Card
- Chapter Gate (locked / unlocked / complete states)
- Shadow Encounter Card
- Essence Power Button
- Proof Entry Form
- Mentor Dialogue Bubble
- Mirror (Awareness Mirror)
- Milestone Progress Bar
- Streak Counter
- Daily Proof Card
- Weekly Review Panel
- Exercise Prompt Block
- Declaration Field
- Life Purpose Reveal Card

## 4.6 — Dark Mode (default)

The app is dark-mode only. No light mode for MVP.

## 4.7 — Icon Set

Define icons needed:

- 5 Shadow icons (each has a unique silhouette)
- 5 Essence icons (each has a unique glyph)
- 19 Chapter icons (one per chapter)
- Map gate icon (locked, unlocked, complete)
- Proof icon
- Streak flame icon
- Mirror icon (Awareness Mirror)
- Mentor icons (one per mentor)
- Treasure icon (Ch 18 reveal)

## Definition of Done

- [ ] All CSS custom properties defined in global stylesheet
- [ ] Typography scale implemented and tested
- [ ] All motion curves defined as named constants
- [ ] Component token map documented
- [ ] Icon set defined (can be placeholder until Phase 5)
- [ ] Design system reviewed in Figma or equivalent

---

---

# PHASE 5 — World Asset Creation

**Category:** Foundation
**Duration:** 5–7 days
**Owner:** Visual artist / AI image lead

## What Gets Built

All visual world assets for the 13 story locations, 5 shadow characters, 5 Essence glows, 3 mentor portraits, and the map itself.

## 5.1 — The World Map

The central navigation element.

Requirements:
- Illustrated top-down fantasy/cyberpunk quest map
- Shows all 13 world zones connected by paths/trails
- Locked zones appear in fog or dark
- Completed zones glow with their Essence color
- Active zone pulses
- The Treasure Mirror chamber appears at the center/top
- The Return Road leads back to the starting Home
- Format: SVG or layered PNG (so zones can animate independently)

## 5.2 — Location Illustrations (13)

One hero illustration per world zone:
1. The Home (starting point) — warm, simple, ordinary
2. The Forest of Lack — dark, oppressive, broken crowns
3. The Neon Chapel — glowing, beautiful, no exit
4. The Tower of Unspoken Words — tall, silent, filled with blank pages
5. The Clock Desert — endless sand, broken clocks, no shade
6. The Ruins of What Happened — ruined city, burned statues, center figure
7. The False Gold Market — shining, chaotic, glittering promises
8. The Proof Forge — workshop, tools powered by light
9. The Oasis of Being — peaceful, water, soft light
10. The Shadow Citadel — all five shadows gathered, dark fortress
11. The Final Stand cliff — lone figure, vast sky, single step forward
12. The Treasure Mirror chamber — ornate, glowing mirror at center
13. The Return Road — same path as Ch 1, now lit

Style reference: Cyberpunk-fantasy hybrid. Dark backgrounds, neon-lit details, painterly quality. Not cartoon. Not photo-real. Painterly illustration.

## 5.3 — Shadow Character Portraits (5)

One full-body portrait per shadow, shown:
- As they first appear (seemingly normal)
- As they reveal their true nature
- As they are being named (partially translucent, weakening)

## 5.4 — Mentor Portraits (3 + Father + Heartkeeper)

One portrait per mentor in their signature visual style:
- The Father (lantern, warm, calm)
- The Anchor Mentor (compass, seated, still)
- The Challenger Mentor (mirror held up, direct gaze)
- The Alchemist Mentor / Essence Keeper (partially translucent, surrounded by 5 Essence lights)
- The Heartkeeper (water nearby, soft light)

## 5.5 — Essence Glow Effects (5)

Animated glow assets for each Essence return moment:
- Radiance: gold-white outward burst
- Love: rose-pink pulse inward then outward
- Joy: green-gold upward sparks
- Power: deep blue-white grounded energy
- Majesty: purple crown-light ascending

## 5.6 — The Awareness Mirror

The mirror is a key UI element used throughout the app to show which shadow is in control.

Requirements:
- Base mirror frame (ornate, dark metal)
- 5 overlay states (one per shadow, tinted in shadow color)
- "Cracked" state (when shadow has control)
- "Clear" state (when Essence is chosen)
- Reflection animation (subtle ripple)

## 5.7 — The Blank Map (Prologue Gift)

The blank map given by the Father in the Prologue.

Requirements:
- Appears completely blank at first
- Animated reveal: as Seeker declares their goal, map lines begin to appear
- Milestone gates appear as the player progresses
- Final state: fully illustrated map of their completed journey

## Definition of Done

- [ ] World map SVG/PNG complete
- [ ] All 13 location illustrations delivered
- [ ] All 5 shadow portraits (3 states each) delivered
- [ ] All 5 mentor portraits delivered
- [ ] All 5 Essence glow animations delivered
- [ ] Awareness Mirror assets (6 states) delivered
- [ ] Blank map + animation states delivered

---

---

# PHASE 6 — Auth + Player Profile + Onboarding

**Category:** Core Systems
**Duration:** 3 days
**Owner:** Full-stack developer

## What Gets Built

User authentication, profile creation, and the critical Day One Snapshot capture — the seed data for the Chapter 18 Life Purpose reveal.

## 6.1 — Authentication

- Supabase Auth (email + Google OAuth)
- Magic link option
- Session management
- Redirect flow: sign-in → onboarding (if new) or quest map (if returning)

## 6.2 — Profile Setup Screen

Fields:
- Display name
- Timezone (for streak calculation and daily reset)
- Optional: avatar upload

## 6.3 — Onboarding Flow (The Prologue Entry)

This is the first thing every new user experiences. It IS the Prologue.

**Screen 1: The Father's Warning (Cinematic)**
```
[Full-screen dark scene]
[Father figure appears]
FATHER: "You will think the treasure is out there. And it is."
[Pause]
FATHER: "But the road will not only show you where it is buried."
[Pause]
FATHER: "It will show you who you become when you are afraid."
[Beat]
FATHER: "On the road, you will meet shadows."
[Beat]
FATHER: "They will not always look like monsters."
[Beat]
FATHER: "Do not hate them. Do not worship them. Learn them."
[Father hands player 3 items: blank map, small mirror, the warning]
[Continue →]
```

**Screen 2: The Dream (Goal Entry)**
```
[Blank map unfolds on screen]
NARRATION: "The map will not show the road until you declare where you are going."

Input: "What is your treasure?"
[Large text field — player types their real-world goal]

Examples shown as placeholders:
  - "Sell 200 accounts"
  - "Publish my app"
  - "Make $1M"
  - "Build my business"

[Declaration button: "I declare this quest →"]
```

**Screen 3: The Day One Snapshot (Critical — powers Chapter 18)**
```
NARRATION: "Before you begin, the mirror asks three questions."
NARRATION: "Answer honestly. The mirror remembers."

Question 1: "Who are you, right now, in this moment?"
[Text field]

Question 2: "Why does this treasure matter to you?"
[Text field]

Question 3: "What is the one thing you are most afraid might happen on this journey?"
[Text field]

[Lock in my answers →]
```

**Screen 4: Map Reveal**
```
[Blank map begins to fill with lines — the journey road appears]
[Chapter gates appear one by one, most locked]
[Prologue gate glows — READY]
NARRATION: "The map is drawn. The quest begins."
[Enter the Map →]
```

## 6.4 — Returning User Flow

- Login → directly to Quest Map
- Show current chapter, streak, recent proof
- If streak broken: gentle shadow check-in (not shame — awareness)

## Definition of Done

- [ ] Auth working (email + Google)
- [ ] Profile setup screen complete
- [ ] Full Prologue onboarding flow playable end-to-end
- [ ] Day One Snapshot saved to `quests` table
- [ ] Quest created on completion
- [ ] Map unlocks and shows current chapter state
- [ ] Returning user flow working

---

---

# PHASE 7 — Quest Map System

**Category:** Core Systems
**Duration:** 4–5 days
**Owner:** Frontend developer

## What Gets Built

The central navigation of the entire app — the visual quest map showing all 19 chapters, their lock states, and the Seeker's progress.

## 7.1 — Map Layout

The map shows:
- Home (starting point, always visible)
- 19 chapter gates arranged as a path
- Each gate has 3 states: `locked` / `unlocked` / `complete`
- Active gate pulses
- Completed gates glow with the Essence color of that chapter
- Shadow zones are marked on the map (Forest, Chapel, Tower, Desert, Ruins, Market, Citadel)
- The Treasure Mirror chamber appears at the summit
- The Return Road leads from the chamber back to Home

## 7.2 — Chapter Gate Component

Each gate on the map shows:
```
[Gate icon — locked/unlocked/complete visual]
[Chapter number]
[Chapter title]
[Tiny description: "The Broke King waits here"]
[Essence glow color if complete]
[Lock indicator if requirements not met]
```

## 7.3 — Chapter Unlock Logic

```typescript
function canUnlockChapter(chapterId: number, questState: QuestState): boolean {
  const chapter = CHAPTERS.find(c => c.id === chapterId);
  if (!chapter?.unlockRequires) return true;
  return questState.chaptersComplete.includes(chapter.unlockRequires);
}
```

Special unlock rules:
- Chapter 1: Always available after Prologue
- Chapter 5 (Broke King): Unlocks after Chapter 4 + first daily proof submitted
- Chapter 10 (Tower): Unlocks after Chapter 9 + shadow naming in Ch 8
- Chapter 16 (Shadow Citadel): Unlocks after Chapters 10, 13, 15 all complete
- Chapter 18 (Treasure Mirror): Unlocks only after Chapter 17 + Life Purpose inquiry started
- Chapter 19 (Return Home): Unlocks immediately after Chapter 18

## 7.4 — Map Interactions

- Tap/click a gate → chapter detail drawer slides up
- Chapter detail shows: title, description, what exercise runs here, current state
- If locked: shows what is needed to unlock
- If unlocked: "Enter this chapter" CTA
- If complete: "Review this chapter" option

## 7.5 — Progress Indicators

Header bar on map shows:
- Current chapter number
- Chapters complete / 19
- Current streak
- Active milestone title

## 7.6 — Shadow Presence on Map

When a shadow is in "controlling" state:
- That shadow's zone on the map glows in shadow color
- Small shadow icon appears near the zone
- Tapping it opens the Shadow Encounter screen

## Definition of Done

- [ ] Map renders all 19 chapters in correct order
- [ ] Lock states work correctly based on DB state
- [ ] Gate unlock animations complete
- [ ] Chapter detail drawer opens on tap
- [ ] Progress header working
- [ ] Shadow presence visualized on map

---

---

# PHASE 8 — Shadow Encounter Engine

**Category:** Core Systems
**Duration:** 5–6 days
**Owner:** Full-stack developer

## What Gets Built

The entire shadow detection, encounter, attachment, control, and resolution system — the psychological core of the app.

## 8.1 — Shadow Trigger Logic

Shadows are triggered by:

1. **Chapter entry triggers** — each shadow has a designated chapter where it first appears
2. **Behavioral triggers** — patterns in the user's daily proof or exercise answers
3. **Time triggers** — if user hasn't logged proof in 48 hours, Addict Saint or Broke King may appear
4. **Keyword triggers** — certain words in proof entries or exercise answers surface matching shadows

| Shadow | Chapter Trigger | Behavioral Trigger |
|---|---|---|
| Broke King | Ch 5 | Proof entry mentions money/fear/behind/shame |
| Addict Saint | Ch 8 | No proof for 48+ hrs; proof mentions avoiding/comfort/tomorrow |
| Silent Prophet | Ch 10 | Proof mentions not posting/waiting/not ready/perfectionism |
| Raging Victim | Ch 13 | Proof mentions blame/unfair/they took/not my fault |
| Naive Warrior | Ch 15 | Rapid chapter advances; proof mentions rushed/quick/opportunity |

## 8.2 — Shadow Encounter Phases

Each encounter moves through 6 phases (stored in `shadow_encounters.encounter_phase`):

```
appeared → attached → controlling → noticed → named → resolved
```

**Phase: appeared**
Shadow is shown as a character in the chapter. Player encounters them.
UI: Full chapter scene with shadow as character.

**Phase: attached**
After the chapter scene, a notification/banner: "Something from the [Location] is following you."
UI: Shadow icon appears subtly on map near current chapter.

**Phase: controlling**
Player hits resistance — proof not submitted, exercise abandoned, avoidance detected.
UI: Awareness Mirror shows cracked state with shadow tint. Shadow voice lines appear.

**Phase: noticed**
Player opens the Awareness Mirror or a mentor prompts them.
UI: "The mirror shows something. Who is speaking right now?"
Shows the 5 shadow options.

**Phase: named**
Player selects the shadow from the list.
UI: Shadow naming animation. Shadow becomes partially transparent.
The shadow's voice lines appear attributed to it: "The [Shadow Name] says: *You are behind.*"

**Phase: resolved**
Player completes the exercise for that shadow and submits a proof action.
UI: Essence return animation. Shadow retreats to edge of map (present but not leading).
Reward earned.

## 8.3 — The Awareness Mirror UI

The Awareness Mirror is the main tool for Phase noticed → named.

Screen layout:
```
[Mirror frame — cracked state]
"The mirror is showing something."
"One of these voices has been speaking."
"Which one do you recognize?"

[5 shadow cards, each shows:]
  - Shadow name
  - Their signature voice line
  - "Select this shadow"

[After selection:]
  "[Shadow Name] has been speaking."
  "Here are the things it has been saying:"
  [List of voice lines]
  "What is it protecting you from?"
  [Text field]
  "What proof action would break its control?"
  [Text field]
```

## 8.4 — Shadow Control State in UI

When a shadow is in "controlling" state across the app:

- Map zone for that shadow glows in shadow color
- A subtle banner at the top: "[Shadow Name] is here."
- Daily proof entry begins with: "Notice: [Shadow Name] may be active. What are you really feeling?"
- The mirror icon in the nav pulses

## 8.5 — Shadow History

Users can see all past shadow encounters:
- Which shadow
- When it appeared
- How long it was in control
- Which Essence resolved it
- What proof action was taken

This becomes part of the Chapter 16 (Shadow Citadel) revelation.

## 8.6 — Edge Function: shadow_trigger_check

```typescript
// Runs on daily_proof.insert and on a scheduled daily job
// Checks:
// 1. No proof for 48+ hours → trigger Addict Saint
// 2. Keyword match in proof_created or revealed → trigger matching shadow
// 3. Chapter entry → trigger chapter's designated shadow
// 4. Rapid chapter advance → trigger Naive Warrior
// Updates shadow_encounters table with new encounter or phase advance
```

## Definition of Done

- [ ] Shadow trigger logic implemented (chapter, behavioral, time, keyword)
- [ ] All 6 encounter phases tracked in DB
- [ ] Awareness Mirror UI complete (5 shadow states)
- [ ] Shadow control state reflected across map and daily proof
- [ ] Shadow history screen complete
- [ ] shadow_trigger_check edge function deployed and tested
- [ ] All 5 shadows tested end-to-end (appear → resolve)

---

---

# PHASE 9 — Essence Return System

**Category:** Core Systems
**Duration:** 3–4 days
**Owner:** Frontend developer

## What Gets Built

The Essence selection UI, Essence activation animations, and the Essence return flow that follows shadow naming.

## 9.1 — Essence Selection Screen

After a shadow is named, the Essence Return screen appears:

```
[Shadow has been named — partially translucent]
"[Shadow Name] protects you. But it cannot lead you."
"What power is missing right now?"
"Choose your Essence."

[5 Essence buttons, each with:]
  - Essence name
  - Essence symbol/glyph
  - Power phrase
  - Glow color
  [Select]

[After selection:]
  [Essence glow animation — full screen burst in Essence color]
  Activation line: "[Essence activation text]"
  "[Essence Name] has been chosen."
  "Now take one proof action from this place."
```

## 9.2 — Essence Unlocking System

Essences are progressively unlocked through the journey:

| Essence | Unlocks At | Trigger |
|---|---|---|
| Power | Chapter 5 | First Broke King encounter resolved |
| Love | Chapter 8 | First Addict Saint encounter resolved |
| Radiance | Chapter 10 | First Silent Prophet encounter resolved |
| Majesty | Chapter 13 | First Raging Victim encounter resolved |
| Joy | Chapter 15 | First Naive Warrior encounter resolved |

Before an Essence is unlocked, it appears as a dark/locked orb on the Essence selection screen.

## 9.3 — Essence Tracker

A persistent UI element (accessible from nav) shows:
- All 5 Essences
- How many times each has been chosen
- Last chapter/date each was used
- Which shadow each was used against

This becomes the "Essence Map" — a record of transformation.

## 9.4 — Essence Activation Animation

Each Essence has a unique full-screen animation:
- Duration: 1.2–1.8 seconds
- Full-screen Essence color burst
- Activation text fades in
- Shadow figure retreats to edge
- Returns to exercise/proof screen

## 9.5 — Essence in Daily Proof

Every daily proof entry includes:
- Optional: "Which Essence are you operating from today?"
- Pre-select based on most recent Essence return
- Adds data to the weekly pattern view

## Definition of Done

- [ ] Essence selection screen complete
- [ ] All 5 Essence unlock triggers working
- [ ] Locked Essence state visible before unlock
- [ ] All 5 Essence activation animations complete
- [ ] Essence tracker screen complete
- [ ] Essence field in daily proof working
- [ ] Essence data in `shadow_encounters` table

---

---

# PHASE 10 — Mentor Dialogue System

**Category:** Core Systems
**Duration:** 4–5 days
**Owner:** Frontend developer + AI integration (optional)

## What Gets Built

The interactive mentor dialogue system — the mechanism through which the 3 mentors (and Father + Heartkeeper) ask questions and guide the Seeker.

## 10.1 — Mentor Dialogue Component

The mentor dialogue appears as a two-panel layout:
- Left: mentor portrait (from Phase 5 assets)
- Right: dialogue bubble + user response field

Format:
```
[Mentor portrait]  |  [Mentor name]
                   |  "[Mentor question]"
                   |  
                   |  [User response field — text area]
                   |  [Next question →]
```

## 10.2 — Question Flow Engine

Each mentor session is a sequence of questions drawn from that mentor's coaching tools.

The engine:
1. Loads the mentor's question pool (from coaching tools)
2. Delivers questions one at a time
3. Waits for user response (minimum 3 words to proceed)
4. After final question: delivers mentor's closing line + transitions to exercise

## 10.3 — Anchor Mentor Question Bank (Ch 1, Ch 2, Ch 3)

Drawn from: Life Purpose, Futurability, Project Design From Future, Merlin Exercise

```
Ch 1 Session (The Why):
Q1: "What are you really chasing?"
Q2: "And if you had that — what would it make possible?"
Q3: "If this goal were already complete — who would you become?"
Q4: "What part of you feels called by this?"
Q5: "Is this a fix from survival, or a possibility from Essence?"
Closing: "This is not your Life Purpose yet. This is the seed. Guard it."
→ Transitions to Anchor Mentor Why Session

Ch 2 Session (Futurability):
Q1: "Is this objective truly yours?"
Q2: "Is it relevant to the life you say you are building?"
Q3: "Can it be measured in the world?"
Q4: "Does it challenge and inspire you?"
Q5: "Are you committed even when circumstances argue?"
Closing: "A dream becomes a quest when it can live in the future. Let us see if yours can."
→ Transitions to Futurability Check

Ch 3 Session (The Future Map):
Q1: "Stand at the day this project is complete. What has been produced?"
Q2: "Who are you being on that day?"
Q3: "What is present for you and others?"
Q4: "What skills helped you get there?"
Q5: "What milestones did you pass?"
Closing: "The map is drawn backward from the future identity. Now let us draw yours."
→ Transitions to Merlin/Future Map Exercise
```

## 10.4 — Challenger Mentor Question Bank (Ch 6, Ch 7, Ch 12, Ch 13)

Drawn from: Responsibility-At Cause, Victim-At Effect, Consequences of Choice, Power of Promise

```
Ch 6 Session (At Cause Reset):
Q1: "What are you explaining right now?"
Q2: "What are you protecting?"
Q3: "Where are you at effect?"
Q4: "What are you willing to be responsible for?"
Q5: "What action would further the project?"
Q6: "What promise will you keep next?"
Closing: "You can have your reasons, or you can have your quest. Which are you choosing?"
→ Transitions to At Cause Reset Exercise
```

## 10.5 — Alchemist Mentor Question Bank (Ch 11, Ch 14, Ch 16, Ch 17)

Drawn from: Coaching From Being, Powerful Stands, Self-Sabotage and Integrity, Re-Invention

```
Ch 11 Session (Essence Mentor Reveal):
Q1: "What shadow has been speaking?"
Q2: "What is it protecting?"
Q3: "What Essence is missing?"
Q4: "What would Love do here?"
Q5: "What would Power do here?"
Q6: "What proof action would make your Essence real?"
Closing: "You cannot destroy what once protected you. You can only stop letting it lead."
→ Transitions to Back to Being Exercise
```

## 10.6 — Father Dialogue (Prologue only + Ch 19 cameo)

```
Prologue:
"You will think the treasure is out there. And it is."
"But the road will also show you who you become when you are afraid."
"On the road, you will meet shadows."
"They will not always look like monsters."
"Do not hate them. Do not worship them. Learn them. Name them."
"Then return to who you really are."

Chapter 19 (Return Home):
"The shadows were mine." [Seeker]
"And now?" [Father]
"They can still walk with me. But they no longer lead me." [Seeker]
[Father smiles] [End]
```

## 10.7 — Heartkeeper Dialogue (Ch 14)

```
Q1: "Where are you judging yourself right now?"
Q2: "What would compassion say?"
Q3: "What part of you needs to be heard?"
Q4: "Can you listen to yourself without becoming reactive?"
Closing: "You cannot shame yourself into transformation. Being is the door."
→ Transitions to Being Mirror Exercise
```

## 10.8 — AI-Enhanced Option (Phase 2 feature)

Optional future enhancement: Use Claude API to generate contextual follow-up questions based on user responses. The mentor question bank above is the MVP (static). AI enhancement deepens the conversation in V2.

## Definition of Done

- [ ] Mentor dialogue component built (portrait + question + response)
- [ ] Question flow engine built (sequential, min-response guard)
- [ ] All 5 mentor question banks loaded
- [ ] Transitions from dialogue to exercise working
- [ ] Father Prologue scene complete
- [ ] Father Ch 19 cameo complete
- [ ] Heartkeeper Ch 14 session complete

---

---

# PHASE 11 — Exercise Engine

**Category:** Core Systems
**Duration:** 6–8 days
**Owner:** Frontend developer

## What Gets Built

Every coaching tool from the COACHING_DOCS_INDEX becomes an interactive, guided exercise flow inside the app. This is the largest single-phase build.

## 11.1 — Exercise Architecture

Every exercise follows the same structure:

```typescript
type Exercise = {
  id: ExerciseId;
  name: string;
  coachingDocs: string[];       // filenames from COACHING_DOCS_INDEX
  chapter: number;              // 0 = Prologue, 1–19 = chapters
  shadow?: ShadowType;          // shadow this exercise is designed to resolve
  prompts: ExercisePrompt[];
  declaration?: DeclarationFormat;
  proofActionRequired: boolean;
  completionMessage: string;
}

type ExercisePrompt = {
  key: string;
  question: string;
  type: 'text' | 'multiline' | 'select' | 'checkbox' | 'declaration';
  required: boolean;
  placeholder?: string;
}
```

**Total exercise count:**
- 18 core chapter-linked exercises (Chapters 1–18; Prologue is cinematic only)
- Chapter 19 is a return-home epilogue / next-quest seed, not a core exercise
- 6 coaching docs used as reference/deepening context only (not player-facing exercises)
- See Section 11.3 for the 6 reference-only docs

## 11.2 — The 18 Core Chapter Exercises

### Exercise 1: Anchor Mentor Why Session (Ch 1)
Doc: Life Purpose - Coach's Instructions · Futurability for Objectives

The Anchor Mentor appears in Chapter 1. This is the first real coaching exercise of the game: the Seeker names what he thinks he is chasing, then the Mentor helps him find the deeper why beneath the goal. The full Life Purpose is not revealed here; only the seed is planted.

Prompts:
1. What is the external treasure you are chasing?
2. Why does it matter to you?
3. If it were already complete — what would it make possible?
4. Is this a fix from survival, or a possibility from Essence?
5. What part of you feels called by this?

Output: Captures the initial goal into the `quests.goal_raw` field. Anchors the Ch 18 reveal — "what you thought you were chasing."

---

### Exercise 2: Futurability Check (Ch 2)
Doc: Futurability for Objectives

Checkboxes (must answer all 8):
1. Is this objective owned — free from guilt or sacrifice?
2. Is it relevant to your life goals?
3. Is it measurable? Do you have a date?
4. Do you have some sense you can achieve it?
5. Are you challenged and inspired by it?
6. Are you fully committed regardless of circumstances?
7. Is it written down and in your environment?
8. Do you have a coach for this objective?

Gate: All 8 must be answered before chapter advances.

---

### Exercise 3: Future Vision Journal (Ch 3)
Doc: Merlin Exercise + Project Design From The Future

Prompts:
1. Stand at the day this project is complete. What has been produced?
2. Who are you being on that day?
3. What is present for you and others in your life?
4. What skills helped you get here?
5. What resources supported you?
6. What rewards did you earn?
7. What milestones did you pass?

Output: Creates initial milestone chain. Populates `milestones` table.

---

### Exercise 4: Essence Declaration (Ch 4)
Doc: Declaration as a Tool

Format:
```
"From being __________, I declare __________ by __________."
```

Prompts:
1. What Essence are you declaring from? (select from 5)
2. What are you declaring?
3. By when?
4. What survival mechanism may resist this declaration?
5. Where will you display this declaration?
6. What schedule supports it?
7. What is the first action in your action plan?

Output: Saves to `exercise_sessions.declaration_text`. Displayed on Quest Map.

---

### Exercise 5: Money Mirror (Ch 5 — Broke King)
Doc: Income-Savings Thermometer + Consequences of Choice

Prompts:
1. What am I making money mean?
2. What fear is controlling this choice right now?
3. What consequence am I avoiding?
4. Where am I at effect with money?
5. What would Power choose in this situation?
6. What proof action would restore financial integrity?

Required proof action: Player must name one real-world financial proof action.

---

### Exercise 6: At Cause Reset (Ch 6 — Challenger Mentor)
Doc: Responsibility-At Cause + Victim-At Effect

Prompts:
1. What am I explaining right now instead of correcting?
2. What am I protecting?
3. Where am I at effect?
4. What am I willing to be responsible for?
5. What action would further the project?
6. What promise will I keep next?

Output: Creates a new daily proof entry with the promise.

---

### Exercise 7: Promise Forge (Ch 7)
Doc: Power of Promise + Self-Sabotage and Integrity

Prompts:
1. Define power in your own words.
2. Define promise in your own words.
3. Why do I avoid making promises?
4. What structure helps me keep promises?
5. What is my relationship to promises I make to myself?
6. What would be possible if I made and kept promises?
7. What proof will I complete today?

Output: Activates Daily Proof streak tracking.

---

### Exercise 8: Compassionate Interruption (Ch 8 — Addict Saint)
Doc: Overwhelm Cycle + Self-Sabotage and Integrity + Coaching From Being

Prompts:
1. What feeling am I trying not to feel right now?
2. What happened right before I wanted to escape?
3. Where is this cycle repeating in my life?
4. What does this part of me need me to hear?
5. What would Love say — without judgment?
6. Where in the cycle can I intervene?
7. What is one proof action I can take before I seek comfort?

Required proof action: Player names one action to take before comfort.

---

### Exercise 9: Time Integrity Reset (Ch 9)
Doc: Notes about Coaching and Time + Healthy Priorities

Prompts:
1. What am I making up about time?
2. Where does my Survival Mechanism waste my time?
3. Am I managing time, or energy and focus?
4. Where am I scattered or overcommitted?
5. What would scheduling look like if it were an act of integrity?
6. What are my healthy priorities right now?
7. What does my schedule say I actually value?

Output: Creates weekly action plan structure.

---

### Exercise 10: Voice Gate (Ch 10 — Silent Prophet)
Doc: Declaration as a Tool + Life Purpose + Powerful Stands

Prompts:
1. What am I afraid will happen if I speak?
2. What declaration wants to be spoken right now?
3. What part of my purpose is trying to come through?
4. Where am I judging myself before I even begin?
5. What would Radiance say?
6. What is one visible proof action I will take?

Required proof action: Player names one public/visible action.

---

### Exercise 11: Loop Breaker (Ch 11)
Doc: Overwhelm Cycle-Coach Instructions

Steps (guided, not just prompts):
1. "Draw the cycle in words: What is the 'that was it' moment?"
2. "What happened immediately before it?"
3. "What happened immediately after it?"
4. "Follow the cycle all the way around — what does it look like?"
5. "Given that it is a circle: at what point could you intervene?"
6. "What new action interrupts the loop?"

Visual: App shows a circular diagram that fills in as player answers.

---

### Exercise 12: Missing Piece Diagnostic (Ch 12)
Doc: Managing Complex Change

5 checkboxes — select what is missing:
- Vision (if selected → "Missing vision creates confusion")
- Skills (if selected → "Missing skills creates anxiety")
- Incentives (if selected → "Missing incentives creates gradual change")
- Resources (if selected → "Missing resources creates frustration")
- Action Plan (if selected → "Missing action plan creates false starts")

After selection: Shows diagnosis + asks "What will you put in place?"

---

### Exercise 13: Throne of Responsibility (Ch 13 — Raging Victim)
Doc: Victim-At Effect + Responsibility-At Cause + Consequences of Choice

Prompts:
1. Where am I at effect right now?
2. What story am I telling about what happened?
3. Whose agreement am I seeking by telling this story?
4. What am I explaining instead of correcting?
5. What action would put me at cause?
6. What consequence am I willing to own?
7. What would Majesty choose?

Required proof action: One responsibility action named.

---

### Exercise 14: Being Mirror (Ch 14 — Oasis of Being)
Doc: Coaching from Being + Coaching from Judgment vs Being

Prompts:
1. Where am I judging myself right now?
2. What would it sound like to coach myself from Being instead of judgment?
3. What would compassion say?
4. What would judgment say?
5. Can I listen to myself without becoming reactive?
6. What part of me needs to be heard right now?
7. What does my Essence know that I am not listening to?

Output: Fully unlocks the Awareness Mirror and teaches the Seeker to listen from Being before the final shadow appears.

---

### Exercise 15: Clean Movement Check (Ch 15 — Naive Warrior)
Doc: Consequences of Choice + Futurability + Managing Complex Change

Prompts:
1. Is this objective truly owned by me?
2. Is it measurable — do I have a date?
3. Is it inspired — or am I chasing it from panic?
4. Am I willing to choose all the consequences?
5. What missing piece (vision/skills/incentives/resources/plan) could cause a breakdown?
6. Am I moving from Joy or from fear right now?
7. What is the clean next action?

---

### Exercise 16: Shadow Naming Ceremony (Ch 16)
Doc: Self-Sabotage and Integrity + Present Context + Re-Invention + Powerful Stands

Runs for all 5 shadows. For each shadow the player has encountered:
1. What does this shadow say when it takes control?
2. When does it most often appear?
3. What is it protecting?
4. What old belief powers it?
5. What Essence is missing when it leads?
6. What proof action breaks its control?
7. What new stand do you take with this shadow?

Output: A complete Shadow Map — one page per shadow, fully filled.

---

### Exercise 17: Essence Stand (Ch 17)
Doc: Powerful Stands

Prompts:
1. What stand are you taking?
2. What Essence are you choosing to lead from?
3. What old identity is complete?
4. What new identity is being born?
5. What proof action makes this stand real today?

Powerful Stands list (player selects or writes their own):
- I live my life on purpose.
- I choose Being.
- I am my Essence.
- My actions are correlated to my intentions and purpose.
- I bring integrity to my internal and external environments.
- I let go and trust the process.
- I bring gratitude and joy to life today.
- The more possibility I create, the louder my internal conversation.

---

### Exercise 18: Life Purpose Reveal (Ch 18)
Doc: Life Purpose - Coach's Instructions

This is the final core exercise of the game. It is paced and cinematic, not rushed.

Step 1: Mirror Reflection
```
[Mirror shows Day One Snapshot]
"This is who you were when you began."
[Display: who_i_am, what_chasing, biggest_fear from onboarding]
"Read it. Remember."
[Continue when ready →]
```

Step 2: The Journey Reflection
```
"Look what you have become."
[Display: shadows named, Essences chosen, proof count, weeks on the journey]
"You were looking for: [goal_raw]"
"What were you actually looking for?"
[Text field]
```

Step 3: The Purpose Inquiry
```
Prompts (from Life Purpose - Coach's Instructions):
Q1: "What did you think you were chasing when you began?"
Q2: "If that were already present — what would it make possible?"
Q3: "And if that were present — what then would be possible?"
[Keep asking "what would that make possible" until player reaches a place of pure possibility, not fixing]
Q4: "What Essence did you discover in yourself on this journey?"
Q5: "What Being do you bring to the world?"
Q6: "What is your Life Purpose?"
[Large text field — the final declaration]
```

Step 4: The Reveal
```
[Full screen animation: treasure chest opens]
[Inside: the Life Purpose, written in the player's own words]
[Mirror shows: Day One Snapshot beside Life Purpose side by side]
"The milestone was the map."
"The shadow was the guardian."
"The proof was the path."
"The Essence was the key."
"This was the treasure the whole time."
[Life Purpose glows on screen]
```

---

### Chapter 19 Epilogue Flow: Return Home / Next Quest Seed
Doc: Re-Invention - Why How When

This is not counted as a core exercise. The Life Purpose Reveal in Chapter 18 is the final exercise. Chapter 19 is the return-home integration ceremony and optional next-quest seed.

Optional prompts:
1. Who am I now, at the end of this quest?
2. What identity is complete?
3. What new Being is emerging?
4. What must be reinvented next?
5. What is the next milestone from my Life Purpose?

Output: Creates a new quest if player declares a next milestone.

---

## 11.3 — Reference-Only Coaching Docs

These documents inform the exercises, mentor logic, and pattern detection engine, but they are not standalone player-facing chapter exercises:

- Sources and Patterns for Self Sabotage
- Present Context
- Addressing Self-Sabotage Practice Areas
- The-5-Shifts (7).pdf
- The Milestone Action Steps.docx
- Understanding the Relationship Between Therapy and Coaching

## 11.4 — Exercise Save + Resume

All exercises auto-save progress after each prompt answer.
Player can leave mid-exercise and return to the same point.
Exercise is marked complete only when all required prompts are answered AND (if required) a proof action is named.

## Definition of Done

- [ ] All 18 core exercises built as interactive flows
- [ ] Chapter 19 epilogue / next-quest seed flow built separately from the core exercise list
- [ ] Exercise save/resume working
- [ ] All exercises saving to `exercise_sessions` table
- [ ] Proof action capture working in all exercises that require it
- [ ] Loop Breaker circular diagram visualization built
- [ ] Life Purpose Reveal cinematic sequence complete
- [ ] Shadow Naming Ceremony runs for all 5 shadows with history data
- [ ] All exercises load coaching doc content appropriately

---

---

# PHASE 12 — Daily Proof System

**Category:** Game Loop
**Duration:** 3–4 days
**Owner:** Full-stack developer

## What Gets Built

The daily check-in system — the core habit loop that drives the entire journey forward. Proof is what moves the map.

## 12.1 — Daily Proof Entry Screen

Accessible from:
- Home screen / Quest Map (persistent "Add Today's Proof" button)
- Notification tap
- Shadow encounter resolution ("Take one proof action")

Fields:
```
Date: [auto-set to today]

"What proof did you create today?"
[Large text field — the main entry]

"What action did you complete?"
[Text field]

"What did you avoid?"
[Optional text field]

"What did today reveal about who you are becoming?"
[Optional text field]

"Which Essence were you operating from today?"
[5 Essence options — optional]

"Which milestone does this proof support?"
[Milestone selector — optional]
```

## 12.2 — Proof Submission Flow

After submission:
1. Entry saved to `daily_proof`
2. Streak calculated and updated
3. Milestone progress check: if proof is linked to active milestone, milestone bar advances
4. Shadow check: entry scanned for shadow trigger keywords
5. Reward check: streak milestones (7, 30, 60, 100 days) trigger celebrations
6. Confirmation animation: brief glow + "Proof submitted. The map advances."

## 12.3 — Streak System

```typescript
// On each proof submission:
const today = new Date().toISOString().split('T')[0];
const yesterday = subtractDays(today, 1);

if (streak.last_proof_date === yesterday) {
  // Consecutive day — increment streak
  streak.current_streak += 1;
} else if (streak.last_proof_date === today) {
  // Already submitted today — no change
} else {
  // Streak broken — reset to 1
  streak.current_streak = 1;
}

if (streak.current_streak > streak.longest_streak) {
  streak.longest_streak = streak.current_streak;
}
streak.last_proof_date = today;
```

## 12.4 — Streak Display

Shows in:
- Quest Map header (flame icon + number)
- Daily proof confirmation
- Weekly review summary
- Profile page

## 12.5 — Missed Day Handling

When user opens app after missing a day:
- Do NOT shame them
- Show: "The [Shadow Name] may have had some time. Let's check in."
- Opens Shadow check-in (mini Awareness Mirror flow)
- After check-in: can submit yesterday's proof + today's proof

## 12.6 — Proof History

User can scroll back through all past proof entries:
- Filtered by milestone, shadow, or Essence
- Shows patterns: which days shadow was present, which Essence was chosen
- Used as data for Shadow Naming Ceremony (Ch 16)

## Definition of Done

- [ ] Daily proof entry screen complete
- [ ] All 6 fields working
- [ ] Streak calculation correct
- [ ] Streak display in nav/map header
- [ ] Shadow keyword trigger scan on submission
- [ ] Proof history screen complete
- [ ] Missed day flow complete (shadow check-in)
- [ ] Streak milestones trigger reward events

---

---

# PHASE 13 — Milestone Progress Map

**Category:** Game Loop
**Duration:** 3–4 days
**Owner:** Frontend developer

## What Gets Built

The visual milestone tracker — the inner "road map" within each quest that shows how close the Seeker is to the treasure.

## 13.1 — Milestone Creation

Milestones are created during:
- Chapter 3: Future Vision Journal (reverse-engineered timeline from the future)
- Chapter 2: Milestone Formula exercise (8-step plan)

Each milestone has:
- Title
- Measurable result (what must be true to clear this gate)
- Deadline
- Reward (small / medium / large)
- Linked weekly actions

## 13.2 — Milestone Progress Bar

Visual progress toward each milestone.

Progress is calculated by:
- Number of daily proofs linked to this milestone
- Weekly actions completed
- Chapter gates cleared

Display:
```
[Milestone title]
[Progress bar: 0–100%]
[Deadline]
[Reward: "When complete: [reward]"]
[Weekly actions checklist]
```

## 13.3 — Milestone Completion

When a milestone is marked complete:
1. Completion animation (gate opens, diamond glow)
2. Reward appears on screen ("You earned: [reward]")
3. `rewards_earned` entry created
4. Chapter unlocks that were gated on this milestone
5. "What did completing this reveal about who you are becoming?" — capture prompt

## 13.4 — Milestone Timeline View

Visual timeline showing:
- All milestones in sequence
- Completed (glowing)
- Active (current)
- Future (locked/dim)

This is the "connection map" referenced in the data model — shows how each milestone links to the next.

## 13.5 — Milestone Rewards System

Three tiers, player-defined:
- Small ($0–$100 range examples): new shirt, dinner, game, experience
- Medium ($100–$300 range): spa, weekend trip, new tech
- Large ($300+ range): flight, major purchase, dream experience

The reward appears in the map as motivation pull: "Ahead: [reward]"

## Definition of Done

- [ ] Milestone creation during exercises working
- [ ] Milestone progress bar updating on proof submission
- [ ] Milestone completion ceremony complete
- [ ] Timeline view built
- [ ] Reward display working on map
- [ ] Completion capture prompt working

---

---

# PHASE 14 — Weekly Review System

**Category:** Game Loop
**Duration:** 3 days
**Owner:** Full-stack developer

## What Gets Built

The weekly cadence that keeps the journey structured — review past week, reset actions, and recommit.

## 14.1 — Weekly Review Trigger

- Triggered on Sunday (or day 7 of user's week, based on their start day)
- Push notification: "Your week is complete. The map calls for a review."
- Banner in app until completed

## 14.2 — Weekly Review Screen

**Part 1: Look Back**
```
"This week's proof count: [N]"
"Milestones advanced: [N]"
"Shadows that appeared: [list]"
"Essences you chose: [list]"
"Streak: [N] days"
```

**Part 2: Integrity Check**
```
"How many promises did you make this week?"
[Number field]

"How many did you keep?"
[Number field]

"Where were you out of integrity?"
[Text field]

"What does it cost you to stay out of integrity there?"
[Text field]

"What do you recommit to?"
[Text field]
```

**Part 3: Weekly Reset — Actions for Next Week**
```
"Declare your 3–5 weekly actions for next week."
"These are the proof-generating actions that will move your milestone."

[Add action] × 5 slots
For each:
  - Action description
  - How many times this week?
  - Which milestone does this support?
```

**Part 4: Closing Declaration**
```
"From being __________, this week I declare __________."
[Declaration field]

[Complete weekly review →]
```

## 14.3 — Weekly Data Storage

Saved to `weekly_reviews` table with:
- All Part 1 data auto-populated from DB
- Part 2 integrity data
- Part 3 weekly actions
- Part 4 declaration

## 14.4 — Weekly Actions Checklist

Weekly actions from Part 3 appear as a checklist in the daily proof entry for the following week: "Tick which weekly actions this proof supports."

## Definition of Done

- [ ] Weekly review trigger working (day 7 push + in-app banner)
- [ ] All 4 parts of weekly review screen complete
- [ ] Weekly data saved to `weekly_reviews`
- [ ] Weekly actions appear in daily proof form next week
- [ ] Integrity stats from previous week displayed

---

---

# PHASE 15 — Awareness Mirror

**Category:** Game Loop
**Duration:** 3–4 days
**Owner:** Frontend developer

## What Gets Built

The Awareness Mirror — the main meta-tool for shadow detection, pattern recognition, and Essence return. Built as a standalone screen accessible at any time from the nav.

## 15.1 — Mirror Entry Points

The Awareness Mirror is accessible from:
- Nav bar (always visible — mirror icon)
- Shadow encounter "noticed" phase (auto-opens)
- Daily proof (optional: "Check the mirror")
- Shadow Citadel chapter (Ch 16 — full mirror session)

## 15.2 — Mirror States

The mirror shows different content based on current state:

**State: Clear (no active shadow)**
```
[Mirror shows clear reflection]
"All clear. Which Essence are you operating from?"
[5 Essence buttons]
```

**State: Shadow Detected (system flagged a shadow)**
```
[Mirror shows cracked reflection tinted in shadow color]
"Something is here."
"One of these voices has been speaking. Which one do you recognize?"
[5 shadow cards]
```

**State: Shadow Named (player selected a shadow)**
```
[Mirror shows shadow figure, partially visible]
"[Shadow Name] has been speaking."
"Here are the things it has said:"
[List of that shadow's voice lines]
"What is it protecting you from?"
[Text field]
"What Essence is missing?"
[Essence selector]
```

**State: Essence Chosen (after selecting Essence)**
```
[Essence glow animation]
"[Essence activation line]"
"Now take one proof action from this place."
[Proof action field]
[Submit proof →]
```

## 15.3 — Mirror History / Pattern Map

The mirror tracks:
- All times it was opened
- Which shadows appeared
- Which Essences were chosen
- Which proof actions followed

Pattern view shows:
- "Your most frequent shadow: [Shadow Name]"
- "Your most chosen Essence: [Essence]"
- "These situations trigger [Shadow Name]: [pattern list from proof entries]"

This data feeds directly into Chapter 16 (Shadow Naming Ceremony).

## 15.4 — Mirror Affirmation Mode

For users who open the mirror when no shadow is active and Essence is clear:
- Shows a random Powerful Stand from the coaching doc
- Allows user to "claim this stand for today"
- Saved as a lightweight positive proof entry

## Definition of Done

- [ ] Mirror accessible from nav at all times
- [ ] All 4 mirror states working
- [ ] Shadow detection integration with Phase 8 engine
- [ ] Pattern history view complete
- [ ] Affirmation mode (clear state) working
- [ ] Mirror data feeds into Chapter 16 Shadow Naming Ceremony

---

---

# PHASE 16 — Prologue + Chapters 1–5

**Category:** Story Arc
**Duration:** 5–6 days
**Owner:** Frontend developer + Creative writer

## What Gets Built

The complete first arc of the journey: Prologue through the first shadow encounter (Broke King), ending with the Challenger Mentor's arrival as the handoff into Chapter 6.

## 16.1 — Prologue Scene

Cinematic (built in Phase 6 onboarding flow, finalized here):
- Father's Warning complete with final asset integration
- Three-gift delivery (map, mirror, warning) with animations
- Goal entry + Day One Snapshot
- Map reveal

## 16.2 — Chapter 1: The Dream That Would Not Leave

Story scene: The Seeker feels the pull of the dream. It won't leave.

Exercise: Anchor Mentor Why Session (deeper why beneath the goal; Life Purpose seed only)

Gate output: Goal confirmed, why articulated, quest officially begun. Day One Snapshot is now anchored for the Chapter 18 reveal.

UI: Chapter scene with narration + 5-prompt exercise.

## 16.3 — Chapter 2: The Anchor Mentor and the Why

Story scene: The Anchor Mentor returns and tests whether the dream can become an objective.

Mentor dialogue: Full Ch 2 question bank (see Phase 10).

Exercise: Futurability Check (8 checkboxes).

Gate output: Goal validated as futureable. Project officially born.

## 16.4 — Chapter 3: The Future Map

Story scene: Merlin figure shows two maps — one from now, one from the future.

Mentor dialogue: Ch 3 Future Map questions.

Exercise: Future Vision Journal (7 prompts).

Gate output: Milestones created from the future-back timeline. Map gates appear.

## 16.5 — Chapter 4: The Declaration Gate

Story scene: The first gate. It doesn't open from thinking. Only from declaring.

Exercise: Essence Declaration ("From being _____, I declare _____ by _____.")

Gate output: Declaration saved. First quest officially declared. Daily Proof unlocks.

## 16.6 — Chapter 5: The Forest of Lack (Broke King)

Story scene: The Seeker enters the dark forest. Meets a cracked-throne king.

Shadow encounter: Broke King appears as a character (appeared phase).

Mentor: None — Seeker is alone in the forest.

Exercise: Money Mirror (6 prompts).

Essence return: Power.

Gate output: Broke King resolved for first time. Power Essence unlocked.

## 16.7 — Challenger Mentor Arrival Handoff

Story scene: After the forest, the Seeker wants to blame. The Challenger Mentor appears at the edge of the next gate.

This phase only builds the arrival beat and cliffhanger line. The full Chapter 6 mentor dialogue and At Cause Reset exercise are built in Phase 17.

Gate output: Chapter 6 unlocks.

Key line: "You can have your reasons, or you can have your quest."

## Definition of Done

- [ ] All 6 chapters (Prologue + Ch 1–5) fully playable
- [ ] All scenes render with assets from Phase 5
- [ ] Ch 1 Anchor Mentor Why Session completes and saves Day One Snapshot data
- [ ] Ch 2–5 exercises complete and saving to DB
- [ ] Broke King shadow encounter completes full arc (appeared → resolved)
- [ ] Power Essence unlocked after Ch 5 resolution
- [ ] Challenger Mentor handoff unlocks Chapter 6
- [ ] Chapter gate animations working

---

---

# PHASE 17 — Chapters 6–10

**Category:** Story Arc
**Duration:** 5–6 days
**Owner:** Frontend developer

## What Gets Built

The second story arc: The Challenger Mentor → Proof Forge → Neon Chapel → Clock Desert → Tower of Unspoken Words.

## 17.1 — Chapter 6: The Challenger Mentor

Story scene: The Seeker enters the next gate and tries to explain what happened in the Forest of Lack.

Mentor dialogue: Ch 6 At Cause Reset question bank.

Exercise: At Cause Reset (6 prompts).

Gate output: Daily Proof officially unlocks. Streak begins.

## 17.2 — Chapter 7: The Proof Forge

Story scene: A workshop where every tool is powered by kept promises.

Character: The Operator (sub-character — a craftsman who teaches proof).

Exercise: Promise Forge (7 prompts).

Key line: "The map moves by proof."

Gate output: Daily Proof system fully active. Weekly action tracking begins.

## 17.3 — Chapter 8: The Neon Chapel (Addict Saint)

Story scene: Exhausted Seeker finds glowing chapel. Addict Saint welcomes him.

Shadow encounter: Addict Saint appears (appeared phase). Too kind. No exit.

Exercise: Compassionate Interruption (7 prompts).

Essence return: Love.

Gate output: Addict Saint resolved. Love Essence unlocked.

## 17.4 — Chapter 9: The Clock Desert

Story scene: A desert filled with broken clocks. "I don't have enough time."

The desert answers: "Time is not your enemy. Your relationship with time is the trial."

Exercise: Time Integrity Reset (7 prompts).

Gate output: Weekly Actions formally unlock. Time integrity commitment made.

## 17.5 — Chapter 10: The Tower of Unspoken Words (Silent Prophet)

Story scene: A tall tower of unwritten books, blank pages, silent stages.

Shadow encounter: Silent Prophet appears. Convinces Seeker that waiting is wisdom.

Mentor: Alchemist Mentor makes first appearance at the tower exit.

Exercise: Voice Gate (6 prompts).

Essence return: Radiance.

Required proof action: One public/visible action (post, message, share, publish).

Gate output: Silent Prophet resolved. Radiance Essence unlocked. Alchemist Mentor introduced.

## Definition of Done

- [ ] Chapters 7–10 fully playable
- [ ] Promise Forge exercise saving and activating weekly actions
- [ ] Addict Saint encounter completes full arc
- [ ] Love Essence unlocked
- [ ] Time Integrity Reset working and creating weekly structure
- [ ] Silent Prophet encounter completes full arc
- [ ] Radiance Essence unlocked
- [ ] Alchemist Mentor first appearance renders correctly

---

---

# PHASE 18 — Chapters 11–15

**Category:** Story Arc
**Duration:** 5–6 days
**Owner:** Frontend developer

## What Gets Built

The third arc: Loop Chamber → Change Compass → Ruins → Oasis → False Gold Market.

## 18.1 — Chapter 11: The Loop Chamber

Story scene: The Seeker trapped in a circular room. Same pattern repeats.

Guide voice: "Because it is a circle, you can intervene anywhere."

Exercise: Loop Breaker (circular diagram + 6 prompts).

Gate output: Pattern Detection unlocks in the Awareness Mirror.

## 18.2 — Chapter 12: The Change Compass

Story scene: Seeker thinks something is wrong with them. Mentor gives them a compass.

Exercise: Missing Piece Diagnostic (5 checkboxes + diagnosis).

Key line: "Do not shame the breakdown. Diagnose the missing structure."

Gate output: Player updates their project support structure. Missing pieces identified.

## 18.3 — Chapter 13: The Ruins of What Happened (Raging Victim)

Story scene: Ruined city of betrayal, lost time, broken promises. Raging Victim at the center.

Shadow encounter: Raging Victim appears. Validates the Seeker's pain — which becomes a cage.

Challenger Mentor reappears at the ruins exit.

Exercise: Throne of Responsibility (7 prompts).

Essence return: Majesty.

Gate output: Raging Victim resolved. Majesty Essence unlocked.

## 18.4 — Chapter 14: The Oasis of Being

Story scene: A place of peace. Heartkeeper appears.

Mentor: Heartkeeper dialogue (full Ch 14 session).

Exercise: Being Mirror (7 prompts).

Gate output: Awareness Mirror fully unlocked with all capabilities.

Key line: "The Seeker cannot shame himself into transformation."

## 18.5 — Chapter 15: The False Gold Market (Naive Warrior)

Story scene: A market of shiny promises, fast maps, glittering shortcuts.

Shadow encounter: Naive Warrior appears. Bold and exciting.

Exercise: Clean Movement Check (7 prompts).

Essence return: Joy.

Gate output: Naive Warrior resolved. Joy Essence unlocked. All 5 Essences now active.

## Definition of Done

- [ ] Chapters 11–15 fully playable
- [ ] Loop Breaker circular diagram built and working
- [ ] Missing Piece Diagnostic with correct diagnosis messages
- [ ] Raging Victim encounter full arc
- [ ] Majesty Essence unlocked
- [ ] Being Mirror working
- [ ] Awareness Mirror full unlock after Ch 14
- [ ] Naive Warrior encounter full arc
- [ ] Joy Essence unlocked
- [ ] All 5 Essences now available in Essence selector

---

---

# PHASE 19 — Chapters 16–19

**Category:** Story Arc
**Duration:** 5–7 days
**Owner:** Frontend developer + Creative writer

## What Gets Built

The climax arc: Shadow Citadel → Final Stand → Treasure Mirror (Life Purpose Reveal) → Return Home.

## 19.1 — Chapter 16: The Shadow Citadel

Story scene: All 5 shadows gather. Seeker sees them all at once. Father's warning finally makes sense.

Alchemist Mentor appears and speaks for the first time: "They were never strangers. They were parts of you."

Exercise: Shadow Naming Ceremony (runs for all 5 shadows — full session with history data).

Special mechanics:
- Pulls all past shadow encounter data from DB
- Shows the complete pattern history for each shadow
- Player writes a new stand for each shadow relationship

Gate output: Essence Selection fully unlocked (can choose any Essence for any situation). New identity milestone earned.

## 19.2 — Chapter 17: The Final Stand

Story scene: The Seeker at a cliff edge. The 5 shadows circle behind.

Alchemist Mentor: "You cannot destroy what once protected you. You can only stop letting it lead."

Exercise: Essence Stand (5 prompts + Powerful Stands selection).

The Seeker must declare their stand from one of the Powerful Stands or write their own.

Gate output: Final milestone gate opens. Life Purpose inquiry begins.

## 19.3 — Chapter 18: The Treasure Mirror (CLIMAX)

Story scene: The chamber. The chest. Inside: a mirror.

This is the full Life Purpose Reveal sequence (built in Phase 11, deployed here as the climax chapter).

Mechanics:
- Day One Snapshot displayed (captured in onboarding)
- Journey summary displayed (shadows, Essences, proof count, weeks)
- Life Purpose inquiry (full 6-prompt flow from Life Purpose coaching doc)
- The final reveal animation

Gate output: Life Purpose written and saved. Quest marked as final stage.

Key visual: Side-by-side comparison of Day One Snapshot vs Life Purpose — this IS the treasure reveal.

## 19.4 — Chapter 19: The Return Home

Story scene: The Seeker walks the same road home. The world is the same. He is different.

The Father appears. Final dialogue:
```
SEEKER: "The shadows were mine."
FATHER: "And now?"
SEEKER: "They can still walk with me. But they no longer lead me."
[Father smiles]
```

Epilogue flow: Return Home / Next Quest Seed (optional Re-Invention prompts).

Quest completion ceremony (see Phase 20).

Gate output: Quest marked complete. New quest option appears. The Return Road glows.

## Definition of Done

- [ ] Shadow Citadel pulls real shadow history data from DB
- [ ] Shadow Naming Ceremony runs all 5 shadows with historical data
- [ ] Final Stand exercise + Powerful Stands selection complete
- [ ] Treasure Mirror sequence fully playable end-to-end
- [ ] Day One Snapshot vs Life Purpose side-by-side reveal renders correctly
- [ ] Life Purpose saved to DB
- [ ] Father Return Home dialogue scene complete
- [ ] Return Home epilogue flow working with optional new quest creation
- [ ] Full quest marked complete in DB

---

---

# PHASE 20 — Reward + Ceremony System

**Category:** Polish
**Duration:** 3–4 days
**Owner:** Frontend developer + Animator

## What Gets Built

Every reward moment, completion animation, and ceremony in the app.

## 20.1 — Chapter Completion Ceremony

On completing each chapter:
- Gate opens with sound + animation
- Brief summary: "What you learned. What you carried forward."
- Reward if applicable (Essence unlocked, shadow resolved)
- "Next chapter awaits" preview

## 20.2 — Shadow Resolution Ceremony

When a shadow moves from "controlling" to "resolved":
- Shadow figure becomes translucent then retreats to map edge
- Essence glow fills the screen briefly
- Message: "[Shadow Name] no longer leads. [Essence] has returned."
- Small trophy/badge earned

## 20.3 — Milestone Completion Ceremony

When a milestone is complete:
- Gate opens on the timeline
- Reward appears (text + icon)
- Prompt: "What did completing this reveal about who you are becoming?"
- Streak bonus if completed on streak

## 20.4 — Streak Milestone Celebrations

| Streak | Celebration |
|---|---|
| 7 days | "One week of proof. The Broke King is quieter." |
| 30 days | "One month. You are becoming someone who keeps promises." |
| 60 days | "Two months. The shadows know your name — and you know theirs." |
| 100 days | "100 days of proof. The map has changed you." |

Each triggers a full-screen animation + badge.

## 20.5 — Life Purpose Reveal Ceremony (Chapter 18)

The biggest moment in the app. Full cinematic:
- Treasure chest opens (particle animation)
- Mirror reveals with glow
- Life Purpose text writes itself onto the screen (typewriter effect)
- Day One Snapshot fades beside it
- "The treasure was here the whole time." audio narration
- Confetti/particle burst in all 5 Essence colors

## 20.6 — Quest Completion Ceremony

When the full 19-chapter quest is complete:
- Full map glows with completed chapter colors
- All 5 shadows shown in their "resolved" positions at map edges
- All 5 Essences shown as unlocked and glowing
- Life Purpose displayed at the center
- "A new quest awaits" → option to begin next milestone

## 20.7 — Badge / Reward Gallery

A profile page section showing:
- All earned badges (shadow-named, Essence-unlocked, streak milestones, chapter-complete)
- Total proof count
- Longest streak
- Number of shadows named
- Life Purpose (the crown badge)

## Definition of Done

- [ ] Chapter completion ceremony working for all 19 chapters
- [ ] Shadow resolution ceremony for all 5 shadows
- [ ] Milestone completion ceremony working
- [ ] All 4 streak milestone celebrations
- [ ] Life Purpose Reveal cinematic complete and polished
- [ ] Quest completion full-map ceremony
- [ ] Badge/reward gallery on profile page

---

---

# PHASE 21 — Life Purpose Reveal (Deep Polish)

**Category:** Climax
**Duration:** 2–3 days
**Owner:** Frontend developer + Creative writer

## What Gets Built

Additional polish specifically for the Chapter 18 Life Purpose Reveal — the most important moment in the entire app.

## 21.1 — Pacing Review

Play through the entire Ch 18 reveal as a user.

Check:
- Is the Day One Snapshot shown with enough time to feel the weight?
- Does the Life Purpose inquiry feel too fast? Too slow?
- Does the final reveal feel earned?
- Does the side-by-side comparison land emotionally?

## 21.2 — Mirror Animation Polish

The Awareness Mirror that appears in Chapter 18 is special:
- Not cracked (shadow state)
- Not tinted (Essence state)
- Clear — shows the full journey
- Special animation: the mirror ripples and the Day One Snapshot appears in the reflection

## 21.3 — Father's Words Final Check

In Ch 18, the father's original warning from the Prologue should echo:
```
"The road will not only show you where the treasure is buried.
It will show you who you become when you are afraid."

[Beat]

"The shadows were never strangers."
"The mirror always knew."
"You were looking for this the whole time."
```

This text should appear alongside the Life Purpose reveal — making the father's words finally make full sense.

## 21.4 — Coaching Doc Integration

The Life Purpose exercise follows the coaching doc exactly:
- First answers are "fixes" (the doc warns of this)
- Coach prompt: "And if that were already present, what would that make possible?"
- Keep asking until pure possibility language appears
- App guides player to refine until the Purpose is not a "to do" but a "way of Being"

## 21.5 — Purpose Archive

After writing their Life Purpose, user can:
- Save it as wallpaper (exportable graphic)
- Share it (if they choose)
- See it on their profile at any time
- Have it displayed when they start a new quest

## Definition of Done

- [ ] Full Ch 18 pacing reviewed and adjusted
- [ ] Mirror ripple animation for Day One Snapshot reflection
- [ ] Father's words echo built into reveal sequence
- [ ] Coaching doc "keep asking what's possible" loop implemented
- [ ] Life Purpose archive on profile
- [ ] Export/share option working

---

---

# PHASE 22 — Notification + Habit Layer

**Category:** Polish
**Duration:** 3 days
**Owner:** Full-stack developer

## What Gets Built

The system that keeps players returning — notifications, streak guards, and habit-forming mechanics.

## 22.1 — Push Notifications

| Trigger | Message |
|---|---|
| Daily proof not submitted by 8pm | "The map waits. Add today's proof." |
| Streak about to break (11:30pm, no proof) | "11:30pm. One proof keeps the journey alive." |
| Shadow in "controlling" state for 24+ hours | "The [Shadow Name] has been quiet today. The mirror is open." |
| Chapter newly unlocked | "[Chapter title] is now open. The next gate is ready." |
| Weekly review due | "Your week is complete. The map calls for a review." |
| Milestone completed | "A map gate has opened. [Milestone title] is complete." |
| 7-day streak | "Seven days of proof. Something is changing." |

## 22.2 — Email Notifications

Weekly summary email (Sunday):
- Streak count
- Proof count for the week
- Shadows that appeared
- Essences chosen
- Current chapter
- One encouraging coaching line from the week's chapter

## 22.3 — In-App Habit Triggers

- Daily proof reminder banner (appears after 6pm if not yet submitted)
- Shadow banner (appears when shadow is in controlling state)
- Weekly review banner (appears Sunday through next Monday if not done)
- Mentor "check in" prompt (appears after 3 days of proof in same chapter)

## 22.4 — Streak Guard

When streak is about to break (11pm, no proof submitted):
- Full-screen gentle prompt
- "One minute of proof. That's all the map needs."
- Minimal proof entry: just "What proof did I create today?" — one field
- Submit → streak preserved

## Definition of Done

- [ ] Push notifications implemented for all 7 triggers
- [ ] Weekly summary email template built and sending
- [ ] All 4 in-app habit triggers working
- [ ] Streak guard working (11pm trigger)
- [ ] Notification permission request in onboarding

---

---

# PHASE 23 — Audio + Cinematic Layer

**Category:** Polish
**Duration:** 4–5 days
**Owner:** Audio designer + Frontend developer

## What Gets Built

The sound design and ambient audio that makes the world feel alive.

## 23.1 — Ambient Soundscapes (per world zone)

Each world zone has its own ambient loop:

| Zone | Soundscape |
|---|---|
| Home | Soft wind, warm morning sounds |
| Forest of Lack | Low-freq dread, distant whispers, broken silence |
| Neon Chapel | Soft synth hum, comforting but slightly off |
| Tower of Unspoken Words | Near-silence, distant echoes, paper rustling |
| Clock Desert | Wind, ticking clocks, silence under heat |
| Ruins of What Happened | Distant rumble, reverb, hollow wind |
| False Gold Market | Chaotic buzzing, overlapping voices, glittering sounds |
| Proof Forge | Rhythmic, mechanical, purposeful |
| Oasis of Being | Water, calm, breathing |
| Shadow Citadel | All 5 shadow sounds layered, tense |
| Treasure Mirror Chamber | Pure resonance, silence, then opening tone |
| Return Road | Morning sounds, same as Home but brighter |

## 23.2 — UI Sound Effects

| Event | Sound |
|---|---|
| Chapter gate opens | Low tone + release |
| Shadow appears | Subtle dissonance |
| Shadow named | Tone shift (dissonance → clarity) |
| Essence chosen | Essence-specific tone (see Phase 9) |
| Proof submitted | Soft chime + confirmation click |
| Milestone complete | Full chord resolution |
| Streak milestone | Multi-layered celebration |
| Life Purpose reveal | Orchestral swell + silence + resonance |

## 23.3 — Mentor Voice Narration (Optional V2)

Optional for MVP: key lines spoken by voice actors.

Lines to narrate for MVP:
- Father's Warning (Prologue) — full script
- Life Purpose reveal narration (Ch 18)
- Chapter gate opening line (each chapter)

V2: Full mentor dialogue narrated.

## 23.4 — Chapter Transition Cinematics

Brief animated transition between chapters (3–5 seconds):
- Seeker walks from one zone to the next
- Zone visual fades → new zone appears
- Ambient audio crossfades

## 23.5 — Audio Settings

- Master volume control
- Music on/off toggle
- Sound effects on/off toggle
- Narration on/off toggle (V2)

## Definition of Done

- [ ] All 12 ambient soundscapes implemented and looping correctly
- [ ] All 9 UI sound effects implemented
- [ ] Chapter transition cinematics complete
- [ ] Audio settings panel working
- [ ] Audio works on mobile (no autoplay blocking issues)

---

---

# PHASE 24 — Mobile + PWA

**Category:** Polish
**Duration:** 3–4 days
**Owner:** Frontend developer

## What Gets Built

Mobile-optimized layout, Progressive Web App installability, and offline capability.

## 24.1 — Mobile Layout Audit

Every screen reviewed on:
- iPhone SE (375px width — smallest common)
- iPhone 14 Pro (393px)
- Samsung Galaxy S23 (360px)
- iPad Mini (768px)

Fix list typically includes:
- Font size on small screens
- Touch target sizes (minimum 44px)
- Map pinch-to-zoom on world map
- Drawer heights on mobile
- Keyboard push on exercise forms

## 24.2 — Progressive Web App

PWA manifest:
```json
{
  "name": "Milestone Mapping — The Diamond Path",
  "short_name": "Diamond Path",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#080d19",
  "theme_color": "#06b6d4",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

## 24.3 — Offline Capability

Service worker caches:
- Current chapter content
- Active exercise
- Last 7 days of daily proof data
- Quest map state

When offline:
- Can submit daily proof (syncs on reconnect)
- Can review current chapter exercise
- Cannot advance chapters (requires DB validation)
- Shows "You're offline. Proof will sync when connected." notice

## 24.4 — Install Prompt

At the end of the Prologue (after Day One Snapshot):
- "Add the Diamond Path to your home screen to keep the journey close."
- Native PWA install prompt

## 24.5 — Performance Budget

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

## Definition of Done

- [ ] All screens responsive on 375px, 393px, 360px, 768px
- [ ] PWA manifest configured
- [ ] Service worker caching daily proof and chapter data
- [ ] Offline proof submission + sync working
- [ ] Install prompt shown after Prologue
- [ ] Performance budget met on Lighthouse audit

---

---

# PHASE 25 — QA · Beta · Launch

**Category:** Launch
**Duration:** 7–10 days
**Owner:** Full team

## What Gets Built

The complete end-to-end test of the app, beta feedback collection, bug fixes, and production launch.

## 25.1 — Internal QA Playthrough

Full playthrough of the complete 19-chapter journey by:
- Jon (content/story accuracy check)
- Developer 1 (functionality check)
- Developer 2 (edge cases, mobile)

Test checklist:
- [ ] Prologue → Chapter 19 playable end-to-end without errors
- [ ] All 5 shadow encounters complete their full arc
- [ ] All 5 Essences unlock at correct chapters
- [ ] All 3 mentor sessions trigger at correct moments
- [ ] All 18 core exercises save correctly to DB
- [ ] Daily proof streak calculates correctly (including missed days)
- [ ] Weekly review generates from real data
- [ ] Life Purpose Reveal shows correct Day One Snapshot
- [ ] Chapter unlock requirements enforced
- [ ] All reward ceremonies trigger
- [ ] Notifications fire at correct times
- [ ] PWA installs and works offline
- [ ] All audio plays without blocking

## 25.2 — Beta Group

Invite 5–10 real users (Jon's coaching clients ideally) to run Chapters 1–10.

Feedback collection:
- After each chapter: "How did this chapter feel? What was unclear?"
- After first shadow encounter: "Did the shadow feel real to you?"
- After first Essence return: "Did choosing the Essence feel meaningful?"
- After Week 1: "Are you checking in daily? What helps or hinders?"

## 25.3 — Bug Fix Sprint

3–5 days of bugs from QA + beta.

Priority order:
1. Data loss bugs (proof not saving, exercise answers lost)
2. Unlock logic bugs (chapters unlocking wrong or not at all)
3. Shadow trigger bugs (wrong shadow firing, shadow not resolving)
4. Animation/ceremony bugs (reveal not showing, glow not firing)
5. Mobile layout bugs

## 25.4 — Production Launch Checklist

- [ ] Supabase project on paid plan (connection pooler enabled)
- [ ] Environment variables locked in production
- [ ] Error tracking (Sentry or equivalent) enabled
- [ ] Analytics (Posthog or equivalent) with key events tracked
- [ ] GDPR/privacy policy in place
- [ ] Terms of service in place
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Database backups automated (daily)
- [ ] Edge functions deployed to production
- [ ] PWA manifest live
- [ ] All coaching doc content legal-cleared (Jon to confirm)

## 25.5 — Key Analytics Events to Track

| Event | Why |
|---|---|
| `quest_started` | How many users begin |
| `chapter_complete` | Where users drop off in the journey |
| `shadow_named` | How often the shadow system engages |
| `essence_chosen` | Which Essences are used most |
| `daily_proof_submitted` | Core engagement metric |
| `streak_N_days` | Retention shape |
| `life_purpose_revealed` | The most important completion metric |
| `quest_complete` | Full journey completion rate |

## 25.6 — Post-Launch Roadmap (V2 Backlog)

| Feature | Priority |
|---|---|
| AI-enhanced mentor dialogue (Claude API) | High |
| Coach dashboard (Jon sees client journeys) | High |
| Group quest (team milestones) | Medium |
| Voice narration for chapters + mentor | Medium |
| Second quest arc (next milestone from Life Purpose) | High |
| Shadow journal (long-form shadow work) | Medium |
| Community proof wall (opt-in sharing) | Low |
| Integration with Supabase Realtime (live coach view) | Medium |

## Definition of Done

- [ ] Full QA playthrough complete with sign-off
- [ ] 5+ beta users have run Chapters 1–10
- [ ] All P1 + P2 bugs fixed
- [ ] Production launch checklist 100% complete
- [ ] Analytics events firing correctly
- [ ] App live at production URL
- [ ] Jon has reviewed live version and given final approval

---

---

# APPENDIX A — Phase Dependencies

```
Phase 1 (Story Bible) → Phase 2 (Characters) → Phase 10 (Mentor Dialogue) → Phases 16–19 (Story Arc)
Phase 3 (Database) → Phase 6 (Auth) → Phase 7 (Quest Map) → Phases 16–19
Phase 4 (Design System) → Phase 5 (Assets) → All UI phases
Phase 5 (Assets) → Phases 7, 8, 9, 10, 16–19, 20
Phase 8 (Shadow Engine) → Phase 9 (Essence) → Phase 15 (Awareness Mirror) → Phase 16–19
Phase 11 (Exercises) → Phases 16–19 (all chapter exercises)
Phase 12 (Daily Proof) → Phase 13 (Milestones) → Phase 14 (Weekly Review) → Phase 22 (Notifications)
Phases 16–19 (Story Arc) → Phase 20 (Ceremonies) → Phase 21 (Life Purpose Polish)
Phases 20–24 (Polish) → Phase 25 (Launch)
```

# APPENDIX B — Minimum Viable Product

If resources require cutting scope, the MVP is:

**Must have:**
- Prologue + Chapters 1–10 (first arc + second arc)
- Daily Proof system
- Broke King + Addict Saint shadow encounters
- Power + Love Essence returns
- Anchor Mentor + Challenger Mentor sessions
- Futurability, Declaration, Money Mirror, At Cause Reset, Promise Forge exercises

**Can ship in V2:**
- Chapters 11–19
- Silent Prophet, Raging Victim, Naive Warrior shadows
- Radiance, Majesty, Joy Essences
- Life Purpose Reveal
- Return Home
- Audio layer
- Weekly Review system

**North Star:**
The Life Purpose Reveal (Chapter 18) is the whole point of the app. The MVP is acceptable only as a temporary state — Chapter 18 must ship in V1.1 at the latest.

---

# APPENDIX C — The Story North Star

When any build decision is unclear, return to this:

> The boy left home looking for treasure.
> He met shadows and thought they were strangers.
> The shadows followed him.
> Then they became him.
> Then they controlled him.
> Through mentors, exercises, declarations, promises, responsibility, time, proof, and Essence, he learned to see the shadows clearly.
> He did not destroy them.
> He stopped letting them lead.
> At the end, he found the treasure.
> But inside the treasure was a mirror.
> The mirror revealed his Life Purpose.
> He had been looking for it the whole time.
> That is Milestone Mapping.
> A milestone is not just a goal.
> A milestone is the road that reveals who you are becoming.
