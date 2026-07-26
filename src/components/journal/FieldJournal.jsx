import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useAppData } from "../../hooks/useAppData.js";
import { useFieldJournal } from "./useFieldJournal.js";
import {
  sfxPageTurn,
  sfxWaxSeal,
  sfxQuillScratch,
  sfxPrayerBell,
  sfxHalo,
} from "../../lib/sfx.js";
import { tapLight } from "../../lib/haptics.js";

/* ═══════════════════════════════════════════════════════════════
   THE FIELD JOURNAL
   dark leather · gold foil · parchment · ink
   spaces: cover → wizard → pillars → story → prayers → memories
   Persisted to Supabase (journal_* tables) via useFieldJournal.
   ═══════════════════════════════════════════════════════════════ */

const GOLD = "#C9A24B";

/* Every shade of a tone is precomputed rather than color-mix()'d, so the
   older iOS WebViews Capacitor ships against render them too.
     soft  — the dilute wash on a list card
     stain — the heavier bleed that seeps into the page you're writing on
     rule  — the ruled lines, pulled toward the tone
     ink   — the handwriting itself, pulled toward the tone
     wax   — sealing wax in that colour. Historically wax was beeswax and
             resin "often coloured red or green", so green is no invention. */
const MOODS = [
  { id: "ember",  label: "ember",    color: "#B4452F", soft: "rgba(180,69,47,.15)",  stain: "rgba(168,58,36,.44)",  rule: "rgba(150,64,44,.34)",  ink: "#3b1c14", wax: "#9E3520" },
  { id: "gold",   label: "steady",   color: "#C9A24B", soft: "rgba(201,162,75,.16)", stain: "rgba(178,132,44,.44)", rule: "rgba(150,112,40,.36)", ink: "#3a2a10", wax: "#B08432" },
  { id: "forest", label: "grounded", color: "#4C5B3F", soft: "rgba(76,91,63,.16)",   stain: "rgba(62,84,51,.46)",   rule: "rgba(64,88,52,.36)",   ink: "#1e2a17", wax: "#3E5433" },
  { id: "ash",    label: "heavy",    color: "#6B675E", soft: "rgba(107,103,94,.15)", stain: "rgba(87,83,74,.44)",   rule: "rgba(84,80,72,.36)",   ink: "#25231e", wax: "#57534A" },
  { id: "night",  label: "quiet",    color: "#33415C", soft: "rgba(51,65,92,.17)",   stain: "rgba(43,58,87,.46)",   rule: "rgba(52,68,98,.36)",   ink: "#17203a", wax: "#2B3A57" },
];

/* classic vermilion — what an untoned page gets sealed with */
const WAX_DEFAULT = "#9E3520";

const moodOf = (moodId) => MOODS.find((m) => m.id === moodId);

/* The tone rides on custom properties, so one rule paints the ribbon, the
   wash, the ruled lines and the ink. An untoned entry passes nothing and
   every one of them falls back to the plain page. */
const toneStyle = (moodId) => {
  const m = moodOf(moodId);
  return m ? {
    "--fj-tone": m.color,
    "--fj-tone-soft": m.soft,
    "--fj-tone-stain": m.stain,
    "--fj-tone-rule": m.rule,
    "--fj-tone-ink": m.ink,
  } : undefined;
};

const LEATHERS = [
  { id: "oxblood", label: "oxblood", css: "linear-gradient(145deg,#3a1210,#1a0907 60%,#0d0504)" },
  { id: "black", label: "black", css: "linear-gradient(145deg,#232019,#100e0a 60%,#080706)" },
  { id: "walnut", label: "walnut", css: "linear-gradient(145deg,#3b2a17,#1e150b 60%,#0e0a05)" },
  { id: "forest", label: "forest", css: "linear-gradient(145deg,#1e2b1c,#0f160e 60%,#070b06)" },
];
const EMBLEMS = ["✦", "▲", "◈", "☗", "✕", "⚑"];

const PILLARS = [
  {
    id: "physical", icon: "💪", name: "Physical",
    question: "Did my body earn my brain today?",
    prompts: ["Did your body earn your brain today? What did you do, and why does it matter?"],
    science: "Moderate-to-hard training raises BDNF — the compound that drives neuroplasticity. It sharpens executive control more than raw speed. The sweet spot sits near 120–360 minutes a week. Train the body to fuel the brain, not for the mirror.",
  },
  {
    id: "intellectual", icon: "🧠", name: "Intellectual",
    question: "Keep learning to keep earning — what did I learn today?",
    prompts: ["One thing you learned today — a book, a podcast, a mentor, a hard lesson from the field.", "One if/then plan to put it to work tomorrow."],
    science: "Continued learning builds new neural connections and cognitive reserve — the earners who read keep compounding. Knowledge only pays when it gets applied: if X, then I will Y plans measurably raise follow-through (Gollwitzer & Sheeran). Capture the lesson, then schedule its use.",
  },
  {
    id: "emotional", icon: "❤️", name: "Emotional",
    question: "What was the hardest moment — and how do I rewrite it?",
    prompts: ["The hardest moment today.", "Rewrite it with insight words — because, I realize, I understand."],
    science: "Emotional-disclosure writing shifts the brain off its negative bias and strengthens prefrontal regulation over time. The gain comes from restructuring, not venting — rewriting the moment with because and I realize is the mechanism itself.",
  },
  {
    id: "spiritual", icon: "🙏", name: "Spiritual",
    question: "Did I walk with God today?",
    prompts: ["Your conversation with God today — a prayer, a verse, a moment of gratitude.", "Where did faith show up in the work?"],
    science: "Prayer and contemplative practice lower cortisol and quiet the stress response. A grounded sense of faith and purpose makes stressors read smaller and recovery come faster — purpose itself tracks with lower all-cause mortality. Anchor the day in something bigger than the numbers, and the numbers get lighter to carry.",
  },
  {
    id: "financial", icon: "💰", name: "Financial",
    question: "A letter to my future self + one if/then money plan.",
    prompts: ["One line to your future self.", "One if/then money plan."],
    science: "A single financial-psychology session lifted savings rates from 10% to over 17% of income. The working tools: a letter to your future self, and if/then money plans. Feeling continuous with your future self is what drives the better call.",
  },
];

