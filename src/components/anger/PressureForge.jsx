import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  SORT_BINS, BIN_BY_ID, PRESSURE_SOURCES, SOURCE_BY_ID,
  REFRAMES, RESOURCE_GROUPS, CLEAN_ACTIONS, SOURCE_ACTIONS,
  RECOVERY_OPTIONS, SPRINT_OPTIONS, COACH, pick, classifyCustom,
} from "./pressureForgeData.js";
import { recordForge } from "./pressureForgeStore.js";
import "../../styles/anger.css";

/* ════════════════════════════════════════════════════════════════════════
   PRESSURE FORGE
   A cinematic, research-backed forge for entrepreneurs & salespeople.

   The loop:  Intake → Heat Check → Sort the raw pressure → Cool the danger →
   Reframe the challenge → Load a resource → Forge one clean action →
   Execution sprint → Recover → Seal (before/after + XP).

   Heat is the throughline — you can watch it fall from blazing to workable
   as you regulate, reframe, and forge.
   ════════════════════════════════════════════════════════════════════════ */

const PHASES = ["intake", "heat", "sort", "cool", "reframe", "resource", "action", "sprint", "cooldown", "seal"];
const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

export default function PressureForge({ onClose, onComplete }) {
  const [phase, setPhase] = useState("intake");
  const [source, setSource] = useState(null);
  const [customText, setCustomText] = useState("");

  const [heat, setHeat] = useState(60);
  const [heatStart, setHeatStart] = useState(60);
  const [meters, setMeters] = useState({ focus: 12, resource: 8, coolant: 10, burnout: 20 });

  const [sortResults, setSortResults] = useState([]);
  const [reframe, setReframe] = useState(null);
  const [customReframe, setCustomReframe] = useState("");
  const [resources, setResources] = useState([]);
  const [action, setAction] = useState("");
  const [recovery, setRecovery] = useState([]);
  const [result, setResult] = useState(null);

  const bump = (patch) => setMeters((m) => {
    const next = { ...m };
    for (const k in patch) next[k] = clamp((m[k] || 0) + patch[k]);
    return next;
  });
  const set = (patch) => setMeters((m) => ({ ...m, ...patch }));

  const go = (p) => { setPhase(p); window.scrollTo({ top: 0 }); };

  const h = heat / 100;
  const demand = heatStart;
  const coachSeed = useMemo(() => (source?.id?.length || 3) + sortResults.length, [source, sortResults.length]);

  // ── phase transitions that own the meter math ────────────────────────────
  const startFromSource = (src) => {
    setSource(src);
    go("heat");
  };
  const startCustom = () => {
    if (!customText.trim()) return;
    const read = classifyCustom(customText);
    setSource({ id: "custom", label: "Your pressure", icon: "✍️", accent: "#FFB000", custom: true, read, text: customText.trim() });
    go("heat");
  };

  const lockHeat = (val) => {
    const v = clamp(val * 10);
    setHeat(v);
    setHeatStart(v);
    // A very hot forge carries recovery risk into the round.
    set({ burnout: clamp(20 + (v > 80 ? 25 : v > 60 ? 12 : 0)) });
    go("sort");
  };

  const onSorted = (material, chosenBin) => {
    const correct = material.bin === chosenBin;
    setSortResults((r) => [...r, { material, chosen: chosenBin, correct }]);
    if (correct) {
      bump({ focus: 8, coolant: 2 });
      setHeat((x) => clamp(x - 3));
      if (material.bin === "recovery") bump({ burnout: 8 }); // seeing the debt is real
    } else {
      bump({ focus: -3 });
      setHeat((x) => clamp(x + 4)); // wrong sort throws smoke
    }
  };

  const finishCool = (dropTo) => {
    setHeat(dropTo);
    bump({ coolant: 26, burnout: -8 });
    go("reframe");
  };

  const lockReframe = () => {
    bump({ focus: 12 });
    setHeat((x) => clamp(x - 6));
    go("resource");
  };

  const toggleResource = (label) =>
    setResources((r) => (r.includes(label) ? r.filter((x) => x !== label) : [...r, label]));

  const lockResources = () => {
    set({ resource: clamp(8 + resources.length * 14) });
    go("action");
  };

  const lockAction = () => {
    if (!action.trim()) return;
    bump({ focus: 16 });
    go("sprint");
  };

  const toggleRecovery = (label) =>
    setRecovery((r) => (r.includes(label) ? r.filter((x) => x !== label) : [...r, label]));

  const finishCooldown = () => {
    const cool = clamp(meters.coolant + recovery.length * 12);
    const finalHeat = clamp(heat - recovery.length * 6);
    set({ coolant: cool, burnout: clamp(meters.burnout - recovery.length * 12) });
    setHeat(finalHeat);
    seal({ coolant: cool, finalHeat });
  };

  const seal = ({ coolant: finalCoolant, finalHeat } = {}) => {
    const heatAfter = finalHeat ?? heat;
    const correctCount = sortResults.filter((r) => r.correct).length;
    const insight = buildInsight({ sortResults, resources, recovery: recovery.length });
    const rec = recordForge({
      source: source?.label || "Pressure",
      sourceId: source?.id,
      heatBefore: heatStart,
      heatAfter,
      action: action.trim(),
      insight,
    });
    const payload = {
      source: source?.label,
      heatBefore: heatStart,
      heatAfter,
      action: action.trim(),
      insight,
      correctCount,
      resources: resources.length,
      recovery: recovery.length,
      coolant: finalCoolant ?? meters.coolant,
      ...rec,
    };
    setResult(payload);
    onComplete?.(payload);
    go("seal");
  };

  return (
    <div className="pf-stage" data-hot={h > 0.62} style={{ "--pf-heat": h, "--src-accent": source?.accent || "#FFB000" }}>
      <ForgeBackdrop heat={h} />

      {/* top bar */}
      <div className="pf-top">
        <button className="pf-back" onClick={onClose}>← Back</button>
        <span className="pf-title">Pressure Forge</span>
        <div className="pf-heatmeter" title={`Heat ${Math.round(heat)}`}>
          <span className="pf-heatmeter__fill" style={{ width: `${heat}%` }} />
        </div>
      </div>

      {/* phase dots */}
      <div className="pf-dots">
        {PHASES.map((p, i) => (
          <span key={p} className={`pf-dot ${PHASES.indexOf(phase) >= i ? "on" : ""}`} />
        ))}
      </div>

      {/* meter HUD (hidden on intake for a clean open) */}
      {phase !== "intake" && <MeterHUD heat={heat} meters={meters} demand={demand} />}

      <div className="pf-body" key={phase}>
        {phase === "intake" && (
          <Intake
            customText={customText} setCustomText={setCustomText}
            onPick={startFromSource} onCustom={startCustom} seed={coachSeed}
          />
        )}
        {phase === "heat" && <HeatCheck source={source} onLock={lockHeat} />}
        {phase === "sort" && (
          <SortFloor source={source} results={sortResults} onSorted={onSorted} onDone={() => go("cool")} seed={coachSeed} />
        )}
        {phase === "cool" && <CoolForge heat={heat} onDone={finishCool} onSkip={() => finishCool(heat)} />}
        {phase === "reframe" && (
          <ReframeReactor source={source} reframe={reframe} setReframe={setReframe}
            customReframe={customReframe} setCustomReframe={setCustomReframe} onLock={lockReframe} />
        )}
        {phase === "resource" && (
          <ResourceLoadout demand={demand} resources={resources} meters={meters}
            onToggle={toggleResource} onLock={lockResources} />
        )}
        {phase === "action" && (
          <ForgeAction source={source} action={action} setAction={setAction} onLock={lockAction} />
        )}
        {phase === "sprint" && (
          <ExecutionSprint action={action} onDone={() => { bump({ focus: 10 }); go("cooldown"); }} onBump={bump} />
        )}
        {phase === "cooldown" && (
          <Cooldown recovery={recovery} onToggle={toggleRecovery} onDone={finishCooldown} />
        )}
        {phase === "seal" && <Seal result={result} onDone={onClose} />}
      </div>
    </div>
  );
}

