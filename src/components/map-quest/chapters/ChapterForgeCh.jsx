import React, { useState } from "react";
import {
  C, hexA, mono, serif, echo, fsWrap,
  ChapterFrame, Cinematic, Btn, taStyle, Row,
  PhoenixSeal, HeroSprite, MentorSprite, Starfield, Embers, ForestBackdrop,
} from "../kit.jsx";

/* =============================================================================
   CHAPTER 8 — THE FORGE  ·  (key: ch08-the-forge)
   Coelho beat: the caravan & the Englishman — lived knowledge vs book knowledge;
   the alchemist's tools that only run on kept promises.
   Jon's testimony (T): THE POOL JUMP — he tells the team he'll jump in the pool
   fully clothed every night until he sells 5 in a day; days of freezing jumps,
   then a rearview-mirror self-talk moment → he sells 6 and goes #1 of thousands
   that day. Plus true grit: knocking doors at −30°C and at 120°F.
   Lesson: a kept promise + a REAL consequence is the forge of character;
   integrity = your word is your bond; a public stake turns "meh" into "I must."
   Exercise: Promise Forge → promise, consequence, proof.
   See alchemist/07_CHAPTER_DOSSIER.md (Ch 8 — The Forge).
   ============================================================================= */

const FORGE = C.gold;
const FIRE = C.amber;
const SCENE_BG = `radial-gradient(900px 700px at 50% 14%, ${hexA(FORGE, 0.18)}, transparent), ${C.black}`;

const heroNode = (size = 100) => <HeroSprite size={size} glow={C.cyan} />;
const smithNode = (size = 124) => <MentorSprite size={size} color={FORGE} />;

const INTRO = [
  {
    id: "forge", mood: FORGE, backdrop: "embers", kicker: "CHAPTER 8 · THE FORGE",
    cast: [
      { id: "hero", node: heroNode(100), label: "YOU" },
      { id: "smith", node: smithNode(126), label: "THE FORGER", labelColor: FORGE },
    ],
    lines: [
      "The caravan stops at a forge built into the desert dark — anvils of cooled light, tools laid out in rows, and not one of them lit.",
      "The Forger doesn't look up. \"You can read every manual in this city,\" he says. \"There was an Englishman who did. Carried his whole library across the sands looking for a teacher.\"",
      "\"And the caravan crossed the same desert without a single book — and learned more, because they had to keep moving when the war closed the road. Lived knowledge. Not borrowed.\"",
      "\"These tools won't light for what you KNOW. They light for what you've kept. Make me a promise and mean it — and watch.\"",
    ],
    speaker: FORGE, cta: "What kind of promise? →",
  },
  {
    id: "pool", mood: FORGE, backdrop: "embers",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "smith", node: smithNode(122), label: "THE FORGER", labelColor: FORGE },
    ],
    lines: [
      "\"Let me tell you about a kid who couldn't sell. Early days, sucking wind. So one night he stands up in front of the whole team and says it out loud:\"",
      "\"'I will jump into that pool — fully clothed — every single night, until I sell five in a day.' Public. No take-backs. The whole crew heard it.\"",
      "\"And he jumped. Freezing. Soaked. Night after night, no five. Boots full of water, the team laughing, the stake getting heavier every dunk.\"",
      "\"Then one morning he caught his own eyes in the rearview mirror. Talked to himself like he meant it. That day he didn't sell five.\"",
      "\"He sold SIX. Number one out of thousands of reps that day. The promise didn't motivate him. The CONSEQUENCE did.\"",
    ],
    speaker: FORGE, cta: "There's more →",
  },
  {
    id: "grit", mood: FIRE, backdrop: "embers",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "smith", node: smithNode(122), label: "THE FORGER", labelColor: FORGE },
    ],
    lines: [
      "\"Same kid knocked doors at thirty below — frost on his eyelashes, fingers he couldn't feel on the knocker.\"",
      "\"And he knocked at a hundred and twenty in the sun, shirt soaked through by the second street, sidewalk shimmering like a stovetop.\"",
      "\"Not because it was comfortable. Because he'd given his word. Character isn't a feeling — it's what you do when the feeling says quit.\"",
      "\"Integrity is simple, Seeker. Your word is your bond. When your mouth and your feet say the same thing, you become someone the world can't push around.\"",
    ],
    speaker: FORGE, cta: "Light the forge →",
  },
  {
    id: "ignite", mood: FORGE, backdrop: "embers", stageH: 240,
    cast: [
      { id: "hero", node: heroNode(102), label: "YOU" },
      { id: "smith", node: smithNode(128), label: "THE FORGER", labelColor: FORGE },
    ],
    lines: [
      "He sets a hand on the cold anvil and it WAKES — embers climbing the dark, the tools catching one by one like a row of small suns.",
      "\"A promise to yourself, with no stake, is a wish. A promise with a real consequence — something that stings, something other people can SEE — that's a forge.\"",
      "\"So make one. Right now. Out loud, where it costs you to break it. Then name the proof you'll bring back.\"",
    ],
    speaker: FORGE, cta: "Step to the anvil →",
  },
];