const WIZARD = [
  {
    k: "machine", visual: "cover",
    title: "Before you write, understand the machine.",
    body: "Writing rewires the brain — but only a certain kind of writing. Seven pages. Two minutes. Then the book is yours.",
  },
  {
    k: "mechanism", visual: "brain",
    title: "Venting is not the mechanism.",
    body: "The measurable gains come from cognitive restructuring — shifting from I-language to causal, insight language: because, I realize, I understand. fMRI work at UCLA shows that labeling emotion in writing lowers amygdala activation and lights up the prefrontal cortex — the regulation center. Two hundred–plus studies back sessions of fifteen to thirty minutes.",
    shift: true,
  },
  {
    k: "physical", visual: "bdnf", pillar: "physical",
    title: "Physical — the body fuels the brain.",
    body: "Moderate-to-hard exercise raises BDNF and neuroplasticity — the core drivers of brain benefit. It sharpens executive function, especially controlled inhibition. Sweet spot: 120–360 minutes a week. Train to fuel the brain, not for vanity.",
  },
  {
    k: "intellectual", visual: "ifthen", pillar: "intellectual",
    title: "Intellectual — keep learning to keep earning.",
    body: "Continued learning builds new neural connections and cognitive reserve — the self-employed who read keep compounding while everyone else plateaus. But knowledge only pays when it gets applied: if X, then I will Y plans measurably raise follow-through (Gollwitzer & Sheeran). Capture what you learned. Then schedule its use.",
  },
  {
    k: "emotional", visual: "reframe", pillar: "emotional",
    title: "Emotional — the reframe engine.",
    body: "Disclosure writing shifts the brain off its negative bias and strengthens prefrontal regulation over time. Here you take the hardest moment of the day and rewrite it — because, I realize, I understand. That rewrite is the workout.",
  },
  {
    k: "spiritual", visual: "faith", pillar: "spiritual",
    title: "Spiritual — walk with God, carry less alone.",
    body: "Prayer and contemplative practice lower cortisol and quiet the stress response. A grounded faith makes stressors read smaller and recovery come faster — and a life anchored in purpose tracks with lower all-cause mortality. When the day is bigger than the numbers, the numbers get lighter to carry.",
  },
  {
    k: "financial", visual: "honest", pillar: "financial",
    title: "Financial — write to the man ahead of you.",
    body: "One financial-psychology session lifted savings rates from 10% to over 17% of income. The tools: a letter to your future self, and if/then money plans. One honest thing before you begin — the effect across a hundred-plus studies is real but modest, near d = .16, and some nights writing stings before it settles. This compounds. It is not instant. That is the deal.",
  },
];

/* ── helpers ── */
const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
const dayKey = (iso) => new Date(iso).toDateString();
const relAge = (iso) => {
  const d = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d <= 0) return "today"; if (d === 1) return "yesterday";
  if (d < 21) return `${d} days ago`; if (d < 45) return "a month ago";
  return `${Math.round(d / 30)} months ago`;
};

/* ── ink reveal: words fade in as if written ── */
function InkReveal({ text, cap = 2200 }) {
  const words = useMemo(() => String(text).split(/(\s+)/), [text]);
  let wi = 0;
  return (
    <span>
      {words.map((w, i) => {
        if (/^\s+$/.test(w)) return w;
        const d = Math.min(wi++ * 42, cap);
        return <span key={i} className="fj-ink-word" style={{ animationDelay: `${d}ms` }}>{w}</span>;
      })}
    </span>
  );
}

/* ── collapsible science card ── */
function ScienceCard({ pillar }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="fj-sci">
      <button className="fj-sci-head" onClick={() => setOpen(!open)}>
        <span className="fj-eyebrow">the science</span>
        <span className="fj-sci-caret" style={{ transform: open ? "rotate(90deg)" : "none" }}>❯</span>
      </button>
      {open && <p className="fj-sci-body">{pillar.science}</p>}
    </div>
  );
}

/* ── THE SEALING ──
   The real thing, beat for beat: a taper is lit, wax beads are melted in a
   spoon over the flame until they move like warm honey, the spoon is tipped
   over the rotulus, and then you WAIT — the tell is the outer edge of the
   pool going dull while the centre still shines. That brief window is when
   a cold matrix goes straight down, no rocking. It hisses, squeezes a burr
   of wax out under its rim, and lifts an impression that cures from glossy
   to matte. The wax takes the colour of the tone you chose for the page.
   Tap to cut it short. */
const SEAL_MS = 4600;

function WaxSeal({ onDone, settings, mood, emblem = "✦" }) {
  const reduced = settings?.reducedMotion
    || (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const done = useRef(false);
  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    onDone();
  }, [onDone]);

  useEffect(() => {
    sfxWaxSeal(settings);
    /* the press itself, then the release */
    const hit = reduced ? null : setTimeout(() => {
      try { if (navigator.vibrate) navigator.vibrate([26, 40, 14]); } catch { /* silent */ }
    }, 2800);
    const t = setTimeout(finish, reduced ? 1100 : SEAL_MS);
    return () => { clearTimeout(t); if (hit) clearTimeout(hit); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finish, reduced]);

  const wax = moodOf(mood)?.wax || WAX_DEFAULT;

  return (
    <div className={`fj-seal-veil ${reduced ? "fj-seal-quick" : ""}`} style={{ "--fj-wax": wax }}
      onClick={finish} role="presentation">
      <div className="fj-seal-stage" aria-hidden="true">
        {/* the rotulus — parchment furled on its umbilicus, knobs at each end */}
        <div className="fj-rotulus">
          <div className="fj-rotulus-sheet" />
          <div className="fj-rotulus-rod fj-rod-head"><i /><i /></div>
          <div className="fj-rotulus-rod fj-rod-foot"><i /><i /></div>
        </div>

        {/* the taper, lit */}
        <div className="fj-taper">
          <div className="fj-taper-wax" />
          <div className="fj-flame">
            <span className="fj-flame-outer" />
            <span className="fj-flame-inner" />
            <span className="fj-flame-base" />
          </div>
        </div>

        {/* the melting spoon: beads slump, merge, run like warm honey */}
        <div className="fj-spoon">
          <div className="fj-spoon-bowl">
            <span className="fj-spoon-melt" />
            {[0, 1, 2].map((i) => (
              <span key={i} className="fj-bead" style={{ "--fj-bi": i, animationDelay: `${620 + i * 90}ms` }} />
            ))}
          </div>
          <div className="fj-spoon-stem" />
        </div>

        {/* the pour */}
        {[0, 1, 2].map((i) => (
          <span key={i} className="fj-waxdrop" style={{ "--fj-di": i, animationDelay: `${1460 + i * 175}ms` }} />
        ))}

        {/* the pool: spreads, shines, then the rim dulls — the sweet spot */}
        <div className="fj-pool">
          <span className="fj-pool-body" />
          <span className="fj-pool-sheen" />
          <span className="fj-pool-burr" />
          <span className="fj-impression">{emblem}</span>
        </div>

        {/* cold brass against hot wax */}
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="fj-steam" style={{ "--fj-si": i - 2, animationDelay: `${2960 + i * 55}ms` }} />
        ))}

        {/* the matrix, coming straight down */}
        <div className="fj-matrix">
          <span className="fj-matrix-grip" />
          <span className="fj-matrix-shank" />
          <span className="fj-matrix-die">{emblem}</span>
        </div>
      </div>

      <div className="fj-seal-word">sealed</div>
      <div className="fj-seal-hint">tap to skip</div>
    </div>
  );
}

