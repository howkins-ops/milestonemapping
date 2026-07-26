// ════════════════════════════════════════════════════════════════════════
// THE IDENTITY FORGE — the spine, the science, and the offline composer.
//
// Design law for this whole file: the forge is a BUILD, not a form. Order is
// the feature. He names what he's leaving (past tense, once), names who he's
// becoming, compresses both into ONE present-tense sentence, writes the code
// that sentence runs on, then SIGNS it. Nothing is editable until the stage
// before it is real — that's the difference between a builder and a wall.
//
// The old self appears in exactly one stage, in the past tense, and gets
// closed. It never gets the first cursor of the day again.
// ════════════════════════════════════════════════════════════════════════

import { GRANDIOSE_RE } from "./clearDayData.js";
import { hasAiConsent } from "../../lib/aiConsent.js";

export const CLAIM_MIN = 10;
export const CLAIM_MAX_WORDS = 18; // the forge asks Haiku for 14; his own hand gets slack

/* ── the five stages ──────────────────────────────────────────────────── */
export const STAGES = [
  {
    id: "old",
    n: 1,
    label: "THE OLD NAME",
    lead: "Name the version you're leaving. Past tense — this is the only place he gets space.",
    accent: "255, 122, 136", // rose
  },
  {
    id: "new",
    n: 2,
    label: "THE NEW NAME",
    lead: "Name the man you're becoming. Specific enough to walk into.",
    accent: "123, 228, 149", // green
  },
  {
    id: "claim",
    n: 3,
    label: "THE CLAIM",
    lead: "Compress both into one sentence, present tense. This is the sentence you operate from.",
    accent: "127, 180, 255", // dawn
  },
  {
    id: "code",
    n: 4,
    label: "THE CODE",
    lead: "The laws the claim runs on. A rule armed with a when-then is the strongest move in here.",
    accent: "255, 196, 107", // amber
  },
  {
    id: "seal",
    n: 5,
    label: "SEAL IT",
    lead: "Sign the file in your own hand, then say it out loud. Signed beats decided.",
    accent: "255, 196, 107",
  },
];

/* ── science receipts — one per zone now, collapsed, instead of seven
      always-open blocks. Same citations, a fraction of the noise. ─────── */
export const SCIENCE = {
  forge:
    "Identity change runs on order, not effort. Naming the old self in the past tense makes it something you HAD rather than something you ARE (narrative externalization), and vivid contact with the future self is the strongest known antidote to “just this once” (future-self continuity, Hershfield).",
  claim:
    "One short present-tense sentence beats a paragraph: it has to be retrievable at 11pm without reading it. Keep it believable TODAY — grandiose claims fall outside the latitude of acceptance and backfire (Wood 2009).",
  code:
    "A rule armed with a when-then trigger is one of the strongest effects in behaviour science — d = 0.65 across 94 studies (Gollwitzer & Sheeran). Environment beats willpower; the Ritual rehearses one armed rule every night.",
  seal:
    "A signature in your own hand raises follow-through by making the commitment identity-relevant rather than administrative (Kettle & Häubl). Spoken words go deeper than read ones — that's why the claim gets said three times, not filed silently.",
  proof:
    "Your brain decides who you are by watching what you do — self-perception (Bem 1972). Logged actions change self-concept; announced intentions don't, and telling people about a new identity actually reduces the striving (Gollwitzer 2009). Proof goes first here on purpose: receipts beat announcements, and the file opens with your move, not the Fog's line.",
};

/* the standing quiet-day answer — a clean day still closes 3/3, honestly */
export const QUIET_DAY_LIE = "It didn't get a word in today.";
export const QUIET_DAY_TRUTH = "Nothing to answer — the day ran on the new file.";

/* ── claim hygiene ────────────────────────────────────────────────────── */

