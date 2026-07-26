# Google Play Console — every field, answered

Copy-paste ready. Written 2026-07-26 against the code as it actually is.
Companion to `APP-STORE-CONNECT-ANSWERS.md`.

> **Read this first.** Play is not "iOS with a different upload button." Three
> gates below are calendar or paperwork gates that no amount of code fixes, and
> two of them can add weeks. Start §0 today, in parallel with everything else.

---

## 0 · The three gates that are not about code

### Gate 1 — Closed testing: 12 testers × 14 consecutive days
A **personal** Play developer account created after **2023-11-13** cannot
publish to production until it has run a closed test with at least **12 testers
opted in for 14 continuous days**. "Opted in" means each person accepted the
invite and installed the build under the matching Google account. If the count
drops below 12 the clock resets.

**Do this first.** Recruit 12 people, get them opted in, and let the fortnight
run while you finish everything else. Organization accounts registered to a
legal business entity are exempt.

### Gate 2 — Health-category account type ⚠️ VERIFY BEFORE BUILDING
Multiple secondary sources report that since **2026-01-28** Google requires a
**verified Organization account (with a D-U-N-S number)** for apps in the Health
or Medical categories, so a legal entity is accountable for sensitive health
data. **I could not confirm this in Google's own documentation** — treat it as
likely but unverified.

Milestone Mapping is unambiguously a health app under Play's definition (fitness
tracking, nutrition tracking, mental wellbeing, **addiction recovery** — Google's
own policy names "mental health support, counseling services and addiction
recovery programs").

**Action:** open Play Console → App content → Health apps declaration, and see
whether it accepts an Individual account. If it does not, Play is blocked until
the LLC exists and is D-U-N-S verified. Do this **before** spending time on
store art. If blocked, ship iOS and keep Android warm.

### Gate 3 — Developer verification
From **2026-09-30**, Android requires developer identity verification (legal
name, address, email, phone; government ID may be requested) for apps installed
on certified devices, rolling out by region. Separate from Gate 1, and both must
clear before public distribution. Start it when Play Console offers it.

---

## 1 · App details

| Field | Value |
|---|---|
| App name (30 max) | `Milestone Mapping` |
| Package name | `com.milestonemapping.app` |
| Default language | English (United States) |
| App or game | **App** |
| Free or paid | **Free** (cannot be changed later) |
| Category | **Health & Fitness** |
| Tags | Personal growth, Fitness, Mental wellbeing |
| Contact email | `howkins.ops@gmail.com` |
| Website | `https://milestonemapping.netlify.app` |
| Privacy Policy URL | `https://milestonemapping.netlify.app/legal/privacy.html` |
| versionCode / versionName | `1` / `1.0` |
| targetSdk / compileSdk | **36** (Android 16) — required for new apps from 2026-08-31; already set in `android/variables.gradle` |
| minSdk | 24 |
| Format | **AAB** (Play does not accept APKs for new apps) |

---

## 2 · Data safety form

**Summary answers**
| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **Yes** |
| Is all of the user data collected by your app encrypted in transit? | **Yes** (HTTPS/TLS everywhere) |
| Do you provide a way for users to request that their data is deleted? | **Yes** |
| **Account deletion URL** | `https://milestonemapping.netlify.app/legal/delete-account.html` |

That URL must be publicly reachable without login, over HTTPS, and must land
directly on the deletion instructions — not a homepage with a buried link. It
states what is deleted, what is retained and why, and how long it takes. It is
live at `public/legal/delete-account.html`.

**Data types — declare each as Collected = Yes, Shared = No, Required or
Optional as noted, Processed ephemerally = No, User can request deletion = Yes.**

| Category | Type | Collected | Optional? | Purpose |
|---|---|---|---|---|
| Personal info | **Email address** | Yes | Optional (guest mode exists) | Account management |
| Personal info | **User IDs** | Yes | Optional | Account management, App functionality |
| Personal info | **Other info** (username, display name) | Yes | Optional | Account management |
| Health and fitness | **Health info** | Yes | Optional | App functionality — mood check-ins, wellbeing exercises, CLEARDAY recovery data |
| Health and fitness | **Fitness info** | Yes | Optional | App functionality — workouts, body weight, body fat, calories, macros |
| Photos and videos | **Photos** | Yes | Optional | App functionality — proof photos, avatars, meal photos |
| Messages | **Other in-app messages** | Yes | Optional | App functionality — Zone direct messages |
| App activity | **Other user-generated content** | Yes | Optional | App functionality — posts, comments, journal entries, milestones, AI chat text |
| App activity | **Other actions** | Yes | Optional | App functionality — streaks, XP, game progress |

