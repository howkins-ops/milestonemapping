// Single source of truth for the guided Vision Meditation.
//
// The spoken text is intentionally GENERIC (no project name) so the narration can be
// pre-baked ONCE with ElevenLabs (Clara) and then replayed for free forever.
// To (re)generate the audio after editing these lines:  node scripts/bake-vision-meditation.js
//
// `breath` drives the on-screen orb + the soft synth breath cue.
export const VISION_MEDITATION_LINES = [
  { id: 0, text: "Settle in. Let your shoulders drop, and soften your jaw.", breath: "inhale" },
  { id: 1, text: "Breathe in slowly through your nose… and let it all go.", breath: "exhale" },
  { id: 2, text: "Now bring your vision to mind, as if it is already real.", breath: "inhale" },
  { id: 3, text: "See the colors. Notice where you are standing in it.", breath: "hold" },
  { id: 4, text: "Feel what it feels like to have already arrived here.", breath: "exhale" },
  { id: 5, text: "This is not a someday. This is who you are becoming.", breath: "inhale" },
  { id: 6, text: "Let the image grow brighter with every breath you take.", breath: "hold" },
  { id: 7, text: "When you open your eyes, take one small step toward it.", breath: "exhale" },
];

// Path to the pre-baked ElevenLabs (Clara) audio for a given line id.
export const visionLineAudio = (id) => `/audio/vision-med-${id}.mp3`;
