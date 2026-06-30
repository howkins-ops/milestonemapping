import React, { useState } from "react";
import {
  ChapterFrame, Cinematic, Btn, taStyle, C, hexA, mono, serif, echo,
  PhoenixSeal, HeroSprite, MentorSprite, Starfield, Embers, Row, fsWrap,
} from "../kit.jsx";

/* =============================================================================
   CHAPTER 13 — THE DIAGNOSTIC  ·  the Business mentor returns  (key: ch13-the-diagnostic)
   Coelho beat: listening to the heart / the Soul of the World — knowledge must
   become embodiment; a compass that scans for what's missing.
   Jon's testimony (T): the "Big Book Splat" — a manager drops Robbins's
   *Awaken the Giant Within* on the desk; later, "everything I thought about
   myself was a lie." Then the sales-mastery diagnostic that turned sales into a
   SCIENCE: Law of Probability (~97% "no" is the MATH, not a verdict), Rapport
   via the Rock Collection ("tell me about these rocks"), "No means Know,"
   empathy-not-sympathy. The missing variable was never talent — it was
   beliefs/attitude and rapport. Information ≠ transformation.
   Exercise: Missing-Piece Diagnostic → missingPiece + firstMove.
   Identity shift: guesser → diagnostician.
   See alchemist/07_CHAPTER_DOSSIER.md (Ch13 + the Business-mentor reservoir).
   ============================================================================= */

const DIAG = C.gold;
const SCENE_BG = `radial-gradient(900px 700px at 50% 12%, ${hexA(DIAG, 0.16)}, transparent), ${C.black}`;

const heroNode = (size = 100) => <HeroSprite size={size} glow={C.cyan} />;
const mentorNode = (size = 120) => <MentorSprite size={size} color={DIAG} />;

const INTRO = [
  {
    id: "compass", mood: DIAG, backdrop: "starfield", kicker: "CHAPTER 13 · THE DIAGNOSTIC",
    cast: [{ id: "hero", node: heroNode(116), label: "YOU" }],
    lines: [
      "Deep in the Innermost Cave, a brass compass turns in your palm — but its needle doesn't point north. It points at what's missing.",
      "You've gathered facts, maps, frameworks. You can recite the whole journey. So why does the door ahead stay shut?",
      "The heart knows. The Soul of the World only opens for what you've embodied — not for what you've merely memorized.",
    ],
    speaker: C.text, cta: "A familiar figure steps in →",
  },
  {
    id: "splat", mood: DIAG, backdrop: "starfield",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "mentor", node: mentorNode(122), label: "THE BUSINESS MENTOR", labelColor: DIAG },
    ],
    lines: [
      "\"I remember the day a manager walked over and dropped a book on my desk. Hard. The Big Book Splat. Robbins — Awaken the Giant Within.\"",
      "\"I read it like it was an emergency. And somewhere in those pages I had to admit a brutal thing:\"",
      "\"Everything I thought about myself was a lie. The story of who I was — that was the broken instrument. Not the market. Not my luck. Me.\"",
    ],
    speaker: DIAG, cta: "So what did you do? →",
  },
  {
    id: "science", mood: DIAG, backdrop: "starfield",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "mentor", node: mentorNode(122), label: "THE BUSINESS MENTOR", labelColor: DIAG },
    ],
    lines: [
      "\"I stopped guessing. I turned selling into a SCIENCE. The Law of Probability — track every approach, every presentation, every close. Roughly ninety-seven percent say no. That's not a verdict on you. That's the MATH.\"",
      "\"Then rapport. A woman wasn't biting, so I stopped pitching. 'Forget what I'm selling — tell me about these rocks.' Her collection. She lit up. She bought — because I cared about HER first.\"",
      "\"And objections? No means Know. 'Too expensive' isn't a wall — it's 'tell me more about the value.' Empathy, not sympathy. Sorry salespeople sympathize and lose. Closers feel it WITH you and keep going.\"",
    ],
    speaker: DIAG, cta: "Then name the gap →",
  },
  {
    id: "gap", mood: DIAG, backdrop: "embers",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "mentor", node: mentorNode(122), label: "THE BUSINESS MENTOR", labelColor: DIAG },
    ],
    lines: [
      "\"Here's the diagnosis that changed my life: the missing variable was never talent. It was my beliefs, my attitude — and rapport. Fix those and the numbers obey.\"",
      "\"Information is not transformation. You don't need MORE facts. You need to find the one real gap and close it.\"",
      "\"So run the diagnostic on yourself. Honestly. What's actually missing — and what's the first move to close it?\"",
    ],
    speaker: DIAG, cta: "Run the diagnostic →",
  },
];

const PROMPTS = [
  { key: "missingPiece", label: "THE DIAGNOSIS · WHAT'S ACTUALLY MISSING", accent: DIAG,
    prompt: "Be honest — what's the piece that's actually missing? Vision, skills, resources, belief, or rapport? Name it." },
  { key: "firstMove", label: "THE PRESCRIPTION · CLOSE THE GAP", accent: C.cyan,
    prompt: "One concrete move this week to close that gap." },
];

