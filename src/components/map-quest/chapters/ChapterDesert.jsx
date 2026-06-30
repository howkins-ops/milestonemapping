import React, { useState } from "react";
import {
  ChapterFrame, Cinematic, Btn, taStyle, C, hexA, mono, serif, echo,
  PhoenixSeal, HeroSprite, Starfield, Embers, Row, fsWrap,
} from "../kit.jsx";

/* =============================================================================
   CHAPTER 10 — THE DEAD-SERVER DESERT  ·  Jon's testimony  (key: ch10-the-desert)
   Coelho beat: The desert crossing — the long, monotonous middle won by
   presence and patience.
   Jon's testimony (T): the 10,000-hour rule / Picasso's napkin ("it took me my
   whole life") / Eric Thomas's "how bad do you want it"; his longest dry streak —
   8+ days, ~96 doors a day, no sale — the iceberg of confidence chiseled by
   rejection. Lesson: patience is the desert; mastery is years not days;
   consistency beats intensity; fall in love with the reps; "it's not a race."
   Identity shift: sprinter → marathoner.
   Exercise: Time Integrity Reset → wastingTimeOn, oneConsistentAct.
   See alchemist/07_CHAPTER_DOSSIER.md (Ch10).
   ============================================================================= */

const DESERT = C.amber;
const SCENE_BG = `radial-gradient(900px 700px at 50% 12%, ${hexA(DESERT, 0.16)}, transparent), ${C.black}`;

const heroNode = (size = 100) => <HeroSprite size={size} glow={C.cyan} />;

/* tiny in-file flourish: a dead-server clock face with no hands, drifting.
   Pure SVG, no external deps — build-safe. */
function DeadClock({ size = 96, color = DESERT, delay = 0 }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 100 100"
      style={{ filter:`drop-shadow(0 0 10px ${hexA(color,.5)})`, animation:`sIdle ${4.2}s ease-in-out ${delay}s infinite`, opacity:.92 }}
    >
      {/* dead-server stack behind the clock */}
      <rect x="26" y="70" width="48" height="9" rx="2" fill={hexA("#0a0c14",.95)} stroke={hexA(color,.35)} strokeWidth="1" />
      <rect x="26" y="82" width="48" height="9" rx="2" fill={hexA("#0a0c14",.95)} stroke={hexA(color,.25)} strokeWidth="1" />
      <circle cx="32" cy="74.5" r="1.4" fill={hexA(C.danger,.7)} />
      <circle cx="32" cy="86.5" r="1.4" fill={hexA(color,.25)} />
      {/* the broken clock — a face, no hands */}
      <circle cx="50" cy="40" r="28" fill={hexA("#06060f",.9)} stroke={hexA(color,.6)} strokeWidth="1.6" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const x1 = 50 + Math.sin(a) * 24, y1 = 40 - Math.cos(a) * 24;
        const x2 = 50 + Math.sin(a) * 27, y2 = 40 - Math.cos(a) * 27;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={hexA(color, i % 3 === 0 ? .7 : .3)} strokeWidth="1.4" />;
      })}
      {/* no hands — just a dead pin where time should turn */}
      <circle cx="50" cy="40" r="2.6" fill={hexA(color,.5)} />
    </svg>
  );
}
const clockField = () => (
  <div style={{ display:"flex", alignItems:"flex-end", gap:6 }}>
    <DeadClock size={64} color={DESERT} delay={0} />
    <DeadClock size={104} color={C.gold} delay={.6} />
    <DeadClock size={72} color={DESERT} delay={1.1} />
  </div>
);

