import React, { useState } from "react";
import {
  ChapterFrame, Cinematic, Btn, taStyle, C, hexA, mono, serif, echo,
  PhoenixSeal, HeroSprite, MentorSprite, Starfield, Embers, fsWrap,
} from "../kit.jsx";

/* =============================================================================
   CHAPTER 1 — THE SEND-OFF  (key: chapter-anchor)
   Coelho beat: the recurring dream + the father's reluctant blessing. The call
   arrives as a disturbance, not a plan.
   Jon's testimony (T): Dad's "look out for #1" send-off after the divorce —
   armor that became a wound. The deeper why: never be powerless about money
   again; outgrow the survival code you were handed.
   Exercise: Create Your Why → captures whyILeft + seeds the Day-One Snapshot
   (whoIAmNow, biggestFear), mirrored at Ch19 (The Vault).
   Reworked onto the shared cinematic kit. See alchemist/07_CHAPTER_DOSSIER.md.
   ============================================================================= */

const SCENE_BG = `radial-gradient(900px 700px at 50% 12%, ${hexA(C.amber, 0.16)}, transparent), ${C.black}`;
const FATHER = C.amber;

const INTRO = [
  {
    id: "narcissus", mood: C.cyan, backdrop: "starfield", kicker: "CHAPTER 1 · THE SEND-OFF",
    cast: [{ id: "hero", node: <HeroSprite size={120} glow={C.cyan} />, label: "YOU" }],
    lines: [
      "They tell an old story about a boy who knelt at a still lake to admire himself — and never noticed the water was admiring him back.",
      "Every search, it turns out, is also a mirror. Hold onto that. The whole road ahead is going to keep showing you yourself.",
    ],
    speaker: C.cyan, cta: "The dream returns →",
  },
  {
    id: "dream", mood: C.phoenix, backdrop: "starfield",
    cast: [{ id: "hero", node: <HeroSprite size={118} glow={C.cyan} /> }],
    lines: [
      "It's late. The city hums its one flat note — wake, work, sleep, repeat — and you're still awake inside it.",
      "The dream comes again, the way it always does: a vault behind the city, your name burned into the door, a number underneath you can never quite read.",
      "You wake wanting something you can't name yet. You keep circling back to it. That circling is the call.",
    ],
    speaker: C.text, cta: "One light is still on →",
  },
  {
    id: "father", mood: FATHER, backdrop: "starfield",
    cast: [
      { id: "hero", node: <HeroSprite size={100} glow={C.cyan} />, label: "YOU" },
      { id: "dad", node: <MentorSprite size={120} color={FATHER} />, label: "YOUR FATHER", labelColor: FATHER },
    ],
    lines: [
      "Before any traveler leaves, he goes to see the one who knows him best. The old man's window is lit — it always is, when you're about to do something big.",
      "\"So. You're really going.\" He doesn't look up right away. \"I went once too. Came back with scars and a map nobody else could read.\"",
    ],
    speaker: FATHER, cta: "He has something to hand you →",
  },
  {
    id: "code", mood: FATHER, backdrop: "embers",
    cast: [
      { id: "hero", node: <HeroSprite size={100} glow={C.cyan} />, label: "YOU" },
      { id: "dad", node: <MentorSprite size={120} color={FATHER} />, label: "YOUR FATHER", labelColor: FATHER },
    ],
    lines: [
      "\"Let me give you the one thing my father gave me,\" he says. \"Look out for number one. Trust the money in your hand — never the promise in someone's mouth.\"",
      "It kept him alive through the lean years. It's armor. But you can already feel where the armor turned into a wound — the money-fights through the wall, the fear that never quite left the house.",
      "\"It got me through,\" he admits. \"Maybe you're meant to carry it further than I could. But first — you have to know why you're walking out that door. Not the what. The why.\"",
    ],
    speaker: FATHER, cta: "Tell him why →",
  },
];

const PROMPTS = [
  { key: "whyILeft", label: "WHY YOU'RE LEAVING", accent: C.amber,
    prompt: "Forget the goal for a second. Why are you really walking out the door — what can you no longer stay for?" },
  { key: "whoIAmNow", label: "WHO YOU ARE TODAY", accent: C.cyan,
    prompt: "Before the road changes you, say it plainly: who are you right now, the day you set out?" },
  { key: "biggestFear", label: "THE FEAR YOU CARRY", accent: C.danger,
    prompt: "Every traveler packs one fear they don't admit to. What's yours, walking into the dark?" },
];