const PROMPTS = [
  {
    key: "promise", label: "THE PROMISE · WHAT YOU SWEAR", accent: FORGE,
    prompt: "One promise you'll make right now. Concrete. Something you can keep or break — no fog.",
    ph: "I will…",
  },
  {
    key: "consequence", label: "THE STAKE · MAKE IT STING", accent: FIRE,
    prompt: "The real consequence if you break it — and make it sting. Ideally public, where someone will see.",
    ph: "If I break it, I will…",
  },
  {
    key: "proof", label: "THE PROOF · BY WHEN", accent: C.cyan,
    prompt: "The proof you'll show — and by when. The thing you can point to that says you kept your word.",
    ph: "By ____, I'll show…",
  },
];

export default function ChapterForgeCh({ onComplete, quest }) {
  const [phase, setPhase] = useState("intro");
  const [step, setStep] = useState(0);
  const [vals, setVals] = useState({ promise: "", consequence: "", proof: "" });
  const set = (k) => (e) => setVals((v) => ({ ...v, [k]: e.target.value }));

  /* ---- intro cinematic ---- */
  if (phase === "intro") {
    return (
      <ChapterFrame>
        <Cinematic shots={INTRO} accent={FORGE} onDone={() => setPhase("exercise")} />
      </ChapterFrame>
    );
  }

  /* ---- exercise: Promise Forge (one step at a time, like ChapterFixer) ---- */
  if (phase === "exercise") {
    const cur = PROMPTS[step];
    const val = vals[cur.key];
    const advance = () => (step < PROMPTS.length - 1 ? setStep(step + 1) : setPhase("mirror"));
    return (
      <ChapterFrame>
        <div style={fsWrap(SCENE_BG)}>
          <Embers color={FIRE} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, paddingTop: "6vh", height: 176 }}>
            {heroNode(94)}{smithNode(110)}
          </div>
          <div style={{ position: "relative", zIndex: 3, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ fontSize: 10, ...mono, color: cur.accent, marginBottom: 8 }}>{cur.label} · {step + 1}/{PROMPTS.length}</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.5, color: C.text, marginBottom: 12 }}>{cur.prompt}</p>
            <textarea value={val} onChange={set(cur.key)} placeholder={cur.ph} style={taStyle(cur.accent)} />
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <Btn accent={FORGE} disabled={!val.trim()} onClick={advance}>
                {step < PROMPTS.length - 1 ? "Forge →" : "Strike the anvil →"}
              </Btn>
            </div>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  /* ---- answer-fill mirror: the Forger weaves the player's own words back ---- */
  if (phase === "mirror") {
    // Scripted mentor reflection (answer-fill). A kept promise + a real stake = the forge.
    // TODO: askMentor() — swap this scripted reply for a live coaching call
    // (server-side function, e.g. netlify/functions/ask-mentor.js). NEVER embed an
    // API key in client code; the mirror stays fully scripted on the client.
    const p = echo(vals.promise, "the thing you've been circling but never swore");
    const cse = echo(vals.consequence, "a stake heavy enough that someone you respect would see you fold");
    const pf = echo(vals.proof, "the proof you can point to and say — I kept it");
    return (
      <ChapterFrame>
        <div style={fsWrap(SCENE_BG)}>
          <Embers color={FIRE} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, paddingTop: "6vh", height: 176 }}>
            {heroNode(94)}{smithNode(110)}
          </div>
          <div style={{ position: "relative", zIndex: 3, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ textAlign: "center", fontSize: 11, letterSpacing: 3, color: FORGE, ...mono, marginBottom: 12 }}>THE FORGE TAKES IT</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 10 }}>
              "So you swear it: <span style={{ color: FORGE }}>{p}</span>."
            </p>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 10 }}>
              "And if you break it — <span style={{ color: FIRE }}>{cse}</span>. Good. That's not punishment. That's the stake that turns 'meh' into 'I MUST.' The pool was cold every night until it wasn't."
            </p>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 14 }}>
              "And you'll bring back proof: <span style={{ color: C.cyan }}>{pf}</span>. That's the bond. Your word, made visible."
            </p>

            <div style={{ padding: "12px 14px", borderRadius: 14, background: `linear-gradient(160deg, ${C.card}, ${C.cardDeep})`, border: `1px solid ${hexA(FORGE, 0.3)}`, marginBottom: 16 }}>
              <div style={{ fontSize: 10, ...mono, color: FORGE, marginBottom: 8 }}>WHAT YOU FORGED</div>
              <Row label="Promise" value={p} accent={FORGE} />
              <Row label="The stake" value={cse} accent={FIRE} />
              <Row label="Proof by when" value={pf} accent={C.cyan} />
            </div>

            <div style={{ padding: "12px 14px", borderRadius: 12, background: hexA(FORGE, 0.06), border: `1px solid ${hexA(FORGE, 0.3)}`, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: C.textDim, fontStyle: "italic", margin: 0 }}>
                "I can't keep it for you. But the day your mouth and your feet say the same thing — that's the day you stop being someone the world pushes around. Come back and tell me you kept it."
              </p>
            </div>
            <Btn full accent={FORGE} onClick={() => setPhase("seal")}>Take the fire with you →</Btn>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  /* ---- seal ---- */
  const finish = () => {
    quest?.updateDashboard?.({ stage: "Tests / Allies", purpose: 7, faith: 6, fear: 5, courage: 7, trust: 6 });
    onComplete?.({
      promise: vals.promise.trim(),
      consequence: vals.consequence.trim(),
      proof: vals.proof.trim(),
    });
  };
  return (
    <ChapterFrame>
      <div style={fsWrap(`radial-gradient(800px 700px at 50% 30%, ${hexA(FORGE, 0.22)}, ${C.night} 60%, ${C.black})`)}>
        <Starfield mood={FORGE} />
        <Embers color={FIRE} count={10} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 460, margin: "0 auto", padding: "13vh 22px 50px", textAlign: "center" }}>
          <PhoenixSeal color={FORGE} label="FORGE · CHARACTER TEMPERED" />
          <p style={{ ...serif, fontStyle: "italic", fontSize: 16, color: C.text, margin: "14px 0 18px" }}>
            You leave the forge with the embers still on you — not a wisher anymore, a forger. The promise has teeth now, and a witness. Discipline isn't a mood you wait for. It's a word you keep when the feeling says quit.
          </p>
          <Btn full accent={C.magenta} onClick={finish}>Carry the fire on →</Btn>
        </div>
      </div>
    </ChapterFrame>
  );
}
