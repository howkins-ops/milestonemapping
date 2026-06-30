import React, { useState } from "react";
import {
  ChapterFrame, Cinematic, Btn, taStyle, C, hexA, mono, serif, echo,
  PhoenixSeal, HeroSprite, MentorSprite, Starfield, fsWrap,
} from "../kit.jsx";

/* =============================================================================
   CHAPTER 3 — THE FIXER  ·  the Anchor mentor  (key: ch03-the-fixer)
   Coelho beat: Melchizedek names the Personal Legend and the "world's greatest
   lie" — that at some point you lost control of what happens to you.
   Jon's testimony (T): reconnecting with Dad at 23 — the unconditional Anchor:
   "you're loved and I'm proud of you, regardless of results." The boat-without-
   an-anchor image. An Anchor steadies your IDENTITY, not your tactics.
   Exercise: Futurability Check → futureSelf (+ the price you'd pay).
   See alchemist/07_CHAPTER_DOSSIER.md (Ch3).
   ============================================================================= */

const ANCHOR = C.cyan;
const SCENE_BG = `radial-gradient(900px 700px at 50% 12%, ${hexA(ANCHOR, 0.16)}, transparent), ${C.black}`;

const heroNode = (size = 100) => <HeroSprite size={size} glow={C.cyan} />;
const anchorNode = (size = 120) => <MentorSprite size={size} color={ANCHOR} />;

const INTRO = [
  {
    id: "den", mood: ANCHOR, backdrop: "starfield", kicker: "CHAPTER 3 · THE FIXER",
    cast: [{ id: "hero", node: heroNode(116), label: "YOU" }],
    lines: [
      "You follow the signal to a back-alley data-den, half-lit, wires breathing in the walls.",
      "A figure waits in the low light. He doesn't ask your name. He's already reading you — the set of your shoulders, the thing you came to ask before you ask it.",
    ],
    speaker: C.text, cta: "Sit down →",
  },
  {
    id: "anchor", mood: ANCHOR, backdrop: "starfield",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "fixer", node: anchorNode(122), label: "THE ANCHOR", labelColor: ANCHOR },
    ],
    lines: [
      "\"I've known you a long time,\" he says — and somehow it's true. \"Long before you had anything to prove.\"",
      "\"I found my own anchor late. Twenty-three years old, I sat back down across from the man who raised me. And he said the thing I'd waited my whole life to hear:\"",
      "\"'You're loved. I'm proud of you. Regardless of results.' No conditions. That sentence rebuilt me from the floor up.\"",
    ],
    speaker: ANCHOR, cta: "What did it change? →",
  },
  {
    id: "lie", mood: ANCHOR, backdrop: "starfield",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "fixer", node: anchorNode(122), label: "THE ANCHOR", labelColor: ANCHOR },
    ],
    lines: [
      "\"Out here you're a boat. The sea doesn't care where you're going. Without an anchor you drift — and call the drifting freedom.\"",
      "\"And there's a lie running this whole city. The world's greatest lie: that somewhere along the way you lost control of what happens to you. You didn't.\"",
      "\"An anchor doesn't fix your tactics. It steadies who you ARE — so the storms can't rewrite you. Everyone needs one person like that. Not from your industry. From your life.\"",
    ],
    speaker: ANCHOR, cta: "He leans in →",
  },
  {
    id: "cost", mood: ANCHOR, backdrop: "embers",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "fixer", node: anchorNode(122), label: "THE ANCHOR", labelColor: ANCHOR },
    ],
    lines: [
      "\"A real mentor names the path — and then names the price. Wisdom that never asks you to sacrifice anything is just a bedtime story.\"",
      "\"So before I steady you, I want to meet who you're trying to become. And I want to know what it'll cost you to get there.\"",
    ],
    speaker: ANCHOR, cta: "Run the futurability check →",
  },
];

const PROMPTS = [
  { key: "futureSelf", label: "FUTURABILITY · THE ONE WHO CROSSED", accent: ANCHOR,
    prompt: "Picture the you who has already crossed — arrived, transformed. Describe that future self. Who have they become?" },
  { key: "theCost", label: "THE PRICE · THE FLOCK YOU SELL", accent: C.gold,
    prompt: "Every crossing costs something. What 'flock' — what comfort, what old version of you — would you have to sell to become them?" },
];

