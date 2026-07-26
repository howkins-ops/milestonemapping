# App Store Connect — every field, answered

Copy-paste ready. Written 2026-07-26 against the code as it actually is, not as
the older checklists describe it. Supersedes the App Store Connect sections of
`APP-STORE-SUBMISSION-CHECKLIST.md`.

> **Rule for this whole document:** never soften an answer to get a lower rating
> or a smaller privacy label. A mismatch between what you declare and what the
> binary does is the fastest-growing rejection category in 2026, and Apple
> cross-checks the two.

---

## 0 · App record

| Field | Value |
|---|---|
| Platform | iOS (iPhone only — `TARGETED_DEVICE_FAMILY = 1`) |
| Bundle ID | `com.milestonemapping.app` |
| SKU | `MM001` |
| Primary language | English (U.S.) |
| Version | `1.0` (`MARKETING_VERSION`) · Build `1` (`CURRENT_PROJECT_VERSION`) |
| Minimum iOS | 15.0 |
| Primary category | **Health & Fitness** |
| Secondary category | **Lifestyle** |
| Release | **Manually release this version** (safest for v1) |

Build with the **iOS 26 SDK** — mandatory for all submissions since 2026-04-28.
`codemagic.yaml` uses `xcode: latest`, which satisfies this.

---

## 1 · URLs (all three must resolve before you submit)

| Field | Value |
|---|---|
| **Support URL** (required) | `https://milestonemapping.netlify.app/legal/support.html` |
| **Privacy Policy URL** (required) | `https://milestonemapping.netlify.app/legal/privacy.html` |
| Marketing URL (optional) | leave blank for v1 |

A missing or broken Support URL is a top-three rejection cause under Guideline
1.5. Deploy the site (`npm run build` → `netlify deploy --prod --dir=dist`) and
open all three in a browser before submitting.

---

## 2 · Age rating questionnaire → **18+**

Apple's questionnaire was overhauled in 2025: tiers are now 4+, 9+, **13+, 16+,
18+**, and there are new required sections. New questions on **social media
capabilities** become mandatory for new submissions from September 2026 — answer
them if they appear.

### Content
| Question | Answer |
|---|---|
| Profanity or Crude Humor | **Frequent/Intense** |
| Cartoon or Fantasy Violence | **Frequent/Intense** |
| Realistic Violence | Infrequent/Mild |
| Prolonged Realistic Violence | None |
| Sexual Content or Nudity | **None** (CLEARDAY discusses pornography use in recovery terms; there is no sexual imagery anywhere in the app) |
| Mature/Suggestive Themes | **Frequent/Intense** (frank adult discussion of pornography and cannabis use) |
| Horror/Fear Themes | None |
| Alcohol, Tobacco, or Drug Use or References | **Frequent/Intense** — *do not answer None.* CLEARDAY is built around cannabis cessation and the AI corner-man's voice references past drug use. References in a recovery context still count as references. |
| Simulated Gambling | None |
| Contests | None |

### Medical or wellness topics *(new section)*
| Question | Answer |
|---|---|
| Does your app include medical or wellness information/features? | **Yes** |
| Health & wellness topics | **Yes** — fitness training, nutrition tracking, mental wellbeing exercises, and substance/behaviour recovery |
| Does it provide medical diagnosis, treatment or advice? | **No** — self-directed education and habit training only; disclaimer shown in-app and at `/legal/health-disclaimer.html` |
| Is it a regulated medical device? | **No** |
| Does it discuss substance use / addiction recovery? | **Yes** |

### Violent themes *(new section)*
Satirical, cartoon, absurdist. No gore, no weapons used against realistic human
characters, no real-world violence instruction. Answer at the **cartoon/fantasy**
end and declare it as frequent.

