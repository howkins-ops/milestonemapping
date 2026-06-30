import React, { useState } from "react";
import {
  ChapterFrame, Cinematic, Btn, taStyle, C, hexA, mono, serif, echo,
  PhoenixSeal, HeroSprite, AlchemistSprite, Starfield, Embers, fsWrap,
} from "../kit.jsx";

/* =============================================================================
   CHAPTER 18 — BECOMING THE SIGNAL  ·  the Alchemist  (key: ch18-becoming-the-signal)
   Coelho beat: turning into the wind — union with the Soul of the World; with
   purpose and no fear of failure you already hold every tool. Miracle as
   alignment, not domination.
   Jon's testimony (T): the eviction notice + the candle — power cut, fridge
   empty, no screen left to escape into; the candlelight falls on the book;
   "Finally, I surrendered." Surrender = total acceptance + letting go of control
   (control is rooted in fear); "fear is not real — it lives only in our thoughts
   of the future."
   Exercise: Essence Stand → myStand (all five essences restored).
   See alchemist/07_CHAPTER_DOSSIER.md (Ch18).
   ============================================================================= */

const SCENE_BG = `radial-gradient(900px 800px at 50% 8%, ${hexA(C.phoenix, 0.22)}, ${C.night} 55%, ${C.black})`;

const ESS = [
  { name: "Power", color: C.power, glyph: "⬢" },
  { name: "Love", color: C.hotPink, glyph: "♥" },
  { name: "Radiance", color: C.gold, glyph: "☀" },
  { name: "Majesty", color: C.phoenix, glyph: "♛" },
  { name: "Joy", color: C.amber, glyph: "✦" },
];

function EssenceRing() {
  return (
    <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 10 }}>
      {ESS.map((e) => (
        <span key={e.name} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, border: `1px solid ${hexA(e.color, .55)}`, background: hexA(e.color, .1), fontSize: 13, color: e.color }}>
          <span style={{ filter: `drop-shadow(0 0 6px ${hexA(e.color, .7)})` }}>{e.glyph}</span>{e.name}
        </span>
      ))}
    </div>
  );
}

const INTRO = [
  {
    id: "storm", mood: C.cyan, backdrop: "starfield", kicker: "CHAPTER 18 · BECOMING THE SIGNAL",
    cast: [{ id: "hero", node: <HeroSprite size={120} glow={C.cyan} />, label: "YOU" }],
    lines: [
      "Beyond the citadel there's only open storm — wind so loud it erases everything that isn't true.",
      "The Alchemist's wager hangs in the air: to pass, you don't fight the wind. You turn into it. You become it.",
    ],
    speaker: C.text, cta: "But you don't know how →",
  },
  {
    id: "candle", mood: C.amber, backdrop: "embers",
    cast: [{ id: "alch", node: <AlchemistSprite size={128} />, label: "THE ALCHEMIST", labelColor: C.phoenix }],
    lines: [
      "\"I learned this on the worst night I had,\" the Alchemist says. \"An eviction notice on the door. Power cut. Fridge empty. No screen left to disappear into.\"",
      "\"Just a candle. And by its light I could see one thing on the floor — a book I'd been ignoring. I'd run out of ways to run.\"",
      "\"So I stopped. For the first time in my life I let go of the wheel. Finally — I surrendered. And that's when everything turned.\"",
    ],
    speaker: C.amber, cta: "Ask the wind →",
  },
  {
    id: "elements", mood: C.phoenix, backdrop: "starfield",
    cast: [{ id: "hero", node: <HeroSprite size={120} glow={C.phoenix} />, label: "YOU" }],
    lines: [
      "You ask the storm to spare you. It points past itself: \"I only move where the sky moves.\" You ask the sky. It points higher still.",
      "Everything points to the same place — the Hand that wrote all of it. Control was never yours to grip. And control, you finally see, was only ever fear wearing a costume.",
      "\"Fear isn't real,\" the Alchemist says. \"It only lives in your thoughts of a future that hasn't happened. Let it go — and you already hold every tool you need.\"",
    ],
    speaker: C.phoenix, cta: "Let go →",
  },
  {
    id: "become", mood: C.mint, backdrop: "embers",
    cast: [{ id: "alch", node: <AlchemistSprite size={132} />, label: "ALIGNED", labelColor: C.mint }],
    lines: [
      "You stop pushing. And the wind stops being something outside you. You scatter into it and gather again — not destroyed, aligned. You become the signal.",
      "All five essences light at once, restored and yours: Power, Love, Radiance, Majesty, Joy.",
      "From here, there's only one thing left to do — take your stand.",
    ],
    speaker: C.mint, cta: "Take your stand →",
  },
];

