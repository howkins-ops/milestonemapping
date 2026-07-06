import React, { useState } from "react";
import {
  ChapterFrame, Cinematic, Btn, taStyle, C, hexA, mono, serif, echo,
  PhoenixSeal, HeroSprite, MentorSprite, Starfield, Embers, Row, fsWrap,
} from "../kit.jsx";

/* =============================================================================
   CHAPTER 9 — THE THIRST  ·  rapport & listening  (key: cr03-the-thirst)
   Coelho beat: people climb the hill thirsty — so serve mint tea in crystal
   glasses. Meet the ACTUAL need and the crystal sells itself; the shop booms.
   The Merchant, watching the old shop transform: "There's no way to hold back
   the river."
   Merchant teachings: serve the real thirst, not your pitch; accept the river —
   when caring for the customer works, let it change you.
   Jon's curriculum (T): RAPPORT as the master technique — Carnegie's "take a
   genuine interest" + the get-to-know-them questions; the ROCK COLLECTION story
   in full ("Forget what I'm selling — tell me all about these rocks!" → "he
   cared more about getting to know me than showing me the vacuum, and for that
   I'm going to buy one from him"); listen to understand, not to reply (Covey;
   wait 3–5 seconds; listening body language); people buy with emotion and
   justify with logic; use humor — the kettle-lid steam release; people buy YOU.
   Exercise: The Rock Collection → whoIServe + theirRocks + myQuestion.
   Identity shift: pitcher → listener.
   See alchemist/07_CHAPTER_DOSSIER.md (Arc 2.5 + the Business-mentor reservoir).
   ============================================================================= */

const MERCH = C.power; // the Merchant's crystal-blue accent, shared across Ch7–10
const SCENE_BG = `radial-gradient(900px 700px at 50% 12%, ${hexA(MERCH, 0.16)}, transparent), ${C.black}`;

const heroNode = (size = 100) => <HeroSprite size={size} glow={C.cyan} />;
const merchantNode = (size = 120) => <MentorSprite size={size} color={MERCH} staff={false} />;

const INTRO = [
  {
    id: "thirst", mood: C.mint, backdrop: "starfield", kicker: "CHAPTER 9 · THE THIRST",
    cast: [{ id: "hero", node: heroNode(116), label: "YOU" }],
    lines: [
      "The display case works. Climbers stop, look, sometimes buy. But you notice something the case can't fix: every single one of them arrives at the top of the hill thirsty.",
      "They don't need a pitch about crystal. They need a drink.",
      "So you brew mint tea — and you serve it in the crystal.",
    ],
    speaker: C.text, cta: "Watch what happens →",
  },
  {
    id: "river", mood: C.mint, backdrop: "starfield",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "merchant", node: merchantNode(122), label: "THE MERCHANT", labelColor: MERCH },
    ],
    lines: [
      "The climbers drink. The cool glass sweats in their hands, catches the neon, and suddenly they're not being sold crystal — they're HOLDING the reason to own it.",
      "The shop has its best week in thirty years. The Merchant watches the crowd and shakes his head, half in protest, half in wonder.",
      "\"There's no way to hold back the river,\" he says. \"Fine. Then let it teach you the deepest law of the trade — come, sit.\"",
    ],
    speaker: MERCH, cta: "Sit and listen →",
  },
  {
    id: "rocks", mood: MERCH, backdrop: "starfield",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "merchant", node: merchantNode(122), label: "THE MERCHANT", labelColor: MERCH },
    ],
    lines: [
      "\"Young, I sold machines door to door. One cold call, a busy woman: 'Hurry up and show me what you're selling.' And covering half her living room — a full-blown rock collection.\"",
      "\"I said: 'Forget what I'm selling — tell me all about these rocks!' Thirty minutes we talked stones. Her favorites. Their stories. I never mentioned the machine once.\"",
      "\"My pitch afterward was clumsy — I stumbled, I was still learning. When my boss called to check the sale, I heard her say: 'Honestly, I don't care much for the machine. But he cared more about getting to know me than selling me — and for that, I'm buying one from HIM.'\"",
    ],
    speaker: MERCH, cta: "She bought… you? →",
  },
  {
    id: "listen", mood: MERCH, backdrop: "embers",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "merchant", node: merchantNode(122), label: "THE MERCHANT", labelColor: MERCH },
    ],
    lines: [
      "\"Exactly. People buy with emotion and justify with logic — and the first thing they buy is YOU. Rapport isn't a technique. It's genuine interest: ask what matters to them, find the common ground, share something true of your own.\"",
      "\"Then LISTEN. Most people listen only to reply — already composing their answer while the customer still speaks. Listen to understand instead. When they finish, wait three, four, five seconds. They'll tell you the rest — sometimes they'll close themselves.\"",
      "\"And when the pressure builds like a kettle, lift the lid — humor. A laughing customer is a relaxed customer. But all of it only works if you actually care. Fakes get smelled in seconds.\"",
    ],
    speaker: MERCH, cta: "Find their rocks →",
  },
  {
    id: "bridge", mood: MERCH, backdrop: "starfield",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "merchant", node: merchantNode(122), label: "THE MERCHANT", labelColor: MERCH },
    ],
    lines: [
      "He slides a crystal glass of tea across the counter to you — the same move you invented, returned as a lesson.",
      "\"Everyone who climbs your hill is thirsty for something. The trade is simple: find the thirst, serve it first, and the crystal sells itself.\"",
      "\"So — think of a real person you serve. Let's find their rock collection.\"",
    ],
    speaker: MERCH, cta: "The Rock Collection →",
  },
];