**Do NOT declare:** Location, Financial info, Contacts, Calendar, App activity →
App interactions/search history, Web browsing, App info and performance (no
crash or diagnostics SDK), Device or other IDs, Advertising.

**Data sharing:** answer **No** to sharing for every type. Third parties named
in the policy (Supabase, Netlify, Anthropic, ElevenLabs, Pollinations.ai) are
**service providers processing on our behalf**, which Play's form explicitly
excludes from "sharing".

**Security practices:** Data encrypted in transit ✅ · Users can request deletion ✅
· Committed to Play Families Policy ❌ (not a family app) · Independent security
review ❌.

---

## 3 · Health apps declaration form

Required. App content → Health apps declaration.

| Question | Answer |
|---|---|
| Does your app provide health-related features? | **Yes** |
| Which categories apply? | **Health & fitness** — fitness tracker, nutrition tracker, stress/mental wellbeing management, **substance and behaviour recovery support** |
| Is your app a medical device, or does it have regulatory clearance (FDA / CE / equivalent)? | **No** |
| Does your app provide medical diagnosis, treatment or advice? | **No** — self-directed education and habit training |
| Does your app connect to Health Connect? | **No** |
| Which Health Connect permissions do you request? | **None** |
| Is it a human-subjects research app? | **No** |
| Do you display the required disclaimer? | **Yes** — "not a medical device… does not diagnose, treat, cure or prevent any medical condition", plus "consult a healthcare professional", shown in Settings, in the CLEARDAY safety card, in the Terms and at `/legal/health-disclaimer.html` |
| Do you remind users to consult a healthcare professional? | **Yes** |
| Do you obtain affirmative consent before collecting health data? | **Yes** — features are opt-in; nothing is collected until the user chooses to use them |
| Privacy policy detailing personal/sensitive data handling? | **Yes** — `/legal/privacy.html` §2, §4, §9 |

**Free-text description of health features** (paste):
```
Milestone Mapping includes: (1) a workout tracker with plans, set-by-set logging
and personal records; (2) a nutrition layer with calorie and macro targets, meal,
fasting and cardio logs; (3) self-directed mental wellbeing exercises covering
anger, stress and anxiety, with mood check-ins; and (4) CLEARDAY, a 66-day
self-directed program for adults choosing to stop using cannabis and/or
pornography, which records clear/slip days, urge-response logs and nightly
written reflections.

All of it is self-directed education and habit training. The app is not a
medical device, provides no diagnosis or treatment, requests no Health Connect
permissions, and does not connect to any external health platform. It states
plainly that it is not a medical device and directs users to a qualified
healthcare professional. Crisis resources (988 Suicide & Crisis Lifeline, SAMHSA
1-800-662-4357) are shown inside the recovery and wellbeing modules, along with
a warning that unsupervised withdrawal from alcohol and benzodiazepines can be
dangerous. Health data is never used for advertising, never sold, and never
shared for any purpose other than operating the feature the user turned on.
```

---

## 4 · Content rating (IARC questionnaire)

Answer honestly; expect **ESRB Mature 17+ / PEGI 18 / USK 16–18**.

| Question | Answer |
|---|---|
| Category | **Reference, News, or Educational** → or **Social Networking** if prompted by the UGC answers |
| Violence — cartoon/fantasy | **Yes**, frequent, non-realistic and comedic |
| Violence — realistic | Mild, infrequent |
| Blood/gore | No |
| Sexuality — nudity or sexual content | **No** (no sexual imagery anywhere) |
| Sexuality — references to sexual topics | **Yes** — pornography use is discussed in a recovery context |
| Language — profanity | **Yes, frequent and strong** (first-party scripted audio) |
| Controlled substances — reference or depiction | **Yes** — cannabis cessation is a core feature; past drug use is referenced in narrative audio |
| Gambling | No |
| Fear/horror | No |
| Discrimination | No |
| **Does the app allow users to interact or exchange content?** | **Yes** |
| Can users share their location with other users? | **No** |
| Does the app allow purchase of digital goods? | **No** |
| Does the app share user-provided personal information with third parties? | **No** |
| Is the app a web browser or search engine? | **No** |

---

## 5 · App content — other declarations

| Section | Answer |
|---|---|
| **Target audience and content** | Age groups: **18 and over only**. Do not tick any group below 18. Not appealing to children. |
| **Ads** | Contains ads: **No** |
| **App access** | **All or some functionality is restricted.** Provide instructions + credentials (below). |
| **Government apps** | No |
| **Financial features** | None of the above |
| **Health apps** | See §3 |
| **News apps** | No |
| **COVID-19 contact tracing** | No |
| **Data safety** | See §2 |
| **Advertising ID permission** | Not declared — the app does not use it |
| **Sensitive permissions** | None. Manifest requests `INTERNET` only. No camera permission is declared — photo attachment uses the system picker. |

