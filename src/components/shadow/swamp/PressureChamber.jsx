import React, { useState } from "react";
import { BreathOrb } from "../shell.jsx";
import {
  SwampStage, Eyebrow, Heading, Lead, Science, Primary, Ghost, Skip, Chips, Field, Fireflies,
} from "./swampShell.jsx";
import Boggo, { BoggoSays } from "./Boggo.jsx";
import { scanForRisk, SafetyScreen } from "./safety.jsx";
import {
  CATEGORIES, BODY_CUES, HIDDEN_EMOTIONS, TRUTH_PIECES, TRUTH_TEMPLATES,
  CLEAN_ACTIONS, boggoLine,
} from "./swampData.js";

/* ════════════════════════════════════════════════════════════════════════
   PRESSURE CHAMBER — the flagship valve loop.

   Comedy on top (Boggo bloats, gas rises, fart-cloud → fireflies), but the
   spine is real: choose bottle / blow / valve → feel the body → breathe →
   name the real feeling → speak a clean truth → choose one clean action.
   ════════════════════════════════════════════════════════════════════════ */

const clamp = (n) => Math.max(0, Math.min(100, n));
const STAGES = ["arrive", "fork", "body", "breath", "name", "truth", "action", "seal"];

export default function PressureChamber({ onBack, onComplete }) {
  const [stage, setStage] = useState(0);
  const [risk, setRisk] = useState(null); // { kind } → SafetyScreen

  // situation
  const [catId, setCatId] = useState(null);
  const [trigger, setTrigger] = useState("");
  const [custom, setCustom] = useState("");
  const [intensity, setIntensity] = useState(6);
  const startIntensity = React.useRef(6);

  // meters
  const [pressure, setPressure] = useState(40);
  const [heat, setHeat] = useState(35);
  const [clarity, setClarity] = useState(10);
  const [flow, setFlow] = useState(0);

  // valve data
  const [body, setBody] = useState(null);
  const [feeling, setFeeling] = useState(null);
  const [truth, setTruth] = useState("");
  const [blocked, setBlocked] = useState(null);
  const [action, setAction] = useState("");
  const [delayed, setDelayed] = useState(false);
  const [messyTried, setMessyTried] = useState([]); // "bottle" | "blow"
  const [valvesUsed, setValvesUsed] = useState([]);

  const cat = CATEGORIES.find((c) => c.id === catId);
  const situation = custom.trim() || trigger;

  const boggoState =
    heat > 58 ? "steaming" : pressure > 64 ? "bloated" : flow > 40 ? "relieved" : "calm";
  const wobble = pressure > 75 || heat > 70;

  const go = (i) => setStage(i);
  const addValve = (v) => setValvesUsed((u) => (u.includes(v) ? u : [...u, v]));

  const meters = [
    { label: "Pressure", value: pressure, color: "var(--brand-red)" },
    { label: "Heat", value: heat, color: "var(--brand-gold)" },
    { label: "Clarity", value: clarity, color: "var(--brand-cyan)" },
  ];

  // ── arrive → set the charge from intensity ──────────────────────────────
  const beginPressure = () => {
    const r = scanForRisk(custom);
    if (r.risk) { setRisk(r); return; }
    startIntensity.current = intensity;
    setPressure(clamp(intensity * 7 + 22));
    setHeat(clamp(intensity * 5 + 14));
    go(1);
  };

  // ── the fork ────────────────────────────────────────────────────────────
  const bottle = () => {
    setPressure((p) => clamp(p + 12));
    setMessyTried((m) => (m.includes("bottle") ? m : [...m, "bottle"]));
  };
  const blow = () => {
    setHeat((h) => clamp(h + 26));
    setPressure((p) => clamp(p - 6));
    setMessyTried((m) => (m.includes("blow") ? m : [...m, "blow"]));
  };

  // ── truth builder ───────────────────────────────────────────────────────
  const addPiece = (piece) => setTruth((t) => (t ? `${t} ${piece}` : piece));
  const rejectToxic = (piece) => { setBlocked(piece); setTimeout(() => setBlocked(null), 450); };
  const commitTruth = () => {
    const r = scanForRisk(truth);
    if (r.risk) { setRisk(r); return; }
    setPressure((p) => clamp(p - 18));
    setFlow((f) => clamp(f + 22));
    addValve("Truth");
    go(6);
  };

  const finish = () => {
    const bits = [];
    if (feeling) bits.push(`Named it: ${feeling.toLowerCase()}`);
    if (situation) bits.push(`valved "${situation.slice(0, 40)}"`);
    if (action) bits.push(`chose: ${action}`);
    onComplete(bits.join(" · ") || "Released the pressure safely — no swamp damage.");
  };

  if (risk) return <SafetyScreen kind={risk.kind} onClose={onBack} />;

  return (
    <SwampStage
      title="Pressure Chamber"
      onClose={onBack}
      meters={stage > 0 && stage < 7 ? meters : []}
      total={STAGES.length}
      active={stage}
      wobble={wobble && stage > 0 && stage < 4}
    >
      {/* 0 · ARRIVE */}
      {stage === 0 && (
        <div className="sv-center">
          <Boggo state={pressure > 60 ? "bloated" : "calm"} size={128} />
          <Eyebrow>Something's building</Eyebrow>
          <Heading>What's putting you under pressure?</Heading>
          <Lead>Pick where it's coming from. Pressure is just information — we'll read it, then vent it clean.</Lead>

          <Chips options={CATEGORIES} value={catId} onChange={(id) => { setCatId(id); setTrigger(""); }} />

          {cat && (
            <>
              <Chips options={cat.triggers} value={trigger} onChange={(t) => { setTrigger(t); setCustom(""); }} sm />
              <Field value={custom} onChange={setCustom} rows={2}
                placeholder="…or say it in your own words." />
            </>
          )}

          {(trigger || custom.trim()) && (
            <>
              <label className="sv-eyebrow" style={{ marginTop: 6 }}>How hot is it? ({intensity}/10)</label>
              <div className="sv-intensity">
                <input type="range" min={1} max={10} value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))} />
                <span className="sv-intensity__num">{intensity}</span>
              </div>
              <Primary onClick={beginPressure}>Take it to the chamber →</Primary>
            </>
          )}
        </div>
      )}

      {/* 1 · THE FORK */}
      {stage === 1 && (
        <div className="sv-pane">
          <div style={{ textAlign: "center" }}><Boggo state={boggoState} size={116} /></div>
          <Eyebrow>Three doors</Eyebrow>
          <Heading>The pressure's here. What now?</Heading>
          <Lead>Two of these feel good for one second. Try them — watch the meters — then find the valve.</Lead>

          {messyTried.length > 0 && (
            <BoggoSays state={boggoState} compact
              line={boggoLine("correction", messyTried.length)} />
          )}

          <div className="sv-fork">
            <button className="sv-forkbtn sv-forkbtn--bottle" onClick={bottle}>
              <span className="sv-forkbtn__title">🫙 Bottle it</span>
              <p className="sv-forkbtn__sub">Look calm, say "I'm fine." <b>Pressure climbs. It always leaks later.</b></p>
            </button>
            <button className="sv-forkbtn sv-forkbtn--blow" onClick={blow}>
              <span className="sv-forkbtn__title">💥 Blow up</span>
              <p className="sv-forkbtn__sub">Let it rip. <b>Heat spikes, mess spreads, the trigger comes back stronger.</b></p>
            </button>
            <button className="sv-forkbtn sv-forkbtn--valve" onClick={() => go(2)}>
              <span className="sv-forkbtn__title">🔧 Open the valve</span>
              <p className="sv-forkbtn__sub">Takes a pause and a little skill. <b>Pressure drops for real, and you keep your power.</b></p>
            </button>
          </div>
          <Science>Suppression and venting both spike arousal downstream. Regulated release — naming + slow breath + a clean ask — is what actually brings the nervous system back to baseline.</Science>
        </div>
      )}

      {/* 2 · BODY SIGNAL */}
      {stage === 2 && (
        <div className="sv-pane">
          <Eyebrow>The body is the dashboard</Eyebrow>
          <Heading>Where do you feel it?</Heading>
          <Lead>Anger lives in the body before it reaches your mouth. Find it — noticing it is half the release.</Lead>
          <Chips options={BODY_CUES} value={body} onChange={setBody} />
          <Primary disabled={!body} onClick={() => { setClarity((c) => clamp(c + 14)); addValve("Body"); go(3); }}>
            Got it — cool it down →
          </Primary>
        </div>
      )}

      {/* 3 · BREATH VALVE */}
      {stage === 3 && (
        <div className="sv-center">
          <Eyebrow>Breath valve</Eyebrow>
          <Heading>Vent the steam</Heading>
          <Lead>Follow the orb. The long exhale is the valve — it's what actually drops the pressure.</Lead>
          <div className="sv-breath"><BreathOrb /></div>
          <Science>A slow, extended exhale flips on the parasympathetic brake — Stanford found it lowers arousal faster than meditation, in a single breath.</Science>
          <Primary onClick={() => { setPressure((p) => clamp(p - 24)); setHeat((h) => clamp(h - 22)); setClarity((c) => clamp(c + 8)); addValve("Breath"); go(4); }}>
            My body's settling →
          </Primary>
        </div>
      )}

      {/* 4 · NAME-IT VALVE */}
      {stage === 4 && (
        <div className="sv-pane">
          <Eyebrow>Name-it valve</Eyebrow>
          <Heading>What's really under the anger?</Heading>
          <Lead>Anger is the bodyguard. It shows up to protect something softer. Name the real thing — it loosens the grip.</Lead>
          <Chips options={HIDDEN_EMOTIONS} value={feeling} onChange={setFeeling} />
          {feeling && (
            <div className="sv-echo">Under the anger: <b>{feeling.toLowerCase()}</b>.</div>
          )}
          <Science>UCLA scans show that labelling the feeling quiets the amygdala and hands the wheel back to your thinking brain.</Science>
          <Primary disabled={!feeling} onClick={() => { setClarity((c) => clamp(c + 16)); setPressure((p) => clamp(p - 12)); addValve("Name-It"); go(5); }}>
            That's the one →
          </Primary>
        </div>
      )}

      {/* 5 · TRUTH + BOUNDARY VALVE */}
      {stage === 5 && (
        <div className="sv-pane">
          <Eyebrow>Truth + boundary valve</Eyebrow>
          <Heading>Say the clean version</Heading>
          <Lead>The formula: <b>feeling + fact + need + request</b>. Tap the clean pieces to build it — or steal a starter and edit.</Lead>

          <div className="sv-truth-line">
            {truth ? truth : <span className="ph">I felt {feeling ? feeling.toLowerCase() : "…"} when…</span>}
          </div>

          <div className="sv-truth-pool">
            {TRUTH_PIECES.clean.map((p) => (
              <button key={p} className="sv-truth-piece" onClick={() => addPiece(p)}>{p}</button>
            ))}
          </div>

          <p className="sv-eyebrow" style={{ textAlign: "center" }}>Leave these in the swamp</p>
          <div className="sv-truth-pool">
            {TRUTH_PIECES.toxic.map((p) => (
              <button key={p} className={`sv-truth-piece toxic ${blocked === p ? "blocked" : ""}`} onClick={() => rejectToxic(p)}>{p}</button>
            ))}
          </div>
          {blocked && <BoggoSays compact state="calm" line="That one's a swamp-text. It vents pressure and blows up the bridge. Leave it." />}

          <Field value={truth} onChange={setTruth} rows={3} placeholder="Build or edit your clean sentence here…" />

          <p className="sv-eyebrow" style={{ textAlign: "center" }}>Or steal a starter</p>
          <div className="sv-truth-pool">
            {TRUTH_TEMPLATES.slice(0, 4).map((t) => (
              <button key={t} className="sv-truth-piece" onClick={() => setTruth(t)} style={{ maxWidth: 260, whiteSpace: "normal" }}>{t}</button>
            ))}
          </div>

          <Primary disabled={truth.trim().length < 6} onClick={commitTruth}>That's clean — release it →</Primary>
        </div>
      )}

      {/* 6 · CLEAN ACTION */}
      {stage === 6 && (
        <div className="sv-pane">
          <div style={{ textAlign: "center" }}><Boggo state="relieved" size={112} /></div>
          <Eyebrow>Action pump</Eyebrow>
          <Heading>One clean move</Heading>
          <Lead>Pressure's down. Now aim the energy. Pick one real thing you'll actually do next.</Lead>
          <Chips options={CLEAN_ACTIONS} value={action} onChange={setAction} sm />

          <button className={`sv-chip ${delayed ? "on" : ""}`} onClick={() => setDelayed((d) => !d)} style={{ alignSelf: "center" }}>
            ⏳ Delay valve: draft it, don't send it while swampy
          </button>
          {delayed && <div className="sv-quote">Draft saved. Not sent while swampy. ✎</div>}

          <Primary disabled={!action} onClick={() => { setFlow((f) => clamp(f + 18)); addValve("Action"); go(7); }}>
            Lock it in →
          </Primary>
        </div>
      )}

      {/* 7 · SEAL */}
      {stage === 7 && (
        <Seal
          before={startIntensity.current}
          after={Math.max(1, Math.round(pressure / 10))}
          valves={valvesUsed}
          feeling={feeling}
          situation={situation}
          messyTried={messyTried}
          onDone={finish}
        />
      )}
    </SwampStage>
  );
}

