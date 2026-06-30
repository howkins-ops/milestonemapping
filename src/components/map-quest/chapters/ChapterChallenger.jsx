import React, { useState } from "react";
import {
  ChapterFrame, Cinematic, Btn, taStyle, C, hexA, mono, serif, echo,
  PhoenixSeal, HeroSprite, MentorSprite, Starfield, Embers, ForestBackdrop, Row, fsWrap,
} from "../kit.jsx";

/* =============================================================================
   CHAPTER 7 — THE CHALLENGER  ·  the Challenger mentor  (key: ch07-the-challenger)
   Coelho beat: Re-choosing the dream when you now have something to lose — the
   joy (and terror) of choosing your destiny AGAIN. The mentor who won't let you
   blame.
   Jon's testimony (T): Dr. Ken Yiem — immigrant grit. Paid off ~$300k of school
   debt door-to-door. Ruptured his Achilles and still walked the mall eight hours
   on crutches to prove he could, then knocked all summer duct-taping the melting
   crutch tips. Texted "one more" after every single sale. Tough love that forces
   victim → at-cause: "a real man takes responsibility." Won't let you blame
   conditions.
   Exercise: At Cause Reset → avoiding / atCause (reused at Ch17).
   See alchemist/07_CHAPTER_DOSSIER.md (Ch7).
   ============================================================================= */

const CHAL = C.danger;
const SCENE_BG = `radial-gradient(900px 700px at 50% 12%, ${hexA(CHAL, 0.16)}, transparent), ${C.black}`;

const heroNode = (size = 100) => <HeroSprite size={size} glow={C.cyan} />;
const chalNode = (size = 122) => <MentorSprite size={size} color={CHAL} />;

const INTRO = [
  {
    id: "block", mood: CHAL, backdrop: "forest", kicker: "CHAPTER 7 · THE CHALLENGER",
    cast: [
      { id: "hero", node: heroNode(102), label: "YOU" },
      { id: "chal", node: chalNode(126), label: "THE CHALLENGER", labelColor: CHAL },
    ],
    lines: [
      "The road forward narrows — and a man steps into the middle of it. Broad, still, unmoving. He doesn't draw a weapon. He just blocks the way.",
      "\"You were about to tell me why you couldn't,\" he says. \"I can hear it in how you're standing. The traffic. The market. The people who let you down. Go on. Say the story.\"",
      "You start to explain. He raises one hand and stops you cold.",
      "\"That's not a reason. That's an alibi. And out here, an alibi will get you killed.\"",
    ],
    speaker: CHAL, cta: "Who are you? →",
  },
  {
    id: "grit", mood: CHAL, backdrop: "embers",
    cast: [
      { id: "hero", node: heroNode(94), label: "YOU" },
      { id: "chal", node: chalNode(126), label: "THE CHALLENGER", labelColor: CHAL },
    ],
    lines: [
      "\"I came to this city with nothing but a debt that could swallow a man whole — three hundred thousand, knocked off one door at a time. So don't tell me about conditions.\"",
      "\"I tore my Achilles mid-season. Doctor said rest. Instead I walked the mall eight hours on crutches — to prove to myself I still could. All summer the rubber tips melted off in the heat. So I duct-taped them back on and kept knocking.\"",
      "\"Every single sale, I'd text two words. Not 'I'm tired.' Not 'it's hard.' Two words: \"one more.\" That's it. \"One more.\" Over and over, until 'one more' was just who I was.\"",
    ],
    speaker: CHAL, cta: "Why are you telling me this? →",
  },
  {
    id: "atcause", mood: CHAL, backdrop: "forest",
    cast: [
      { id: "hero", node: heroNode(94), label: "YOU" },
      { id: "chal", node: chalNode(126), label: "THE CHALLENGER", labelColor: CHAL },
    ],
    lines: [
      "\"Not to impress you. To show you where the power lives. Not in the conditions — in the choice. The moment you blame the road, the road owns you.\"",
      "\"There are two places a man can stand. At the effect of his life — pushed around by everything that happens to him. Or at the cause of it — the one who answers for it, no matter who started it.\"",
      "\"A real man — a real anyone — takes responsibility. Not because the blame is fair. Because at-cause is the only ground you can actually move from.\"",
    ],
    speaker: CHAL, cta: "He won't let me look away →",
  },
  {
    id: "setup", mood: CHAL, backdrop: "embers",
    cast: [
      { id: "hero", node: heroNode(94), label: "YOU" },
      { id: "chal", node: chalNode(126), label: "THE CHALLENGER", labelColor: CHAL },
    ],
    lines: [
      "\"So here's the test before you pass. There's a story you're carrying right now — a 'they did this to me.' I want it out in the open. All of it. The victim version. Don't clean it up.\"",
      "\"Then you're going to do the hardest thing a person ever does. You're going to find your part in it — and take the wheel back.\"",
    ],
    speaker: CHAL, cta: "Run the at-cause reset →",
  },
];

