# APP STORE REJECTION RISK REPORT — Milestone Mapping

**Date:** 2026-07-07 · **Scope:** working tree as of right now (including all uncommitted Alpha wizard / clown-stomp / EatTheFrog work) · **Method:** 9 web-research agents (Apple guidelines, Apple Dev Forums, Reddit-adjacent forums, HN, 2025–2026 industry reports) + 6 codebase-audit agents, cross-referenced. Companion docs: `APP-STORE-REJECTION-RESEARCH-PROMPT.md` (the reusable research prompt), `APP-STORE-SUBMISSION-CHECKLIST.md` (the 2026-07-07 ten-auditor pass this report builds on).

**Bottom line: submitted today, this app would be rejected — but for a short, fixable list.** The hard blockers are the stock icon/splash, a privacy policy that's blind to the entire new health-data surface, and three App Store Connect hard gates (new age-rating questionnaire, DSA trader declaration, Xcode 26 SDK build). Behind those sit ~9 likely flags, all with cheap fixes. The core compliance architecture (UGC stack, deletion, guest mode, offline behavior, content gates) audited **strong** — most of what the 10-auditor pass fixed is confirmed still intact.

---

## 🔴 BLOCKERS — submission fails or near-certain rejection

### B1 · Stock Capacitor icon AND splash still shipping — 2.1 / 2.3.8 / 4.3
Visually confirmed: `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png` is the blue Capacitor plug logo; all 3 splash PNGs are the stock white splash (clashing with the dark theme). Direct precedent: Ionic apps rejected for stock framework icons *found in the bundle* — and in 2026 stock assets also pattern-match the "AI-slop" profile reviewers actively filter (4.3 got new "low-effort apps can be pulled" language June 2026).
**Fix:** real art per `APPSTORE-IMAGES-NEEDED.md` → `npx @capacitor/assets generate`. Sweep the compiled bundle for leftover default icons too. When generating art with AI: sweep for brand fragments — 5.2.2 rejections for AI-art leaking Instagram/Spotify-like glyphs are the #1 proactive IP rejection in 2025–2026.

### B2 · Privacy policy is blind to the entire fitness/nutrition data surface — 5.1.1
`public/legal/privacy.html` (updated today) never mentions: workout logs (`workout_*` tables), body weight + body-fat % (`EatingCalculator.jsx:65-66` → `alpha_state`), calorie/macro targets, fasting/sleep/cheat-day logs (`alpha_events`), or food/fridge photos (`FillYourFridge.jsx:93-109` → `fridge-photos` bucket + base64 thumbnails in DB). The ASC label will declare "Health & Fitness" — a label with no policy sentence backing it is a classic 5.1.1/5.1.2 mismatch.
Also: the policy's claim **"nothing you create is public on the open web" is false** — `imageUploadService.js:22` uses `getPublicUrl` on the public `user-images` bucket (vision-board images readable by anyone with the URL).
**Fix:** add one "Fitness & nutrition data" bullet to §What we collect; make `user-images` private + signed URLs (or soften the sentence).

### B3 · Three App Store Connect hard gates (can't submit / auto-reject without them)
1. **Xcode 26 / iOS 26 SDK is mandatory for ALL submissions since Apr 28, 2026** — an older toolchain auto-rejects at upload. **Verify the Codemagic build image before archiving.**
2. **The age-rating questionnaire was overhauled July 2025 — "17+" no longer exists** (tiers: 4+/9+/13+/16+/18+, new mandatory medical/wellness + violent-themes + in-app-controls questions). The checklist §4 answers must be re-planned (see Y1/Y2).
3. **EU DSA trader declaration hard-gates every new-app submission.** Free/no-ads solo dev can declare **non-trader** (nothing published) — but any in-app promotion of Jon's coaching business flips it to trader (then: published address + phone; PO box + VoIP is the standard play). Alternative: exclude the 27 EU territories at launch and the question disappears.

---

## 🟠 LIKELY FLAGS — high rejection probability if unfixed

### L1 · pollinations.ai needs explicit AI consent — 5.1.2(i) (rule added Nov 13, 2025)
Apple now requires **explicit consent BEFORE personal data is shared with third-party AI, naming the provider** — buried-in-policy doesn't count, and "user-triggered" isn't consent. `imageGen.js:4` sends user-typed reward text to `image.pollinations.ai`. (The `text.pollinations.ai` TTS fallback sends only scripted lines — lower risk, but cover it in the same consent.)
**Fix:** one-time in-context consent modal on first vision-board generation: "This sends your prompt to Pollinations.ai to generate the image — nothing else is shared. [Generate] [Cancel]". Policy already names the provider ✓.

