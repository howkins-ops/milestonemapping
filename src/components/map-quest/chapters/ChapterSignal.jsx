import React, { useState } from "react";
import {
  ChapterFrame, Cinematic, Btn, taStyle, C, hexA, mono, serif, echo,
  PhoenixSeal, HeroSprite, MentorSprite, Starfield, fsWrap,
} from "../kit.jsx";

/* =============================================================================
   CHAPTER 2 — THE SIGNAL
   Coelho beat: the gypsy reads the dream — the treasure is real.
   Jon's testimony: the $25k pay-stub — proof a bigger life is real shatters the
   ceiling. Exercise: Name Your Treasure → captures the Day-One Snapshot.
   First chapter built on the shared cinematic engine. See alchemist/07_CHAPTER_DOSSIER.md.
   ============================================================================= */

const SCENE_BG = `radial-gradient(900px 700px at 50% 12%, ${hexA(C.cyan, 0.16)}, transparent), ${C.black}`;

const INTRO = [
  {
    id: "dream", mood: C.cyan, backdrop: "starfield", kicker: "CHAPTER 2 · THE SIGNAL",
    cast: [{ id: "hero", node: <HeroSprite size={120} glow={C.cyan} />, label: "YOU" }],
    lines: [
      "The dream came back — sharper this time.",
      "A vault behind the city, your name burned into it, and a number you can't quite read.",
    ],
    speaker: C.text, cta: "Then something cut through →",
  },
  {
    id: "signal", mood: C.gold, backdrop: "starfield",
    cast: [
      { id: "hero", node: <HeroSprite size={102} glow={C.cyan} />, label: "YOU" },
      { id: "peer", node: <MentorSprite size={118} color={C.gold} staff={false} />, label: "THE SIGNAL", labelColor: C.gold },
    ],
    lines: [
      "Then — a signal. Someone who walked out of the same grid you're standing in.",
      "They worked four months. Travelled the other eight. And held up the proof like it was nothing.",
    ],
    speaker: C.gold, cta: "You couldn't unsee it →",
  },
  {
    id: "crack", mood: C.cyan, backdrop: "starfield",
    cast: [{ id: "hero", node: <HeroSprite size={122} glow={C.cyan} /> }],
    lines: [
      "You'd been told this was the ceiling.",
      "It isn't. It was never written that you had to stay.",
      "The vault is real. Now — name what's inside it.",
    ],
    speaker: C.cyan, cta: "Name your treasure →",
  },
];

export default function ChapterSignal({ onComplete, quest }) {
  const [phase, setPhase] = useState("intro");
  const [step, setStep] = useState(0);
  const [treasure, setTreasure] = useState("");
  const [chasing, setChasing] = useState("");

  if (phase === "intro") {
    return (
      <ChapterFrame>
        <Cinematic shots={INTRO} accent={C.cyan} onDone={() => setPhase("exercise")} />
      </ChapterFrame>
    );
  }

  if (phase === "exercise") {
    const prompts = [
      { label: "NAME YOUR TREASURE", prompt: "If the ceiling is a lie — what's the treasure you're actually going for?", val: treasure, set: setTreasure },
      { label: "THE REAL WHY", prompt: "And what do you believe it'll finally give you when you reach it?", val: chasing, set: setChasing },
    ];
    const cur = prompts[step];
    const advance = () => (step < 1 ? setStep(1) : setPhase("mirror"));
    return (
      <ChapterFrame>
        <div style={fsWrap(SCENE_BG)}>
          <Starfield mood={C.cyan} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", paddingTop: "7vh" }}>
            <HeroSprite size={118} glow={C.cyan} />
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "10px 22px 50px" }}>
            <div style={{ fontSize: 10, ...mono, color: C.cyan, marginBottom: 8 }}>{cur.label} · {step + 1}/2</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.5, color: C.text, marginBottom: 12 }}>{cur.prompt}</p>
            <textarea value={cur.val} onChange={(e) => cur.set(e.target.value)} placeholder="Write your truth…" style={taStyle(C.cyan)} />
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <Btn accent={C.cyan} disabled={!cur.val.trim()} onClick={advance}>{step < 1 ? "Next →" : "Hold it up →"}</Btn>
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
          <Starfield mood={C.cyan} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", paddingTop: "7vh" }}>
            <HeroSprite size={118} glow={C.cyan} />
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "10px 22px 50px" }}>
            <div style={{ textAlign: "center", fontSize: 11, letterSpacing: 3, color: C.cyan, ...mono, marginBottom: 10 }}>THE MIRROR</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 10 }}>
              So that's the treasure: <span style={{ color: C.gold }}>{echo(treasure, "the bigger life")}</span>.
            </p>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 14 }}>
              And underneath it — what you're really chasing is <span style={{ color: C.cyan }}>{echo(chasing, "to finally feel free")}</span>.
            </p>
            <div style={{ padding: "12px 14px", borderRadius: 12, background: hexA(C.cyan, 0.06), border: `1px solid ${hexA(C.cyan, 0.3)}`, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: C.textDim, fontStyle: "italic", margin: 0 }}>
                Hold onto this. The Vault at the end of the road opens onto this exact moment — and shows you how far you've come.
              </p>
            </div>
            <Btn full accent={C.cyan} onClick={() => setPhase("seal")}>Seal it →</Btn>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  // seal
  const finish = () => {
    quest?.setDayOneSnapshot?.({ treasure: treasure.trim(), whatImChasing: chasing.trim() });
    quest?.updateDashboard?.({ stage: "Call", purpose: 4, faith: 4, fear: 5, courage: 4, trust: 3 });
    onComplete?.({ treasure: treasure.trim(), chasing: chasing.trim() });
  };
  return (
    <ChapterFrame>
      <div style={fsWrap(`radial-gradient(800px 700px at 50% 30%, ${hexA(C.phoenix, 0.2)}, ${C.night} 60%, ${C.black})`)}>
        <Starfield mood={C.phoenix} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 460, margin: "0 auto", padding: "14vh 22px 50px", textAlign: "center" }}>
          <PhoenixSeal color={C.cyan} label="TREASURE NAMED" />
          <p style={{ ...serif, fontStyle: "italic", fontSize: 16, color: C.text, margin: "14px 0 18px" }}>
            The signal is logged. The vault has a name now — and so do you.
          </p>
          <Btn full accent={C.magenta} onClick={finish}>Mark the map →</Btn>
        </div>
      </div>
    </ChapterFrame>
  );
}