const INTRO = [
  {
    id: "wasteland", mood: DESERT, backdrop: "starfield", kicker: "CHAPTER 10 · THE DEAD-SERVER DESERT",
    cast: [{ id: "clocks", node: clockField() }],
    lines: [
      "The signal goes flat. The city behind you thins to nothing, and ahead — a desert of dead servers, racks half-buried in dust, fans long stopped.",
      "Broken clocks rise from the sand like headstones. No hands on any of them. Time is everywhere out here, and nowhere. You could be one day in, or one year.",
    ],
    speaker: C.text, cta: "Step onto the sand →",
  },
  {
    id: "temptation", mood: DESERT, backdrop: "starfield",
    cast: [{ id: "hero", node: heroNode(112), label: "YOU" }],
    lines: [
      "Nothing here is glamorous. No crowd, no milestone, no proof you're getting closer. Just the same horizon every morning.",
      "And so the two voices start. One says: rush — sprint the crossing, force the arrival, do a year in a week. The other says: quit — this is the unglamorous middle, and no one would even notice if you turned back.",
      "Both voices are the desert testing you. Both are lying.",
    ],
    speaker: DESERT, cta: "Then a voice you trust →",
  },
  {
    id: "patience", mood: DESERT, backdrop: "embers",
    cast: [{ id: "hero", node: heroNode(104), label: "YOU" }],
    lines: [
      "\"Ten thousand hours,\" the Alchemist says, walking beside you in the heat. \"Mastery was never days. It's years. Picasso sketched a napkin in thirty seconds — then told the man the price: 'it took me my whole life.'\"",
      "\"My longest dry streak out here was eight days. Ninety-six doors a day. Not one sale. And every door slammed in my face was a chisel — carving an iceberg of confidence under the water no one ever sees.\"",
      "\"Eric Thomas asks the only real question: how bad do you want it? Bad enough to fall in love with the reps? Because out here, consistency beats intensity. Every single time.\"",
      "\"It's not a race. The sprinter dies in the desert. The marathoner crosses it. That's the whole secret.\"",
    ],
    speaker: C.gold, cta: "He stops walking →",
  },
  {
    id: "crossing", mood: DESERT, backdrop: "embers",
    cast: [{ id: "hero", node: heroNode(112), label: "YOU" }],
    lines: [
      "\"But the desert doesn't reward effort,\" he says. \"It rewards integrity with time. So before you take another step — be honest about where your hours actually go.\"",
      "\"Two questions. Where is your time leaking — the thing that feels productive but moves nothing? And what is the one act you'll do every day to cross? Small enough to keep. Too important to skip.\"",
    ],
    speaker: C.gold, cta: "Run the Time Integrity Reset →",
  },
];

const PROMPTS = [
  { key: "wastingTimeOn", label: "THE LEAK · WHERE TIME DIES", accent: DESERT,
    prompt: "Where is your time actually leaking — the thing that feels productive but isn't moving the quest?" },
  { key: "oneConsistentAct", label: "THE CROSSING ACT · ONE, DAILY", accent: C.gold,
    prompt: "Pick ONE act you'll do every day for the crossing — small, repeatable, non-negotiable." },
];

