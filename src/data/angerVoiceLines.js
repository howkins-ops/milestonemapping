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
// Extra bite for the rep — a bratty, mouthy teenager who never learned to filter.
const PUNK = { stability: 0.15, similarity_boost: 0.6, style: 1.0, use_speaker_boost: true };

// ---------- THE DOOR — the homeowner behind the door (voice: harry) ----------
// Tier unlocks with door damage; playback volume also escalates per tier in-game.

export const DOOR_TIERS = [
  {
    delivery: CALM,
    lines: [
      { id: "door-t1-0", text: "Not interested." },
      { id: "door-t1-1", text: "Go away." },
      { id: "door-t1-2", text: "We don't want any." },
      { id: "door-t1-3", text: "We gave at the office. Twice." },
      { id: "door-t1-4", text: "Nobody's home. I'm the house. Go away." },
    ],
  },
  {
    delivery: HEATED,
    lines: [
      { id: "door-t2-0", text: "I SAID go away!" },
      { id: "door-t2-1", text: "Read the sign! NO soliciting!" },
      { id: "door-t2-2", text: "You're STILL here?!" },
      { id: "door-t2-3", text: "I've got a hose and I am NOT afraid to use it!" },
      { id: "door-t2-4", text: "My dinner is getting cold because of YOU!" },
    ],
  },
  {
    delivery: FURIOUS,
    lines: [
      { id: "door-t3-0", text: "Are you DEAF?! Get off my porch!" },
      { id: "door-t3-1", text: "What part of NO don't you understand?!" },
      { id: "door-t3-2", text: "You've got some NERVE knocking again!" },
      { id: "door-t3-3", text: "You knock like a woodpecker on STEROIDS!" },
      { id: "door-t3-4", text: "I'm not buying! My FUNERAL won't be buying!" },
    ],
  },
  {
    delivery: FURIOUS,
    lines: [
      { id: "door-t4-0", text: "GET THE HELL OFF MY PROPERTY!" },
      { id: "door-t4-1", text: "I'm calling the damn cops!" },
      { id: "door-t4-2", text: "Knock ONE more time. I DARE you!" },
      { id: "door-t4-3", text: "I'll call your manager! I'll call your MOTHER!" },
      { id: "door-t4-4", text: "I've got a bat and thirty bad years, kid!" },
    ],
  },
  {
    delivery: NUCLEAR,
    lines: [
      { id: "door-t5-0", text: "FUCK OFF!" },
      { id: "door-t5-1", text: "Are you KIDDING me?! FUCK YOU!" },
      { id: "door-t5-2", text: "GET THE FUCK AWAY FROM MY DOOR!" },
      { id: "door-t5-3", text: "You knocked the paint off my fucking door!" },
      { id: "door-t5-4", text: "WHAT THE FUCK IS WRONG WITH YOU?!" },
    ],
  },
];

export const DOOR_OPEN = {
  id: "door-open",
  text: "Alright... alright! You win, kid. Come on in.",
  delivery: CALM,
};

// ---------- THE DOOR — the rep (voice: liam, cocky teenage-punk closer). --------
// Round 1: cocky prick. Round 2: it's midnight, he's in a competition, he does
// NOT care. Every line something a door-to-door closer WISHES he could say.

export const DOOR_REP_R1 = [
  { id: "door-rep-r1-0", text: "I know you're in there. I can hear the TV.", delivery: HEATED },
  { id: "door-rep-r1-1", text: "That's one more NO for my collection.", delivery: HEATED },
  { id: "door-rep-r1-2", text: "Scream louder. It feeds me.", delivery: FURIOUS },
  { id: "door-rep-r1-3", text: "I've been told no by scarier doors than you.", delivery: FURIOUS },
  { id: "door-rep-r1-4", text: "I can do this ALL. DAY.", delivery: FURIOUS },
  { id: "door-rep-r1-5", text: "Nice house. Be a shame if I stood in front of it ALL day.", delivery: HEATED },
  { id: "door-rep-r1-6", text: "Every NO gets me closer to employee of the month, baby.", delivery: HEATED },
  { id: "door-rep-r1-7", text: "I've got nowhere to be and a bladder of STEEL.", delivery: FURIOUS },
  { id: "door-rep-r1-8", text: "This door is the only thing between you and the deal of your LIFE.", delivery: FURIOUS },
  { id: "door-rep-r1-9", text: "Scream all you want — the price stays FANTASTIC.", delivery: FURIOUS },
  { id: "door-rep-r1-10", text: "Oh, you wanna fight? Let's FIGHT. Then you sign.", delivery: PUNK },
  { id: "door-rep-r1-11", text: "Beat me up? Do it. I bleed CONTRACTS, old man.", delivery: PUNK },
];

