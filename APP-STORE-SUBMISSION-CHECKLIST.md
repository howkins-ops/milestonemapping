# App Store Submission Checklist — Milestone Mapping

Produced from the 10-auditor pre-submission review (2026-07-07). All Phase 1
code blockers and Phase 2 hardening are DONE in the codebase. What remains is
listed here: manual steps only Jon (or the Mac) can do, plus the exact
App Store Connect answers.

---

## 1 · Manual steps before archiving (do these once)

- [ ] **Supabase redirect allowlist** — Dashboard → Authentication → URL Configuration →
  add `milestonemapping://auth-callback` to Redirect URLs. Without this, signup-confirmation
  and password-reset emails can't deep-link back into the iOS app (code is already wired).
- [ ] **Rotate the ElevenLabs API key** — the key in `.env` line 6 was exposed on a synced disk.
  It never ships in the app, but rotate it at elevenlabs.io → Profile → API Keys.
- [ ] **Branded support email** — replace `howkins.ops@gmail.com` in `src/lib/constants.js`
  (SUPPORT_EMAIL) and in `public/legal/privacy.html` + `terms.html` with e.g.
  `support@milestonemapping.app` once the domain mailbox exists. A personal Gmail reads
  as unstaffed to App Review. (Keep the Gmail if the branded one isn't ready — it must
  be a monitored inbox either way.)
- [ ] **Check the Reports Inbox daily** — Settings → Reports Inbox (visible only to
  @jonrises / @jonrise admin accounts). The ToS promises review within 24 hours;
  the inbox + resolve buttons are live (migration 013). Optional later upgrade:
  a Resend/email alert edge function on new reports.

## 2 · Build & archive (Codemagic cloud CI — no Mac needed)

This complements the earlier `APP-STORE-LAUNCH-CHECKLIST.md` (enrollment, ASC API key,
Codemagic hookup). Per-build ritual:

1. **Replace the placeholder app icon & splash first** — the current
   `ios/App/App/Assets.xcassets` art is the STOCK CAPACITOR icon; submitting it is
   an instant rejection. Generate real art per `APPSTORE-IMAGES-NEEDED.md` §A/§B, then
   `npx @capacitor/assets generate`.
2. `npm run build` → `npm run cap:sync` → commit → push
   (never let CI archive a stale `ios/App/App/public/`).
3. Codemagic `ios-testflight` workflow archives + uploads to TestFlight
   (signing via the ASC API key integration — no local DEVELOPMENT_TEAM needed).
4. First build only: confirm in the build log / TestFlight metadata that
   **PrivacyInfo.xcprivacy** shipped in the bundle (it was added to the pbxproj by
   hand this session).
5. Bump `MARKETING_VERSION` / `CURRENT_PROJECT_VERSION` in `ios/App/App.xcodeproj/project.pbxproj` per release.

## 3 · On-device TestFlight pass (what a reviewer will do)

- [ ] Cold-launch in airplane mode → app renders with correct fonts (now self-hosted), no white screen.
- [ ] Tap "Continue without an account" → milestones/daily/games all work logged-out; Zone shows the sign-in gate.
- [ ] Sign up → confirmation email opens **the app** (not Safari) via `milestonemapping://auth-callback`.
- [ ] "Forgot password" → email deep-links back → SET NEW PASSWORD screen appears.
- [ ] Zone → proof post → 📷 Camera → **permission prompt appears** (no crash).
- [ ] Anger Gym → The Door → the one-time 🔞 RAW gate appears before any explicit audio.
- [ ] Settings → Danger Zone → delete a throwaway account end-to-end (auth user gone, media purged).
- [ ] Rotate the phone → app stays portrait (landscape now iPad-only).
- [ ] Open a DM → keyboard does not cover the composer (Keyboard plugin, resize: native).
- [ ] Field Journal → bottom nav clears the home indicator.
- [ ] Door knocks / buzzer / celebrations → haptics fire.

## 4 · App Store Connect — exact answers

### Age rating questionnaire
| Question | Answer |
|---|---|
| Profanity or Crude Humor | **Frequent/Intense** |
| Cartoon or Fantasy Violence | **Frequent/Intense** |
| Realistic Violence | Infrequent/Mild |
| Horror/Fear Themes | None |
| Mature/Suggestive Themes | Infrequent/Mild |
| Alcohol, Tobacco, or Drug Use | None |
| Simulated Gambling | None |
| Contests | None |
| Unrestricted Web Access | No |
| User-Generated Content | Yes (social features with moderation, blocking, reporting) |

Expected rating: **17+ / 18+**. Anything lower = metadata rejection.

### App Privacy (nutrition label)
All data **linked to identity**, **none used for tracking** (no ATT prompt needed — zero ad/analytics SDKs).

Collected:
- Contact Info → **Email Address** (account)
- User Content → **Photos or Videos** (proof photos, vision boards)
- User Content → **Other Messages** (Zone DMs)
- User Content → **Other User Content** (posts, comments, milestones, journal entries incl. prayers/mood)
- Health & Fitness → **Health** (mood check-ins, wellbeing exercise data) and **Fitness** (workout logs)
- Sensitive Info (religious content in journal prayers)
- Identifiers → **User ID** (Supabase UUID, username)

