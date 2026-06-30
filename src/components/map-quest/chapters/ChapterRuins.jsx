import React, { useState, useEffect } from "react";
import {
  ChapterFrame, Cinematic, Btn, taStyle, C, hexA, mono, serif, echo,
  PhoenixSeal, EssenceBurst, AnswerJournal, Row,
  HeroSprite, CrownedSprite, Starfield, Embers, ForestBackdrop, fsWrap,
} from "../kit.jsx";

/* =============================================================================
   CHAPTER 14 — THE RUINS DISTRICT  ·  Raging Victim ↔ Majesty  (key: chapter-ruins)
   Coelho beat: the alchemist's COURAGE TEST (the sword) — fearlessness is the
   entry fee to wisdom. To pass through the ruins you must lower your guard, not
   raise your fists.
   Jon's testimony (Tr → fictionalized; T turn in his voice): a family implosion
   shipped as a BROKEN DISTRICT — an abandoned block, an empty house rendered as
   collapsed architecture, a goodbye note pinned to a dead door. NEVER raw
   biography. The TURN ships clean in Jon's voice: the rock-bottom choice —
   "Today I choose gratitude… I'm grateful for what happened because it led me to
   who I am." Lesson: stay the raging victim, or move to at-cause + GRATITUDE —
   "I've never been depressed and grateful at the same time." The story you tell
   decides who you become. Don't wear the wound as identity.
   Exercise: Throne of Responsibility (theStory, gratefulFor) → answer-fill mirror
   → reforge → Essence: MAJESTY. shadow:"raging_victim". See 07_CHAPTER_DOSSIER.md.
   ============================================================================= */

const VIOLET = C.phoenix;
const SCENE_BG = `radial-gradient(900px 700px at 50% 12%, ${hexA(VIOLET, 0.15)}, transparent), ${C.black}`;

const INTRO = [
  {
    id: "ruins", mood: VIOLET, backdrop: "starfield", kicker: "CHAPTER 14 · THE RUINS DISTRICT",
    cast: [{ id: "hero", node: <HeroSprite size={112} glow={C.cyan} />, label: "YOU" }],
    lines: [
      "The road delivers you into a district that used to be a home. Whole blocks stand gutted — a tower with its lights torn out, an empty house rendered as broken architecture, its rooms open to the sky.",
      "On a dead door hangs a goodbye note, still flapping. The wind reads it over and over to no one. Something here was abandoned all at once — and never came back for itself.",
      "From the rubble of the empty house, a shape rises. Same hood as yours. Same light. And on its head — a crown, scorched but unbroken.",
    ],
    speaker: C.text, cta: "Step into the ruins →",
  },
  {
    id: "rage", mood: VIOLET, backdrop: "embers",
    cast: [
      { id: "hero", node: <HeroSprite size={98} glow={C.cyan} />, label: "YOU" },
      { id: "victim", node: <CrownedSprite size={120} baseColor={VIOLET} revealed />, label: "THE RAGING VICTIM", labelColor: VIOLET },
    ],
    lines: [
      "\"Look at it. LOOK at what they did to me.\" His voice cracks the quiet. \"The betrayal. The leaving. The note on the door. None of it was my doing — it was all done TO me.\"",
      "\"I've told this story a thousand times and it's true every time. So I burn it down again. I rage so I don't have to grieve.\"",
      "\"Don't come closer with that calm face. I don't want your peace. I want someone to PAY.\"",
    ],
    speaker: VIOLET, cta: "\"…Who are you?\" →",
  },
  {
    id: "mirror", mood: VIOLET, backdrop: "embers",
    cast: [
      { id: "hero", node: <HeroSprite size={108} glow={C.cyan} />, label: "THE GLASS · YOU" },
      { id: "victim", node: <CrownedSprite size={122} baseColor={VIOLET} revealed />, label: "THE RUINS · HIM", labelColor: VIOLET },
    ],
    lines: [
      "He kicks a shard of mirrored glass toward your boots. You look down — your own hood, your own light, your own face stare back up.",
      "Then he steps in beside the reflection. His silhouette and yours are one silhouette. The only difference is the crown — and the rage holding it on.",
      "\"I'm not a stranger haunting these ruins. I'm you — the version that decided the wreckage IS the identity. Let me show you the night I moved in here for good.\"",
    ],
    speaker: VIOLET, cta: "Show me the night →",
  },
  {
    id: "origin", mood: C.danger, backdrop: "embers",
    cast: [{ id: "victim", node: <CrownedSprite size={124} baseColor={VIOLET} revealed />, label: "THE RAGING VICTIM", labelColor: VIOLET }],
    lines: [
      "\"It all came down in one season. The money, the family, the people I trusted — gone, like a district condemned overnight. I stood in an empty house and read a goodbye I never got to answer.\"",
      "\"So I built a throne out of the rubble and I sat on it. King of the wreckage. And the more I retold the story of what was done to me, the heavier the crown sat — and the smaller I got under it.\"",
      "\"That's the trick of this place. You think the rage makes you powerful. It only makes you the wound, wearing a crown.\"",
    ],
    speaker: C.danger, cta: "Keep watching →",
  },
  {
    id: "throne", mood: C.cyan, backdrop: "starfield",
    cast: [{ id: "victim", node: <CrownedSprite size={126} baseColor={VIOLET} revealed />, label: "THE RAGING VICTIM", labelColor: VIOLET }],
    lines: [
      "\"There's a second throne in these ruins. Hardly anyone sees it. It's the Throne of Responsibility — and the only way to reach it is to set the sword down first.\"",
      "\"That's the courage test. Not to fight harder. To stop guarding the wound. Fearlessness is the entry fee — you walk through the ruins unarmed, or you don't walk through at all.\"",
      "\"And there's a stranger choice waiting on that throne. Not to forgive what happened. To be GRATEFUL for it. To say: this is who it forged me into. I've never once been depressed and grateful at the same time.\"",
    ],
    speaker: C.cyan, cta: "Sit on the Throne of Responsibility →",
  },
  {
    id: "summon", mood: VIOLET, backdrop: "starfield",
    cast: [{ id: "victim", node: <CrownedSprite size={128} baseColor={VIOLET} revealed />, label: "THE RAGING VICTIM", labelColor: VIOLET }],
    lines: [
      "\"So here's the test, traveler. Tell me the story you keep retelling as 'this was done TO me.' Don't soften it. Name the wreckage exactly.\"",
      "\"Then — if you've got the nerve — rewrite it toward at-cause. Not 'it was fine.' But: what did it forge in you that you can be grateful for?\"",
      "\"The story you tell decides who you become. Sit down. Answer honest.\"",
    ],
    speaker: VIOLET, cta: "Take the throne →",
  },
];