export default function ChapterDesert({ onComplete, quest }) {
  const [phase, setPhase] = useState("intro");
  const [step, setStep] = useState(0);
  const [vals, setVals] = useState({ wastingTimeOn: "", oneConsistentAct: "" });
  const set = (k) => (e) => setVals((v) => ({ ...v, [k]: e.target.value }));

  if (phase === "intro") {
    return (
      <ChapterFrame>
        <Cinematic shots={INTRO} accent={DESERT} onDone={() => setPhase("exercise")} />
      </ChapterFrame>
    );
  }

  if (phase === "exercise") {
    const cur = PROMPTS[step];
    const val = vals[cur.key];
    const advance = () => (step < PROMPTS.length - 1 ? setStep(step + 1) : setPhase("mirror"));
    return (
      <ChapterFrame>
        <div style={fsWrap(SCENE_BG)}>
          <Starfield mood={DESERT} />
          <Embers color={C.gold} count={10} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 14, paddingTop: "6vh", height: 184 }}>
            {heroNode(96)}<DeadClock size={88} color={C.gold} />
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ fontSize: 10, ...mono, color: cur.accent, marginBottom: 8 }}>{cur.label} · {step + 1}/{PROMPTS.length}</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.5, color: C.text, marginBottom: 12 }}>{cur.prompt}</p>
            <textarea value={val} onChange={set(cur.key)} placeholder="Write your truth…" style={taStyle(cur.accent)} />
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <Btn accent={DESERT} disabled={!val.trim()} onClick={advance}>{step < PROMPTS.length - 1 ? "Next →" : "Cross →"}</Btn>
            </div>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  if (phase === "mirror") {
    // Scripted mentor reflection (answer-fill). Patience is the desert; consistency beats intensity.
    // TODO: askMentor() — swap this scripted reply for a live coaching call
    // (Netlify function netlify/functions/ask-mentor.js, model claude-sonnet-4-6).
    // Never embed an API key in client code.
    return (
      <ChapterFrame>
        <div style={fsWrap(SCENE_BG)}>
          <Starfield mood={DESERT} />
          <Embers color={C.gold} count={10} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 14, paddingTop: "6vh", height: 184 }}>
            {heroNode(96)}<DeadClock size={88} color={C.gold} />
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ textAlign: "center", fontSize: 11, letterSpacing: 3, color: DESERT, ...mono, marginBottom: 10 }}>THE DESERT ANSWERS</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 10 }}>
              "So the time leaking out of you is <span style={{ color: DESERT }}>{echo(vals.wastingTimeOn, "busywork that feels like motion but isn't direction")}</span>. Name it and it loses its disguise. That hour is yours to take back."
            </p>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 14 }}>
              "And the act that carries you across is <span style={{ color: C.gold }}>{echo(vals.oneConsistentAct, "one small rep, done daily, no matter the mood")}</span>. Don't make it bigger. Make it unbreakable. Do that on the worst day and the desert is already behind you."
            </p>
            <div style={{ marginBottom: 14, padding: "8px 0 2px" }}>
              <Row label="The leak" value={echo(vals.wastingTimeOn, "named — and reclaimable")} accent={DESERT} />
              <Row label="The crossing act" value={echo(vals.oneConsistentAct, "one rep, every day")} accent={C.gold} />
              <Row label="The shift" value="Sprinter → Marathoner" accent={C.mint} />
            </div>
            <div style={{ padding: "12px 14px", borderRadius: 12, background: hexA(DESERT, 0.06), border: `1px solid ${hexA(DESERT, 0.3)}`, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: C.textDim, fontStyle: "italic", margin: 0 }}>
                "Eight days. Ninety-six doors. No sale. I didn't quit and I didn't sprint — I just kept knocking. Fall in love with the reps. It's not a race."
              </p>
            </div>
            <Btn full accent={DESERT} onClick={() => setPhase("seal")}>Walk on →</Btn>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  // seal
  const finish = () => {
    quest?.updateDashboard?.({ stage: "Tests · The Long Road", purpose: 7, faith: 7, fear: 5, courage: 7, trust: 7 });
    onComplete?.({ wastingTimeOn: vals.wastingTimeOn.trim(), oneConsistentAct: vals.oneConsistentAct.trim() });
  };
  return (
    <ChapterFrame>
      <div style={fsWrap(`radial-gradient(800px 700px at 50% 30%, ${hexA(DESERT, 0.2)}, ${C.night} 60%, ${C.black})`)}>
        <Starfield mood={DESERT} />
        <Embers color={C.gold} count={12} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 460, margin: "0 auto", padding: "13vh 22px 50px", textAlign: "center" }}>
          <PhoenixSeal color={DESERT} label="DESERT · CROSSED BY PATIENCE" />
          <p style={{ ...serif, fontStyle: "italic", fontSize: 16, color: C.text, margin: "14px 0 18px" }}>
            The broken clocks fall behind you. You stopped racing the time you couldn't read and started keeping the one promise you could. Not faster — steadier. That's how the desert is crossed.
          </p>
          <Btn full accent={C.magenta} onClick={finish}>Carry the patience on →</Btn>
        </div>
      </div>
    </ChapterFrame>
  );
}
