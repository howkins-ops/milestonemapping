import React, { useState, useEffect, useRef } from "react";

/* ════════════════════════════════════════════════════════════════════════
   HOLD THE LINE — a cinematic anger-transformation journey.

   Grounded in the actual science of acute anger down-regulation:
     · Physiological sigh (double-inhale, long exhale) — Stanford/Huberman
       lab, 2023: beats meditation for dropping arousal in the moment.
     · Somatic discharge + PMR — DBT "TIPP": anger is adrenaline with
       nowhere to go; burning it off / clench-release drains the charge.
     · Affect labeling — UCLA (Lieberman): naming it in the third person
       ("this is rage") quiets the amygdala and brings the cortex back.
     · Anger iceberg — anger is the guard; underneath sits hurt / fear /
       shame it's protecting.
     · The gap — Frankl: between stimulus and response there is a space;
       the whole skill is widening it and choosing from there.

   The arc descends into the body, cools the charge, then climbs back into
   choice. A single "heat" value falls from blazing red to calm cyan across
   the whole journey, so the transformation is something you can watch.
   ════════════════════════════════════════════════════════════════════════ */

const RED = "var(--brand-red)";
const STAGES = ["arrive", "sigh", "discharge", "name", "under", "gap", "seal"];

// crossfade a hot (red) and cool (cyan) layer by heat 0..1
function heatGlow(h) {
  return `radial-gradient(circle at 50% 38%, rgba(0,240,255,${0.42 * (1 - h)}), transparent 60%),
          radial-gradient(circle at 50% 46%, rgba(255,59,92,${0.16 + 0.5 * h}), transparent 62%)`;
}
function heatBorder(h) {
  return h > 0.5 ? "rgba(255,59,92,0.55)" : `rgba(0,240,255,${0.3 + 0.4 * (1 - h)})`;
}

export default function HoldTheLine({ onClose, onFinish }) {
  const [stage, setStage] = useState(0);
  const [heat, setHeat] = useState(100); // 100 = blazing, 0 = cool
  const [data, setData] = useState({ name: "", intensity: "", under: "", underNote: "", move: "" });

  const set = (patch) => setData((d) => ({ ...d, ...patch }));
  const go = (i, targetHeat) => {
    if (targetHeat != null) setHeat(targetHeat);
    setStage(i);
  };

  const h = heat / 100;
  const cool = heat <= 35;

  const finish = () => {
    const bits = [];
    if (data.name) bits.push(`Named it: ${data.name}`);
    if (data.under) bits.push(`under it: ${data.under}`);
    if (data.move.trim()) bits.push(`chose: "${data.move.slice(0, 44)}"`);
    onFinish("Hold the Line", bits.join(" · ") || "Cooled the charge and held the line");
  };

  return (
    <div className="htl-stage" style={{ "--htl-heat": h, background: `${heatGlow(h)}, radial-gradient(circle at 50% 120%, rgba(20,4,10,0.9), #050007 70%)` }}>
      <div className="htl-embers" aria-hidden style={{ opacity: 0.25 + 0.55 * h }} />

      {/* top bar — charge meter is the throughline of the whole journey */}
      <div className="htl-top">
        <button className="htl-back" onClick={onClose}>← Back</button>
        <span className="htl-title">Hold the Line</span>
        <div className="htl-meter" title="Charge">
          <span className="htl-meter__fill" style={{ width: `${heat}%`, background: cool ? "var(--brand-cyan)" : "var(--brand-red)" }} />
        </div>
      </div>

      <div className="htl-dots">
        {STAGES.map((_, i) => (
          <span key={i} className={`htl-dot ${i <= stage ? "on" : ""}`} style={{ background: i <= stage ? (cool ? "var(--brand-cyan)" : "var(--brand-red)") : undefined }} />
        ))}
      </div>

      <div className="htl-body" key={stage}>
        {stage === 0 && <Arrive heat={h} onNext={() => go(1)} />}
        {stage === 1 && <Sigh onNext={() => go(2, 72)} />}
        {stage === 2 && <Discharge onNext={() => go(3, 22)} />}
        {stage === 3 && <NameIt data={data} set={set} onNext={() => go(4, 15)} />}
        {stage === 4 && <Underneath data={data} set={set} onNext={() => go(5, 8)} />}
        {stage === 5 && <Gap data={data} set={set} onNext={() => go(6, 3)} />}
        {stage === 6 && <Seal data={data} onDone={finish} />}
      </div>
    </div>
  );
}

