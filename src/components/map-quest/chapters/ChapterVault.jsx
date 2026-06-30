import React, { useState } from "react";
import {
  ChapterFrame, Cinematic, Btn, taStyle, C, hexA, mono, serif, echo,
  PhoenixSeal, AnswerJournal, HeroSprite, AlchemistSprite, Starfield, Embers, fsWrap,
} from "../kit.jsx";

/* =============================================================================
   CHAPTER 19 — THE VAULT  ·  THE CLIMAX  (key: ch19-the-vault)
   Coelho beat: the Pyramids + the robber's mirror dream — at the farthest point,
   the answer is HOME. The dream others abandoned points to your treasure; only
   the journey unlocks the meaning.
   Jon's testimony (T): the Mexico-beach epiphany (breaking down alone at the
   tide → "become a coach, to inspire"), the $18k Seattle coaching year — the
   smallest money, the richest life. The keys were next to him the whole time.
   The Vault opens onto a MIRROR: the Day-One Snapshot (Ch1–2) shown beside who
   they've become — the side-by-side IS the treasure. The Alchemist is revealed
   as the Seeker's own future self.
   Exercise: Life Purpose Reveal → lifePurpose.
   See alchemist/07_CHAPTER_DOSSIER.md (Ch19).
   ============================================================================= */

const SCENE_BG = `radial-gradient(900px 700px at 50% 12%, ${hexA(C.phoenix, 0.2)}, ${C.night} 55%, ${C.black})`;

const ESSENCES = {
  broke_king:     { name: "Power",    color: C.power,   glyph: "⬢" },
  addict_saint:   { name: "Love",     color: C.hotPink, glyph: "♥" },
  silent_prophet: { name: "Radiance", color: C.gold,    glyph: "☀" },
  raging_victim:  { name: "Majesty",  color: C.phoenix, glyph: "♛" },
  naive_warrior:  { name: "Joy",      color: C.amber,   glyph: "✦" },
};

const INTRO = [
  {
    id: "open", mood: C.phoenix, backdrop: "starfield", kicker: "CHAPTER 19 · THE VAULT",
    cast: [{ id: "hero", node: <HeroSprite size={118} glow={C.cyan} />, label: "YOU" }],
    lines: [
      "You reach it at last — the vault from the dream, your name burned into the door, the number you could never quite read.",
      "It swings open. And inside there's no gold. No number. Just a mirror, taller than you, waiting.",
    ],
    speaker: C.text, cta: "Step to the glass →",
  },
  {
    id: "future", mood: C.phoenix, backdrop: "starfield",
    cast: [
      { id: "hero", node: <HeroSprite size={96} glow={C.cyan} />, label: "YOU" },
      { id: "alch", node: <AlchemistSprite size={128} />, label: "THE ALCHEMIST", labelColor: C.phoenix },
    ],
    lines: [
      "The reflection isn't quite you. It's older. Lit from inside. It has been walking ahead of you this whole journey.",
      "\"You've been chasing me across the entire map,\" the Alchemist says — in your own voice. \"I was never a stranger. I'm you — the one this road was always building toward.\"",
    ],
    speaker: C.phoenix, cta: "How did you know? →",
  },
  {
    id: "beach", mood: C.mint, backdrop: "embers",
    cast: [{ id: "alch", node: <AlchemistSprite size={128} />, label: "THE ALCHEMIST", labelColor: C.phoenix }],
    lines: [
      "\"I flew somewhere far once, alone. I broke down at the tide line in the dark, with nothing left to perform for.\"",
      "\"And a single sentence surfaced from underneath all of it: become someone who inspires. Two days later I packed the Jeep for the smallest paycheck of my life — and the richest year of it.\"",
      "\"The treasure was never out here. The keys were beside me the whole time. The journey was just how I finally learned to read them.\"",
    ],
    speaker: C.mint, cta: "Open the mirror →",
  },
];

function MirrorColumn({ title, accent, entries }) {
  return <AnswerJournal title={title} accent={accent} entries={entries} />;
}