/* ─── Seal ──────────────────────────────────────────────────────────────── */
function Seal({ before, after, valves, feeling, situation, messyTried, onDone }) {
  const stamp = feeling
    ? `I felt the anger, found the ${feeling.toLowerCase()} under it, said the clean thing, and chose my next move.`
    : "I felt the pressure and released it clean — no swamp damage.";
  const insight = messyTried.length
    ? "You tried bottling and blowing first — and felt the meters spike. That's the lesson living in your body now."
    : "You went straight for the valve. The swamp's running clear.";
  return (
    <div className="sv-center">
      <div style={{ position: "relative" }}>
        <Boggo state="relieved" size={140} />
        <Fireflies />
      </div>
      <Eyebrow>Released safely — no swamp damage</Eyebrow>
      <Heading>The valve held.</Heading>

      <div className="sv-seal__stats">
        <div className="sv-seal__stat sv-seal__stat--before"><span>Before</span><b>{before}</b></div>
        <div className="sv-seal__arrow">→</div>
        <div className="sv-seal__stat sv-seal__stat--after"><span>After</span><b>{after}</b></div>
      </div>

      {valves.length > 0 && (
        <p className="sv-lead" style={{ textAlign: "center" }}>
          Valve combo: <b>{valves.join(" + ")}</b>
        </p>
      )}

      <div className="sv-stamp"><span>Your stamp</span><p>{stamp}</p></div>
      <BoggoSays state="relieved" line={boggoLine("win", (situation || "x").length)} />
      <p className="sv-science" style={{ borderColor: "var(--brand-green)" }}><span>WHAT JUST HAPPENED</span>{insight}</p>

      <Primary onClick={onDone}>Save &amp; close ✦</Primary>
    </div>
  );
}
