import React, { useState } from "react";
import {
  ChapterFrame, Cinematic, Btn, taStyle, C, hexA, mono, serif, echo,
  PhoenixSeal, HeroSprite, MentorSprite, Starfield, ForestBackdrop, Embers, fsWrap,
} from "../kit.jsx";

/* =============================================================================
   CHAPTER 19 — THE GARDEN SERVER  ·  the Heartkeeper mentor  (key: ch15-the-garden)
   Coelho beat: the oasis and meeting Fatima — love that frees rather than cages;
   legitimate rest, not final arrival.
   Jon's testimony (T): FORGIVE YOURSELF — the coaching breakdown→breakthrough where
   he saw that NOT following his dreams was costing him everything, and that he had
   to forgive himself first. And the Cape Town garden he helped build for a village
   of ~50,000 who had almost nothing yet were the happiest people he'd ever met —
   "all they needed was each other."
   The Wren thread (F — PURE FICTION, invented at Jon's direction; zero real
   biography): the Runner's Fatima. A bootleg rooftop greenhouse, a seedling
   ("Careful. It's alive."), the leave-before-you're-left pattern, and her line:
   "I never asked you to stay. I asked you to stop leaving before you'd arrived."
   Bigger lesson: TWO ways to lose the treasure at the oasis — stop walking and
   call it love, or keep walking so fast love can never board. Love that frees
   says GO; the wound says RUN. Four Corners of Relationship (Relatedness ·
   Responsibility · Integrity · Communication) = the greenhouse corner-posts.
   Self-forgiveness is the gate to receiving. (Docs: Coaching From Being; Judgment
   vs Being; Weekend 9 — My Pattern in Relationship, Four Corners of Relationship.)
   Exercise: Being Mirror → judgeMyselfFor, forgive (unchanged, save-compat)
   + The Pattern in Love → myPatternInLove, chanceILeft (ADDITIVE; harvested by
   Ch21's ceremony, echoed at Ch24's open door).
   See alchemist/07_CHAPTER_DOSSIER.md (Ch19).
   ============================================================================= */

const GARDEN = C.mint;
const WREN = C.hotPink; // the Love-essence color — Wren carries the Love thread
const SCENE_BG = `radial-gradient(900px 700px at 50% 12%, ${hexA(GARDEN, 0.16)}, transparent), ${C.forest}`;

const heroNode = (size = 100) => <HeroSprite size={size} glow={C.cyan} />;
const keeperNode = (size = 120) => <MentorSprite size={size} color={GARDEN} />;
const wrenNode = (size = 112) => <MentorSprite size={size} color={WREN} />;

const FOUR_CORNERS = ["RELATEDNESS", "RESPONSIBILITY", "INTEGRITY", "COMMUNICATION"];

