import React, { useState } from "react";
import {
  ChapterFrame, Cinematic, Btn, taStyle, C, hexA, mono, serif, echo,
  PhoenixSeal, HeroSprite, MentorSprite, Starfield, ForestBackdrop, Embers, fsWrap,
} from "../kit.jsx";

/* =============================================================================
   CHAPTER 15 — THE GARDEN SERVER  ·  the Heartkeeper mentor  (key: ch15-garden-server)
   Coelho beat: the oasis and meeting Fatima — love that frees rather than cages;
   legitimate rest, not final arrival.
   Jon's testimony (T): FORGIVE YOURSELF — the coaching breakdown→breakthrough where
   he saw that NOT following his dreams was costing him everything, and that he had
   to forgive himself first. And the Cape Town garden he helped build for a village
   of ~50,000 who had almost nothing yet were the happiest people he'd ever met —
   "all they needed was each other."
   Bigger lesson: self-forgiveness is the gate to BEING (how you show up) over doing;
   love that enlarges you, not love that miniaturizes you; rest that frees, then sends
   you on. Identity shift: self-judge → self-forgiving / being.
   Exercise: Being Mirror → judgeMyselfFor, forgive.
   See alchemist/07_CHAPTER_DOSSIER.md (Ch15).
   ============================================================================= */

const GARDEN = C.mint;
const SCENE_BG = `radial-gradient(900px 700px at 50% 12%, ${hexA(GARDEN, 0.16)}, transparent), ${C.forest}`;

const heroNode = (size = 100) => <HeroSprite size={size} glow={C.cyan} />;
const keeperNode = (size = 120) => <MentorSprite size={size} color={GARDEN} />;

const INTRO = [
  {
    id: "node", mood: GARDEN, backdrop: "forest", kicker: "CHAPTER 15 · THE GARDEN SERVER",
    cast: [{ id: "hero", node: heroNode(116), label: "YOU" }],
    lines: [
      "Days of grey grid. Then the map blinks — a node nobody charted, glowing soft green where everything else runs cold and chrome.",
      "You step through and the air changes. A hidden Garden Server: real soil under the code, leaves breathing light, water you can actually hear. An oasis in the middle of the machine.",
      "After the deserts you've crossed, your whole body wants to stop here forever. Something in the green says: it's allowed to rest.",
    ],
    speaker: C.text, cta: "Walk into the green →",
  },
  {
    id: "keeper", mood: GARDEN, backdrop: "forest",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "keeper", node: keeperNode(122), label: "THE HEARTKEEPER", labelColor: GARDEN },
    ],
    lines: [
      "Someone tends the rows without hurry — the Heartkeeper. They don't ask where you're headed. They just hand you water and let the quiet do its work.",
      "\"You can stay,\" they say. \"As long as you need. The garden won't cage you for it.\" And you feel the difference at once — this is love that frees, not love that grips.",
      "\"Most people confuse the two,\" they go on. \"Love that miniaturizes you, makes you smaller so it can keep you. And love that enlarges you — that rests you, then points you back at your road. This is the second kind.\"",
      "\"Stay. But know this is reward, not arrival. Legitimate rest. Not the end of the path.\"",
    ],
    speaker: GARDEN, cta: "What about the road? →",
  },
  {
    id: "forgive", mood: GARDEN, backdrop: "embers",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "keeper", node: keeperNode(122), label: "THE HEARTKEEPER", labelColor: GARDEN },
    ],
    lines: [
      "\"There's a man I think of in this garden,\" the Heartkeeper says. \"He sat in a coaching room one day and finally saw it plainly: NOT following his dreams was costing him everything. The marriage, the health, the years. Everything.\"",
      "\"And the thing standing between him and the road wasn't fear. It was that he hadn't forgiven himself yet — for all the time he spent not going. So that's where he started. Out loud. 'I forgive myself.'\"",
      "\"Once, that same man helped build a garden for a village of fifty thousand people who had almost nothing. And they were the happiest people he had ever met. He asked how. They told him: all they needed was each other.\"",
      "\"That's what a garden is for. Not to make you rich. To remind you that being — how you show up, who you are — outweighs all your doing. Forgive yourself first. Then the being can begin.\"",
    ],
    speaker: GARDEN, cta: "Sit with that →",
  },
  {
    id: "mirror-setup", mood: GARDEN, backdrop: "forest",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "keeper", node: keeperNode(122), label: "THE HEARTKEEPER", labelColor: GARDEN },
    ],
    lines: [
      "The Heartkeeper turns the soil toward you. \"You can't carry the road clean while you're still punishing yourself in private. The judging is a weight. Set it down here.\"",
      "\"Two things. Name what you still judge or punish yourself for — plainly, no softening. Then say the forgiveness out loud, the way that man did, and name what you choose instead.\"",
      "\"This is the gate. Self-forgiveness, then being. Let's hold up the mirror.\"",
    ],
    speaker: GARDEN, cta: "Step to the mirror →",
  },
];

