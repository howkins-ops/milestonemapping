// 21+ RAW voice lines for the Anger Gym — single source of truth.
// Games import the text; scripts/bake-anger-voices.js bakes each line to
// public/audio/anger/<id>.mp3 with the voice + delivery settings below.
// CONTENT WARNING: intentionally explicit. This suite is adult-rated by design —
// the point is catharsis, so the customers swear and the rep swears back.

// Delivery presets (ElevenLabs voice_settings). Lower stability = more unhinged.
const CALM = { stability: 0.5, similarity_boost: 0.75, style: 0.25, use_speaker_boost: true };
const HEATED = { stability: 0.38, similarity_boost: 0.75, style: 0.55, use_speaker_boost: true };
const FURIOUS = { stability: 0.28, similarity_boost: 0.7, style: 0.8, use_speaker_boost: true };
const NUCLEAR = { stability: 0.2, similarity_boost: 0.65, style: 1.0, use_speaker_boost: true };

// ---------- THE DOOR — the homeowner behind the door (voice: harry) ----------
// Tier unlocks with door damage; playback volume also escalates per tier in-game.

export const DOOR_TIERS = [
  {
    delivery: CALM,
    lines: [
      { id: "door-t1-0", text: "Not interested." },
      { id: "door-t1-1", text: "Go away." },
      { id: "door-t1-2", text: "We don't want any." },
    ],
  },
  {
    delivery: HEATED,
    lines: [
      { id: "door-t2-0", text: "I SAID go away!" },
      { id: "door-t2-1", text: "Read the sign! NO soliciting!" },
      { id: "door-t2-2", text: "You're STILL here?!" },
    ],
  },
  {
    delivery: FURIOUS,
    lines: [
      { id: "door-t3-0", text: "Are you DEAF?! Get off my porch!" },
      { id: "door-t3-1", text: "What part of NO don't you understand?!" },
      { id: "door-t3-2", text: "You've got some NERVE knocking again!" },
    ],
  },
  {
    delivery: FURIOUS,
    lines: [
      { id: "door-t4-0", text: "GET THE HELL OFF MY PROPERTY!" },
      { id: "door-t4-1", text: "I'm calling the damn cops!" },
      { id: "door-t4-2", text: "Knock ONE more time. I DARE you!" },
    ],
  },
  {
    delivery: NUCLEAR,
    lines: [
      { id: "door-t5-0", text: "FUCK OFF!" },
      { id: "door-t5-1", text: "Are you KIDDING me?! FUCK YOU!" },
      { id: "door-t5-2", text: "GET THE FUCK AWAY FROM MY DOOR!" },
    ],
  },
];

export const DOOR_OPEN = {
  id: "door-open",
  text: "Alright... alright! You win, kid. Come on in.",
  delivery: CALM,
};

// ---------- OBJECTION SLAM — three customers + the rep ----------

export const SLAM_CUSTOMERS = [
  {
    key: "kicker",
    voice: "george",
    delivery: CALM,
    objections: [
      { id: "slam-kicker-0", text: "Just looking." },
      { id: "slam-kicker-1", text: "Send me some information." },
      { id: "slam-kicker-2", text: "I'll think about it." },
      { id: "slam-kicker-3", text: "Call me next quarter. Maybe." },
    ],
  },
  {
    key: "excuse",
    voice: "brian",
    delivery: HEATED,
    objections: [
      { id: "slam-excuse-0", text: "It's too damn expensive!" },
      { id: "slam-excuse-1", text: "My wife will KILL me!" },
      { id: "slam-excuse-2", text: "Now is NOT a good time!" },
      { id: "slam-excuse-3", text: "We already have a guy!" },
    ],
  },
  {
    key: "mrsno",
    voice: "sarah",
    delivery: FURIOUS,
    objections: [
      { id: "slam-mrsno-0", text: "No." },
      { id: "slam-mrsno-1", text: "Still no." },
      { id: "slam-mrsno-2", text: "I've said no to better than you." },
      { id: "slam-mrsno-3", text: "I NEVER buy from salespeople. EVER." },
    ],
  },
];

// Rep stingers — fired on deflects, index climbs with the combo counter.
export const SLAM_REP = [
  { id: "slam-rep-0", text: "Cool story. NEXT!", delivery: HEATED },
  { id: "slam-rep-1", text: "Your no bounced RIGHT off me.", delivery: HEATED },
  { id: "slam-rep-2", text: "I eat rejection for BREAKFAST!", delivery: FURIOUS },
  { id: "slam-rep-3", text: "That all you got?!", delivery: FURIOUS },
  { id: "slam-rep-4", text: "I don't give a DAMN about your maybe!", delivery: FURIOUS },
  { id: "slam-rep-5", text: "I could NOT give a fuck about your no!", delivery: NUCLEAR },
  { id: "slam-rep-6", text: "I'm fucking BULLETPROOF!", delivery: NUCLEAR },
];

export const SLAM_WINS = [
  { id: "slam-win-0", text: "SLAMMED!", delivery: NUCLEAR },
  { id: "slam-win-1", text: "DENIED!", delivery: NUCLEAR },
  { id: "slam-win-2", text: "NEXT VICTIM!", delivery: NUCLEAR },
];

// ---------- flat manifest for the bake script ----------

export const ALL_VOICE_LINES = [
  ...DOOR_TIERS.flatMap((tier) =>
    tier.lines.map((l) => ({ ...l, voice: "harry", delivery: tier.delivery }))
  ),
  { ...DOOR_OPEN, voice: "harry" },
  ...SLAM_CUSTOMERS.flatMap((c) =>
    c.objections.map((o) => ({ ...o, voice: c.voice, delivery: c.delivery }))
  ),
  ...SLAM_REP.map((l) => ({ ...l, voice: "callum" })),
  ...SLAM_WINS.map((l) => ({ ...l, voice: "callum" })),
];