const SPECTATOR_RE = /\b(try|trying|tried|want|wanna|hope|hopefully|wish|should|maybe|gonna)\b/i;
const FUTURE_RE = /\b(i will|i'll|i'm going to|i am going to|one day|someday)\b/i;

// Reasons a candidate claim isn't ready, in the order worth telling him.
// Returns null when the claim is clean.
export function claimFault(text) {
  const t = String(text || "").trim();
  if (t.length < CLAIM_MIN) return null; // too early to nag
  if (GRANDIOSE_RE.test(t)) {
    return "Absolutes backfire — “choosing,” “becoming,” “someone who” beat “forever” and “never again.”";
  }
  if (FUTURE_RE.test(t)) return "Present tense only. Not who you'll be — who you are when you're operating right.";
  if (SPECTATOR_RE.test(t)) return "That's a spectator word. The claim is written by the author, not the audience.";
  if (/\baddict\b/i.test(t)) return "Not a word this file uses. Name what you ARE, not what you were called.";
  const words = t.split(/\s+/).filter(Boolean).length;
  if (words > CLAIM_MAX_WORDS) return `${words} words. Cut it to something you can say from memory at 11pm.`;
  return null;
}

export function claimOk(text) {
  return String(text || "").trim().length >= CLAIM_MIN && !claimFault(text);
}

/* ── the offline composer ─────────────────────────────────────────────────
   The real forge is Haiku 4.5 in Jon's voice (netlify/functions/claim-forge).
   This is the fallback when the network or the key isn't there — scaffolds
   built from HIS OWN sentences so the stage is never a dead end. Labelled as
   scaffolds in the UI, because pretending a template is a forged line would
   be exactly the kind of fluff he asked me to cut. */

const STOP_LEAD = /^(?:and|but|then|so|because)\s+/i;

/* Present-tense verb leads. Deliberately a real lexicon rather than a clever
   /\w+s/ guess: "gym bag already packed" and "Sarah still asleep" both look
   verb-led to a regex and produce broken grammar in a frame. If we can't be
   sure a fragment is a verb phrase, we don't build a sentence out of it. */
const VERB_LEAD = new RegExp(
  "^(?:don'?t|doesn'?t|do|does|get|gets|wake|wakes|build|builds|stay|stays|show|shows|move|moves|" +
  "train|trains|read|reads|write|writes|cook|cooks|earn|earns|lead|leads|make|makes|keep|keeps|" +
  "hold|holds|meet|meets|call|calls|walk|walks|run|runs|lift|lifts|sleep|sleeps|eat|eats|" +
  "finish|finishes|start|starts|put|puts|take|takes|leave|leaves|answer|answers|protect|protects|" +
  "provide|provides|choose|chooses|live|lives|breathe|breathes|handle|handles|face|faces|" +
  "go|goes|say|says|tell|tells|pick|picks|carry|carries)\\b",
  "i"
);

/* Split prose into comma- and sentence-level segments. No length filter here —
   the old version dropped everything over 90 chars, which silently killed the
   whole fallback on any normal paragraph. */
function segments(prose) {
  const out = [];
  String(prose || "")
    .replace(/\s+/g, " ")
    .split(/[.!?;\n]+/)
    .forEach((sentence) => {
      sentence.split(/,\s*/).forEach((seg) => {
        const s = seg.trim().replace(STOP_LEAD, "").trim();
        if (s.split(/\s+/).filter(Boolean).length >= 2) out.push(s);
      });
    });
  return out;
}

function shorten(s, max = 64) {
  const t = String(s || "").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const sp = cut.lastIndexOf(" ");
  return (sp > 24 ? cut.slice(0, sp) : cut).trim();
}

function strip(s) {
  return String(s || "").trim().replace(/[.!?]+$/, "");
}

