import React, { useState } from "react";
import {
  ChapterFrame, Cinematic, Btn, taStyle, C, hexA, mono, serif, echo,
  PhoenixSeal, HeroSprite, MentorSprite, Starfield, Embers, Row, fsWrap,
} from "../kit.jsx";

/* =============================================================================
   CHAPTER 7 — THE CRYSTAL SHOP  ·  the Merchant arc begins  (key: cr01-the-crystal-shop)
   Coelho beat: broke after the robbery, the Seeker climbs the hill to a dusty
   crystal shop — and starts polishing the glasses BEFORE any deal exists. Two
   customers walk in while he works: a good omen. The Merchant hires him —
   "the old Code obliges me to feed the hungry" — fair commission, honest terms.
   Merchant teachings: work before the ask; hospitality/fairness as the
   foundation of trade.
   Jon's curriculum (T): the INNER SALE — fall in love with commission-only
   (mom's "you're crazy"); choose the right product (own it, love it, believe
   it); choose the right organization (hundreds winning, not one or two);
   enthusiasm = en-theos, "the God within" — 50% of any sale is a transfer of
   enthusiasm (Tracy); enthusiasm ≠ excitement (internal vs external); tonality
   & body language carry 70–93% of the message; moderation — spice, not the meal.
   Exercise: Polish the Crystal → whatISell + whyIBelieveIt + enthusiasmSource.
   Identity shift: employee-minded → commission-hearted.
   See alchemist/07_CHAPTER_DOSSIER.md (Arc 2.5 + the Business-mentor reservoir).
   ============================================================================= */

const MERCH = C.power; // the Merchant's crystal-blue accent, shared across Ch7–10
const SCENE_BG = `radial-gradient(900px 700px at 50% 12%, ${hexA(MERCH, 0.16)}, transparent), ${C.black}`;

const heroNode = (size = 100) => <HeroSprite size={size} glow={C.cyan} />;
const merchantNode = (size = 120) => <MentorSprite size={size} color={MERCH} staff={false} />;

const INTRO = [
  {
    id: "hill", mood: MERCH, backdrop: "starfield", kicker: "CHAPTER 7 · THE CRYSTAL SHOP",
    cast: [{ id: "hero", node: heroNode(116), label: "YOU" }],
    lines: [
      "Pockets empty. Stomach emptier. The Undercity took everything except your legs — so you climb.",
      "At the top of the hill sits a crystal shop nobody visits anymore. Dust on every shelf. Glass that forgot how to catch the light.",
      "Through the window, an old trader watches the empty street like he's been watching it for thirty years.",
    ],
    speaker: C.text, cta: "Step inside →",
  },
  {
    id: "polish", mood: MERCH, backdrop: "starfield",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "merchant", node: merchantNode(122), label: "THE MERCHANT", labelColor: MERCH },
    ],
    lines: [
      "You don't pitch him. You don't beg. You pick up a rag and start polishing the glasses in the window — work first, ask later.",
      "While you work, two customers walk in. The first in days. The Merchant watches them buy, then watches you.",
      "\"That was a good omen,\" he says. \"Work for me. The old Code obliges me to feed the hungry — and fair is fair: you'll earn a cut of every piece you sell.\"",
    ],
    speaker: MERCH, cta: "A cut? Not a wage? →",
  },
  {
    id: "commission", mood: MERCH, backdrop: "starfield",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "merchant", node: merchantNode(122), label: "THE MERCHANT", labelColor: MERCH },
    ],
    lines: [
      "\"A cut scares people. When I was young my own mother said I was crazy to work for commission. No convincing her — until the results waved back.\"",
      "\"But hear me: a wage is a ceiling someone else builds. A commission is a door YOU open. If you sell, you eat like a king. If you don't — you learn to sell.\"",
      "\"First, though, three things must be true. You must believe in the glass. You must trade where winners trade — hundreds of them, not one or two. And you must carry the fire.\"",
    ],
    speaker: MERCH, cta: "The fire? →",
  },
  {
    id: "entheos", mood: MERCH, backdrop: "embers",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "merchant", node: merchantNode(122), label: "THE MERCHANT", labelColor: MERCH },
    ],
    lines: [
      "\"The old word is en-theos — the God within. Enthusiasm. Half of any sale is nothing but the transfer of that fire from your chest to theirs.\"",
      "\"Don't confuse it with excitement. Excitement is external — it dies in week two, when the job gets hard. Enthusiasm is internal. It survives the rain.\"",
      "\"And it doesn't live in your words. Seventy to ninety-three percent of your message is HOW you say it — tone, hands, eyes. People buy with emotion and justify with logic. Use it like spice, not the meal.\"",
    ],
    speaker: MERCH, cta: "Then hand me the rag →",
  },
  {
    id: "bridge", mood: MERCH, backdrop: "starfield",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "merchant", node: merchantNode(122), label: "THE MERCHANT", labelColor: MERCH },
    ],
    lines: [
      "He sets three unpolished glasses on the counter between you.",
      "\"Before you sell a single piece of crystal, there's an inner sale to close. Every trader makes it or fakes it — and customers always smell the fakes.\"",
      "\"So polish these three truths until they shine: what you sell, why you believe in it, and where your fire comes from.\"",
    ],
    speaker: MERCH, cta: "Polish the crystal →",
  },
];

