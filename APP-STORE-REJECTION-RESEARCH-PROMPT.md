# APP STORE REJECTION RESEARCH PROMPT — Milestone Mapping

> **How to use this doc.** Paste the whole thing (or one category section) into any deep-research
> tool (Perplexity, Claude, ChatGPT, Gemini) — or hand it to a Claude Code session to execute with
> web-search agents. Every section is self-contained: it carries the app profile, the exact research
> questions, suggested search queries, and the output format to demand. Prefer sources from
> **2025–2026**; flag anything older. Demand **guideline numbers + concrete anecdotes + URLs**,
> not summaries of Apple's marketing pages.

---

## 0 · APP PROFILE (context for every question below)

- **App**: "Milestone Mapping" — personal-development super-app: goal/milestone mapping, daily
  planning, gratitude/priming rituals, anger-processing mini-games, shadow-work exercises,
  anxiety SOS breathing game, a fitness mode (workout tracker + structured multi-phase training
  programs + eating/nutrition calculator), a gamified story world (side-scrolling city, quests),
  and a **private social network** ("the Zone": posts, comments, DMs, squads, photo proof uploads).
- **Stack**: React 18 + Vite web app wrapped in **Capacitor** (hybrid webview iOS app).
  Backend: **Supabase** (auth = email/password only, Postgres + RLS, storage buckets, edge functions).
  Hosting for web build: Netlify. Optional runtime third party: **pollinations.ai** (user-triggered
  AI image/voice generation). Pre-baked ElevenLabs MP3 voice files ship in the bundle (no runtime API).
- **Monetization**: none. No ads, no analytics SDKs, no tracking, no IAP, no purchases. Free app.
- **Age rating**: intends **17+/18+** — frequent/intense profanity (scripted first-party audio behind
  a one-time in-app 🔞 "RAW" confirmation gate), frequent/intense cartoon/fantasy violence
  (satirical "rejection-resilience" games for sales professionals: door-slam boxing, stomping
  cartoon "hater" clowns in a side-scroller), mild realistic violence, mild mature themes.
- **Sensitive data collected**: email, username, user-generated content (posts/DMs/photos/journal
  entries **including prayers** = religious data), **mood check-ins** and wellbeing exercise logs
  (health data), **workout logs + body-weight + calorie/macro targets** (fitness/health data).
  All linked to identity, none used for tracking. No ATT prompt (nothing to track).
- **Compliance already built**: guest mode ("Continue without an account" — only the social Zone
  requires login), in-app account deletion with full server purge, privacy policy + ToS bundled
  and hosted, UGC moderation (client + server content filter, report buttons, 2-way blocking,
  24h-review reports inbox), PrivacyInfo.xcprivacy in the bundle, camera/photo permission strings,
  portrait-locked iPhone, in-app legal modals (no target=_blank), self-hosted fonts,
  ErrorBoundaries, deep-link auth callbacks (`milestonemapping://`), export compliance answered
  in Info.plist.
- **Known open items**: app icon/splash still stock Capacitor placeholders; support email is a
  personal Gmail; some DB migrations not yet applied to prod.

**For every category:** find (a) what Apple's current written rule is, (b) what reviewers are
*actually* enforcing right now per developer reports, (c) concrete rejection anecdotes
(guideline cited + trigger + resolution), (d) anything that changed in the last 12 months.

---

## 1 · PRIVACY — policy, nutrition label, privacy manifests (Guidelines 5.1.1, 5.1.2)

Questions:
1. What makes App Review reject a **privacy policy** in 2025–2026 (missing sections, retention,
   third-party processors, contact info, in-app accessibility of the policy)?
2. **Privacy nutrition label mismatches**: how often do reviewers cross-check declared data types
   vs. observed app behavior? Anecdotes of rejections for under-declaring (e.g., health data,
   messages, photos)?
3. **PrivacyInfo.xcprivacy / privacy manifests**: current enforcement state for required-reason
   APIs (UserDefaults, file timestamps, etc.), third-party SDK manifest requirements — do
   Capacitor plugins / Supabase JS need their own manifests? ITMS-91053 warnings → rejections?
4. Is **mood tracking / wellbeing data** treated as "Health" in the label, and does storing it
   require anything extra (5.1.3 health-data rules: no advertising use, no sharing without consent)?
5. Religious content (prayers in a journal) = "sensitive info" — any special handling expected?
6. Account deletion (5.1.1(v)) — what implementations get rejected (web-link-only deletion,
   deletion that leaves data behind, confirmation-email-only flows)?

