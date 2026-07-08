import React, { useEffect, useMemo, useRef, useState } from "react";
import "../../styles/onboarding.css";
import { useAppData } from "../../hooks/useAppData.js";
import { useMapQuestState } from "../map-quest/useMapQuestState.js";
import { XP_VALUES } from "../../lib/gamification.js";
import {
  sfxPop,
  sfxHover,
  sfxWhoosh,
  sfxMatchStrike,
  sfxWaxSeal,
  sfxPhoenix,
} from "../../lib/sfx.js";
import { playCrossingVoice, stopCrossingVoice } from "../../data/crossingVoiceLines.js";
import {
  loadCrossing,
  recordPhase,
  saveAnswers,
  sealVow,
  markComplete,
  recordTorchItem,
} from "./onboardingStore.js";
import {
  IGNITION_SHOTS,
  MIRROR,
  GOAL_CHIPS,
  WALL,
  WALL_CHOICES,
  getWallChoice,
  COST,
  PATH,
  ARCHETYPES,
  getArchetype,
  MAP_REVEAL,
  buildPlan,
  VOW,
  FIRST_WIN,
  getFirstWinChips,
  TORCH,
  buildTorchItems,
  SKIP,
  PROGRESS_PHASES,
} from "./crossingScript.js";

/* ════════════════════════════════════════════════════════════════════════
   THE CROSSING — the app's first five minutes.
   Full-screen takeover, 9-phase state machine. Self-contained mini-kit
   (typed lines, embers, confetti) — kit.jsx is NOT imported (font law).
   ════════════════════════════════════════════════════════════════════════ */

// Every phase carries a skip affordance — a reviewer (or any user) must always
// be able to leave onboarding, including after a force-quit resumes mid-flow.
const SKIPPABLE = new Set(PROGRESS_PHASES);