### Capabilities & in-app controls *(new sections)*
| Question | Answer |
|---|---|
| Unrestricted Web Access | **No** — external links open in SFSafariViewController to a fixed list of research URLs; there is no browser |
| User-Generated Content | **Yes** |
| Does the app include messaging/chat between users? | **Yes** — direct messages in the Accountability Zone |
| Does the app include social networking features? | **Yes** — feed, profiles, friends, squads, DMs |
| Are there parental controls / in-app content controls? | **No** — the app is 18+ in its entirety |
| Does the app include AI-generated content? | **Yes** — AI chat (Anthropic) and AI image generation (Pollinations.ai), both behind explicit consent |

### Minimum age override
Apple's new system lets you set a rating **higher** than the questionnaire
computes. Our Terms require users to be 18+. **Set the minimum age to 18+**
even if the questionnaire lands on 16+.

**Expected final rating: 18+.** Anything lower is a metadata rejection.

---

## 3 · App Privacy (nutrition label)

Every type below: **Linked to the user's identity = Yes**, **Used for tracking =
No**, purpose = **App Functionality** only. No ATT prompt — there is nothing to
track and no ad or analytics SDK in the binary.

| Category | Data type | Why we collect it |
|---|---|---|
| Contact Info | **Email Address** | Account creation and sign-in |
| Identifiers | **User ID** | Supabase UUID + username |
| User Content | **Photos or Videos** | Zone proof photos, avatars, meal photos, generated images |
| User Content | **Other User Content** | Posts, comments, milestones, journal entries, vision boards, **and AI chat text sent to Anthropic** |
| User Content | **Customer Support** | Content of support emails |
| Health & Fitness | **Health** | Mood check-ins, wellbeing exercise logs, **CLEARDAY recovery data** (clear/slip records, urge logs, night ledgers) |
| Health & Fitness | **Fitness** | Workout logs, sets/reps/weights, PRs, body weight, body-fat estimate, calorie and macro targets |
| Sensitive Info | **Sensitive Info** | Religious belief (Prayer Ledger, spiritual pillar) and health/substance-use data |
| User Content | **Other Data Types** → "Direct messages" | Zone DMs (declare under Other Messages if that option is presented) |

**Do NOT declare:** Precise/Coarse Location, Contacts, Browsing History, Search
History, Purchases, Financial Info, Advertising Data, Product Interaction,
Crash Data, Performance Data, Device ID. None of these exist in the binary.

This matches `ios/App/App/PrivacyInfo.xcprivacy`, which declares the same eight
types plus four required-reason API categories (`CA92.1`, `C617.1`, `E174.1`,
`35F9.1`).

**Third parties to name in the policy** (all already in `privacy.html` §6):
Supabase, Netlify, Anthropic, ElevenLabs, Pollinations.ai.

---

## 4 · App Review notes

Paste this into the Notes field verbatim.

