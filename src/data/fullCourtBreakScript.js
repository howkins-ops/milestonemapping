// Single source of truth for the Full Court locker-room break tracks.
//
// 12 tracks = flavor (reset | hype) × the game's read (won | rough | slump) ×
// length (60 | 120). RESET is a calm female guided INTENTION/VISUALIZATION
// meditation — see the next door opening, hear the yes, see tonight's box
// score — with only a light touch of counted box breathing (Jon's law: not a
// breathing-technique reel). HYPE is the greatest basketball sales coach alive,
// three gears: praise (won), comeback (rough), RAW tough love (slump — the
// court saw you hiding). Slump reps who choose RESET get the rough reset.
//
// Script rules (research 2026-07-06): second-person "you" (distanced self-talk
// beats "I" — Kross; "You can do it" beats "I can do it" — Dolcos 2014),
// ~70% present-identity / 30% future-outcome lines, anchor phrase repeated,
// breathing counted ALOUD (not tag-timed), sparse <break/> tags only (too many
// cause ElevenLabs artifacts — ellipses give the micro-pauses), and every
// track ends UP, not asleep: the rep is about to stand and knock.
//
// Word budgets @ ~100wpm calm / ~125wpm coach: reset 60s ≈ 80w, 120s ≈ 165w;
// hype 60s ≈ 115w, 120s ≈ 225w.
//
// To (re)generate audio after editing:  node scripts/bake-fullcourt-break.js
// Auditions first:                      node scripts/bake-fullcourt-break.js --audition