export default function ChapterAnchor({ onComplete, quest }) {
  const [phase, setPhase] = useState("intro");
  const [step, setStep] = useState(0);
  const [vals, setVals] = useState({ whyILeft: "", whoIAmNow: "", biggestFear: "" });
  const set = (k) => (e) => setVals((v) => ({ ...v, [k]: e.target.value }));

  if (phase === "intro") {
    return (
      <ChapterFrame>
        <Cinematic shots={INTRO} accent={C.amber} onDone={() => setPhase("exercise")} />
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
          <Starfield mood={C.amber} />
          <Embers on color={C.amber} count={8} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, paddingTop: "6vh", height: 188 }}>
            <HeroSprite size={96} glow={C.cyan} />
            <MentorSprite size={112} color={FATHER} />
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ fontSize: 10, ...mono, color: cur.accent, marginBottom: 8 }}>CREATE YOUR WHY · {cur.label} · {step + 1}/{PROMPTS.length}</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.5, color: C.text, marginBottom: 12 }}>{cur.prompt}</p>
            <textarea value={val} onChange={set(cur.key)} placeholder="Write your truth…" style={taStyle(cur.accent)} />
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <Btn accent={C.amber} disabled={!val.trim()} onClick={advance}>{step < PROMPTS.length - 1 ? "Next →" : "Hand it to him →"}</Btn>
            </div>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  if (phase === "mirror") {
    return (
      <ChapterFrame>
        <div style={fsWrap(SCENE_BG)}>
          <Starfield mood={C.amber} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, paddingTop: "6vh", height: 176 }}>
            <HeroSprite size={96} glow={C.cyan} />
            <MentorSprite size={108} color={FATHER} />
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ textAlign: "center", fontSize: 11, letterSpacing: 3, color: C.amber, ...mono, marginBottom: 10 }}>HE READS IT BACK</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 10 }}>
              "So you're not leaving for the money. You're leaving because <span style={{ color: C.amber }}>{echo(vals.whyILeft, "you can't stay where you are")}</span>."
            </p>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 10 }}>
              "The day you set out, you are <span style={{ color: C.cyan }}>{echo(vals.whoIAmNow, "someone who's done waiting")}</span> — carrying a fear of <span style={{ color: C.danger }}>{echo(vals.biggestFear, "ending up exactly where you started")}</span>."
            </p>
            <div style={{ padding: "12px 14px", borderRadius: 12, background: hexA(C.amber, 0.06), border: `1px solid ${hexA(C.amber, 0.3)}`, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: C.textDim, fontStyle: "italic", margin: 0 }}>
                He taps your chest, over the why. "Then go. And when the road gets loud — come back to this. It'll always tell you true. The Vault at the end of the road opens onto this exact moment."
              </p>
            </div>
            <Btn full accent={C.amber} onClick={() => setPhase("seal")}>Step toward the door →</Btn>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  // seal
  const finish = () => {
    quest?.setDayOneSnapshot?.({ whoIAmNow: vals.whoIAmNow.trim(), biggestFear: vals.biggestFear.trim() });
    quest?.updateDashboard?.({ stage: "Ordinary World", purpose: 3, faith: 4, fear: 3, courage: 4, trust: 4 });
    onComplete?.({ whyILeft: vals.whyILeft.trim(), whoIAmNow: vals.whoIAmNow.trim(), biggestFear: vals.biggestFear.trim() });
  };
  return (
    <ChapterFrame>
      <div style={fsWrap(`radial-gradient(800px 700px at 50% 30%, ${hexA(C.phoenix, 0.2)}, ${C.night} 60%, ${C.black})`)}>
        <Starfield mood={C.phoenix} />
        <Embers on color={C.amber} count={10} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 460, margin: "0 auto", padding: "13vh 22px 50px", textAlign: "center" }}>
          <PhoenixSeal color={C.amber} label="WHY NAMED" />
          <p style={{ ...serif, fontStyle: "italic", fontSize: 16, color: C.text, margin: "14px 0 18px" }}>
            The why is lit and the door is open. Whatever waits out there — you're not walking in empty.
          </p>
          <Btn full accent={C.magenta} onClick={finish}>Cross the threshold →</Btn>
          <p style={{ fontSize: 10, color: C.locked, ...mono, marginTop: 22, lineHeight: 1.5 }}>
            Inspired by the spirit of Paulo Coelho's <i>The Alchemist</i>.
          </p>
        </div>
      </div>
    </ChapterFrame>
  );
}