export default function ChapterVault({ onComplete, quest }) {
  const [phase, setPhase] = useState("intro");
  const [lifePurpose, setLifePurpose] = useState("");

  const dayOne = (quest?.getDayOneSnapshot?.()) || {};
  const outputs = (quest?.getAllOutputs?.()) || {};
  const shadows = (quest?.getAllShadows?.()) || [];
  const shadowId = outputs["chapter-shadow"] || {};
  const gate = outputs["ch05-the-gate"] || {};
  const fixer = outputs["ch03-the-fixer"] || {};
  const stand = outputs["ch18-becoming-the-signal"] || {};
  const restored = shadows.map((s) => ESSENCES[s.type]).filter(Boolean);

  const dayOneEntries = [
    { q: "Who you were, day one", a: dayOne.whoIAmNow },
    { q: "The fear you carried in", a: dayOne.biggestFear },
    { q: "The treasure you named", a: dayOne.treasure },
    { q: "What you were really chasing", a: dayOne.whatImChasing },
  ];
  const becomeEntries = [
    { q: "The identity you forged", a: shadowId.identity },
    { q: "The future self you described", a: fixer.futureSelf },
    { q: "The declaration you crossed on", a: gate.declaration },
    { q: "The stand you took in the storm", a: stand.myStand },
  ];

  if (phase === "intro") {
    return (
      <ChapterFrame>
        <Cinematic shots={INTRO} accent={C.phoenix} onDone={() => setPhase("reveal")} />
      </ChapterFrame>
    );
  }

  if (phase === "reveal") {
    return (
      <ChapterFrame>
        <div style={fsWrap(SCENE_BG)}>
          <Starfield mood={C.phoenix} />
          <Embers on color={C.mint} count={10} />
          <div style={{ position: "relative", zIndex: 2, maxWidth: 520, margin: "0 auto", padding: "5vh 22px 50px" }}>
            <div style={{ textAlign: "center", fontSize: 11, letterSpacing: 3, color: C.phoenix, ...mono, marginBottom: 4 }}>THE TREASURE IS A MIRROR</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 16, color: C.text, textAlign: "center", margin: "0 0 16px" }}>
              The glass splits in two. On one side, the person who set out. On the other — the person who arrived.
            </p>
            <MirrorColumn title="DAY ONE · WHO SET OUT" accent={C.gold} entries={dayOneEntries} />
            <div style={{ textAlign: "center", color: C.mint, ...mono, fontSize: 12, letterSpacing: 3, margin: "12px 0" }}>↓ BECAME ↓</div>
            <MirrorColumn title="NOW · WHO ARRIVED" accent={C.mint} entries={becomeEntries} />
            {restored.length > 0 && (
              <div style={{ marginTop: 14, padding: 14, borderRadius: 14, background: hexA(C.phoenix, .06), border: `1px solid ${hexA(C.phoenix, .3)}` }}>
                <div style={{ fontSize: 10, ...mono, color: C.phoenix, marginBottom: 8 }}>ESSENCES RESTORED</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {restored.map((e, i) => (
                    <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 999, border: `1px solid ${hexA(e.color, .5)}`, background: hexA(e.color, .1), fontSize: 12, color: e.color }}>
                      <span>{e.glyph}</span>{e.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div style={{ marginTop: 18 }}>
              <Btn full accent={C.phoenix} onClick={() => setPhase("exercise")}>Name what it was all for →</Btn>
            </div>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  if (phase === "exercise") {
    return (
      <ChapterFrame>
        <div style={fsWrap(SCENE_BG)}>
          <Starfield mood={C.phoenix} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", paddingTop: "6vh", height: 188 }}>
            <AlchemistSprite size={128} />
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ fontSize: 10, ...mono, color: C.phoenix, marginBottom: 8 }}>LIFE PURPOSE REVEAL · SAY IT IN ONE LINE</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.5, color: C.text, marginBottom: 12 }}>
              "Where joy, love, what you're great at, and what the world needs all overlap — that's the treasure. Write it in one line. Start with “To…”."
            </p>
            <textarea value={lifePurpose} onChange={(e) => setLifePurpose(e.target.value)} placeholder="To inspire… / To build… / To free…" style={taStyle(C.phoenix)} />
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <Btn accent={C.phoenix} disabled={!lifePurpose.trim()} onClick={() => setPhase("seal")}>Claim the treasure →</Btn>
            </div>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  // seal
  const finish = () => {
    quest?.updateDashboard?.({ stage: "Reward · The Reveal", purpose: 10, faith: 10, fear: 3, courage: 10, trust: 10 });
    onComplete?.({ lifePurpose: lifePurpose.trim() });
  };
  return (
    <ChapterFrame>
      <div style={fsWrap(`radial-gradient(800px 800px at 50% 26%, ${hexA(C.phoenix, 0.26)}, ${C.night} 55%, ${C.black})`)}>
        <Starfield mood={C.phoenix} />
        <Embers on color={C.mint} count={16} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8vh 22px 56px", textAlign: "center" }}>
          <AlchemistSprite size={120} />
          <div style={{ fontSize: 11, letterSpacing: 4, color: C.phoenix, ...mono, margin: "14px 0 10px" }}>✦ THE TREASURE ✦</div>
          <div style={{ padding: "18px", borderRadius: 18, background: `linear-gradient(135deg, ${hexA(C.phoenix, .18)}, ${C.cardDeep})`, border: `1.5px solid ${C.phoenix}`, marginBottom: 16, boxShadow: `0 0 40px ${hexA(C.phoenix, .35)}` }}>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 20, color: C.text, margin: 0, lineHeight: 1.45 }}>
              "{echo(lifePurpose, "To inspire — to show others it's possible.")}"
            </p>
          </div>
          <p style={{ ...serif, fontStyle: "italic", fontSize: 16, color: C.text, margin: "0 0 18px" }}>
            It was you the whole time. The vault only ever held a mirror — and now you can finally read what's in it.
          </p>
          <PhoenixSeal color={C.phoenix} label="LIFE PURPOSE · REVEALED" />
          <Btn full accent={C.magenta} onClick={finish}>Carry it home →</Btn>
        </div>
      </div>
    </ChapterFrame>
  );
}