const INTRO = [
  {
    id: "node", mood: GARDEN, backdrop: "forest", kicker: "CHAPTER 19 · THE GARDEN SERVER",
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

/* the Wren memory — the garden's archive plays the Runner's own past back */
const WREN_MEMORY = [
  {
    id: "wren-door", mood: WREN, backdrop: "forest", kicker: "THE GARDEN REMEMBERS",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU · YEARS AGO" },
      { id: "wren", node: wrenNode(118), label: "WREN · THE KEEPER", labelColor: WREN },
    ],
    lines: [
      "The Heartkeeper brushes a leaf and the whole garden flickers — an archive blooming. A rooftop hatch. A patrol sweep, years ago. A runner ducking through the wrong door. You know this memory. It's yours.",
      "Inside: the last real soil in the city, glowing under bootleg grow-lights. And its keeper — Wren — not even startled. The first thing she ever did was press a seedling into your hands: \"Careful. It's alive.\"",
      "It was the first thing anyone had trusted you with that wasn't stolen.",
    ],
    speaker: WREN, cta: "You kept coming back →",
  },
  {
    id: "wren-warm", mood: WREN, backdrop: "forest",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU · YEARS AGO" },
      { id: "wren", node: wrenNode(118), label: "WREN", labelColor: WREN },
    ],
    lines: [
      "You kept coming back. She never asked where you ran at night. She saw the man under the runner-jacket — and that was the most dangerous thing in the city.",
      "Because every time it got warm enough to matter, a score \"that couldn't wait\" appeared. Two weeks gone. Credits sent instead of words.",
      "The Addict Saint called it keeping it light. The Raging Victim called it leaving first. You called it timing. It was never timing.",
    ],
    speaker: C.text, cta: "The last night →",
  },
  {
    id: "wren-line", mood: WREN, backdrop: "embers",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU · YEARS AGO" },
      { id: "wren", node: wrenNode(118), label: "WREN", labelColor: WREN },
    ],
    lines: [
      "The last night, she caught your hand at the door. She didn't beg. She didn't bargain. Love that frees doesn't grip — not even while it's breaking.",
      "\"I never asked you to stay,\" she said. \"I asked you to stop leaving before you'd arrived.\"",
      "You left anyway. The score didn't even pay out.",
    ],
    speaker: WREN, cta: "Let the memory settle →",
  },
  {
    id: "corners", mood: GARDEN, backdrop: "forest",
    cast: [
      { id: "hero", node: heroNode(98), label: "YOU" },
      { id: "keeper", node: keeperNode(122), label: "THE HEARTKEEPER", labelColor: GARDEN },
    ],
    lines: [
      "The Heartkeeper lets the archive fade. \"This server was seeded from her greenhouse. The door was never locked. It still isn't.\"",
      "\"There are two ways to lose your treasure at an oasis. Stop walking and call it love. Or keep walking so fast love can never board. You know which one is yours.\"",
      "\"Every garden stands on four corner-posts: Relatedness. Responsibility. Integrity. Communication. Let one rot and the roof comes down — and the pattern always gets in through the weakest corner.\"",
      "\"Love that frees says go. The wound says run. From the inside they sound identical — so we name your pattern out loud, until you can tell them apart.\"",
    ],
    speaker: GARDEN, cta: "Name the pattern →",
  },
];

const PROMPTS = [
  { key: "judgeMyselfFor", label: "THE WEIGHT · WHAT YOU STILL CARRY", accent: C.gold,
    prompt: "What do you still judge or punish yourself for? Say it plainly." },
  { key: "forgive", label: "THE GATE · FORGIVE YOURSELF OUT LOUD", accent: GARDEN,
    prompt: "Write the self-forgiveness line — out loud. \"I forgive myself for…\" and what you choose instead." },
];

const LOVE_PROMPTS = [
  { key: "myPatternInLove", label: "THE PATTERN · HOW YOU LEAVE", accent: WREN,
    prompt: "When love gets close — romance, friendship, family — what do you do? Finish it honestly: \"When it starts to matter, I…\"" },
  { key: "chanceILeft", label: "THE DOOR · THE CHANCE YOU LEFT", accent: C.gold,
    prompt: "Name a door you didn't walk through — a chance at love you left before you'd arrived. What did you tell yourself at the time?" },
];