const PROMPTS = [
  { key: "avoiding", label: "THE STORY · AT THE EFFECT", accent: CHAL,
    prompt: "What are you blaming on circumstances or other people right now? Say the 'they did this to me' story — out loud, unedited. Let the victim version exist for one minute." },
  { key: "atCause", label: "THE RESET · AT CAUSE", accent: C.gold,
    prompt: "Now rewrite it. Here's MY part. Here's what I can own — and here's what I'm going to do about it from this point on. Take the wheel back." },
];

export default function ChapterChallenger({ onComplete, quest }) {
  const [phase, setPhase] = useState("intro");
  const [step, setStep] = useState(0);
  const [vals, setVals] = useState({ avoiding: "", atCause: "" });
  const set = (k) => (e) => setVals((v) => ({ ...v, [k]: e.target.value }));

  if (phase === "intro") {
    return (
      <ChapterFrame>
        <Cinematic shots={INTRO} accent={CHAL} onDone={() => setPhase("exercise")} />
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
          <ForestBackdrop mood={CHAL} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, paddingTop: "6vh", height: 176 }}>
            {heroNode(92)}{chalNode(112)}
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ fontSize: 10, ...mono, color: cur.accent, marginBottom: 8 }}>{cur.label} · {step + 1}/{PROMPTS.length}</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.5, color: C.text, marginBottom: 12 }}>{cur.prompt}</p>
            <textarea value={val} onChange={set(cur.key)} placeholder="Write your truth…" style={taStyle(cur.accent)} />
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <Btn accent={CHAL} disabled={!val.trim()} onClick={advance}>{step < PROMPTS.length - 1 ? "Now own it →" : "Show him →"}</Btn>
            </div>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  if (phase === "mirror") {
    // Scripted Challenger reflection (answer-fill). Tough love that forces
    // victim → at-cause: he won't let you blame the conditions.
    // TODO: askMentor() — swap this scripted reply for a live coaching call
    // (Netlify function netlify/functions/ask-mentor.js, model claude-sonnet-4-6).
    // Never embed an API key in client code.
    return (
      <ChapterFrame>
        <div style={fsWrap(SCENE_BG)}>
          <Embers color={CHAL} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, paddingTop: "6vh", height: 176 }}>
            {heroNode(92)}{chalNode(112)}
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ textAlign: "center", fontSize: 11, letterSpacing: 3, color: CHAL, ...mono, marginBottom: 10 }}>THE CHALLENGER DOESN'T BLINK</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 10 }}>
              "So the story was <span style={{ color: CHAL }}>{echo(vals.avoiding, "that something out there did this to you")}</span>. Heard it. That was the alibi. Now it's behind us."
            </p>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.text, marginBottom: 14 }}>
              "And here's where you took the wheel: <span style={{ color: C.gold }}>{echo(vals.atCause, "I own my part, and here's what I'll do about it")}</span>. That's at-cause. That's a man who can actually move."
            </p>
            <div style={{ marginBottom: 16 }}>
              <Row label="STANCE" value="Victim → At Cause" accent={CHAL} />
              <Row label="THE CODE" value="One more." accent={C.gold} />
            </div>
            <div style={{ padding: "12px 14px", borderRadius: 12, background: hexA(CHAL, 0.06), border: `1px solid ${hexA(CHAL, 0.3)}`, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: C.textDim, fontStyle: "italic", margin: 0 }}>
                "I can't carry your road for you. Nobody can. But every time you catch yourself blaming it — you say the two words, and you knock one more door. Responsibility is the doorway. Walk through."
              </p>
            </div>
            <Btn full accent={CHAL} onClick={() => setPhase("seal")}>Take the wheel →</Btn>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  // seal
  const finish = () => {
    quest?.updateDashboard?.({ stage: "Tests / Allies", purpose: 7, faith: 6, fear: 5, courage: 7, trust: 6 });
    onComplete?.({ avoiding: vals.avoiding.trim(), atCause: vals.atCause.trim(), mentor: "challenger" });
  };
  return (
    <ChapterFrame>
      <div style={fsWrap(`radial-gradient(800px 700px at 50% 30%, ${hexA(CHAL, 0.2)}, ${C.night} 60%, ${C.black})`)}>
        <Starfield mood={CHAL} />
        <Embers color={CHAL} count={10} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 460, margin: "0 auto", padding: "13vh 22px 50px", textAlign: "center" }}>
          <PhoenixSeal color={CHAL} label="CHALLENGER · MENTOR EARNED" />
          <p style={{ ...serif, fontStyle: "italic", fontSize: 16, color: C.text, margin: "14px 0 18px" }}>
            The road opens. He steps aside without a word — he was never the obstacle. The blame was. You walk on lighter, with two words to live by when the next wall comes: one more.
          </p>
          <Btn full accent={C.magenta} onClick={finish}>Carry it forward →</Btn>
        </div>
      </div>
    </ChapterFrame>
  );
}