Search queries:
- `site:reddit.com iOSProgramming app rejected 5.1.1 privacy policy 2025`
- `site:reddit.com privacy nutrition label rejection health data`
- `PrivacyInfo.xcprivacy rejection ITMS-91053 2025 capacitor`
- `site:developer.apple.com forums privacy manifest third party SDK rejection`
- `app rejected account deletion 5.1.1 reddit`
- `mood tracker app store health data privacy label reddit`

## 2 · AGREEMENTS — ToS/EULA, consent flows, trader status

Questions:
1. Standard Apple EULA vs. custom EULA — when does a custom one become required (UGC apps must
   have zero-tolerance terms per 1.2 — is in-app ToS enough)?
2. **EU DSA trader status**: current enforcement (apps removed from EU storefronts without trader
   declaration) — what does a solo dev with a free app declare? Deadline realities in 2025–2026.
3. Forced-consent flows: is a mandatory ToS checkbox at signup OK? Any rejections for consent
   walls before the app is usable (vs. Apple's "don't force account creation" 5.1.1(v))?
4. Free-app agreement gotchas: Paid Applications Agreement not needed, but what about the
   updated Apple Developer Program License Agreement clauses devs miss?

Search queries:
- `site:reddit.com app store EULA custom terms UGC rejection`
- `DSA trader status app store removed EU 2025 solo developer reddit`
- `app rejected forced terms of service signup apple`
- `guideline 1.2 user generated content terms zero tolerance rejection`

## 3 · AGE RATINGS & AGE LIMITS — the new rating system

Questions:
1. The **2025 age-rating overhaul** (new global questionnaire, 4+/9+/13+/16+/18+ tiers replacing
   9+/12+/17+): what changed, what re-answers were forced, what mismatches cause metadata
   rejections now?
2. Apps combining **frequent/intense profanity + cartoon violence**: do they land 17+ or 18+ under
   the new system, and does 18+ trigger extra scrutiny (age verification requirements? Texas/Utah
   app-store age-verification laws hitting in 2026)?
3. Is an **in-app 18+ confirmation gate** (for explicit audio) inside an app rated 17+/18+ seen as
   sufficient, insufficient, or suspicious ("if it needs a gate, why isn't the whole app 18+")?
4. Self-help/mental-wellness content (anger processing, shadow work, anxiety SOS): does that
   push ratings or trigger 1.4.1 "could cause harm" review? Crisis-resource requirements
   (988 lines) — expected where?
5. Satirical violence against human-like characters ("stomp the hater clowns", boxing a customer
   at a door): where do reviewers draw cartoon vs. realistic violence lines?

Search queries:
- `apple new age rating system 2025 13+ 16+ 18+ questionnaire reddit`
- `app store age rating changed automatically 2025 developer`
- `texas app store age verification law 2026 apple developer impact`
- `app rejected profanity 17+ audio reddit`
- `guideline 1.4.1 harm rejection mental health app`

## 4 · HEALTH & FITNESS (1.4.1, 5.1.3) — workout programs + nutrition calculator

Questions:
1. Fitness apps shipping **structured training programs** (multi-phase strength programming,
   autoregulated 5×5 etc.): any rejections for missing medical disclaimers, injury-risk language,
   or "consult a physician" gates? What disclaimer placement satisfies review?
2. **Calorie/macro calculators**: treated as health advice? Rejections for missing disclaimers or
   for eating-disorder-adjacent features ("cheat day", aggressive cut targets)? Any new rules
   after eating-disorder-app scrutiny?
3. Mood check-ins + wellbeing exercises: when does an app cross into "medical" territory needing
   1.4.1 review (claims of treating anxiety/anger vs. "training" framing)?
4. Health data storage rules (5.1.3): no third-party sharing, no ads use — what evidences a
   violation to a reviewer?

Search queries:
- `site:reddit.com fitness app rejected medical disclaimer apple`
- `calorie counter app store rejection eating disorder 2025`
- `app rejected 1.4.1 health claims reddit`
- `workout app app review disclaimer physician reddit`

## 5 · UGC / SOCIAL (1.2) — what reviewers actually test

Questions:
1. The 1.2 checklist reviewers run in 2025–2026 for apps with posts/DMs/photos: filter, report,
   block, moderation SLA, contact info — anecdotes of what was missing when rejected?
2. Do reviewers create content, report it, and check response? Do they test blocking in DMs?
3. Photo uploads (proof photos): NSFW-scanning expectations for small apps? Human moderation
   promises — is "reviewed within 24h" by a solo dev credible/acceptable?
4. Private/invite-ish communities: any lighter treatment, or same bar as public social?

Search queries:
- `site:reddit.com app rejected 1.2 user generated content moderation`
- `apple review UGC report block requirement anecdote 2025`
- `small social app app store moderation requirements solo developer reddit`

## 6 · HYBRID / WEBVIEW APPS (4.2 minimum functionality, 2.1 performance)

Questions:
1. Current rejection climate for **Capacitor/Cordova** wrappers: what tips a rich web app into
   "4.2 minimum functionality" rejection vs. passing (native plugins used, offline behavior,
   haptics, keyboard handling)?
2. 2.1 App Completeness on hybrid apps: white screens on cold launch, airplane-mode behavior,
   iPad rendering of an iPhone-designed webview (does portrait-only iPhone + landscape iPad
   config cause problems?).
3. Performance flags: long first-paint in a webview, large JS bundles, video backgrounds —
   anecdotes of "your app feels like a website" rejections and successful appeals.

Search queries:
- `site:reddit.com capacitor app rejected 4.2 minimum functionality 2025`
- `ionic capacitor app store rejection webview 2026`
- `app feels like website rejection appeal reddit`

## 7 · COMPLETENESS, METADATA, SPAM (2.1, 2.3, 4.3) + demo account

Questions:
1. **Demo account failures** — top cause of 2.1 rejections: what breaks (2FA, region locks,
   expired creds, backend migrations missing)? Best practices for review notes?
2. Placeholder assets: stock template icons/splash — instant rejection anecdotes; how picky are
   reviewers about screenshots matching the app?
3. 4.3 spam: is a broad "everything app" (goals + fitness + social + games) ever flagged as
   unfocused, or is 4.3 only about template/duplicate apps?
4. Review times right now: normal wait, "In Review" stuck reports, expedite request success.

Search queries:
- `site:reddit.com app rejected demo account 2.1 2025`
- `app store rejection placeholder icon reddit`
- `guideline 4.3 spam rejection unique app reddit 2025`
- `app review taking forever 2026 reddit`

## 8 · IP / COPYRIGHT (5.2) + content-source risk

Questions:
1. Apps implementing **training programs/methods from published books** (program structure,
   set/rep schemes, form cues rewritten in-house, no book title used): copyright exposure and
   App Review's role (5.2 is complaint-driven — how often does it bite at review time vs. later
   takedown?).
