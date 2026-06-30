import React, { useState } from "react";
import {
  ChapterFrame, Cinematic, Btn, taStyle, C, hexA, mono, serif, echo, fsWrap, Row,
  PhoenixSeal, HeroSprite, AlchemistSprite, Starfield, Embers,
} from "../kit.jsx";

/* =============================================================================
   CHAPTER 12 — THE RECURSION  ·  the Alchemist first appears  (key: ch12-the-recursion)
   Coelho beat: acting on truth despite "common sense" — the looping chamber of
   the heart that fears, repeating the Seeker's own pattern back at him.
   Jon's testimony (T): the employee mindset smuggled into self-employment —
   sleeping till 11, watching movies instead of studying; the snowball loop
   (limiting belief → bad attitude → bad behavior → bad results → belief reinforced);
   the "haunted doll" that follows you from house to house no matter where you move.
   Lesson: the recursion is doing the same thing expecting change ("insanity"); the
   break is IDENTITY change, not strategy (James Clear). Adopt the identity that
   makes the new behavior obvious.
   Exercise — Loop Breaker → theLoop, newIdentity.  See alchemist/07_CHAPTER_DOSSIER.md (Ch12).
   ============================================================================= */

const ACCENT = C.phoenix;
const SCENE_BG = `radial-gradient(900px 700px at 50% 12%, ${hexA(ACCENT, 0.16)}, transparent), ${C.black}`;

const heroNode = (size = 100) => <HeroSprite size={size} glow={C.cyan} />;
const alchemistNode = (size = 122) => <AlchemistSprite size={size} />;

const INTRO = [
  {
    id: "chamber", mood: ACCENT, backdrop: "starfield", kicker: "CHAPTER 12 · THE RECURSION",
    cast: [{ id: "hero", node: heroNode(116), label: "YOU" }],
    lines: [
      "The corridor folds you into a circular chamber, and the chamber is already living your life.",
      "On every curved screen: a version of you sleeping till eleven, scrolling, half-watching a movie you've seen before. The room loops it, and loops it, and loops it.",
      "Common sense whispers, \"This is just who you are.\" But somewhere under it, a quieter truth waits to be acted on.",
    ],
    speaker: C.text, cta: "Step into the loop →",
  },
  {
    id: "alchemist", mood: ACCENT, backdrop: "starfield",
    cast: [
      { id: "hero", node: heroNode(96), label: "YOU" },
      { id: "mentor", node: alchemistNode(128), label: "THE ALCHEMIST", labelColor: ACCENT },
    ],
    lines: [
      "A figure steps out of the recursion — not flickering, not looping. Steady. Phoenix-lit, with your own silhouette under the glow.",
      "\"I've been watching you run this,\" the Alchemist says. \"You quit the job, but you carried the employee inside you. New title, same operator.\"",
      "\"This isn't a strategy problem. It's a loop. And a loop has a shape — let me show you yours.\"",
    ],
    speaker: ACCENT, cta: "Show me the shape →",
  },
  {
    id: "testimony", mood: ACCENT, backdrop: "embers",
    cast: [
      { id: "hero", node: heroNode(96), label: "YOU" },
      { id: "mentor", node: alchemistNode(128), label: "THE ALCHEMIST", labelColor: ACCENT },
    ],
    lines: [
      "\"The one who walked this before you smuggled the nine-to-five mindset into his own business. Free on paper. Still clocking out at 11 a.m. in his head.\"",
      "\"Watch the snowball: a belief — 'I'm not built for this' — sours the attitude. The sour attitude rots the behavior. The behavior earns bad results. And the bad results? They prove the belief right. Round and round.\"",
      "\"He thought a new house would fix it. New city, fresh start. But the loop is a haunted doll — you move, you unpack, and it's sitting on the shelf, grinning, waiting. It doesn't live in the house. It lives in who you think you are.\"",
    ],
    speaker: ACCENT, cta: "So how do I burn it? →",
  },
  {
    id: "break", mood: ACCENT, backdrop: "embers",
    cast: [
      { id: "hero", node: heroNode(96), label: "YOU" },
      { id: "mentor", node: alchemistNode(128), label: "THE ALCHEMIST", labelColor: ACCENT },
    ],
    lines: [
      "\"Doing the same thing and expecting a different result — they call that insanity. Changing your tactics inside the same identity just spins the loop faster.\"",
      "\"The break isn't a better plan. It's a different person. Behavior change IS identity change. You don't grind toward the new behavior — you become someone for whom the new behavior is obvious.\"",
      "\"So name the loop you keep running. Then name who you'd have to BE for it to break on its own.\"",
    ],
    speaker: ACCENT, cta: "Run the loop breaker →",
  },
];