// Round 2 — the homeowner at midnight. Explicit, unhinged, losing the plot.
export const DOOR_NIGHT = [
  { id: "door-n2-0", text: "It is MIDNIGHT. WHO rings a doorbell at MIDNIGHT?!", delivery: FURIOUS },
  { id: "door-n2-1", text: "Stop ringing the fucking doorbell!", delivery: NUCLEAR },
  { id: "door-n2-2", text: "I have work in the morning, you ANIMAL!", delivery: NUCLEAR },
  { id: "door-n2-3", text: "My wife is trying to SLEEP, asshole!", delivery: NUCLEAR },
  { id: "door-n2-4", text: "I'm calling the cops! ...The line is BUSY?!", delivery: NUCLEAR },
  { id: "door-n2-5", text: "It's after midnight, you fucking PSYCHOPATH!", delivery: NUCLEAR },
  { id: "door-n2-6", text: "The neighbors are FILMING this, asshole!", delivery: NUCLEAR },
  { id: "door-n2-7", text: "You woke the baby! WE DON'T EVEN HAVE A BABY!", delivery: NUCLEAR },
  { id: "door-n2-8", text: "WHY is that bell SO loud?! WHO WIRED THIS?!", delivery: NUCLEAR },
  { id: "door-n2-9", text: "I'm in my UNDERWEAR, you son of a bitch!", delivery: NUCLEAR },
  { id: "door-n2-10", text: "Fine! Call me back! In the MORNING!", delivery: NUCLEAR },
  { id: "door-n2-11", text: "Come back in an HOUR! I mean NEVER! NEVER COME BACK!", delivery: NUCLEAR },
  { id: "door-n2-12", text: "I will beat your ASS, I swear to GOD!", delivery: NUCLEAR },
  { id: "door-n2-13", text: "One more ring and I'm coming out there to FIGHT you!", delivery: NUCLEAR },
];

// Round 2 — the rep, fully unhinged. Ruthless. He is CLOSING tonight.
export const DOOR_REP_R2 = [
  { id: "door-rep-r2-0", text: "I don't care if it's late! I want this SALE!", delivery: FURIOUS },
  { id: "door-rep-r2-1", text: "Come out here and SIGN THIS SHIT!", delivery: NUCLEAR },
  { id: "door-rep-r2-2", text: "I'm in a competition, Harold! You're my TROPHY!", delivery: NUCLEAR },
  { id: "door-rep-r2-3", text: "I've got a pen, a contract, and NOWHERE else to be!", delivery: NUCLEAR },
  { id: "door-rep-r2-4", text: "I'm gonna close you so hard your NEIGHBORS buy one!", delivery: NUCLEAR },
  { id: "door-rep-r2-5", text: "You can't outlast me. I drink rejection like COFFEE!", delivery: NUCLEAR },
  { id: "door-rep-r2-6", text: "SIGN IT, Harold! The pen is getting COLD!", delivery: NUCLEAR },
  { id: "door-rep-r2-7", text: "Fucking CHAD is not beating me tonight, Harold. CHAD.", delivery: NUCLEAR },
  { id: "door-rep-r2-8", text: "I will ring this bell till SUNRISE. I've done it before!", delivery: NUCLEAR },
  { id: "door-rep-r2-9", text: "I don't sleep, Harold. I CLOSE.", delivery: FURIOUS },
  { id: "door-rep-r2-10", text: "Sign the fucking line! Right on the X! The X MISSES you!", delivery: NUCLEAR },
  { id: "door-rep-r2-11", text: "You're not a customer anymore, Harold. You're a HOSTAGE of VALUE.", delivery: NUCLEAR },
  { id: "door-rep-r2-12", text: "Call you back? I don't DO callbacks. I do CLOSINGS!", delivery: PUNK },
  { id: "door-rep-r2-13", text: "Come back in an hour? I'll be here in an hour, and the one AFTER that!", delivery: PUNK },
  { id: "door-rep-r2-14", text: "You're wasting MY time, Harold, and I don't waste WELL!", delivery: PUNK },
  { id: "door-rep-r2-15", text: "Fuck you! GET OUT HERE!", delivery: PUNK },
  { id: "door-rep-r2-16", text: "Wanna fight me? FIGHT ME! Then you SIGN!", delivery: PUNK },
  { id: "door-rep-r2-17", text: "Beat me up, I DARE you — I'll sign the contract with my own BLOOD!", delivery: PUNK },
];

// The moment the door bursts open — end of round 2.
export const DOOR_BURST = {
  id: "door-burst",
  text: "THAT'S IT. THAT'S FUCKING IT. I'm coming out there!",
  delivery: NUCLEAR,
};

// Round 3 — porch fight barks.
export const DOOR_FIGHT_THEM = [
  { id: "door-fight-h-0", text: "You want a piece of me, pen boy?!", delivery: NUCLEAR },
  { id: "door-fight-h-1", text: "I took karate in 1987!", delivery: FURIOUS },
  { id: "door-fight-h-2", text: "GET! OFF! MY! PORCH!", delivery: NUCLEAR },
  { id: "door-fight-h-3", text: "My slippers have seen WAR, boy!", delivery: NUCLEAR },
  { id: "door-fight-h-4", text: "I benched two hundred in 1979, you little shit!", delivery: NUCLEAR },
  { id: "door-fight-h-5", text: "THIS PORCH IS SACRED GROUND!", delivery: NUCLEAR },
  { id: "door-fight-h-6", text: "You wanna go? Let's THROW DOWN!", delivery: NUCLEAR },
];
export const DOOR_FIGHT_REP = [
  { id: "door-fight-r-0", text: "Every punch is a bullet point!", delivery: FURIOUS },
  { id: "door-fight-r-1", text: "This is a LIMITED TIME OFFER!", delivery: NUCLEAR },
  { id: "door-fight-r-2", text: "Sign it and this all stops, Harold!", delivery: NUCLEAR },
  { id: "door-fight-r-3", text: "I punch like I follow up — RELENTLESSLY!", delivery: NUCLEAR },
  { id: "door-fight-r-4", text: "Falling down is a buying signal, Harold!", delivery: NUCLEAR },
  { id: "door-fight-r-5", text: "The contract's in my LEFT hand. Pick a fist!", delivery: NUCLEAR },
  { id: "door-fight-r-6", text: "You wanted a fight, Harold — I BROUGHT a contract!", delivery: PUNK },
  { id: "door-fight-r-7", text: "Get up! You still gotta SIGN this!", delivery: PUNK },
];