const PROMPTS = [
  { key: "judgeMyselfFor", label: "THE WEIGHT · WHAT YOU STILL CARRY", accent: C.gold,
    prompt: "What do you still judge or punish yourself for? Say it plainly." },
  { key: "forgive", label: "THE GATE · FORGIVE YOURSELF OUT LOUD", accent: GARDEN,
    prompt: "Write the self-forgiveness line — out loud. \"I forgive myself for…\" and what you choose instead." },
];

export default function ChapterGarden({ onComplete, quest }) {
  const [phase, setPhase] = useState("intro");
  const [step, setStep] = useState(0);
  const [vals, setVals] = useState({ judgeMyselfFor: "", forgive: "" });
  const set = (k) => (e) => setVals((v) => ({ ...v, [k]: e.target.value }));

  if (phase === "intro") {
    return (
      <ChapterFrame>
        <Cinematic shots={INTRO} accent={GARDEN} onDone={() => setPhase("exercise")} />
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
          <ForestBackdrop mood={GARDEN} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, paddingTop: "6vh", height: 176 }}>
            {heroNode(94)}{keeperNode(108)}
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ fontSize: 10, ...mono, color: cur.accent, marginBottom: 8 }}>{cur.label} · {step + 1}/{PROMPTS.length}</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.5, color: C.text, marginBottom: 12 }}>{cur.prompt}</p>
            <textarea value={val} onChange={set(cur.key)} placeholder="Write your truth…" style={taStyle(cur.accent)} />
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <Btn accent={GARDEN} disabled={!val.trim()} onClick={advance}>{step < PROMPTS.length - 1 ? "Next →" : "Hold up the mirror →"}</Btn>
            </div>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  if (phase === "mirror") {
    // Scripted Heartkeeper reflection (answer-fill). Self-forgiveness is the gate to BEING.
    // TODO: askMentor() — swap this scripted reply for a live coaching call
    // (Netlify function netlify/functions/ask-mentor.js, model claude-sonnet-4-6).
    // Never embed an API key in client code.
    return (
      <ChapterFrame>
        <div style={fsWrap(SCENE_BG)}>
          <ForestBackdrop mood={GARDEN} />
          <Embers on color={GARDEN} count={10} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, paddingTop: "6vh", height: 176 }}>
            {heroNode(94)}{keeperNode(108)}
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ textAlign: "center", fontSize: 11, letterSpacing: 3, color: GARDEN, ...mono, marginBottom: 10 }}>THE HEARTKEEPER REFLECTS</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 10 }}>
              "So the weight you've been carrying in private is <span style={{ color: C.gold }}>{echo(vals.judgeMyselfFor, "all the time you spent not going")}</span>. You said it plainly. That's already half the forgiving."
            </p>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 14 }}>
              "And out loud you chose: <span style={{ color: GARDEN }}>{echo(vals.forgive, "I forgive myself — and I choose to show up instead of hide")}</span>. Good. Hear it land. That's the gate opening."
            </p>
            <div style={{ padding: "12px 14px", borderRadius: 12, background: hexA(GARDEN, 0.06), border: `1px solid ${hexA(GARDEN, 0.3)}`, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: C.textDim, fontStyle: "italic", margin: 0 }}>
                "Love isn't meant to make you smaller so it can keep you. It's meant to enlarge you — to rest you, then send you on bigger than you arrived. This garden gave you that. Now carry the being, not the judging."
              </p>
            </div>
            <Btn full accent={GARDEN} onClick={() => setPhase("seal")}>Receive the rest →</Btn>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  // seal
  const finish = () => {
    quest?.updateDashboard?.({ stage: "Reward · Rest", purpose: 8, faith: 8, fear: 4, courage: 8, trust: 8 });
    onComplete?.({ judgeMyselfFor: vals.judgeMyselfFor.trim(), forgive: vals.forgive.trim(), mentor: "heartkeeper" });
  };
  return (
    <ChapterFrame>
      <div style={fsWrap(`radial-gradient(800px 700px at 50% 30%, ${hexA(GARDEN, 0.2)}, ${C.forest} 60%, ${C.black})`)}>
        <Starfield mood={GARDEN} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 460, margin: "0 auto", padding: "13vh 22px 50px", textAlign: "center" }}>
          <PhoenixSeal color={GARDEN} label="HEARTKEEPER · REST RECEIVED" />
          <p style={{ ...serif, fontStyle: "italic", fontSize: 16, color: C.text, margin: "14px 0 18px" }}>
            You leave the Garden Server lighter than you came in. Not arrived — rested, and forgiven. The judging stayed in the soil. The being comes with you down the road.
          </p>
          <Btn full accent={C.magenta} onClick={finish}>Carry the garden on →</Btn>
        </div>
      </div>
    </ChapterFrame>
  );
}