```
DEMO ACCOUNT
  Email:    <create a fresh throwaway before submitting>
  Password: <…>
This account is disposable. Please feel free to delete it while testing the
account-deletion flow — deletion is real and irreversible, with no exemptions
in the code.

GUEST MODE (Guideline 5.1.1)
Tap "Continue without an account" on the landing screen. Milestones, daily
planning, the journal, fitness, CLEARDAY and all games work fully logged out.
Only the Zone social layer requires an account.

WHAT THE APP IS
A personal-development app for adults. Goal/milestone mapping, daily planning,
journaling, a fitness + nutrition mode (THE IRON / Alpha Mode), self-development
exercises, CLEARDAY (a 66-day self-directed program for people quitting cannabis
and/or pornography), training games, and a private social space (the Zone).

AGE RATING — 18+
Frequent strong language in first-party scripted audio, frequent cartoon
violence, and frank adult discussion of substance and pornography use. There is
no sexual imagery anywhere in the app. A one-time in-app 18+ confirmation gates
the Anger Gym's RAW audio floor and CLEARDAY's pornography track (shared
acknowledgement — src/lib/adultAck.js).

HEALTH CONTENT (1.4.1 / 5.1.3)
CLEARDAY and the fitness modes are self-directed education and habit training.
The app states plainly that it is not a medical device and does not diagnose,
treat, cure or prevent any condition, and it points users to a healthcare
professional. A persistent disclaimer strip sits above the CLEARDAY tab bar on
every screen and opens a full card carrying 988 (Suicide & Crisis Lifeline),
1-800-662-4357 (SAMHSA) and a warning about unsupervised withdrawal. Shadow
Work and Anxiety SOS carry the same crisis lines. Health data is never used for
advertising and is never shared with third parties.

AI FEATURES (5.1.2)
Three optional features send text to a third-party AI, and NONE of them send
anything until the user has agreed in a modal that names the provider:
  · THE CORNER (CLEARDAY chat)  -> Anthropic / Claude
  · THE CLAIM FORGE (CLEARDAY)  -> Anthropic / Claude
  · Vision board + reward art   -> Pollinations.ai
Consent is stored per provider, and is withdrawable in Settings -> Support &
Legal -> "AI features you've agreed to". Only the user's typed text plus minimal
context is sent; never their name, email, photos, journal or messages. THE
CORNER's UI states on-screen that it is an AI and not a therapist or crisis
line. Full disclosure: privacy.html section 7.
  To see the gate: open CLEARDAY (sun icon, top bar) -> Today -> THE CORNER ->
  type anything -> Send. The consent modal appears before the first request.

UGC SAFETY (1.2)
Objectionable-content filter running both client-side (src/lib/contentFilter.js)
and again as a Postgres trigger, so it cannot be bypassed by a modified client.
Report button on every post, comment, DM, profile and vow. Two-way blocking
enforced in row-level security. Forced Terms + Privacy consent at signup, plus a
second Community Rules gate before entering the Zone. Moderation inbox in
Settings (admin accounts only) with an authoritative open-report count; the
Terms promise action within 24 hours. Public rules: /legal/guidelines.html

ACCOUNT DELETION (5.1.1(v))
Settings -> Danger Zone -> Delete Account & All Data. A Supabase edge function
purges every storage bucket recursively, then deletes the auth user; every table
cascades. Also available without the app at /legal/delete-account.html

NETWORK
Supabase (backend), Netlify (hosting + server functions), and — only on the
consented actions above — Anthropic and Pollinations.ai. ElevenLabs receives
only short scripted lines of game dialogue, never user data. No ads, no
analytics, no tracking SDKs, no purchases of any kind. The app is free.
```

---

## 5 · Other declarations

| Field | Answer |
|---|---|
| **Export compliance** | Already answered in `Info.plist` (`ITSAppUsesNonExemptEncryption = false`). Standard HTTPS only. |
| **EU Digital Services Act — trader status** | **Non-trader.** Must be answered or the app is removed from all 27 EU storefronts. Requires a real address and phone number, which Apple publishes on the product page. Individual, non-commercial, free app → non-trader is correct. |
| **Content rights** | "Does your app contain, show, or access third-party content?" → **No.** All art, audio, copy and programs are first-party. Research citations link out to public journals; that is reference, not contained content. |
| **Advertising identifier (IDFA)** | **No.** |
| **Sign in with Apple (4.8)** | **Not required.** 4.8 applies only when a *third-party or social* login is offered. This app is email + password only via Supabase. If you are rejected on 4.8 anyway, reply pointing this out — it is a common reviewer error and is routinely overturned. |
| **Third-party analytics** | None. |
| **Data used to track you** | None. |
| **Kids Category** | No. |
| **Game Center** | No. |
| **In-app purchases** | None. |

---

## 6 · Listing copy

**App Name (30 max)**
```
Milestone Mapping
```

**Subtitle (30 max)**
```
Map goals. Break the habit.
```

**Promotional text (170 max)**
```
Map the mission, execute the day, and get free of what's holding you back — with
a private crew that actually holds you to it.
```