function prefersInstant(settings) {
  if (settings && settings.reducedMotion) return true;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/* line-by-line typed dialogue (kit.jsx cadence: 450ms first, 1500ms after) */
function useTyped(lines, instant) {
  const key = lines.join("|");
  const [n, setN] = useState(instant ? lines.length : 0);
  useEffect(() => {
    setN(instant ? lines.length : 0);
  }, [key, instant]);
  useEffect(() => {
    if (instant || n >= lines.length) return undefined;
    const t = setTimeout(() => setN((v) => v + 1), n === 0 ? 450 : 1500);
    return () => clearTimeout(t);
  }, [n, key, instant, lines.length]);
  return [lines.slice(0, n), n >= lines.length];
}

function Embers({ count = 14 }) {
  return (
    <div className="cx-embers" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          style={{
            left: `${8 + ((i * 37) % 84)}%`,
            width: 3 + (i % 3),
            height: 3 + (i % 3),
            animationDelay: `${i * 0.24}s`,
            animationDuration: `${2.6 + (i % 4) * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
}

const CONFETTI_COLORS = ["#00F0FF", "#D11EFF", "#FF3EDB", "#FFD166", "#00FFBF", "#FF7A1A"];
function Confetti({ count = 26 }) {
  return (
    <div className="cx-confetti" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          style={{
            left: `${(i * 41) % 100}%`,
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animationDelay: `${(i % 9) * 0.14}s`,
            animationDuration: `${2.2 + (i % 5) * 0.35}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function TheCrossing({ onDone }) {
  const {
    settings,
    identity,
    updateIdentity,
    createProject,
    addXP,
    unlockAchievement,
  } = useAppData();
  const { setDayOneSnapshot } = useMapQuestState();

  const initial = useMemo(() => loadCrossing(), []);
  const [phase, setPhase] = useState(() =>
    PROGRESS_PHASES.includes(initial.phase) ? initial.phase : "ignition"
  );
  const [answers, setAnswers] = useState(() => ({ ...initial.answers }));
  const replay = Boolean(initial.replay);
  const instant = prefersInstant(settings);

  const [skipAsk, setSkipAsk] = useState(false);
  useEffect(() => () => stopCrossingVoice(), []);

  const go = (next) => {
    sfxWhoosh(settings);
    recordPhase(next);
    setPhase(next);
    try {
      const root = document.querySelector(".crossing-root");
      if (root) root.scrollTo({ top: 0 });
    } catch {
      // scroll is cosmetic
    }
  };

  const patchAnswers = (patch) => {
    setAnswers((prev) => ({ ...prev, ...patch }));
    saveAnswers(patch);
  };

  const finish = (via) => {
    markComplete(via);
    stopCrossingVoice();
    if (onDone) onDone();
  };

  const progress =
    ((PROGRESS_PHASES.indexOf(phase) + 1) / PROGRESS_PHASES.length) * 100;

  const arch = answers.path ? getArchetype(answers.path) : null;

  return (
    <div className="crossing-root" data-path={answers.path || undefined} role="dialog" aria-label="The Crossing">
      <Embers />
      <div className="cx-stage">
        <div className="cx-progress" aria-hidden="true">
          <div className="cx-progress__fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="cx-content">
          {phase === "ignition" && (
            <Ignition settings={settings} instant={instant} onDone={() => go("mirror")} />
          )}
          {phase === "mirror" && (
            <Mirror
              settings={settings}
              selected={answers.goals}
              onChange={(goals) => patchAnswers({ goals })}
              onDone={() => go("wall")}
            />
          )}
          {phase === "wall" && (
            <Wall
              settings={settings}
              selected={answers.wall}
              onPick={(choice) => {
                patchAnswers({
                  wall: choice.id,
                  wallText: `${choice.echo} — ${choice.counter}`,
                });
                playCrossingVoice(`cx-counter-${choice.id}`);
              }}
              onDone={() => go("cost")}
            />
          )}
          {phase === "cost" && (
            <Cost
              value={answers.cost}
              onChange={(cost) => setAnswers((p) => ({ ...p, cost }))}
              onDone={() => {
                saveAnswers({ cost: answers.cost });
                go("path");
              }}
            />
          )}
          {phase === "path" && (
            <PathSelect
              settings={settings}
              selected={answers.path}
              onPick={(id) => {
                sfxMatchStrike(settings);
                patchAnswers({ path: id, vow: answers.vow || getArchetype(id).vowPrefill });
              }}
              onDone={() => {
                playCrossingVoice("cx-map-reveal");
                go("map");
              }}
            />
          )}
          {phase === "map" && (
            <MapPhase answers={answers} instant={instant} onDone={() => {
              playCrossingVoice("cx-vow-intro");
              go("vow");
            }} />
          )}
          {phase === "vow" && (
            <VowPhase
              settings={settings}
              instant={instant}
              arch={arch || getArchetype("builder")}
              value={answers.vow}
              onChange={(vow) => setAnswers((p) => ({ ...p, vow }))}
              onSealed={(vowText) => {
                const { firstEver } = sealVow(vowText);
                const sealed = loadCrossing();
                setAnswers({ ...sealed.answers });
                if (firstEver) {
                  addXP(XP_VALUES.crossingComplete, "The Crossing");
                  unlockAchievement("day_one_vow");
                  // Day-One mirror — additive keys, never clobbers hometown data.
                  setDayOneSnapshot({
                    crossingWall: sealed.answers.wallText,
                    crossingCost: sealed.answers.cost,
                    crossingVow: sealed.answers.vow,
                    crossingPath: sealed.answers.path,
                    crossingSealedAt: sealed.answers.sealedAt,
                  });
                  // Identity Builder gets a DRAFT power statement — never overwrite.
                  if (!identity || !String(identity.powerStatement || "").trim()) {
                    updateIdentity({ powerStatement: sealed.answers.vow });
                  }
                }
                playCrossingVoice("cx-vow-sealed");
              }}
              onDone={() => {
                if (replay) {
                  playCrossingVoice("cx-torch");
                  go("torch");
                } else {
                  go("firstWin");
                }
              }}
            />
          )}
          {phase === "firstWin" && (
            <FirstWin
              settings={settings}
              answers={answers}
              onDone={(mission, milestone) => {
                if (mission) {
                  const a = arch || getArchetype("builder");
                  const category =
                    a.id === "closer" ? "Sales" : a.id === "builder" ? "Business" : "Personal Growth";
                  const color =
                    a.id === "closer" ? "gold" : a.id === "phoenix" ? "pink" : a.id === "seeker" ? "purple" : "cyan";
                  createProject(
                    {
                      title: mission,
                      category: answers.goals.includes("body") && !milestone ? "Fitness" : category,
                      icon: a.emblem,
                      color,
                      description: "Declared at the Crossing — the first mission.",
                    },
                    milestone ? [milestone] : []
                  );
                }
                playCrossingVoice("cx-torch");
                go("torch");
              }}
            />
          )}
          {phase === "torch" && (
            <Torch
              settings={settings}
              answers={answers}
              onFinish={() => finish("crossed")}
            />
          )}
        </div>

        {SKIPPABLE.has(phase) && (
          <button type="button" className="cx-ghost" onClick={() => setSkipAsk(true)}>
            {SKIP.link}
          </button>
        )}
      </div>

      {skipAsk && (
        <div className="cx-skip-veil" role="dialog" aria-label={SKIP.confirmTitle}>
          <div className="cx-skip-card">
            <h3>{SKIP.confirmTitle}</h3>
            <p>{SKIP.confirmBody}</p>
            <button type="button" className="cx-btn" onClick={() => setSkipAsk(false)}>
              {SKIP.cancelCta}
            </button>
            <button type="button" className="cx-ghost" onClick={() => finish("skipped")}>
              {SKIP.confirmCta}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Phase 1 · IGNITION ──────────────────────────────────────────────── */
function Ignition({ settings, instant, onDone }) {
  const [i, setI] = useState(0);
  const shot = IGNITION_SHOTS[i];
  const [shown, done] = useTyped(shot.lines, instant);
  useEffect(() => {
    playCrossingVoice(`cx-ignite-${i + 1}`);
  }, [i]);
  const advance = () => {
    sfxPop(settings);
    if (i < IGNITION_SHOTS.length - 1) setI(i + 1);
    else onDone();
  };
  return (
    <div>
      <p className="cx-kicker">{shot.kicker}</p>
      {shot.phoenix && (
        <div className="cx-torch-emblem" aria-hidden="true">
          🔥
        </div>
      )}
      <div className="cx-lines">
        {shown.map((line, k) => (
          <p
            key={k}
            className={`cx-line ${k === shown.length - 1 ? "cx-line--last" : ""} ${
              done && k === shown.length - 1 ? "cx-line--accent" : ""
            }`}
          >
            {line}
          </p>
        ))}
      </div>
      {done && (
        <button type="button" className="cx-btn" onClick={advance}>
          {shot.cta}
        </button>
      )}
    </div>
  );
}

/* ── Phase 2 · MIRROR ────────────────────────────────────────────────── */
function Mirror({ settings, selected, onChange, onDone }) {
  const toggle = (id) => {
    sfxHover(settings);
    onChange(
      selected.includes(id) ? selected.filter((g) => g !== id) : [...selected, id]
    );
  };
  return (
    <div>
      <p className="cx-kicker">{MIRROR.kicker}</p>
      <h1 className="cx-title">{MIRROR.title}</h1>
      <p className="cx-sub">{MIRROR.sub}</p>
      <div className="cx-chips">
        {GOAL_CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            className={`cx-chip ${selected.includes(chip.id) ? "is-on" : ""}`}
            onClick={() => toggle(chip.id)}
          >
            <span className="cx-chip__icon" aria-hidden="true">
              {chip.icon}
            </span>
            {chip.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="cx-btn"
        disabled={selected.length < MIRROR.min}
        onClick={onDone}
      >
        {MIRROR.cta}
      </button>
    </div>
  );
}

/* ── Phase 3 · THE WALL — harvest + immediate counter ────────────────── */
function Wall({ settings, selected, onPick, onDone }) {
  const choice = selected ? getWallChoice(selected) : null;
  return (
    <div>
      <p className="cx-kicker">{WALL.kicker}</p>
      <h1 className="cx-title">{WALL.title}</h1>
      <p className="cx-sub">{WALL.sub}</p>
      <div className="cx-walls">
        {WALL_CHOICES.map((w) => (
          <button
            key={w.id}
            type="button"
            className={`cx-wall ${selected === w.id ? "is-on" : ""} ${
              selected && selected !== w.id ? "is-dim" : ""
            }`}
            onClick={() => {
              sfxPop(settings);
              onPick(w);
            }}
          >
            {w.label}
          </button>
        ))}
      </div>
      {choice && (
        <div className="cx-counter" key={choice.id}>
          <p className="cx-counter__kicker">{choice.counterKicker}</p>
          <p className="cx-counter__body">{choice.counter}</p>
        </div>
      )}
      {choice && (
        <button type="button" className="cx-btn" onClick={onDone}>
          {WALL.cta}
        </button>
      )}
    </div>
  );
}

/* ── Phase 4 · THE COST — one private line ───────────────────────────── */
function Cost({ value, onChange, onDone }) {
  const ok = String(value || "").trim().length >= COST.minChars;
  return (
    <div>
      <p className="cx-kicker">{COST.kicker}</p>
      <h1 className="cx-title">{COST.title}</h1>
      <p className="cx-sub">{COST.sub}</p>
      <textarea
        className="cx-cost"
        value={value}
        placeholder={COST.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="cx-private">
        <span aria-hidden="true">🔒</span> Private. Yours only.
      </p>
      <button type="button" className="cx-btn" disabled={!ok} onClick={onDone}>
        {COST.cta}
      </button>
    </div>
  );
}

/* ── Phase 5 · THE PATH — archetype select ───────────────────────────── */
function PathSelect({ settings, selected, onPick, onDone }) {
  return (
    <div>
      <p className="cx-kicker">{PATH.kicker}</p>
      <h1 className="cx-title">{PATH.title}</h1>
      <p className="cx-sub">{PATH.sub}</p>
      <div className="cx-paths">
        {ARCHETYPES.map((a) => (
          <button
            key={a.id}
            type="button"
            className={`cx-path ${selected === a.id ? "is-on" : ""}`}
            style={{ "--pa": a.accent }}
            onClick={() => onPick(a.id)}
          >
            <span className="cx-path__emblem" aria-hidden="true">
              {a.emblem}
            </span>
            <p className="cx-path__name">{a.name}</p>
            <p className="cx-path__tagline">{a.tagline}</p>
            <p className="cx-path__trains">{a.trains}</p>
          </button>
        ))}
      </div>
      {selected && (
        <button type="button" className="cx-btn cx-btn--accent" onClick={onDone}>
          {PATH.cta}
        </button>
      )}
    </div>
  );
}

/* ── Phase 6 · THE MAP — the first value moment ──────────────────────── */
function MapPhase({ answers, instant, onDone }) {
  const plan = useMemo(
    () => buildPlan({ goals: answers.goals, wallId: answers.wall, path: answers.path }),
    [answers.goals, answers.wall, answers.path]
  );
  // nodes light in sequence
  const [lit, setLit] = useState(instant ? plan.days.length : 0);
  useEffect(() => {
    if (instant || lit >= plan.days.length) return undefined;
    const t = setTimeout(() => setLit((v) => v + 1), lit === 0 ? 500 : 380);
    return () => clearTimeout(t);
  }, [lit, instant, plan.days.length]);
  const allLit = lit >= plan.days.length;
  return (
    <div>
      <p className="cx-kicker">{plan.title}</p>
      <h1 className="cx-title cx-title--grad">{MAP_REVEAL.title}</h1>
      <p className="cx-sub">{MAP_REVEAL.sub}</p>
      {plan.echo && (
        <div className="cx-echo">
          {MAP_REVEAL.echoLead} <strong>“{plan.echo}.”</strong> {MAP_REVEAL.echoTail}
        </div>
      )}
      <div className="cx-route">
        {plan.days.map((d, i) => (
          <div key={d.day} className={`cx-node ${i < lit ? "is-lit" : ""}`}>
            <p className="cx-node__day">DAY {d.day}</p>
            <p className="cx-node__label">
              <span aria-hidden="true">{d.icon}</span> {d.label}
            </p>
            <p className="cx-node__detail">{d.detail}</p>
          </div>
        ))}
      </div>
      {allLit && (
        <button type="button" className="cx-btn cx-btn--accent" onClick={onDone}>
          {MAP_REVEAL.cta}
        </button>
      )}
    </div>
  );
}

/* ── Phase 7 · THE VOW — press-and-hold seal ─────────────────────────── */
const HOLD_MS = VOW.holdMs;
function VowPhase({ settings, instant, arch, value, onChange, onSealed, onDone }) {
  const alreadySealed = Boolean(loadCrossing().answers.sealedAt);
  const [sealed, setSealed] = useState(false);
  const [flash, setFlash] = useState(false);
  const [holdP, setHoldP] = useState(0);
  const holdRef = useRef({ down: false, p: 0, timer: null, done: false });
  const [released, setReleased] = useState(false);

  const vowText = String(value || "").trim() || arch.vowPrefill;

  useEffect(() => {
    const h = holdRef.current;
    h.timer = setInterval(() => {
      if (h.done) return;
      const step = 50 / (h.down ? HOLD_MS : -700);
      h.p = Math.max(0, Math.min(1, h.p + step));
      setHoldP(h.p);
      if (h.p >= 1) {
        h.done = true;
        complete();
      }
    }, 50);
    return () => clearInterval(h.timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const complete = () => {
    setSealed(true);
    setFlash(true);
    sfxWaxSeal(settings);
    sfxPhoenix(settings);
    onSealed(vowText);
    setTimeout(() => setFlash(false), 1000);
  };

  const down = () => {
    if (holdRef.current.done) return;
    holdRef.current.down = true;
    setReleased(false);
    sfxMatchStrike(settings);
  };
  const up = () => {
    if (holdRef.current.done) return;
    holdRef.current.down = false;
    if (holdRef.current.p > 0.05) setReleased(true);
  };

  const R = 70;
  const CIRC = 2 * Math.PI * R;
  const sealedNow = sealed || false;
  const dateStamp = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div>
      <p className="cx-kicker">{VOW.kicker}</p>
      <h1 className="cx-title">{VOW.title}</h1>
      <p className="cx-sub">
        {VOW.lines[0]}
        <br />
        {VOW.lines[1]}
      </p>
      <textarea
        className="cx-vow-input"
        value={value}
        placeholder={arch.vowPrefill}
        disabled={sealedNow}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        className={`cx-seal ${sealedNow ? "is-sealed" : ""} ${holdP > 0 && !sealedNow ? "is-holding" : ""}`}
        onPointerDown={down}
        onPointerUp={up}
        onPointerLeave={up}
        onPointerCancel={up}
        aria-label={VOW.holdHint}
      >
        <svg className="cx-seal__ring" width="148" height="148" viewBox="0 0 148 148" aria-hidden="true">
          <circle className="cx-seal__track" cx="74" cy="74" r={R} strokeDasharray={CIRC} />
          <circle
            className="cx-seal__fill"
            cx="74"
            cy="74"
            r={R}
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - (sealedNow ? 1 : holdP))}
          />
        </svg>
        <span className="cx-seal__emblem" aria-hidden="true">
          {sealedNow ? "🔥" : arch.emblem}
        </span>
      </button>
      {!sealedNow && (
        <p className="cx-hold-hint">
          {released ? VOW.releaseLine : VOW.holdHint}
        </p>
      )}
      {sealedNow && (
        <div className="cx-stamp">
          <span aria-hidden="true">✦</span> {VOW.sealedStamp} · {dateStamp}{" "}
          <span aria-hidden="true">✦</span>
        </div>
      )}
      {(sealedNow || alreadySealed) && (
        <button type="button" className="cx-btn cx-btn--accent" onClick={onDone}>
          {VOW.cta}
        </button>
      )}
      {flash && <div className="cx-seal-flash" aria-hidden="true" />}
    </div>
  );
}

/* ── Phase 8 · FIRST WIN — a real mission, in-flow ───────────────────── */
function FirstWin({ settings, answers, onDone }) {
  const [mission, setMission] = useState("");
  const [milestone, setMilestone] = useState("");
  const chips = getFirstWinChips(answers.path, answers.goals);
  const ok = mission.trim().length >= 3 && milestone.trim().length >= 3;
  return (
    <div>
      <p className="cx-kicker">{FIRST_WIN.kicker}</p>
      <h1 className="cx-title">{FIRST_WIN.title}</h1>
      <p className="cx-sub">{FIRST_WIN.sub}</p>
      <div className="cx-field">
        <p className="cx-field__label">{FIRST_WIN.missionLabel}</p>
        <input
          className="cx-field__input"
          value={mission}
          placeholder={FIRST_WIN.missionPlaceholder}
          onChange={(e) => setMission(e.target.value)}
        />
        <div className="cx-suggest">
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              className="cx-suggest__chip"
              onClick={() => {
                sfxHover(settings);
                setMission(c);
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="cx-field">
        <p className="cx-field__label">{FIRST_WIN.milestoneLabel}</p>
        <input
          className="cx-field__input"
          value={milestone}
          placeholder={FIRST_WIN.milestonePlaceholder}
          onChange={(e) => setMilestone(e.target.value)}
        />
      </div>
      <button
        type="button"
        className="cx-btn cx-btn--accent"
        disabled={!ok}
        onClick={() => onDone(mission.trim(), milestone.trim())}
      >
        {FIRST_WIN.cta}
      </button>
    </div>
  );
}

/* ── Phase 9 · THE TORCH — celebration + the first 24 hours ──────────── */
function Torch({ settings, answers, onFinish }) {
  const items = useMemo(() => buildTorchItems({ goals: answers.goals }), [answers.goals]);
  const [done, setDone] = useState(() => loadCrossing().torch || {});
  const toggle = (id) => {
    sfxPop(settings);
    const { state } = recordTorchItem(id);
    setDone(state.torch);
  };
  return (
    <div style={{ position: "relative" }}>
      <Confetti />
      <p className="cx-kicker">{TORCH.kicker}</p>
      <div className="cx-torch-emblem" aria-hidden="true">
        🔥
      </div>
      <h1 className="cx-title cx-title--grad">{TORCH.title}</h1>
      <p className="cx-sub">
        {TORCH.lines[0]}
        <br />
        {TORCH.lines[1]}
      </p>
      <p className="cx-kicker" style={{ marginTop: 10 }}>
        {TORCH.checklistTitle}
      </p>
      <div>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`cx-check ${done[item.id] ? "is-done" : ""}`}
            onClick={() => toggle(item.id)}
          >
            <span className="cx-check__box" aria-hidden="true">
              {done[item.id] ? "✓" : ""}
            </span>
            <span>
              <span className="cx-check__label" style={{ display: "block" }}>
                <span aria-hidden="true">{item.icon}</span> {item.label}
              </span>
              <span className="cx-check__hint" style={{ display: "block" }}>
                {item.hint}
              </span>
            </span>
          </button>
        ))}
      </div>
      <button type="button" className="cx-btn" onClick={onFinish}>
        {TORCH.cta}
      </button>
    </div>
  );
}
