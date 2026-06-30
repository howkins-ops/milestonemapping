import React, { useState, useEffect } from "react";
import {
  ChapterFrame, Cinematic, Btn, taStyle, C, hexA, mono, serif, echo,
  PhoenixSeal, EssenceBurst, AnswerJournal, Row, ForgeExercise,
  HeroSprite, CrownedSprite, AlchemistSprite, Starfield, Embers, fsWrap,
} from "../kit.jsx";

/* =============================================================================
   CHAPTER 6 — THE UNDERCITY OF LACK  ·  Broke King ↔ Power  (key: chapter-shadow)
   Coelho beat: robbed in Tangier — the first necessary humiliation; the quest
   begins after naïveté breaks.
   Jon's testimony (T / depth Tr): the "$4/hour first year" ($12k across 365
   days), childhood bankruptcy and the scarcity demon (the $5k gold chain to
   match the dealer friends). Loss became identity: "I AM behind."
   Exercise: Money Mirror (money, fear, power) → the folded-in Identity Forge
   reforge (melt, identity, proof) → Essence: POWER. shadow:"broke_king".
   (Absorbs the retired chapter-alchemy reforge.) See 07_CHAPTER_DOSSIER.md.
   ============================================================================= */

const GOLD = C.gold;
const SCENE_BG = `radial-gradient(900px 700px at 50% 12%, ${hexA(GOLD, 0.15)}, transparent), ${C.black}`;

const INTRO = [
  {
    id: "road", mood: C.mint, backdrop: "forest", kicker: "CHAPTER 6 · THE UNDERCITY OF LACK",
    cast: [{ id: "hero", node: <HeroSprite size={116} glow={C.cyan} />, label: "YOU" }],
    lines: [
      "The road drops below the city, into the ruined treasury — the undercity where the broke and the once-rich end up.",
      "Someone is slumped against a dead server-tree ahead. Fine clothes gone to rags shot through with gold thread. A cracked crown, crooked on his head.",
    ],
    speaker: C.text, cta: "Approach →",
  },
  {
    id: "encounter", mood: GOLD, backdrop: "forest",
    cast: [
      { id: "hero", node: <HeroSprite size={98} glow={C.cyan} />, label: "YOU" },
      { id: "king", node: <CrownedSprite size={116} baseColor={GOLD} />, label: "THE BROKE KING", labelColor: GOLD },
    ],
    lines: [
      "\"Traveler… spare something? Coin, food, anything.\" He lifts his eyes as you pass. \"I knew this road once. Every turn of it. I could have owned it all.\"",
      "\"I had the kingdom in my hands. Then the gold turned heavy. Help an old king who lost his way.\"",
    ],
    speaker: GOLD, cta: "\"…Who are you?\" →",
  },
  {
    id: "mirror", mood: GOLD, backdrop: "forest",
    cast: [
      { id: "hero", node: <HeroSprite size={108} glow={C.cyan} />, label: "THE GLASS · YOU" },
      { id: "king", node: <CrownedSprite size={120} baseColor={GOLD} revealed />, label: "OUTSIDE · HIM", labelColor: GOLD },
    ],
    lines: [
      "He lifts a shard of broken glass to your face. You see yourself — your own hood, your own light. Then he steps beside it.",
      "His shape is your shape. The same silhouette. Only — he wears a crown.",
      "\"I'm not a stranger. I'm you — wearing the crown you're walking all this way to earn. Let me show you how I fell.\"",
    ],
    speaker: GOLD, cta: "How did you fall? →",
  },
  {
    id: "origin1", mood: C.cyan, backdrop: "embers",
    cast: [{ id: "king", node: <CrownedSprite size={120} baseColor={GOLD} revealed />, label: "THE BROKE KING", labelColor: GOLD }],
    lines: [
      "\"My first year chasing the crown, I made four dollars an hour. Twelve grand across three hundred and sixty-five days.\"",
      "\"I sucked harder than the vacuum I was selling. Every door was a 'no.' I told myself it was proof I'd never make it.\"",
    ],
    speaker: C.cyan, cta: "Keep watching →",
  },
  {
    id: "origin2", mood: C.hotPink, backdrop: "embers",
    cast: [{ id: "king", node: <CrownedSprite size={120} baseColor={GOLD} revealed />, label: "THE BROKE KING", labelColor: GOLD }],
    lines: [
      "\"I grew up listening to money-fights through the wall. Bankruptcy. Lights going out. The fear never quite left the house.\"",
      "\"So the day I had a little, I bought a five-thousand-dollar gold chain — to look like the men who looked like they'd made it. I was buying a feeling, not a chain.\"",
    ],
    speaker: C.hotPink, cta: "Keep watching →",
  },
  {
    id: "origin3", mood: C.danger, backdrop: "embers",
    cast: [{ id: "king", node: <CrownedSprite size={128} baseColor={GOLD} revealed />, label: "THE BROKE KING", labelColor: GOLD }],
    lines: [
      "\"Then one bad season became a bad year. 'I lost it' quietly turned into 'I AM behind. I should be further by now.'\"",
      "\"The crown cracked clean down the middle. And the legend sat down in the dirt outside his own ruined kingdom.\"",
      "\"A cracked crown doesn't make a shadow. The story does. So — what does money mean to YOU? Look in the glass and answer honest.\"",
    ],
    speaker: C.danger, cta: "Look in the money mirror →",
  },
];

