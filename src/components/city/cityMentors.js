// ════════════════════════════════════════════════════════════════════════
// MAPQUEST CITY — Mentors
// Every district has a resident NPC mentor who teaches that path's lesson,
// then sends the player into the REAL feature. "The lesson ends where the
// work begins." Pure data + deterministic helpers — no React, no random.
//
// Lesson content is TRANSMUTED from the coaching source material into the
// app's own cinematic voice (see coaching/06_IP_AND_SOURCING.md) — never
// transcribed.
// ════════════════════════════════════════════════════════════════════════

// Deterministic string hash (same family as witnessLines.pickLine) — no RNG.
function hashStr(s) {
  let h = 0;
  const str = String(s || "");
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function dayKey(date) {
  const d = date instanceof Date && !isNaN(date) ? date : new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function dayOfYear(date) {
  const d = date instanceof Date && !isNaN(date) ? date : new Date();
  return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
}

// ── The cast ──────────────────────────────────────────────────────────────

export const MENTORS = {
  "alchemist-spire": {
    id: "alchemist-spire",
    name: "The Alchemist",
    epithet: "Your future self, waiting at the top of the spire",
    color: "#7B2CFF",
    spriteVariant: "alchemist",
    greetings: [
      "You made it back. The spire remembers every step you take.",
      "I'm not ahead of you. I'm what's left when the old story burns off.",
      "Twenty chambers. One of them has your name on it today.",
      "Lead into gold is easy. You into you — that's the real work.",
    ],
    lesson: {
      title: "The Transmutation",
      beats: [
        {
          speaker: "The Alchemist",
          lines: [
            "Everyone wants the finished gold.",
            "Nobody wants the furnace. But the furnace is the whole art.",
          ],
        },
        {
          speaker: "The Alchemist",
          lines: [
            "You don't become someone new by deciding it once.",
            "You become new in stages — chamber by chamber, chapter by chapter.",
          ],
        },
        { speaker: "YOU", lines: ["So what am I supposed to burn?"] },
        {
          speaker: "The Alchemist",
          lines: [
            "The story that got you this far. It kept you safe.",
            "It cannot take you higher.",
            "Bring it to the spire. I'll show you what it turns into.",
          ],
        },
      ],
      exercise: {
        prompt: "Open the quest and play the next chapter waiting for you.",
        ctaLabel: "ENTER THE SPIRE",
      },
      xp: 10,
    },
  },

  "identity-forge": {
    id: "identity-forge",
    name: "Declan the Herald",
    epithet: "Keeper of names and spoken stands",
    color: "#FF3EDB",
    spriteVariant: "mentor",
    greetings: [
      "Names are tools. Most people never pick theirs up.",
      "Say it out loud or it doesn't count. House rule.",
      "The forge only answers to spoken words.",
      "Who you were is on file. Who you're becoming needs a signature.",
    ],
    lesson: {
      title: "The Spoken Stand",
      beats: [
        {
          speaker: "Declan the Herald",
          lines: [
            "There's a difference between a wish and a declaration.",
            "A wish waits for evidence. A declaration creates it.",
          ],
        },
        {
          speaker: "Declan the Herald",
          lines: [
            "Whispering 'I'm confident' over a scared mind is paint on rust.",
            "That's not what we do here.",
          ],
        },
        {
          speaker: "Declan the Herald",
          lines: [
            "A stand is spoken, dated, and backed by a move you'll actually make.",
            "That's what bends the world.",
          ],
        },
        { speaker: "YOU", lines: ["And if I don't believe it yet?"] },
        {
          speaker: "Declan the Herald",
          lines: [
            "You don't declare it because it's true.",
            "It becomes true because you declared it — and then acted like the one who said it.",
          ],
        },
      ],
      exercise: {
        prompt: "Forge one 'I am' stand and speak it out loud — then take it into your day.",
        ctaLabel: "SPEAK THE STAND",
      },
      xp: 10,
    },
  },

  "vision-tower": {
    id: "vision-tower",
    name: "The Cartographer",
    epithet: "Draws maps of places that don't exist yet",
    color: "#00F0FF",
    spriteVariant: "mentor",
    greetings: [
      "Most maps show where you've been. Mine show where you're going.",
      "The view from the top changes what the streets mean.",
      "Come up. The future's visible from here on a clear day.",
      "Every district below started as a line on one of my drafts.",
    ],
    lesson: {
      title: "Map It Backward",
      beats: [
        {
          speaker: "The Cartographer",
          lines: [
            "Amateurs plan forward from today.",
            "That's how you get a longer to-do list, not a future.",
          ],
        },
        {
          speaker: "The Cartographer",
          lines: [
            "Stand in the day it's already done. Look around.",
            "What do you see? Who did you have to become to be standing there?",
          ],
        },
        { speaker: "YOU", lines: ["Then what?"] },
        {
          speaker: "The Cartographer",
          lines: [
            "Walk backward. Done, almost done, halfway, first milestone.",
            "Then plan only to that first milestone.",
            "The rest of the map draws itself as you move.",
          ],
        },
      ],
      exercise: {
        prompt: "Write one paragraph from the day your goal is complete — present tense, like it already happened.",
        ctaLabel: "CLIMB THE TOWER",
      },
      xp: 10,
    },
  },

  academy: {
    id: "academy",
    name: "Docent Vale",
    epithet: "Teaches the shifts that change what you can see",
    color: "#00FFBF",
    spriteVariant: "mentor",
    greetings: [
      "Every student wants tactics. I teach eyes first.",
      "The lecture halls are quiet. The lessons aren't.",
      "What you can't see runs you. Class fixes that.",
      "No exams here. Life grades you daily anyway.",
    ],
    lesson: {
      title: "New Eyes First",
      beats: [
        {
          speaker: "Docent Vale",
          lines: [
            "You don't get new results with old eyes.",
            "You just get faster at the wrong game.",
          ],
        },
        {
          speaker: "Docent Vale",
          lines: [
            "There are five shifts — five places where how you see the game",
            "quietly decides how you play it.",
          ],
        },
        {
          speaker: "Docent Vale",
          lines: [
            "Each one feels obvious afterward.",
            "That's the tell of a real shift: you can't unsee it.",
          ],
        },
        { speaker: "YOU", lines: ["Where do I start?"] },
        {
          speaker: "Docent Vale",
          lines: [
            "At the first one you haven't taken yet.",
            "The Academy keeps your place.",
          ],
        },
      ],
      exercise: {
        prompt: "Enter the Academy and take the next shift in the sequence.",
        ctaLabel: "ENTER THE ACADEMY",
      },
      xp: 10,
    },
  },

  "war-rooms": {
    id: "war-rooms",
    name: "Commander Sable",
    epithet: "Turns dreams into ladders — vision, mission, strategy, tactics",
    color: "#FF3B5C",
    spriteVariant: "mentor",
    greetings: [
      "A goal without a ladder is a balcony you can't reach.",
      "In here, ambition gets a chain of command.",
      "Show me your vision and I'll show you Tuesday.",
      "Maps on the table. Excuses at the door.",
    ],
    lesson: {
      title: "The Chain of Command",
      beats: [
        {
          speaker: "Commander Sable",
          lines: [
            "Vision is the why. No deadline, no shrinking it.",
            "Mission is the what — and for whom.",
          ],
        },
        {
          speaker: "Commander Sable",
          lines: [
            "Strategy is the finite plan with numbers on it.",
            "Tactics are the moves you make this week.",
          ],
        },
        {
          speaker: "Commander Sable",
          lines: [
            "Most people have a vision and a to-do list, and nothing in between.",
            "That gap is where dreams go to rot.",
          ],
        },
        { speaker: "YOU", lines: ["So I build the middle."] },
        {
          speaker: "Commander Sable",
          lines: [
            "You build the middle. One milestone at a time,",
            "each one reporting to the one above it.",
          ],
        },
      ],
      exercise: {
        prompt: "Open your war room and set — or sharpen — your next milestone.",
        ctaLabel: "ENTER THE WAR ROOMS",
      },
      xp: 10,
    },
  },

  "daily-nexus": {
    id: "daily-nexus",
    name: "Keeper Juno",
    epithet: "Guards the only day you actually own",
    color: "#FFB000",
    spriteVariant: "mentor",
    greetings: [
      "Today is the only day that's real. The rest is rumor.",
      "Every action's a ballot. Who are you voting for?",
      "Small and done beats big and someday. Every time.",
      "The Nexus resets at midnight. So do you.",
    ],
    lesson: {
      title: "Votes for the Future You",
      beats: [
        {
          speaker: "Keeper Juno",
          lines: [
            "Every action you take today is a vote for one of two people:",
            "who you've been, or who you're becoming.",
          ],
        },
        {
          speaker: "Keeper Juno",
          lines: [
            "You don't need a perfect day. You need a counted one —",
            "five priorities, ranked, number one hammered first.",
          ],
        },
        {
          speaker: "Keeper Juno",
          lines: [
            "Blocked on one? Drop to two.",
            "Stalled entirely? Finish one small errand —",
            "completion changes your energy faster than motivation ever will.",
          ],
        },
        { speaker: "YOU", lines: ["That's it?"] },
        {
          speaker: "Keeper Juno",
          lines: [
            "That's it, done daily, forever.",
            "The whole trick nobody wants to hear.",
          ],
        },
      ],
      exercise: {
        prompt: "Open today's ritual and cast your five votes.",
        ctaLabel: "ENTER THE NEXUS",
      },
      xp: 10,
    },
  },

  "war-council": {
    id: "war-council",
    name: "Marshal Ilex",
    epithet: "Where the week is judged by what you'll do next",
    color: "#D11EFF",
    spriteVariant: "mentor",
    greetings: [
      "The week already happened. The question is what it taught you.",
      "Bring your wins and your wreckage. Both are intel.",
      "We don't do regret in here. We do orders.",
      "Council's open. Come honest or come back later.",
    ],
    lesson: {
      title: "Insight Decays",
      beats: [
        {
          speaker: "Marshal Ilex",
          lines: [
            "An insight has a shelf life of about three days.",
            "After that it turns back into a nice idea.",
          ],
        },
        {
          speaker: "Marshal Ilex",
          lines: [
            "That's why we hold council.",
            "Not to grade the week — to convert it.",
          ],
        },
        {
          speaker: "Marshal Ilex",
          lines: [
            "Every review ends the same way: what did you see,",
            "and what will you DO because you saw it.",
            "Insight plus action. Nothing else compounds.",
          ],
        },
        { speaker: "YOU", lines: ["And if the week was ugly?"] },
        {
          speaker: "Marshal Ilex",
          lines: [
            "Ugly weeks carry the best intel.",
            "Bring it in before it spoils.",
          ],
        },
      ],
      exercise: {
        prompt: "Run your weekly review and leave with one order you'll execute.",
        ctaLabel: "CONVENE THE COUNCIL",
      },
      xp: 10,
    },
  },

  vault: {
    id: "vault",
    name: "Auric the Vaultkeeper",
    epithet: "Counts the wins you keep forgetting to collect",
    color: "#FACC15",
    spriteVariant: "mentor",
    greetings: [
      "Everything you finish earns interest in here.",
      "Most people rob their own vault — they finish things and never collect.",
      "Receipts. I keep the receipts.",
      "The door's heavy, but it opens for anyone holding a finished thing.",
    ],
    lesson: {
      title: "Collect What You Earned",
      beats: [
        {
          speaker: "Auric the Vaultkeeper",
          lines: [
            "You finish something hard, and within the hour you're staring at the next thing.",
            "That's not discipline. That's theft.",
          ],
        },
        {
          speaker: "Auric the Vaultkeeper",
          lines: [
            "A finished thing you never honor keeps a hook in you.",
            "Complete means it carries no more charge than an old receipt —",
            "filed, done, yours.",
          ],
        },
        {
          speaker: "Auric the Vaultkeeper",
          lines: [
            "So name the reward before the work: what you get, when, and how.",
            "Then when you cross the line, you actually collect.",
          ],
        },
        { speaker: "YOU", lines: ["Rewards feel… indulgent."] },
        {
          speaker: "Auric the Vaultkeeper",
          lines: ["Unpaid workers quit.", "You're the worker. Pay yourself."],
        },
      ],
      exercise: {
        prompt: "Open the vault and attach a real reward to your next milestone.",
        ctaLabel: "OPEN THE VAULT",
      },
      xp: 10,
    },
  },

  "shadow-sanctum": {
    id: "shadow-sanctum",
    name: "Brother Ashe",
    epithet: "Tends the dark that kept you alive",
    color: "#7B2CFF",
    spriteVariant: "mentor",
    greetings: [
      "Nothing down here bites. It just wants to be seen.",
      "You brought your shadow. Good — it goes everywhere you go anyway.",
      "The dark isn't the enemy. Ignorance of it is.",
      "Speak softly. Old guardians sleep in these walls.",
    ],
    lesson: {
      title: "The Old Bodyguard",
      beats: [
        {
          speaker: "Brother Ashe",
          lines: [
            "That pattern you hate — the flinch, the hiding, the armor.",
            "It isn't a defect. It's a bodyguard you hired when you were small.",
          ],
        },
        {
          speaker: "Brother Ashe",
          lines: [
            "It did its job. You survived.",
            "But a bodyguard doesn't know the war is over —",
            "it still bills you daily, in chances not taken.",
          ],
        },
        {
          speaker: "Brother Ashe",
          lines: [
            "You don't fight it. You meet it. You name it.",
            "And then you choose — from essence, not from fear — who acts next.",
          ],
        },
        { speaker: "YOU", lines: ["And if it doesn't let go?"] },
        {
          speaker: "Brother Ashe",
          lines: [
            "It doesn't have to let go.",
            "You just stop handing it the keys.",
          ],
        },
      ],
      exercise: {
        prompt: "Descend into the sanctum and sit with one shadow exercise.",
        ctaLabel: "ENTER THE SANCTUM",
      },
      xp: 10,
    },
  },

  "pressure-forge": {
    id: "pressure-forge",
    name: "Vessa the Forgemother",
    epithet: "Turns heat into shape and rage into steel",
    color: "#FF3B5C",
    spriteVariant: "mentor",
    greetings: [
      "Bring what angers you. It's ore.",
      "The forge doesn't care why you're burning. Only what you make.",
      "Swallowed fire rusts you from the inside. Give it here.",
      "Hear that ring? That's someone turning a bad day into a blade.",
    ],
    lesson: {
      title: "Fire Wants a Shape",
      beats: [
        {
          speaker: "Vessa the Forgemother",
          lines: [
            "They told you anger was the problem.",
            "They were half right — unaimed anger is.",
          ],
        },
        {
          speaker: "Vessa the Forgemother",
          lines: [
            "But that heat in your chest? That's raw power reading as pain.",
            "Same fire. No forge.",
          ],
        },
        {
          speaker: "Vessa the Forgemother",
          lines: [
            "Swallow it, it rusts you. Spray it, it burns your people.",
            "Aim it — and it becomes the strongest metal you own.",
          ],
        },
        { speaker: "YOU", lines: ["Aim it at what?"] },
        {
          speaker: "Vessa the Forgemother",
          lines: [
            "At the work the anger is pointing to. Fire always points.",
            "Come — the anvils are hot.",
          ],
        },
      ],
      exercise: {
        prompt: "Step into the gym and put today's fire through one round.",
        ctaLabel: "ENTER THE GYM",
      },
      xp: 10,
    },
  },

  "cup-springs": {
    id: "cup-springs",
    name: "Imara of the Springs",
    epithet: "Refills what leaders keep pouring out",
    color: "#00FFBF",
    spriteVariant: "mentor",
    greetings: [
      "Sit. The water doesn't rush, and neither do we.",
      "Empty cups make bitter leaders. Drink first.",
      "Rest isn't what you earn after the work. It's what funds it.",
      "The springs never ask what you produced today. Notice how that feels.",
    ],
    lesson: {
      title: "The Cup Ledger",
      beats: [
        {
          speaker: "Imara of the Springs",
          lines: [
            "You've been treating your energy like it's infinite",
            "and your time like it's the problem. It's the other way around.",
          ],
        },
        {
          speaker: "Imara of the Springs",
          lines: [
            "An empty cup doesn't just slow you down.",
            "It changes who shows up — snappier, smaller, meaner.",
            "Your people drink from your cup whether you like it or not.",
          ],
        },
        {
          speaker: "Imara of the Springs",
          lines: [
            "So audit like a leader: sleep, body, quiet, play.",
            "Not as treats. As infrastructure.",
          ],
        },
        { speaker: "YOU", lines: ["It feels like slacking."] },
        {
          speaker: "Imara of the Springs",
          lines: [
            "Ask the future you who runs the whole thing.",
            "They'll tell you: care of the leader IS the work.",
          ],
        },
      ],
      exercise: {
        prompt: "Go fill one cup today — and log it where it counts.",
        ctaLabel: "VISIT THE SPRINGS",
      },
      xp: 10,
    },
  },

  "blaze-lab": {
    id: "blaze-lab",
    name: "Dr. Fenn",
    epithet: "Runs experiments on what makes you burn brighter",
    color: "#FFB000",
    spriteVariant: "mentor",
    greetings: [
      "Careful with the equipment. Most of it is you.",
      "Energy isn't a mood. It's an engineering problem.",
      "Today we find out what makes you combust — in the good way.",
      "Every breakthrough in this lab started as a bad Tuesday.",
    ],
    lesson: {
      title: "Three Dials",
      beats: [
        {
          speaker: "Dr. Fenn",
          lines: [
            "Your energy has three dials.",
            "Most people never touch them on purpose.",
          ],
        },
        {
          speaker: "Dr. Fenn",
          lines: [
            "Dial one: chargers — rest, movement, play, finished things.",
            "Turn them up and everything runs hotter.",
          ],
        },
        {
          speaker: "Dr. Fenn",
          lines: [
            "Dial two: drains — the habits and tolerations leaking your charge.",
            "Find one. Cut one.",
          ],
        },
        { speaker: "YOU", lines: ["And when I need more than maintenance?"] },
        {
          speaker: "Dr. Fenn",
          lines: [
            "Then you ignite on purpose: declare something scary,",
            "and act while afraid.",
            "Fear plus motion is a breakthrough with a fuse. Lab's open.",
          ],
        },
      ],
      exercise: {
        prompt: "Pick one charger to schedule and one drain to cut — this week.",
        ctaLabel: "ENTER THE LAB",
      },
      xp: 10,
    },
  },

  "guild-quarter": {
    id: "guild-quarter",
    name: "Guildmaster Bram",
    epithet: "Believes no one gets strong in secret",
    color: "#00F0FF",
    spriteVariant: "mentor",
    greetings: [
      "A promise made alone is a rumor. Made here, it's a contract.",
      "The guild has one rule: be seen doing it.",
      "Solo runs end where the guild begins.",
      "Someone in there is one witness away from keeping their word.",
    ],
    lesson: {
      title: "Witnessed Work",
      beats: [
        {
          speaker: "Guildmaster Bram",
          lines: [
            "A commitment nobody hears is negotiable.",
            "You'll renegotiate it by Thursday. You always do.",
          ],
        },
        {
          speaker: "Guildmaster Bram",
          lines: [
            "Spoken to another soul, it changes weight.",
            "Being witnessed isn't pressure — it's the honest kind of gravity.",
          ],
        },
        {
          speaker: "Guildmaster Bram",
          lines: [
            "And when it's your turn to witness: get them fully — just listen.",
            "Coach only if they invite you. Otherwise, leave them be.",
            "That's love. The itch to fix them is fear.",
          ],
        },
        { speaker: "YOU", lines: ["That's harder than it sounds."] },
        {
          speaker: "Guildmaster Bram",
          lines: ["Everything in the guild is.", "That's why it works."],
        },
      ],
      exercise: {
        prompt: "Declare today's mission where your people can see it.",
        ctaLabel: "ENTER THE ZONE",
      },
      xp: 10,
    },
  },

  "hall-of-champions": {
    id: "hall-of-champions",
    name: "Odessa the Crowned",
    epithet: "Keeps score in celebrations, never in shame",
    color: "#FACC15",
    spriteVariant: "mentor",
    greetings: [
      "In this hall, we count what you did. The rest never happened.",
      "Every banner up there started as one kept promise.",
      "You bow to no one here. You just keep showing up.",
      "The torches stay lit for comebacks. Especially comebacks.",
    ],
    lesson: {
      title: "Shame Doesn't Build",
      beats: [
        {
          speaker: "Odessa the Crowned",
          lines: [
            "Shame feels productive. It isn't.",
            "Nobody ever shamed themselves into a bigger life —",
            "they just got quieter.",
          ],
        },
        {
          speaker: "Odessa the Crowned",
          lines: [
            "Celebration is the real engine.",
            "What gets honored gets repeated.",
            "What gets repeated becomes reputation.",
          ],
        },
        {
          speaker: "Odessa the Crowned",
          lines: [
            "So the hall keeps one kind of score: streaks, receipts, comebacks.",
            "Misses aren't recorded. Rises are.",
          ],
        },
        { speaker: "YOU", lines: ["Even the small stuff?"] },
        {
          speaker: "Odessa the Crowned",
          lines: [
            "Especially the small stuff.",
            "Empires are made of small stuff done again.",
          ],
        },
      ],
      exercise: {
        prompt: "Find one recent win and honor it properly — out loud.",
        ctaLabel: "ENTER THE HALL",
      },
      xp: 10,
    },
  },

  "formula-athenaeum": {
    id: "formula-athenaeum",
    name: "Archivist Wren",
    epithet: "Keeps the one formula everything here runs on",
    color: "#D11EFF",
    spriteVariant: "mentor",
    greetings: [
      "Shelves of books, one sentence. Everything else is commentary.",
      "You don't need more information. You need the sequence.",
      "Quiet, please. The formula is listening.",
      "Every visitor wants the secret shelf. You're standing in it.",
    ],
    lesson: {
      title: "One Sentence",
      beats: [
        {
          speaker: "Archivist Wren",
          lines: [
            "People come here expecting a library of secrets.",
            "There's one formula. The rest of the shelves explain it.",
          ],
        },
        {
          speaker: "Archivist Wren",
          lines: [
            "See it clearly. Break it into milestones. Vote for it daily.",
            "Review it weekly. Complete it, celebrate it. Repeat.",
          ],
        },
        {
          speaker: "Archivist Wren",
          lines: [
            "None of the steps are impressive. That's the point —",
            "mastery isn't a rare move. It's an ordinary loop run without applause.",
          ],
        },
        { speaker: "YOU", lines: ["Where do people break it?"] },
        {
          speaker: "Archivist Wren",
          lines: [
            "The loop. They run the steps once and call it failure.",
            "The formula only compounds in circles.",
          ],
        },
      ],
      exercise: {
        prompt: "Trace your own loop — and find the step you've been skipping.",
        ctaLabel: "ENTER THE ATHENAEUM",
      },
      xp: 10,
    },
  },

  observatory: {
    id: "observatory",
    name: "Orrin the Stargazer",
    epithet: "Watches problems until they turn into doors",
    color: "#00F0FF",
    spriteVariant: "mentor",
    greetings: [
      "Come look. It's all cleaner from up here.",
      "The stars don't have problems. Notice that.",
      "Every 'disaster' looks different at this magnification.",
      "I chart openings, not omens. Big difference.",
    ],
    lesson: {
      title: "No Problems in Nature",
      beats: [
        {
          speaker: "Orrin the Stargazer",
          lines: [
            "Out there — collisions, supernovas, whole worlds ending.",
            "And not one problem among them. Just what is.",
          ],
        },
        {
          speaker: "Orrin the Stargazer",
          lines: [
            "A problem is two things fused: what happened,",
            "and the story you welded to it.",
            "The event is fixed. The weld is yours.",
          ],
        },
        {
          speaker: "Orrin the Stargazer",
          lines: [
            "So we run the lens. What's actually so, minus the story?",
            "What opens up if this were handled for good?",
            "What does it look like from the life where it already is?",
          ],
        },
        { speaker: "YOU", lines: ["And every problem opens like that?"] },
        {
          speaker: "Orrin the Stargazer",
          lines: [
            "Every one I've ever put under the glass.",
            "Some just need a longer exposure.",
          ],
        },
      ],
      exercise: {
        prompt: "Take one current problem and mine it for the opening it's hiding.",
        ctaLabel: "ENTER THE OBSERVATORY",
      },
      xp: 10,
    },
  },
};

// ── The Guide (plaza NPC) ─────────────────────────────────────────────────

export const THE_GUIDE = {
  name: "The Guide",
  color: "#00F0FF",
  greetings: [
    "Welcome back to the plaza, traveler.",
    "Sixteen districts, one city, all of it yours.",
    "The city rearranges itself around whoever walks it. Where to?",
    "Ask me where the day wants you. I always have an answer.",
  ],
};

// One daily-lesson line per district — the Guide points, the district teaches.
const GUIDE_LINES = {
  "alchemist-spire": "The spire's lit tonight. Your next chapter is already warm.",
  "identity-forge": "The Herald's calling for names today. Go speak one that fits the future you.",
  "vision-tower": "Clear skies over the tower. Perfect day to look at where you're headed.",
  academy: "The Academy bell's ringing. There's a shift waiting with your name on it.",
  "war-rooms": "The war rooms are humming. Your next milestone wants orders.",
  "daily-nexus": "The Nexus counts votes at sundown. Go cast yours while the day's still yours.",
  "war-council": "The Council convenes for anyone honest about their week. That's you, today.",
  vault: "Auric says you've left winnings uncollected. The vault door's open.",
  "shadow-sanctum": "The sanctum's quiet today. A good day to meet what follows you around.",
  "pressure-forge": "The Forge runs hot today. Bring what angers you.",
  "cup-springs": "Your cup's been ringing hollow. The springs can hear it from here.",
  "blaze-lab": "Dr. Fenn's running energy trials today. Volunteer yourself.",
  "guild-quarter": "The guild board has room for one more declared mission. Make it yours.",
  "hall-of-champions": "The hall's hanging new banners today. One of your wins belongs up there.",
  "formula-athenaeum": "Wren left the formula open on the lectern. Go read the step you keep skipping.",
  observatory: "Good visibility at the observatory tonight. Bring your biggest problem — it shrinks under the lens.",
};

const GUIDE_FALLBACK_LINE =
  "The city has something for you today. Walk until you feel it.";

// Date-deterministic daily suggestion — same answer all day, no RNG.
export function getDailyGuideLesson(date = new Date(), districtIds) {
  const pool =
    Array.isArray(districtIds) && districtIds.length
      ? districtIds
      : Object.keys(GUIDE_LINES);
  if (!pool.length) return { districtId: null, line: GUIDE_FALLBACK_LINE };
  const districtId = pool[hashStr(dayKey(date)) % pool.length];
  return { districtId, line: GUIDE_LINES[districtId] || GUIDE_FALLBACK_LINE };
}

// Deterministic ambient-greeting rotation by day of year.
export function getGreeting(mentor, date = new Date()) {
  if (!mentor || !Array.isArray(mentor.greetings) || !mentor.greetings.length)
    return "";
  return mentor.greetings[dayOfYear(date) % mentor.greetings.length];
}