/* ─── tiny shared bits ─────────────────────────────────────────────────── */
function Eyebrow({ children, cool }) {
  return <p className="htl-eyebrow" style={{ color: cool ? "var(--brand-cyan)" : "var(--brand-red)" }}>{children}</p>;
}
function Heading({ children }) { return <h2 className="htl-h">{children}</h2>; }
function Lead({ children }) { return <p className="htl-lead">{children}</p>; }
function Science({ children }) {
  return (
    <p className="htl-science"><span>THE SCIENCE</span>{children}</p>
  );
}
function Primary({ children, onClick, disabled, cool }) {
  return (
    <button className="htl-primary" onClick={onClick} disabled={disabled}
      style={{ background: cool ? "var(--brand-cyan)" : "var(--brand-red)", opacity: disabled ? 0.4 : 1 }}>
      {children}
    </button>
  );
}

/* ─── 0 · Arrive — name the stakes ─────────────────────────────────────── */
function Arrive({ heat, onNext }) {
  return (
    <div className="htl-center">
      <div className="htl-core htl-core--pulse" style={{ background: heatGlow(heat), borderColor: heatBorder(heat) }}>
        <span className="htl-core__label">running hot</span>
      </div>
      <Eyebrow>The heat is real</Eyebrow>
      <Heading>Anger isn&rsquo;t the enemy.</Heading>
      <Lead>
        It&rsquo;s a guard standing at the door of something that got hurt. We&rsquo;re not here to kill it —
        we&rsquo;re here to keep it from driving. Between the spark and the act there&rsquo;s a gap.
        The whole skill is widening it: <b>body first, story second.</b>
      </Lead>
      <Primary onClick={onNext}>Find the gap →</Primary>
    </div>
  );
}

/* ─── 1 · Physiological sigh ───────────────────────────────────────────── */
const SIGH = [
  { key: "Inhale", sub: "through the nose", s: 4, scale: 1.42, col: "var(--brand-green)" },
  { key: "Sip more", sub: "a short second breath in", s: 2, scale: 1.72, col: "var(--brand-gold)" },
  { key: "Exhale", sub: "long & slow, through the mouth", s: 8, scale: 0.74, col: "var(--brand-cyan)" },
];
const SIGH_ROUNDS = 4;

function Sigh({ onNext }) {
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

  return (
    <div className="htl-center">
      <Eyebrow cool>Cool the body</Eyebrow>
      <Heading>The double-breath</Heading>
      <Lead>You can&rsquo;t think your way calm while you&rsquo;re flooded. Follow the orb — two breaths in, one long breath out.</Lead>

      <div className="htl-breath">
        <div className="htl-breath__orb" style={{ transform: `scale(${ph.scale})`, transition: `transform ${ph.s}s ease-in-out`, borderColor: ph.col, background: `radial-gradient(circle at 50% 38%, ${ph.col}38, transparent 70%)` }}>
          <span className="htl-breath__phase" style={{ color: ph.col }}>{ph.key}</span>
          <span className="htl-breath__count">{count || ph.s}</span>
          <span className="htl-breath__sub">{ph.sub}</span>
        </div>
      </div>

      <div className="htl-rounds">round {Math.min(round + (done ? 0 : 1), SIGH_ROUNDS)} / {SIGH_ROUNDS}</div>
      <Science>Stanford found this double-inhale + long exhale lowers your arousal faster than meditation — in a single breath.</Science>

      <button className="htl-primary" onClick={onNext}
        style={{ background: done ? "var(--brand-cyan)" : "transparent", color: done ? "#000" : "var(--text-main)", border: done ? "none" : "1px solid var(--border)" }}>
        {done ? "My body’s settling →" : "I’ve breathed enough →"}
      </button>
    </div>
  );
}

/* ─── 2 · Somatic discharge — the interactive game ─────────────────────── */
const DISCHARGE_CUES = [
  "Shake your hands out — hard, like you&rsquo;re flicking off water.",
  "Clench both fists for 5… then drop everything loose.",
  "Push your feet into the floor. Press the heat down and out.",
  "Roll the shoulders back. Let the jaw go slack.",
];

