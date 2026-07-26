// One 18+ acknowledgement, shared by every adult surface in the app.
//
// Previously this lived only in AngerGymPage as `anger_raw_ack_v1`, with a code
// comment that said "21+" while the button said 18+ and the level badges said
// 18+. CLEARDAY's porn track — the most adult content in the app — had no gate
// at all. One key, one number, one place to change it.
//
// This is a self-attestation, not age verification. The app's App Store /
// Play rating is 18+; this gate exists so an adult surface announces itself
// before it opens, not as a substitute for the store's own age signal.

const KEY = "mm_adult_ack_v1";
const LEGACY_KEY = "anger_raw_ack_v1"; // anyone who already confirmed in Anger Gym

export const ADULT_MIN_AGE = 18;

export function hasAdultAck() {
  try {
    return localStorage.getItem(KEY) === "1" || localStorage.getItem(LEGACY_KEY) === "1";
  } catch {
    return false;
  }
}

export function grantAdultAck() {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    /* private mode / storage disabled — ask again next time */
  }
}