export default function ChapterGarden({ onComplete, quest }) {
  const [phase, setPhase] = useState("intro");
  const [step, setStep] = useState(0);
  const [loveStep, setLoveStep] = useState(0);
  const [vals, setVals] = useState({ judgeMyselfFor: "", forgive: "", myPatternInLove: "", chanceILeft: "" });
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
    const advance = () => (step < PROMPTS.length - 1 ? setStep(step + 1) : setPhase("wren"));
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
              <Btn accent={GARDEN} disabled={!val.trim()} onClick={advance}>{step < PROMPTS.length - 1 ? "Next →" : "The garden stirs →"}</Btn>
            </div>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  if (phase === "wren") {
    return (
      <ChapterFrame>
        <Cinematic shots={WREN_MEMORY} accent={WREN} onDone={() => setPhase("pattern")} />
      </ChapterFrame>
    );
  }

  if (phase === "pattern") {
    const cur = LOVE_PROMPTS[loveStep];
    const val = vals[cur.key];
    const advance = () => (loveStep < LOVE_PROMPTS.length - 1 ? setLoveStep(loveStep + 1) : setPhase("mirror"));
    return (
      <ChapterFrame>
        <div style={fsWrap(SCENE_BG)}>
          <ForestBackdrop mood={WREN} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, paddingTop: "6vh", height: 176 }}>
            {heroNode(94)}{wrenNode(104)}
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ fontSize: 10, ...mono, color: cur.accent, marginBottom: 8 }}>{cur.label} · {loveStep + 1}/{LOVE_PROMPTS.length}</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.5, color: C.text, marginBottom: 12 }}>{cur.prompt}</p>
            <textarea value={val} onChange={set(cur.key)} placeholder="Write your truth…" style={taStyle(cur.accent)} />
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <Btn accent={WREN} disabled={!val.trim()} onClick={advance}>{loveStep < LOVE_PROMPTS.length - 1 ? "Next →" : "Hold up the mirror →"}</Btn>
            </div>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  if (phase === "mirror") {
    // Scripted Heartkeeper reflection (answer-fill). Self-forgiveness is the gate to BEING —
    // and the named pattern is the gate to receiving love.
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
            <p style={{ ...serif, fontStyle: "italic", fontSize: 16, lineHeight: 1.55, color: C.text, marginBottom: 10 }}>
              "So the weight you've been carrying in private is <span style={{ color: C.gold }}>{echo(vals.judgeMyselfFor, "all the time you spent not going")}</span>. You said it plainly. That's already half the forgiving."
            </p>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 16, lineHeight: 1.55, color: C.text, marginBottom: 10 }}>
              "And out loud you chose: <span style={{ color: GARDEN }}>{echo(vals.forgive, "I forgive myself — and I choose to show up instead of hide")}</span>. Good. Hear it land. That's the gate opening."
            </p>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 16, lineHeight: 1.55, color: C.text, marginBottom: 10 }}>
              "Now the pattern has a name: <span style={{ color: WREN }}>{echo(vals.myPatternInLove, "when it starts to matter, I find a reason to run")}</span>. A named pattern loosens. It can't wear the mask of 'timing' anymore."
            </p>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 16, lineHeight: 1.55, color: C.text, marginBottom: 12 }}>
              "And the door you named — <span style={{ color: C.gold }}>{echo(vals.chanceILeft, "the one you left before you'd arrived")}</span> — the garden keeps a place for doors like that. Named doors can reopen."
            </p>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
              {FOUR_CORNERS.map((corner) => (
                <span key={corner} style={{ fontSize: 9, ...mono, letterSpacing: 1.5, color: GARDEN, padding: "4px 8px", borderRadius: 8, border: `1px solid ${hexA(GARDEN, 0.35)}`, background: hexA(GARDEN, 0.06) }}>{corner}</span>
              ))}
            </div>
            <div style={{ padding: "12px 14px", borderRadius: 12, background: hexA(WREN, 0.06), border: `1px solid ${hexA(WREN, 0.3)}`, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: C.textDim, fontStyle: "italic", margin: 0 }}>
                "Four corner-posts hold every garden — tend the weakest one and the pattern loses its way in. Love that frees says go; the wound says run. Now you can tell them apart. Real love never asked you to give up the road. It asked you to stop leaving before you'd arrived."
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
    onComplete?.({
      judgeMyselfFor: vals.judgeMyselfFor.trim(),
      forgive: vals.forgive.trim(),
      myPatternInLove: vals.myPatternInLove.trim(),
      chanceILeft: vals.chanceILeft.trim(),
      mentor: "heartkeeper",
    });
  };
  return (
    <ChapterFrame>
      <div style={fsWrap(`radial-gradient(800px 700px at 50% 30%, ${hexA(GARDEN, 0.2)}, ${C.forest} 60%, ${C.black})`)}>
        <Starfield mood={GARDEN} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 460, margin: "0 auto", padding: "13vh 22px 50px", textAlign: "center" }}>
          <PhoenixSeal color={GARDEN} label="HEARTKEEPER · REST RECEIVED" />
          <p style={{ ...serif, fontStyle: "italic", fontSize: 16, color: C.text, margin: "14px 0 18px" }}>
            You leave the Garden Server lighter than you came in. Not arrived — rested, forgiven, and honest about how you leave. The judging stayed in the soil. Somewhere behind you, a greenhouse door stands unlocked.
          </p>
          <Btn full accent={C.magenta} onClick={finish}>Carry the garden on →</Btn>
        </div>
      </div>
    </ChapterFrame>
  );
}