export default function ChapterFixer({ onComplete, quest }) {
  const [phase, setPhase] = useState("intro");
  const [step, setStep] = useState(0);
  const [vals, setVals] = useState({ futureSelf: "", theCost: "" });
  const set = (k) => (e) => setVals((v) => ({ ...v, [k]: e.target.value }));

  if (phase === "intro") {
    return (
      <ChapterFrame>
        <Cinematic shots={INTRO} accent={ANCHOR} onDone={() => setPhase("exercise")} />
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
          <Starfield mood={ANCHOR} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, paddingTop: "6vh", height: 176 }}>
            {heroNode(94)}{anchorNode(108)}
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ fontSize: 10, ...mono, color: cur.accent, marginBottom: 8 }}>{cur.label} · {step + 1}/{PROMPTS.length}</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.5, color: C.text, marginBottom: 12 }}>{cur.prompt}</p>
            <textarea value={val} onChange={set(cur.key)} placeholder="Write your truth…" style={taStyle(cur.accent)} />
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <Btn accent={ANCHOR} disabled={!val.trim()} onClick={advance}>{step < PROMPTS.length - 1 ? "Next →" : "Show him →"}</Btn>
            </div>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  if (phase === "mirror") {
    // Scripted mentor reflection (answer-fill). The Anchor steadies identity, not tactics.
    // TODO: askMentor() — swap this scripted reply for a live coaching call
    // (Netlify function netlify/functions/ask-mentor.js, model claude-sonnet-4-6).
    // Never embed an API key in client code.
    return (
      <ChapterFrame>
        <div style={fsWrap(SCENE_BG)}>
          <Starfield mood={ANCHOR} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, paddingTop: "6vh", height: 176 }}>
            {heroNode(94)}{anchorNode(108)}
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ textAlign: "center", fontSize: 11, letterSpacing: 3, color: ANCHOR, ...mono, marginBottom: 10 }}>THE ANCHOR HOLDS</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 10 }}>
              "So the one you're becoming is <span style={{ color: ANCHOR }}>{echo(vals.futureSelf, "someone who finally trusts their own course")}</span>."
            </p>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 14 }}>
              "And the price is letting go of <span style={{ color: C.gold }}>{echo(vals.theCost, "the comfort you've been hiding inside")}</span>. Good. That's not a loss. That's the anchor coming up so you can finally move."
            </p>
            <div style={{ padding: "12px 14px", borderRadius: 12, background: hexA(ANCHOR, 0.06), border: `1px solid ${hexA(ANCHOR, 0.3)}`, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: C.textDim, fontStyle: "italic", margin: 0 }}>
                "I can't sail this for you. But I'll steady who you are while you learn how. When you can't tell drift from direction — come back to this."
              </p>
            </div>
            <Btn full accent={ANCHOR} onClick={() => setPhase("seal")}>Take the anchor →</Btn>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  // seal
  const finish = () => {
    quest?.updateDashboard?.({ stage: "Mentor / Threshold", purpose: 6, faith: 6, fear: 5, courage: 6, trust: 5 });
    onComplete?.({ futureSelf: vals.futureSelf.trim(), theCost: vals.theCost.trim(), mentor: "anchor" });
  };
  return (
    <ChapterFrame>
      <div style={fsWrap(`radial-gradient(800px 700px at 50% 30%, ${hexA(ANCHOR, 0.2)}, ${C.night} 60%, ${C.black})`)}>
        <Starfield mood={ANCHOR} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 460, margin: "0 auto", padding: "13vh 22px 50px", textAlign: "center" }}>
          <PhoenixSeal color={ANCHOR} label="ANCHOR · MENTOR EARNED" />
          <p style={{ ...serif, fontStyle: "italic", fontSize: 16, color: C.text, margin: "14px 0 18px" }}>
            You leave the den steadier than you came in. Not fixed — anchored. The lie has a name now, and so does the one you're becoming.
          </p>
          <Btn full accent={C.magenta} onClick={finish}>Carry the anchor on →</Btn>
        </div>
      </div>
    </ChapterFrame>
  );
}
