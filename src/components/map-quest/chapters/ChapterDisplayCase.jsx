import React, { useState } from "react";
import {
  ChapterFrame, Cinematic, Btn, taStyle, C, hexA, mono, serif, echo,
  PhoenixSeal, HeroSprite, MentorSprite, Starfield, Embers, Row, fsWrap,
} from "../kit.jsx";

/* =============================================================================
   CHAPTER 8 — THE DISPLAY CASE  ·  sales becomes a science  (key: cr02-the-display-case)
   Coelho beat: the Seeker proposes a display case at the foot of the hill. The
   Merchant fears the risk — "people will bump it, crystal will break… the shop
   is exactly the size I always wanted." The Seeker runs the numbers instead of
   the fear. The Merchant relents with one word: "Maktub — it is written."
   Merchant teachings: fear of change vs calculated risk; Maktub — fate and
   choice coexist (read the omens AND run your numbers AND decide).
   Jon's curriculum (T): the LAW OF PROBABILITY — craps/snake-eyes ≈ 2.7%: ~97%
   "no" is the MATH, not a verdict; find your closing number (track approaches →
   presentations → closes; "Jonny needs 36 approaches → 18 presentations → 6
   sales"); create high probability — the 5 odds-raisers (work ALL the hours,
   sleep routine, fuel/nutrition, practice like Jordan warming up alone, know
   your buyer — don't sell steak in a vegetarian restaurant); first-year
   expectations (the learning curve is tuition; learning matches earning).
   Exercise: Find Your Number → myFunnel + oddsMove.
   Identity shift: gambler → mathematician.
   See alchemist/07_CHAPTER_DOSSIER.md (Arc 2.5 + the Business-mentor reservoir).
   ============================================================================= */

const MERCH = C.power; // the Merchant's crystal-blue accent, shared across Ch7–10
const SCENE_BG = `radial-gradient(900px 700px at 50% 12%, ${hexA(MERCH, 0.16)}, transparent), ${C.black}`;

const heroNode = (size = 100) => <HeroSprite size={size} glow={C.cyan} />;
const merchantNode = (size = 120) => <MentorSprite size={size} color={MERCH} staff={false} />;

const INTRO = [
  {
    id: "idea", mood: MERCH, backdrop: "starfield", kicker: "CHAPTER 8 · THE DISPLAY CASE",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "merchant", node: merchantNode(122), label: "THE MERCHANT", labelColor: MERCH },
    ],
    lines: [
      "The shop is cleaner now, but the hill still scares the customers off. So you bring him an idea: a display case at the FOOT of the hill, where the foot traffic actually is.",
      "The Merchant's hands stop moving. \"People will bump it. Crystal will break. This shop is exactly the size I always wanted… I'm used to the way things are.\"",
      "There it is — the voice that has kept this shop small for thirty years. Fear, dressed up as experience.",
    ],
    speaker: MERCH, cta: "Answer the fear with math →",
  },
  {
    id: "dice", mood: MERCH, backdrop: "starfield",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "merchant", node: merchantNode(122), label: "THE MERCHANT", labelColor: MERCH },
    ],
    lines: [
      "\"Let me tell you what a gambler taught me,\" he says at last, rolling two dice across the counter. \"Snake eyes — both dice on one — lands about three times in a hundred throws.\"",
      "\"Selling is the same table. Roughly ninety-seven in a hundred will say no. Hear me: that is not a verdict on you. That is the MATH.\"",
      "\"In the casino every roll costs money. Out here a roll only costs time. So the question is never 'why did they say no?' The question is: how many rolls until yes?\"",
    ],
    speaker: MERCH, cta: "How many rolls? →",
  },
  {
    id: "number", mood: MERCH, backdrop: "starfield",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "merchant", node: merchantNode(122), label: "THE MERCHANT", labelColor: MERCH },
    ],
    lines: [
      "\"Every trader has a closing number — most never find it. Track three things: approaches, presentations, closes. Do it for a month and selling stops being luck.\"",
      "\"Say six good approaches earn you three real presentations, and three presentations close one deal. Then a trader named Jonny who wants six sales needs thirty-six approaches. Not hope. Arithmetic.\"",
      "\"The days I was angry about no sales? I'd check the tally and find I hadn't made enough approaches to DESERVE one yet. The track sheet never lies. Sales becomes a science.\"",
    ],
    speaker: MERCH, cta: "And the odds themselves? →",
  },
  {
    id: "odds", mood: MERCH, backdrop: "embers",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "merchant", node: merchantNode(122), label: "THE MERCHANT", labelColor: MERCH },
    ],
    lines: [
      "\"Unlike dice, you can load these. Five ways: work ALL the hours you committed to — every skipped hour lowers the odds. Guard your sleep. Fuel the machine — the body is the vehicle the trade rides in.\"",
      "\"Practice when nobody's watching — the great ones warm up alone, an hour before anyone arrives. And know your buyer: don't sell steak at a vegetarian table.\"",
      "\"One more thing, because you're new: the first year is tuition, not failure. My first year I earned almost nothing and learned almost everything. Your learning will match your earning — eventually.\"",
    ],
    speaker: MERCH, cta: "So… the display case? →",
  },
  {
    id: "maktub", mood: MERCH, backdrop: "starfield",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "merchant", node: merchantNode(122), label: "THE MERCHANT", labelColor: MERCH },
    ],
    lines: [
      "The Merchant looks down the hill for a long time. At the foot traffic. At the numbers you've laid on the counter next to his fear.",
      "\"Maktub,\" he finally says. \"It is written. Build your case.\"",
      "\"But understand the word before you borrow it: fate deals the dice — YOU still choose how many times to roll. Read the omens, run your numbers, and decide. Now — find YOUR number.\"",
    ],
    speaker: MERCH, cta: "Find your number →",
  },
];