// Harold, flat on the welcome mat.
export const DOOR_KO = {
  id: "door-ko",
  text: "Okay... okay. It IS... a pretty good deal...",
  delivery: CALM,
};

// The wife (voice: sarah) — walks out, sees the carnage, signs the deal.
export const DOOR_WIFE = [
  {
    id: "door-wife-0",
    text: "Well, WELL. Harold hasn't fought for anything since the thermostat war of 2019.",
    delivery: HEATED,
  },
  {
    id: "door-wife-1",
    text: "Anyone who wants a deal THIS bad deserves one. Give me the pen, handsome.",
    delivery: HEATED,
  },
];

// ---------- OBJECTION SLAM — three levels, one rep, zero cares ----------

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
      { id: "slam-kicker-4", text: "I don't make impulse decisions." },
      { id: "slam-kicker-5", text: "Let me sleep on it for a month." },
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
      { id: "slam-excuse-4", text: "I don't even trust YOU!" },
      { id: "slam-excuse-5", text: "This smells like a damn scam!" },
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
      { id: "slam-mrsno-4", text: "I will end your whole CAREER, kid." },
      { id: "slam-mrsno-5", text: "This is my FINAL no. FOREVER." },
    ],
  },
];

// The rep's talk-back pool — dealt as the player's 3-card "hand" every throw.
// Every line gets its own baked voice: whatever the player clicks is exactly
// what he says. Delivery escalates HEATED -> FURIOUS -> NUCLEAR down the list
// so higher-index picks (later in a combo) land louder and more unhinged.
// Three tones on purpose: raw/savage, comedic, and hardcore-direct — this
// guy isn't a smug jerk, he's genuinely pissed about getting rejected all
// day, having fun with it anyway, and he still wants the damn sale.
export const SLAM_RESPONSES = [
  // raw / savage
  { id: "slam-resp-0", text: "I don't give a fuck. Continue.", delivery: HEATED },
  { id: "slam-resp-1", text: "Cool story. Anyway—", delivery: HEATED },
  { id: "slam-resp-2", text: "Noted. Ignored.", delivery: HEATED },
  { id: "slam-resp-3", text: "Teflon. Nothing sticks.", delivery: FURIOUS },
  { id: "slam-resp-4", text: "Objection overruled.", delivery: FURIOUS },
  { id: "slam-resp-5", text: "Your no bounced RIGHT off me.", delivery: FURIOUS },
  { id: "slam-resp-6", text: "I could NOT give a fuck about your no.", delivery: NUCLEAR },
  { id: "slam-resp-7", text: "I'm fucking BULLETPROOF.", delivery: NUCLEAR },
  // comedic
  { id: "slam-resp-8", text: "You're buying anyway. We both know it.", delivery: HEATED },
  { id: "slam-resp-9", text: "I've heard worse from my own GPS.", delivery: HEATED },
  { id: "slam-resp-10", text: "My feelings called in sick today.", delivery: HEATED },
  { id: "slam-resp-11", text: "Weird way to say YES, but okay.", delivery: FURIOUS },
  { id: "slam-resp-12", text: "That's cute. NEXT.", delivery: FURIOUS },
  { id: "slam-resp-13", text: "Is that ALL you got? My grandma hits harder.", delivery: FURIOUS },
  { id: "slam-resp-14", text: "I eat rejection for BREAKFAST, lunch, AND dinner.", delivery: NUCLEAR },
  { id: "slam-resp-15", text: "Fuck the maybe. It's a yes and we both know it.", delivery: NUCLEAR },
  // hardcore-direct
  { id: "slam-resp-16", text: "So anyway — here's the pen.", delivery: HEATED },
  { id: "slam-resp-17", text: "So are we doing this today, or not?", delivery: HEATED },
  { id: "slam-resp-18", text: "Sign here or walk. Your call.", delivery: FURIOUS },
  { id: "slam-resp-19", text: "I don't babysit maybes. Yes or no.", delivery: FURIOUS },
  { id: "slam-resp-20", text: "That all you got?! Give me the damn sale.", delivery: FURIOUS },
  { id: "slam-resp-21", text: "I don't give a DAMN about your maybe. Sign.", delivery: NUCLEAR },
  { id: "slam-resp-22", text: "Stop stalling and give me the yes you owe me.", delivery: NUCLEAR },
  { id: "slam-resp-23", text: "I'm not leaving this doorstep without a signature.", delivery: NUCLEAR },
];