function period(s) {
  const t = String(s || "").trim();
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

/* A fragment we can safely drop into "I'm someone who ___". */
function verbPhrase(prose) {
  const pool = segments(prose).filter((s) => VERB_LEAD.test(s));
  if (!pool.length) return "";
  const picked = pool.sort((a, b) => a.length - b.length)[0];
  const t = strip(shorten(picked));
  return /^[A-Z][a-z]/.test(t) ? t[0].toLowerCase() + t.slice(1) : t;
}

/* Sentences he ALREADY wrote in the first person are already claims — no
   grammar guessing required. This is the strongest fallback material there is. */
function firstPerson(prose) {
  return segments(prose)
    .filter((s) => /^(?:i|my)\b/i.test(s))
    .map((s) => period(strip(shorten(s, 90))));
}

function listItems(v) {
  return String(v || "")
    .split(/\s*·\s*|\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// The offline composer. Order of preference:
//   1. what he already wrote in the first person (grammatical by construction)
//   2. his laws and beliefs — already "I don't…" / "My… " sentences
//   3. a frame, but ONLY around a fragment we're confident is a verb phrase
// If none of that yields anything, it returns nothing and says so. Three
// broken sentences would be worse than an honest empty state.
export function composeClaims({ old: oldText, future, beliefs = "", law = "" } = {}) {
  const out = [
    ...firstPerson(future),
    ...listItems(beliefs).filter((s) => /^(?:i|my)\b/i.test(s)).map((s) => period(strip(shorten(s, 90)))),
    ...listItems(law).filter((s) => /^i\s+don'?t\b/i.test(s)).map((s) => period(strip(shorten(s, 90)))),
  ];

  const doing = verbPhrase(future);
  const leaving = verbPhrase(oldText);
  if (doing) out.push(`I'm someone who ${doing}.`);
  if (doing && leaving) out.push(`I don't ${leaving} anymore — I ${doing}.`);
  if (doing && out.length < 3) out.push(`I'm the kind of man who ${doing}.`);

  return out
    .map((c) => c.replace(/\s+/g, " ").trim())
    .filter((c) => c.length >= CLAIM_MIN && !GRANDIOSE_RE.test(c) && !/\baddict\b/i.test(c))
    .filter((c, i, a) => a.findIndex((x) => x.toLowerCase() === c.toLowerCase()) === i)
    .slice(0, 3);
}

/* Tap-to-start frames for the offline dead-end. Visibly incomplete on
   purpose — a half-sentence he finishes is honest; a template dressed up as a
   forged line is exactly the fluff this rebuild was meant to cut. Turning
   scene prose ("up at six, gym bag packed") into a first-person claim is a
   language model's job, so when the corner is unreachable we hand him the pen
   rather than fake it. */
export const CLAIM_FRAMES = ["I'm someone who ", "I don't ", "I'm the man who "];

/* ── the forge call ──────────────────────────────────────────────────────
   Never throws, never blocks the stage. Resolves { claims, source } where
   source is "corner" (real, forged in his voice) or "local" (scaffolds).

   Consent is enforced here as well as in the UI: this is the only function in
   the module that can put his words on the wire, so it is the right place to
   make "no consent, no transmission" structurally true rather than a promise
   the calling component has to remember to keep (5.1.2). */
export async function forgeClaims(ctx) {
  const local = composeClaims(ctx);
  if (!hasAiConsent("anthropic")) return { claims: local, source: "local" };
  try {
    const res = await fetch("/.netlify/functions/claim-forge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ctx),
    });
    if (!res.ok) return { claims: local, source: "local" };
    const data = await res.json();
    // The model is told the laws; we still enforce them client-side.
    const clean = (Array.isArray(data.claims) ? data.claims : [])
      .map((c) => String(c || "").replace(/\s+/g, " ").trim())
      .filter((c) => c.length >= CLAIM_MIN && !GRANDIOSE_RE.test(c) && !/\baddict\b/i.test(c))
      .slice(0, 3);
    if (!clean.length) return { claims: local, source: "local" };
    return { claims: clean, source: "corner" };
  } catch {
    return { claims: local, source: "local" };
  }
}
