// One-time consent before any user-typed text is sent to the third-party AI
// image service (Pollinations.ai). App Store Guideline 5.1.2(i) requires
// explicit, provider-named consent BEFORE the first transmission — burying it
// in the privacy policy, or treating "the user tapped Generate" as consent,
// does not satisfy the rule.

const KEY = "mm_ai_consent_v1";

export function hasAiConsent() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function grantAiConsent() {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    /* private mode / storage disabled — treat as ungranted next time */
  }
}