const PROMPTS = [
  { key: "whatISell", label: "FIRST GLASS · WHAT YOU SELL", accent: MERCH,
    prompt: "What are you really selling right now — a product, a service, a skill, yourself? Name it plainly." },
  { key: "whyIBelieveIt", label: "SECOND GLASS · WHY YOU BELIEVE", accent: C.gold,
    prompt: "Why do you believe in it? Would you buy it yourself? If the belief is shaky, write what would make it solid." },
  { key: "enthusiasmSource", label: "THIRD GLASS · WHERE THE FIRE LIVES", accent: C.cyan,
    prompt: "Excitement is external and dies fast. What's your internal source of enthusiasm — the thing about this work that lights you up with no audience watching?" },
];

export default function ChapterCrystalShop({ onComplete, quest }) {
  const [phase, setPhase] = useState("intro");
  const [step, setStep] = useState(0);
  const [vals, setVals] = useState({ whatISell: "", whyIBelieveIt: "", enthusiasmSource: "" });
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
          <Starfield mood={MERCH} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, paddingTop: "6vh", height: 176 }}>
            {heroNode(94)}{merchantNode(108)}
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ fontSize: 10, ...mono, color: cur.accent, marginBottom: 8 }}>{cur.label} · {step + 1}/{PROMPTS.length}</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.5, color: C.text, marginBottom: 12 }}>{cur.prompt}</p>
            <textarea value={val} onChange={set(cur.key)} placeholder="Write your truth…" style={taStyle(cur.accent)} />
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <Btn accent={MERCH} disabled={!val.trim()} onClick={advance}>{step < PROMPTS.length - 1 ? "Next glass →" : "Show him the shine →"}</Btn>
            </div>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  if (phase === "mirror") {
    // Scripted merchant reflection (answer-fill): the inner sale, closed in the player's own words.
    return (
      <ChapterFrame>
        <div style={fsWrap(SCENE_BG)}>
          <Starfield mood={MERCH} />
          <Embers color={MERCH} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, paddingTop: "6vh", height: 176 }}>
            {heroNode(94)}{merchantNode(108)}
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ textAlign: "center", fontSize: 11, letterSpacing: 3, color: MERCH, ...mono, marginBottom: 10 }}>THE GLASS CATCHES LIGHT</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 10 }}>
              "So you sell <span style={{ color: MERCH }}>{echo(vals.whatISell, "something you haven't dared to name until now")}</span> — good. A trader who can't name his trade sells nothing."
            </p>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 10 }}>
              "And you believe in it because <span style={{ color: C.gold }}>{echo(vals.whyIBelieveIt, "some part of you already knows it's worth more than you charge")}</span>. Customers can't hear your pitch — but they can smell your doubt."
            </p>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 14 }}>
              "As for the fire — <span style={{ color: C.cyan }}>{echo(vals.enthusiasmSource, "the quiet reason you'd do this with nobody watching")}</span>. That's en-theos. That one doesn't die in week two."
            </p>
            <div style={{ padding: "12px 14px", borderRadius: 12, background: hexA(MERCH, 0.06), border: `1px solid ${hexA(MERCH, 0.3)}`, marginBottom: 16 }}>
              <Row label="The law" value="Work before the ask — polish first, then trade" accent={MERCH} />
              <Row label="The math" value="Half of any sale is transferred enthusiasm" accent={MERCH} />
              <Row label="The trap" value="Excitement is external; it dies in week two" accent={MERCH} />
              <Row label="Identity shift" value="Employee-minded → Commission-hearted" accent={MERCH} />
            </div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 14, lineHeight: 1.5, color: C.textDim, marginBottom: 16 }}>
              "A ceiling built by someone else, or a door you open yourself. You just chose the door. Tomorrow we put crystal where the street can see it."
            </p>
            <Btn full accent={MERCH} onClick={() => setPhase("seal")}>Take the apron →</Btn>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  // seal
  const finish = () => {
    quest?.updateDashboard?.({ stage: "Tests", purpose: 5, faith: 4, fear: 6, courage: 5, trust: 5 });
    onComplete?.({
      whatISell: vals.whatISell.trim(),
      whyIBelieveIt: vals.whyIBelieveIt.trim(),
      enthusiasmSource: vals.enthusiasmSource.trim(),
      mentor: "merchant",
    });
  };
  return (
    <ChapterFrame>
      <div style={fsWrap(`radial-gradient(800px 700px at 50% 30%, ${hexA(MERCH, 0.2)}, ${C.night} 60%, ${C.black})`)}>
        <Starfield mood={MERCH} />
        <Embers color={MERCH} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 460, margin: "0 auto", padding: "13vh 22px 50px", textAlign: "center" }}>
          <PhoenixSeal color={MERCH} label="CRYSTAL SHOP · THE INNER SALE" />
          <p style={{ ...serif, fontStyle: "italic", fontSize: 16, color: C.text, margin: "14px 0 18px" }}>
            The shop looks different tonight — or maybe you do. You came up the hill hungry and pitched nothing; you polished glass, and the work itself made the sale. The first customer you ever closed was you.
          </p>
          <Btn full accent={C.magenta} onClick={finish}>Carry the fire on →</Btn>
        </div>
      </div>
    </ChapterFrame>
  );
}
