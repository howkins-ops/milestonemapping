import React, { useState, useEffect } from "react";
import {
  C, hexA, mono, serif, echo, fsWrap,
  ChapterFrame, Cinematic, Btn, taStyle, Row,
  AnswerJournal, PhoenixSeal, EssenceBurst,
  HeroSprite, CrownedSprite, Starfield, Embers, ForestBackdrop,
} from "../kit.jsx";

/* =============================================================================
   CHAPTER 9 — THE NEON CHAPEL  ·  Addict Saint ↔ Love  (shadow: addict_saint)
   Coelho beat: the camel driver and the present moment — peace lives in NOW;
   anxiety lives in imagined futures; escape only replaces the feeling for a
   while, it never feeds it.
   Consent: (Tr) depth — active-addiction shipped FICTIONALIZED as a saint who
   numbs the ache inside a chapel of beautiful escapes. The (T) triumph ships in
   Jon's voice: the public sobriety vow made in the hardest city on earth to
   quit, with a standing bounty to anyone who caught a slip — "before I could
   tell anyone to stop, I had to stop myself."
   Exercise — Compassionate Interruption → escapeFrom, interrupt. Reforge → LOVE.
   Lesson: compassion interrupts the loop better than shame. See 07_CHAPTER_DOSSIER.md.
   ============================================================================= */

const PINK = C.hotPink;
const SCENE_BG = `radial-gradient(900px 700px at 50% 12%, ${hexA(PINK, 0.15)}, transparent), ${C.black}`;

const INTRO = [
  {
    id: "chapel", mood: PINK, backdrop: "starfield", kicker: "CHAPTER 9 · THE NEON CHAPEL",
    cast: [{ id: "hero", node: <HeroSprite size={116} glow={C.cyan} />, label: "YOU" }],
    lines: [
      "Past the forge, the road opens onto a chapel built of light — stained-glass made of screens, candles that are really little glowing bottles, incense that smells like every comfort you've ever reached for.",
      "It is the most beautiful place you have seen on the whole road. Every surface promises the same thing in a soft pink hum: rest here. Stop feeling that. Just for a while.",
    ],
    speaker: C.text, cta: "Step inside →",
  },
  {
    id: "saint", mood: PINK, backdrop: "embers",
    cast: [
      { id: "hero", node: <HeroSprite size={96} glow={C.cyan} />, label: "YOU" },
      { id: "saint", node: <CrownedSprite size={118} baseColor={PINK} revealed />, label: "THE ADDICT SAINT", labelColor: PINK },
    ],
    lines: [
      "At the altar kneels a saint with a cracked halo, surrounded by worshippers who never look up. He lifts a glowing chalice and drinks, and for a breath his whole body unclenches.",
      "\"Welcome, traveler. There's an ache in you — I can see it from here. You don't have to carry it. I have something for that.\" He offers you the chalice. \"Everyone deserves a little relief.\"",
    ],
    speaker: PINK, cta: "\"What is this place?\" →",
  },
  {
    id: "mirror", mood: PINK, backdrop: "embers",
    cast: [
      { id: "hero", node: <HeroSprite size={106} glow={C.cyan} />, label: "THE GLASS · YOU" },
      { id: "saint", node: <CrownedSprite size={122} baseColor={PINK} revealed />, label: "THE ALTAR · HIM", labelColor: PINK },
    ],
    lines: [
      "He turns the chalice toward you, and the surface holds your reflection — your hood, your light. Then he leans in beside it. His shape is your shape. The same silhouette. Only — he wears a crown of candle-smoke.",
      "\"I'm not a stranger. I'm you — the part of you that already knows how to disappear when it hurts. The scroll, the drink, the screen, the busy. Whatever lets you skip the feeling.\"",
      "\"They call me a saint because I never make anyone feel pain. But look closer. The ache never left. I just got very good at not being here for it.\"",
    ],
    speaker: PINK, cta: "\"How did you become this?\" →",
  },
  {
    id: "origin1", mood: C.cyan, backdrop: "embers",
    cast: [{ id: "saint", node: <CrownedSprite size={120} baseColor={PINK} revealed />, label: "THE ADDICT SAINT", labelColor: PINK }],
    lines: [
      "\"It started so kindly. There was an ache I couldn't name, and the first time I numbed it, the relief felt like grace. So I came back. Then I lived here.\"",
      "\"Years went by inside this chapel. I told myself I was at peace. Really I was just never in the room where the feeling was. Anxiety always lives in the future I'm imagining — never in the now I'm running from.\"",
    ],
    speaker: C.cyan, cta: "Keep watching →",
  },
  {
    id: "origin2", mood: C.danger, backdrop: "embers",
    cast: [{ id: "saint", node: <CrownedSprite size={126} baseColor={PINK} revealed />, label: "THE ADDICT SAINT", labelColor: PINK }],
    lines: [
      "\"Then one night I tried to keep a promise to myself, and I couldn't. I sat at the kitchen table and thought: I can't even keep my own integrity. The escape that was supposed to save me had quietly become the thing eating me.\"",
      "\"That's the trap, traveler. The chalice doesn't feed the ache. It only replaces the feeling — for an hour. The ache comes back hungrier, and shame keeps you kneeling here so you never get up and feel it through.\"",
    ],
    speaker: C.danger, cta: "Can it be undone? →",
  },
  {
    id: "interrupt", mood: C.mint, backdrop: "starfield",
    cast: [
      { id: "hero", node: <HeroSprite size={104} glow={C.cyan} />, label: "YOU" },
      { id: "saint", node: <CrownedSprite size={120} baseColor={PINK} revealed />, label: "THE ADDICT SAINT", labelColor: PINK },
    ],
    lines: [
      "\"Once, a man made his vow out loud in the hardest city on earth to keep it — neon and temptation on every corner — and put a bounty on his own slip, so anyone who caught him would be paid to stop him.\"",
      "\"His secret wasn't more willpower. It was this: before he could ever tell anyone else to stop, he had to stop himself — and he learned to do it with compassion, not a whip. Shame keeps the loop turning. Kindness interrupts it.\"",
      "\"So step to the altar and answer me honest. What do you reach for to escape — and what kinder thing could you do instead?\"",
    ],
    speaker: C.mint, cta: "Step to the altar →",
  },
];

