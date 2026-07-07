# App Store Launch Checklist — Milestone Mapping

Working plan for getting the app live on the iOS App Store. Code-side items are DONE (see bottom); this file is mostly **Jon's manual steps** — nobody else can do enrollment, and App Store Connect is web-based.

---

## 1. Apple Developer Program (START FIRST — everything waits on this)
- [ ] Go to https://developer.apple.com/programs/enroll/ → enroll as **Individual**, $99/yr
  - Use your **legal name** on the Apple Account, 2FA enabled, no P.O. box address
  - Approval typically 1–3 days
- [ ] When approved: App Store Connect → **Users and Access → Integrations → Keys** → create an API key (role: App Manager). Download the `.p8` file ONCE, note the **Key ID** and **Issuer ID**. This powers the build pipeline.

## 2. App Store Connect setup (after enrollment)
- [ ] developer.apple.com → Certificates, Identifiers & Profiles → Identifiers → new App ID: `com.milestonemapping.app` (explicit)
- [ ] App Store Connect → Apps → “+” → New App: iOS, name (≤30 chars, must be unique store-wide), language English, the bundle ID above, any SKU (e.g. `MM001`)
- [ ] EU Digital Services Act: declare trader status when prompted (non-trader is fine while the app is free)

## 3. Codemagic build pipeline (no Mac needed)
- [ ] Sign in at https://codemagic.io with GitHub, add this repo
- [ ] Teams → Integrations → **App Store Connect**: upload the `.p8` key + Key ID + Issuer ID, name it `appstore_credentials`
- [ ] Push the repo (with `codemagic.yaml`, already written) → run the `ios-testflight` workflow
- Free tier = 500 macOS build minutes/month; one build ≈ 10–15 min

## 4. TestFlight
- [ ] First successful build lands in App Store Connect → TestFlight automatically
- [ ] Add yourself as internal tester → install TestFlight app on your iPhone → install the build
- [ ] Device QA checklist: audio with the mute switch ON, progress survives force-quit + restart, safe areas on a notched phone, offline cold start (airplane mode), account create/delete, report + block flows

## 5. Store listing (App Store Connect, can prep in parallel)
- [ ] Screenshots: **6.9" iPhone set required** — 1290×2796 px portrait, 1–10 images (recommend 5–6: dashboard, a game, the Zone feed, milestone map, city). iPhone-only v1 → no iPad screenshots needed (uncheck iPad in the build targets / availability)
- [ ] 1024×1024 app icon (no transparency, no rounded corners)
- [ ] Name, subtitle (30 chars), description, keywords (100 chars), support URL, marketing URL (optional)
- [ ] Privacy policy URL: `https://<your-netlify-domain>/legal/privacy.html` (page already live in the app/site)
- [ ] **App Privacy labels** — declare, all “linked to identity”, none “used for tracking”:
  - Contact Info → Email Address (app functionality)
  - User Content → Other User Content (posts, messages, journal) (app functionality)
  - Identifiers → User ID (app functionality)
- [ ] **Age rating questionnaire** — answer honestly: frequent/intense profanity (the 21+ RAW packs) + mature themes → expect **16+ / 18+** under the new system. Do NOT under-declare (that's a metadata rejection)
- [ ] **Review notes**: explain it's a personal-development/accountability app; wellness content is self-help, not medical. Provide a **demo account** login (create a fresh reviewer account, e.g. `reviewer@…` — don't hand over @coach_demo if it has real-looking data)

## 6. Submit
- [ ] Submit for review. New-app queue is typically 2–5 days; ~25% of first submissions get rejected — read the rejection, fix, resubmit (fast). Budget 1–2 cycles.
- [ ] Release option: “Manually release this version” is safest for v1

## Ongoing after launch
- $99/yr auto-renew ON (lapse = app removed from Store)
- Rebuild with newest iOS SDK each spring (Apple deadline ~April 28 yearly; Codemagic images update automatically)
- Respond to content reports within 24h (Terms promise it; Apple enforces it for UGC apps)

---

## Code-side status (done in repo)

| Item | Status |
|---|---|
| In-app account deletion (Settings → Danger Zone) | ✅ UI calls the `delete-account` edge function (already deployed to prod) |
| Privacy Policy + Terms pages | ✅ `public/legal/privacy.html`, `public/legal/terms.html` — deploy site to make the URL live |
| Terms acceptance checkbox at signup + live footer links | ✅ `AuthGate.jsx` |
| Support email + wellness disclaimer | ✅ Settings → Support & Legal (`SUPPORT_EMAIL` in `src/lib/constants.js`) |
| Objectionable-content filter on all Zone UGC | ✅ `src/lib/contentFilter.js` wired through `zoneService.js` |
| Report button / user blocking / community rules | ✅ already existed |
| Capacitor 8 iOS project | ✅ `ios/`, `capacitor.config.json`, 7 native plugins (haptics, preferences, notifications, share, splash, status bar, app) |
| Mute-switch audio fix (AVAudioSession playback) | ✅ `ios/App/App/AppDelegate.swift` |
| Privacy manifest | ✅ `ios/App/App/PrivacyInfo.xcprivacy` |
| localStorage durability on iOS (snapshot→Preferences) | ✅ `src/lib/nativeStorage.js` + `main.jsx` |
| Haptics utility for games | ✅ `src/lib/haptics.js` (wire into game events over time) |
| Asset diet | ✅ 74 orphaned files (86.9 MB) archived; PNG+mp3 recompression scripts (`npm run audit:assets` / `compress:assets`) |
| Codemagic pipeline | ✅ `codemagic.yaml` (needs step 3 above) |
| Push notifications | ⏳ deferred to v1.1 (needs APNs key; local notifications plugin already in) |
| App icon / splash generation | ⏳ needs a 1024px master logo → `npx @capacitor/assets generate` |
