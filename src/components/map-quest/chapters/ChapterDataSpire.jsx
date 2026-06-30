import React, { useState, useEffect } from "react";
import {
  ChapterFrame, Cinematic, Btn, taStyle, C, hexA, mono, serif, echo, fsWrap,
  Row, AnswerJournal, PhoenixSeal, EssenceBurst,
  HeroSprite, CrownedSprite, Starfield, Embers,
} from "../kit.jsx";

/* =============================================================================
   CHAPTER 11 — THE DATA-SPIRE  ·  Silent Prophet ↔ Radiance  (key: chapter-data-spire)
   Coelho beat: reading omens + finding the courage to SPEAK the warning (the
   hawks) — the outsider who says what insiders normalize.
   Jon's testimony (Tr → T triumph, fictionalized): a single installed LIE
   ("you're stupid, you can't learn") muted the prophet's voice for years; the
   triumph is rewriting the subconscious with recorded affirmations he fell
   asleep to — "the moment my inner voice finally turned positive was very
   emotional." Lesson: one internalized lie can run a whole life; finding your
   voice = rewriting the script you were given.
   Exercise: Voice Gate (wontSay, newScript) → answer-fill mirror → reforge →
   Essence: RADIANCE. shadow:"silent_prophet". See 07_CHAPTER_DOSSIER.md.
   ============================================================================= */

const GOLD = C.gold;
const SCENE_BG = `radial-gradient(900px 700px at 50% 12%, ${hexA(GOLD, 0.15)}, transparent), ${C.black}`;

const INTRO = [
  {
    id: "spire", mood: GOLD, backdrop: "starfield", kicker: "CHAPTER 11 · THE DATA-SPIRE",
    cast: [{ id: "hero", node: <HeroSprite size={116} glow={C.cyan} />, label: "YOU" }],
    lines: [
      "The path climbs a tower made of everything never said — the Data-Spire. Unsent messages drift up its sides like dead leaves of light. Mic icons, every one of them muted, blink in slow rows.",
      "At the top, a crowned figure sits with a hand pressed flat over his own mouth. Above him, three hawks circle a horizon nobody else is watching.",
    ],
    speaker: C.text, cta: "Climb to him →",
  },
  {
    id: "encounter", mood: GOLD, backdrop: "starfield",
    cast: [
      { id: "hero", node: <HeroSprite size={98} glow={C.cyan} />, label: "YOU" },
      { id: "prophet", node: <CrownedSprite size={118} baseColor={GOLD} revealed />, label: "THE SILENT PROPHET", labelColor: GOLD },
    ],
    lines: [
      "He does not greet you. He points — up, at the hawks. His mouth moves, but nothing comes out. The warning he reads in the sky stays trapped behind the hand on his lips.",
      "\"I see it all,\" he finally manages, barely a whisper. \"Every omen. I always have. I just… never learned how to say it where it counts.\"",
    ],
    speaker: GOLD, cta: "\"Why won't you speak?\" →",
  },
  {
    id: "mirror", mood: GOLD, backdrop: "starfield",
    cast: [
      { id: "hero", node: <HeroSprite size={108} glow={C.cyan} />, label: "THE GLASS · YOU" },
      { id: "prophet", node: <CrownedSprite size={122} baseColor={GOLD} revealed />, label: "OUTSIDE · HIM", labelColor: GOLD },
    ],
    lines: [
      "He turns a dark pane of glass toward you. In it: your hood, your light — and then his crowned shape slides over the top, matching you line for line.",
      "His silhouette is your silhouette. The same shoulders, the same stance. Only — his hand is over his mouth.",
      "\"I'm not a stranger. I'm you — the part that swallows the truth, the ask, the warning, and calls it being polite. Let me show you the lie that muted me.\"",
    ],
    speaker: GOLD, cta: "Show me the lie →",
  },
  {
    id: "origin1", mood: C.danger, backdrop: "embers",
    cast: [{ id: "prophet", node: <CrownedSprite size={122} baseColor={GOLD} revealed />, label: "THE SILENT PROPHET", labelColor: GOLD }],
    lines: [
      "\"Long ago, in a loud room, a single line was installed in me: 'you're stupid, you can't learn.' One sentence. It set, and then it hardened.\"",
      "\"After that it didn't need to be said again. It just ran — quietly, underneath, like a feed I never chose to follow. Every door, it spoke first: don't bother. You'll only prove them right.\"",
    ],
    speaker: C.danger, cta: "Keep watching →",
  },
  {
    id: "origin2", mood: C.hotPink, backdrop: "embers",
    cast: [{ id: "prophet", node: <CrownedSprite size={126} baseColor={GOLD} revealed />, label: "THE SILENT PROPHET", labelColor: GOLD }],
    lines: [
      "\"So I stopped raising my hand. I stopped sending the message. I read every omen in the sky and let the hawks circle alone, because the lie said my voice was the one voice nobody needed.\"",
      "\"Twenty years a prophet who would not prophesy. One installed line, running a whole life. That is the only thing that ever silenced me — not the world. The script I was handed and never edited.\"",
    ],
    speaker: C.hotPink, cta: "How do I edit it? →",
  },
  {
    id: "rewrite", mood: C.cyan, backdrop: "starfield",
    cast: [
      { id: "hero", node: <HeroSprite size={104} glow={C.cyan} />, label: "YOU" },
      { id: "prophet", node: <CrownedSprite size={120} baseColor={GOLD} revealed />, label: "THE SILENT PROPHET", labelColor: GOLD },
    ],
    lines: [
      "\"There's a way through. Burn the old line — out loud — and record a new one in its place. Speak the new script until your sleeping mind learns it by heart.\"",
      "\"Someone climbed out of a lie just like mine: he fell asleep to his own recorded voice saying the truth, night after night, until it took. He said the moment his inner voice finally turned positive… was very emotional.\"",
      "\"That's the trial, traveler. Not courage you fake — a script you rewrite. Stand at the Voice Gate. Say the thing you won't.\"",
    ],
    speaker: C.cyan, cta: "Step to the Voice Gate →",
  },
];