// The charm payoff — fires when a random mid-battle roll lands and the
// customer drops the act early. Flavored per persona: Tire-Kicker is
// surprised-warm, Excuse Machine is relieved-grudging, Mrs. NO is
// grudging-respect. This is the "I like your character, kid" moment.
export const SLAM_IMPRESSED = {
  kicker: [
    { id: "slam-impressed-kicker-0", text: "Huh. Okay. I like your character, kid. Let's do it.", delivery: CALM },
    { id: "slam-impressed-kicker-1", text: "You're not like the other guys. Fine — sign me up.", delivery: CALM },
    { id: "slam-impressed-kicker-2", text: "Alright, alright. You've earned this one. Where's the pen?", delivery: CALM },
  ],
  excuse: [
    { id: "slam-impressed-excuse-0", text: "You know what — I respect that you didn't back down. Deal.", delivery: HEATED },
    { id: "slam-impressed-excuse-1", text: "Fine! FINE. You've got more balls than my last three vendors. I'm in.", delivery: HEATED },
    { id: "slam-impressed-excuse-2", text: "Okay, you win. Genuinely. Let's get this done before I change my mind.", delivery: HEATED },
  ],
  mrsno: [
    { id: "slam-impressed-mrsno-0", text: "Well. I'll be damned. You've got good character, kid. Let's do it.", delivery: FURIOUS },
    { id: "slam-impressed-mrsno-1", text: "Nobody talks back to me like that. I respect it. Fine — sign me up.", delivery: FURIOUS },
    { id: "slam-impressed-mrsno-2", text: "Undefeated since '87, and you just beat me. Give me the damn pen.", delivery: FURIOUS },
  ],
};

export const SLAM_WINS = [
  { id: "slam-win-0", text: "SLAMMED!", delivery: NUCLEAR },
  { id: "slam-win-1", text: "DENIED!", delivery: NUCLEAR },
  { id: "slam-win-2", text: "NEXT VICTIM!", delivery: NUCLEAR },
];

// The one fixed comeback to Mrs. NO's boss-tier super volley.
export const SLAM_SUPER = { id: "slam-super", text: "WATCH ME.", delivery: NUCLEAR };

// ════════════════════════════════════════════════════════════════════════
//  THE DOOR — LEVEL LADDER (v4). The original arc above is LEVEL 1
//  (customer: harry, rep: liam, wife: sarah). Below are Levels 2-4.
//
//  Customer voices:  L1 & L3 = harry (SAME guy — Harold moves to a gated
//  community in L3). L2 = marcus (new, deep + aggressive). L4 = deon (new,
//  husky + aggressive). Rep is always liam. Delivery escalates with the
//  in-game Bloody-Knuckles damage stage. 21+ by design — same content law
//  as the rest of this file.
// ════════════════════════════════════════════════════════════════════════

// ---------- LEVEL 2 — "ALWAYS BE PERSISTENT" (customer: marcus) ----------
// Lesson: keep knocking — a no-answer isn't a no, the man's just takin' a shit.
// Round 1 = the ring-a-thon. Round 2 = the vent + first blood. Round 3 = open.

export const L2_THEM_R1 = [
  { id: "l2-them-r1-0", text: "Man, I'm BUSY! Give me a goddamn minute!", delivery: HEATED },
  { id: "l2-them-r1-1", text: "Who the hell is bangin' on my door like that?!", delivery: HEATED },
  { id: "l2-them-r1-2", text: "I'm in the middle of somethin', fool! Back OFF!", delivery: HEATED },
  { id: "l2-them-r1-3", text: "Every time you ring that bell I lose my concentration!", delivery: HEATED },
  { id: "l2-them-r1-4", text: "Ain't NOBODY home for whatever you're sellin'!", delivery: HEATED },
];
export const L2_YOU_R1 = [
  { id: "l2-you-r1-0", text: "Open the damn door! I can hear you shuffling around in there!", delivery: HEATED },
  { id: "l2-you-r1-1", text: "I'll ring this bell till my thumb falls the fuck OFF!", delivery: FURIOUS },
  { id: "l2-you-r1-2", text: "That's a no? Cool. I collect those, baby.", delivery: HEATED },
  { id: "l2-you-r1-3", text: "DING DING DING! I can do this all damn day!", delivery: FURIOUS },
  { id: "l2-you-r1-4", text: "You hear that? That's the sound of me NOT leaving!", delivery: FURIOUS },
  { id: "l2-you-r1-5", text: "I'll wear a GROOVE in this welcome mat, my guy!", delivery: HEATED },
];

export const L2_THEM_R2 = [
  { id: "l2-them-r2-0", text: "Bro, is your HAND okay?! That's a lotta blood, man!", delivery: FURIOUS },
  { id: "l2-them-r2-1", text: "You're STILL out there?! I told you I'm BUSY!", delivery: FURIOUS },
  { id: "l2-them-r2-2", text: "A grown man does NOT rush a good one, you hear me?!", delivery: FURIOUS },
  { id: "l2-them-r2-3", text: "You knock like you got a personal problem with me!", delivery: FURIOUS },
  { id: "l2-them-r2-4", text: "Okay, okay — you persistent as HELL, I'll give you that!", delivery: FURIOUS },
];
export const L2_YOU_R2 = [
  { id: "l2-you-r2-0", text: "I walked six blocks! My hand's BLEEDING! Open UP!", delivery: FURIOUS },
  { id: "l2-you-r2-1", text: "It's HELPING you?! What the fuck are you DOING in there?!", delivery: FURIOUS },
  { id: "l2-you-r2-2", text: "I don't leave. EVER. Ask literally anybody!", delivery: FURIOUS },
  { id: "l2-you-r2-3", text: "Every drop of blood is a bullet point, my guy!", delivery: NUCLEAR },
];