/* ═══ shared bits ═════════════════════════════════════════════════════════ */
const Eyebrow = ({ children, style }) => <p className="pf-eyebrow" style={style}>{children}</p>;
const Heading = ({ children }) => <h2 className="pf-h">{children}</h2>;
const Lead = ({ children }) => <p className="pf-lead">{children}</p>;
const Science = ({ children }) => <p className="pf-science"><span>THE SCIENCE</span>{children}</p>;
const Primary = ({ children, onClick, disabled }) => (
  <button className="pf-primary" onClick={onClick} disabled={disabled}>{children}</button>
);
const Skip = ({ children, onClick }) => <button className="pf-skip" onClick={onClick}>{children}</button>;
function Coach({ children }) {
  return (
    <div className="pf-coach">
      <span className="pf-coach__badge">🔥 EMBER</span>
      <p className="pf-coach__line">{children}</p>
    </div>
  );
}

function ForgeBackdrop({ heat }) {
  return (
    <div className="pf-forge" aria-hidden style={{ "--fh": heat }}>
      <div className="pf-forge__glow" />
      <div className="pf-forge__embers" />
    </div>
  );
}

function MeterHUD({ heat, meters, demand }) {
  const rows = [
    { key: "heat", label: "Heat", val: heat, color: heat > 62 ? "#FF3B5C" : heat > 38 ? "#FFB000" : "#00F0FF" },
    { key: "focus", label: "Focus", val: meters.focus, color: "#FACC15" },
    { key: "resource", label: "Resource", val: meters.resource, color: "#00FFBF" },
    { key: "coolant", label: "Coolant", val: meters.coolant, color: "#00F0FF" },
  ];
  const burning = meters.burnout >= 60;
  return (
    <div className="pf-hud">
      {rows.map((r) => (
        <div key={r.key} className="pf-hud__cell">
          <div className="pf-hud__top">
            <span className="pf-hud__label">{r.label}</span>
            <span className="pf-hud__val" style={{ color: r.color }}>{Math.round(r.val)}</span>
          </div>
          <div className="pf-hud__bar"><span style={{ width: `${clamp(r.val)}%`, background: r.color }} /></div>
        </div>
      ))}
      {burning && <div className="pf-hud__burnout" title="Recovery debt is high">🛌 Burnout risk</div>}
    </div>
  );
}

