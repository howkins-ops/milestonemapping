import React, { useState } from "react";
import {
  ChapterFrame, Cinematic, Btn, taStyle, C, hexA, mono, serif, echo,
  PhoenixSeal, AnswerJournal, HeroSprite, CrownedSprite, Starfield, Embers, fsWrap,
} from "../kit.jsx";

/* =============================================================================
   CHAPTER 17 — THE CITADEL  ·  all five shadows converge  (key: ch17-the-citadel)
   Coelho beat: captured; the alchemist stakes everything — "he will turn into
   the wind." Every prior power converges into one impossible reckoning.
   Jon's testimony — the Ayahuasca descent (the Ch17 anchor), rendered FULLY
   TRANSMUTED: every wound surfaces at once — the purge, the veiled figures, the
   abandonment re-staged ("you've had many chances to love"), fire → ashes →
   phoenix. The usable gold is the STRUCTURE (descent → purge → name → surrender),
   never literal biography.
   Exercise: Shadow Naming Ceremony — reads quest.getAllShadows() and prefills the
   player's OWN earlier words; they name each shadow; then surrender.
   See alchemist/07_CHAPTER_DOSSIER.md (Ch17).
   ============================================================================= */

const SCENE_BG = `radial-gradient(900px 800px at 50% 6%, ${hexA(C.phoenix, 0.24)}, ${C.night} 55%, ${C.black})`;

/* the five survival-selves, in convergence order */
const ARCH = [
  { type: "broke_king",     name: "The Broke King",    essence: "Power",    color: C.power,   glyph: "⬢", keys: ["identity", "power"],     fb: "I build from power, not panic." },
  { type: "addict_saint",   name: "The Addict Saint",  essence: "Love",     color: C.hotPink, glyph: "♥", keys: ["interrupt", "escapeFrom"], fb: "I meet the ache with compassion, not escape." },
  { type: "silent_prophet", name: "The Silent Prophet",essence: "Radiance", color: C.gold,    glyph: "☀", keys: ["newScript", "wontSay"],   fb: "My voice is mine, and I use it." },
  { type: "raging_victim",  name: "The Raging Victim", essence: "Majesty",  color: C.phoenix, glyph: "♛", keys: ["gratefulFor", "theStory"], fb: "I own my story, and I'm grateful for it." },
  { type: "naive_warrior",  name: "The Naive Warrior", essence: "Joy",      color: C.amber,   glyph: "✦", keys: ["ownedClean", "shortcut"],  fb: "I move clean, owned, and free." },
];

const ringNode = (color, size = 60) => <CrownedSprite size={size} baseColor={color} revealed healed healedColor={color} />;

const INTRO = [
  {
    id: "citadel", mood: C.phoenix, backdrop: "starfield", kicker: "CHAPTER 17 · THE CITADEL", stageH: 250,
    cast: ARCH.map((a) => ({ id: a.type, node: ringNode(a.color, 58), label: a.essence, labelColor: a.color })),
    lines: [
      "The road ends at a black citadel, and the doors lock behind you. You're captured — the Ordeal the whole journey was bending toward.",
      "All five of them are here at once. The Broke King. The Addict Saint. The Silent Prophet. The Raging Victim. The Naive Warrior. Every mask you've worn, standing in a ring.",
      "The Alchemist's voice cuts through: \"To pass, he stakes everything. He turns into the wind. But first — you face all of it. Together. Now.\"",
    ],
    speaker: C.phoenix, cta: "Go down →",
  },
  {
    id: "descent", mood: C.danger, backdrop: "embers",
    cast: [{ id: "hero", node: <HeroSprite size={120} glow={C.cyan} />, label: "YOU" }],
    lines: [
      "The floor opens and you fall — not down, but inward. Heat. The taste of every swallowed thing rising at once. A purge with no body, only truth.",
      "Veiled figures circle in the dark. One leans close, neither cruel nor kind: \"You've had so many chances to love. To stay. To be seen. And you ran from every one.\"",
      "There's nowhere left to run to. So — for the first time — you stop running.",
    ],
    speaker: C.danger, cta: "Stay in it →",
  },
  {
    id: "phoenix", mood: C.phoenix, backdrop: "embers",
    cast: [{ id: "hero", node: <HeroSprite size={124} glow={C.phoenix} />, label: "YOU" }],
    lines: [
      "The heat becomes fire. The fire becomes ash. And out of the ash — the shape you've seen sealing every chapter behind you — a phoenix lifts.",
      "From the bottom, the dots connect. Each shadow wasn't an enemy. Each was a survival-self that carried you here, and is ready to be named and laid down.",
      "\"Name them,\" the Alchemist says. \"In your own words. A named shadow loses its grip.\"",
    ],
    speaker: C.phoenix, cta: "Begin the naming →",
  },
];