Third parties named in the privacy policy: Supabase (processor), Netlify (hosting),
Pollinations.ai (optional AI image/voice — user prompts only, disclosed in policy §"Optional AI features").

Privacy policy URL: `https://<your-netlify-domain>/legal/privacy.html` (bundled copy is identical).

### App Review notes (paste into the Notes field)
```
DEMO ACCOUNT: coachowkins@gmail.com / demodemo (member of the Zone social space).
Guest mode: tap "Continue without an account" on the landing screen — all
personal-development features work without login; only the Zone social layer
requires an account.

CONTENT CONTEXT: The "Anger Gym" contains satirical rejection-resilience games
for sales professionals, rated 17+/18+. Explicit language is first-party scripted
audio behind a one-time in-app 18+ confirmation. The violence is deliberately
cartoon/absurdist ("Looney Tunes with a sales quota") and each level's brief card
carries a fiction disclaimer. Scientific framing: "Rejection fires the same
circuits as physical pain — until repetition recalibrates them" (behavioral
desensitization; see the in-app Science page for citations).

UGC SAFETY (1.2): content filter (client + Postgres trigger), report button on
every content surface, two-way user blocking enforced in RLS, forced ToS consent
at signup + second community-rules gate before entering the Zone, in-app
moderation inbox reviewed within 24h, in-app account deletion (Settings →
Danger Zone) with full server-side purge.

NETWORK: Supabase (backend), and pollinations.ai only when the user actively
generates a vision-board image or plays certain guided audio (disclosed in the
privacy policy). No ads, no analytics, no tracking, no purchases of any kind.
```

### Other ASC fields
- [ ] Category: Health & Fitness (primary) / Productivity or Lifestyle (secondary)
- [ ] Export compliance: already answered in Info.plist (`ITSAppUsesNonExemptEncryption = NO`)
- [ ] Screenshots: capture from the portrait build; make sure they show the real app (no mockup frames with false claims)
- [ ] EULA: standard Apple EULA is fine; the in-app ToS covers UGC zero-tolerance (1.2 requirement)

## 5 · What was fixed in this pass (for the record)

**Guaranteed-rejection blockers (all done):**
- Info.plist: `NSCameraUsageDescription` + `NSPhotoLibraryUsageDescription` added (camera would have crashed on the proof-photo flow); `armv7`→`arm64`; `ITSAppUsesNonExemptEncryption=false`; iPhone locked to portrait; `CFBundleURLTypes` with `milestonemapping://` scheme.
- `PrivacyInfo.xcprivacy` added to the Xcode Resources build phase (it existed on disk but never shipped).
- Every `target="_blank"` removed: legal docs open in an in-app modal (`LegalModal`), external study links open via `@capacitor/browser` (SFSafariViewController).
- Guest mode: "Continue without an account" (5.1.1) — Zone-only login gate; false "sync everywhere" copy corrected.
- `delete-account` edge function v2 deployed: purges **every** storage bucket recursively, then deletes the auth user.
- Auth deep links: `redirectTo` on signup + password reset, handled by `@capacitor/app` `appUrlOpen` (`src/lib/deepLinks.js`).
- Top-level + per-page React ErrorBoundary (2.1 crash shield).
- The Door L3–4: satire disclaimers on brief cards, "lesson" lines rewritten from endorsement to cautionary framing, "Will-Smith" slap renamed, one-time 🔞 RAW gate before Door/Slam.
- Gratitude stats reworded to cited-association framing; 988 added to Wave Rider crisis copy; persistent crisis footer in the Shadow hub.
- Pollinations.ai disclosed in the privacy policy (was directly contradicted before).
- Report intake loop: migration 013 (admin flag, RLS, list/resolve RPCs) + Settings → Reports Inbox.

**Hardening (all done):**
- Server-side content filter: migration 014 (Postgres trigger on messages/comments/feed_events, mirrors the client filter, verified against evasion cases).
- `@capacitor/keyboard` installed (`resize: native`); unused `local-notifications` + `share` plugins removed; `@capacitor/browser` added.
- All 8 Google Font families self-hosted in `public/fonts/` (24 woff2, latin subset) — identical rendering offline.
- Field Journal bottom nav clears the home indicator (`env(safe-area-inset-bottom)`).
- Haptics wired: Door knocks/slams (via the `buzz()` engine), Full Court buzzer, every celebration overlay.
- Viewport: pinch-zoom disabled (`user-scalable=no`) for the mash games.
- Hover-only reveals wrapped in `@media (hover: hover)` with `:active` fallbacks (Shadow chambers, city buildings).
- AnimatedBackground: static poster under reduced-motion, video pauses when backgrounded; ParticleCanvas: honors `prefers-reduced-motion`, pauses rAF when hidden.
- nativeStorage: snapshot debounce 30s→5s; Supabase auth tokens (`sb-*`) excluded from the UserDefaults snapshot.
- Dead `quote-scroll-bg.png` reference removed; TheVow stake placeholder made non-monetary; pitch-slide exclusion guard comment in `shiftsData.js`.
- PNG library recompressed in place (palette quantization, same filenames).
