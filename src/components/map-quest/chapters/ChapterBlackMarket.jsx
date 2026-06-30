import React, { useState, useEffect } from "react";
import {
  C, hexA, mono, serif, echo, fsWrap,
  ChapterFrame, Cinematic, Btn, taStyle, Row,
  AnswerJournal, PhoenixSeal, EssenceBurst,
  HeroSprite, CrownedSprite, Starfield, Embers,
} from "../kit.jsx";

/* =============================================================================
   CHAPTER 16 — THE BLACK MARKET  ·  Naive Warrior ↔ Joy  (key: chapter-black-market)
   Coelho beat: captured / the false path — the seductive shortcut, "false gold."
   Jon's testimony (Tr — TRANSMUTED, never raw): the "16 and in a gang" arc ships
   here ONLY as fiction — a neon Black Market of borrowed/false upgrades and a
   counterfeit "family" that hands you fast-but-not-yours power. The emotional
   truth is kept whole: the Naive Warrior trusts the wrong family because he is
   STARVING for belonging; impulsive trust gets good kids used. Lesson: owned &
   clean beats fast & borrowed — audit whether a move is yours or borrowed.
   Exercise: Clean Movement Check (shortcut, ownedClean) → answer-fill mirror →
   reforge → Essence: JOY. shadow:"naive_warrior". See 07_CHAPTER_DOSSIER.md.
   ============================================================================= */

const AMBER = C.amber;
const SCENE_BG = `radial-gradient(900px 700px at 50% 12%, ${hexA(AMBER, 0.15)}, transparent), ${C.black}`;

const INTRO = [
  {
    id: "market", mood: AMBER, backdrop: "embers", kicker: "CHAPTER 16 · THE BLACK MARKET",
    cast: [{ id: "hero", node: <HeroSprite size={116} glow={C.cyan} />, label: "YOU" }],
    lines: [
      "The road forks into an underpass strung with counterfeit light — a Black Market that sells the journey instead of making you take it.",
      "Every stall hawks a shortcut: borrowed power, rented status, upgrades that glow like real gold and weigh like none of it. \"Skip the road,\" a vendor purrs. \"Arrive tonight.\"",
    ],
    speaker: C.text, cta: "Walk deeper →",
  },
  {
    id: "encounter", mood: AMBER, backdrop: "embers",
    cast: [
      { id: "hero", node: <HeroSprite size={98} glow={C.cyan} />, label: "YOU" },
      { id: "warrior", node: <CrownedSprite size={116} baseColor={AMBER} revealed />, label: "THE NAIVE WARRIOR", labelColor: AMBER },
    ],
    lines: [
      "A young warrior leans against the brightest stall, decked in plated upgrades that don't quite fit him. A crew drapes arms over his shoulders — a \"family\" that found him fast.",
      "\"Traveler. You look hungry — for the road, for belonging.\" He grins. \"They took me in when no one else did. Handed me power before I earned it. I never even read what the contract cost.\"",
    ],
    speaker: AMBER, cta: "\"…Who gave you that?\" →",
  },
  {
    id: "mirror", mood: AMBER, backdrop: "embers",
    cast: [
      { id: "hero", node: <HeroSprite size={108} glow={C.cyan} />, label: "THE GLASS · YOU" },
      { id: "warrior", node: <CrownedSprite size={120} baseColor={AMBER} revealed />, label: "OUTSIDE · HIM", labelColor: AMBER },
    ],
    lines: [
      "He turns a polished shard of the stall toward your face. You see your own hood, your own light — and then he steps beside it.",
      "His shape is your shape. The same silhouette. Only — he wears the crown of someone who took the seductive shortcut.",
      "\"I'm not a stranger. I'm you, on the night you were so starved to belong that you'd trust anyone who called you family. Let me show you how it took me.\"",
    ],
    speaker: AMBER, cta: "How did it take you? →",
  },
  {
    id: "origin1", mood: C.hotPink, backdrop: "embers",
    cast: [{ id: "warrior", node: <CrownedSprite size={120} baseColor={AMBER} revealed />, label: "THE NAIVE WARRIOR", labelColor: AMBER }],
    lines: [
      "\"I was young and outside every door. The Market was the only place that didn't turn me away — so when a friend said 'we're family now,' I wanted it so bad I didn't ask one question.\"",
      "\"They handed me a glowing crate to carry across the grid. 'Easy run,' they said. 'You're one of us.' Belonging felt like gold in my hands. I never weighed it.\"",
    ],
    speaker: C.hotPink, cta: "Keep watching →",
  },
  {
    id: "origin2", mood: C.danger, backdrop: "embers",
    cast: [{ id: "warrior", node: <CrownedSprite size={128} baseColor={AMBER} revealed />, label: "THE NAIVE WARRIOR", labelColor: AMBER }],
    lines: [
      "\"The 'family' wasn't a family. It was a machine that used good kids fast and discarded them faster. The shortcut had a sting wired into it that nearly closed on me.\"",
      "\"I got out — barely, and it cost. The borrowed power switched off the second I stopped being useful. None of it was ever mine. The crown was always a rental.\"",
      "\"A counterfeit crown doesn't make a shadow. The hunger to belong does — when it stops asking whether a path is yours. So look in the glass: where are YOU tempted to borrow?\"",
    ],
    speaker: C.danger, cta: "Run the Clean Movement Check →",
  },
];

