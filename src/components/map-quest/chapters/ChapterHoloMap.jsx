import React, { useState } from "react";
import {
  ChapterFrame, Cinematic, Btn, taStyle, C, hexA, mono, serif, echo,
  PhoenixSeal, HeroSprite, MentorSprite, Starfield, fsWrap,
} from "../kit.jsx";

/* =============================================================================
   CHAPTER 4 — THE HOLO-MAP  ·  the Business mentor (intro)  (key: ch04-the-holo-map)
   Coelho beat: Urim & Thummim (tools for discernment) + the wineseller's-son
   parable (the one talked out of his Legend, who settled).
   Jon's testimony (T): Dean Marshall's 4 Cash-Flow Quadrants (E/S/B/I) — seeing,
   for the first time, the MAP of how money actually moves.
   Lesson: vision precedes action; you can't navigate terrain you can't see. Use
   tools, but make your own decisions.
   Exercise: Future Vision Journal → futureSelfVision (reused at Ch19).
   See alchemist/07_CHAPTER_DOSSIER.md (Ch4).
   ============================================================================= */

const BIZ = C.gold;
const SCENE_BG = `radial-gradient(900px 700px at 50% 12%, ${hexA(BIZ, 0.16)}, transparent), ${C.black}`;

const heroNode = (size = 100) => <HeroSprite size={size} glow={C.cyan} />;
const bizNode = (size = 120) => <MentorSprite size={size} color={BIZ} />;

/* the four cash-flow quadrants as glowing districts */
function QuadrantMap({ size = 200 }) {
  const cells = [
    { x: 6, y: 6, k: "E", label: "EMPLOYEE", note: "trade time", col: C.textDim },
    { x: 6, y: 56, k: "S", label: "SELF-EMP", note: "own a job", col: C.amber },
    { x: 56, y: 6, k: "B", label: "BUSINESS", note: "own systems", col: C.mint },
    { x: 56, y: 56, k: "I", label: "INVESTOR", note: "money works", col: C.cyan },
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: `drop-shadow(0 0 14px ${hexA(BIZ, .45)})` }}>
      <line x1="50" y1="2" x2="50" y2="98" stroke={hexA(BIZ, .5)} strokeWidth="1" />
      <line x1="2" y1="50" x2="98" y2="50" stroke={hexA(BIZ, .5)} strokeWidth="1" />
      {cells.map((c) => (
        <g key={c.k}>
          <rect x={c.x} y={c.y} width="38" height="38" rx="3" fill={hexA(c.col, .1)} stroke={hexA(c.col, .55)} strokeWidth="1">
            <animate attributeName="opacity" values=".55;1;.55" dur="3s" begin={`${c.x / 40}s`} repeatCount="indefinite" />
          </rect>
          <text x={c.x + 19} y={c.y + 19} textAnchor="middle" fontSize="13" fontFamily="monospace" fontWeight="700" fill={c.col}>{c.k}</text>
          <text x={c.x + 19} y={c.y + 30} textAnchor="middle" fontSize="4.4" fontFamily="monospace" fill={hexA(c.col, .85)}>{c.label}</text>
        </g>
      ))}
    </svg>
  );
}

const INTRO = [
  {
    id: "lightup", mood: BIZ, backdrop: "starfield", kicker: "CHAPTER 4 · THE HOLO-MAP",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "biz", node: bizNode(122), label: "THE BUSINESS MENTOR", labelColor: BIZ },
    ],
    lines: [
      "Deeper in, a second mentor waits — gold light at his fingertips. He doesn't sell you anything. He turns on a map.",
      "\"You've been grinding in the dark,\" he says. \"Let me show you the terrain. You can't navigate a city you can't see.\"",
    ],
    speaker: BIZ, cta: "Show me the map →",
  },
  {
    id: "quadrants", mood: BIZ, backdrop: "starfield", stageH: 250,
    cast: [{ id: "map", node: <QuadrantMap size={210} />, label: "HOW MONEY MOVES", labelColor: BIZ }],
    lines: [
      "Four glowing districts light up. \"Everyone lives in one of these. On the left — Employee and Self-employed — you trade your hours for coins. The clock owns you.\"",
      "\"On the right — Business and Investor — you own the systems. Money moves while you sleep. Same city. Most people never even learn the right side exists.\"",
    ],
    speaker: BIZ, cta: "Why doesn't everyone cross? →",
  },
  {
    id: "parable", mood: C.danger, backdrop: "starfield",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "biz", node: bizNode(118), label: "THE BUSINESS MENTOR", labelColor: BIZ },
    ],
    lines: [
      "\"There was a man's son who set out for the right side once. Smart. Hungry. Then a wineseller offered him a steady wage and a warm room.\"",
      "\"He took it. Told himself it was just for now. Years later he was respected, comfortable, and quietly done. The map was still in his pocket. He just stopped reading it.\"",
      "\"The tools point. They don't choose. So — let's make you read your own map before someone talks you off it.\"",
    ],
    speaker: C.danger, cta: "Open the vision journal →",
  },
];