const PROMPTS = [
  { key: "whoIServe", label: "THE CLIMBER · WHO YOU SERVE", accent: MERCH,
    prompt: "Name a real person you're trying to win right now — a customer, a client, a boss, a partner. Who are they?" },
  { key: "theirRocks", label: "THE ROCKS · WHAT LIGHTS THEM UP", accent: C.mint,
    prompt: "What's their rock collection — the thing they'd talk about for thirty minutes if you asked? What do they actually care about, worry about, thirst for?" },
  { key: "myQuestion", label: "THE POUR · ONE GENUINE QUESTION", accent: C.gold,
    prompt: "Write the one genuine question you'll ask them this week — a question you honestly want the answer to, with nothing to sell attached." },
];

export default function ChapterThirst({ onComplete, quest }) {
  const [phase, setPhase] = useState("intro");
  const [step, setStep] = useState(0);
  const [vals, setVals] = useState({ whoIServe: "", theirRocks: "", myQuestion: "" });
  const set = (k) => (e) => setVals((v) => ({ ...v, [k]: e.target.value }));

  if (phase === "intro") {
    return (
      <ChapterFrame>
        <Cinematic shots={INTRO} accent={MERCH} onDone={() => setPhase("exercise")} />
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
          <Starfield mood={C.mint} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, paddingTop: "6vh", height: 176 }}>
            {heroNode(94)}{merchantNode(108)}
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ fontSize: 10, ...mono, color: cur.accent, marginBottom: 8 }}>{cur.label} · {step + 1}/{PROMPTS.length}</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.5, color: C.text, marginBottom: 12 }}>{cur.prompt}</p>
            <textarea value={val} onChange={set(cur.key)} placeholder="Write your truth…" style={taStyle(cur.accent)} />
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <Btn accent={MERCH} disabled={!val.trim()} onClick={advance}>{step < PROMPTS.length - 1 ? "Next →" : "Pour the tea →"}</Btn>
            </div>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  if (phase === "mirror") {
    // Scripted merchant reflection (answer-fill): the thirst found, the question ready.
    return (
      <ChapterFrame>
        <div style={fsWrap(SCENE_BG)}>
          <Starfield mood={C.mint} />
          <Embers color={C.mint} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, paddingTop: "6vh", height: 176 }}>
            {heroNode(94)}{merchantNode(108)}
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ textAlign: "center", fontSize: 11, letterSpacing: 3, color: C.mint, ...mono, marginBottom: 10 }}>THE TEA IS SERVED</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 10 }}>
              "So the climber is <span style={{ color: MERCH }}>{echo(vals.whoIServe, "someone you've been pitching instead of meeting")}</span> — and their rock collection is <span style={{ color: C.mint }}>{echo(vals.theirRocks, "the thing you've walked past every time you visited")}</span>. Most traders never look past the doorway. You just did."
            </p>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 14 }}>
              "And this question — <span style={{ color: C.gold }}>{echo(vals.myQuestion, "the one you actually want answered")}</span> — ask it exactly like that, with empty hands. Then be quiet and count to five. What they say next is worth more than any pitch you own."
            </p>
            <div style={{ padding: "12px 14px", borderRadius: 12, background: hexA(C.mint, 0.06), border: `1px solid ${hexA(C.mint, 0.3)}`, marginBottom: 16 }}>
              <Row label="The law" value="Serve the thirst first — the crystal sells itself" accent={C.mint} />
              <Row label="The principle" value="People buy with emotion, justify with logic" accent={C.mint} />
              <Row label="The trap" value="Listening only to reply" accent={C.mint} />
              <Row label="The lid" value="Humor releases the kettle's pressure" accent={C.mint} />
              <Row label="Identity shift" value="Pitcher → Listener" accent={C.mint} />
            </div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 14, lineHeight: 1.5, color: C.textDim, marginBottom: 16 }}>
              "She never did care about the machine. Thirty years on, I promise you her rocks are still the reason the sale happened. There's no way to hold back the river — so be the one who pours it."
            </p>
            <Btn full accent={MERCH} onClick={() => setPhase("seal")}>Raise the glass →</Btn>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  // seal
  const finish = () => {
    quest?.updateDashboard?.({ stage: "Tests", purpose: 6, faith: 5, fear: 5, courage: 6, trust: 6 });
    onComplete?.({
      whoIServe: vals.whoIServe.trim(),
      theirRocks: vals.theirRocks.trim(),
      myQuestion: vals.myQuestion.trim(),
      mentor: "merchant",
    });
  };
  return (
    <ChapterFrame>
      <div style={fsWrap(`radial-gradient(800px 700px at 50% 30%, ${hexA(C.mint, 0.18)}, ${C.night} 60%, ${C.black})`)}>
        <Starfield mood={C.mint} />
        <Embers color={C.mint} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 460, margin: "0 auto", padding: "13vh 22px 50px", textAlign: "center" }}>
          <PhoenixSeal color={C.mint} label="THE THIRST · RAPPORT POURED" />
          <p style={{ ...serif, fontStyle: "italic", fontSize: 16, color: C.text, margin: "14px 0 18px" }}>
            The shop hums now — tea steaming in crystal, strangers becoming regulars. Nobody up here feels sold to; they feel seen. That's the whole secret the river was carrying: find the thirst, serve it first, and people buy the one who cared.
          </p>
          <Btn full accent={C.magenta} onClick={finish}>Carry the glass on →</Btn>
        </div>
      </div>
    </ChapterFrame>
  );
}