const MIRROR_PROMPTS = [
  { key: "money", label: "MONEY MEANS…", accent: GOLD,
    prompt: "Finish it honestly. To you, money means ______. (Safety? Proof? Freedom? A scoreboard?)" },
  { key: "fear", label: "THE FEAR UNDERNEATH", accent: C.danger,
    prompt: "When money gets tight, what's the fear that actually grips you? Say the real one." },
  { key: "power", label: "POWER INSTEAD", accent: C.power,
    prompt: "If money is just a tool — what would real Power do, with it or without it?" },
];

export default function ChapterShadow({ onComplete, quest }) {
  const [phase, setPhase] = useState("intro");
  const [step, setStep] = useState(0);
  const [vals, setVals] = useState({ money: "", fear: "", power: "" });
  const [forge, setForge] = useState({ melt: "", identity: "", proof: "" });
  const [reforged, setReforged] = useState(false);
  const set = (k) => (e) => setVals((v) => ({ ...v, [k]: e.target.value }));

  useEffect(() => {
    if (phase !== "reforge") return;
    const t = setTimeout(() => setReforged(true), 1400);
    return () => clearTimeout(t);
  }, [phase]);

  const chasing = echo(quest?.getDayOneSnapshot?.()?.whatImChasing, "the feeling you think the gold will finally give you");

  if (phase === "intro") {
    return (
      <ChapterFrame>
        <Cinematic shots={INTRO} accent={GOLD} onDone={() => setPhase("exercise")} />
      </ChapterFrame>
    );
  }

  if (phase === "exercise") {
    const cur = MIRROR_PROMPTS[step];
    const val = vals[cur.key];
    const advance = () => (step < MIRROR_PROMPTS.length - 1 ? setStep(step + 1) : setPhase("mirror"));
    return (
      <ChapterFrame>
        <div style={fsWrap(SCENE_BG)}>
          <Starfield mood={GOLD} />
          <Embers on color={GOLD} count={10} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", paddingTop: "6vh", height: 176 }}>
            <CrownedSprite size={112} baseColor={GOLD} revealed />
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ fontSize: 10, ...mono, color: cur.accent, marginBottom: 8 }}>THE MONEY MIRROR · {cur.label} · {step + 1}/{MIRROR_PROMPTS.length}</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.5, color: C.text, marginBottom: 12 }}>{cur.prompt}</p>
            <textarea value={val} onChange={set(cur.key)} placeholder="Write your truth…" style={taStyle(cur.accent)} />
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <Btn accent={GOLD} disabled={!val.trim()} onClick={advance}>{step < MIRROR_PROMPTS.length - 1 ? "Next →" : "Hold up the glass →"}</Btn>
            </div>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  if (phase === "mirror") {
    return (
      <ChapterFrame>
        <div style={fsWrap(`radial-gradient(800px 700px at 50% 20%, ${hexA(C.phoenix, 0.18)}, ${C.night} 55%, ${C.black})`)}>
          <Starfield mood={C.phoenix} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", paddingTop: "6vh", height: 188 }}>
            <AlchemistSprite size={132} />
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ textAlign: "center", fontSize: 11, letterSpacing: 3, color: C.phoenix, ...mono, marginBottom: 10 }}>THE ALCHEMIST · your higher self</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 16, lineHeight: 1.55, color: C.text, marginBottom: 10 }}>
              From the dark behind the throne, a hooded figure of light steps forward — older, like you could be. "I sat on that cracked throne too."
            </p>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 16, lineHeight: 1.55, color: C.text, marginBottom: 10 }}>
              "You said money means <span style={{ color: GOLD }}>{echo(vals.money, "safety")}</span>, and the fear underneath is <span style={{ color: C.danger }}>{echo(vals.fear, "ending up with nothing")}</span>. He's still chasing {chasing} — and so are you."
            </p>
            <div style={{ padding: "16px 16px", borderRadius: 16, background: `linear-gradient(160deg, ${hexA(C.power, .12)}, ${C.cardDeep})`, border: `1px solid ${hexA(C.power, .4)}`, marginBottom: 14 }}>
              <p style={{ ...serif, fontSize: 18, lineHeight: 1.5, color: C.text, margin: "0 0 8px" }}>"You don't become a king by doing more. You <span style={{ color: C.power }}>are</span> the king first — and then you build."</p>
              <p style={{ ...serif, fontSize: 16, lineHeight: 1.5, color: C.power, margin: 0, fontStyle: "italic" }}>"Power is not the gold. Power is who you are when the gold is gone."</p>
            </div>
            <p style={{ fontSize: 13, color: C.textDim, fontStyle: "italic", marginBottom: 14, textAlign: "center" }}>
              "The Broke King is a story you started believing on your worst night. Let's melt it down and forge a new one. Right now."
            </p>
            <Btn full accent={GOLD} onClick={() => setPhase("forge")}>Step to the forge →</Btn>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  if (phase === "forge") {
    return (
      <ChapterFrame>
        <div style={fsWrap(`radial-gradient(800px 600px at 50% 10%, ${hexA(GOLD, .14)}, ${C.night} 60%, ${C.black})`)}>
          <Embers on color={C.amber} count={16} />
          <div style={{ position: "relative", zIndex: 2, maxWidth: 520, margin: "0 auto", padding: "30px 22px 60px" }}>
            <div style={{ fontSize: 11, letterSpacing: 3, color: GOLD, ...mono, marginBottom: 6, textAlign: "center" }}>THE IDENTITY FORGE</div>
            <h2 style={{ ...serif, fontSize: 25, textAlign: "center", margin: "0 0 4px", color: C.text }}>Melt the old story. Forge a new one.</h2>
            <p style={{ fontSize: 13, color: C.textDim, textAlign: "center", marginBottom: 20 }}>Three strikes of the hammer. The forge remembers.</p>
            <ForgeExercise
              accent={GOLD}
              meltLabel="MELT THE OLD STORY"
              identityLabel="CHOOSE THE NEW IDENTITY"
              proofLabel="NAME YOUR PROOF"
              meltPrompt="Say the old story out loud. What did the Broke King make you believe about yourself and money?"
              identityPrompt="Now forge the truth. From this day — who do you CHOOSE to be? Start with “I am…”."
              proofPrompt="One proof-action in the next 24h that you build from power, not panic."
              onComplete={({ melt, identity, proof }) => { setForge({ melt, identity, proof }); setPhase("reforge"); }}
            />
          </div>
        </div>
      </ChapterFrame>
    );
  }

  // reforge + seal
  const finish = () => {
    quest?.updateDashboard?.({ stage: "Road of Trials", purpose: 5, faith: 3, fear: 7, courage: 5, trust: 4 });
    onComplete?.({
      shadow: "broke_king", essence: "Power",
      money: vals.money.trim(), fear: vals.fear.trim(), power: vals.power.trim(),
      melt: forge.melt.trim(), identity: forge.identity.trim(), proof: forge.proof.trim(),
      reforged: "sovereign_builder",
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
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, color: C.text, textAlign: "center", animation: "sFade .6s" }}>You speak the new story aloud. The cracked crown glows, splits… and reforges.</p>
          ) : (
            <div style={{ animation: "sRiseGlow .8s" }}>
              <EssenceBurst color={C.power} glyph="⬢" name="POWER" line="Power is not the gold. Power is who you are when the gold is gone." />
              <p style={{ ...serif, fontSize: 16, color: C.text, textAlign: "center", margin: "4px 0 18px" }}>
                The Broke King is gone. In his place stands <b style={{ color: C.mint }}>The Sovereign Builder</b> — and he wears your face.
              </p>
              <AnswerJournal title="WHAT YOU FORGED" accent={C.mint} entries={[
                { q: "What money meant to you", a: vals.money },
                { q: "The fear underneath", a: vals.fear },
                { q: "The old story you melted down", a: forge.melt },
                { q: "The identity you chose", a: forge.identity },
                { q: "Your proof action (next 24h)", a: forge.proof },
              ]} />
              <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: hexA(C.power, .06), border: `1px solid ${hexA(C.power, .3)}` }}>
                <Row label="Shadow" value="Broke King → Sovereign Builder" accent={C.power} />
                <Row label="Essence returned" value="Power" accent={C.power} />
                <Row label="Your move" value="Proof, not panic" accent={C.power} />
              </div>
              <PhoenixSeal color={C.phoenix} label="ESSENCE OF POWER · SEALED" />
              <Btn full accent={C.mint} onClick={finish}>Carry Power forward →</Btn>
            </div>
          )}
        </div>
      </div>
    </ChapterFrame>
  );
}