const PROMPTS = [
  { key: "futureSelfVision", label: "FUTURE VISION JOURNAL · A DAY ARRIVED", accent: BIZ,
    prompt: "Design from the future, not the past. Write a day in the life of your arrived self — where do you wake, what do you do, where does the money come from while you live it?" },
  { key: "quadrant", label: "YOUR QUADRANT · THE FIRST ASSET", accent: C.mint,
    prompt: "Which side are you building toward — owning systems, owning your time? Name the first asset you'll build that earns without your hours." },
];

export default function ChapterHoloMap({ onComplete, quest }) {
  const [phase, setPhase] = useState("intro");
  const [step, setStep] = useState(0);
  const [vals, setVals] = useState({ futureSelfVision: "", quadrant: "" });
  const set = (k) => (e) => setVals((v) => ({ ...v, [k]: e.target.value }));

  if (phase === "intro") {
    return (
      <ChapterFrame>
        <Cinematic shots={INTRO} accent={BIZ} onDone={() => setPhase("exercise")} />
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
          <Starfield mood={BIZ} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", paddingTop: "5vh", height: 188 }}>
            <QuadrantMap size={150} />
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ fontSize: 10, ...mono, color: cur.accent, marginBottom: 8 }}>{cur.label} · {step + 1}/{PROMPTS.length}</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.5, color: C.text, marginBottom: 12 }}>{cur.prompt}</p>
            <textarea value={val} onChange={set(cur.key)} placeholder="Write your truth…" style={taStyle(cur.accent)} />
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <Btn accent={BIZ} disabled={!val.trim()} onClick={advance}>{step < PROMPTS.length - 1 ? "Next →" : "Chart it →"}</Btn>
            </div>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  if (phase === "mirror") {
    // TODO: askMentor() — scripted reflection now; live coaching call later.
    return (
      <ChapterFrame>
        <div style={fsWrap(SCENE_BG)}>
          <Starfield mood={BIZ} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, paddingTop: "6vh", height: 176 }}>
            {heroNode(94)}{bizNode(108)}
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ textAlign: "center", fontSize: 11, letterSpacing: 3, color: BIZ, ...mono, marginBottom: 10 }}>THE MAP IS YOURS NOW</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 10 }}>
              "There it is. A day where you wake into <span style={{ color: BIZ }}>{echo(vals.futureSelfVision, "a life you actually designed")}</span>."
            </p>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 14 }}>
              "And the first thing you build that earns without your hours: <span style={{ color: C.mint }}>{echo(vals.quadrant, "your own system")}</span>. Now you're navigating — not drifting."
            </p>
            <Btn full accent={BIZ} onClick={() => setPhase("seal")}>Pocket the map →</Btn>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  // seal
  const finish = () => {
    quest?.updateDashboard?.({ stage: "Threshold", purpose: 6, faith: 6, fear: 4, courage: 6, trust: 6 });
    onComplete?.({ futureSelfVision: vals.futureSelfVision.trim(), quadrant: vals.quadrant.trim(), mentor: "business" });
  };
  return (
    <ChapterFrame>
      <div style={fsWrap(`radial-gradient(800px 700px at 50% 30%, ${hexA(BIZ, 0.2)}, ${C.night} 60%, ${C.black})`)}>
        <Starfield mood={BIZ} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 460, margin: "0 auto", padding: "13vh 22px 50px", textAlign: "center" }}>
          <PhoenixSeal color={BIZ} label="THE MAP · READ" />
          <p style={{ ...serif, fontStyle: "italic", fontSize: 16, color: C.text, margin: "14px 0 18px" }}>
            You can see the terrain now. The grind has a direction. The only thing left between you and the right side of the map is a decision.
          </p>
          <Btn full accent={C.magenta} onClick={finish}>Toward the gate →</Btn>
        </div>
      </div>
    </ChapterFrame>
  );
}