const CHECK_PROMPTS = [
  { key: "shortcut", label: "THE SHORTCUT", accent: AMBER,
    prompt: "Where are you tempted by a shortcut — a borrowed 'family,' fast-but-not-yours momentum — because you're hungry to belong, or hungry to arrive?" },
  { key: "ownedClean", label: "THE CLEAN, OWNED MOVE", accent: C.mint,
    prompt: "Now name the clean, owned, measurable move you'll make instead — slower maybe, but truly yours. Something no one can switch off." },
];

export default function ChapterBlackMarket({ onComplete, quest }) {
  const [phase, setPhase] = useState("intro");
  const [step, setStep] = useState(0);
  const [vals, setVals] = useState({ shortcut: "", ownedClean: "" });
  const [reforged, setReforged] = useState(false);
  const set = (k) => (e) => setVals((v) => ({ ...v, [k]: e.target.value }));

  useEffect(() => {
    if (phase !== "reforge") return;
    const t = setTimeout(() => setReforged(true), 1400);
    return () => clearTimeout(t);
  }, [phase]);

  // TODO: askMentor() — wire a server-side mentor call here later.
  // SCRIPTED ONLY for now; NEVER put an API key in client code, NEVER fetch from the client.

  const chasing = echo(quest?.getDayOneSnapshot?.()?.whatImChasing, "the belonging you think the shortcut will finally hand you");

  if (phase === "intro") {
    return (
      <ChapterFrame>
        <Cinematic shots={INTRO} accent={AMBER} onDone={() => setPhase("exercise")} />
      </ChapterFrame>
    );
  }

  if (phase === "exercise") {
    const cur = CHECK_PROMPTS[step];
    const val = vals[cur.key];
    const advance = () => (step < CHECK_PROMPTS.length - 1 ? setStep(step + 1) : setPhase("mirror"));
    return (
      <ChapterFrame>
        <div style={fsWrap(SCENE_BG)}>
          <Starfield mood={AMBER} />
          <Embers on color={AMBER} count={10} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", paddingTop: "6vh", height: 176 }}>
            <CrownedSprite size={112} baseColor={AMBER} revealed />
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ fontSize: 10, ...mono, color: cur.accent, marginBottom: 8 }}>THE CLEAN MOVEMENT CHECK · {cur.label} · {step + 1}/{CHECK_PROMPTS.length}</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.5, color: C.text, marginBottom: 12 }}>{cur.prompt}</p>
            <textarea value={val} onChange={set(cur.key)} placeholder="Write your truth…" style={taStyle(cur.accent)} />
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <Btn accent={AMBER} disabled={!val.trim()} onClick={advance}>{step < CHECK_PROMPTS.length - 1 ? "Next →" : "Hold up the glass →"}</Btn>
            </div>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  if (phase === "mirror") {
    return (
      <ChapterFrame>
        <div style={fsWrap(`radial-gradient(800px 700px at 50% 20%, ${hexA(AMBER, 0.16)}, ${C.night} 55%, ${C.black})`)}>
          <Starfield mood={AMBER} />
          <Embers on color={AMBER} count={10} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", paddingTop: "6vh", height: 188, gap: 16 }}>
            <HeroSprite size={104} glow={C.cyan} />
            <CrownedSprite size={120} baseColor={AMBER} revealed />
          </div>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "8px 22px 50px" }}>
            <div style={{ textAlign: "center", fontSize: 11, letterSpacing: 3, color: AMBER, ...mono, marginBottom: 10 }}>THE GLASS · the answer-fill</div>
            <p style={{ ...serif, fontStyle: "italic", fontSize: 16, lineHeight: 1.55, color: C.text, marginBottom: 10 }}>
              The Naive Warrior holds the glass steady. &ldquo;You said the shortcut calling you is <span style={{ color: AMBER }}>{echo(vals.shortcut, "a borrowed family that wants you fast")}</span>. That&rsquo;s the same hunger that took me.&rdquo;
            </p>
            <div style={{ padding: "16px 16px", borderRadius: 16, background: `linear-gradient(160deg, ${hexA(C.mint, .12)}, ${C.cardDeep})`, border: `1px solid ${hexA(C.mint, .4)}`, marginBottom: 14 }}>
              <p style={{ ...serif, fontSize: 18, lineHeight: 1.5, color: C.text, margin: "0 0 8px" }}>
                &ldquo;But you also named the clean move: <span style={{ color: C.mint }}>{echo(vals.ownedClean, "a slower step that's wholly yours")}</span>. No one can switch that off.&rdquo;
              </p>
              <p style={{ ...serif, fontSize: 16, lineHeight: 1.5, color: C.mint, margin: 0, fontStyle: "italic" }}>&ldquo;Owned and clean beats fast and borrowed. Every single time.&rdquo;</p>
            </div>
            <p style={{ fontSize: 13, color: C.textDim, fontStyle: "italic", marginBottom: 14, textAlign: "center" }}>
              &ldquo;You and I are both still chasing {chasing}. The difference is whether the path is ours — or rented. Choose the owned one, and the joy is real because the win is real.&rdquo;
            </p>
            <Btn full accent={AMBER} onClick={() => setPhase("reforge")}>Reforge the warrior →</Btn>
          </div>
        </div>
      </ChapterFrame>
    );
  }

  // reforge + seal
  const finish = () => {
    quest?.updateDashboard?.({ stage: "Approach · The False Path", purpose: 8, faith: 7, fear: 6, courage: 8, trust: 7 });
    onComplete?.({
      shadow: "naive_warrior", essence: "Joy",
      shortcut: vals.shortcut.trim(), ownedClean: vals.ownedClean.trim(),
      reforged: "clean_operator",
    });
  };
  return (
    <ChapterFrame>
      <div style={fsWrap(`radial-gradient(800px 700px at 50% 18%, ${hexA(reforged ? C.mint : AMBER, .2)}, ${C.night} 55%, ${C.black})`)}>
        <Starfield mood={reforged ? C.mint : AMBER} />
        <Embers on color={reforged ? C.mint : AMBER} count={14} />
        <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", paddingTop: "6vh", height: 200 }}>
          <CrownedSprite size={150} baseColor={AMBER} revealed healed={reforged} healedColor={C.mint} />
        </div>
        <div style={{ position: "relative", zIndex: 2, maxWidth: 500, margin: "0 auto", padding: "6px 22px 56px" }}>
          {!reforged ? (
            <p style={{ ...serif, fontStyle: "italic", fontSize: 17, color: C.text, textAlign: "center", animation: "sFade .6s" }}>You drop the borrowed crate. The counterfeit upgrades flicker, dim… and reforge into something that is finally, only yours.</p>
          ) : (
            <div style={{ animation: "sRiseGlow .8s" }}>
              <EssenceBurst color={AMBER} glyph="✦" name="JOY" line="Joy is the lightness of a win that's actually yours — clean, owned, and unable to be switched off." />
              <p style={{ ...serif, fontSize: 16, color: C.text, textAlign: "center", margin: "4px 0 18px" }}>
                The Naive Warrior is gone. In his place stands a <b style={{ color: C.mint }}>Joyful, Clean Operator</b> — and he wears your face.
              </p>
              <AnswerJournal title="WHAT YOU AUDITED" accent={C.mint} entries={[
                { q: "The shortcut / borrowed family that tempted you", a: vals.shortcut },
                { q: "The clean, owned, measurable move you chose instead", a: vals.ownedClean },
              ]} />
              <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: hexA(AMBER, .06), border: `1px solid ${hexA(AMBER, .3)}` }}>
                <Row label="Shadow" value="Naive Warrior → Clean Operator" accent={AMBER} />
                <Row label="Essence returned" value="Joy" accent={AMBER} />
                <Row label="Your move" value="Owned & clean, not fast & borrowed" accent={AMBER} />
              </div>
              <PhoenixSeal color={C.phoenix} label="ESSENCE OF JOY · SEALED" />
              <Btn full accent={C.mint} onClick={finish}>Carry Joy forward →</Btn>
            </div>
          )}
        </div>
      </div>
    </ChapterFrame>
  );
}
