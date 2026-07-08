import React, { useState } from "react";
import { CREED, CreedVisual } from "../IronWorkout.jsx";
import ScrollShelf from "./WisdomScroll.jsx";
import BenchmarkLadder from "./BenchmarkLadder.jsx";
import TraitTree from "./TraitTree.jsx";
import HormonePanel from "./HormonePanel.jsx";
import EatingCalculator from "./EatingCalculator.jsx";
import HL from "./HL.jsx";
import { PHASES, PHASE_ORDER, MAINTENANCE_CHART } from "./data/phases.js";
import { MYTH_BOSSES } from "./data/mythBosses.js";
import { SCROLLS } from "./data/scrolls.js";
import { GLOSSARY } from "./data/glossary.js";
import { sfxChalkPoof } from "../../../lib/sfx.js";

/* ═══════════════════════════════════════════════════════════════
   THE BOOK OF IRON — every readable thing in one place, laid out
   as a depth chart. The progress header shows how much of the book
   has been earned; locked entries stay visible with their unlock
   condition, so the whole territory is on the map from day one.
   Chapters: creed · phases · eating · hormones · myths · scrolls ·
   ladders · traits · glossary.
   ═══════════════════════════════════════════════════════════════ */

export default function BookOfIron({ alpha, prs, traitLevels, creedSeen, markCreedSeen, addXP, settings, onOpenProgram, onOpenRoad, onFight }) {
  const { state } = alpha;
  const defeated = new Set(state.flags.bossesDefeated || []);
  const collected = new Set(state.flags.scrolls || []);
  const stagesTotal = 11;
  const stageNow = Math.min(stagesTotal, Math.max(1, state.stage || 1));

  /* the earnable pages: creed (1) + scrolls + myths */
  const totalPages = 1 + SCROLLS.length + MYTH_BOSSES.length;
  const earnedPages = (creedSeen ? 1 : 0) + collected.size + defeated.size;

  return (
    <div className="iw-page iw-page-in iw-bk">
      <div className="iw-eyebrow">everything the iron knows</div>
      <h2 className="iw-display iw-page-title">The Book of Iron</h2>

      {/* progress header */}
      <div className="iw-bk-progress">
        <div className="iw-al-bc-bar"><div className="iw-al-bc-fill" style={{ width: `${(earnedPages / totalPages) * 100}%` }} /></div>
        <span className="iw-al-fastline"><HL text={`${earnedPages} of ${totalPages} pages earned — the rest is already on the shelf, waiting`} /></span>
      </div>

      {/* The Road — the hero's-journey map lives here now (moved off Today so
          Today stays about right-now: workout + meals). */}
      {onOpenRoad && (
        <button className="iw-bk-road" onClick={onOpenRoad}>
          <div className="iw-bk-road-text">
            <span className="iw-bk-road-title">❖ The Road — your journey</span>
            <span className="iw-bk-road-sub">
              stage {stageNow} of {stagesTotal} · the eleven-stage climb from Ordinary World to the Return
            </span>
          </div>
          <div className="iw-al-bc-bar iw-bk-road-bar">
            <div className="iw-al-bc-fill" style={{ width: `${(stageNow / stagesTotal) * 100}%` }} />
          </div>
          <span className="iw-bk-road-go" aria-hidden="true">open the map ❯</span>
        </button>
      )}

      <div className="iw-bk-depth">
        <Chapter n={1} title="The Creed" sub="the five plates this whole mode stands on"
          status={creedSeen ? "✓ read" : "unread"} settings={settings}>
          <CreedReader creedSeen={creedSeen} markCreedSeen={markCreedSeen} />
        </Chapter>

        <Chapter n={2} title="The Four Phases" sub="16 weeks · PRIME → ADAPT → SURGE → COMPLETE" settings={settings}>
          <div className="iw-stack">
            {PHASE_ORDER.map((pid) => {
              const p = PHASES[pid];
              return (
                <div key={pid} className="iw-bk-phaserow" style={{ "--iw-al-accent": p.accent }}>
                  <span className="iw-bk-phasen" style={{ color: p.accent }}>{["I", "II", "III", "IV"][p.n - 1]}</span>
                  <span className="iw-bk-phasetext">
                    <span className="iw-bk-phasename">{p.name}</span>
                    <span className="iw-bk-phasesub">{p.subtitle}</span>
                  </span>
                  {state.flags.crossingDone && state.phase === pid && <span className="iw-chip iw-chip-ember">here</span>}
                </div>
              );
            })}
          </div>
          <button className="iw-btn-ghost iw-btn-wide" onClick={onOpenProgram}>
            open The Program — full breakdown of every workout ❯
          </button>
        </Chapter>

        <Chapter n={3} title="The Eating Equation" sub="maintenance · macros · the cheat-day law" settings={settings}>
          <p className="iw-body"><HL text="Everything starts from Lean Body Mass: your weight minus the fat. LBM times the multiplier below is your maintenance — the calories that keep you exactly as you are. Every phase then moves you above or below that line on purpose." /></p>
          <div className="iw-pc-eatgrid">
            <div className="iw-pc-eatrow iw-pc-eathead">
              <span>body fat</span><span>multiplier</span><span>maintenance</span><span></span>
            </div>
            {MAINTENANCE_CHART.map((row, i) => {
              const lo = i === 0 ? 0 : MAINTENANCE_CHART[i - 1].maxBF;
              return (
                <div key={row.maxBF} className="iw-pc-eatrow">
                  <span className="iw-pc-eatday">{row.maxBF >= 100 ? `${lo}%+` : `${lo}–${row.maxBF}%`}</span>
                  <span><HL text={`× ${row.mult}`} /></span>
                  <span><HL text={`LBM × ${row.mult} cal`} /></span>
                  <span></span>
                </div>
              );
            })}
          </div>
          <div className="iw-al-fastline"><HL text="The cheat-day law: one day OFF THE LEDGER when the phase grants it. Three rules — never eat to sickness · same-day food only · zero guilt. And on full-fast days the 400-cal dinner fallback ALWAYS counts." /></div>
          <EatingCalculator alpha={alpha} addXP={addXP} settings={settings} onBack={null} />
        </Chapter>

        <Chapter n={4} title="The Hormone Codex" sub="the four dials your habits turn" settings={settings}>
          <HormonePanel alpha={alpha} addXP={addXP} settings={settings} />
        </Chapter>

        <Chapter n={5} title="Busted Myths" sub="the lies that guard each gate"
          status={`${defeated.size}/${MYTH_BOSSES.length}`} settings={settings}>
          <MythCodex state={state} defeated={defeated} onFight={onFight} />
        </Chapter>

        <Chapter n={6} title="Wisdom Scrolls" sub="earned lines from the road"
          status={`${collected.size}/${SCROLLS.length}`} settings={settings}>
          <ScrollShelf alpha={alpha} />
        </Chapter>

        <Chapter n={7} title="Benchmark Ladders" sub="where your lifts stand" settings={settings}>
          <BenchmarkLadder prs={prs} />
        </Chapter>

        <Chapter n={8} title="The Trait Tree" sub="who the work is making you" settings={settings}>
          <TraitTree traitLevels={traitLevels} />
        </Chapter>

        <Chapter n={9} title="Iron Speak" sub="every gym phrase, decoded" settings={settings}>
          <div className="iw-stack">
            {GLOSSARY.map((g) => (
              <div key={g.term} className="iw-bk-gloss">
                <div className="iw-bk-gloss-term">{g.term}</div>
                <p className="iw-bk-gloss-plain"><HL text={g.plain} /></p>
              </div>
            ))}
          </div>
        </Chapter>
      </div>
    </div>
  );
}

