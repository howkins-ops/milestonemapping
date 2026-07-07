// Objectionable-content filter for everything members post in the Zone
// (App Store Guideline 1.2: a method for filtering objectionable material).
//
// Scope is deliberately narrow: hate slurs, sexual exploitation of minors,
// and direct violent threats. Everyday profanity is NOT blocked — the app
// is rated for mature audiences and its own voice tracks swear. The rest of
// the 1.2 pipeline (report button, blocking, 24h review) handles gray areas.

const BLOCKED = [
  // Hate slurs (racial, ethnic, homophobic, transphobic, ableist)
  /\bn[i1]gg+[ae3]r?s?\b/,
  /\bf[a4]gg?[o0]ts?\b/,
  /\bk[i1]kes?\b/,
  /\bsp[i1]cs?\b/,
  /\bch[i1]nks?\b/,
  /\bwetbacks?\b/,
  /\btr[a4]nn(y|ies)\b/,
  /\br[e3]t[a4]rds?\b/,
  // Sexual exploitation of minors
  /\bchild\s*p[o0]rn/,
  /\bp[e3]d[o0](phile|s)?\b/,
  /\bloli(con)?\b/,
  // Direct violent threats
  /\bkill\s+(you|your|yourself|urself|ur\s*self)\b/,
  /\bkys\b/,
  /\bgo\s+die\b/,
  /\brape\s+(you|your|her|him|them)\b/,
];

// Collapse leet-speak and separators so obfuscated spellings still match.
function normalize(text) {
  return String(text)
    .toLowerCase()
    .replace(/\$/g, "s")
    .replace(/@/g, "a")
    .replace(/[.\-_*+~^|]/g, "")
    .replace(/\s+/g, " ");
}

// Boundary-free variants, applied ONLY to compacted single-letter runs
// ("f a g g 0 t" → "fagg0t") where word boundaries no longer exist.
const BLOCKED_LOOSE = BLOCKED.map((re) => new RegExp(re.source.replace(/\\b/g, ""), re.flags));

// Returns true when the text contains blocked material.
export function isObjectionable(text) {
  if (!text) return false;
  const clean = normalize(text);
  if (BLOCKED.some((re) => re.test(clean))) return true;
  // Spaced-out evasion: pull runs of 3+ single-character tokens and re-check.
  const runs = clean.match(/(?:\b\w ){2,}\w\b/g) || [];
  return runs.some((run) => {
    const compact = run.replace(/ /g, "");
    return BLOCKED_LOOSE.some((re) => re.test(compact));
  });
}

// Throws the zoneErrorMessage-mapped `content_blocked` error when any of the
// given strings contain blocked material. Call before sending UGC to the server.
export function assertClean(...texts) {
  for (const t of texts) {
    if (isObjectionable(t)) throw new Error("content_blocked");
  }
}