const PROMPTS = [
  {
    key: "theStory", label: "THE STORY YOU KEEP RETELLING", accent: C.danger,
    prompt: "The abandonment or wrong you keep retelling as \"this was done TO me\" — name it. Don't soften it. What's the wreckage you've been guarding?",
  },
  {
    key: "gratefulFor", label: "REWRITE TOWARD GRATITUDE", accent: VIOLET,
    prompt: "Now move to at-cause. Not \"it was fine\" — but: what did it forge in you that you can actually be grateful for? Finish it: \"I'm grateful for what happened because…\"",
  },
];

export default function ChapterRuins({ onComplete, quest }) {
  const [phase, setPhase] = useState("intro");
  const [step, setStep] = useState(0);
  const [vals, setVals] = useState({ theStory: "", gratefulFor: "" });
  const [reforged, setReforged] = useState(false);
  const set = (k) => (e) => setVals((v) => ({ ...v, [k]: e.target.value }));

  useEffect(() => {
    if (phase !== "reforge") return;
    const t = setTimeout(() => setReforged(true), 1400);
    return () => clearTimeout(t);
  }, [phase]);

  // TODO: askMentor() — scripted for now; the Alchemist's lines below are
  // hand-authored. When a real mentor call is wired, it MUST run server-side.
  // NEVER put an API key in client code.

  if (phase === "intro") {
    return (
      <ChapterFrame>
        <Cinematic shots={INTRO} accent={VIOLET} onDone={() => setPhase("exercise")} />
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
          <Starfield mood={VIOLET} />
          <Embers on color={C.danger} count={10} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", paddingTop: "6vh", height: 176 }}>
            <CrownedSprite size={112} baseColor={VIOLET} revealed />
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ fontSize: 10, ...mono, color: cur.accent, marginBottom: 8 }}>THRONE OF RESPONSIBILITY · {cur.label} · {step + 1}/{PROMPTS.length}</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.5, color: C.text, marginBottom: 12 }}>{cur.prompt}</p>
            <textarea value={val} onChange={set(cur.key)} placeholder="Write your truth…" style={taStyle(cur.accent)} />
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <Btn accent={VIOLET} disabled={!val.trim()} onClick={advance}>{step < PROMPTS.length - 1 ? "Next →" : "Hold up the glass →"}</Btn>
            </div>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  if (phase === "mirror") {
    return (
      <ChapterFrame>
        <div style={fsWrap(`radial-gradient(800px 700px at 50% 20%, ${hexA(VIOLET, 0.18)}, ${C.night} 55%, ${C.black})`)}>
          <Starfield mood={VIOLET} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", paddingTop: "6vh", height: 188 }}>
            <CrownedSprite size={132} baseColor={VIOLET} revealed />
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ textAlign: "center", fontSize: 11, letterSpacing: 3, color: VIOLET, ...mono, marginBottom: 10 }}>THE GLASS · your own answer, read back</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 16, lineHeight: 1.55, color: C.text, marginBottom: 10 }}>
              He lifts the shard one last time. In it you see the throne you were sitting on without knowing it.
            </p>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 16, lineHeight: 1.55, color: C.text, marginBottom: 10 }}>
              "The story you keep retelling is <span style={{ color: C.danger }}>{echo(vals.theStory, "what they did to me")}</span>. You've worn it like a crown — and it's been wearing you."
            </p>
            <div style={{ padding: "16px 16px", borderRadius: 16, background: `linear-gradient(160deg, ${hexA(VIOLET, .12)}, ${C.cardDeep})`, border: `1px solid ${hexA(VIOLET, .4)}`, marginBottom: 14 }}>
              <p style={{ ...serif, fontSize: 18, lineHeight: 1.5, color: C.text, margin: "0 0 8px" }}>"But listen to what you just chose: <span style={{ color: VIOLET }}>{echo(vals.gratefulFor, "it forged the person I'm becoming")}</span>."</p>
              <p style={{ ...serif, fontSize: 16, lineHeight: 1.5, color: VIOLET, margin: 0, fontStyle: "italic" }}>"That's not the victim talking. That's gratitude — and you have never once been depressed and grateful at the same time."</p>
            </div>
            <p style={{ fontSize: 13, color: C.textDim, fontStyle: "italic", marginBottom: 14, textAlign: "center" }}>
              "Today I choose gratitude. I'm grateful for what happened — because it led me to who I am. Say it, and the throne reforges."
            </p>
            <Btn full accent={VIOLET} onClick={() => setPhase("reforge")}>Choose gratitude →</Btn>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  // reforge + seal
  const finish = () => {
    quest?.updateDashboard?.({ stage: "Ordeal · Approach", purpose: 8, faith: 7, fear: 7, courage: 7, trust: 6 });
    onComplete?.({
      shadow: "raging_victim", essence: "Majesty",
      theStory: vals.theStory.trim(), gratefulFor: vals.gratefulFor.trim(),
      reforged: "sovereign",
    });
  };
  return (
    <ChapterFrame>
      <div style={fsWrap(`radial-gradient(800px 700px at 50% 18%, ${hexA(reforged ? C.mint : VIOLET, .2)}, ${C.night} 55%, ${C.black})`)}>
        <Starfield mood={reforged ? C.mint : VIOLET} />
        <Embers on color={reforged ? C.mint : C.danger} count={14} />
        <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", paddingTop: "6vh", height: 200 }}>
          <CrownedSprite size={150} baseColor={VIOLET} revealed healed={reforged} healedColor={C.mint} />
        </div>
        <div style={{ position: "relative", zIndex: 2, maxWidth: 500, margin: "0 auto", padding: "6px 22px 56px" }}>
          {!reforged ? (
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, color: C.text, textAlign: "center", animation: "sFade .6s" }}>You set the sword down. You speak the gratitude aloud. The scorched crown glows, settles… and reforges, level on his head.</p>
          ) : (
            <div style={{ animation: "sRiseGlow .8s" }}>
              <EssenceBurst color={VIOLET} glyph="♛" name="MAJESTY" line="You don't wear the wound as a crown. You wear what it forged in you — and you wear it level." />
              <p style={{ ...serif, fontSize: 16, color: C.text, textAlign: "center", margin: "4px 0 18px" }}>
                The Raging Victim is gone. The ruins clear to reveal <b style={{ color: C.mint }}>The Sovereign</b> — at-cause, grateful, crowned — and he wears your face.
              </p>
              <AnswerJournal title="WHAT YOU FORGED" accent={C.mint} entries={[
                { q: "The story you kept retelling", a: vals.theStory },
                { q: "What it forged — what you're grateful for", a: vals.gratefulFor },
              ]} />
              <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: hexA(VIOLET, .06), border: `1px solid ${hexA(VIOLET, .3)}` }}>
                <Row label="Shadow" value="Raging Victim → Sovereign" accent={VIOLET} />
                <Row label="Essence returned" value="Majesty" accent={VIOLET} />
                <Row label="Your move" value="At-cause, not at-effect" accent={VIOLET} />
              </div>
              <PhoenixSeal color={C.phoenix} label="ESSENCE OF MAJESTY · SEALED" />
              <Btn full accent={C.mint} onClick={finish}>Carry Majesty forward →</Btn>
            </div>
          )}
        </div>
      </div>
    </ChapterFrame>
  );
}