/* ── chapter shell: a node on the depth chart ── */
function Chapter({ n, title, sub, status, children, settings }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`iw-bk-chapter ${open ? "iw-bk-chapter-open" : ""}`}>
      <button className="iw-bk-head" aria-expanded={open}
        onClick={() => { setOpen((o) => !o); sfxChalkPoof(settings); }}>
        <span className="iw-bk-n">{n}</span>
        <span className="iw-bk-titles">
          <span className="iw-bk-title">{title}</span>
          <span className="iw-bk-sub">{sub}</span>
        </span>
        {status && <span className="iw-chip iw-bk-status">{status}</span>}
        <span className="iw-howto-caret" aria-hidden="true">{open ? "▾" : "▸"}</span>
      </button>
      {open && <div className="iw-bk-body">{children}</div>}
    </div>
  );
}

/* ── the creed, readable page by page ── */
function CreedReader({ creedSeen, markCreedSeen }) {
  const [step, setStep] = useState(0);
  const s = CREED[step];
  const last = step === CREED.length - 1;
  return (
    <div>
      <div className="iw-cr-dots">
        {CREED.map((_, i) => <span key={i} className={`iw-dot ${i <= step ? "iw-dot-on" : ""}`} />)}
      </div>
      <div className="iw-cr-card">
        <h2 className="iw-display iw-cr-title">{s.title}</h2>
        <CreedVisual v={s.visual} />
        <p className="iw-body iw-cr-body"><HL text={s.body} /></p>
      </div>
      <div className="iw-cr-nav">
        {step > 0 && (
          <button className="iw-btn-ghost" onClick={() => setStep(step - 1)}>back</button>
        )}
        {!last ? (
          <button className="iw-btn-ember" onClick={() => setStep(step + 1)}>next plate</button>
        ) : !creedSeen ? (
          <button className="iw-btn-ember" onClick={markCreedSeen}>✓ I&apos;ve read the creed</button>
        ) : (
          <span className="iw-chip">✓ read</span>
        )}
      </div>
    </div>
  );
}

/* ── busted-myth codex (moved here from the old alpha chips) ── */
function MythCodex({ state, defeated, onFight }) {
  const stage = state.stage;
  return (
    <div className="iw-al-mythcodex">
      <div className="iw-stack">
        {MYTH_BOSSES.map((b) => {
          const down = defeated.has(b.id);
          const reachable = PHASES[b.gatePhase] && stage >= PHASES[b.gatePhase].stage;
          return (
            <div key={b.id} className={`iw-al-codexcard ${down ? "iw-al-codexcard-down" : ""}`}>
              <div className="iw-al-card-head">
                <span className="iw-al-challenge-name">{down ? "✓ " : ""}{b.name}</span>
                <span className="iw-chip">{PHASES[b.gatePhase]?.name}</span>
              </div>
              {down ? (
                <p className="iw-al-codextruth">{b.truth}</p>
              ) : reachable ? (
                <button className="iw-btn-ghost" onClick={() => onFight(b.id)}>⚔ face it</button>
              ) : (
                <p className="iw-al-dial-villain">still ahead on the road — guards the {PHASES[b.gatePhase]?.name} gate</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