### L2 · The demo account can be deleted by the reviewer — 5.1.1(v) → 2.1
Reviewers test account deletion; `supabase/functions/delete-account/index.ts` has **no guard for coachowkins@gmail.com**. Documented pattern (Apple forums thread 704811): reviewer deletes demo account → later login fails → "bug" rejection.
**Fix:** demo-email guard in the edge function (friendly refusal or fake-success), spare credentials in review notes, pre-seeded realistic data in the account. Also: **keep the Supabase project active for the whole 2–5+ day review window** (free-tier inactivity pausing would kill the demo login mid-review).

### L3 · THE VOW is a real 1.2 UGC gap (+ two smaller ones)
Vow title/if-cue/stake is free text shown to the witness and squadmates (and pushed into the witness's notification) with **no content filter** (`arenaService.js:18-26`; RPC checks length only), **no report button** (zero in `zone/arena/`), and squad-vow RLS **doesn't check blocks** (`007:161-168`). This directly contradicts the planned review notes ("report button on every content surface"). Smaller siblings: the 280-char **partner note** is unfiltered (`zoneService.js:122-123`), and `joinZone` usernames skip `assertClean` (`zoneService.js:25-31`).
**Fix:** `assertClean` on vow create + partner note + joinZone; ReportButton on vow rows; block check in `arena_vows_select`. Also verify the moderation inbox can **eject/ban a user** (Apple's 1.2 boilerplate demands removal + ejection within 24h) and say so in review notes.

### L4 · The Crossing traps users after phase 5 — 2.1 UX
Skip exists only for the first 5 of 9 phases (`TheCrossing.jsx:51`); progress persists, so a force-quit resumes **locked past the skip**; firstWin then hard-requires two typed free-text fields. A reviewer on a fresh signup is trapped in a mandatory typed cinematic. (The demo account bypasses it entirely — verified — but reviewers routinely also create a fresh account.)
**Fix (one line):** extend `SKIPPABLE` through `torch`.

### L5 · The calorie calculator + eating tables have no sources — 1.4.1 "sources" template
The single most-fired health rejection template targets exactly this: "health recommendations, calculations… without including the sources." The Alpha calculator, phase eating tables, hormone claims ("night carbs feed growth hormone"), and the **scheduled 24-hour full-fast day** are all uncited; the new food surfaces (FridgePage, MealTimeline, ProgramConsole) **lack the disclaimer** the older screens have; and no warm-up guidance renders anywhere despite heavy opening sets.
**Fix:** a small "Sources & methodology" screen linked from the calculator + program pages (cite recognized references); add the guideline's own magic words — "consult your physician before beginning this or any exercise or nutrition program" — at program start; copy the existing disclaimer line onto FridgePage/ProgramConsole; render the warm-up flag (`phases.js:206` — data exists, nothing renders it); change "64 trials **proved**" → "have shown" (`constants.js:38`, `researchData.js:8`).

### L6 · PrivacyInfo.xcprivacy is missing 5 declared data types
Manifest declares only EmailAddress/OtherUserContent/UserID; the planned label adds Photos/Videos, Messages (DMs), Health, Fitness, Sensitive Info (prayers). Label ≠ manifest is a needless audit flag.
**Fix:** add the 5 dict entries (all linked=true, tracking=false, AppFunctionality). UserDefaults CA92.1 is already correct ✓.

### L7 · The app formally claims iPad Split View — and iPad is untested — 2.1
`TARGETED_DEVICE_FAMILY = "1,2"` + all-4-orientation iPad + no `UIRequiresFullScreen` = full iPad multitasking claimed, iPad screenshots **required**, and review **will** run on iPad. Worse: `UIRequiresFullScreen` is deprecated and **ignored on iPadOS 26**, so adding it won't hold.
**Fix (decision):** either set `TARGETED_DEVICE_FAMILY = 1` (iPhone-only) for v1 — simplest — or actually test iPad including portrait and narrow multitasking widths (canvas games + video backgrounds are the risk).

### L8 · Zone members in airplane mode see the join flow — 2.1
`ZonePage.jsx:75` ignores fetch errors: network failure → `member=null` → a signed-in member is shown "claim your @name" onboarding whose submit errors. Reviewers do the airplane-mode poke.
**Fix:** branch on `error && !state` → retry screen.

### L9 · "Asset Library" dev tool ships in the More sheet — 2.1 optics
`MoreSheet.jsx:28` exposes `AssetLibraryPage` ("Production Asset Library") printing `public/assets/...` paths to end users — reads as unfinished scaffolding.
**Fix:** remove the tile (keep the page dev-routable).

---

## 🟡 REVIEWER-DEPENDENT / DECISIONS

- **Y1 · 16+ vs 18+ (17+ is gone).** Under the new mapping, the honest *calculated* rating is likely only **13+** (frequent profanity → 13+ now; frequent cartoon violence → 13+). Shipping 18+ means a **voluntary "Override to Higher Age Rating"** — zero rejection risk, but since Feb 2026 18+ downloads are **hard-blocked for non-adult-confirmed users in Australia, Brazil, Singapore** (model spreading), and it doesn't exempt you from the Texas/Louisiana Declared Age Range API anyway. 16+ + the RAW gate (declared in the questionnaire's new "in-app controls" field) is the wider-reach configuration; 18+ is the more conservative one. Decide deliberately; **changing later counts as a "significant change" under Texas law** — pick before launch.
- **Y2 · One questionnaire answer is factually wrong:** Alcohol/Drugs "None" → must be **Infrequent/Mild references** ("No weed today"/"No alcohol today" checklist items, Neon Chapel's "the drink"). All abstinence-framed, doesn't change the tier, protects against 2.3.6 mismatch.
- **Y3 · "MAPQUEST CITY" is user-facing and MapQuest is a live trademark** (System1, relaunched 2024) — on a *map/journey* feature, the confusion argument writes itself. Confirmed user-facing: dashboard card (`CityHeroCard.jsx:20`), page title (`MapQuestCityPage.jsx:288`), welcome overlay, achievement text (`achievements.js:155`), atlas node (`WorldAtlas.jsx:65`), in-world gate sign (`cityWorld.js:126`). One complaint via Apple's merits-blind dispute process = ticking-clock removal. **Fix:** rename user-facing strings (internal `mqc-`/`mqw-` prefixes can stay); keep it out of ASC metadata/screenshots.
- **Y4 · Alpha's book fingerprints.** Legally low-risk (9th Cir., Feb 2026 *Tracy Anderson*: workout programs are uncopyrightable systems; cues are paraphrased; no author/title anywhere ✓). But the four phase names **PRIME/ADAPT/SURGE/COMPLETE are the book's branded names** riding its exact numeric skeleton, "the book" leaks into shipped copy once (`MealTimeline.jsx:107`), and repo comments admit derivation. **Fix:** rename the 4 phases (lore renames already proven), reword `:107`, scrub comments. Never reference the book in marketing.
- **Y5 · Content margins (all defensible, keep the defenses):** Door blood vocabulary ("Closed. In BLOOD.", knuckle stages) is covered by cartoon SVG art + fiction disclaimers — don't remove them, keep Realistic Violence at Infrequent/Mild, and keep violence/profanity **out of screenshots** (metadata is held to an all-ages bar). Two ungated "bullshit" lines in Alpha (`AlphaCall.jsx:202`, `journey.js:16`) — fine under Frequent Profanity, soften for margin. Badge inconsistency: cards say "21+ RAW", gate says "I'M 18+" — pick one.
- **Y6 · 4.2 minimum functionality: LOW** (bundled content, offline-first, haptics/camera, no `server.url` ✓) — but first-time Capacitor accounts get extra scrutiny in the 2026 anti-slop climate. Put a native touch in the reviewer's first 30 seconds; enumerate native integrations in review notes; **never call the game modes "mini apps/mini games" in metadata** (4.7 trigger since Nov 2025).
- **Y7 · Error-boundary + polish gaps:** the entire new Alpha wizard, TheCrossing, AnxietySOS, and FieldJournalMode render outside the per-page ErrorBoundary (crash → whole-app "Something glitched"); guests see a Delete Account button that always fails; offline fetch errors misclassify existing users as fresh (`useAppData.js:125`). All small fixes.
- **Y8 · 1.2's forgotten fifth item:** published, easily-findable **support contact** in-app AND on the App Store listing. Personal Gmail is acceptable if monitored (branded is better).
- **Y9 · Auth email deep links:** custom scheme is fine per se; the 2.1 risk is the emailed link dead-ending (SFSafariViewController + PKCE quirks are documented Supabase-on-Capacitor failures). Test signup-confirm + password-reset from a real Mail.app tap on TestFlight; demo account keeps the reviewer off this path.
- **Y10 · Migrations:** unapplied 012/013-alpha/016 degrade **silently and safely** (verified: local-first caches everywhere, no error UI) — but apply them anyway so sync works, and fix the **"013" filename collision first** (`015_report_intake.sql` is internally "013"; prod has report-intake + filter applied, iron/alpha/fridge NOT).
- **Y11 · Texas/Louisiana age-assurance APIs:** Apple says no App Review gate today, but devs "must implement the Declared Age Range API where legally required" — even 18+ apps. Needs a native Swift shim in Capacitor eventually; plan it, don't block launch on it.

---

## 🟢 VERIFIED SAFE — audited, do NOT worry about these

- **Sign in with Apple (4.8): exempt** — email/password only. One trap: never route login through the system browser.
- **Export compliance** (`ITSAppUsesNonExemptEncryption=false`): settled ✓.
- **No ATT prompt needed** — verified zero analytics/tracking/ad SDKs, no geolocation, no device IDs.
- **ElevenLabs is bake-time only** — no runtime endpoint anywhere in src ✓.
- **Account deletion purge is complete** — covers all new tables (cascade) and all buckets (recursive `listBuckets` sweep), including fridge photos ✓.
- **UGC stack otherwise over-spec:** content filter unweakened client+server, blocking RLS solid across feed/DMs/comments/leaderboards, report submission works even without the intake migration, ToS + community-rules gates intact ✓.
- **Clown stomp, EatTheFrog, arena:** clean — cartoon-only, no gambling anywhere (stakes explicitly non-monetary), quips target archetypes not people ✓.
- **Religious content:** reverent/neutral throughout; prayers covered by policy ✓.
- **Crisis handling is a strength:** 988 on 4 surfaces + 2 keyword scanners routing to crisis cards (most competitors get this wrong) ✓.
- **Guest mode, offline cold launch, RAW gate integrity, camera-deny path, purpose strings, no remote loading, concept HTMLs don't ship, deep-link race fix intact** — all verified by inspection ✓.
- **4.3 spam:** breadth is not a trigger; the app is original ✓.
- **Book program legality:** structure is uncopyrightable (see Y4) ✓.

---

## What changed since the 10-auditor pass (2026-07-07 morning)

**Confirmed still fixed:** purpose strings, arm64, encryption flag, URL scheme, portrait iPhone, PrivacyInfo in pbxproj Resources, local-notifications/share fully removed, keyboard resize:native, fonts self-hosted in the bundle, legal modals (zero new external links in the delta), startOpen deep-link landmine respected.
**New since that pass (this report's finds):** B2 (health-data policy gap — created by Alpha), L1 (AI-consent rule applies to existing pollinations use), L3 (THE VOW gap predates but was missed), L4/L8/L9 (walkthrough finds), L5 (new food surfaces without disclaimers), L7 (iPad claim), Y1–Y4 (rating overhaul, alcohol answer, MapQuest, book phase names).
**Checklist corrections:** §4's age-rating table uses the dead 17+ system — replace with the new questionnaire; §2's "commit public/ or CI archives stale" is mechanically wrong (public/ is gitignored; CI rebuilds fresh — no action, just accurate knowledge).

## Ordered pre-submission punch list

1. Real icon + splash → `capacitor/assets generate` → sweep bundle (B1)
2. Privacy policy fitness bullet + user-images bucket fix (B2)
3. Verify Codemagic uses Xcode 26 image (B3)
4. Re-plan age questionnaire under new system; decide 16+ vs 18+; Alcohol → Infrequent/Mild (B3/Y1/Y2)
5. DSA: declare non-trader or exclude EU (B3)
6. Demo-account delete guard + seed data + keep Supabase awake (L2)
7. Pollinations consent modal (L1)
8. THE VOW filter/report/block + partner-note/joinZone filters + eject capability check (L3)
9. Crossing SKIPPABLE through torch (L4)
10. Sources screen + physician line + food-surface disclaimers + warm-up render + "proved"→"have shown" (L5)
11. xcprivacy 5 data types (L6)
12. iPad decision: family=1 or test iPad properly (L7)
13. Zone offline retry branch (L8) · Asset Library tile removal (L9)
14. Rename MAPQUEST CITY user-facing strings (Y3) · rename PRIME/ADAPT/SURGE/COMPLETE + `MealTimeline.jsx:107` (Y4)
15. ErrorBoundary around overlays; hide guest delete card; 21+/18+ badge consistency (Y5/Y7)
16. Apply migrations (fix 013 collision first) (Y10)
17. Screenshots: real reachable states, all-ages content, iPhone (+iPad if family=1,2); review notes: demo creds + RAW gate walkthrough + moderation plan + native-features list (metadata hygiene)