**App access instructions** (paste):
```
Most of the app needs no login. On the landing screen tap "Continue without an
account" — milestones, daily planning, the journal, THE IRON fitness mode,
CLEARDAY and all games work fully logged out, stored on the device.

Only the Accountability Zone (the social layer: feed, squads, direct messages,
proof photos) requires an account.

Test account for the Zone:
  Email:    <create a fresh throwaway before submitting>
  Password: <…>

This account is disposable — please delete it if you want to test the deletion
flow. Deletion is real, immediate and irreversible, with no exemptions.

Note: the app is rated 18+. Anger Gym RAW levels and CLEARDAY's pornography
track each show a one-time 18+ confirmation before opening.
```

---

## 6 · Store listing

**App name (30)**
```
Milestone Mapping
```

**Short description (80)**
```
Map your goals, break the habit, and run with a crew that holds you to it.
```

**Full description (4000)** — use the App Store description from
`APP-STORE-CONNECT-ANSWERS.md` §6. It is under 4000 characters and already
represents the whole app, including recovery and social, which Play's
misrepresentation policy requires.

**Graphic assets**
| Asset | Spec | Status |
|---|---|---|
| App icon | 512 × 512 PNG, 32-bit, no transparency | ⛔ **placeholder** — same stock Capacitor art as iOS |
| Feature graphic | 1024 × 500 PNG/JPG, no transparency | ⛔ **not created** — required, no exceptions |
| Phone screenshots | 2–8, min 320px, max 3840px, 16:9 or 9:16 | ⛔ **not created** |
| Tablet screenshots | optional | skip — phone-only |
| Adaptive icon | foreground + background, all mipmap densities | ⛔ **placeholder** |

Generate all icons with `npx @capacitor/assets generate` once the 1024 master
exists — it produces the iOS set and the Android adaptive icons together.

---

## 7 · What was built for Android in this pass

| Item | State |
|---|---|
| `android/` project | ✅ created (`npx cap add android`, Capacitor 8.4.1, all 7 plugins) |
| `applicationId` / versionCode / versionName | ✅ `com.milestonemapping.app` / 1 / 1.0 |
| targetSdk / compileSdk | ✅ **36** — clears the 2026-08-31 deadline |
| Permissions | ✅ `INTERNET` only — Play's health policy penalizes unnecessary permissions |
| Auth deep link | ✅ `milestonemapping://` intent filter added, so Supabase confirmation and password-reset emails open the app |
| Orientation | ✅ portrait-locked, matching iOS |
| Backup privacy | ✅ `allowBackup="false"` + `data_extraction_rules.xml` excluding all domains — health, recovery and session tokens stay off Google Drive backup |
| Release signing | ✅ wired in `app/build.gradle`, driven by a gitignored `key.properties` that CI writes from secure env vars |
| Signing secrets gitignored | ✅ `*.jks`, `*.keystore`, `key.properties` added to `android/.gitignore` |
| CI workflow | ✅ `android-play` workflow in `codemagic.yaml` → signed AAB → Play internal track |
| Icons / splash | ⛔ stock Capacitor placeholders |
| Gradle build verified | ⛔ **not possible in this environment** — no Android SDK, and Java 8 where Capacitor 8 needs JDK 21. First real build happens on Codemagic (`java: 21`, SDK provisioned). |

---

## 8 · Pre-submit gate

- [ ] **Gate 2 checked** — Individual account accepted for a health app, or LLC + D-U-N-S done
- [ ] Closed test running: 12 testers opted in, day 1 of 14 logged
- [ ] Developer verification started (if offered in your region)
- [ ] Real icon, adaptive icon, feature graphic and screenshots uploaded
- [ ] Keystore generated **and backed up somewhere you will not lose it** — losing it ends your ability to update this package name, permanently
- [ ] Play App Signing enrolled
- [ ] Account-deletion URL opens with no login, over HTTPS
- [ ] Privacy policy URL live and identical to the in-app copy
- [ ] Data safety form matches §2 exactly
- [ ] Health apps declaration submitted
- [ ] Content rating questionnaire completed → Mature 17+
- [ ] Target audience set to 18+ only
- [ ] Fresh throwaway test account in App access
- [ ] First AAB uploaded manually (Play rejects API uploads to a never-released track)
