// Explicit, per-provider consent before any user-typed text leaves the device
// for a third-party AI service.
//
// App Store Guideline 5.1.2 (revised 2025-11-13) requires that you "clearly
// disclose where personal data will be shared with third parties, including
// with third-party AI, and obtain explicit permission before doing so."
// Burying it in the privacy policy, or treating "the user tapped Generate" as
// consent, does not satisfy the rule.
//
// Consent is per-provider on purpose: agreeing to send a vision-board prompt to
// an image generator is NOT agreement to send relapse and urge disclosures to a
// language model. Each provider is asked for separately, once.

// Legacy single-provider key. Anyone who accepted the old modal accepted the
// Pollinations image generator, and only that — honor it, never widen it.
const LEGACY_KEY = "mm_ai_consent_v1";

const KEY_PREFIX = "mm_ai_consent_v2_";

export const AI_PROVIDERS = {
  pollinations: {
    id: "pollinations",
    name: "Pollinations.ai",
    kicker: "BEFORE YOU GENERATE",
    title: "This uses an AI image service",
    // What actually goes over the wire, in the user's words.
    sends: "the words you type for the picture",
    body: [
      "To paint your image, the words you type are sent to Pollinations.ai, a third-party AI image generator, which sends the picture back.",
      "Only your prompt text is shared — never your name, email, journal, or any other personal data.",
    ],
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic (Claude)",
    kicker: "BEFORE YOU TALK",
    title: "The corner runs on a third-party AI",
    sends: "what you type, plus your track, day count and claim",
    body: [
      "THE CORNER is an AI, not a person. To answer you, what you type is sent over the internet to Anthropic, the company that makes Claude, along with your track (weed / porn), your day count, your claim and your Mask's name.",
      "Your name, email, photos and the rest of your journal are never sent. Anthropic does not use it to train their models.",
      "It is not a therapist, counselor, sponsor or doctor, and it is not a crisis line. If you are in danger, call or text 988 (US) or your local emergency number.",
    ],
  },
};

function keyFor(provider) {
  return KEY_PREFIX + provider;
}

export function hasAiConsent(provider = "pollinations") {
  try {
    if (localStorage.getItem(keyFor(provider)) === "1") return true;
    // Grandfather the old key into the provider it was actually granted for.
    if (provider === "pollinations" && localStorage.getItem(LEGACY_KEY) === "1") return true;
    return false;
  } catch {
    return false;
  }
}

export function grantAiConsent(provider = "pollinations") {
  try {
    localStorage.setItem(keyFor(provider), "1");
  } catch {
    /* private mode / storage disabled — treat as ungranted next time */
  }
}

// Surfaced in Settings so consent is withdrawable, not one-way.
export function revokeAiConsent(provider) {
  try {
    if (provider) {
      localStorage.removeItem(keyFor(provider));
      if (provider === "pollinations") localStorage.removeItem(LEGACY_KEY);
      return;
    }
    Object.keys(AI_PROVIDERS).forEach((p) => localStorage.removeItem(keyFor(p)));
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* nothing to clear */
  }
}
