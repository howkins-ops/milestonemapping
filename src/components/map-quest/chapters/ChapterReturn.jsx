import React, { useState } from "react";
import {
  ChapterFrame, Cinematic, Btn, taStyle, C, hexA, mono, serif, echo,
  PhoenixSeal, HeroSprite, MentorSprite, AlchemistSprite, Starfield, Embers, fsWrap,
} from "../kit.jsx";

/* =============================================================================
   CHAPTER 20 — THE RETURN  ·  the Father's echo  (key: ch20-the-return)
   Coelho beat: the treasure at the sycamore + the return — "home all along," but
   only the journey lets you see it; return with the elixir = transformed vision.
   Jon's testimony (T): "The Fisherman & the Businessman" + "rich without money"
   — "I always thought I had a poor dad; this whole time he was rich and I was the
   poor one." The Phoenix returns to teach; the next quest is to live and teach
   the purpose.
   Lesson: wealth was never the money — it's freedom, time, relationships,
   health, doing what you love. Return = re-invent and serve.
   Exercise: Return & Next Quest → nextQuest.
   See alchemist/07_CHAPTER_DOSSIER.md (Ch20).
   ============================================================================= */

const FATHER = C.amber;
const SCENE_BG = `radial-gradient(900px 700px at 50% 12%, ${hexA(C.mint, 0.16)}, transparent), ${C.black}`;

const INTRO = [
  {
    id: "legible", mood: C.cyan, backdrop: "starfield", kicker: "CHAPTER 20 · THE RETURN",
    cast: [{ id: "hero", node: <HeroSprite size={118} glow={C.cyan} />, label: "YOU" }],
    lines: [
      "You walk back into the city you left. Same neon, same flat hum — and yet you can read it now.",
      "The grid that once felt like a cage is just a place. It never held you. The lock was always a story, and you've put the story down.",
    ],
    speaker: C.text, cta: "A familiar voice →",
  },
  {
    id: "fatherEcho", mood: FATHER, backdrop: "starfield",
    cast: [
      { id: "hero", node: <HeroSprite size={96} glow={C.cyan} />, label: "YOU" },
      { id: "dad", node: <MentorSprite size={118} color={FATHER} />, label: "THE FATHER · ECHO", labelColor: FATHER },
    ],
    lines: [
      "Your father's old line comes back: \"Look out for number one.\" You finally hear what he meant underneath it — and what he never got to say.",
      "There's a story about a businessman who tells a fisherman to build an empire, work for decades, so one day he can retire to a quiet beach and fish in peace. The fisherman just looks at him: \"…That's what I'm already doing.\"",
      "\"I always thought I had a poor dad,\" you realize. \"This whole time he was rich — freedom, time, the people he loved — and I was the poor one, chasing a number to feel what he already had.\"",
    ],
    speaker: FATHER, cta: "The Phoenix rises →",
  },
  {
    id: "phoenix", mood: C.phoenix, backdrop: "embers",
    cast: [{ id: "alch", node: <AlchemistSprite size={132} />, label: "THE NEW ALCHEMIST · YOU", labelColor: C.phoenix }],
    lines: [
      "The Phoenix lifts over the whole map — burn, ash, rise — the same shape that sealed every chapter behind you.",
      "Wealth was never the money. It's freedom, time, the people you love, your health, doing what's yours to do. You carried the elixir all the way home.",
      "And the road doesn't end at the treasure. It turns back toward the ones still in the grid. You're the Alchemist now. Someone out there is on Chapter One.",
    ],
    speaker: C.phoenix, cta: "Name your next quest →",
  },
];

export default function ChapterReturn({ onComplete, quest }) {
  const [phase, setPhase] = useState("intro");
  const [nextQuest, setNextQuest] = useState("");

  const lifePurpose = echo((quest?.getAllOutputs?.()?.["ch19-the-vault"]?.lifePurpose), "to inspire");

  if (phase === "intro") {
    return (
      <ChapterFrame>
        <Cinematic shots={INTRO} accent={C.mint} onDone={() => setPhase("exercise")} />
      </ChapterFrame>
    );
  }

  if (phase === "exercise") {
    return (
      <ChapterFrame>
        <div style={fsWrap(SCENE_BG)}>
          <Starfield mood={C.mint} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", paddingTop: "6vh", height: 188 }}>
            <AlchemistSprite size={124} />
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ fontSize: 10, ...mono, color: C.mint, marginBottom: 8 }}>RETURN & NEXT QUEST</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.5, color: C.text, marginBottom: 12 }}>
              You came back with the elixir. Your purpose is <span style={{ color: C.phoenix }}>{lifePurpose}</span>. So — what's your next quest? Who will you go back for? Who will you inspire?
            </p>
            <textarea value={nextQuest} onChange={(e) => setNextQuest(e.target.value)} placeholder="My next quest is…" style={taStyle(C.mint)} />
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <Btn accent={C.mint} disabled={!nextQuest.trim()} onClick={() => setPhase("mirror")}>Set out again →</Btn>
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
          <Starfield mood={C.mint} />
          <Embers on color={C.mint} count={10} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", paddingTop: "6vh", height: 176 }}>
            <AlchemistSprite size={120} />
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ textAlign: "center", fontSize: 11, letterSpacing: 3, color: C.mint, ...mono, marginBottom: 10 }}>THE NEW ALCHEMIST</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 14 }}>
              Your next quest: <span style={{ color: C.mint }}>{echo(nextQuest, "to go back for the ones still in the grid")}</span>.
            </p>
            <div style={{ padding: "12px 14px", borderRadius: 12, background: hexA(C.phoenix, 0.06), border: `1px solid ${hexA(C.phoenix, 0.3)}`, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: C.textDim, fontStyle: "italic", margin: 0 }}>
                Return isn't regression when you've been transformed. You don't go back the same — you go back as the one who can light the road for someone else.
              </p>
            </div>
            <Btn full accent={C.mint} onClick={() => setPhase("seal")}>Seal the journey →</Btn>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  // seal
  const finish = () => {
    quest?.updateDashboard?.({ stage: "Return with the Elixir", purpose: 10, faith: 10, fear: 3, courage: 10, trust: 10 });
    onComplete?.({ nextQuest: nextQuest.trim(), complete: true });
  };
  return (
    <ChapterFrame>
      <div style={fsWrap(`radial-gradient(800px 800px at 50% 26%, ${hexA(C.phoenix, 0.26)}, ${C.night} 55%, ${C.black})`)}>
        <Starfield mood={C.phoenix} />
        <Embers on color={C.mint} count={18} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 460, margin: "0 auto", padding: "10vh 22px 56px", textAlign: "center" }}>
          <PhoenixSeal color={C.phoenix} label="THE INNER ALCHEMIST · COMPLETE" />
          <h2 style={{ ...serif, fontSize: 26, color: C.text, margin: "16px 0 8px" }}>The road is yours now.</h2>
          <p style={{ ...serif, fontStyle: "italic", fontSize: 16, color: C.text, margin: "0 0 18px" }}>
            Twenty chapters. Five shadows reforged. One purpose, carried home. Burn, ash, rise — and again.
          </p>
          <Btn full accent={C.magenta} onClick={finish}>Close the book →</Btn>
          <p style={{ fontSize: 10, color: C.locked, ...mono, marginTop: 22, lineHeight: 1.5 }}>
            Inspired by the spirit of Paulo Coelho's <i>The Alchemist</i>.
          </p>
        </div>
      </div>
    </ChapterFrame>
  );
}