export const BREAK_TRACKS = [
  /* ---------------- RESET — calm female, guided intention ---------------- */
  {
    id: "break-reset-won-60",
    flavor: "reset",
    read: "won",
    secs: 60,
    voiceText:
      'Quarter won. Feel that. <break time="1.2s" /> Let your eyes rest… drop your shoulders… ' +
      "and breathe in — two, three, four… and out — two, three, four. " +
      '<break time="1.2s" /> Now see the next door. It is already opening. ' +
      "See them smiling… hear the yes… feel the pen in your hand. " +
      '<break time="1.2s" /> You are a closer. This day is yours, and it is still growing. ' +
      "You are going to sell again — the math is on your side. " +
      '<break time="1s" /> Eyes up. Next door. Go.',
    captions: [
      { at: 0, text: "Quarter won. Feel that." },
      { at: 7, text: "Shoulders down… breathe in — 2, 3, 4… out — 2, 3, 4." },
      { at: 22, text: "See the next door. It's already opening." },
      { at: 32, text: "See them smiling. Hear the yes." },
      { at: 42, text: "You're a closer. This day is still growing." },
      { at: 52, text: "Eyes up. Next door. Go." },
    ],
  },
  {
    id: "break-reset-won-120",
    flavor: "reset",
    read: "won",
    secs: 120,
    voiceText:
      "That quarter is in the books — and you won it. Let it land. " +
      '<break time="1.5s" /> Settle into your seat… soften your jaw… ' +
      "and breathe in — two, three, four… hold — two, three, four… " +
      "and out — two, three, four… and rest. " +
      "One more, slower… in — two, three, four… and all the way out. " +
      '<break time="1.5s" /> Now come with me to tonight. The day is done. ' +
      "See your box score glowing… doors knocked, quarters won, sales on the board. " +
      "See the face of who you did this for… see them proud of you. " +
      "Feel how ordinary it felt — you just kept knocking. " +
      '<break time="1.5s" /> That future is being built right now, one door at a time. ' +
      "You are going to sell today. Say it inside… you are going to sell today. " +
      "Winners don't stop when it's working — they stay in rhythm. " +
      '<break time="1.2s" /> Take that rhythm with you. Stand tall. Next door. Go.',
    captions: [
      { at: 0, text: "Quarter won. Let it land." },
      { at: 8, text: "Breathe in — 2, 3, 4… hold… out — 2, 3, 4." },
      { at: 28, text: "One more, slower." },
      { at: 40, text: "Now come with me to tonight." },
      { at: 48, text: "See your box score glowing." },
      { at: 58, text: "See who you did this for. See them proud." },
      { at: 72, text: "It felt ordinary — you just kept knocking." },
      { at: 84, text: "You're going to sell today. Say it inside." },
      { at: 98, text: "Winners stay in rhythm." },
      { at: 110, text: "Stand tall. Next door. Go." },
    ],
  },
  {
    id: "break-reset-rough-60",
    flavor: "reset",
    read: "rough",
    secs: 60,
    voiceText:
      "That quarter is over. Set it down — it is not allowed to follow you. " +
      '<break time="1.2s" /> Breathe in — two, three, four… and let it all go — two, three, four. ' +
      '<break time="1.2s" /> Every no you took just got counted. Every knock got paid. ' +
      "The math does not forget — your yes is closer than it was an hour ago. " +
      '<break time="1.2s" /> Now see the next door, brand new. Nobody there knows the score. ' +
      "See it opening… hear the yes that is already on its way. " +
      '<break time="1s" /> Fresh quarter. Clean court. Next door. Go.',
    captions: [
      { at: 0, text: "That quarter's over. Set it down." },
      { at: 8, text: "Breathe in — 2, 3, 4… let it all go." },
      { at: 20, text: "Every no got counted. Every knock got paid." },
      { at: 30, text: "Your yes is closer than it was an hour ago." },
      { at: 40, text: "The next door is brand new. Nobody knows the score." },
      { at: 52, text: "Fresh quarter. Clean court. Go." },
    ],
  },
  {
    id: "break-reset-rough-120",
    flavor: "reset",
    read: "rough",
    secs: 120,
    voiceText:
      "Come sit for a minute. That quarter is finished — and finished means it can't touch you anymore. " +
      '<break time="1.5s" /> Unclench your hands… let your shoulders fall… ' +
      "and breathe in — two, three, four… hold — two, three, four… " +
      "and out, long and slow — two, three, four… and rest. " +
      "Again… in — two, three, four… and all the way out. Good. " +
      '<break time="1.5s" /> Here is the truth the scoreboard can\'t show: ' +
      "every single no this morning moved you closer to a yes. That is not a hope — that is arithmetic. " +
      "The doors you already knocked are money in the bank. " +
      '<break time="1.5s" /> Now picture the next door. Someone is behind it who needs exactly what you have. ' +
      "See them opening it… see yourself calm, smiling, sure… hear the yes land soft and easy. " +
      '<break time="1.5s" /> You are not behind — you are due. You are going to sell today. ' +
      "One more time… you are going to sell today. " +
      '<break time="1.2s" /> Chin up. Heart steady. Next door. Go.',
    captions: [
      { at: 0, text: "That quarter is finished — it can't touch you anymore." },
      { at: 10, text: "Breathe in — 2, 3, 4… hold… out, long and slow." },
      { at: 32, text: "Again… all the way out. Good." },
      { at: 44, text: "Every no moved you closer to a yes. That's arithmetic." },
      { at: 58, text: "The doors you knocked are money in the bank." },
      { at: 70, text: "Someone behind the next door needs what you have." },
      { at: 84, text: "See them open it. Hear the yes land soft." },
      { at: 96, text: "You're not behind — you're due." },
      { at: 106, text: "You're going to sell today." },
      { at: 114, text: "Chin up. Next door. Go." },
    ],
  },

  /* ------------- HYPE — the greatest basketball sales coach ------------- */
  {
    id: "break-hype-won-60",
    flavor: "hype",
    read: "won",
    secs: 60,
    voiceText:
      "THAT is what I'm talking about! You took that quarter and you OWNED it! " +
      '<break time="1s" /> But listen to me — listen. Good teams win a quarter. ' +
      "Great ones make the next quarter afraid of them. " +
      "The worst thing you can do right now is relax. Momentum is a full tank — don't you dare park the car. " +
      '<break time="1s" /> Your legs are fresh, your voice is warm, your numbers are climbing. ' +
      "Every door out there is a layup if you keep this pace. " +
      '<break time="1s" /> So catch your breath… bottle that feeling… ' +
      "and when that buzzer sounds, you hit the first door like the game just started. Let's GO!",
    captions: [
      { at: 0, text: "THAT'S what I'm talking about! You OWNED that quarter!" },
      { at: 9, text: "Good teams win a quarter. Great ones make the next one afraid." },
      { at: 20, text: "Momentum is a full tank — don't you dare park the car." },
      { at: 32, text: "Legs fresh. Voice warm. Numbers climbing." },
      { at: 42, text: "Every door is a layup at this pace." },
      { at: 52, text: "Buzzer sounds — hit the first door like it's tip-off. LET'S GO!" },
    ],
  },
  {
    id: "break-hype-won-120",
    flavor: "hype",
    read: "won",
    secs: 120,
    voiceText:
      "Get in here! Look at me — LOOK at me. Do you understand what you just did out there? " +
      "You didn't get lucky. You out-WORKED that quarter. Every knock, every pitch, every no you ate — that was you playing champion basketball on a sales court. " +
      '<break time="1.2s" /> Now here\'s where most reps lose the game. Right here. In the locker room. ' +
      "They win a quarter and they start celebrating like the game is over. The game is NOT over. " +
      "Championships aren't won by the team that scores first — they're won by the team that keeps scoring. " +
      '<break time="1.2s" /> You have something right now money can\'t buy: rhythm. ' +
      "Your voice is loose. Your smile is real. The doors can FEEL it. " +
      "That next neighborhood doesn't know what's about to hit it. " +
      '<break time="1.2s" /> So here\'s the plan: you walk out there, you go straight to the first door — no warm-up, no scrolling, no coffee lap — ' +
      "and you knock it inside sixty seconds. You set the tone before doubt even gets its shoes on. " +
      '<break time="1.2s" /> You\'re not protecting a lead. You\'re building a legend, one quarter at a time. ' +
      "Now get up. Get OUT there. And don't you DARE take your foot off the gas!",
    captions: [
      { at: 0, text: "Look at me. You didn't get lucky — you out-WORKED that quarter." },
      { at: 14, text: "That was champion basketball on a sales court." },
      { at: 24, text: "Here's where most reps lose it: they celebrate like it's over." },
      { at: 38, text: "Championships go to the team that KEEPS scoring." },
      { at: 50, text: "You've got rhythm — money can't buy that." },
      { at: 62, text: "The next neighborhood doesn't know what's coming." },
      { at: 74, text: "Straight to the first door. Knock it inside 60 seconds." },
      { at: 90, text: "Set the tone before doubt gets its shoes on." },
      { at: 102, text: "You're building a legend, one quarter at a time." },
      { at: 112, text: "Get up. Get out there. FOOT ON THE GAS!" },
    ],
  },
  {
    id: "break-hype-rough-60",
    flavor: "hype",
    read: "rough",
    secs: 60,
    voiceText:
      "Hey. Eyes on me. That quarter? It's gone. The scoreboard can't play defense on what happens next. " +
      '<break time="1s" /> You know how many championship games were ugly at the half? Most of them. ' +
      "Every no you took out there was a rep paying you forward — the math is LOADED in your favor now. " +
      '<break time="1s" /> The next quarter starts zero to zero. Same doors. Same you. ' +
      "But this time the odds are heavier on your side, because you already did the losing. " +
      '<break time="1s" /> So shake it off. Roll your shoulders. ' +
      "First door of the quarter — you take it like a fast break. GO get your yes!",
    captions: [
      { at: 0, text: "Eyes on me. That quarter's GONE." },
      { at: 8, text: "Most championship games were ugly at the half." },
      { at: 18, text: "Every no was a rep paying you forward." },
      { at: 28, text: "The math is LOADED in your favor now." },
      { at: 38, text: "Next quarter starts 0–0. You already did the losing." },
      { at: 50, text: "First door — fast break. GO get your yes!" },
    ],
  },
  {
    id: "break-hype-rough-120",
    flavor: "hype",
    read: "rough",
    secs: 120,
    voiceText:
      "Sit down for a second. Breathe. Now look at me. " +
      "That quarter was a fight, and the doors won a few rounds. So what. " +
      "You think I've never seen a great closer go cold for two hours? Every legend has a highlight reel — nobody shows you their second quarter. " +
      '<break time="1.2s" /> Here\'s what the scoreboard doesn\'t know: this game is not basketball luck — it\'s LAW. ' +
      "The Law of Probability. Every door you knocked this morning bought down the price of your next yes. " +
      "You didn't lose those doors. You BANKED them. " +
      '<break time="1.2s" /> Now the second half is where pros separate from tourists. ' +
      "Tourists sulk. Pros understand the yes is sitting out there right now, a few doors deep, waiting to see if you show up for it. " +
      '<break time="1.2s" /> So here\'s what we\'re doing. You\'re going to walk out there with your head UP — ' +
      "not because you feel like it, but because that's what closers do. " +
      "You're going to hit the first door fast, before your brain can vote. " +
      "And when that yes lands — and it WILL land — you're going to know you earned it in the ugly quarter. " +
      '<break time="1.2s" /> The comeback starts at the next knock. On your feet. Let\'s go WIN this half!',
    captions: [
      { at: 0, text: "That quarter was a fight. So what." },
      { at: 12, text: "Every legend has an ugly second quarter — nobody shows you that reel." },
      { at: 26, text: "This game isn't luck. It's LAW — the Law of Probability." },
      { at: 40, text: "Every knock bought down the price of your next yes." },
      { at: 52, text: "You didn't lose those doors. You BANKED them." },
      { at: 62, text: "Second half: pros separate from tourists." },
      { at: 74, text: "The yes is out there, a few doors deep, waiting to see if you show up." },
      { at: 90, text: "Head UP — that's what closers do." },
      { at: 100, text: "Hit the first door before your brain can vote." },
      { at: 112, text: "The comeback starts at the next knock. Let's WIN this half!" },
    ],
  },
  {
    id: "break-hype-slump-60",
    flavor: "hype",
    read: "slump",
    secs: 60,
    voiceText:
      "Hey. HEY. Don't look at the floor — look at ME. " +
      "We both know what that quarter was. That wasn't cold doors. That was you hiding. The court sees everything. " +
      '<break time="1s" /> And I\'m not here to rub your back about it. Your DREAMS are on the line out there. ' +
      "The life you keep talking about? It's sitting behind doors you didn't knock. " +
      '<break time="1s" /> You are better than the quarter you just gave me. Stop being soft with your own future. ' +
      "You came out here to WORK. " +
      '<break time="1s" /> So get up. Right now. First door in sixty seconds — ' +
      "and you knock it like your dreams are watching. Because they are. GO!",
    captions: [
      { at: 0, text: "Don't look at the floor. Look at ME." },
      { at: 7, text: "That wasn't cold doors. That was hiding. The court sees everything." },
      { at: 18, text: "Your DREAMS are on the line out there." },
      { at: 27, text: "The life you talk about is behind doors you didn't knock." },
      { at: 38, text: "You came out here to WORK." },
      { at: 48, text: "Get up. First door in 60 seconds. Your dreams are watching. GO!" },
    ],
  },
  {
    id: "break-hype-slump-120",
    flavor: "hype",
    read: "slump",
    secs: 120,
    voiceText:
      "Close the door. Sit down. We need to have a real one. " +
      "I watched that whole quarter. Two hours on the court… and the scoreboard barely moved. " +
      "That wasn't a slump. A slump is when you swing and miss. You didn't swing. You hid. " +
      '<break time="1.2s" /> And listen — I get it. The nos sting. The phone is easier. The truck is warm. ' +
      "But nobody ever drove a warm truck to the life they actually wanted. " +
      '<break time="1.2s" /> You told me about your dreams. I remember them even when you don\'t. ' +
      "That family. That freedom. That version of you that walks into a room different. " +
      "Every door you skip, you're telling that version of you to keep waiting. " +
      '<break time="1.2s" /> So here it is, no sugar: stop being soft with your own future. ' +
      "You are NOT tired — you're uncomfortable. And uncomfortable is where the money lives. " +
      "You came out here to work, and deep down you KNOW you've got a monster half in you. " +
      '<break time="1.2s" /> So this is what happens next. You stand up. You leave the phone in your pocket. ' +
      "You walk to the first door like it owes you money — because it does. " +
      "And you don't stop knocking until the court respects you again. " +
      '<break time="1s" /> Your dreams are on the line, and the clock is running. GET UP. GO!',
    captions: [
      { at: 0, text: "Close the door. We need to have a real one." },
      { at: 10, text: "Two hours on the court… the scoreboard barely moved." },
      { at: 20, text: "A slump is when you swing and miss. You didn't swing." },
      { at: 30, text: "Nobody drove a warm truck to the life they wanted." },
      { at: 42, text: "I remember your dreams even when you don't." },
      { at: 54, text: "Every door you skip, that future keeps waiting." },
      { at: 66, text: "Stop being soft with your own future." },
      { at: 76, text: "You're not tired — you're uncomfortable. That's where the money lives." },
      { at: 90, text: "You've got a monster half in you. You KNOW it." },
      { at: 100, text: "Walk to the first door like it owes you money — it does." },
      { at: 112, text: "Dreams on the line. Clock's running. GET UP. GO!" },
    ],
  },
];

