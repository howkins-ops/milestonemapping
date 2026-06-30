import React, { useState, useEffect } from "react";
import {
  ChapterFrame, Cinematic, Btn, taStyle, C, hexA, mono, serif, echo,
  PhoenixSeal, HeroSprite, Starfield, Embers, fsWrap,
} from "../kit.jsx";

/* =============================================================================
   CHAPTER 5 — THE GATE  (key: ch05-the-gate)
   Coelho beat: selling the sheep and crossing the sea — commitment burns the
   safe option and the old identity. The gate opens only on a spoken declaration.
   Jon's testimony (T): the same-day quit — the "F$CK the 9-5" stance; Cortés
   burning the ships. "Are you really committing if you've kept a plan B?"
   Lesson: a real decision cuts off every other possibility; plan B seeds the
   doubt that sinks plan A.
   Exercise: Essence Declaration → declaration (shown on the map afterward).
   See alchemist/07_CHAPTER_DOSSIER.md (Ch5).
   ============================================================================= */

const GATE = C.magenta;
const SCENE_BG = `radial-gradient(900px 700px at 50% 12%, ${hexA(GATE, 0.16)}, transparent), ${C.black}`;

/* the threshold gate — sealed, then dissolving */
function GateSVG({ size = 170, open = false }) {
  const col = open ? C.mint : GATE;
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 100 120" style={{ filter: `drop-shadow(0 0 16px ${hexA(col, .6)})`, transition: "filter .8s" }}>
      <defs><linearGradient id="gateGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={hexA(col, .5)} /><stop offset="100%" stopColor={hexA(col, .08)} /></linearGradient></defs>
      <path d="M16 116 L16 40 Q50 4 84 40 L84 116 Z" fill="url(#gateGrad)" stroke={col} strokeWidth="1.6" />
      {/* the seam — closed, or split open */}
      <line x1="50" y1={open ? 6 : 38} x2="50" y2="116" stroke={open ? hexA(col, .25) : hexA("#05050d", .9)} strokeWidth={open ? "1" : "3"} style={{ transition: "all .9s" }} />
      {!open && Array.from({ length: 5 }).map((_, i) => (
        <circle key={i} cx="50" cy={48 + i * 14} r="2.4" fill={hexA(GATE, .8)}>
          <animate attributeName="opacity" values=".4;1;.4" dur="2.4s" begin={`${i * .2}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {open && <path d="M50 8 C40 26 30 40 30 60 C40 52 46 56 50 64 C54 56 60 52 70 60 C70 40 60 26 50 8 Z" fill={hexA(C.mint, .25)} stroke={C.mint} strokeWidth="1.2" style={{ animation: "sRiseGlow .9s" }} />}
    </svg>
  );
}

const INTRO = [
  {
    id: "gate", mood: GATE, backdrop: "starfield", kicker: "CHAPTER 5 · THE GATE", stageH: 250,
    cast: [
      { id: "hero", node: <HeroSprite size={92} glow={C.cyan} />, label: "YOU" },
      { id: "gate", node: <GateSVG size={150} />, label: "THE GATE", labelColor: GATE },
    ],
    lines: [
      "The road ends at a gate the size of a building. No handle. No seam you can pry. You push with everything you have — and nothing moves.",
      "Words surface across its face like heat across metal: \"This gate has no lock. It opens on one thing only — a decision, said out loud, with no way back.\"",
    ],
    speaker: GATE, cta: "Look behind you →",
  },
  {
    id: "ships", mood: C.gold, backdrop: "starfield",
    cast: [{ id: "hero", node: <HeroSprite size={110} glow={C.cyan} /> }],
    lines: [
      "Behind you, down at the harbor, the ships are still moored. The steady wage. The desk that knows your name. The plan B you've kept folded in your back pocket 'just in case.'",
      "They look like safety. They've always looked like safety.",
    ],
    speaker: C.text, cta: "A voice from the gate →",
  },
  {
    id: "burnTeaching", mood: GATE, backdrop: "embers",
    cast: [{ id: "hero", node: <HeroSprite size={110} glow={C.cyan} /> }],
    lines: [
      "\"Cortés burned his ships on the shore so his men couldn't even think about retreat. They had one direction left: forward.\"",
      "\"A real decision cuts off every other possibility. The plan B isn't a safety net — it's the leak that sinks plan A. The part of you eyeing the exit can't give the part of you climbing its full strength.\"",
      "\"So. Are you really committing — if you've kept a way back? Speak it. Then burn the ships.\"",
    ],
    speaker: GATE, cta: "Speak your declaration →",
  },
];

const PROMPTS = [
  { key: "burning", label: "BURN THE SHIPS · WHAT YOU LEAVE", accent: C.gold,
    prompt: "Name the ship you're burning — the safe option, the plan B, the old life you've been keeping warm 'just in case.'" },
  { key: "declaration", label: "ESSENCE DECLARATION · SAID ALOUD", accent: GATE,
    prompt: "Now the declaration. Say it like the gate is listening. Start with “From today, I am…” — no exit, no hedge." },
];

export default function ChapterGate({ onComplete, quest }) {
  const [phase, setPhase] = useState("intro");
  const [step, setStep] = useState(0);
  const [vals, setVals] = useState({ burning: "", declaration: "" });
  const [open, setOpen] = useState(false);
  const set = (k) => (e) => setVals((v) => ({ ...v, [k]: e.target.value }));

  useEffect(() => {
    if (phase !== "burn") return;
    const t = setTimeout(() => setOpen(true), 1500);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "intro") {
    return (
      <ChapterFrame>
        <Cinematic shots={INTRO} accent={GATE} onDone={() => setPhase("exercise")} />
      </ChapterFrame>
    );
  }

  if (phase === "exercise") {
    const cur = PROMPTS[step];
    const val = vals[cur.key];
    const advance = () => (step < PROMPTS.length - 1 ? setStep(step + 1) : setPhase("burn"));
    return (
      <ChapterFrame>
        <div style={fsWrap(SCENE_BG)}>
          <Starfield mood={GATE} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", paddingTop: "5vh", height: 188 }}>
            <GateSVG size={138} />
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ fontSize: 10, ...mono, color: cur.accent, marginBottom: 8 }}>{cur.label} · {step + 1}/{PROMPTS.length}</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.5, color: C.text, marginBottom: 12 }}>{cur.prompt}</p>
            <textarea value={val} onChange={set(cur.key)} placeholder="Write your truth…" style={taStyle(cur.accent)} />
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <Btn accent={GATE} disabled={!val.trim()} onClick={advance}>{step < PROMPTS.length - 1 ? "Next →" : "Burn the ships →"}</Btn>
            </div>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  if (phase === "burn") {
    return (
      <ChapterFrame>
        <div style={fsWrap(`radial-gradient(800px 700px at 50% 24%, ${hexA(open ? C.mint : C.danger, .2)}, ${C.night} 55%, ${C.black})`)}>
          <Starfield mood={open ? C.mint : C.gold} />
          <Embers on color={open ? C.mint : C.danger} count={18} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", paddingTop: "6vh", height: 220 }}>
            <GateSVG size={168} open={open} />
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px", textAlign: "center" }}>
            {!open ? (
              <p style={{ ...serif, fontStyle: "italic", fontSize: 17, color: C.text, animation: "sFade .6s" }}>
                The harbor catches fire behind you. There's no ship to run back to now. You speak the words — and the gate hears them.
              </p>
            ) : (
              <div style={{ animation: "sRiseGlow .8s" }}>
                <div style={{ fontSize: 11, letterSpacing: 3, color: C.mint, ...mono, marginBottom: 10 }}>THE GATE DISSOLVES</div>
                <div style={{ padding: "16px", borderRadius: 16, background: `linear-gradient(135deg, ${hexA(GATE, .16)}, ${C.cardDeep})`, border: `1.5px solid ${GATE}`, marginBottom: 14 }}>
                  <p style={{ ...serif, fontStyle: "italic", fontSize: 18, color: C.text, margin: 0, lineHeight: 1.5 }}>
                    "{echo(vals.declaration, "From today, I am all in.")}"
                  </p>
                </div>
                <p style={{ fontSize: 13, color: C.textDim, fontStyle: "italic", marginBottom: 16 }}>
                  You burned <span style={{ color: C.gold }}>{echo(vals.burning, "the way back")}</span>. There's only forward now. The threshold is behind you.
                </p>
                <Btn full accent={C.mint} onClick={() => setPhase("seal")}>Cross →</Btn>
              </div>
            )}
          </div>
        </div>
      </ChapterFrame>
    );
  }

  // seal
  const finish = () => {
    quest?.updateDashboard?.({ stage: "Crossing the Threshold", purpose: 7, faith: 6, fear: 5, courage: 7, trust: 5 });
    onComplete?.({ declaration: vals.declaration.trim(), burning: vals.burning.trim() });
  };
  return (
    <ChapterFrame>
      <div style={fsWrap(`radial-gradient(800px 700px at 50% 30%, ${hexA(C.phoenix, 0.2)}, ${C.night} 60%, ${C.black})`)}>
        <Starfield mood={C.phoenix} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 460, margin: "0 auto", padding: "13vh 22px 50px", textAlign: "center" }}>
          <PhoenixSeal color={GATE} label="DECLARATION · SEALED" />
          <p style={{ ...serif, fontStyle: "italic", fontSize: 16, color: C.text, margin: "14px 0 18px" }}>
            No plan B. No exit. The road on the other side runs through the forest of the self — and the first shadow is already waiting on it.
          </p>
          <Btn full accent={C.magenta} onClick={finish}>Into the undercity →</Btn>
        </div>
      </div>
    </ChapterFrame>
  );
}