export const L2_THEM_R3 = [
  { id: "l2-them-r3-0", text: "AHHH! Okay, OKAY! The hell do you WANT, man?!", delivery: NUCLEAR },
  { id: "l2-them-r3-1", text: "You bled on my porch so I could finish my BUSINESS?!", delivery: FURIOUS },
  { id: "l2-them-r3-2", text: "...You didn't leave, though. I respect that. Damn.", delivery: HEATED },
  { id: "l2-them-r3-3", text: "Always be persistent, huh? Sometimes a man's just takin' a shit!", delivery: HEATED },
  { id: "l2-them-r3-4", text: "You're a SICKNESS, man. A persistent little SICKNESS.", delivery: HEATED },
];
export const L2_YOU_R3 = [
  { id: "l2-you-r3-0", text: "You left me bleeding out here so you could finish a DUMP?!", delivery: NUCLEAR },
  { id: "l2-you-r3-1", text: "So the lesson is what — always be fuckin' persistent?", delivery: FURIOUS },
  { id: "l2-you-r3-2", text: "Sign here before I lose my entire goddamn mind!", delivery: NUCLEAR },
];
export const L2_OPEN = { id: "l2-open", text: "Alright, ALRIGHT — you win, man. Get your crazy ass in here.", delivery: HEATED };
// Power-slap finale bark (rep).
export const L2_SLAP = { id: "l2-slap", text: "Keep my customer's NAME out ya mouth! SIGN IT!", delivery: NUCLEAR };

// L2 added round — "THE CHAIN CRACK": he opens the door two inches on the chain.
export const L2_THEM_CRACK = [
  { id: "l2-them-crack-0", text: "I cracked the door two inches — that's ALL you get, man!", delivery: FURIOUS },
  { id: "l2-them-crack-1", text: "I got ONE eye on you and ONE eye on my business!", delivery: FURIOUS },
  { id: "l2-them-crack-2", text: "The chain stays ON, you understand me? ON!", delivery: FURIOUS },
  { id: "l2-them-crack-3", text: "Stop stickin' your foot in the gap! That's MY gap, fool!", delivery: NUCLEAR },
  { id: "l2-them-crack-4", text: "You smell that? That's YOUR persistence and MY dinner burnin'!", delivery: FURIOUS },
];
export const L2_YOU_CRACK = [
  { id: "l2-you-crack-0", text: "Two inches is a YES with commitment issues! Open it!", delivery: FURIOUS },
  { id: "l2-you-crack-1", text: "That's a chain, not a NO! I've closed through worse!", delivery: FURIOUS },
  { id: "l2-you-crack-2", text: "My foot lives in that gap now! It pays RENT!", delivery: NUCLEAR },
  { id: "l2-you-crack-3", text: "One eye's all you need to read a CONTRACT, buddy!", delivery: HEATED },
];

// ---------- LEVEL 3 — "THE STEEL DOOR" (customer: harry — same as L1) ----------
// Harold moved to a gated community to escape. The rep breached the gate.
// Round 1 = the breach. Round 2 = pounding solid steel. Round 3 = the chainsaw.

export const L3_THEM_R1 = [
  { id: "l3-them-r1-0", text: "There's a GATE! A WALL! A sign that says FUCK OFF — how are you HERE?!", delivery: FURIOUS },
  { id: "l3-them-r1-1", text: "This is a GATED community! There are RULES, you animal!", delivery: FURIOUS },
  { id: "l3-them-r1-2", text: "I moved across the whole damn city to get away from YOU!", delivery: FURIOUS },
  { id: "l3-them-r1-3", text: "SECURITY! Security?! ...Why is nobody ANSWERING?!", delivery: FURIOUS },
];
export const L3_YOU_R1 = [
  { id: "l3-you-r1-0", text: "A gate is a SUGGESTION, Harold! You think a wall stops COMMISSION?!", delivery: FURIOUS },
  { id: "l3-you-r1-1", text: "You can run, old man. You cannot HIDE from value!", delivery: FURIOUS },
  { id: "l3-you-r1-2", text: "Nice neighborhood. Be a shame if I never fuckin' LEFT it!", delivery: HEATED },
];

export const L3_THEM_R2 = [
  { id: "l3-them-r2-0", text: "You're gonna break your hand on solid STEEL, you idiot!", delivery: FURIOUS },
  { id: "l3-them-r2-1", text: "That's blood AND tears — are you CRYING at my door?!", delivery: NUCLEAR },
  { id: "l3-them-r2-2", text: "This door is REINFORCED! My nephew's a locksmith!", delivery: FURIOUS },
  { id: "l3-them-r2-3", text: "I will NOT be closed! Not behind STEEL, you maniac!", delivery: NUCLEAR },
];
export const L3_YOU_R2 = [
  { id: "l3-you-r2-0", text: "OPEN — THIS — STEEL — DOOR — I'll rip it off with my TEETH!", delivery: NUCLEAR },
  { id: "l3-you-r2-1", text: "It's BOTH, Harold! Blood AND tears! It's ALWAYS both!", delivery: NUCLEAR },
  { id: "l3-you-r2-2", text: "Steel? I EAT steel. I follow up on steel, old man!", delivery: FURIOUS },
];