const PROMPTS = [
  { key: "theLoop", label: "THE RECURSION · NAME THE LOOP", accent: ACCENT,
    prompt: "Name the loop you keep running — belief → attitude → behavior → result → same belief. Trace one full lap." },
  { key: "newIdentity", label: "THE BREAK · CHOOSE THE IDENTITY", accent: C.cyan,
    prompt: "Who would you have to BE for the new behavior to be obvious? Name that identity — \"I am someone who…\"." },
];

export default function ChapterRecursion({ onComplete, quest }) {
  const [phase, setPhase] = useState("intro");
  const [step, setStep] = useState(0);
  const [vals, setVals] = useState({ theLoop: "", newIdentity: "" });
  const set = (k) => (e) => setVals((v) => ({ ...v, [k]: e.target.value }));

  if (phase === "intro") {
    return (
      <ChapterFrame>
        <Cinematic shots={INTRO} accent={ACCENT} onDone={() => setPhase("exercise")} />
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
          <Starfield mood={ACCENT} />
          <Embers on color={ACCENT} count={10} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, paddingTop: "6vh", height: 184 }}>
            {heroNode(92)}{alchemistNode(116)}
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ fontSize: 10, ...mono, color: cur.accent, marginBottom: 8 }}>{cur.label} · {step + 1}/{PROMPTS.length}</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.5, color: C.text, marginBottom: 12 }}>{cur.prompt}</p>
            <textarea value={val} onChange={set(cur.key)} placeholder="Write your truth…" style={taStyle(cur.accent)} />
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <Btn accent={ACCENT} disabled={!val.trim()} onClick={advance}>{step < PROMPTS.length - 1 ? "Next →" : "Break it →"}</Btn>
            </div>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  if (phase === "mirror") {
    // Scripted mentor reflection (answer-fill). The break is identity, not tactic.
    // TODO: askMentor() — swap this scripted reply for a live coaching call later
    // (server-side function; model claude-sonnet-4-6). NEVER embed an API key in client code.
    return (
      <ChapterFrame>
        <div style={fsWrap(SCENE_BG)}>
          <Starfield mood={ACCENT} />
          <Embers on color={ACCENT} count={10} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, paddingTop: "6vh", height: 184 }}>
            {heroNode(92)}{alchemistNode(116)}
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ textAlign: "center", fontSize: 11, letterSpacing: 3, color: ACCENT, ...mono, marginBottom: 10 }}>THE ALCHEMIST NAMES IT</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 10 }}>
              "So the loop you keep running is <span style={{ color: ACCENT }}>{echo(vals.theLoop, "the same belief feeding the same result, and calling it your nature")}</span>."
            </p>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 14 }}>
              "And the one who breaks it is <span style={{ color: C.cyan }}>{echo(vals.newIdentity, "someone who shows up before they feel ready")}</span>. Don't grind toward that person. Move AS them. The doll has nowhere left to follow."
            </p>
            <div style={{ padding: "12px 14px", borderRadius: 12, background: hexA(ACCENT, 0.06), border: `1px solid ${hexA(ACCENT, 0.3)}`, marginBottom: 14 }}>
              <Row label="The recursion" value={echo(vals.theLoop, "belief → attitude → behavior → result → belief")} accent={ACCENT} />
              <Row label="The break · identity" value={echo(vals.newIdentity, "the one for whom the new behavior is obvious")} accent={C.cyan} />
            </div>
            <p style={{ fontSize: 13, color: C.textDim, fontStyle: "italic", margin: "0 0 16px" }}>
              "Insanity is the same lap expecting a new finish. You don't need a better lap. You need a different runner."
            </p>
            <Btn full accent={ACCENT} onClick={() => setPhase("seal")}>Become the runner →</Btn>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  // seal
  const finish = () => {
    quest?.updateDashboard?.({ stage: "Innermost Cave", purpose: 8, faith: 7, fear: 6, courage: 7, trust: 7 });
    onComplete?.({ theLoop: vals.theLoop.trim(), newIdentity: vals.newIdentity.trim() });
  };
  return (
    <ChapterFrame>
      <div style={fsWrap(`radial-gradient(800px 700px at 50% 30%, ${hexA(ACCENT, 0.2)}, ${C.night} 60%, ${C.black})`)}>
        <Starfield mood={ACCENT} />
        <Embers on color={ACCENT} count={14} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 460, margin: "0 auto", padding: "13vh 22px 50px", textAlign: "center" }}>
          <PhoenixSeal color={ACCENT} label="THE RECURSION · BROKEN" />
          <p style={{ ...serif, fontStyle: "italic", fontSize: 16, color: C.text, margin: "14px 0 18px" }}>
            The chamber stops looping. The screens go dark, one by one — there's nothing left to replay. You don't leave with a new plan. You leave as someone the old loop can't run.
          </p>
          <Btn full accent={C.magenta} onClick={finish}>Carry the break forward →</Btn>
        </div>
      </div>
    </ChapterFrame>
  );
}