/* ── halo ritual overlay: an answered prayer ── */
function HaloRitual({ onDone, settings }) {
  useEffect(() => {
    sfxHalo(settings);
    try { if (navigator.vibrate) navigator.vibrate([20, 60, 20]); } catch { /* silent */ }
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDone]);
  return (
    <div className="fj-halo-veil">
      <div className="fj-halo-rays" aria-hidden="true" />
      <div className="fj-halo-scene">
        <div className="fj-halo-ring" />
        <div className="fj-halo-ring fj-halo-ring2" />
        <div className="fj-halo-glyph">🕊</div>
        <div className="fj-halo-motes" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="fj-halo-mote" style={{ "--fj-mx": `${(i % 6) * 34 - 85}px`, animationDelay: `${300 + i * 130}ms` }} />
          ))}
        </div>
      </div>
      <div className="fj-halo-label">answered</div>
      <div className="fj-halo-sub">He heard you. It came true.</div>
    </div>
  );
}

/* ── wizard visuals ── */
function WizardVisual({ v }) {
  if (v === "cover") return (
    <div className="fj-wz-vis">
      <div className="fj-mini-book"><span>FJ</span></div>
    </div>
  );
  if (v === "brain") return (
    <div className="fj-wz-vis fj-wz-brain">
      <div className="fj-node fj-node-amyg"><div className="fj-node-dot" /><span>amygdala<br />calming</span></div>
      <div className="fj-node-line" />
      <div className="fj-node fj-node-pfc"><div className="fj-node-dot" /><span>prefrontal<br />lighting</span></div>
    </div>
  );
  if (v === "bdnf") return (
    <div className="fj-wz-vis">
      <svg viewBox="0 0 220 80" width="220" height="80" aria-hidden="true">
        <polyline className="fj-bdnf" points="5,70 45,62 85,55 120,40 160,26 215,12"
          fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" />
        <text x="8" y="78" fill="#8a7a55" fontSize="8" fontFamily="'Source Serif 4',serif">effort</text>
        <text x="168" y="10" fill={GOLD} fontSize="8" fontFamily="'Source Serif 4',serif">BDNF</text>
      </svg>
    </div>
  );
  if (v === "ifthen") return (
    <div className="fj-wz-vis fj-wz-ifthen">
      <span className="fj-chip">if X</span><span className="fj-chip-arrow">→</span><span className="fj-chip fj-chip-gold">then I will Y</span>
    </div>
  );
  if (v === "reframe") return (
    <div className="fj-wz-vis fj-wz-shift">
      <span className="fj-strike">it happened to me</span>
      <span className="fj-chip-arrow">→</span>
      <span className="fj-insight">I realize…</span>
    </div>
  );
  if (v === "faith") return (
    <div className="fj-wz-vis"><div className="fj-flame">🙏</div></div>
  );
  return (
    <div className="fj-wz-vis fj-wz-honest">
      <span className="fj-chip">d = .16</span>
      <span className="fj-chip">compounds</span>
      <span className="fj-chip">never instant</span>
    </div>
  );
}