export const L3_THEM_R3 = [
  { id: "l3-them-r3-0", text: "Is that— is that a CHAINSAW?! ARE YOU INSANE?!", delivery: NUCLEAR },
  { id: "l3-them-r3-1", text: "You can't just SAW through a man's front door!", delivery: NUCLEAR },
  { id: "l3-them-r3-2", text: "I'm calling the HOA! The POLICE! My MOTHER!", delivery: NUCLEAR },
];
export const L3_YOU_R3 = [
  { id: "l3-you-r3-0", text: "You wouldn't open the door — so now there's NO fuckin' door!", delivery: NUCLEAR },
  { id: "l3-you-r3-1", text: "THIS is what persistence looks like, Harold!", delivery: NUCLEAR },
  { id: "l3-you-r3-2", text: "No door, no problem, no MERCY, old man!", delivery: NUCLEAR },
];
export const L3_CHAINSAW = { id: "l3-chainsaw", text: "Say hello to my little CLOSER!", delivery: NUCLEAR };
// Level 3 brawl barks (reuses the boxing minigame).
export const L3_FIGHT_THEM = [
  { id: "l3-fight-them-0", text: "I did KRAV MAGA at the community center!", delivery: NUCLEAR },
  { id: "l3-fight-them-1", text: "You sawed my DOOR, now I saw YOU!", delivery: NUCLEAR },
  { id: "l3-fight-them-2", text: "This is a GATED fist, you little shit!", delivery: NUCLEAR },
];
export const L3_FIGHT_YOU = [
  { id: "l3-fight-you-0", text: "Every jab's a follow-up call, Harold!", delivery: NUCLEAR },
  { id: "l3-fight-you-1", text: "The contract survives the chainsaw AND you!", delivery: NUCLEAR },
  { id: "l3-fight-you-2", text: "I trained too — in the PARKING LOT of a Denny's!", delivery: NUCLEAR },
];
export const L3_KO = { id: "l3-ko", text: "Fine... FINE. Gimme the pen before you saw somethin' else...", delivery: HEATED };

// L3 added round — "THE RING CAM": he tries to shoo you off via the video doorbell.
export const L3_THEM_CAM = [
  { id: "l3-them-cam-0", text: "I can SEE you on the camera, you lunatic! Smile for the cloud!", delivery: FURIOUS },
  { id: "l3-them-cam-1", text: "This is all being RECORDED! In 4K! For the POLICE!", delivery: FURIOUS },
  { id: "l3-them-cam-2", text: "I'm talkin' to you through a DOORBELL and you STILL won't leave?!", delivery: NUCLEAR },
  { id: "l3-them-cam-3", text: "Quit wavin' at the lens! It's not gonna BUY anything!", delivery: FURIOUS },
];
export const L3_YOU_CAM = [
  { id: "l3-you-cam-0", text: "Oh, I'm on camera? GREAT — now the whole cloud sees me CLOSE you!", delivery: FURIOUS },
  { id: "l3-you-cam-1", text: "Record THIS, Harold! Every angle! Post it! I don't CARE!", delivery: NUCLEAR },
  { id: "l3-you-cam-2", text: "A camera's just a tiny glass customer — and it's SOLD!", delivery: FURIOUS },
];

// ---------- LEVEL 4 — "NEVER DO CALL-BACKS" (customer: deon) ----------
// The customer said "come back later." So the rep comes back. All day.
// Morning -> Afternoon -> Evening -> 11:59 PM (rocks) -> kick the door in.

export const L4_THEM_MORN = [
  { id: "l4-them-morn-0", text: "Ugh... not now, man. Come back LATER.", delivery: CALM },
  { id: "l4-them-morn-1", text: "It's too damn early for whatever this is.", delivery: CALM },
  { id: "l4-them-morn-2", text: "Later, dude. Just... come back later, alright?", delivery: CALM },
];
export const L4_YOU_MORN = [
  { id: "l4-you-morn-0", text: "Mornin', sunshine! Gimme two fuckin' minutes!", delivery: HEATED },
  { id: "l4-you-morn-1", text: "Come back later? Oh, I'll be BACK. Count on it, buddy.", delivery: HEATED },
  { id: "l4-you-morn-2", text: "Rise and GRIND, buddy — mostly the grind part!", delivery: HEATED },
];

export const L4_THEM_AFT = [
  { id: "l4-them-aft-0", text: "I meant a DIFFERENT later, you maniac!", delivery: FURIOUS },
  { id: "l4-them-aft-1", text: "How are you back ALREADY?! I'm hiding in my own house!", delivery: FURIOUS },
  { id: "l4-them-aft-2", text: "I said later, not — not THIS later, man!", delivery: FURIOUS },
];
export const L4_YOU_AFT = [
  { id: "l4-you-aft-0", text: "It's LATER! You SAID later, you lyin' piece of shit!", delivery: FURIOUS },
  { id: "l4-you-aft-1", text: "There's no different later! There's only NOW!", delivery: FURIOUS },
  { id: "l4-you-aft-2", text: "Afternoon delight — and the delight is ME, at your DOOR!", delivery: FURIOUS },
];