export default function ChapterDiagnostic({ onComplete, quest }) {
  const [phase, setPhase] = useState("intro");
  const [step, setStep] = useState(0);
  const [vals, setVals] = useState({ missingPiece: "", firstMove: "" });
  const set = (k) => (e) => setVals((v) => ({ ...v, [k]: e.target.value }));

  if (phase === "intro") {
    return (
      <ChapterFrame>
        <Cinematic shots={INTRO} accent={DIAG} onDone={() => setPhase("exercise")} />
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
          <Starfield mood={DIAG} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, paddingTop: "6vh", height: 176 }}>
            {heroNode(94)}{mentorNode(108)}
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ fontSize: 10, ...mono, color: cur.accent, marginBottom: 8 }}>{cur.label} · {step + 1}/{PROMPTS.length}</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.5, color: C.text, marginBottom: 12 }}>{cur.prompt}</p>
            <textarea value={val} onChange={set(cur.key)} placeholder="Write your truth…" style={taStyle(cur.accent)} />
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <Btn accent={DIAG} disabled={!val.trim()} onClick={advance}>{step < PROMPTS.length - 1 ? "Next →" : "Show him →"}</Btn>
            </div>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  if (phase === "mirror") {
    // Scripted mentor reflection (answer-fill). Diagnose the real gap; information ≠ transformation.
    // TODO: askMentor() — swap this scripted reply for a live coaching call
    // (Netlify function netlify/functions/ask-mentor.js, model claude-sonnet-4-6).
    // NEVER embed an API key in client code.
    return (
      <ChapterFrame>
        <div style={fsWrap(SCENE_BG)}>
          <Starfield mood={DIAG} />
          <Embers color={DIAG} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, paddingTop: "6vh", height: 176 }}>
            {heroNode(94)}{mentorNode(108)}
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ textAlign: "center", fontSize: 11, letterSpacing: 3, color: DIAG, ...mono, marginBottom: 10 }}>THE DIAGNOSIS LANDS</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 10 }}>
              "So the missing piece isn't talent — it's <span style={{ color: DIAG }}>{echo(vals.missingPiece, "the belief you'd quietly stopped fighting for")}</span>. Good. You just did what most people never do — you named it instead of guessing."
            </p>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 14 }}>
              "And the move that closes it is <span style={{ color: C.cyan }}>{echo(vals.firstMove, "the small, scary action you've been circling")}</span>. That's the science. Information stayed information until you turned it into a move."
            </p>
            <div style={{ padding: "12px 14px", borderRadius: 12, background: hexA(DIAG, 0.06), border: `1px solid ${hexA(DIAG, 0.3)}`, marginBottom: 16 }}>
              <Row label="The trap" value="Mistaking information for transformation" accent={DIAG} />
              <Row label="The principle" value="Beliefs and rapport beat raw talent" accent={DIAG} />
              <Row label="No means Know" value="An objection just means: not enough info yet" accent={DIAG} />
              <Row label="Identity shift" value="Guesser → Diagnostician" accent={DIAG} />
            </div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 14, lineHeight: 1.5, color: C.textDim, marginBottom: 16 }}>
              "Ninety-seven percent will still say no. That's the math, not the meaning. Run your approaches, track your closes, and care about the person across from you before the pitch. Mastery is just knowledge plus practice, repeated past the point most people quit."
            </p>
            <Btn full accent={DIAG} onClick={() => setPhase("seal")}>Take the diagnosis →</Btn>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  // seal
  const finish = () => {
    quest?.updateDashboard?.({ stage: "Innermost Cave", purpose: 9, faith: 8, fear: 5, courage: 8, trust: 8 });
    onComplete?.({ missingPiece: vals.missingPiece.trim(), firstMove: vals.firstMove.trim(), mentor: "business" });
  };
  return (
    <ChapterFrame>
      <div style={fsWrap(`radial-gradient(800px 700px at 50% 30%, ${hexA(DIAG, 0.2)}, ${C.night} 60%, ${C.black})`)}>
        <Starfield mood={DIAG} />
        <Embers color={DIAG} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 460, margin: "0 auto", padding: "13vh 22px 50px", textAlign: "center" }}>
          <PhoenixSeal color={DIAG} label="DIAGNOSTIC · GAP NAMED" />
          <p style={{ ...serif, fontStyle: "italic", fontSize: 16, color: C.text, margin: "14px 0 18px" }}>
            The compass goes still. You stopped guessing and started diagnosing — and the door in the Innermost Cave finally hears you. The missing piece has a name now, and so does the move that closes it.
          </p>
          <Btn full accent={C.magenta} onClick={finish}>Carry the diagnosis on →</Btn>
        </div>
      </div>
    </ChapterFrame>
  );
}