function Discharge({ onNext }) {
  const [charge, setCharge] = useState(100);
  const [punch, setPunch] = useState(false);
  const [cue, setCue] = useState(0);
  const holdRef = useRef(null);
  const spent = charge <= 0;

  // rotate the somatic cue every few seconds
  useEffect(() => {
    const iv = setInterval(() => setCue((c) => (c + 1) % DISCHARGE_CUES.length), 3200);
    return () => clearInterval(iv);
  }, []);

  const stop = () => { if (holdRef.current) { clearInterval(holdRef.current); holdRef.current = null; } };
  const drain = (amt) => {
    setCharge((c) => {
      const next = Math.max(0, c - amt);
      if (next === 0) stop(); // self-stop the hold-loop the moment it cools
      return next;
    });
    setPunch(true);
    setTimeout(() => setPunch(false), 110);
    if (navigator.vibrate) { try { navigator.vibrate(14); } catch {} }
  };
  const onDown = () => {
    drain(8);
    holdRef.current = setInterval(() => drain(4), 140); // reward holding too
  };
  useEffect(() => stop, []);

  const hc = charge / 100;

  return (
    <div className="htl-center">
      <Eyebrow cool={spent}>Burn it off</Eyebrow>
      <Heading>{spent ? "The charge is spent." : "Discharge the charge"}</Heading>
      <Lead>
        {spent
          ? "That adrenaline had nowhere to go — now it does. Feel how the edge has dropped."
          : "Anger is adrenaline with nowhere to go. Pound it out of the core until it cools — tap fast, or press and hold."}
      </Lead>

      <button
        className={`htl-discharge ${punch ? "is-hit" : ""} ${spent ? "is-spent" : ""}`}
        onPointerDown={spent ? undefined : onDown}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        disabled={spent}
        style={{
          background: heatGlow(hc),
          borderColor: heatBorder(hc),
          transform: `scale(${punch ? 1.07 : 1})`,
        }}
        aria-label="Discharge the charge"
      >
        <span className="htl-discharge__ring" />
        <span className="htl-discharge__val">{spent ? "✓" : `${Math.round(charge)}%`}</span>
        <span className="htl-discharge__hint">{spent ? "cooled" : "strike"}</span>
      </button>

      {!spent && <p className="htl-cue" key={cue} dangerouslySetInnerHTML={{ __html: DISCHARGE_CUES[cue] }} />}
      <Science>This is the body half of DBT&rsquo;s crisis kit — spend the surge through movement and clench-release, and the nervous system stands down.</Science>

      {spent
        ? <Primary cool onClick={onNext}>My thinking brain is back →</Primary>
        : <button className="htl-skip" onClick={onNext}>I&rsquo;m already cooler — skip ahead</button>}
    </div>
  );
}

/* ─── 3 · Name it (affect labeling) ────────────────────────────────────── */
const ANGER_WORDS = ["Rage", "Fury", "Resentment", "Frustration", "Disrespect", "Indignation", "Contempt", "Betrayal", "Bitterness", "Humiliation"];
const INTENSITIES = ["Simmering", "Burning", "Boiling"];

function NameIt({ data, set, onNext }) {
  return (
    <div className="htl-pane">
      <Eyebrow cool>Name it to tame it</Eyebrow>
      <Heading>What is this, exactly?</Heading>
      <Lead>Be precise — &ldquo;bad&rdquo; does nothing, &ldquo;this is contempt&rdquo; does a lot. Pick the truest word.</Lead>

      <div className="htl-chips">
        {ANGER_WORDS.map((w) => (
          <button key={w} className={`htl-chip ${data.name === w ? "on" : ""}`} onClick={() => set({ name: w })}>{w}</button>
        ))}
      </div>

      {data.name && (
        <>
          <div className="htl-echo">This is <b>{data.name.toLowerCase()}</b>.</div>
          <p className="htl-echo-sub">Said in the third person — &ldquo;this is&rdquo;, not &ldquo;I am&rdquo; — so you stand beside it instead of becoming it.</p>
          <div className="htl-intensity">
            {INTENSITIES.map((x) => (
              <button key={x} className={`htl-chip sm ${data.intensity === x ? "on" : ""}`} onClick={() => set({ intensity: x })}>{x}</button>
            ))}
          </div>
        </>
      )}

      <Science>UCLA scans show that labeling the feeling drops activity in the amygdala and hands the wheel back to your reasoning brain.</Science>
      <Primary cool disabled={!data.name} onClick={onNext}>That&rsquo;s the word →</Primary>
    </div>
  );
}