const GATE_PROMPTS = [
  {
    key: "wontSay", label: "THE THING YOU WON'T SAY", accent: C.danger,
    prompt: "What's the thing you won't say out loud — the truth, the ask, the warning you keep swallowing?",
  },
  {
    key: "newScript", label: "THE NEW LINE", accent: C.mint,
    prompt: "Write the new line that replaces the old lie — say it aloud. Start with “I am…” or “I can…”.",
  },
];

export default function ChapterDataSpire({ onComplete, quest }) {
  const [phase, setPhase] = useState("intro");
  const [step, setStep] = useState(0);
  const [vals, setVals] = useState({ wontSay: "", newScript: "" });
  const [reforged, setReforged] = useState(false);
  const set = (k) => (e) => setVals((v) => ({ ...v, [k]: e.target.value }));

  useEffect(() => {
    if (phase !== "reforge") return;
    const t = setTimeout(() => setReforged(true), 1400);
    return () => clearTimeout(t);
  }, [phase]);

  // TODO: askMentor() — wire a server-side coaching call here (the Silent
  // Prophet reflecting on wontSay/newScript). Scripted for now; NEVER put an
  // API key in client code — this must route through a backend endpoint.

  if (phase === "intro") {
    return (
      <ChapterFrame>
        <Cinematic shots={INTRO} accent={GOLD} onDone={() => setPhase("exercise")} />
      </ChapterFrame>
    );
  }

  if (phase === "exercise") {
    const cur = GATE_PROMPTS[step];
    const val = vals[cur.key];
    const advance = () => (step < GATE_PROMPTS.length - 1 ? setStep(step + 1) : setPhase("mirror"));
    return (
      <ChapterFrame>
        <div style={fsWrap(SCENE_BG)}>
          <Starfield mood={GOLD} />
          <Embers on color={GOLD} count={10} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", paddingTop: "6vh", height: 176 }}>
            <CrownedSprite size={112} baseColor={GOLD} revealed />
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ fontSize: 10, ...mono, color: cur.accent, marginBottom: 8 }}>THE VOICE GATE · {cur.label} · {step + 1}/{GATE_PROMPTS.length}</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.5, color: C.text, marginBottom: 12 }}>{cur.prompt}</p>
            <textarea value={val} onChange={set(cur.key)} placeholder="Say it here. Out loud, then on the page…" style={taStyle(cur.accent)} />
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <Btn accent={GOLD} disabled={!val.trim()} onClick={advance}>{step < GATE_PROMPTS.length - 1 ? "Next →" : "Open the gate →"}</Btn>
            </div>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  if (phase === "mirror") {
    return (
      <ChapterFrame>
        <div style={fsWrap(`radial-gradient(800px 700px at 50% 20%, ${hexA(GOLD, 0.18)}, ${C.night} 55%, ${C.black})`)}>
          <Starfield mood={GOLD} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", paddingTop: "6vh", height: 188 }}>
            <CrownedSprite size={132} baseColor={GOLD} revealed />
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ textAlign: "center", fontSize: 11, letterSpacing: 3, color: GOLD, ...mono, marginBottom: 10 }}>THE SILENT PROPHET · in your own voice</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 16, lineHeight: 1.55, color: C.text, marginBottom: 10 }}>
              The hand comes away from his mouth. He repeats your words back, and they land like a prophecy you were always meant to speak.
            </p>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 16, lineHeight: 1.55, color: C.text, marginBottom: 10 }}>
              "The thing you wouldn't say — <span style={{ color: C.danger }}>{echo(vals.wontSay, "the truth you keep swallowing")}</span> — that was never the danger. The silence around it was."
            </p>
            <div style={{ padding: "16px 16px", borderRadius: 16, background: `linear-gradient(160deg, ${hexA(GOLD, .12)}, ${C.cardDeep})`, border: `1px solid ${hexA(GOLD, .4)}`, marginBottom: 14 }}>
              <p style={{ ...serif, fontSize: 18, lineHeight: 1.5, color: C.text, margin: "0 0 8px" }}>"Now hear the new line, the one you just wrote into the feed:"</p>
              <p style={{ ...serif, fontSize: 17, lineHeight: 1.5, color: GOLD, margin: 0, fontStyle: "italic" }}>"{echo(vals.newScript, "I am someone who speaks the thing that matters.")}"</p>
            </div>
            <p style={{ fontSize: 13, color: C.textDim, fontStyle: "italic", marginBottom: 14, textAlign: "center" }}>
              "One installed lie ran twenty years. One line you say on purpose, again and again, can run the next twenty. Let's burn the old one and seal the new."
            </p>
            <Btn full accent={GOLD} onClick={() => setPhase("reforge")}>Burn the old line →</Btn>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  // reforge + seal
  const finish = () => {
    quest?.updateDashboard?.({ stage: "Approach to the Innermost Cave", purpose: 8, faith: 8, fear: 6, courage: 7, trust: 7 });
    onComplete?.({
      shadow: "silent_prophet", essence: "Radiance",
      wontSay: vals.wontSay.trim(), newScript: vals.newScript.trim(),
      reforged: "radiant_voice",
    });
  };
  return (
    <ChapterFrame>
      <div style={fsWrap(`radial-gradient(800px 700px at 50% 18%, ${hexA(reforged ? C.mint : GOLD, .2)}, ${C.night} 55%, ${C.black})`)}>
        <Starfield mood={reforged ? C.mint : GOLD} />
        <Embers on color={reforged ? C.mint : C.danger} count={14} />
        <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", paddingTop: "6vh", height: 200 }}>
          <CrownedSprite size={150} baseColor={GOLD} revealed healed={reforged} healedColor={C.mint} />
        </div>
        <div style={{ position: "relative", zIndex: 2, maxWidth: 500, margin: "0 auto", padding: "6px 22px 56px" }}>
          {!reforged ? (
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, color: C.text, textAlign: "center", animation: "sFade .6s" }}>
              You say the old lie out loud — once, to name it — then strike it through. You speak the new line over it, and the muted mics of the Spire flare alive, one row at a time.
            </p>
          ) : (
            <div style={{ animation: "sRiseGlow .8s" }}>
              <EssenceBurst color={GOLD} glyph="☀" name="RADIANCE" line="The voice was never gone. It was only waiting for permission you can give yourself." />
              <p style={{ ...serif, fontSize: 16, color: C.text, textAlign: "center", margin: "4px 0 18px" }}>
                The Silent Prophet is gone. In his place stands <b style={{ color: C.mint }}>The Radiant Voice</b> — hand off the mouth, the warning spoken — and he wears your face.
              </p>
              <AnswerJournal title="WHAT YOU SPOKE" accent={C.mint} entries={[
                { q: "The thing you wouldn't say", a: vals.wontSay },
                { q: "The new line you wrote and said aloud", a: vals.newScript },
              ]} />
              <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: hexA(GOLD, .06), border: `1px solid ${hexA(GOLD, .3)}` }}>
                <Row label="Shadow" value="Silent Prophet → Radiant Voice" accent={GOLD} />
                <Row label="Essence returned" value="Radiance" accent={GOLD} />
                <Row label="Your move" value="Say the thing you won't" accent={GOLD} />
              </div>
              <PhoenixSeal color={C.phoenix} label="ESSENCE OF RADIANCE · SEALED" />
              <Btn full accent={C.mint} onClick={finish}>Carry Radiance forward →</Btn>
            </div>
          )}
        </div>
      </div>
    </ChapterFrame>
  );
}