const PROMPTS = [
  {
    key: "escapeFrom", label: "NAME THE ACHE", accent: PINK,
    prompt: "What feeling do you reach to numb or escape? Name the ache underneath — the one you're really running from.",
    placeholder: "The real feeling I numb is…",
  },
  {
    key: "interrupt", label: "THE KINDER INTERRUPTION", accent: C.mint,
    prompt: "One kinder interruption — a clean \"no\" + a healthier move — you'll use next time the urge hits.",
    placeholder: "Next time the urge hits, I'll say no and instead…",
  },
];

export default function ChapterNeonChapel({ onComplete, quest }) {
  const [phase, setPhase] = useState("intro");
  const [step, setStep] = useState(0);
  const [vals, setVals] = useState({ escapeFrom: "", interrupt: "" });
  const [reforged, setReforged] = useState(false);
  const set = (k) => (e) => setVals((v) => ({ ...v, [k]: e.target.value }));

  // reforge: flip the crowned shadow from wounded pink → healed mint after a beat
  useEffect(() => {
    if (phase !== "reforge") return;
    const t = setTimeout(() => setReforged(true), 1400);
    return () => clearTimeout(t);
  }, [phase]);

  // TODO: askMentor() — scripted for now; the live mentor reply ships via a
  // server proxy. NEVER put an API key in client code (no fetch from here).

  if (phase === "intro") {
    return (
      <ChapterFrame>
        <Cinematic shots={INTRO} accent={PINK} onDone={() => setPhase("exercise")} />
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
          <Starfield mood={PINK} />
          <Embers on color={PINK} count={10} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", paddingTop: "6vh", height: 176 }}>
            <CrownedSprite size={112} baseColor={PINK} revealed />
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ fontSize: 10, ...mono, color: cur.accent, marginBottom: 8 }}>COMPASSIONATE INTERRUPTION · {cur.label} · {step + 1}/{PROMPTS.length}</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.5, color: C.text, marginBottom: 12 }}>{cur.prompt}</p>
            <textarea value={val} onChange={set(cur.key)} placeholder={cur.placeholder} style={taStyle(cur.accent)} />
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <Btn accent={PINK} disabled={!val.trim()} onClick={advance}>{step < PROMPTS.length - 1 ? "Next →" : "Hold up the glass →"}</Btn>
            </div>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  if (phase === "mirror") {
    return (
      <ChapterFrame>
        <div style={fsWrap(`radial-gradient(800px 700px at 50% 20%, ${hexA(PINK, 0.18)}, ${C.night} 55%, ${C.black})`)}>
          <Starfield mood={C.mint} />
          <Embers on color={PINK} count={10} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", paddingTop: "6vh", height: 188 }}>
            <CrownedSprite size={132} baseColor={PINK} revealed />
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ textAlign: "center", fontSize: 11, letterSpacing: 3, color: PINK, ...mono, marginBottom: 10 }}>THE ALTAR MIRROR · what you just named</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 16, lineHeight: 1.55, color: C.text, marginBottom: 10 }}>
              The saint looks at your words and the chalice trembles in his hand. "You said the ache you keep running from is <span style={{ color: PINK }}>{echo(vals.escapeFrom, "the feeling you won't sit still long enough to name")}</span>."
            </p>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 16, lineHeight: 1.55, color: C.text, marginBottom: 10 }}>
              "And the kinder thing — the clean no, the healthier move — is to <span style={{ color: C.mint }}>{echo(vals.interrupt, "pause, breathe, and stay in the room with the feeling instead of fleeing it")}</span>."
            </p>
            <div style={{ padding: "16px 16px", borderRadius: 16, background: `linear-gradient(160deg, ${hexA(PINK, .12)}, ${C.cardDeep})`, border: `1px solid ${hexA(PINK, .4)}`, marginBottom: 14 }}>
              <p style={{ ...serif, fontSize: 18, lineHeight: 1.5, color: C.text, margin: "0 0 8px" }}>"The chalice never fed the ache. It just <span style={{ color: PINK }}>replaced the feeling</span> for an hour. Then it came back hungrier — and shame kept me kneeling."</p>
              <p style={{ ...serif, fontSize: 16, lineHeight: 1.5, color: C.mint, margin: 0, fontStyle: "italic" }}>"Compassion interrupts the loop. Shame only feeds it. You don't numb the ache — you meet it, here, in the present, with love."</p>
            </div>
            <p style={{ fontSize: 13, color: C.textDim, fontStyle: "italic", marginBottom: 14, textAlign: "center" }}>
              "The Addict Saint is a story that began on a night the ache felt unbearable. Let's interrupt it — gently, right now — and reforge it into something that can hold you."
            </p>
            <Btn full accent={PINK} onClick={() => setPhase("reforge")}>Interrupt the loop with love →</Btn>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  // reforge + seal
  const finish = () => {
    quest?.updateDashboard?.({ stage: "Tests", purpose: 7, faith: 6, fear: 6, courage: 7, trust: 6 });
    onComplete?.({
      shadow: "addict_saint", essence: "Love",
      escapeFrom: vals.escapeFrom.trim(), interrupt: vals.interrupt.trim(),
      reforged: "present_loving",
    });
  };
  return (
    <ChapterFrame>
      <div style={fsWrap(`radial-gradient(800px 700px at 50% 18%, ${hexA(reforged ? C.mint : PINK, .2)}, ${C.night} 55%, ${C.black})`)}>
        <Starfield mood={reforged ? C.mint : PINK} />
        <Embers on color={reforged ? C.mint : PINK} count={14} />
        <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", paddingTop: "6vh", height: 200 }}>
          <CrownedSprite size={150} baseColor={PINK} revealed healed={reforged} healedColor={C.mint} />
        </div>
        <div style={{ position: "relative", zIndex: 2, maxWidth: 500, margin: "0 auto", padding: "6px 22px 56px" }}>
          {!reforged ? (
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, color: C.text, textAlign: "center", animation: "sFade .6s" }}>You set the chalice down — gently, without shame — and stay in the room with the ache. The cracked halo softens, steadies… and reforges.</p>
          ) : (
            <div style={{ animation: "sRiseGlow .8s" }}>
              <EssenceBurst color={PINK} glyph="♥" name="LOVE" line="You don't numb the ache. You meet it — here, now — with compassion. That's where peace actually lives." />
              <p style={{ ...serif, fontSize: 16, color: C.text, textAlign: "center", margin: "4px 0 18px" }}>
                The Addict Saint kneels no more. In his place stands one who is <b style={{ color: C.mint }}>present and loving</b> — and he wears your face.
              </p>
              <AnswerJournal title="WHAT YOU FORGED" accent={C.mint} entries={[
                { q: "The ache you reach to escape", a: vals.escapeFrom },
                { q: "Your kinder interruption (the clean no + healthier move)", a: vals.interrupt },
              ]} />
              <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: hexA(PINK, .06), border: `1px solid ${hexA(PINK, .3)}` }}>
                <Row label="Shadow" value="Addict Saint → Present & Loving" accent={PINK} />
                <Row label="Essence returned" value="Love" accent={PINK} />
                <Row label="Your move" value="Compassion, not numbing" accent={PINK} />
              </div>
              <PhoenixSeal color={C.phoenix} label="ESSENCE OF LOVE · SEALED" />
              <Btn full accent={C.mint} onClick={finish}>Carry Love forward →</Btn>
            </div>
          )}
        </div>
      </div>
    </ChapterFrame>
  );
}
