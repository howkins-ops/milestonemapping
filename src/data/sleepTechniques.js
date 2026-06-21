// ─── Wind-down breathing & meditation techniques ────────────────────────────────
// A small library of evidence-backed ways to fall asleep faster. Three shapes:
//   type: "breath" → paced breathing; the orb scales with each phase.
//   type: "guided" → timed body/mind script; the orb breathes gently in the bg.
//   type: "shuffle"→ cognitive shuffle; a stream of neutral words to picture.
//
// Phases carry `scale` (orb size 0–1) so the animation reads as a real breath:
// inhale grows it, hold keeps it, exhale shrinks it. Timings in SECONDS.

export const SLEEP_TECHNIQUES = [
  {
    id: "478",
    type: "breath",
    name: "4-7-8 Breathing",
    tagline: "The \"natural tranquilizer\"",
    glyph: "🌬️",
    accent: "#00F0FF",
    blurb: "Inhale 4, hold 7, exhale 8. The long exhale is the off-switch for a racing mind.",
    science: "The extended exhale stimulates the vagus nerve, dropping heart rate and cortisol. Dr. Andrew Weil calls it a natural tranquilizer for the nervous system.",
    cycles: 4,
    phases: [
      { key: "inhale", label: "Breathe in",  hint: "through your nose",        secs: 4, scale: 1.0 },
      { key: "hold",   label: "Hold",         hint: "keep it soft",            secs: 7, scale: 1.0 },
      { key: "exhale", label: "Breathe out",  hint: "mouth open, whoosh",      secs: 8, scale: 0.4 },
    ],
  },
  {
    id: "box",
    type: "breath",
    name: "Box Breathing",
    tagline: "Navy SEAL calm",
    glyph: "⬛",
    accent: "#A78BFA",
    blurb: "Four equal sides: in 4, hold 4, out 4, hold 4. Steadies a spun-up system fast.",
    science: "Used by Navy SEALs and first responders to stay calm under pressure. Equal-ratio breathing balances the nervous system and quiets stress arousal.",
    cycles: 5,
    phases: [
      { key: "inhale", label: "Breathe in",  secs: 4, scale: 1.0 },
      { key: "hold",   label: "Hold",         secs: 4, scale: 1.0 },
      { key: "exhale", label: "Breathe out",  secs: 4, scale: 0.4 },
      { key: "hold2",  label: "Hold empty",   secs: 4, scale: 0.4 },
    ],
  },
  {
    id: "coherent",
    type: "breath",
    name: "Coherent Breathing",
    tagline: "Heart-rhythm reset",
    glyph: "🌊",
    accent: "#00FFBF",
    blurb: "Slow, even waves — in 5, out 5. About six breaths a minute, the body's calm pace.",
    science: "Breathing at ~5.5 breaths per minute maximizes heart-rate variability and vagal tone — the physiological signature of deep relaxation.",
    cycles: 8,
    phases: [
      { key: "inhale", label: "Breathe in",  secs: 5, scale: 1.0 },
      { key: "exhale", label: "Breathe out",  secs: 5, scale: 0.4 },
    ],
  },
  {
    id: "bodyscan",
    type: "guided",
    name: "Body Scan",
    tagline: "Melt tension, head to toe",
    glyph: "🫧",
    accent: "#FACC15",
    blurb: "Progressive relaxation — tense and release each muscle group until your whole body lets go.",
    science: "Progressive muscle relaxation (Jacobson) reliably shortens the time it takes to fall asleep by switching on the parasympathetic 'rest and digest' system.",
    breathSecs: 6, // gentle ambient orb pace
    steps: [
      { text: "Lie still. Let your full weight sink into the bed. Breathe slow.", secs: 12 },
      { text: "Scrunch your face tight — forehead, eyes, jaw. Hold… and release. Feel it soften.", secs: 14 },
      { text: "Lift your shoulders to your ears. Squeeze… and let them drop completely.", secs: 14 },
      { text: "Make fists and tense both arms. Hold… and let them go heavy.", secs: 14 },
      { text: "Tighten your chest and stomach. Hold… and release every bit.", secs: 14 },
      { text: "Squeeze your glutes and thighs. Hold… and let them melt into the mattress.", secs: 14 },
      { text: "Point your toes and tense your calves. Hold… and release.", secs: 14 },
      { text: "Now scan from head to toe. Anywhere still holding? Breathe into it and let go.", secs: 16 },
      { text: "Your whole body is heavy, warm, and loose. Nothing left to do but drift.", secs: 16 },
    ],
  },
  {
    id: "military",
    type: "guided",
    name: "Military Method",
    tagline: "Asleep in ~2 minutes",
    glyph: "🎖️",
    accent: "#00F0FF",
    blurb: "The technique pilots used to fall asleep sitting up. Relax the face, then go blank.",
    science: "Taught to U.S. military to fall asleep in under two minutes, even in daylight. Combines full-body relaxation with a single calming mental image.",
    breathSecs: 6,
    steps: [
      { text: "Relax your whole face. Let your forehead, cheeks, jaw, and tongue go completely slack.", secs: 16 },
      { text: "Drop your shoulders as low as they'll go. Let your arms fall loose at your sides.", secs: 16 },
      { text: "Breathe out and relax your chest. Let your stomach soften.", secs: 14 },
      { text: "Relax your legs — thighs, calves, all the way to your feet.", secs: 16 },
      { text: "Now clear your mind. Picture lying in a canoe on a still lake, blue sky above. Nothing else.", secs: 18 },
      { text: "If thoughts come, gently repeat: \"don't think… don't think… don't think.\"", secs: 18 },
    ],
  },
  {
    id: "shuffle",
    type: "shuffle",
    name: "Cognitive Shuffle",
    tagline: "Scramble the racing mind",
    glyph: "🃏",
    accent: "#FF3EDB",
    blurb: "Picture a stream of random, unrelated things. It mimics the mind's pre-sleep drift and blocks anxious chains of thought.",
    science: "Developed by cognitive scientist Luc Beaudoin, 'serial diverse imagining' scrambles the goal-directed thinking that keeps you awake, signaling the brain that it's safe to sleep.",
    wordSecs: 9,
    intro: "Picture each thing as vividly as you can for a moment, then let it go and wait for the next. Don't connect them.",
    words: [
      "a candle", "a wooden boat", "a ripe peach", "a snowflake", "an old key",
      "a paper lantern", "a sleepy cat", "a brass bell", "a river stone", "a kite",
      "a teacup", "a feather", "a lighthouse", "a marble", "a folded map",
      "a pinecone", "a velvet curtain", "a tin robot", "a seashell", "a hammock",
      "a glass jar", "a wool blanket", "a wind chime", "a clay pot", "a quiet meadow",
      "a paper crane", "a stack of books", "a garden gate", "a copper coin", "a soft cloud",
    ],
  },
];

export function getSleepTechnique(id) {
  return SLEEP_TECHNIQUES.find((t) => t.id === id) || null;
}

export const BREATHWORK_ATTRIBUTION =
  "Zaccaro et al., Frontiers in Human Neuroscience (2018) · slow breathing & vagal tone";