export const L4_THEM_EVE = [
  { id: "l4-them-eve-0", text: "I'm EATING! I'm eating my goddamn DINNER, man!", delivery: NUCLEAR },
  { id: "l4-them-eve-1", text: "Get off my porch before I call the COPS!", delivery: NUCLEAR },
  { id: "l4-them-eve-2", text: "You ruined my WHOLE plate, you psycho!", delivery: NUCLEAR },
];
export const L4_YOU_EVE = [
  { id: "l4-you-eve-0", text: "You said come back later — this is later than the LAST later!", delivery: FURIOUS },
  { id: "l4-you-eve-1", text: "The cops can sign too! Everybody gets a pen tonight!", delivery: NUCLEAR },
  { id: "l4-you-eve-2", text: "Bon appétit! Tonight's special is a CONTRACT, medium-rare!", delivery: FURIOUS },
];

export const L4_THEM_NIGHT = [
  { id: "l4-them-night-0", text: "It's almost MIDNIGHT you absolute PSYCHOPATH!", delivery: NUCLEAR },
  { id: "l4-them-night-1", text: "You threw a ROCK through my WINDOW?!", delivery: NUCLEAR },
  { id: "l4-them-night-2", text: "MY WINDOWS! Those cost MONEY, you animal!", delivery: NUCLEAR },
];
export const L4_YOU_NIGHT = [
  { id: "l4-you-night-0", text: "You said LATER! It doesn't get later than 11:59, you spineless shit!", delivery: NUCLEAR },
  { id: "l4-you-night-1", text: "KNOCK KNOCK! Wrong window? Here's ANOTHER fuckin' one!", delivery: NUCLEAR },
  { id: "l4-you-night-2", text: "Nighty-night! Just kiddin' — SIGN something, spineless!", delivery: NUCLEAR },
];

// L4 added round — "3 AM · LAST CALL": no windows left, just a demon knocking.
export const L4_THEM_LATE = [
  { id: "l4-them-late-0", text: "It's THREE in the MORNING, you absolute DEMON!", delivery: NUCLEAR },
  { id: "l4-them-late-1", text: "The whole STREET is awake because of YOU!", delivery: NUCLEAR },
  { id: "l4-them-late-2", text: "I haven't slept! I can't feel my FACE! What do you WANT?!", delivery: NUCLEAR },
  { id: "l4-them-late-3", text: "There's no window LEFT to break, you maniac!", delivery: NUCLEAR },
];
export const L4_YOU_LATE = [
  { id: "l4-you-late-0", text: "You said LATER — well BUDDY, it does NOT get later than 3 AM!", delivery: NUCLEAR },
  { id: "l4-you-late-1", text: "The whole street can SIGN, then! Wake 'em UP!", delivery: NUCLEAR },
  { id: "l4-you-late-2", text: "I don't sleep. I FOLLOW UP. Open the DOOR!", delivery: NUCLEAR },
];

export const L4_KICK = { id: "l4-kick", text: "FOUR VISITS, buddy! FOUR! Now we do it in BLOOD!", delivery: NUCLEAR };
export const L4_FIGHT_THEM = [
  { id: "l4-fight-them-0", text: "You broke my DOOR AND my WINDOW, man!", delivery: NUCLEAR },
  { id: "l4-fight-them-1", text: "I've been up ALL DAY because of YOU!", delivery: NUCLEAR },
  { id: "l4-fight-them-2", text: "This is for my DINNER, you son of a bitch!", delivery: NUCLEAR },
];
export const L4_FIGHT_YOU = [
  { id: "l4-fight-you-0", text: "Shoulda signed this MORNING, buddy!", delivery: NUCLEAR },
  { id: "l4-fight-you-1", text: "Every punch is a callback! RELENTLESS!", delivery: NUCLEAR },
  { id: "l4-fight-you-2", text: "Shoulda signed at BREAKFAST, champ!", delivery: NUCLEAR },
];
export const L4_KO = { id: "l4-ko", text: "Okay— OKAY— gimme the damn pen, you animal!", delivery: HEATED };

/* ════════════════════════════════════════════════════════════════════════
   OFFICER STEELE — "It's a safe neighborhood."

   He is the only customer in the game you are MEANT to lose to. Everything he
   says in the draw is calm; the trump card is the only line he raises his
   voice for, and by then the fight is already scripted shut.
   ════════════════════════════════════════════════════════════════════════ */