const PROMPTS = [
  { key: "myFunnel", label: "THE TRACK SHEET · YOUR CLOSING NUMBER", accent: MERCH,
    prompt: "Map your funnel, even as a first guess: how many approaches (calls, doors, DMs, applications) get you one real presentation — and how many presentations get you one yes? Write the chain." },
  { key: "oddsMove", label: "LOAD THE DICE · ONE ODDS-RAISER", accent: C.gold,
    prompt: "Of the five odds-raisers — all the hours, sleep, fuel, lonely practice, know your buyer — which one are you cheating on right now, and what will you do about it this week?" },
];

export default function ChapterDisplayCase({ onComplete, quest }) {
  const [phase, setPhase] = useState("intro");
  const [step, setStep] = useState(0);
  const [vals, setVals] = useState({ myFunnel: "", oddsMove: "" });
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
              <Btn accent={MERCH} disabled={!val.trim()} onClick={advance}>{step < PROMPTS.length - 1 ? "Next →" : "Show him the math →"}</Btn>
            </div>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  if (phase === "mirror") {
    // Scripted merchant reflection (answer-fill): the funnel named, the odds loaded.
    return (
      <ChapterFrame>
        <div style={fsWrap(SCENE_BG)}>
          <Starfield mood={MERCH} />
          <Embers color={MERCH} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, paddingTop: "6vh", height: 176 }}>
            {heroNode(94)}{merchantNode(108)}
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ textAlign: "center", fontSize: 11, letterSpacing: 3, color: MERCH, ...mono, marginBottom: 10 }}>THE CASE GOES UP</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 10 }}>
              "So your chain is <span style={{ color: MERCH }}>{echo(vals.myFunnel, "still a guess — which is fine; a guess you track becomes a number")}</span>. Watch it for a month and correct it. From now on a slow day isn't a verdict — it's a shortage of rolls."
            </p>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 14 }}>
              "And you'll stop cheating on <span style={{ color: C.gold }}>{echo(vals.oddsMove, "the habit you already knew you were dodging")}</span>. Good. That's how a trader loads the dice without touching them."
            </p>
            <div style={{ padding: "12px 14px", borderRadius: 12, background: hexA(MERCH, 0.06), border: `1px solid ${hexA(MERCH, 0.3)}`, marginBottom: 16 }}>
              <Row label="The law" value="~97% say no — that's the math, not a verdict" accent={MERCH} />
              <Row label="The tool" value="Track approaches → presentations → closes" accent={MERCH} />
              <Row label="The trap" value="Letting fear vote where numbers should" accent={MERCH} />
              <Row label="Maktub" value="Fate deals the dice; you choose how often to roll" accent={MERCH} />
              <Row label="Identity shift" value="Gambler → Mathematician" accent={MERCH} />
            </div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 14, lineHeight: 1.5, color: C.textDim, marginBottom: 16 }}>
              "Thirty years I let 'people might bump the case' beat 'people might buy the crystal.' Don't inherit my arithmetic. Yours is better."
            </p>
            <Btn full accent={MERCH} onClick={() => setPhase("seal")}>Bolt the case down →</Btn>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  // seal
  const finish = () => {
    quest?.updateDashboard?.({ stage: "Tests", purpose: 6, faith: 5, fear: 5, courage: 6, trust: 5 });
    onComplete?.({
      myFunnel: vals.myFunnel.trim(),
      oddsMove: vals.oddsMove.trim(),
      mentor: "merchant",
    });
  };
  return (
    <ChapterFrame>
      <div style={fsWrap(`radial-gradient(800px 700px at 50% 30%, ${hexA(MERCH, 0.2)}, ${C.night} 60%, ${C.black})`)}>
        <Starfield mood={MERCH} />
        <Embers color={MERCH} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 460, margin: "0 auto", padding: "13vh 22px 50px", textAlign: "center" }}>
          <PhoenixSeal color={MERCH} label="DISPLAY CASE · THE NUMBERS HOLD" />
          <p style={{ ...serif, fontStyle: "italic", fontSize: 16, color: C.text, margin: "14px 0 18px" }}>
            By week's end the case at the foot of the hill has doubled the shop's trade — and nobody bumped it. The fear was a story; the funnel was a fact. You have a closing number now. Rejection is just a roll of the dice on the way to it.
          </p>
          <Btn full accent={C.magenta} onClick={finish}>Roll again →</Btn>
        </div>
      </div>
    </ChapterFrame>
  );
}