2. Real-person references in satire (e.g., a renamed "celebrity slap" gag): 5.2.1 / 1.1
   objectionable-content anecdotes.
3. Quotes from famous people/motivational figures inside apps — enforcement reality.
4. Trademark in app name/keywords ("MapQuest City" as an internal feature name — any risk if the
   string appears in metadata or in-app since MapQuest is a live trademark?).

Search queries:
- `app rejected 5.2 intellectual property book content reddit`
- `fitness app copyright program from book legal`
- `app store rejection celebrity likeness satire`
- `trademark in app feature name app review rejection`

## 9 · AUTH & SIGN-IN (4.8), push, misc mechanics

Questions:
1. **Sign in with Apple (4.8)**: required ONLY when third-party/social login exists. Confirm
   email/password-only (Supabase) apps are exempt in current practice; anecdotes of wrong 4.8
   rejections and how devs overturned them.
2. Auth deep links (`customscheme://auth-callback`) — any review friction vs. universal links?
3. Camera/photo permission-string quality bar (generic strings rejected under 5.1.1).
4. Export compliance / encryption declaration realities for HTTPS-only apps.

Search queries:
- `sign in with apple required email password only reddit 2025`
- `app rejected 4.8 login services incorrectly`
- `NSCameraUsageDescription rejected vague reddit`

## 10 · CURRENT-EVENTS SWEEP — what's spiking right now (mid-2026)

Questions:
1. What are devs on r/iOSProgramming, r/iosdev, r/AppStore, Hacker News, and Apple Developer
   Forums complaining about **in the last 60–90 days**: new rejection waves, policy changes,
   review slowdowns, automated-review behavior?
2. Any new guideline revisions in 2026 (AI content rules, age verification, EU/US regulatory
   pass-through) that a submission this month must handle?
3. First-submission rejection statistics from recent industry reports (Runway, RevenueCat,
   AppFigures state-of-app-store reports).

Search queries:
- `site:reddit.com r/iOSProgramming rejection` (sort: new)
- `app store review guidelines update 2026`
- `hacker news app store rejection 2026`
- `state of app store report 2026 rejection rate`

---

## REQUIRED OUTPUT FORMAT (demand this from whatever tool runs the research)

For each category:

```
### <Category>
RULE NOW: <what Apple's current written rule is, with guideline #>
ENFORCEMENT REALITY: <what reviewers actually do, per dev reports>
ANECDOTES:
- [source URL] <date> — <what got rejected / approved> → <resolution>
CHANGES LAST 12 MO: <bullet list>
RISK READ FOR THIS APP: <apply to the App Profile in §0 — specific, not generic>
```

Close with a **Top-10 ranked list** of the most likely rejection reasons *for this specific app*,
each with guideline number and the single action that removes the risk.
