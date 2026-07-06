import React, { useState } from "react";
import {
  ChapterFrame, Cinematic, Btn, taStyle, C, hexA, mono, serif, echo,
  PhoenixSeal, HeroSprite, MentorSprite, Starfield, Embers, Row, fsWrap,
} from "../kit.jsx";

/* =============================================================================
   CHAPTER 10 — THE MERCHANT'S DREAM  ·  the close  (key: cr04-the-merchants-dream)
   Coelho beat: the Merchant names the five duties of his old Code — and admits
   he lives only four. The fifth is his Mecca, the pilgrimage he keeps
   deliberately unfulfilled: "I'm afraid that if my dream is realized, I'll have
   no reason to go on living… You want to realize your dreams. I just want to
   dream." Then the harder confession — "every blessing ignored becomes a
   curse." After eleven months and nine days the Seeker's ledger is full: the
   comfortable exit fully funded — and the Merchant delivers the prophetic
   close: "You know that I'm not going to Mecca. Just as you know that you're
   not going to buy your sheep." The Seeker must close the deal on himself.
   Merchant teachings: the five-duties omission; the dream-as-museum-piece;
   every blessing ignored becomes a curse; the prophetic close; the funded exit
   refused — wherever your heart is, there is your treasure.
   Jon's curriculum (T): the CLOSE — No Means Know (objections are requests for
   info: "shop around" = tell me about competitors; "price" = tell me about
   value); sympathy vs empathy (sorry salespeople sympathize and lose; closers
   empathize and close); why people don't buy — You / The Product / The Company;
   value must exceed price (the two-sided scale; value-stack — never just drop
   the price; then ask or ASSUME the sale); don't sell snow to an Eskimo (the
   father's integrity lesson).
   Exercise: Close Yourself → myObjection + valueStack + theClose.
   Identity shift: the merchant-who-waits → the closer-who-goes.
   See alchemist/07_CHAPTER_DOSSIER.md (Arc 2.5 + the Business-mentor reservoir).
   ============================================================================= */

const MERCH = C.power; // the Merchant's crystal-blue accent, shared across Ch7–10
const SCENE_BG = `radial-gradient(900px 700px at 50% 12%, ${hexA(MERCH, 0.16)}, transparent), ${C.black}`;

const heroNode = (size = 100) => <HeroSprite size={size} glow={C.cyan} />;
const merchantNode = (size = 120) => <MentorSprite size={size} color={MERCH} staff={false} />;

const INTRO = [
  {
    id: "close-school", mood: MERCH, backdrop: "starfield", kicker: "CHAPTER 10 · THE MERCHANT'S DREAM",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "merchant", node: merchantNode(122), label: "THE MERCHANT", labelColor: MERCH },
    ],
    lines: [
      "The shop thrives. Tonight the Merchant teaches you the last craft: the close.",
      "\"When a customer says no, hear KNOW. 'I want to shop around' means: tell me why you beat the others. 'Too expensive' means: show me more value. An objection is never a wall — it's a question wearing armor.\"",
      "\"And never answer it with sympathy. Sorry traders feel sorry — 'you're right, times are hard' — and lose. Closers feel it WITH them — 'I completely understand, I'd feel the same' — and keep going. Empathy closes. Pity apologizes.\"",
    ],
    speaker: MERCH, cta: "Why do people really walk? →",
  },
  {
    id: "three-reasons", mood: MERCH, backdrop: "starfield",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "merchant", node: merchantNode(122), label: "THE MERCHANT", labelColor: MERCH },
    ],
    lines: [
      "\"When a sale dies, it dies for one of three reasons. YOU — they didn't trust or like you enough. THE PRODUCT — you never showed how it solves their problem. THE COMPANY — they doubt anyone will stand behind it tomorrow. Diagnose honestly; it's always one of the three.\"",
      "\"Then remember the scale. Price on one side, value on the other. Mention price too early and it outweighs everything — so stack the value back: what they loved, the guarantees, the proof, the care. When value clearly exceeds price… you don't beg for the sale. You assume it.\"",
      "\"One law above all of it, from my own father: I could sell snow to a man surrounded by snow — that doesn't mean I should. Close people INTO what they need, never into what they don't. That's the whole difference between a closer and a thief.\"",
    ],
    speaker: MERCH, cta: "Then why is he staring at the ledger? →",
  },
  {
    id: "ledger", mood: MERCH, backdrop: "starfield",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "merchant", node: merchantNode(122), label: "THE MERCHANT", labelColor: MERCH },
    ],
    lines: [
      "He opens the ledger. Eleven months and nine days since you climbed the hill hungry.",
      "\"Look at your cut. It's enough. Enough to go home, buy back everything you lost in the Undercity, and live comfortably — the full price of the safe life, in cash.\"",
      "\"Before you answer, let me finally tell you about MY dream. You've earned the truth.\"",
    ],
    speaker: MERCH, cta: "Hear the confession →",
  },
  {
    id: "mecca", mood: MERCH, backdrop: "embers",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "merchant", node: merchantNode(126), label: "THE MERCHANT", labelColor: MERCH },
    ],
    lines: [
      "\"The old Code asks five duties of a trader's life. I have kept four all my days. The fifth is a pilgrimage — my Mecca, the far shrine every believer must stand before once. I have the money. I've had it for years.\"",
      "\"I'm afraid that if my dream is realized, I'll have no reason to go on living. You want to REALIZE your dreams. I only want to keep dreaming mine — a museum piece I polish and never touch.\"",
      "\"And here is what your year in my shop taught me, boy: every blessing ignored becomes a curse. You showed me horizons I'd stopped seeing — and now I know exactly what I'm refusing. I feel poorer than before you came.\"",
    ],
    speaker: MERCH, cta: "…why are you telling me this? →",
  },
  {
    id: "prophecy", mood: MERCH, backdrop: "embers",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "merchant", node: merchantNode(126), label: "THE MERCHANT", labelColor: MERCH },
    ],
    lines: [
      "\"Because you're standing where I stood thirty years ago — one comfortable decision away from becoming me.\"",
      "He closes the ledger and looks straight at you. \"You know that I'm not going to Mecca. Just as you know that you're not going to buy back those sheep.\"",
      "\"There's one customer left in this shop, and one deal on the table: your own dream. Objections and all. Let's see if you learned to close.\"",
    ],
    speaker: MERCH, cta: "Close yourself →",
  },
];