/* ─── 4 · Under the iceberg ────────────────────────────────────────────── */
const UNDER_WORDS = ["Hurt", "Fear", "Disrespected", "Shame", "Powerless", "Unseen", "Rejected", "Grief", "Helpless", "Betrayed"];

function Underneath({ data, set, onNext }) {
  return (
    <div className="htl-pane">
      <Eyebrow cool>Under the iceberg</Eyebrow>
      <Heading>Who is the anger protecting?</Heading>
      <Lead>{data.name || "Anger"} is the bodyguard at the door. It only ever shows up to guard something softer. What&rsquo;s underneath?</Lead>

      <div className="htl-iceberg">
        <div className="htl-iceberg__tip">{data.name || "Anger"}</div>
        <div className="htl-iceberg__line" />
        <div className="htl-chips">
          {UNDER_WORDS.map((w) => (
            <button key={w} className={`htl-chip ${data.under === w ? "on" : ""}`} onClick={() => set({ under: w })}>{w}</button>
          ))}
        </div>
      </div>

      <textarea className="htl-field" rows={2} value={data.underNote}
        onChange={(e) => set({ underNote: e.target.value })}
        placeholder="If you can: the real thing underneath was…" />

      {data.under && (
        <div className="htl-quote">
          &ldquo;My {(data.name || "anger").toLowerCase()} showed up because part of me felt {data.under.toLowerCase()}.
          I can protect that part without the explosion.&rdquo;
        </div>
      )}

      <Primary cool disabled={!data.under} onClick={onNext}>I see what it&rsquo;s guarding →</Primary>
    </div>
  );
}

/* ─── 5 · The gap — values-based choice ────────────────────────────────── */
function Gap({ data, set, onNext }) {
  return (
    <div className="htl-pane">
      <Eyebrow cool>The gap</Eyebrow>
      <Heading>You&rsquo;re standing in it.</Heading>
      <Lead>
        Body&rsquo;s cooler. The feeling&rsquo;s named. This is the space between the spark and the act —
        and you get to choose what walks out of it. Not the Raging Victim. The man you&rsquo;re becoming.
      </Lead>

      <div className="htl-quote">
        &ldquo;I feel this fully, and I still choose my response. That&rsquo;s the line I hold.&rdquo;
      </div>

      <label className="htl-label">If I respond from who I&rsquo;m becoming, the next right move is…</label>
      <textarea className="htl-field" rows={3} value={data.move}
        onChange={(e) => set({ move: e.target.value })}
        placeholder="Step outside for two minutes, then say the one true thing — calmly. / Ask for what I actually need. / Let it pass and revisit tomorrow." />

      <Primary cool onClick={onNext}>Hold it →</Primary>
    </div>
  );
}

/* ─── 6 · Seal ─────────────────────────────────────────────────────────── */
function Seal({ data, onDone }) {
  const stamp = data.move.trim()
    ? `I felt the ${(data.name || "heat").toLowerCase()}, protected the ${(data.under || "part of me").toLowerCase()} underneath, and chose my response.`
    : "I felt the heat without letting it drive.";
  return (
    <div className="htl-center">
      <div className="htl-core htl-core--cool">
        <span className="htl-core__label">held</span>
      </div>
      <Eyebrow cool>Sealed</Eyebrow>
      <Heading>You held the line.</Heading>
      <Lead>You caught it on the way up, cooled the body, named it, and chose. That pause <b>is</b> the skill — and every rep widens the gap.</Lead>

      <div className="htl-stamp">
        <span>YOUR STAMP</span>
        <p>{stamp}</p>
      </div>

      <Primary cool onClick={onDone}>Save &amp; close ✦</Primary>
    </div>
  );
}