**Description** — must represent the *whole* app, including recovery and social,
or you risk a 2.3.3/2.3.7 metadata rejection.
```
Milestone Mapping is a personal-development app for adults who are done making
promises they don't keep.

MAP THE MISSION
Break big goals into projects, milestones and steps you can actually see. Plan
the day, run your Top Five, review the week, and watch the map fill in behind
you.

CLEARDAY — 66 DAYS
A self-directed program for men and women choosing to quit cannabis or
pornography. Write the identity you're building, arm your rules with when-then
triggers, fight urges with a structured battle protocol, settle the night
ledger, and log the days. Built on published behaviour-change research, with the
citations shown. Not a treatment program — training, and it says so plainly.

THE IRON
Workout plans and set-by-set logging with an automatic personal-record wall.
Alpha Mode adds a full nutrition layer: targets, meals, fasting and a campaign
to run it all through.

THE FIELD JOURNAL
Five pillars — physical, intellectual, emotional, spiritual, financial — with a
prayer ledger for the ones you're still waiting on.

THE ACCOUNTABILITY ZONE
A private social space. Declare a mission, post the proof, run with a squad, get
an accountability partner. Not a feed to perform for — a room that notices when
you don't show up.

TRAINING GAMES
Anger Gym, Shadow Work, Anxiety SOS, Hoops, Eat the Frog and a walkable city to
explore. Rejection-resilience training that doesn't feel like homework.

FREE, AND PRIVATE
No ads. No analytics. No tracking. No purchases. Nothing sold, ever. Most of the
app works without an account at all — tap "Continue without an account" and
everything stays on your device.

18+. Contains strong language, cartoon violence, and frank adult discussion of
substance and pornography use.

Milestone Mapping is not a medical device and does not diagnose, treat, cure or
prevent any medical condition. Always consult a qualified healthcare
professional. In crisis? Call or text 988 (US).
```

**Keywords (100 chars, comma-separated, no spaces)**
```
goals,habit,quit,sobriety,recovery,accountability,journal,workout,discipline,streak,planner,mindset
```

**Copyright**
```
2026 Jon Howkins
```

---

## 7 · Screenshots

**6.9" iPhone required**, 1290 × 2796 portrait, 5–6 frames. No iPad set needed
(the target is iPhone-only). Capture from the real portrait build — no mockup
frames carrying claims the app doesn't make.

1. Dashboard / Command — the map filling in
2. Milestone map — a project broken into steps
3. CLEARDAY Today — the day counter and the rites
4. THE IRON — a workout in progress with the PR wall
5. The Zone feed — proof posts and a squad
6. A game — Hoops or the city

Every screenshot must be of the actual app at the actual rating. If a frame
shows the Zone, it is showing UGC — that is fine and expected.

---

## 8 · Pre-submit gate

Do not press Submit until every line is true.

- [ ] App icon and splash are **real art**, not the Capacitor placeholder
- [ ] Support, Privacy and Delete-account URLs all resolve on the live site
- [ ] Fresh throwaway demo account created, tested, and pasted into Review Notes
- [ ] Deleting that account really deletes it, and sign-in then fails
- [ ] Migration `019_admin_seed_fix.sql` applied to prod, so the Reports Inbox renders
- [ ] `milestonemapping://auth-callback` is in the Supabase redirect allowlist
- [ ] `ANTHROPIC_API_KEY` and `ELEVENLABS_API_KEY` set in Netlify env
- [ ] ElevenLabs key rotated (the old one sat in a OneDrive-synced `.env`)
- [ ] AI consent modal appears before the **first** Corner message on a clean install
- [ ] CLEARDAY safety strip visible on every tab; the card opens and shows 988
- [ ] Age rating computes to 18+, minimum age set to 18+
- [ ] EU trader status answered
- [ ] Cold launch in airplane mode renders with correct fonts and no white screen