const PROMPTS = [
  { key: "myObjection", label: "NO MEANS KNOW · YOUR OWN OBJECTION", accent: MERCH,
    prompt: "What's the objection you keep raising against your own dream — 'not enough time,' 'not ready,' 'too risky,' 'people will think I'm crazy'? Write it — then reframe it: what do you actually need to KNOW to move?" },
  { key: "valueStack", label: "THE SCALE · STACK THE VALUE", accent: C.gold,
    prompt: "Stack the value like a closer: what does saying YES to your dream actually buy you — the freedom, the person you become, the life on the other side? Pile it up until it visibly outweighs the price." },
  { key: "theClose", label: "ASSUME THE SALE · THE DECISION", accent: C.cyan,
    prompt: "Now write the close — one decision sentence in present tense, as if the deal is already done. Not 'I'll try.' Closers assume the sale." },
];

export default function ChapterMerchantsDream({ onComplete, quest }) {
  const [phase, setPhase] = useState("intro");
  const [step, setStep] = useState(0);
  const [vals, setVals] = useState({ myObjection: "", valueStack: "", theClose: "" });
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
              <Btn accent={MERCH} disabled={!val.trim()} onClick={advance}>{step < PROMPTS.length - 1 ? "Next →" : "Sign it →"}</Btn>
            </div>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  if (phase === "mirror") {
    // Scripted merchant reflection (answer-fill): the Seeker's own close, witnessed.
    return (
      <ChapterFrame>
        <div style={fsWrap(SCENE_BG)}>
          <Starfield mood={MERCH} />
          <Embers color={C.gold} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, paddingTop: "6vh", height: 176 }}>
            {heroNode(94)}{merchantNode(108)}
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ textAlign: "center", fontSize: 11, letterSpacing: 3, color: MERCH, ...mono, marginBottom: 10 }}>THE DEAL ON THE TABLE</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 10 }}>
              "Your objection — <span style={{ color: MERCH }}>{echo(vals.myObjection, "the armored question you've been calling a fact")}</span> — hear it now the way a closer hears it. That was never a no. It was a KNOW. You just told yourself what you need to find out."
            </p>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 10 }}>
              "And the scale — look at it: <span style={{ color: C.gold }}>{echo(vals.valueStack, "everything the yes buys you, stacked higher than the fear")}</span>. Value exceeds price. When the scale tips like that, a real trader doesn't hesitate — he assumes."
            </p>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 14 }}>
              "So say it once more, out loud this time: <span style={{ color: C.cyan }}>{echo(vals.theClose, "the decision, present tense, already done")}</span>. …Sold."
            </p>
            <div style={{ padding: "12px 14px", borderRadius: 12, background: hexA(MERCH, 0.06), border: `1px solid ${hexA(MERCH, 0.3)}`, marginBottom: 16 }}>
              <Row label="No means Know" value="An objection is a question wearing armor" accent={MERCH} />
              <Row label="The scale" value="Stack value until it outweighs price — then assume" accent={MERCH} />
              <Row label="The warning" value="Every blessing ignored becomes a curse" accent={MERCH} />
              <Row label="The integrity" value="Never sell snow to an Eskimo — yourself included" accent={MERCH} />
              <Row label="Identity shift" value="Merchant-who-waits → Closer-who-goes" accent={MERCH} />
            </div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 14, lineHeight: 1.5, color: C.textDim, marginBottom: 16 }}>
              "I said you'd never buy those sheep. Tonight, for the first time in thirty years, I'm glad to lose a close. Go. And when your road passes a far shrine… stand before it once for an old trader who only dreamed."
            </p>
            <Btn full accent={MERCH} onClick={() => setPhase("seal")}>Shake his hand →</Btn>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  // seal
  const finish = () => {
    quest?.updateDashboard?.({ stage: "Tests", purpose: 7, faith: 6, fear: 5, courage: 6, trust: 6 });
    onComplete?.({
      myObjection: vals.myObjection.trim(),
      valueStack: vals.valueStack.trim(),
      theClose: vals.theClose.trim(),
      mentor: "merchant",
    });
  };
  return (
    <ChapterFrame>
      <div style={fsWrap(`radial-gradient(800px 700px at 50% 30%, ${hexA(MERCH, 0.2)}, ${C.night} 60%, ${C.black})`)}>
        <Starfield mood={MERCH} />
        <Embers color={C.gold} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 460, margin: "0 auto", padding: "13vh 22px 50px", textAlign: "center" }}>
          <PhoenixSeal color={MERCH} label="THE MERCHANT'S DREAM · DEAL CLOSED" />
          <p style={{ ...serif, fontStyle: "italic", fontSize: 16, color: C.text, margin: "14px 0 18px" }}>
            You leave the crystal shop with a year of the trade in your hands and the only close that ever mattered signed in your own words. Behind you, an old man polishes a dream he'll never visit. Ahead, the road bends toward the desert — and someone is already standing in it, arms crossed, waiting to test you.
          </p>
          <Btn full accent={C.magenta} onClick={finish}>Take the road →</Btn>
        </div>
      </div>
    </ChapterFrame>
  );
}