/* ------------------------------------------------------------------ */

const byId = new Map(BREAK_TRACKS.map((t) => [t.id, t]));

/**
 * Pick the right track for a break. RESET has no slump variant by design —
 * a rep who got called out but chooses calm gets the rough reset (release +
 * rebuild), never a scolding meditation. 'hot'/'won' both map to won.
 */
export function pickBreakTrack(flavor, read, secs) {
  const f = flavor === "hype" ? "hype" : "reset";
  let r = read === "slump" ? "slump" : read === "rough" ? "rough" : "won";
  if (f === "reset" && r === "slump") r = "rough";
  const s = Number(secs) >= 120 ? 120 : 60;
  return byId.get(`break-${f}-${r}-${s}`) || null;
}

/** Path to the pre-baked ElevenLabs mp3 for a track. */
export const breakTrackAudio = (id) => `/audio/fullcourt/${id}.mp3`;

/** Optional pre-generated music beds (Eleven Music); WebAudio loops are the fallback. */
export const BREAK_BEDS = {
  reset: "/audio/fullcourt/bed-calm.mp3",
  hype: "/audio/fullcourt/bed-hype.mp3",
};

/** The track text with SSML break tags stripped — for the speech-synth fallback. */
export function breakTrackSpokenText(track) {
  return (track?.voiceText || "").replace(/<break[^>]*\/>/g, " ").replace(/\s+/g, " ").trim();
}