export default function ChapterBecomingSignal({ onComplete, quest }) {
  const [phase, setPhase] = useState("intro");
  const [myStand, setMyStand] = useState("");

  if (phase === "intro") {
    return (
      <ChapterFrame>
        <Cinematic shots={INTRO} accent={C.phoenix} onDone={() => setPhase("exercise")} />
      </ChapterFrame>
    );
  }

  if (phase === "exercise") {
    return (
      <ChapterFrame>
        <div style={fsWrap(SCENE_BG)}>
          <Starfield mood={C.phoenix} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", paddingTop: "5vh", height: 150 }}>
            <AlchemistSprite size={120} />
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "10px 22px 50px" }}>
            <div style={{ marginBottom: 14 }}><EssenceRing /></div>
            <div style={{ fontSize: 10, ...mono, color: C.phoenix, marginBottom: 8 }}>ESSENCE STAND · DECLARE IT</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.5, color: C.text, marginBottom: 12 }}>
              With all five restored and no fear of failure — what is the stand you take? Not a goal. A stand. Who you are now, no matter what comes.
            </p>
            <textarea value={myStand} onChange={(e) => setMyStand(e.target.value)} placeholder="I stand for… / From here, I am…" style={taStyle(C.phoenix)} />
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <Btn accent={C.phoenix} disabled={!myStand.trim()} onClick={() => setPhase("mirror")}>Plant it →</Btn>
            </div>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  if (phase === "mirror") {
    // TODO: askMentor() — scripted reflection now; live coaching later (no client API key).
    return (
      <ChapterFrame>
        <div style={fsWrap(SCENE_BG)}>
          <Starfield mood={C.phoenix} />
          <Embers on color={C.mint} count={12} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", paddingTop: "6vh", height: 150 }}>
            <AlchemistSprite size={120} />
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ textAlign: "center", fontSize: 11, letterSpacing: 3, color: C.phoenix, ...mono, marginBottom: 10 }}>THE SIGNAL HOLDS</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 18, lineHeight: 1.55, color: C.text, marginBottom: 14, textAlign: "center" }}>
              "<span style={{ color: C.mint }}>{echo(myStand, "I am the signal now — and I'm not afraid.")}</span>"
            </p>
            <div style={{ padding: "12px 14px", borderRadius: 12, background: hexA(C.phoenix, 0.06), border: `1px solid ${hexA(C.phoenix, 0.3)}`, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: C.textDim, fontStyle: "italic", margin: 0 }}>
                You don't push against the wind anymore. You moved with it — and it carried you. Transformation was never domination. It was alignment.
              </p>
            </div>
            <Btn full accent={C.phoenix} onClick={() => setPhase("seal")}>Toward the Vault →</Btn>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  // seal
  const finish = () => {
    quest?.updateDashboard?.({ stage: "Ordeal · Transformation", purpose: 10, faith: 10, fear: 4, courage: 10, trust: 10 });
    onComplete?.({ myStand: myStand.trim() });
  };
  return (
    <ChapterFrame>
      <div style={fsWrap(`radial-gradient(800px 800px at 50% 24%, ${hexA(C.phoenix, 0.26)}, ${C.night} 55%, ${C.black})`)}>
        <Starfield mood={C.phoenix} />
        <Embers on color={C.mint} count={16} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 460, margin: "0 auto", padding: "10vh 22px 56px", textAlign: "center" }}>
          <PhoenixSeal color={C.phoenix} label="BECAME THE SIGNAL · SEALED" />
          <p style={{ ...serif, fontStyle: "italic", fontSize: 16, color: C.text, margin: "14px 0 18px" }}>
            You turned into the wind and survived it by becoming it. Only one door remains — the Vault from the very first dream. Time to see what's inside.
          </p>
          <Btn full accent={C.magenta} onClick={finish}>Open the Vault →</Btn>
        </div>
      </div>
    </ChapterFrame>
  );
}