/* ═══════════════ MAIN JOURNAL ═══════════════ */
export default function FieldJournal({ onExit, startOpen = false }) {
  const { userId, settings, addXP } = useAppData();
  const {
    chapters, entries, prayers, wizardSeen,
    addEntry, editEntry, removeEntry, addChapter, addPrayer, markPrayerAnswered, markWizardSeen,
  } = useFieldJournal(userId);

  const [view, setView] = useState({ name: "cover" }); // cover | wizard | pillars | pillar | story | chapter | prayers | prayer-write | memories | write | entry
  const [wizStep, setWizStep] = useState(0);
  const [opening, setOpening] = useState(false);
  const [seal, setSeal] = useState(null); // callback after wax seal
  const [halo, setHalo] = useState(null); // callback after halo ritual
  const [pageKey, setPageKey] = useState(0);
  const [memFilter, setMemFilter] = useState("all");
  const [newChapterOpen, setNewChapterOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // entry id awaiting a tear-out confirm

  const go = useCallback((v) => {
    setView(v);
    setPageKey((k) => k + 1);
    setConfirmDelete(null);
    sfxPageTurn(settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  /* streak */
  const streak = useMemo(() => {
    const days = new Set(entries.map((e) => dayKey(e.created_at)));
    let n = 0; const d = new Date();
    if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
    while (days.has(d.toDateString())) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }, [entries]);

  const lastEntry = useMemo(() =>
    [...entries].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0], [entries]);

  /* resurfacing pick: oldest entry 20–45 days back, else oldest overall */
  const resurfaced = useMemo(() => {
    const sorted = [...entries].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const aged = sorted.filter((e) => {
      const d = (Date.now() - new Date(e.created_at)) / 86400000; return d >= 20 && d <= 45;
    });
    return aged[0] || sorted[0] || null;
  }, [entries]);

  const openPrayers = useMemo(() => prayers.filter((p) => !p.answered_at), [prayers]);
  const answeredPrayers = useMemo(() => prayers.filter((p) => p.answered_at), [prayers]);

  const openBook = () => {
    setOpening(true);
    setTimeout(() => {
      setOpening(false);
      go(wizardSeen ? { name: "pillars" } : { name: "wizard" });
      if (!wizardSeen) setWizStep(0);
    }, 950);
  };

  /* landed straight from the desk transition — the cover breathes once,
     then invites the tap. startOpen keeps the cover; the tap is the ritual. */
  useEffect(() => {
    if (startOpen) setView({ name: "cover" });
  }, [startOpen]);

  const saveEntry = (entry, after) => {
    addEntry(entry);
    addXP(15, "Journal entry sealed");
    /* a story page is stamped with its chapter's own emblem */
    const emblem = chapters.find((c) => c.id === entry.chapter_id)?.emblem || "✦";
    setSeal({ run: after, mood: entry.mood, emblem });
  };

  const finishWizard = () => {
    markWizardSeen();
    go({ name: "pillars" });
  };

  const newestChapter = chapters[chapters.length - 1];

  /* ── COVER ── */
  const renderCover = () => (
    <div className="fj-cover-wrap">
      <div className={`fj-book3d ${opening ? "fj-book-opening" : ""}`}>
        <div className="fj-page-block" aria-hidden="true" />
        <div className="fj-page-under" aria-hidden="true">
          <div className="fj-page-under-line" />
          <div className="fj-flutter fj-flutter1" />
          <div className="fj-flutter fj-flutter2" />
          <div className="fj-flutter fj-flutter3" />
        </div>
        <button className="fj-cover" onClick={openBook} aria-label="Open the journal">
          <div className="fj-cover-grain" />
          <div className="fj-cover-frame">
            <div className="fj-cover-rule" />
            <h1 className="fj-cover-title fj-foil">THE FIELD<br />JOURNAL</h1>
            <div className="fj-cover-sub">five pillars · one story</div>
            <div className="fj-cover-rule" />
            <div className="fj-cover-meta">
              <span>{streak > 0 ? `day ${streak}` : "day zero"}</span>
              <span className="fj-cover-dot">·</span>
              <span>{lastEntry ? `last seal ${relAge(lastEntry.created_at)}` : "unsealed"}</span>
            </div>
            <div className="fj-cover-open">tap to open</div>
          </div>
          <div className="fj-cover-spine">
            {streak > 0 && <span className="fj-spine-streak">{streak}</span>}
          </div>
        </button>
      </div>

      {resurfaced && (
        <button className="fj-thennow" onClick={() => go({ name: "entry", id: resurfaced.id, from: { name: "cover" } })}>
          <div className="fj-eyebrow" style={{ color: GOLD }}>then &amp; now · {relAge(resurfaced.created_at)} you wrote</div>
          <div className="fj-thennow-quote">“{resurfaced.body.slice(0, 110)}…”</div>
          <div className="fj-thennow-cta">open it — what has changed</div>
        </button>
      )}

      <div className="fj-cover-actions">
        <button className="fj-btn-ghost" onClick={() => { setWizStep(0); go({ name: "wizard" }); }}>the science</button>
        <button className="fj-btn-gold" onClick={() => {
          go({ name: "write", space: "story", chapterId: newestChapter?.id, continueStory: true });
        }}>continue the story</button>
      </div>

      <button className="fj-exit-link" onClick={onExit}>
        ✕ close the book — back to the map
      </button>
    </div>
  );

  /* ── WIZARD ── */
  const renderWizard = () => {
    const s = WIZARD[wizStep];
    const last = wizStep === WIZARD.length - 1;
    return (
      <div className="fj-page fj-page-turn" key={`wz${wizStep}`}>
        <div className="fj-wz-dots">
          {WIZARD.map((_, i) => <span key={i} className={`fj-dot ${i <= wizStep ? "fj-dot-on" : ""}`} />)}
        </div>
        <div className="fj-wz-card">
          {s.pillar && <div className="fj-wz-icon">{PILLARS.find((p) => p.id === s.pillar).icon}</div>}
          <h2 className="fj-display fj-wz-title">{s.title}</h2>
          <WizardVisual v={s.visual} />
          {s.shift && (
            <div className="fj-shift-row">
              <span className="fj-strike">I can't believe this happened to me</span>
              <span className="fj-chip-arrow">→</span>
              <span className="fj-insight">it happened because… and I realize…</span>
            </div>
          )}
          <p className="fj-body fj-wz-body">{s.body}</p>
        </div>
        <div className="fj-wz-nav">
          {!wizardSeen && !last && (
            <button className="fj-btn-ghost" onClick={finishWizard}>
              skip — I'll read later
            </button>
          )}
          {(wizardSeen || last) && wizStep > 0 && (
            <button className="fj-btn-ghost" onClick={() => setWizStep(wizStep - 1)}>back</button>
          )}
          <button className="fj-btn-gold" onClick={() => {
            if (last) finishWizard();
            else setWizStep(wizStep + 1);
          }}>
            {last ? "open your journal" : "turn the page"}
          </button>
        </div>
      </div>
    );
  };

  /* ── PILLARS INDEX ── */
  const renderPillarsIndex = () => (
    <div className="fj-page fj-page-turn" key={`px${pageKey}`}>
      <div className="fj-eyebrow">the index</div>
      <h2 className="fj-display fj-page-title">The Five Pillars</h2>
      <div className="fj-index-list">
        {PILLARS.map((p) => {
          const count = entries.filter((e) => e.pillar === p.id).length;
          return (
            <button key={p.id} className="fj-index-row" onClick={() => go({ name: "pillar", pillar: p.id })}>
              <span className="fj-index-icon">{p.icon}</span>
              <span className="fj-index-text">
                <span className="fj-index-name">{p.name}</span>
                <span className="fj-index-q">{p.question}</span>
              </span>
              <span className="fj-index-count">{p.id === "spiritual" ? count + prayers.length : count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  /* ── SINGLE PILLAR ── */
  const renderPillar = () => {
    const p = PILLARS.find((x) => x.id === view.pillar);
    const list = entries.filter((e) => e.pillar === p.id);
    return (
      <div className="fj-page fj-page-turn" key={`p${p.id}${pageKey}`}>
        <button className="fj-back" onClick={() => go({ name: "pillars" })}>❮ index</button>
        <div className="fj-pillar-head">
          <span className="fj-pillar-icon">{p.icon}</span>
          <h2 className="fj-script fj-pillar-title">{p.name}</h2>
          <div className="fj-pillar-q">{p.question}</div>
        </div>
        <button className="fj-btn-gold fj-btn-wide" onClick={() => go({ name: "write", space: "pillar", pillar: p.id })}>
          ＋ new entry
        </button>
        {p.id === "spiritual" && (
          <button className="fj-ledger-card" onClick={() => go({ name: "prayers" })}>
            <span className="fj-ledger-halo" aria-hidden="true" />
            <span className="fj-ledger-text">
              <span className="fj-ledger-name">The Prayer Ledger</span>
              <span className="fj-ledger-sub">
                {openPrayers.length} lifted up · {answeredPrayers.length} answered
              </span>
            </span>
            <span className="fj-ledger-glyph">🕊</span>
          </button>
        )}
        <ScienceCard pillar={p} />
        <div className="fj-stack">
          {list.map((e) => (
            <button key={e.id} className="fj-card" onClick={() => go({ name: "entry", id: e.id, from: { name: "pillar", pillar: p.id } })}
              style={toneStyle(e.mood)}>
              <div className="fj-card-top"><span className="fj-card-title">{e.title || "untitled"}</span><span className="fj-card-date">{fmtDate(e.created_at)}</span></div>
              <div className="fj-hand fj-card-preview">{e.body.slice(0, 90)}…</div>
            </button>
          ))}
          {list.length === 0 && <div className="fj-empty">a blank page is an honest start — write the first line</div>}
        </div>
      </div>
    );
  };

  /* ── PRAYER LEDGER ── */
  const renderPrayers = () => (
    <div className="fj-page fj-page-turn" key={`pr${pageKey}`}>
      <button className="fj-back" onClick={() => go({ name: "pillar", pillar: "spiritual" })}>❮ spiritual</button>
      <div className="fj-eyebrow">the ledger</div>
      <h2 className="fj-display fj-page-title">Prayers</h2>
      <button className="fj-btn-gold fj-btn-wide" onClick={() => go({ name: "prayer-write" })}>
        🕊 lift a prayer
      </button>

      <div className="fj-eyebrow fj-shelf-label">lifted up</div>
      <div className="fj-stack">
        {openPrayers.map((p) => (
          <PrayerCard key={p.id} prayer={p}
            onAnswered={(note) => {
              markPrayerAnswered(p.id, note);
              addXP(25, "A prayer answered — witnessed");
              setHalo(() => () => {});
            }} />
        ))}
        {openPrayers.length === 0 && <div className="fj-empty">nothing waiting — lift the first one</div>}
      </div>

      <div className="fj-eyebrow fj-shelf-label" style={{ color: GOLD }}>answered</div>
      <div className="fj-stack">
        {answeredPrayers.map((p) => (
          <div key={p.id} className="fj-prayer-card fj-prayer-answered">
            <span className="fj-answered-halo" aria-hidden="true" />
            <div className="fj-card-top">
              <span className="fj-card-title">{p.title || "a prayer"}</span>
              <span className="fj-answered-tab">✦ {fmtDate(p.answered_at)}</span>
            </div>
            <div className="fj-hand fj-card-preview">{p.body.slice(0, 120)}{p.body.length > 120 ? "…" : ""}</div>
            {p.answered_note && (
              <div className="fj-answered-note">
                <span className="fj-eyebrow" style={{ color: GOLD }}>how it was answered</span>
                <div className="fj-hand fj-answered-note-body">{p.answered_note}</div>
              </div>
            )}
          </div>
        ))}
        {answeredPrayers.length === 0 && <div className="fj-empty">the answered wall is waiting for its first light</div>}
      </div>
    </div>
  );

  /* ── PRAYER WRITE ── */
  const renderPrayerWrite = () => (
    <PrayerWritePage
      key={`pw${pageKey}`}
      onCancel={() => go({ name: "prayers" })}
      settings={settings}
      onSave={({ title, body }) => {
        addPrayer({ title, body });
        addXP(10, "Prayer lifted up");
        sfxPrayerBell(settings);
        go({ name: "prayers" });
      }}
    />
  );

  /* ── STORY INDEX ── */
  const renderStory = () => (
    <div className="fj-page fj-page-turn" key={`st${pageKey}`}>
      <div className="fj-eyebrow">story mode</div>
      <h2 className="fj-display fj-page-title">Your Book</h2>
      <div className="fj-story-wrap">
        <div className="fj-spine" aria-hidden="true">
          {chapters.map((c) => {
            const n = entries.filter((e) => e.chapter_id === c.id).length;
            return <div key={c.id} className="fj-spine-block" style={{ height: `${34 + Math.min(n, 8) * 10}px`, background: LEATHERS.find((l) => l.id === c.leather)?.css }}>
              <span>{c.emblem}</span>
            </div>;
          })}
        </div>
        <div className="fj-story-list">
          {chapters.map((c) => {
            const n = entries.filter((e) => e.chapter_id === c.id).length;
            return (
              <button key={c.id} className="fj-chapter-card" style={{ background: LEATHERS.find((l) => l.id === c.leather)?.css }}
                onClick={() => go({ name: "chapter", id: c.id })}>
                <div className="fj-chapter-emblem fj-foil">{c.emblem}</div>
                <div className="fj-chapter-name">{c.title}</div>
                {c.epigraph && <div className="fj-chapter-epi">“{c.epigraph}”</div>}
                <div className="fj-chapter-count">{n} {n === 1 ? "entry" : "entries"}</div>
              </button>
            );
          })}
          <button className="fj-newchapter" onClick={() => setNewChapterOpen(true)}>＋ new chapter</button>
        </div>
      </div>
    </div>
  );

  /* ── CHAPTER ── */
  const renderChapter = () => {
    const c = chapters.find((x) => x.id === view.id);
    if (!c) return null;
    const list = entries.filter((e) => e.chapter_id === c.id);
    return (
      <div className="fj-page fj-page-turn" key={`ch${c.id}${pageKey}`}>
        <button className="fj-back" onClick={() => go({ name: "story" })}>❮ your book</button>
        <div className="fj-chapter-opener fj-stamp-in" style={{ background: LEATHERS.find((l) => l.id === c.leather)?.css }}>
          <div className="fj-chapter-emblem fj-emblem-big fj-foil">{c.emblem}</div>
          <h2 className="fj-display fj-chapter-title">{c.title}</h2>
          {c.epigraph && <div className="fj-hand fj-epigraph">“{c.epigraph}”</div>}
        </div>
        <button className="fj-btn-gold fj-btn-wide" onClick={() => go({ name: "write", space: "story", chapterId: c.id })}>
          ＋ write the next page
        </button>
        <div className="fj-stack">
          {list.map((e) => (
            <button key={e.id} className="fj-card" onClick={() => go({ name: "entry", id: e.id, from: { name: "chapter", id: c.id } })}
              style={toneStyle(e.mood)}>
              <div className="fj-card-top"><span className="fj-card-title">{e.title || "untitled"}</span><span className="fj-card-date">{fmtDate(e.created_at)}</span></div>
              <div className="fj-hand fj-card-preview">{e.body.slice(0, 90)}…</div>
            </button>
          ))}
          {list.length === 0 && <div className="fj-empty">this chapter is a blank page — write the first line</div>}
        </div>
      </div>
    );
  };

  /* ── MEMORIES ── */
  const renderMemories = () => {
    const sorted = [...entries].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const filtered = sorted.filter((e) => {
      if (memFilter === "all") return true;
      if (memFilter === "story") return e.space === "story";
      return e.pillar === memFilter;
    });
    return (
      <div className="fj-page fj-page-turn" key={`mem${pageKey}`}>
        <div className="fj-eyebrow">the archive</div>
        <h2 className="fj-display fj-page-title">Memories</h2>
        <div className="fj-chips">
          {[{ id: "all", label: "all" }, ...PILLARS.map((p) => ({ id: p.id, label: p.icon })), { id: "story", label: "story" }].map((f) => (
            <button key={f.id} className={`fj-chip-btn ${memFilter === f.id ? "fj-chip-on" : ""}`} onClick={() => setMemFilter(f.id)}>{f.label}</button>
          ))}
        </div>
        <div className="fj-mem-list">
          {filtered.map((e, i) => {
            const p = PILLARS.find((x) => x.id === e.pillar);
            const c = chapters.find((x) => x.id === e.chapter_id);
            return (
              <button key={e.id} className="fj-mem-card fj-drawer-in" style={{ animationDelay: `${Math.min(i * 60, 600)}ms`, ...toneStyle(e.mood) }}
                onClick={() => go({ name: "entry", id: e.id, from: { name: "memories" } })}>
                <div className="fj-mem-tab">{fmtDate(e.created_at)}</div>
                <div className="fj-mem-src">{p ? `${p.icon} ${p.name}` : `📖 ${c?.title || "story"}`}{e.linked_to ? " · then & now" : ""}</div>
                <div className="fj-card-title">{e.title || "untitled"}</div>
                <div className="fj-hand fj-card-preview">{e.body.slice(0, 100)}…</div>
              </button>
            );
          })}
          {filtered.length === 0 && <div className="fj-empty">nothing in the drawer yet</div>}
        </div>
      </div>
    );
  };

  /* ── ENTRY VIEW ── */
  const renderEntry = () => {
    const e = entries.find((x) => x.id === view.id);
    if (!e) return null;
    const p = PILLARS.find((x) => x.id === e.pillar);
    const c = chapters.find((x) => x.id === e.chapter_id);
    const linked = e.linked_to ? entries.find((x) => x.id === e.linked_to) : null;
    return (
      <div className="fj-page fj-page-turn" key={`en${e.id}`} style={toneStyle(e.mood)}>
        <button className="fj-back" onClick={() => go(view.from || { name: "memories" })}>❮ back</button>
        <div className="fj-entry-head">
          <div className="fj-eyebrow">{p ? `${p.icon} ${p.name}` : `📖 ${c?.title || "story"}`} · {fmtDate(e.created_at)}</div>
          <h2 className="fj-display fj-entry-title">{e.title || "untitled"}</h2>
          {e.mood && <div className="fj-mood-pill" style={{ background: moodOf(e.mood)?.color }}>{moodOf(e.mood)?.label}</div>}
        </div>
        {linked && <div className="fj-linked">reflecting on · “{linked.body.slice(0, 80)}…”</div>}
        <div className="fj-parchment fj-parchment-toned">
          <div className="fj-hand fj-entry-body"><InkReveal text={e.body} /></div>
        </div>
        <button className="fj-btn-ghost fj-btn-wide" onClick={() =>
          go({ name: "write", space: e.space, pillar: e.pillar, chapterId: e.chapter_id, linkedTo: e.id, from: view.from })
        }>
          what has changed — write a reflection
        </button>

        <div className="fj-entry-actions">
          <button className="fj-btn-ghost fj-btn-half" onClick={() =>
            go({ name: "write", editId: e.id, space: e.space, pillar: e.pillar, chapterId: e.chapter_id, from: view.from })
          }>
            ✎ revise this page
          </button>
          <button className="fj-btn-ghost fj-btn-half fj-btn-danger" onClick={() => setConfirmDelete(e.id)}>
            tear out ✂
          </button>
        </div>
      </div>
    );
  };

  /* Lives at the root, not inside .fj-page — the page's staggered reveal
     targets every direct child and would slide a fixed overlay. */
  const renderTearOut = () => {
    const e = entries.find((x) => x.id === confirmDelete);
    if (!e) return null;
    return (
      <div className="fj-modal-veil" onClick={() => setConfirmDelete(null)}>
        <div className="fj-modal" onClick={(ev) => ev.stopPropagation()}>
          <div className="fj-eyebrow">tear this page out?</div>
          <h3 className="fj-display fj-modal-title">{e.title || "untitled"}</h3>
          <div className="fj-hand fj-modal-note">
            this cannot be undone — the ink is gone. anything you wrote in reflection on it stays.
          </div>
          <div className="fj-modal-actions">
            <button className="fj-btn-ghost" onClick={() => setConfirmDelete(null)}>keep it</button>
            <button className="fj-btn-ghost fj-btn-danger" onClick={() => {
              const back = view.from || { name: "memories" };
              setConfirmDelete(null);
              removeEntry(e.id);
              go(back);
            }}>
              tear it out
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ── nav ── */
  const NAV = [
    { id: "pillars", label: "pillars", glyph: "▦" },
    { id: "story", label: "story", glyph: "❦" },
    { id: "prayers", label: "prayers", glyph: "🕊" },
    { id: "memories", label: "memories", glyph: "❒" },
  ];
  const showNav = !["cover", "write", "prayer-write"].includes(view.name);

  return (
    <div className="fj-root">
      <div className="fj-vignette" aria-hidden="true" />
      <div className="fj-frame">
        {view.name === "cover" && renderCover()}
        {view.name === "wizard" && renderWizard()}
        {view.name === "pillars" && renderPillarsIndex()}
        {view.name === "pillar" && renderPillar()}
        {view.name === "prayers" && renderPrayers()}
        {view.name === "prayer-write" && renderPrayerWrite()}
        {view.name === "story" && renderStory()}
        {view.name === "chapter" && renderChapter()}
        {view.name === "memories" && renderMemories()}
        {view.name === "entry" && renderEntry()}
        {view.name === "write" && (
          <WritePage key={`w${pageKey}`} view={view} entries={entries} chapters={chapters} settings={settings}
            onCancel={() => go(
              view.editId
                ? { name: "entry", id: view.editId, from: view.from }
                : view.from || (view.space === "story" ? { name: "chapter", id: view.chapterId } : view.pillar ? { name: "pillar", pillar: view.pillar } : { name: "pillars" })
            )}
            onSave={(entry) => {
              /* A revision earns no seal and no XP — those belong to the
                 first writing, or re-saving would farm them. */
              if (entry.editId) {
                editEntry(entry.editId, entry);
                go({ name: "entry", id: entry.editId, from: view.from });
                return;
              }
              saveEntry(entry, () =>
                go(entry.space === "story" ? { name: "chapter", id: entry.chapter_id } : { name: "pillar", pillar: entry.pillar })
              );
            }}
          />
        )}
      </div>

      {showNav && (
        <nav className="fj-nav">
          {NAV.map((n) => (
            <button key={n.id}
              className={`fj-nav-btn ${view.name === n.id || (n.id === "pillars" && view.name === "pillar") || (n.id === "story" && view.name === "chapter") || (n.id === "prayers" && view.name === "prayer-write") ? "fj-nav-on" : ""}`}
              onClick={() => go({ name: n.id })}>
              <span className="fj-nav-glyph">{n.glyph}</span>
              <span>{n.label}</span>
            </button>
          ))}
          <button className="fj-nav-btn" onClick={() => { setWizStep(0); go({ name: "wizard" }); }}>
            <span className="fj-nav-glyph">✦</span><span>science</span>
          </button>
          <button className="fj-nav-btn" onClick={onExit}>
            <span className="fj-nav-glyph">✕</span><span>close</span>
          </button>
        </nav>
      )}

      {seal && (
        <WaxSeal settings={settings} mood={seal.mood} emblem={seal.emblem}
          onDone={() => { const cb = seal.run; setSeal(null); cb(); }} />
      )}
      {halo && <HaloRitual settings={settings} onDone={() => { const cb = halo; setHalo(null); cb(); }} />}

      {newChapterOpen && (
        <NewChapterModal onClose={() => setNewChapterOpen(false)} onCreate={(c) => {
          addChapter(c);
          setNewChapterOpen(false);
        }} />
      )}

      {confirmDelete && renderTearOut()}
    </div>
  );
}

/* ═══════════════ PRAYER CARD (open, with "it came true") ═══════════════ */
function PrayerCard({ prayer, onAnswered }) {
  const [confirming, setConfirming] = useState(false);
  const [note, setNote] = useState("");
  return (
    <div className="fj-prayer-card">
      <span className="fj-prayer-candle" aria-hidden="true" />
      <div className="fj-card-top">
        <span className="fj-card-title">{prayer.title || "a prayer"}</span>
        <span className="fj-card-date">{fmtDate(prayer.created_at)}</span>
      </div>
      <div className="fj-hand fj-card-preview">{prayer.body.slice(0, 120)}{prayer.body.length > 120 ? "…" : ""}</div>
      {!confirming ? (
        <button className="fj-answer-btn" onClick={() => setConfirming(true)}>
          ✦ it came true
        </button>
      ) : (
        <div className="fj-answer-form">
          <textarea className="fj-hand fj-answer-note" value={note} rows={3} maxLength={2000}
            placeholder="how did God answer? (optional testimony)"
            onChange={(e) => setNote(e.target.value)} />
          <div className="fj-answer-actions">
            <button className="fj-btn-ghost" onClick={() => setConfirming(false)}>not yet</button>
            <button className="fj-btn-gold" onClick={() => onAnswered(note.trim())}>mark it answered</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ PRAYER WRITE PAGE ═══════════════ */
function PrayerWritePage({ onCancel, onSave, settings }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const lastScratch = useRef(0);
  const canSave = body.trim().length > 0;
  return (
    <div className="fj-page fj-page-turn">
      <button className="fj-back" onClick={onCancel}>❮ the ledger</button>
      <div className="fj-eyebrow">🕊 lift a prayer</div>
      <input className="fj-title-input fj-display" value={title} maxLength={60}
        placeholder="name it (optional)" onChange={(e) => setTitle(e.target.value)} />
      <div className="fj-parchment fj-write-parchment fj-prayer-parchment">
        <textarea className="fj-hand fj-textarea" value={body} rows={7}
          placeholder="write it the way you'd say it — plain, honest, specific"
          onChange={(e) => {
            setBody(e.target.value);
            const now = Date.now();
            if (now - lastScratch.current > 1800) { lastScratch.current = now; sfxQuillScratch(settings); }
          }} />
      </div>
      <p className="fj-prayer-hint">
        Every prayer stays on the ledger. When it comes true, you'll mark it answered —
        and it moves to the wall you can look back on.
      </p>
      <button className={`fj-btn-gold fj-btn-wide ${canSave ? "" : "fj-btn-off"}`} disabled={!canSave}
        onClick={() => onSave({ title: title.trim(), body: body.trim() })}>
        lift it up
      </button>
    </div>
  );
}

/* ═══════════════ WRITE PAGE ═══════════════ */
function WritePage({ view, entries, chapters, onSave, onCancel, settings }) {
  const pillar = PILLARS.find((p) => p.id === view.pillar);
  const chapter = chapters.find((c) => c.id === view.chapterId);
  const linked = view.linkedTo ? entries.find((e) => e.id === view.linkedTo) : null;
  /* Revising an existing page. WritePage is keyed on pageKey, so it
     remounts on every navigation and these initialisers reseed cleanly. */
  const editing = view.editId ? entries.find((e) => e.id === view.editId) : null;
  const [title, setTitle] = useState(editing?.title || "");
  const [body, setBody] = useState(editing?.body || "");
  const [mood, setMood] = useState(editing?.mood ?? null);
  const [borrowed, setBorrowed] = useState(null);
  const [inkTick, setInkTick] = useState(0);
  const [toneTick, setToneTick] = useState(0);
  const taRef = useRef(null);
  const lastScratch = useRef(0);

  const placeholder = borrowed || (pillar ? pillar.prompts.join("  ·  ") : "write freely — no prompts, no rules");

  const canSave = body.trim().length > 0;
  const toneIdx = MOODS.findIndex((m) => m.id === mood);
  const tone = moodOf(mood);

  const pickTone = (m, i) => {
    const clearing = mood === m.id;
    setMood(clearing ? null : m.id);
    if (!clearing) setToneTick(i + 1);
    tapLight();
  };

  return (
    <div className="fj-page fj-page-turn" style={toneStyle(mood)}>
      <button className="fj-back" onClick={onCancel}>
        {editing ? "❮ close without saving changes" : "❮ close without saving"}
      </button>
      <div className="fj-eyebrow">
        {pillar ? `${pillar.icon} ${pillar.name}` : `📖 ${chapter?.title || "story"}`}
        {editing ? " · revising" : pillar ? " · new entry" : " · next page"}
      </div>

      {linked && <div className="fj-linked">then &amp; now · “{linked.body.slice(0, 80)}…” — what has changed</div>}

      <input className="fj-title-input fj-display" value={title} maxLength={60}
        placeholder="one-line title" onChange={(e) => setTitle(e.target.value)} />

      {view.space === "story" && !borrowed && (
        <div className="fj-borrow">
          <span className="fj-eyebrow">borrow a pillar prompt</span>
          <div className="fj-borrow-row">
            {PILLARS.map((p) => (
              <button key={p.id} className="fj-chip-btn" onClick={() => setBorrowed(p.prompts[0])}>{p.icon}</button>
            ))}
          </div>
        </div>
      )}

      <div className="fj-parchment fj-write-parchment">
        <textarea ref={taRef} className="fj-hand fj-textarea" value={body} placeholder={placeholder}
          onChange={(e) => {
            setBody(e.target.value);
            setInkTick((t) => t + 1);
            const now = Date.now();
            if (now - lastScratch.current > 1800) { lastScratch.current = now; sfxQuillScratch(settings); }
          }} rows={9} />
        <div key={inkTick} className={`fj-ink-line ${inkTick ? "fj-ink-pulse" : ""}`} />
        {/* the colour floods up into the page when you choose it */}
        {toneTick > 0 && <span key={`flood${toneTick}${mood || "none"}`} className="fj-tone-flood" aria-hidden="true" />}
      </div>

      <div className="fj-mood-row">
        <span className="fj-eyebrow">tone of the page</span>
        <div className="fj-tone-strip" style={{ "--fj-idx": toneIdx < 0 ? 0 : toneIdx }}>
          {MOODS.map((m, i) => (
            <button key={m.id} type="button" aria-label={m.label} aria-pressed={mood === m.id}
              className={`fj-tone-tile ${mood === m.id ? "fj-tone-on" : ""}`}
              style={{ background: m.color }} onClick={() => pickTone(m, i)} />
          ))}
          <span className={`fj-tone-marker ${mood ? "" : "fj-tone-marker-off"}`} aria-hidden="true" />
          {toneTick > 0 && (
            <span key={`bleed${toneTick}${mood || "none"}`} className="fj-tone-bleed" aria-hidden="true"
              style={{ left: `${(toneTick - 1) * 20 + 10}%` }} />
          )}
        </div>
        <span key={mood || "none"} className="fj-hand fj-tone-name">
          {tone ? <>the tone of this page is <em>{tone.label}</em></> : "pick a tone — or leave the page plain"}
        </span>
      </div>

      <button className={`fj-btn-gold fj-btn-wide fj-foil-btn ${canSave ? "" : "fj-btn-off"}`} disabled={!canSave}
        onClick={() => onSave({
          editId: view.editId,
          space: view.space || (pillar ? "pillar" : "story"),
          pillar: pillar?.id, chapter_id: chapter?.id,
          title: title.trim(), body: body.trim(), mood, linked_to: view.linkedTo || undefined,
        })}>
        {editing ? "re-seal the page" : "seal the entry"}
      </button>
    </div>
  );
}

/* ═══════════════ NEW CHAPTER MODAL ═══════════════ */
function NewChapterModal({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [epigraph, setEpigraph] = useState("");
  const [leather, setLeather] = useState("black");
  const [emblem, setEmblem] = useState("✦");
  return (
    <div className="fj-modal-veil" onClick={onClose}>
      <div className="fj-modal" onClick={(e) => e.stopPropagation()}>
        <div className="fj-eyebrow">new chapter</div>
        <input className="fj-title-input fj-display" placeholder="Chapter title" value={title} maxLength={48}
          onChange={(e) => setTitle(e.target.value)} />
        <input className="fj-epi-input fj-hand" placeholder="epigraph — your money quote (optional)" value={epigraph} maxLength={120}
          onChange={(e) => setEpigraph(e.target.value)} />
        <div className="fj-eyebrow" style={{ marginTop: 14 }}>leather</div>
        <div className="fj-swatch-row">
          {LEATHERS.map((l) => (
            <button key={l.id} className={`fj-swatch ${leather === l.id ? "fj-swatch-on" : ""}`}
              style={{ background: l.css }} onClick={() => setLeather(l.id)} aria-label={l.label} />
          ))}
        </div>
        <div className="fj-eyebrow" style={{ marginTop: 14 }}>foil emblem</div>
        <div className="fj-swatch-row">
          {EMBLEMS.map((g) => (
            <button key={g} className={`fj-emblem-pick ${emblem === g ? "fj-swatch-on" : ""}`} onClick={() => setEmblem(g)}>{g}</button>
          ))}
        </div>
        <div className="fj-modal-actions">
          <button className="fj-btn-ghost" onClick={onClose}>cancel</button>
          <button className={`fj-btn-gold ${title.trim() ? "" : "fj-btn-off"}`} disabled={!title.trim()}
            onClick={() => onCreate({ title: title.trim(), epigraph: epigraph.trim(), leather, emblem })}>
            stamp the cover
          </button>
        </div>
      </div>
    </div>
  );
}