export const ST_THEM_DRAW = [
  { id: "st-them-draw-0", text: "Let me stop you there. What's it cost?", delivery: CALM },
  { id: "st-them-draw-1", text: "Son, I know exactly what my rights are.", delivery: CALM },
  { id: "st-them-draw-2", text: "Not today, kid. Not any day.", delivery: CALM },
  { id: "st-them-draw-3", text: "Prove it. Right here on the step. Go on.", delivery: CALM },
  { id: "st-them-draw-4", text: "You've got about nine seconds left.", delivery: CALM },
];
export const ST_YOU_DRAW = [
  { id: "st-you-draw-0", text: "Fair question. Here's the number.", delivery: CALM },
  { id: "st-you-draw-1", text: "You're right, and I'm still standing here.", delivery: CALM },
  { id: "st-you-draw-2", text: "Then give me the nine seconds.", delivery: CALM },
  { id: "st-you-draw-3", text: "Don't take my word for it. Look.", delivery: CALM },
];
export const ST_TRUMP = {
  id: "st-trump",
  text: "Son. I'm a police officer. This IS a safe neighborhood.",
  delivery: HEATED,
};
export const ST_WALL = [
  { id: "st-wall-0", text: "He didn't out-argue you. He out-RANKED you.", delivery: CALM },
  { id: "st-wall-1", text: "And he's right, as far as he knows. That's the problem.", delivery: CALM },
  { id: "st-wall-2", text: "So stop arguing. Go and make it untrue.", delivery: CALM },
];
export const ST_THEM_NIGHT = [
  { id: "st-them-night-0", text: "WHO'S OUT THERE?", delivery: HEATED },
  { id: "st-them-night-1", text: "I've got a light and I WILL use it!", delivery: HEATED },
  { id: "st-them-night-2", text: "You've got the WRONG house, pal!", delivery: HEATED },
];
export const ST_FIGHT_THEM = [
  { id: "st-fight-them-0", text: "Somebody did my whole yard. My WHOLE yard.", delivery: HEATED },
  { id: "st-fight-them-1", text: "Twenty-two years on the job and this happens HERE.", delivery: HEATED },
  { id: "st-fight-them-2", text: "I filed a report on my own street. My own street.", delivery: CALM },
];
export const ST_FIGHT_YOU = [
  { id: "st-fight-you-0", text: "Rough night on a safe street, huh.", delivery: CALM },
  { id: "st-fight-you-1", text: "Funny how that works.", delivery: CALM },
  { id: "st-fight-you-2", text: "So — about that nine seconds.", delivery: CALM },
];
export const ST_KO = {
  id: "st-ko",
  text: "…Get the paperwork. Before somebody comes back for the truck.",
  delivery: HEATED,
};

// ---------- flat manifest for the bake script ----------

export const ALL_VOICE_LINES = [
  ...DOOR_TIERS.flatMap((tier) =>
    tier.lines.map((l) => ({ ...l, voice: "harry", delivery: tier.delivery }))
  ),
  { ...DOOR_OPEN, voice: "harry" },
  ...DOOR_REP_R1.map((l) => ({ ...l, voice: "liam" })),
  ...DOOR_NIGHT.map((l) => ({ ...l, voice: "harry" })),
  ...DOOR_REP_R2.map((l) => ({ ...l, voice: "liam" })),
  { ...DOOR_BURST, voice: "harry" },
  ...DOOR_FIGHT_THEM.map((l) => ({ ...l, voice: "harry" })),
  ...DOOR_FIGHT_REP.map((l) => ({ ...l, voice: "liam" })),
  { ...DOOR_KO, voice: "harry" },
  ...DOOR_WIFE.map((l) => ({ ...l, voice: "sarah" })),
  ...SLAM_CUSTOMERS.flatMap((c) =>
    c.objections.map((o) => ({ ...o, voice: c.voice, delivery: c.delivery }))
  ),
  ...SLAM_RESPONSES.map((l) => ({ ...l, voice: "callum" })),
  ...SLAM_CUSTOMERS.flatMap((c) =>
    SLAM_IMPRESSED[c.key].map((l) => ({ ...l, voice: c.voice }))
  ),
  ...SLAM_WINS.map((l) => ({ ...l, voice: "callum" })),
  { ...SLAM_SUPER, voice: "callum" },

  // ── LEVEL 2 — customer: marcus (new), rep: liam ──
  ...[...L2_THEM_R1, ...L2_THEM_R2, ...L2_THEM_CRACK, ...L2_THEM_R3, L2_OPEN].map((l) => ({ ...l, voice: "marcus" })),
  ...[...L2_YOU_R1, ...L2_YOU_R2, ...L2_YOU_CRACK, ...L2_YOU_R3, L2_SLAP].map((l) => ({ ...l, voice: "liam" })),

  // ── LEVEL 3 — customer: harry (same as L1), rep: liam ──
  ...[...L3_THEM_R1, ...L3_THEM_CAM, ...L3_THEM_R2, ...L3_THEM_R3, ...L3_FIGHT_THEM, L3_KO].map((l) => ({ ...l, voice: "harry" })),
  ...[...L3_YOU_R1, ...L3_YOU_CAM, ...L3_YOU_R2, ...L3_YOU_R3, ...L3_FIGHT_YOU, L3_CHAINSAW].map((l) => ({ ...l, voice: "liam" })),

  // ── LEVEL 4 — customer: deon (new), rep: liam ──
  ...[
    ...L4_THEM_MORN, ...L4_THEM_AFT, ...L4_THEM_EVE, ...L4_THEM_NIGHT, ...L4_THEM_LATE, ...L4_FIGHT_THEM, L4_KO,
  ].map((l) => ({ ...l, voice: "deon" })),
  ...[
    ...L4_YOU_MORN, ...L4_YOU_AFT, ...L4_YOU_EVE, ...L4_YOU_NIGHT, ...L4_YOU_LATE, ...L4_FIGHT_YOU, L4_KICK,
  ].map((l) => ({ ...l, voice: "liam" })),
];

// The two new customer voices, exposed so the audition script can grab a
// couple of lines per voice without baking the whole set.
export const L2_AUDITION = ["l2-them-r2-0", "l2-them-r3-0", "l2-them-r1-2"];
export const L4_AUDITION = ["l4-them-eve-0", "l4-them-night-0", "l4-them-aft-1"];
