import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   THE FIELD JOURNAL
   dark leather · gold foil · parchment · ink
   spaces: cover → wizard → pillars → story → memories
   ═══════════════════════════════════════════════════════════════ */

const GOLD = "#C9A24B";
const BG = "#0B0A08";
const PARCH = "#EDE4D0";
const INK = "#241C14";

const MOODS = [
  { id: "ember", label: "ember", color: "#B4452F" },
  { id: "gold", label: "steady", color: "#C9A24B" },
  { id: "forest", label: "grounded", color: "#4C5B3F" },
  { id: "ash", label: "heavy", color: "#6B675E" },
  { id: "night", label: "quiet", color: "#33415C" },
];

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

const daysAgo = (n) => {
  const d = new Date(); d.setDate(d.getDate() - n); d.setHours(9, 0, 0, 0); return d.toISOString();
};
let _id = 0; const uid = () => `e${++_id}_${Date.now().toString(36)}`;

const SEED_CHAPTER = {
  id: "ch1", title: "Chapter One: Betting on Myself",
  epigraph: "Nobody was coming to save me — and that turned out to be the good news.",
  leather: "oxblood", emblem: "✦",
};

const SEED_ENTRIES = [
  { id: uid(), space: "pillar", pillar: "physical", title: "Warm-up for the war", date: daysAgo(32), mood: "gold",
    body: "Trained before the calls today. Legs, forty minutes, hard. Did it because a slow body makes a slow pitch — and I realize my best closes come on days I moved first. The gym isn't vanity. It's the warm-up for the war." },
  { id: uid(), space: "pillar", pillar: "intellectual", title: "Inventory, not luxury", date: daysAgo(28), mood: "night",
    body: "Twenty pages before the first appointment. The line that stuck: you don't get paid for the hour, you get paid for the value you bring to the hour. If I catch myself winging a pitch tomorrow, then I stop and prep for ten minutes first. I realize the reading isn't a luxury — it's inventory. Keep learning to keep earning." },
  { id: uid(), space: "pillar", pillar: "emotional", title: "The hang-up", date: daysAgo(21), mood: "ember",
    body: "Hardest moment: got hung up on, felt like garbage for an hour. Reframe — it stung because I made it mean something about me. I realize it meant nothing about me and everything about their day. Next dial, same energy." },
  { id: uid(), space: "pillar", pillar: "spiritual", title: "The slow morning", date: daysAgo(14), mood: "forest",
    body: "Prayed for patience before the day started — and got a slow morning that tested it. I realize that was the answer. Every no today was a chance to stay who I said I'd be. God doesn't need me to close; He needs me to show up honest. Today connected." },
  { id: uid(), space: "pillar", pillar: "financial", title: "Your call, not your mood's", date: daysAgo(9), mood: "gold",
    body: "Dear future me — you hit the number because you stopped spending to feel better and started spending on purpose. If the impulse hits this month, then the cash moves to the index first, feeling second. Your call, not your mood's." },
  { id: uid(), space: "story", chapterId: "ch1", title: "My own paycheck", date: daysAgo(30), mood: "ember",
    body: "Signed my own paycheck for the first time this month. Smaller than the old one — and I realize it's worth more, because every dollar of it is proof I can build something nobody handed me. Scared money stayed at the job. I didn't." },
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

/* ── wax seal overlay ── */
function WaxSeal({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 1350); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fj-seal-veil">
      <div className="fj-seal">
        <div className="fj-seal-inner">✦</div>
        <div className="fj-seal-shine" />
      </div>
      <div className="fj-seal-label">sealed</div>
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
        <text x="8" y="78" fill="#8a7a55" fontSize="8" fontFamily="monospace">effort</text>
        <text x="168" y="10" fill={GOLD} fontSize="8" fontFamily="monospace">BDNF</text>
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

/* ═══════════════ MAIN APP ═══════════════ */
export default function FieldJournal() {
  const [entries, setEntries] = useState(SEED_ENTRIES);
  const [chapters, setChapters] = useState([SEED_CHAPTER]);
  const [view, setView] = useState({ name: "cover" }); // cover | wizard | pillars | pillar | story | chapter | memories | write | entry
  const [wizardSeen, setWizardSeen] = useState(false);
  const [wizStep, setWizStep] = useState(0);
  const [opening, setOpening] = useState(false);
  const [seal, setSeal] = useState(null); // callback after seal
  const [pageKey, setPageKey] = useState(0);
  const [memFilter, setMemFilter] = useState("all");
  const [newChapterOpen, setNewChapterOpen] = useState(false);

  const go = useCallback((v) => { setView(v); setPageKey((k) => k + 1); }, []);

  /* streak */
  const streak = useMemo(() => {
    const days = new Set(entries.map((e) => dayKey(e.date)));
    let n = 0; const d = new Date();
    if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
    while (days.has(d.toDateString())) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }, [entries]);

  const lastEntry = useMemo(() =>
    [...entries].sort((a, b) => new Date(b.date) - new Date(a.date))[0], [entries]);

  /* resurfacing pick: oldest entry 20–45 days back, else oldest overall */
  const resurfaced = useMemo(() => {
    const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
    const aged = sorted.filter((e) => {
      const d = (Date.now() - new Date(e.date)) / 86400000; return d >= 20 && d <= 45;
    });
    return aged[0] || sorted[0] || null;
  }, [entries]);

  const openBook = () => {
    setOpening(true);
    setTimeout(() => {
      setOpening(false);
      go(wizardSeen ? { name: "pillars" } : { name: "wizard" });
      if (!wizardSeen) setWizStep(0);
    }, 950);
  };

  const saveEntry = (entry, after) => {
    setEntries((es) => [{ ...entry, id: uid(), date: new Date().toISOString() }, ...es]);
    setSeal(() => after);
  };

  const newestChapter = chapters[chapters.length - 1];

  /* ── COVER ── */
  const renderCover = () => (
    <div className="fj-cover-wrap">
      <div className={`fj-book3d ${opening ? "fj-book-opening" : ""}`}>
        <div className="fj-page-under" aria-hidden="true">
          <div className="fj-page-under-line" />
        </div>
        <button className="fj-cover" onClick={openBook} aria-label="Open the journal">
          <div className="fj-cover-grain" />
          <div className="fj-cover-frame">
            <div className="fj-cover-rule" />
            <h1 className="fj-cover-title">THE FIELD<br />JOURNAL</h1>
            <div className="fj-cover-sub">five pillars · one story</div>
            <div className="fj-cover-rule" />
            <div className="fj-cover-meta">
              <span>{streak > 0 ? `day ${streak}` : "day zero"}</span>
              <span className="fj-cover-dot">·</span>
              <span>{lastEntry ? `last seal ${relAge(lastEntry.date)}` : "unsealed"}</span>
            </div>
            <div className="fj-cover-open">tap to open</div>
          </div>
          <div className="fj-cover-spine" />
        </button>
      </div>

      {resurfaced && (
        <button className="fj-thennow" onClick={() => go({ name: "entry", id: resurfaced.id, from: { name: "cover" } })}>
          <div className="fj-eyebrow" style={{ color: GOLD }}>then &amp; now · {relAge(resurfaced.date)} you wrote</div>
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
            <button className="fj-btn-ghost" onClick={() => { setWizardSeen(true); go({ name: "pillars" }); }}>
              skip — I'll read later
            </button>
          )}
          {(wizardSeen || last) && wizStep > 0 && (
            <button className="fj-btn-ghost" onClick={() => setWizStep(wizStep - 1)}>back</button>
          )}
          <button className="fj-btn-gold" onClick={() => {
            if (last) { setWizardSeen(true); go({ name: "pillars" }); }
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
              <span className="fj-index-count">{count}</span>
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
        <ScienceCard pillar={p} />
        <div className="fj-stack">
          {list.map((e) => (
            <button key={e.id} className="fj-card" onClick={() => go({ name: "entry", id: e.id, from: { name: "pillar", pillar: p.id } })}
              style={{ borderLeftColor: MOODS.find((m) => m.id === e.mood)?.color || "transparent" }}>
              <div className="fj-card-top"><span className="fj-card-title">{e.title || "untitled"}</span><span className="fj-card-date">{fmtDate(e.date)}</span></div>
              <div className="fj-hand fj-card-preview">{e.body.slice(0, 90)}…</div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  /* ── STORY INDEX ── */
  const renderStory = () => (
    <div className="fj-page fj-page-turn" key={`st${pageKey}`}>
      <div className="fj-eyebrow">story mode</div>
      <h2 className="fj-display fj-page-title">Your Book</h2>
      <div className="fj-story-wrap">
        <div className="fj-spine" aria-hidden="true">
          {chapters.map((c) => {
            const n = entries.filter((e) => e.chapterId === c.id).length;
            return <div key={c.id} className="fj-spine-block" style={{ height: `${34 + Math.min(n, 8) * 10}px`, background: LEATHERS.find((l) => l.id === c.leather)?.css }}>
              <span>{c.emblem}</span>
            </div>;
          })}
        </div>
        <div className="fj-story-list">
          {chapters.map((c, i) => {
            const n = entries.filter((e) => e.chapterId === c.id).length;
            return (
              <button key={c.id} className="fj-chapter-card" style={{ background: LEATHERS.find((l) => l.id === c.leather)?.css }}
                onClick={() => go({ name: "chapter", id: c.id })}>
                <div className="fj-chapter-emblem">{c.emblem}</div>
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
    const list = entries.filter((e) => e.chapterId === c.id);
    return (
      <div className="fj-page fj-page-turn" key={`ch${c.id}${pageKey}`}>
        <button className="fj-back" onClick={() => go({ name: "story" })}>❮ your book</button>
        <div className="fj-chapter-opener fj-stamp-in" style={{ background: LEATHERS.find((l) => l.id === c.leather)?.css }}>
          <div className="fj-chapter-emblem fj-emblem-big">{c.emblem}</div>
          <h2 className="fj-display fj-chapter-title">{c.title}</h2>
          {c.epigraph && <div className="fj-hand fj-epigraph">“{c.epigraph}”</div>}
        </div>
        <button className="fj-btn-gold fj-btn-wide" onClick={() => go({ name: "write", space: "story", chapterId: c.id })}>
          ＋ write the next page
        </button>
        <div className="fj-stack">
          {list.map((e) => (
            <button key={e.id} className="fj-card" onClick={() => go({ name: "entry", id: e.id, from: { name: "chapter", id: c.id } })}
              style={{ borderLeftColor: MOODS.find((m) => m.id === e.mood)?.color || "transparent" }}>
              <div className="fj-card-top"><span className="fj-card-title">{e.title || "untitled"}</span><span className="fj-card-date">{fmtDate(e.date)}</span></div>
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
    const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
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
            const c = chapters.find((x) => x.id === e.chapterId);
            return (
              <button key={e.id} className="fj-mem-card fj-drawer-in" style={{ animationDelay: `${Math.min(i * 60, 600)}ms` }}
                onClick={() => go({ name: "entry", id: e.id, from: { name: "memories" } })}>
                <div className="fj-mem-tab">{fmtDate(e.date)}</div>
                <div className="fj-mem-src">{p ? `${p.icon} ${p.name}` : `📖 ${c?.title || "story"}`}{e.linkedTo ? " · then & now" : ""}</div>
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
    const c = chapters.find((x) => x.id === e.chapterId);
    const linked = e.linkedTo ? entries.find((x) => x.id === e.linkedTo) : null;
    return (
      <div className="fj-page fj-page-turn" key={`en${e.id}`}>
        <button className="fj-back" onClick={() => go(view.from || { name: "memories" })}>❮ back</button>
        <div className="fj-entry-head">
          <div className="fj-eyebrow">{p ? `${p.icon} ${p.name}` : `📖 ${c?.title || "story"}`} · {fmtDate(e.date)}</div>
          <h2 className="fj-display fj-entry-title">{e.title || "untitled"}</h2>
          {e.mood && <div className="fj-mood-pill" style={{ background: MOODS.find((m) => m.id === e.mood)?.color }}>{MOODS.find((m) => m.id === e.mood)?.label}</div>}
        </div>
        {linked && <div className="fj-linked">reflecting on · “{linked.body.slice(0, 80)}…”</div>}
        <div className="fj-parchment">
          <div className="fj-hand fj-entry-body"><InkReveal text={e.body} /></div>
        </div>
        <button className="fj-btn-ghost fj-btn-wide" onClick={() =>
          go({ name: "write", space: e.space, pillar: e.pillar, chapterId: e.chapterId, linkedTo: e.id, from: view.from })
        }>
          what has changed — write a reflection
        </button>
      </div>
    );
  };

  /* ── nav ── */
  const NAV = [
    { id: "pillars", label: "pillars", glyph: "▦" },
    { id: "story", label: "story", glyph: "❦" },
    { id: "memories", label: "memories", glyph: "❒" },
    { id: "cover", label: "close", glyph: "✕" },
  ];
  const showNav = !["cover", "write"].includes(view.name);

  return (
    <div className="fj-root">
      <FJStyles />
      <div className="fj-vignette" aria-hidden="true" />
      <div className="fj-frame">
        {view.name === "cover" && renderCover()}
        {view.name === "wizard" && renderWizard()}
        {view.name === "pillars" && renderPillarsIndex()}
        {view.name === "pillar" && renderPillar()}
        {view.name === "story" && renderStory()}
        {view.name === "chapter" && renderChapter()}
        {view.name === "memories" && renderMemories()}
        {view.name === "entry" && renderEntry()}
        {view.name === "write" && (
          <WritePage key={`w${pageKey}`} view={view} entries={entries} chapters={chapters}
            onCancel={() => go(view.from || (view.space === "story" ? { name: "chapter", id: view.chapterId } : view.pillar ? { name: "pillar", pillar: view.pillar } : { name: "pillars" }))}
            onSave={(entry) => saveEntry(entry, () =>
              go(entry.space === "story" ? { name: "chapter", id: entry.chapterId } : { name: "pillar", pillar: entry.pillar })
            )}
          />
        )}
      </div>

      {showNav && (
        <nav className="fj-nav">
          {NAV.map((n) => (
            <button key={n.id}
              className={`fj-nav-btn ${view.name === n.id || (n.id === "pillars" && view.name === "pillar") || (n.id === "story" && view.name === "chapter") ? "fj-nav-on" : ""}`}
              onClick={() => go({ name: n.id })}>
              <span className="fj-nav-glyph">{n.glyph}</span>
              <span>{n.label}</span>
            </button>
          ))}
          <button className="fj-nav-btn" onClick={() => { setWizStep(0); go({ name: "wizard" }); }}>
            <span className="fj-nav-glyph">✦</span><span>science</span>
          </button>
        </nav>
      )}

      {seal && <WaxSeal onDone={() => { const cb = seal; setSeal(null); cb(); }} />}

      {newChapterOpen && (
        <NewChapterModal onClose={() => setNewChapterOpen(false)} onCreate={(c) => {
          setChapters((cs) => [...cs, { ...c, id: `ch${Date.now().toString(36)}` }]);
          setNewChapterOpen(false);
        }} />
      )}
    </div>
  );
}

/* ═══════════════ WRITE PAGE ═══════════════ */
function WritePage({ view, entries, chapters, onSave, onCancel }) {
  const pillar = PILLARS.find((p) => p.id === view.pillar);
  const chapter = chapters.find((c) => c.id === view.chapterId);
  const linked = view.linkedTo ? entries.find((e) => e.id === view.linkedTo) : null;
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mood, setMood] = useState(null);
  const [borrowed, setBorrowed] = useState(null);
  const [inkTick, setInkTick] = useState(0);
  const taRef = useRef(null);

  const placeholder = borrowed || (pillar ? pillar.prompts.join("  ·  ") : "write freely — no prompts, no rules");

  const canSave = body.trim().length > 0;

  return (
    <div className="fj-page fj-page-turn">
      <button className="fj-back" onClick={onCancel}>❮ close without saving</button>
      <div className="fj-eyebrow">
        {pillar ? `${pillar.icon} ${pillar.name} · new entry` : `📖 ${chapter?.title || "story"} · next page`}
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
          onChange={(e) => { setBody(e.target.value); setInkTick((t) => t + 1); }} rows={9} />
        <div key={inkTick} className={`fj-ink-line ${inkTick ? "fj-ink-pulse" : ""}`} />
      </div>

      <div className="fj-mood-row">
        <span className="fj-eyebrow">tone of the page</span>
        <div className="fj-moods">
          {MOODS.map((m) => (
            <button key={m.id} aria-label={m.label} className={`fj-mood-dot ${mood === m.id ? "fj-mood-on" : ""}`}
              style={{ background: m.color }} onClick={() => setMood(mood === m.id ? null : m.id)} />
          ))}
        </div>
        {mood && <span className="fj-mood-name">{MOODS.find((m) => m.id === mood)?.label}</span>}
      </div>

      <button className={`fj-btn-gold fj-btn-wide ${canSave ? "" : "fj-btn-off"}`} disabled={!canSave}
        onClick={() => onSave({
          space: view.space || (pillar ? "pillar" : "story"),
          pillar: pillar?.id, chapterId: chapter?.id,
          title: title.trim(), body: body.trim(), mood, linkedTo: view.linkedTo || undefined,
        })}>
        seal the entry
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

/* ═══════════════ STYLES ═══════════════ */
function FJStyles() {
  return (
    <style>{`
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Caveat:wght@500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap');

.fj-root{min-height:100vh;background:${BG};color:#cbbfa5;font-family:'Source Serif 4',Georgia,serif;position:relative;overflow-x:hidden}
.fj-display{font-family:'Cormorant Garamond',serif}
.fj-hand{font-family:'Caveat',cursive}
.fj-script{font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:600}
.fj-body{font-size:15px;line-height:1.65}

.fj-vignette{position:fixed;inset:0;pointer-events:none;z-index:0;
  background:radial-gradient(120% 90% at 50% 10%, rgba(201,162,75,.07), transparent 55%),
             radial-gradient(100% 80% at 50% 110%, rgba(0,0,0,.6), transparent 60%);
  animation:fjFlicker 6.5s ease-in-out infinite}
@keyframes fjFlicker{0%,100%{opacity:.85}40%{opacity:1}62%{opacity:.78}80%{opacity:.95}}

.fj-frame{position:relative;z-index:1;max-width:520px;margin:0 auto;padding:18px 16px 96px}

/* ─ eyebrow / buttons ─ */
.fj-eyebrow{font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:#8a7a55;font-family:'Source Serif 4',serif}
.fj-btn-gold{background:linear-gradient(160deg,#dcb45f,${GOLD} 55%,#9a7a35);color:#1c1408;border:none;border-radius:6px;
  padding:13px 22px;font-family:'Source Serif 4',serif;font-weight:600;font-size:14px;letter-spacing:.04em;cursor:pointer;
  box-shadow:0 2px 12px rgba(201,162,75,.25), inset 0 1px 0 rgba(255,255,255,.35);transition:transform .18s}
.fj-btn-gold:active{transform:scale(.97)}
.fj-btn-off{opacity:.35;pointer-events:none}
.fj-btn-ghost{background:transparent;color:#a5936a;border:1px solid #3a3223;border-radius:6px;padding:12px 18px;
  font-family:'Source Serif 4',serif;font-size:13px;letter-spacing:.05em;cursor:pointer}
.fj-btn-wide{width:100%;margin:14px 0}
.fj-back{background:none;border:none;color:#8a7a55;font-size:12px;letter-spacing:.1em;cursor:pointer;padding:6px 0;margin-bottom:8px;font-family:'Source Serif 4',serif}

/* ─ COVER ─ */
.fj-cover-wrap{display:flex;flex-direction:column;align-items:center;gap:18px;padding-top:28px}
.fj-book3d{perspective:1400px;width:min(78vw,300px);aspect-ratio:3/4.3;position:relative}
.fj-page-under{position:absolute;inset:6px 4px 6px 10px;background:${PARCH};border-radius:4px 10px 10px 4px;
  box-shadow:inset 0 0 40px rgba(120,95,50,.25)}
.fj-page-under-line{position:absolute;inset:24px;border:1px solid rgba(120,95,50,.2)}
.fj-cover{position:absolute;inset:0;border:none;cursor:pointer;border-radius:6px 12px 12px 6px;overflow:hidden;
  background:linear-gradient(150deg,#3d1512 0%,#26100c 40%,#120806 78%,#0a0505 100%);
  box-shadow:0 18px 50px rgba(0,0,0,.75), inset 0 0 0 1px rgba(201,162,75,.12);
  transform-origin:left center;transform-style:preserve-3d;transition:transform .18s;
  display:flex;align-items:center;justify-content:center}
.fj-cover:hover{transform:rotateY(-6deg)}
.fj-book-opening .fj-cover{animation:fjOpen .95s cubic-bezier(.6,-0.05,.3,1.15) forwards}
@keyframes fjOpen{0%{transform:rotateY(0)}100%{transform:rotateY(-152deg)}}
.fj-cover-grain{position:absolute;inset:0;opacity:.5;
  background:repeating-linear-gradient(115deg, rgba(255,255,255,.015) 0 2px, transparent 2px 5px),
             repeating-linear-gradient(28deg, rgba(0,0,0,.25) 0 1px, transparent 1px 4px)}
.fj-cover-spine{position:absolute;left:0;top:0;bottom:0;width:14px;
  background:linear-gradient(90deg, rgba(0,0,0,.7), rgba(201,162,75,.14) 55%, transparent)}
.fj-cover-frame{position:relative;text-align:center;padding:0 22px;display:flex;flex-direction:column;align-items:center;gap:12px}
.fj-cover-rule{width:72px;height:1px;background:linear-gradient(90deg,transparent,${GOLD},transparent)}
.fj-cover-title{font-family:'Cormorant Garamond',serif;font-weight:700;font-size:30px;line-height:1.18;letter-spacing:.14em;
  color:${GOLD};text-shadow:0 1px 0 rgba(0,0,0,.9), 0 0 22px rgba(201,162,75,.28);margin:0}
.fj-cover-sub{font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#8a7a55}
.fj-cover-meta{font-size:11px;letter-spacing:.08em;color:#a5936a;display:flex;gap:8px}
.fj-cover-dot{color:#5a4c30}
.fj-cover-open{margin-top:8px;font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:rgba(201,162,75,.7);
  animation:fjBreathe 2.6s ease-in-out infinite}
@keyframes fjBreathe{0%,100%{opacity:.45}50%{opacity:1}}

.fj-thennow{width:100%;max-width:340px;text-align:left;background:#151109;border:1px solid #2f2818;border-radius:8px;
  padding:14px 16px;cursor:pointer;display:flex;flex-direction:column;gap:8px}
.fj-thennow-quote{font-family:'Caveat',cursive;font-size:19px;line-height:1.3;color:#d8cba9}
.fj-thennow-cta{font-size:11px;letter-spacing:.12em;color:${GOLD}}
.fj-cover-actions{display:flex;gap:10px}

/* ─ PAGES / TURN ─ */
.fj-page{background:linear-gradient(180deg,#141009,#0e0b07);border:1px solid #241e12;border-radius:10px;padding:20px 18px 26px;
  box-shadow:0 12px 40px rgba(0,0,0,.55)}
.fj-page-turn{animation:fjTurn .45s cubic-bezier(.25,.7,.3,1);transform-origin:left center}
@keyframes fjTurn{0%{transform:rotateY(10deg) translateX(14px);opacity:0;box-shadow:-30px 0 40px rgba(0,0,0,.5)}
  100%{transform:none;opacity:1}}
.fj-page-title{font-size:30px;font-weight:600;color:#e4d5ae;margin:4px 0 16px}

/* ─ WIZARD ─ */
.fj-wz-dots{display:flex;gap:8px;justify-content:center;margin-bottom:16px}
.fj-dot{width:7px;height:7px;border-radius:50%;background:#332b19;transition:background .3s}
.fj-dot-on{background:${GOLD};box-shadow:0 0 8px rgba(201,162,75,.6)}
.fj-wz-card{text-align:center;display:flex;flex-direction:column;align-items:center;gap:14px;min-height:330px;justify-content:center}
.fj-wz-icon{font-size:30px}
.fj-wz-title{font-size:26px;line-height:1.2;color:#e8d9b0;font-weight:600;max-width:320px}
.fj-wz-body{color:#b3a47f;max-width:360px;text-align:left}
.fj-wz-nav{display:flex;gap:10px;justify-content:center;margin-top:18px;flex-wrap:wrap}
.fj-wz-vis{display:flex;align-items:center;justify-content:center;min-height:84px;gap:10px}
.fj-mini-book{width:64px;height:86px;border-radius:3px 6px 6px 3px;background:linear-gradient(150deg,#3d1512,#120806);
  display:flex;align-items:center;justify-content:center;color:${GOLD};font-family:'Cormorant Garamond',serif;font-weight:700;
  box-shadow:0 8px 20px rgba(0,0,0,.6), inset 0 0 0 1px rgba(201,162,75,.2);animation:fjTilt 3s ease-in-out infinite}
@keyframes fjTilt{0%,100%{transform:rotateZ(-2deg)}50%{transform:rotateZ(2deg)}}
.fj-node{display:flex;flex-direction:column;align-items:center;gap:6px;font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:#8a7a55;text-align:center}
.fj-node-dot{width:26px;height:26px;border-radius:50%}
.fj-node-amyg .fj-node-dot{background:#7a2f22;animation:fjCalm 2.4s ease-in-out infinite}
@keyframes fjCalm{0%{box-shadow:0 0 18px rgba(180,69,47,.8)}100%{box-shadow:0 0 2px rgba(180,69,47,.15)}50%{box-shadow:0 0 6px rgba(180,69,47,.3)}}
.fj-node-pfc .fj-node-dot{background:${GOLD};animation:fjLight 2.4s ease-in-out infinite}
@keyframes fjLight{0%{box-shadow:0 0 2px rgba(201,162,75,.2)}50%,100%{box-shadow:0 0 20px rgba(201,162,75,.85)}}
.fj-node-line{width:44px;height:1px;background:linear-gradient(90deg,#7a2f22,${GOLD})}
.fj-bdnf{stroke-dasharray:260;stroke-dashoffset:260;animation:fjDraw 1.8s ease forwards .3s}
@keyframes fjDraw{to{stroke-dashoffset:0}}
.fj-chip{border:1px solid #3a3223;border-radius:20px;padding:6px 14px;font-size:12px;letter-spacing:.06em;color:#b3a47f;background:#151109}
.fj-chip-gold{border-color:${GOLD};color:${GOLD}}
.fj-chip-arrow{color:${GOLD};font-size:16px}
.fj-strike{font-family:'Caveat',cursive;font-size:19px;color:#7d6f52;text-decoration:line-through;text-decoration-color:rgba(180,69,47,.7)}
.fj-insight{font-family:'Caveat',cursive;font-size:21px;color:${GOLD}}
.fj-shift-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:center}
.fj-flame{font-size:40px;animation:fjBreathe 2s ease-in-out infinite}
.fj-wz-honest{flex-wrap:wrap}

/* ─ INDEX ─ */
.fj-index-list{display:flex;flex-direction:column;gap:10px}
.fj-index-row{display:flex;align-items:center;gap:14px;background:#151109;border:1px solid #2a2314;border-radius:8px;
  padding:14px;cursor:pointer;text-align:left;transition:border-color .2s}
.fj-index-row:hover{border-color:${GOLD}}
.fj-index-icon{font-size:22px}
.fj-index-text{flex:1;display:flex;flex-direction:column;gap:3px}
.fj-index-name{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:600;color:#e4d5ae}
.fj-index-q{font-size:11.5px;color:#8a7a55;line-height:1.4}
.fj-index-count{font-family:'Cormorant Garamond',serif;font-size:18px;color:${GOLD};min-width:24px;text-align:right}

/* ─ PILLAR ─ */
.fj-pillar-head{text-align:center;margin:6px 0 4px}
.fj-pillar-icon{font-size:26px}
.fj-pillar-title{font-size:38px;color:#e8d9b0;margin:2px 0}
.fj-pillar-q{font-size:12.5px;color:#8a7a55;font-style:italic}
.fj-sci{background:#12100a;border:1px solid #2a2314;border-radius:8px;margin:6px 0 14px;overflow:hidden}
.fj-sci-head{width:100%;display:flex;justify-content:space-between;align-items:center;background:none;border:none;
  padding:12px 14px;cursor:pointer}
.fj-sci-caret{color:${GOLD};font-size:11px;transition:transform .25s}
.fj-sci-body{padding:0 14px 14px;margin:0;font-size:13.5px;line-height:1.65;color:#b3a47f}

.fj-stack{display:flex;flex-direction:column;gap:10px}
.fj-card{background:linear-gradient(180deg,#efe6d2,#e6dbc2);border:none;border-left:4px solid transparent;border-radius:6px;
  padding:12px 14px;text-align:left;cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,.4);color:${INK}}
.fj-card-top{display:flex;justify-content:space-between;gap:8px;align-items:baseline}
.fj-card-title{font-family:'Cormorant Garamond',serif;font-weight:700;font-size:17px;color:#2c2115}
.fj-card-date{font-size:10px;letter-spacing:.1em;color:#8a7050}
.fj-card-preview{font-size:18px;line-height:1.25;color:#46372a}
.fj-empty{text-align:center;color:#6b5f45;font-style:italic;font-size:13px;padding:22px 0}

/* ─ WRITE ─ */
.fj-title-input{width:100%;background:transparent;border:none;border-bottom:1px solid #3a3223;color:#e8d9b0;
  font-size:24px;font-weight:600;padding:8px 2px;margin:10px 0;outline:none}
.fj-title-input::placeholder{color:#5a4c30}
.fj-parchment{background:linear-gradient(180deg,#efe6d2,#e8ddc4);border-radius:6px;box-shadow:0 6px 20px rgba(0,0,0,.5), inset 0 0 30px rgba(120,95,50,.15);
  padding:16px 16px 10px;position:relative}
.fj-write-parchment{background-image:linear-gradient(180deg,#efe6d2,#e8ddc4),repeating-linear-gradient(180deg,transparent 0 31px, rgba(120,95,50,.25) 31px 32px)}
.fj-textarea{width:100%;background:repeating-linear-gradient(180deg,transparent 0 31px, rgba(120,95,50,.22) 31px 32px);
  border:none;outline:none;resize:vertical;color:${INK};font-size:21px;line-height:32px;caret-color:#7a5a20;min-height:290px}
.fj-textarea::placeholder{color:rgba(90,72,48,.45)}
.fj-ink-line{height:2px;background:linear-gradient(90deg,transparent,rgba(122,90,32,.0),transparent);margin-top:4px;border-radius:2px}
.fj-ink-pulse{animation:fjInk .4s ease}
@keyframes fjInk{0%{background:linear-gradient(90deg,transparent,rgba(122,90,32,.55),transparent)}100%{background:transparent}}
.fj-borrow{margin:4px 0 10px;display:flex;flex-direction:column;gap:8px}
.fj-borrow-row{display:flex;gap:8px}
.fj-mood-row{display:flex;align-items:center;gap:12px;margin:14px 0 2px;flex-wrap:wrap}
.fj-moods{display:flex;gap:10px}
.fj-mood-dot{width:22px;height:22px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:transform .15s}
.fj-mood-on{border-color:#f2e3bb;transform:scale(1.18)}
.fj-mood-name{font-family:'Caveat',cursive;font-size:18px;color:#d8cba9}
.fj-mood-pill{display:inline-block;color:#100d08;font-size:10px;letter-spacing:.12em;text-transform:uppercase;
  border-radius:12px;padding:3px 10px;margin-top:8px;font-weight:600}
.fj-linked{background:#151109;border-left:3px solid ${GOLD};border-radius:0 6px 6px 0;padding:10px 12px;margin:10px 0;
  font-family:'Caveat',cursive;font-size:17px;color:#b3a47f}

/* ─ INK REVEAL ─ */
.fj-ink-word{opacity:0;animation:fjWord .5s ease forwards;filter:blur(.4px)}
@keyframes fjWord{0%{opacity:0;filter:blur(1.4px)}100%{opacity:1;filter:blur(0)}}
.fj-entry-title{font-size:27px;color:#e8d9b0;margin:4px 0 2px}
.fj-entry-head{margin-bottom:10px}
.fj-entry-body{font-size:22px;line-height:1.45;color:${INK};white-space:pre-wrap}

/* ─ STORY ─ */
.fj-story-wrap{display:flex;gap:12px}
.fj-spine{display:flex;flex-direction:column;gap:6px;padding-top:4px}
.fj-spine-block{width:26px;border-radius:3px;display:flex;align-items:center;justify-content:center;color:${GOLD};
  font-size:11px;box-shadow:inset 0 0 0 1px rgba(201,162,75,.25), 0 3px 8px rgba(0,0,0,.5)}
.fj-story-list{flex:1;display:flex;flex-direction:column;gap:12px}
.fj-chapter-card{border:none;border-radius:10px;padding:18px 16px;text-align:left;cursor:pointer;
  box-shadow:0 8px 24px rgba(0,0,0,.6), inset 0 0 0 1px rgba(201,162,75,.18);display:flex;flex-direction:column;gap:7px}
.fj-chapter-emblem{color:${GOLD};font-size:18px;text-shadow:0 0 12px rgba(201,162,75,.5)}
.fj-emblem-big{font-size:28px}
.fj-chapter-name{font-family:'Cormorant Garamond',serif;font-size:21px;font-weight:700;color:#ecdcb2;letter-spacing:.03em}
.fj-chapter-epi{font-family:'Caveat',cursive;font-size:17px;color:#b8a87f;line-height:1.3}
.fj-chapter-count{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#8a7a55}
.fj-newchapter{border:1px dashed #3a3223;background:transparent;border-radius:10px;padding:16px;color:#a5936a;
  cursor:pointer;font-family:'Source Serif 4',serif;font-size:13px;letter-spacing:.06em}
.fj-chapter-opener{border-radius:10px;padding:22px 18px;text-align:center;margin:6px 0 4px;
  box-shadow:0 8px 24px rgba(0,0,0,.6), inset 0 0 0 1px rgba(201,162,75,.18)}
.fj-chapter-title{font-size:25px;font-weight:700;color:#ecdcb2;margin:8px 0 4px}
.fj-epigraph{font-size:19px;color:#c3b389;line-height:1.3}
.fj-stamp-in{animation:fjStamp .6s cubic-bezier(.3,1.4,.5,1)}
@keyframes fjStamp{0%{transform:scale(1.15);opacity:0}60%{transform:scale(.97);opacity:1}100%{transform:scale(1)}}

/* ─ MEMORIES ─ */
.fj-chips{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
.fj-chip-btn{border:1px solid #3a3223;background:#151109;color:#a5936a;border-radius:16px;padding:6px 13px;
  font-size:13px;cursor:pointer;font-family:'Source Serif 4',serif}
.fj-chip-on{border-color:${GOLD};color:${GOLD};box-shadow:0 0 10px rgba(201,162,75,.2)}
.fj-mem-list{display:flex;flex-direction:column;gap:12px}
.fj-mem-card{background:linear-gradient(180deg,#efe6d2,#e6dbc2);border:none;border-radius:6px;padding:14px;text-align:left;
  cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.5);position:relative;color:${INK}}
.fj-mem-tab{position:absolute;top:-9px;right:12px;background:${GOLD};color:#1c1408;font-size:9px;letter-spacing:.12em;
  padding:3px 9px;border-radius:3px;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,.4)}
.fj-mem-src{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#8a7050;margin-bottom:5px}
.fj-drawer-in{animation:fjDrawer .5s cubic-bezier(.25,.8,.3,1) backwards}
@keyframes fjDrawer{0%{transform:translateY(18px) scale(.98);opacity:0}100%{transform:none;opacity:1}}

/* ─ NAV ─ */
.fj-nav{position:fixed;bottom:0;left:0;right:0;z-index:20;display:flex;justify-content:center;gap:4px;
  background:linear-gradient(180deg, rgba(11,10,8,.6), #0b0a08 40%);padding:10px 8px 16px;backdrop-filter:blur(6px)}
.fj-nav-btn{background:none;border:none;color:#7d6f52;display:flex;flex-direction:column;align-items:center;gap:3px;
  font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;padding:6px 12px;cursor:pointer;font-family:'Source Serif 4',serif}
.fj-nav-glyph{font-size:16px}
.fj-nav-on{color:${GOLD}}

/* ─ SEAL ─ */
.fj-seal-veil{position:fixed;inset:0;z-index:50;background:rgba(6,5,3,.72);display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:14px;animation:fjFade .25s ease}
@keyframes fjFade{from{opacity:0}to{opacity:1}}
.fj-seal{width:96px;height:96px;border-radius:50%;position:relative;overflow:hidden;
  background:radial-gradient(circle at 32% 28%, #e5c069, ${GOLD} 45%, #7d5f26 85%);
  box-shadow:0 10px 34px rgba(201,162,75,.4), inset 0 -5px 12px rgba(0,0,0,.4), inset 0 4px 8px rgba(255,255,255,.35);
  display:flex;align-items:center;justify-content:center;animation:fjSealIn .55s cubic-bezier(.2,1.6,.4,1)}
@keyframes fjSealIn{0%{transform:scale(2.1);opacity:0}55%{transform:scale(.86)}75%{transform:scale(1.06)}100%{transform:scale(1)}}
.fj-seal-inner{font-size:34px;color:#33260e;text-shadow:0 1px 0 rgba(255,255,255,.3)}
.fj-seal-shine{position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.5) 48%,transparent 62%);
  animation:fjShine .9s ease .35s}
@keyframes fjShine{0%{transform:translateX(-110%)}100%{transform:translateX(110%)}}
.fj-seal-label{color:${GOLD};font-size:11px;letter-spacing:.34em;text-transform:uppercase}

/* ─ MODAL ─ */
.fj-modal-veil{position:fixed;inset:0;z-index:40;background:rgba(6,5,3,.78);display:flex;align-items:center;justify-content:center;padding:20px;animation:fjFade .2s ease}
.fj-modal{width:100%;max-width:380px;background:linear-gradient(180deg,#171208,#0f0c07);border:1px solid #2f2818;border-radius:12px;padding:20px}
.fj-epi-input{width:100%;background:transparent;border:none;border-bottom:1px solid #3a3223;color:#d8cba9;font-size:19px;padding:8px 2px;outline:none}
.fj-epi-input::placeholder{color:#5a4c30}
.fj-swatch-row{display:flex;gap:10px;margin-top:8px}
.fj-swatch{width:38px;height:48px;border-radius:4px 7px 7px 4px;border:2px solid transparent;cursor:pointer;
  box-shadow:0 4px 10px rgba(0,0,0,.5)}
.fj-emblem-pick{width:38px;height:38px;border-radius:6px;border:2px solid #3a3223;background:#151109;color:${GOLD};font-size:16px;cursor:pointer}
.fj-swatch-on{border-color:${GOLD};box-shadow:0 0 12px rgba(201,162,75,.4)}
.fj-modal-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:20px}

@media (prefers-reduced-motion: reduce){
  .fj-root *, .fj-root *::before, .fj-root *::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important}
  .fj-page-turn{animation:fjFade .01ms}
}
`}</style>
  );
}