/* ═══ 0 · Intake ══════════════════════════════════════════════════════════ */
function Intake({ customText, setCustomText, onPick, onCustom, seed }) {
  const [showCustom, setShowCustom] = useState(false);
  return (
    <div className="pf-pane">
      <div className="pf-anvil" aria-hidden>⚒️</div>
      <Eyebrow>Turn pressure into power</Eyebrow>
      <Heading>What&rsquo;s running hot?</Heading>
      <Lead>
        You don&rsquo;t calm it here and you don&rsquo;t explode it. You <b>forge</b> it — sort the pressure,
        cool the danger, and walk out with one clean move. Pick what&rsquo;s loudest.
      </Lead>
      <Coach>{pick(COACH.intake, seed)}</Coach>

      <div className="pf-source-grid">
        {PRESSURE_SOURCES.map((s) => (
          <button key={s.id} className="pf-source" style={{ "--sc": s.accent }} onClick={() => onPick(s)}>
            <span className="pf-source__icon">{s.icon}</span>
            <span className="pf-source__label">{s.label}</span>
          </button>
        ))}
        <button className="pf-source pf-source--custom" onClick={() => setShowCustom((v) => !v)}>
          <span className="pf-source__icon">✍️</span>
          <span className="pf-source__label">Something else…</span>
        </button>
      </div>

      {showCustom && (
        <div className="pf-custom">
          <label className="pf-label">I&rsquo;m stressed because…</label>
          <textarea className="pf-field" rows={3} value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="e.g. my business has no cash flow and I feel like I'm failing" />
          <Primary disabled={!customText.trim()} onClick={onCustom}>Bring it to the forge →</Primary>
        </div>
      )}
    </div>
  );
}

