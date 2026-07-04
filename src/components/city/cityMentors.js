// ════════════════════════════════════════════════════════════════════════
// MAPQUEST CITY — Mentors
// Every district has a resident NPC mentor who teaches that path's lesson,
// then sends the player into the REAL feature. "The lesson ends where the
// work begins." Pure data + deterministic helpers — no React, no random.
//
// Lesson content is TRANSMUTED from the coaching source material into the
// app's own cinematic voice (see coaching/06_IP_AND_SOURCING.md) — never
// transcribed.
//
// VOICE (the 2026-07 rewrite): plain, warm, direct — a coach who likes you
// and gets to the point. Short sentences. Every beat says something you can
// do, or sets up the beat that does. At most one metaphor per beat, and the
// next sentence cashes it out in plain words. No riddles.
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
      "You came back. That's the real secret — the people who become something keep coming back.",
      "I'm you, further down the road. I remember standing exactly where you're standing.",
      "Twenty chambers in this spire. Each one is a piece of work on yourself. One is ready for you today.",
      "I'm not going to turn lead into gold. I'm going to help you become the person you keep imagining. That's the only alchemy that pays.",
    ],
    lesson: {
      title: "The Transmutation",
      beats: [
        {
          speaker: "The Alchemist",
          lines: [
            "Everyone wants to be the finished version of themselves.",
            "Almost nobody wants the work in the middle. The middle is the whole art.",
          ],
        },
        {
          speaker: "The Alchemist",
          lines: [
            "You don't become someone new by deciding it once.",
            "You become new in small steps — one chamber, one chapter, one honest hour at a time.",
          ],
        },
        { speaker: "YOU", lines: ["So what am I supposed to burn?"] },
        {
          speaker: "The Alchemist",
          lines: [
            "The old story about who you are and what you're capable of.",
            "It kept you safe. It's also keeping you small.",
            "Bring it into the spire. Chapter by chapter, we'll trade it for something true.",
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
      "Welcome to the Forge. This is where you decide who runs your life — on purpose, out loud.",
      "House rule: say it out loud. A thing you only think stays a thought. A thing you say starts becoming real.",
      "Most people never actually choose who they are. They just stay whoever the past made them. You get to choose today.",
      "Who you were is history. Who you're becoming is a decision. I'll help you write it down and say it.",
    ],
    lesson: {
      title: "The Spoken Stand",
      beats: [
        {
          speaker: "Declan the Herald",
          lines: [
            "A wish and a declaration are different things.",
            "A wish waits for proof. A declaration decides first, and lets the proof catch up.",
          ],
        },
        {
          speaker: "Declan the Herald",
          lines: [
            "And no — I don't mean chanting 'I'm confident' over a scared mind.",
            "Empty words don't work, and you know it.",
          ],
        },
        {
          speaker: "Declan the Herald",
          lines: [
            "A real stand is simple: say who you're being, out loud,",
            "and back it with one action you'll actually take today.",
          ],
        },
        { speaker: "YOU", lines: ["And if I don't believe it yet?"] },
        {
          speaker: "Declan the Herald",
          lines: [
            "You don't say it because it's already true.",
            "You say it, act like the person who said it, and it becomes true. That's the whole mechanism.",
          ],
        },
      ],
      exercise: {
        prompt: "Write one 'I am' stand and speak it out loud — then take it into your day.",
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
      "Most maps show where you've been. Mine show where you're going. Come look at yours.",
      "Up here you can see your whole future — if you're willing to describe it clearly.",
      "Come up. On a clear day you can see the person you're becoming from here.",
      "Every big thing in this city started as a picture somebody refused to put down.",
    ],
    lesson: {
      title: "Map It Backward",
      beats: [
        {
          speaker: "The Cartographer",
          lines: [
            "Most people plan forward from today. That just makes a longer to-do list.",
            "I want you to plan from the other end.",
          ],
        },
        {
          speaker: "The Cartographer",
          lines: [
            "Stand in the day it's already done. Really picture it.",
            "What does that day look like? Who did you have to become to be standing in it?",
          ],
        },
        { speaker: "YOU", lines: ["Then what?"] },
        {
          speaker: "The Cartographer",
          lines: [
            "Walk backward from that day: done, almost done, halfway, first milestone.",
            "Then plan only to the first milestone.",
            "The rest of the map gets clearer as you move.",
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

  "the-academy": {
    id: "the-academy",
    name: "Docent Vale",
    epithet: "Teaches the shifts that change what you can see",
    color: "#00FFBF",
    spriteVariant: "mentor",
    greetings: [
      "Welcome to the Academy. Before I teach you a single tactic, I want to upgrade what you can see.",
      "The five shifts aren't information. They're new eyes. Take one and you can't go back to not seeing.",
      "Whatever you can't see about your own patterns is running your life. Class exists to fix that.",
      "No exams in here. Your actual week is the exam. Class just makes it passable.",
    ],
    lesson: {
      title: "New Eyes First",
      beats: [
        {
          speaker: "Docent Vale",
          lines: [
            "New results need new eyes.",
            "Keep seeing the game the old way, and you'll just get faster at playing it wrong.",
          ],
        },
        {
          speaker: "Docent Vale",
          lines: [
            "There are five shifts — five places where how you see things",
            "quietly decides how you act. We take them one at a time.",
          ],
        },
        {
          speaker: "Docent Vale",
          lines: [
            "Every shift feels obvious after you take it.",
            "That's how you know it's real: you can't un-see it.",
          ],
        },
        { speaker: "YOU", lines: ["Where do I start?"] },
        {
          speaker: "Docent Vale",
          lines: [
            "At the next one in the sequence.",
            "The Academy saves your place — just walk in and continue.",
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
      "A goal with no plan under it is a balcony with no stairs. In here, we build the stairs.",
      "This is where ambition gets organized. Vision at the top, this week's moves at the bottom.",
      "Tell me your big vision and I'll help you find what to do about it on Tuesday.",
      "Bring me the dream. You'll leave with a plan.",
    ],
    lesson: {
      title: "The Chain of Command",
      beats: [
        {
          speaker: "Commander Sable",
          lines: [
            "Vision is your why — the big picture. It doesn't need a deadline.",
            "Mission is what you're building, and who it's for.",
          ],
        },
        {
          speaker: "Commander Sable",
          lines: [
            "Strategy is the concrete plan with numbers and dates on it.",
            "Tactics are the actual moves you make this week.",
          ],
        },
        {
          speaker: "Commander Sable",
          lines: [
            "Most people have a big dream and a to-do list, with nothing connecting them.",
            "That gap is where dreams die.",
          ],
        },
        { speaker: "YOU", lines: ["So I build the middle."] },
        {
          speaker: "Commander Sable",
          lines: [
            "You build the middle. Milestones, one at a time,",
            "each one clearly serving the one above it.",
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
      "You can't fix yesterday and you can't touch tomorrow. Today is the day we get. Let's use it.",
      "Every action you take today is a vote for the person you're becoming. Come cast good ones.",
      "Small and finished beats big and someday. Every single time.",
      "The board resets at midnight. Whatever yesterday was, today starts clean.",
    ],
    lesson: {
      title: "Votes for the Future You",
      beats: [
        {
          speaker: "Keeper Juno",
          lines: [
            "Every action you take today is a vote for one of two people:",
            "the person you've been, or the person you're becoming.",
          ],
        },
        {
          speaker: "Keeper Juno",
          lines: [
            "You don't need a perfect day. You need a clear one:",
            "pick five priorities, put them in order, and start with number one.",
          ],
        },
        {
          speaker: "Keeper Juno",
          lines: [
            "Stuck on number one? Move to number two.",
            "Completely stalled? Finish something tiny.",
            "Finishing anything gives you energy back — that's just how people work.",
          ],
        },
        { speaker: "YOU", lines: ["That's it?"] },
        {
          speaker: "Keeper Juno",
          lines: [
            "That's it — done today, then done again tomorrow.",
            "Nobody wants the answer to be that simple. It is.",
          ],
        },
      ],
      exercise: {
        prompt: "Open today's ritual and set your five priorities.",
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
      "The week already happened. The only question left is what you'll do differently because of it.",
      "Bring your wins and your messes. Both are useful information in here.",
      "No regret in this room. We look at the week, take the lesson, and give next week its orders.",
      "Council's open. All it costs is honesty.",
    ],
    lesson: {
      title: "Insight Decays",
      beats: [
        {
          speaker: "Marshal Ilex",
          lines: [
            "An insight only lasts about three days.",
            "Act on it by then, or it fades back into a nice idea.",
          ],
        },
        {
          speaker: "Marshal Ilex",
          lines: [
            "That's why we review every week.",
            "Not to grade yourself — to turn what happened into what's next.",
          ],
        },
        {
          speaker: "Marshal Ilex",
          lines: [
            "Every review ends with two questions: what did you notice,",
            "and what will you DO because you noticed it?",
            "Insight plus action — that's the only combination that compounds.",
          ],
        },
        { speaker: "YOU", lines: ["And if the week was ugly?"] },
        {
          speaker: "Marshal Ilex",
          lines: [
            "Ugly weeks teach the most.",
            "Review it while it's fresh, take the lesson, and let the rest go.",
          ],
        },
      ],
      exercise: {
        prompt: "Run your weekly review and leave with one thing you'll do differently.",
        ctaLabel: "CONVENE THE COUNCIL",
      },
      xp: 10,
    },
  },

  "the-vault": {
    id: "the-vault",
    name: "Auric the Vaultkeeper",
    epithet: "Counts the wins you keep forgetting to collect",
    color: "#FACC15",
    spriteVariant: "mentor",
    greetings: [
      "Everything you finish is stored in here. Most people forget to come collect.",
      "Most people rob themselves — they finish something hard and never stop to take the win.",
      "I keep the receipts on everything you've done. It's more than you think.",
      "The door is heavy, but it opens for anyone holding a finished thing.",
    ],
    lesson: {
      title: "Collect What You Earned",
      beats: [
        {
          speaker: "Auric the Vaultkeeper",
          lines: [
            "You finish something hard, and within the hour you're staring at the next thing.",
            "That's not discipline. You're skipping your own payday.",
          ],
        },
        {
          speaker: "Auric the Vaultkeeper",
          lines: [
            "A win you never honor doesn't feel finished. It keeps tugging at you.",
            "Celebrate it once, properly, and it finally closes —",
            "done, filed, yours.",
          ],
        },
        {
          speaker: "Auric the Vaultkeeper",
          lines: [
            "So decide the reward before you do the work: what you get, and when.",
            "Then when you cross the line, actually take it.",
          ],
        },
        { speaker: "YOU", lines: ["Rewards feel… indulgent."] },
        {
          speaker: "Auric the Vaultkeeper",
          lines: ["Workers who never get paid quit.", "You're the worker. Pay yourself."],
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
      "Nothing down here will hurt you. It just wants to be seen — that's all it ever wanted.",
      "You didn't bring your shadow here. It goes everywhere with you. This is just where we look at it.",
      "The dark isn't your enemy. Not knowing what's in it — that's what costs you.",
      "Walk gently. The oldest parts of you live in these walls, and they've been carrying a lot.",
    ],
    lesson: {
      title: "The Old Bodyguard",
      beats: [
        {
          speaker: "Brother Ashe",
          lines: [
            "That pattern you hate — the flinching, the hiding, the armor.",
            "It's not a flaw. It's a bodyguard you hired when you were young and something hurt.",
          ],
        },
        {
          speaker: "Brother Ashe",
          lines: [
            "It did its job. You made it through.",
            "But it never got the message that the danger passed —",
            "so it still steps in and blocks things you actually want.",
          ],
        },
        {
          speaker: "Brother Ashe",
          lines: [
            "We don't fight it. We meet it, name it, and thank it.",
            "Then you choose who handles the moment — the scared part, or the real you.",
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
      "Something got under your skin today? Good. Bring it here — we'll turn it into fuel for something you care about.",
      "The forge doesn't care why you're angry. It only cares what you build with it.",
      "Swallowing your anger doesn't make it go away. It rusts you from the inside. Better to bring it to me.",
      "Hear that ringing? That's somebody turning a bad day into something useful.",
    ],
    lesson: {
      title: "Fire Wants a Shape",
      beats: [
        {
          speaker: "Vessa the Forgemother",
          lines: [
            "Somebody told you anger is the problem.",
            "They were half right. Anger with no direction is the problem.",
          ],
        },
        {
          speaker: "Vessa the Forgemother",
          lines: [
            "That heat in your chest is raw energy that doesn't have a job yet.",
            "Same fire either way — the question is whether it gets a shape.",
          ],
        },
        {
          speaker: "Vessa the Forgemother",
          lines: [
            "Swallow it and it eats you. Spray it and it burns your people.",
            "Point it at real work, and it becomes the strongest fuel you own.",
          ],
        },
        { speaker: "YOU", lines: ["Aim it at what?"] },
        {
          speaker: "Vessa the Forgemother",
          lines: [
            "At whatever the anger is about — it always points at something you care about.",
            "Come on. The anvils are hot.",
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
      "Sit down. Nothing here needs to be rushed, including you.",
      "You can't pour from an empty cup — and everyone you lead drinks from yours. Fill it first.",
      "Rest isn't the reward you get after the work. Rest is what makes the work possible.",
      "The springs never ask what you got done today. Notice how rare that is.",
    ],
    lesson: {
      title: "The Cup Ledger",
      beats: [
        {
          speaker: "Imara of the Springs",
          lines: [
            "You've been treating your energy like it's unlimited",
            "and your time like it's the problem. It's the other way around.",
          ],
        },
        {
          speaker: "Imara of the Springs",
          lines: [
            "Running on empty doesn't just slow you down.",
            "It changes who shows up — a snappier, smaller, more tired you.",
            "And the people around you feel it first.",
          ],
        },
        {
          speaker: "Imara of the Springs",
          lines: [
            "So check the basics like they're infrastructure: sleep, movement, quiet, play.",
            "Not as treats you earn. As the foundation everything else stands on.",
          ],
        },
        { speaker: "YOU", lines: ["It feels like slacking."] },
        {
          speaker: "Imara of the Springs",
          lines: [
            "Ask the future you who's running the whole thing.",
            "They'll tell you straight: taking care of the leader is part of the job.",
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
      "Energy isn't a mood you wait for. It's a system you can work on. That's good news.",
      "Today we figure out what actually charges you — and what's quietly draining you.",
      "Every breakthrough in this lab started as somebody's bad Tuesday.",
    ],
    lesson: {
      title: "Three Dials",
      beats: [
        {
          speaker: "Dr. Fenn",
          lines: [
            "Your energy runs on three dials.",
            "Most people never touch any of them on purpose.",
          ],
        },
        {
          speaker: "Dr. Fenn",
          lines: [
            "Dial one: chargers — sleep, movement, play, finishing things.",
            "Do more of those, on purpose, on the calendar.",
          ],
        },
        {
          speaker: "Dr. Fenn",
          lines: [
            "Dial two: drains — the habits, the clutter, the things you keep tolerating.",
            "Find one drain this week and cut it.",
          ],
        },
        { speaker: "YOU", lines: ["And when I need more than maintenance?"] },
        {
          speaker: "Dr. Fenn",
          lines: [
            "That's dial three: ignition. Commit to something that scares you a little,",
            "then act while you're still afraid.",
            "Fear plus action is how breakthroughs start. The lab's open.",
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
      "A promise you make alone is easy to break. A promise your people heard? That one holds.",
      "The guild has one rule: do the work where someone can see it.",
      "You've gone as far as going alone will take you. That's not failure — that's the doorway.",
      "Somebody in there is one witness away from keeping their word. Today it might be you.",
    ],
    lesson: {
      title: "Witnessed Work",
      beats: [
        {
          speaker: "Guildmaster Bram",
          lines: [
            "A commitment nobody hears is negotiable.",
            "You'll talk yourself out of it by Thursday. Everyone does.",
          ],
        },
        {
          speaker: "Guildmaster Bram",
          lines: [
            "Say it to another person and it changes weight.",
            "Being seen isn't pressure — it's support that keeps you honest.",
          ],
        },
        {
          speaker: "Guildmaster Bram",
          lines: [
            "And when someone shares their fire with you: just listen. Really listen.",
            "Don't fix them. Coach only if they ask.",
            "Trusting people with their own lives — that's respect.",
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
      "In this hall we count what you did. What you didn't do never happened.",
      "Every banner up there started as one kept promise. Yours will too.",
      "Nobody bows in here. You earn your place by showing up again.",
      "The torches stay lit for comebacks. Especially comebacks.",
    ],
    lesson: {
      title: "Shame Doesn't Build",
      beats: [
        {
          speaker: "Odessa the Crowned",
          lines: [
            "Shame feels like it's motivating you. It isn't.",
            "Nobody ever shamed themselves into a bigger life —",
            "they just got quieter about their dreams.",
          ],
        },
        {
          speaker: "Odessa the Crowned",
          lines: [
            "Celebration is the engine that actually works.",
            "Whatever you honor, you repeat.",
            "Whatever you repeat becomes who you are.",
          ],
        },
        {
          speaker: "Odessa the Crowned",
          lines: [
            "So this hall keeps one kind of score: wins, streaks, comebacks.",
            "The misses aren't on the wall. The rises are.",
          ],
        },
        { speaker: "YOU", lines: ["Even the small stuff?"] },
        {
          speaker: "Odessa the Crowned",
          lines: [
            "Especially the small stuff.",
            "Big lives are built out of small wins, celebrated and repeated.",
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
      "All these shelves explain one sentence. Come in — I'll show you the sentence.",
      "You don't need more information. You need the steps, in order, repeated. That's what lives here.",
      "Quiet, please — not for the books. For you. Clear thinking likes a quiet room.",
      "Everyone asks for the secret shelf. You're standing in it.",
    ],
    lesson: {
      title: "One Sentence",
      beats: [
        {
          speaker: "Archivist Wren",
          lines: [
            "People walk in expecting a thousand secrets.",
            "There's no secret in here. There's one method, and every shelf just explains it.",
          ],
        },
        {
          speaker: "Archivist Wren",
          lines: [
            "Here it is: see the goal clearly. Break it into milestones. Do one step daily.",
            "Review weekly. Celebrate what you finish. Repeat.",
          ],
        },
        {
          speaker: "Archivist Wren",
          lines: [
            "None of those steps are impressive on their own. That's the point.",
            "Mastery isn't a rare talent. It's an ordinary loop, run again and again without applause.",
          ],
        },
        { speaker: "YOU", lines: ["Where do people break it?"] },
        {
          speaker: "Archivist Wren",
          lines: [
            "The repeat. They run the loop once, see no magic, and quit.",
            "The loop only pays when you keep going around it.",
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
      "Come look through the lens. Everything's clearer from up here.",
      "Out in nature, nothing is a 'problem.' Things just are what they are. There's a lesson in that.",
      "Every disaster looks different under magnification. Usually smaller.",
      "I chart openings, not omens. Bring me your worst thing and I'll show you what I mean.",
    ],
    lesson: {
      title: "No Problems in Nature",
      beats: [
        {
          speaker: "Orrin the Stargazer",
          lines: [
            "Look out there — collisions, dying stars, whole worlds ending.",
            "Not one of them is a problem. Things happen. Then we tell stories about them.",
          ],
        },
        {
          speaker: "Orrin the Stargazer",
          lines: [
            "A 'problem' is two things stuck together: what actually happened,",
            "and the story you attached to it.",
            "You can't change the event. The story is all yours.",
          ],
        },
        {
          speaker: "Orrin the Stargazer",
          lines: [
            "So we use the lens. What are the plain facts, minus your story?",
            "What would open up if this were fully handled?",
            "What does it look like from the future where it's already solved?",
          ],
        },
        { speaker: "YOU", lines: ["And every problem opens like that?"] },
        {
          speaker: "Orrin the Stargazer",
          lines: [
            "Every one I've ever put under the glass.",
            "Some just take a longer look.",
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
    "Welcome back to the plaza. Where do you want to go today?",
    "Sixteen districts, one city — and all of it is yours to walk.",
    "I watch this whole city. Ask me where today wants you, and I'll point.",
    "Every district on this street is a real part of your life. Pick one and I'll walk you there.",
  ],
};

// One daily-lesson line per district — the Guide points, the district teaches.
const GUIDE_LINES = {
  "alchemist-spire": "The Spire is lit tonight. Your next chapter is ready when you are.",
  "identity-forge": "Declan is collecting names today. Go say one that fits the person you're becoming.",
  "vision-tower": "Clear skies over the tower. Perfect day to look at where you're headed.",
  "the-academy": "The Academy bell is ringing. Your next shift is waiting with your name on it.",
  "war-rooms": "The war rooms are humming. Your next milestone needs orders.",
  "daily-nexus": "The Nexus counts today's votes at sundown. Go set your Top Five while the day is still yours.",
  "war-council": "The Council meets for anyone willing to look at their week honestly. That's you, today.",
  "the-vault": "Auric says you have wins you never collected. The vault door is open.",
  "shadow-sanctum": "The Sanctum is quiet today. A good day to meet the part of you that follows you around.",
  "pressure-forge": "The Forge runs hot today. Bring whatever's been getting under your skin.",
  "cup-springs": "Your cup has been sounding hollow lately. The springs can fix that.",
  "blaze-lab": "Dr. Fenn is running energy experiments today. Volunteer.",
  "guild-quarter": "The guild board has room for one more declared mission. Make it yours.",
  "hall-of-champions": "New banners go up in the Hall today. One of your wins belongs up there.",
  "formula-athenaeum": "Wren left the formula open on the lectern. Go read the step you keep skipping.",
  observatory: "Good visibility at the observatory tonight. Bring your biggest problem — it looks smaller under the lens.",
};

const GUIDE_FALLBACK_LINE =
  "The city has something for you today. Walk until you find it.";

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