export default function ChapterCitadel({ onComplete, quest }) {
  const [phase, setPhase] = useState("intro");
  const [idx, setIdx] = useState(0);

  // harvest the player's own earlier words from each shadow chapter
  const shadows = (quest?.getAllShadows?.()) || [];
  const byType = {};
  for (const s of shadows) byType[s.type] = s;
  const prefillFor = (a) => {
    const data = byType[a.type] || {};
    for (const k of a.keys) if (data[k] && String(data[k]).trim()) return String(data[k]).trim();
    return "";
  };

  const [names, setNames] = useState(() => {
    const init = {};
    for (const a of ARCH) init[a.type] = prefillFor(a);
    return init;
  });
  const setName = (type) => (e) => setNames((n) => ({ ...n, [type]: e.target.value }));

  if (phase === "intro") {
    return (
      <ChapterFrame>
        <Cinematic shots={INTRO} accent={C.phoenix} onDone={() => setPhase("ceremony")} />
      </ChapterFrame>
    );
  }

  if (phase === "ceremony") {
    const a = ARCH[idx];
    const val = names[a.type];
    const earlier = prefillFor(a);
    const advance = () => (idx < ARCH.length - 1 ? setIdx(idx + 1) : setPhase("surrender"));
    return (
      <ChapterFrame>
        <div style={fsWrap(`radial-gradient(800px 700px at 50% 14%, ${hexA(a.color, 0.18)}, ${C.night} 55%, ${C.black})`)}>
          <Starfield mood={a.color} />
          <Embers on color={a.color} count={10} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", paddingTop: "5vh", height: 188 }}>
            {ringNode(a.color, 120)}
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ fontSize: 10, ...mono, color: a.color, marginBottom: 6 }}>SHADOW NAMING CEREMONY · {idx + 1}/{ARCH.length}</div>
            <div style={{ ...serif, fontSize: 22, color: C.text, marginBottom: 4 }}>{a.glyph} {a.name}</div>
            <div style={{ fontSize: 12, ...mono, color: a.color, marginBottom: 12 }}>ESSENCE · {a.essence.toUpperCase()}</div>
            {earlier ? (
              <p style={{ ...serif, fontStyle: "italic", fontSize: 14, color: C.textDim, marginBottom: 10 }}>
                You once told this one: “{earlier}”. Speak its name now — what it taught you, who you are because of it.
              </p>
            ) : (
              <p style={{ ...serif, fontStyle: "italic", fontSize: 14, color: C.textDim, marginBottom: 10 }}>
                Name this one in your own words — what it taught you, who you are now that you've met it.
              </p>
            )}
            <textarea value={val} onChange={setName(a.type)} placeholder="Name it…" style={taStyle(a.color)} />
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <Btn accent={a.color} disabled={!val.trim()} onClick={advance}>{idx < ARCH.length - 1 ? "Lay it down →" : "All five named →"}</Btn>
            </div>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  // surrender + seal
  const finish = () => {
    quest?.updateDashboard?.({ stage: "Ordeal", purpose: 9, faith: 7, fear: 8, courage: 7, trust: 7 });
    onComplete?.({ shadowNames: names, surrendered: true });
  };
  return (
    <ChapterFrame>
      <div style={fsWrap(SCENE_BG)}>
        <Starfield mood={C.phoenix} />
        <Embers on color={C.mint} count={16} />
        <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", gap: 6, paddingTop: "5vh", height: 150, flexWrap: "wrap" }}>
          {ARCH.map((a) => <div key={a.type}>{ringNode(a.color, 52)}</div>)}
        </div>
        <div style={{ position: "relative", zIndex: 2, maxWidth: 500, margin: "0 auto", padding: "6px 22px 56px" }}>
          <div style={{ textAlign: "center", fontSize: 11, letterSpacing: 4, color: C.phoenix, ...mono, marginBottom: 8 }}>ALL FIVE NAMED · SURRENDER</div>
          <p style={{ ...serif, fontStyle: "italic", fontSize: 17, color: C.text, textAlign: "center", marginBottom: 14 }}>
            One by one, the masks lower their heads — not defeated, but heard. You stop fighting them. You let go of the grip. That letting-go is the gold.
          </p>
          <AnswerJournal title="THE FIVE, NAMED IN YOUR WORDS" accent={C.phoenix} entries={ARCH.map((a) => ({ q: `${a.name} · ${a.essence}`, a: names[a.type] }))} />
          <div style={{ marginTop: 18 }}>
            <PhoenixSeal color={C.phoenix} label="THE CITADEL · SURRENDERED" />
            <Btn full accent={C.magenta} onClick={finish}>Turn into the wind →</Btn>
          </div>
        </div>
      </div>
    </ChapterFrame>
  );
}