/* ═══ 1 · Heat Check ══════════════════════════════════════════════════════ */
function HeatCheck({ source, onLock }) {
  const [val, setVal] = useState(6);
  const bucket = val >= 8 ? COACH.heatHigh : val >= 5 ? COACH.heatMid : COACH.heatLow;
  const color = val >= 8 ? "#FF3B5C" : val >= 5 ? "#FFB000" : "#00F0FF";
  return (
    <div className="pf-pane">
      <Eyebrow style={{ color: source?.accent }}>{source?.icon} {source?.label}</Eyebrow>
      <Heading>How hot is it?</Heading>
      <Lead>Heat isn&rsquo;t the enemy — it&rsquo;s raw energy. But you can&rsquo;t make good decisions in a forge that&rsquo;s about to melt. Read the gauge first.</Lead>

      <div className="pf-heatgauge" style={{ "--hc": color }}>
        <div className="pf-heatgauge__num">{val}<span>/10</span></div>
        <input type="range" min={1} max={10} value={val} className="pf-range"
          onChange={(e) => setVal(Number(e.target.value))} />
        <div className="pf-heatgauge__scale"><span>simmering</span><span>boiling</span></div>
      </div>

      <Coach>{pick(bucket, val)}</Coach>
      <Science>Stress is a response to demand — it can sharpen you or strain you. What decides which is whether your resources can carry the load.</Science>
      <Primary onClick={() => onLock(val)}>Load the forge →</Primary>
    </div>
  );
}

/* ═══ 2 · Sort Floor — the arcade core ════════════════════════════════════ */
function SortFloor({ source, results, onSorted, onDone, seed }) {
  const materials = useMemo(() => {
    if (source?.custom && source.read) {
      // build a small custom batch around the classified type + generic smoke/challenge
      const t = source.read.type;
      return [
        { label: source.text.slice(0, 60), bin: t, note: source.read.reframe },
        { label: "…and I keep replaying it", bin: "smoke", note: "The loop adds heat and forges nothing. Name it, then act." },
        { label: "…there's one thing I could actually do", bin: "challenge", note: "One controllable move. That's the fuel — everything else is noise." },
      ];
    }
    return source?.materials || [];
  }, [source]);

  // `step` tracks which material is shown, independent of the parent's running
  // tally — so the ingot keeps showing the material being judged while its
  // feedback is on screen, and never over-runs the array on the last one.
  const [step, setStep] = useState(0);
  const [feedback, setFeedback] = useState(null); // { correct, note, truth, coach }
  const current = materials[step];

  if (step >= materials.length) {
    const correct = results.filter((r) => r.correct).length;
    return (
      <div className="pf-pane">
        <div className="pf-anvil" aria-hidden>⚒️</div>
        <Eyebrow>Forge floor cleared</Eyebrow>
        <Heading>You sorted the pile.</Heading>
        <Lead>
          {correct} of {results.length} sorted clean. Now you can see it plainly: some of that was fuel,
          some was smoke, some was just a tank running empty. Different heat, different tools.
        </Lead>
        <Coach>{pick(COACH.lines, seed)}</Coach>
        <Primary onClick={onDone}>Cool the forge →</Primary>
      </div>
    );
  }

  const choose = (binId) => {
    if (feedback) return;
    const correct = current.bin === binId;
    onSorted(current, binId);
    setFeedback({
      correct,
      note: current.note,
      truth: BIN_BY_ID[current.bin],
      coach: pick(correct ? COACH.sortRight : COACH.sortWrong, step),
    });
  };

  const next = () => { setFeedback(null); setStep((s) => s + 1); };

  return (
    <div className="pf-pane">
      <Eyebrow>Sort the raw pressure</Eyebrow>
      <Heading>What kind of heat is this?</Heading>
      <p className="pf-sort-progress">{step + 1} of {materials.length}</p>

      <div className={`pf-ingot ${feedback ? (feedback.correct ? "is-right" : "is-wrong") : ""}`}
        style={feedback ? { "--sc": feedback.truth.accent } : undefined}>
        <span className="pf-ingot__spark" />
        <span className="pf-ingot__label">{current.label}</span>
      </div>

      {!feedback ? (
        <>
          <div className="pf-bins">
            {SORT_BINS.map((b) => (
              <button key={b.id} className="pf-bin" style={{ "--bc": b.accent }} onClick={() => choose(b.id)}>
                <span className="pf-bin__icon">{b.icon}</span>
                <span className="pf-bin__label">{b.label}</span>
                <span className="pf-bin__blurb">{b.blurb}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="pf-feedback" style={{ "--sc": feedback.truth.accent }}>
          <div className="pf-feedback__tag">
            {feedback.correct ? "✓ Sorted clean" : `Actually: ${feedback.truth.icon} ${feedback.truth.label}`}
          </div>
          <p className="pf-feedback__note">{feedback.note}</p>
          <Coach>{feedback.coach}</Coach>
          <Primary onClick={next}>
            {step + 1 >= materials.length ? "Last one sorted →" : "Next →"}
          </Primary>
        </div>
      )}
    </div>
  );
}

/* ═══ 3 · Cool the Forge — physiological sigh ═════════════════════════════ */
const SIGH = [
  { key: "Inhale", sub: "through the nose", s: 4, scale: 1.42, col: "#00FFBF" },
  { key: "Sip more", sub: "a short second breath in", s: 2, scale: 1.72, col: "#FFB000" },
  { key: "Exhale", sub: "long & slow, through the mouth", s: 8, scale: 0.72, col: "#00F0FF" },
];
const SIGH_ROUNDS = 3;

function CoolForge({ heat, onDone, onSkip }) {
  const [pi, setPi] = useState(0);
  const [count, setCount] = useState(SIGH[0].s);
  const [round, setRound] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setCount((c) => {
        if (c > 1) return c - 1;
        setPi((cur) => {
          const nx = (cur + 1) % SIGH.length;
          if (nx === 0) setRound((r) => r + 1);
          return nx;
        });
        return 0;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, []);
  useEffect(() => { setCount(SIGH[pi].s); }, [pi]);

  const ph = SIGH[pi];
  const done = round >= SIGH_ROUNDS;
  const target = clamp(Math.round(heat * 0.45)); // drop to workable heat

  return (
    <div className="pf-pane">
      <Eyebrow style={{ color: "#00F0FF" }}>Cool the danger</Eyebrow>
      <Heading>Drop it into the working range</Heading>
      <Lead>You can&rsquo;t forge in a fire that&rsquo;s melting the anvil. Two breaths in, one long breath out — cool the heat until your thinking brain is back.</Lead>

      <div className="pf-breath">
        <div className="pf-breath__orb" style={{
          transform: `scale(${ph.scale})`, transition: `transform ${ph.s}s ease-in-out`,
          borderColor: ph.col, background: `radial-gradient(circle at 50% 38%, ${ph.col}38, transparent 70%)`,
        }}>
          <span className="pf-breath__phase" style={{ color: ph.col }}>{ph.key}</span>
          <span className="pf-breath__count">{count || ph.s}</span>
          <span className="pf-breath__sub">{ph.sub}</span>
        </div>
      </div>

      <div className="pf-rounds">round {Math.min(round + (done ? 0 : 1), SIGH_ROUNDS)} / {SIGH_ROUNDS}</div>
      <Science>Stanford&rsquo;s 2023 work found this double-inhale + long exhale lowers arousal faster than meditation — in a single breath.</Science>

      {done
        ? <Primary onClick={() => onDone(target)}>My forge is workable →</Primary>
        : <Skip onClick={() => onSkip()}>I&rsquo;m already cool — skip ahead</Skip>}
    </div>
  );
}

/* ═══ 4 · Reframe Reactor ═════════════════════════════════════════════════ */
function ReframeReactor({ source, reframe, setReframe, customReframe, setCustomReframe, onLock }) {
  const suggested = source?.custom && source.read
    ? [{ from: source.text.slice(0, 46), to: source.read.reframe }, ...REFRAMES.slice(0, 5)]
    : REFRAMES;
  const chosen = reframe || (customReframe.trim() ? { from: "My take", to: customReframe.trim() } : null);
  return (
    <div className="pf-pane">
      <Eyebrow style={{ color: "#FFB000" }}>Reappraisal reactor</Eyebrow>
      <Heading>Turn the heat into fuel</Heading>
      <Lead>Same arousal, better story. You&rsquo;re not pretending it&rsquo;s fine — you&rsquo;re reading the pressure as energy for something that matters. Pick the truest reframe.</Lead>

      <div className="pf-reframes">
        {suggested.map((r, i) => (
          <button key={i} className={`pf-reframe ${reframe === r ? "on" : ""}`}
            onClick={() => { setReframe(r); setCustomReframe(""); }}>
            <span className="pf-reframe__from">“{r.from}”</span>
            <span className="pf-reframe__arrow">→</span>
            <span className="pf-reframe__to">{r.to}</span>
          </button>
        ))}
      </div>

      <label className="pf-label">…or write your own</label>
      <textarea className="pf-field" rows={2} value={customReframe}
        onChange={(e) => { setCustomReframe(e.target.value); setReframe(null); }}
        placeholder="This is loud because ___ — so I'll use it to ___" />

      {chosen && <Coach>{pick(COACH.reframe, chosen.to.length)}</Coach>}
      <Science>Reappraising stress arousal as helpful energy gives a small but real edge on performance — strongest when paired with a concrete next move.</Science>
      <Primary disabled={!chosen} onClick={onLock}>That&rsquo;s the reframe →</Primary>
    </div>
  );
}

/* ═══ 5 · Resource Loadout ════════════════════════════════════════════════ */
function ResourceLoadout({ demand, resources, meters, onToggle, onLock }) {
  const resourceMeter = clamp(8 + resources.length * 14);
  const isChallenge = resourceMeter >= demand;
  return (
    <div className="pf-pane">
      <Eyebrow style={{ color: "#00FFBF" }}>Resource loadout</Eyebrow>
      <Heading>Meet the demand with resources</Heading>
      <Lead>Same pressure, different outcome. When resources carry the demand, a threat becomes a challenge. Load what you actually have — or can get today.</Lead>

      <div className="pf-scale">
        <div className="pf-scale__row">
          <span>Demand</span>
          <div className="pf-scale__bar"><span style={{ width: `${clamp(demand)}%`, background: "#FF3B5C" }} /></div>
        </div>
        <div className="pf-scale__row">
          <span>Resource</span>
          <div className="pf-scale__bar"><span style={{ width: `${resourceMeter}%`, background: "#00FFBF" }} /></div>
        </div>
        <div className={`pf-scale__verdict ${isChallenge ? "is-challenge" : "is-threat"}`}>
          {isChallenge ? "⚔️ Challenge state — you can carry this" : "⚠️ Threat state — add a resource"}
        </div>
      </div>

      {RESOURCE_GROUPS.map((g) => (
        <div key={g.id} className="pf-resgroup">
          <span className="pf-resgroup__label" style={{ color: g.accent }}>{g.label}</span>
          <div className="pf-chips">
            {g.items.map((it) => (
              <button key={it} className={`pf-chip ${resources.includes(it) ? "on" : ""}`}
                style={{ "--cc": g.accent }} onClick={() => onToggle(it)}>{it}</button>
            ))}
          </div>
        </div>
      ))}

      {resources.length > 0 && <Coach>{pick(COACH.resource, resources.length)}</Coach>}
      <Primary disabled={resources.length === 0} onClick={onLock}>
        Load {resources.length || ""} {resources.length === 1 ? "resource" : "resources"} →
      </Primary>
    </div>
  );
}

/* ═══ 6 · Forge the Action ════════════════════════════════════════════════ */
function ForgeAction({ source, action, setAction, onLock }) {
  const suggestions = (source?.id && SOURCE_ACTIONS[source.id]) || CLEAN_ACTIONS.slice(0, 6);
  return (
    <div className="pf-pane">
      <Eyebrow style={{ color: "#FACC15" }}>Forge the action</Eyebrow>
      <Heading>One clean move</Heading>
      <Lead>Not your whole life. Not a 40-item plan. One controllable action you can do today — that&rsquo;s the steel. Pick one or write your own.</Lead>

      <div className="pf-actions">
        {suggestions.map((a) => (
          <button key={a} className={`pf-action ${action === a ? "on" : ""}`} onClick={() => setAction(a)}>
            <span className="pf-action__hammer">🔨</span>{a}
          </button>
        ))}
      </div>

      <label className="pf-label">…or forge your own</label>
      <textarea className="pf-field" rows={2} value={action}
        onChange={(e) => setAction(e.target.value)}
        placeholder="The next controllable swing of the hammer is…" />

      {action.trim() && <Coach>{pick(COACH.forge, action.length)}</Coach>}
      <Primary disabled={!action.trim()} onClick={onLock}>Forge it →</Primary>
    </div>
  );
}

/* ═══ 7 · Execution Sprint ════════════════════════════════════════════════ */
const DISTRACTIONS = ["Everyone's ahead", "Check the leaderboard", "What if it fails", "I should be further", "One quick scroll", "Am I even good at this"];

function ExecutionSprint({ action, onDone, onBump }) {
  const [mins, setMins] = useState(null);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const [cleared, setCleared] = useState(0);
  const [smoke, setSmoke] = useState([]);
  const tick = useRef(null);
  const smokeTimer = useRef(null);
  const idRef = useRef(0);

  const start = (m) => {
    setMins(m);
    setRemaining(m * 60);
    setRunning(true);
  };

  useEffect(() => {
    if (!running) return;
    tick.current = setInterval(() => {
      setRemaining((s) => {
        if (s <= 1) { clearInterval(tick.current); setRunning(false); return 0; }
        return s - 1;
      });
    }, 1000);
    // rumination smoke floats up while you work — tap to clear it
    smokeTimer.current = setInterval(() => {
      idRef.current += 1;
      const id = idRef.current;
      const text = DISTRACTIONS[id % DISTRACTIONS.length];
      const left = 12 + Math.floor((id * 37) % 70);
      setSmoke((arr) => [...arr, { id, text, left }]);
      setTimeout(() => setSmoke((arr) => arr.filter((s) => s.id !== id)), 4200);
    }, 2600);
    return () => { clearInterval(tick.current); clearInterval(smokeTimer.current); };
  }, [running]);

  const clearSmoke = (id) => {
    setSmoke((arr) => arr.filter((s) => s.id !== id));
    setCleared((c) => c + 1);
    onBump?.({ focus: 2, coolant: 1 });
    if (navigator.vibrate) { try { navigator.vibrate(10); } catch {} }
  };

  const done = mins != null && !running && remaining === 0;
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  if (mins == null) {
    return (
      <div className="pf-pane">
        <Eyebrow style={{ color: "#FF3EDB" }}>Execution sprint</Eyebrow>
        <Heading>Put heat on the metal</Heading>
        <Lead>The forge only matters if you swing. Start a focused block on your one move — smoke will try to pull you off it. Tap it away and stay on the anvil.</Lead>
        <div className="pf-actionpill">🔨 {action}</div>
        <div className="pf-sprintopts">
          {SPRINT_OPTIONS.map((o) => (
            <button key={o.mins} className="pf-sprintopt" onClick={() => start(o.mins)}>
              <span className="pf-sprintopt__t">{o.label}</span>
              <span className="pf-sprintopt__s">{o.sub}</span>
            </button>
          ))}
        </div>
        <Skip onClick={onDone}>I&rsquo;ll run the sprint later — schedule it</Skip>
      </div>
    );
  }

  return (
    <div className="pf-pane pf-sprint">
      <Eyebrow style={{ color: "#FF3EDB" }}>{done ? "Sprint complete" : "On the anvil"}</Eyebrow>
      <div className="pf-actionpill">🔨 {action}</div>

      <div className={`pf-timer ${done ? "is-done" : ""}`}>
        {done ? "✓" : `${mm}:${ss}`}
      </div>

      {!done && (
        <div className="pf-smokefield" aria-hidden={smoke.length === 0}>
          {smoke.map((s) => (
            <button key={s.id} className="pf-smoke" style={{ left: `${s.left}%` }} onClick={() => clearSmoke(s.id)}>
              💨 {s.text}
            </button>
          ))}
        </div>
      )}

      {done ? (
        <>
          <Lead>You stayed on it. {cleared > 0 ? `Cleared ${cleared} bit${cleared === 1 ? "" : "s"} of smoke and kept swinging.` : "That's the rep that counts."}</Lead>
          <Coach>{pick(COACH.sprint, cleared)}</Coach>
          <Primary onClick={onDone}>Cool down →</Primary>
        </>
      ) : (
        <>
          <p className="pf-sprint-hint">Tap the smoke to clear it. Keep working your one move.</p>
          <Skip onClick={onDone}>End sprint early</Skip>
        </>
      )}
    </div>
  );
}

/* ═══ 8 · Cooldown / Recover ══════════════════════════════════════════════ */
function Cooldown({ recovery, onToggle, onDone }) {
  return (
    <div className="pf-pane">
      <Eyebrow style={{ color: "#00F0FF" }}>Cool the forge</Eyebrow>
      <Heading>Recover — it&rsquo;s part of the build</Heading>
      <Lead>A blacksmith who never lets the forge cool just cracks the anvil. Pick one or two things to actually do now. Maintenance protects the mission.</Lead>

      <div className="pf-recovery">
        {RECOVERY_OPTIONS.map((r) => (
          <button key={r.label} className={`pf-recovery__item ${recovery.includes(r.label) ? "on" : ""}`}
            onClick={() => onToggle(r.label)}>
            <span className="pf-recovery__icon">{r.icon}</span>{r.label}
          </button>
        ))}
      </div>

      {recovery.length > 0 && <Coach>{pick(COACH.recover, recovery.length)}</Coach>}
      <Science>Burnout is recovery debt, not weakness. Arousal-lowering recovery — breath, food, movement, boundaries — is what keeps high performers performing.</Science>
      <Primary onClick={onDone}>Seal the round →</Primary>
    </div>
  );
}

/* ═══ 9 · Seal — results ══════════════════════════════════════════════════ */
function Seal({ result, onDone }) {
  if (!result) return null;
  const drop = result.heatBefore - result.heatAfter;
  const lvl = result.level;
  return (
    <div className="pf-pane pf-seal">
      <div className="pf-seal__steel" aria-hidden>⚔️</div>
      <Eyebrow style={{ color: "#FACC15" }}>Forged</Eyebrow>
      <Heading>You turned pressure into steel.</Heading>

      <div className="pf-beforeafter">
        <div className="pf-ba"><span className="pf-ba__n" style={{ color: "#FF3B5C" }}>{result.heatBefore}</span><span className="pf-ba__l">heat before</span></div>
        <div className="pf-ba__arrow">→</div>
        <div className="pf-ba"><span className="pf-ba__n" style={{ color: "#00F0FF" }}>{result.heatAfter}</span><span className="pf-ba__l">heat after</span></div>
        {drop > 0 && <div className="pf-ba__drop">−{drop}</div>}
      </div>

      <div className="pf-receipt">
        <Row k="Pressure" v={result.source} />
        <Row k="Sorted clean" v={result.correctCount > 0 ? `${result.correctCount} raw stressor${result.correctCount === 1 ? "" : "s"}` : "—"} />
        <Row k="Resources loaded" v={String(result.resources)} />
        <Row k="Forged action" v={result.action} strong />
        <Row k="Recovery" v={result.recovery > 0 ? `${result.recovery} logged` : "—"} />
        <Row k="Insight" v={result.insight} />
      </div>

      {result.leveledUp && lvl && (
        <div className="pf-levelup" style={{ "--lc": lvl.color }}>
          <span className="pf-levelup__icon">{lvl.icon}</span>
          <div>
            <div className="pf-levelup__tag">LEVEL UP</div>
            <div className="pf-levelup__name">{lvl.name}</div>
            <div className="pf-levelup__tag2">{lvl.tagline}</div>
          </div>
        </div>
      )}

      <div className="pf-streakrow">🔥 {result.state?.streak || 1} day forge streak · {result.state?.totalForged || 1} forged</div>
      <Coach>{pick(COACH.seal, (result.action || "").length)}</Coach>
      <Primary onClick={onDone}>Now go swing ✦</Primary>
    </div>
  );
}
function Row({ k, v, strong, hide }) {
  if (hide || v == null || v === "") return null;
  return (
    <div className="pf-receipt__row">
      <span className="pf-receipt__k">{k}</span>
      <span className={`pf-receipt__v ${strong ? "is-strong" : ""}`}>{v}</span>
    </div>
  );
}

/* ─── insight builder ─────────────────────────────────────────────────────── */
function buildInsight({ sortResults, resources, recovery }) {
  const smoke = sortResults.filter((r) => r.material?.bin === "smoke").length;
  const recDebt = sortResults.filter((r) => r.material?.bin === "recovery").length;
  if (recDebt >= 2 || (recDebt >= 1 && recovery === 0)) return "A lot of that heat was recovery debt — rest is the resource you were missing.";
  if (smoke >= 2) return "Comparison and rumination were eating your heat. Clearing the smoke freed the fuel.";
  if (resources >= 3) return "The demand didn't change — your resources did. That's how threat becomes challenge.";
  return "You sorted the pressure before you swung. That's the whole skill.";
}
