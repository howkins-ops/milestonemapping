export const SHIFTS = [
  {
    id: "intro",
    number: 0,
    label: "INTRO",
    title: "The 5 Simple Shifts",
    subtitle: "Discover what's really holding you back",
    color: "#FF3EDB",
    glow: "rgba(255, 62, 219, 0.35)",
    icon: "🌀",
    xp: 50,
    gameType: "intro",
    theme: "cosmic",
    scenes: [
      {
        type: "TITLE_CARD",
        headline: "The 5 Simple Shifts",
        subheadline: "To Upgrade How You Operate\n& Make Transformation Possible",
        body: "The proven system that helps self-employed entrepreneurs achieve more by becoming more.",
        highlight: ["5 Simple Shifts", "Upgrade", "Transformation"],
        duration: 6,
        emphasis: "PAUSE"
      },
      {
        type: "REVEAL_GRID",
        headline: "Who Is This For?",
        subheadline: "For those ready to transform to their full potential and achieve unprecedented success.",
        grid: [
          { title: "Self-Employed Entrepreneurs", detail: "Founders and innovators who know they're capable of more and seek to elevate their business and impact." },
          { title: "Leaders & Visionaries", detail: "Those in positions of influence, ready to operate at a higher level and inspire their teams with authenticity." },
          { title: "Driven Individuals", detail: "Whether you've been chasing big goals for years or are just beginning — committed to rapid personal transformation." }
        ],
        highlight: ["Self-Employed Entrepreneurs", "Leaders & Visionaries", "Driven Individuals"],
        duration: 8,
        emphasis: "NORMAL"
      },
      {
        type: "LIST",
        headline: "In The Next 45 Minutes,\nYou'll Discover:",
        bullets: [
          "How to rebuild unshakable integrity — without relying on willpower or motivation",
          "How to calibrate your focus so time, energy, and goals move in the same direction",
          "How to upgrade your internal operating system so consistency becomes automatic",
          "How to integrate structure and accountability so execution becomes easy",
          "How to shift your identity so success feels natural — not forced or exhausting",
          "How to turn the impossible into possible — hitting goals faster, feeling more aligned"
        ],
        highlight: ["rebuild unshakable integrity", "calibrate your focus", "upgrade your internal operating system", "shift your identity", "impossible into possible"],
        duration: 10,
        emphasis: "NORMAL"
      },
      {
        type: "STATEMENT",
        headline: "My Promise to You:",
        body: "By the end of this training, you'll know the 5 simple shifts to upgrade how you operate and make lasting transformation possible.",
        highlight: ["5 simple shifts", "upgrade how you operate", "lasting transformation possible"],
        duration: 6,
        emphasis: "PAUSE"
      },
      {
        type: "LIST",
        headline: "Does This Sound Like You?",
        bullets: [
          "You start strong on goals — but lose focus once the excitement fades",
          "You feel like you're working harder than ever, but not seeing the results you're capable of",
          "You set big targets, only to find yourself procrastinating, doubting, or starting over again",
          "You have moments of clarity and motivation — followed by weeks of chaos and inconsistency",
          "You feel stuck repeating old patterns, even though you know you're meant for more",
          "You secretly wonder if you'll ever become the person who actually follows through"
        ],
        highlight: ["lose focus", "procrastinating", "stuck repeating old patterns", "meant for more"],
        duration: 10,
        emphasis: "NORMAL"
      },
      {
        type: "HERO_TEXT",
        headline: "The Big Question",
        body: "Are you starting to worry that if nothing changes... you'll still be in the same place a year from now?\n\nThat you'll keep setting goals, getting excited, then slipping back into old habits — telling yourself you'll \"get serious next time\"?\n\nThat you'll keep chasing motivation instead of mastering momentum — and watch another year go by with the same results?\n\nWhat if the truth is — it's not time holding you back... it's how you're operating?",
        highlight: ["nothing changes", "chasing motivation", "mastering momentum", "how you're operating"],
        duration: 9,
        emphasis: "PAUSE"
      },
      {
        type: "LIST",
        headline: "Once You Make These 5 Shifts...",
        bullets: [
          "You'll wake up with calm confidence, knowing exactly what matters and what to do next",
          "You'll walk into your workday grounded, focused, and in control — people will feel the difference",
          "Your clients or peers will start asking how you stay so consistent — and you'll smile",
          "You'll feel momentum again — not from hustle, but from clarity and conviction",
          "Your relationships will deepen as you show up more present, patient, and powerful",
          "You'll look in the mirror and recognize yourself again — the version that leads, executes, and thrives"
        ],
        highlight: ["calm confidence", "grounded, focused, and in control", "clarity and conviction", "leads, executes, and thrives"],
        duration: 10,
        emphasis: "NORMAL"
      },
      {
        type: "HERO_TEXT",
        headline: "Who Am I?",
        subheadline: "I'm Jon Howkins, founder of The Identity Shift™",
        body: "I help self-employed entrepreneurs upgrade how they operate so they can achieve their goals faster — and actually sustain them.\n\nBut I didn't always have it figured out. My first year in sales was rough. I wasn't failing — but I wasn't winning either. I was stuck in the middle, just trying to survive.\n\nI didn't just want to make money — I wanted to transform who I was.",
        highlight: ["Jon Howkins", "The Identity Shift™", "transform who I was"],
        duration: 8,
        emphasis: "NORMAL"
      },
      {
        type: "HERO_TEXT",
        headline: "How I Discovered The 5 Shifts",
        body: "That's when I discovered a year-long transformational leadership program accredited by the ICF. I used the last of my savings to join — and it changed everything.\n\nInside, I noticed something powerful: the top performers weren't just working harder — they were operating differently. They had structure. Integrity. Clarity. They didn't chase success; they became it.\n\nI broke those lessons down into five simple shifts that rebuilt how I thought, led, and executed. After applying them, I became one of the top sales professionals in the country.\n\nNow, I teach others the same five shifts — the exact process that helped me go from surviving to leading.",
        highlight: ["operating differently", "structure. Integrity. Clarity.", "they became it", "surviving to leading"],
        duration: 10,
        emphasis: "NORMAL"
      }
    ]
  },
  {
    id: "shift1",
    number: 1,
    label: "SHIFT 1",
    title: "Integrity",
    subtitle: "Build your values foundation",
    color: "#00F0FF",
    glow: "rgba(0, 240, 255, 0.35)",
    icon: "🏛️",
    xp: 100,
    gameType: "values",
    theme: "crystal",
    scenes: [
      {
        type: "TITLE_CARD",
        headline: "Shift To Integrity",
        subheadline: "SHIFT 1",
        highlight: ["Integrity"],
        duration: 4,
        emphasis: "PAUSE"
      },
      {
        type: "STATEMENT",
        headline: "Without a Foundation,\nNothing Stands.",
        body: "Before you build success, habits, or systems — you need integrity. Integrity is the foundation everything else rests on. If your word doesn't mean anything to you, your goals won't either.\n\nWithout it, consistency collapses.\nWith it, everything you build becomes unshakable.",
        highlight: ["foundation", "integrity", "unshakable"],
        duration: 7,
        emphasis: "PAUSE"
      },
      {
        type: "HERO_TEXT",
        headline: "Integrity Starts With\nBrutal Honesty",
        body: "You can't build alignment on lies.\n\nBefore you can honor your word, you have to face where you've been breaking it.\n\nFacing the lie isn't about guilt — it's about truth.\n\nAnd truth is where real power begins.",
        highlight: ["Brutal Honesty", "honor your word", "truth", "real power begins"],
        duration: 8,
        emphasis: "PAUSE"
      },
      {
        type: "QUOTE",
        headline: "Shift Your Values",
        quote: "\"Show me your values and I'll predict your future.\"",
        highlight: ["values", "predict your future"],
        duration: 5,
        emphasis: "PAUSE"
      },
      {
        type: "HERO_TEXT",
        headline: "Your Values = Your GPS",
        body: "Your core values are an invisible GPS, guiding your choices and habits. They are your inner compass, showing you the way.\n\nWhen your actions don't match your values, you feel stress, make excuses, and burn out.\n\nAlign them, and become unstoppable.",
        highlight: ["invisible GPS", "inner compass", "stress, make excuses, and burn out", "unstoppable"],
        duration: 7,
        emphasis: "NORMAL"
      },
      {
        type: "CYCLE_DIAGRAM",
        headline: "Your Goals Change,\nBut Your Values Don't",
        subheadline: "Why You're Not Hitting Goals",
        cycle: [
          { label: "Set a New Goal", detail: "New projects inspire you to change how you work and live." },
          { label: "Motivation Rises", detail: "You start with momentum and early starts. But old habits still shape your choices." },
          { label: "Actions Reveal Truth", detail: "Even with new plans, old habits return. Your actions show your true values: comfort, control, or safety." },
          { label: "Get Tired", detail: "Lose motivation. Experience burnout. Develop excuses." },
          { label: "Cycle Repeats", detail: "Without changing your values, new goals bring the same results." }
        ],
        body: "This cycle never ends if your identity doesn't change.",
        highlight: ["values", "identity doesn't change"],
        duration: 9,
        emphasis: "NORMAL"
      },
      {
        type: "STATEMENT",
        headline: "When Values Align,\nGoals Ignite.",
        subheadline: "Fuel your vision with the right values.",
        body: "Match your values to your highest goals, not your old habits. Let go of values that don't help you, and build a Top 5 Value System that supports your goals.",
        highlight: ["Values Align", "Goals Ignite", "Top 5 Value System"],
        duration: 6,
        emphasis: "PAUSE"
      }
    ]
  },
  {
    id: "shift2",
    number: 2,
    label: "SHIFT 2",
    title: "Identity",
    subtitle: "Transform how you see yourself",
    color: "#00FFBF",
    glow: "rgba(0, 255, 191, 0.35)",
    icon: "🔄",
    xp: 150,
    gameType: "identity",
    theme: "neural",
    scenes: [
      {
        type: "TITLE_CARD",
        headline: "Shift To Identity",
        subheadline: "SHIFT 2",
        highlight: ["Identity"],
        duration: 4,
        emphasis: "PAUSE"
      },
      {
        type: "STATEMENT",
        headline: "Your Identity Is\nYour Being",
        body: "Identity isn't just what you do. It's who you truly are. Who you are guides your thoughts, actions, and results.",
        subheadline: "Change your Identity → Change your outcomes.",
        highlight: ["who you truly are", "Change your Identity", "Change your outcomes"],
        duration: 6,
        emphasis: "PAUSE"
      },
      {
        type: "HERO_TEXT",
        headline: "The Entrepreneur Rollercoaster",
        subheadline: "DO → HAVE → BE",
        body: "Most try to DO more to HAVE more and then BE who they want. This \"survival model\" leads to chasing outcomes and often burnout.\n\nChasing Outcomes = Emotional Rollercoaster\nWins bring temporary highs, setbacks crash your confidence. You become a slave to results instead of the creator of them.\n\nWhen outcomes define your worth, peace and power disappear.",
        highlight: ["survival model", "chasing outcomes", "burnout", "slave to results", "creator of them"],
        duration: 8,
        emphasis: "NORMAL"
      },
      {
        type: "CYCLE_DIAGRAM",
        headline: "The Old Way",
        cycle: [
          { label: "Focus on Outcomes", detail: "Set financial goals. Acquire new clients. Launch new services." },
          { label: "Do More", detail: "Work extended hours. Aggressively network. Force desired results." },
          { label: "Get Tired", detail: "Lose motivation. Experience burnout. Develop excuses." },
          { label: "Do It Again", detail: "Define a new objective. Repeat the process. Encounter the same roadblocks." },
          { label: "Cycle Repeats", detail: "Without changing your values, new goals bring the same results." }
        ],
        body: "Big Idea: this cycle never ends if your identity doesn't change.",
        highlight: ["identity doesn't change"],
        duration: 8,
        emphasis: "NORMAL"
      },
      {
        type: "INFINITY_LOOP",
        headline: "The New Way",
        nodes: [
          { label: "Identity", detail: "It starts with who you believe you are. \"I am a great help to my clients.\" This core belief shapes your actions." },
          { label: "Actions", detail: "Your strong belief leads to different actions. You network more, do excellent work, and always learn." },
          { label: "Habits", detail: "Actions you repeat become habits. Regular effort feels easy, and consistency comes naturally." },
          { label: "Outcomes", detail: "These good habits lead to clear results: more clients, better income, and steady business growth." }
        ],
        body: "Big Idea: Your identity shapes everything. Outcomes simply come from who you choose to be.",
        highlight: ["identity shapes everything", "who you choose to be"],
        duration: 9,
        emphasis: "PAUSE"
      }
    ]
  },
  {
    id: "shift3",
    number: 3,
    label: "SHIFT 3",
    title: "Masks & Essence",
    subtitle: "Face your shadows, claim your power",
    color: "#8B5CF6",
    glow: "rgba(139, 92, 246, 0.35)",
    icon: "🎭",
    xp: 200,
    gameType: "masks",
    theme: "shadow",
    scenes: [
      {
        type: "TITLE_CARD",
        headline: "Shift To Essence",
        subheadline: "SHIFT 3",
        highlight: ["Essence"],
        duration: 4,
        emphasis: "PAUSE"
      },
      {
        type: "SPLIT_CONCEPT",
        headline: "The Yin & Yang —\n2 Ways Of Being",
        body: "We all have Essence and Survival, like yin and yang. Knowing how they work helps us grow.",
        left: {
          title: "Essence",
          items: ["True Self", "Freedom", "Inner Peace", "Real Strength"]
        },
        right: {
          title: "Survival Mechanism",
          items: ["Driven by Fear", "Masks We Wear", "Limiting Beliefs", "Our Defenses"]
        },
        highlight: ["Essence", "Survival Mechanism"],
        duration: 7,
        emphasis: "NORMAL"
      },
      {
        type: "REVEAL_GRID",
        headline: "Survival Mechanisms\nCreate Masks",
        grid: [
          { title: "Stems From Trauma Or Pain", detail: "Rejection, failure, or shame. Your brain says \"Never again\" — so you hide, blame, or shut down to feel safe." },
          { title: "Grows Stronger With Repetition", detail: "The more you avoid, the stronger the pattern gets. What once protected you starts controlling you." },
          { title: "The Mask Traps You", detail: "It talks you out of change, growth, and truth. It tells you \"You're fine — just stay comfortable.\"" },
          { title: "Becomes Robotic", detail: "You don't choose the mask anymore — it wears you. You stop thinking — you just repeat." }
        ],
        highlight: ["Stems From Trauma", "Grows Stronger", "Mask Traps You", "Becomes Robotic"],
        duration: 9,
        emphasis: "NORMAL"
      },
      {
        type: "LIST",
        headline: "Awareness\nTakes Off The Mask",
        subheadline: "Uncover your true self by learning to identify and separate from your limiting patterns.",
        bullets: [
          "Step 1 — SEE THE PATTERN: You can't change what you don't notice. Recognizing your mask is where transformation begins.",
          "Step 2 — NAME IT TO TAME IT: Naming your feelings shifts brain activity from the fear center to the prefrontal cortex. Labeling emotions reduces their intensity — promoting logic over fear.",
          "Step 3 — APPLY IT TO YOUR MASKS: By saying \"My Excuse King is showing up,\" you separate from it. You observe the mask rather than being it — and gain the power to choose a new action."
        ],
        body: "Awareness creates distance. Label your emotions. Observation gives you choice.",
        highlight: ["SEE THE PATTERN", "NAME IT TO TAME IT", "APPLY IT", "Awareness creates distance"],
        duration: 10,
        emphasis: "NORMAL"
      },
      {
        type: "STATEMENT",
        headline: "Mask Examples",
        body: "These are the most common masks entrepreneurs wear. You may recognize yourself — or someone you know.",
        subheadline: "Which one shows up for you?",
        highlight: ["masks entrepreneurs wear"],
        duration: 4,
        emphasis: "FAST"
      },
      {
        type: "MASK_CARD",
        headline: "The Crybaby Entrepreneur",
        left: {
          title: "Business Impact",
          items: [
            "Easily abandons projects or initiatives",
            "Shies away from challenging decisions or client feedback",
            "Hesitates to act without constant reassurance"
          ]
        },
        right: {
          title: "Personal Impact",
          items: [
            "Reacts emotionally to business setbacks",
            "Takes criticism or failures too personally",
            "Drains energy from their support network"
          ]
        },
        highlight: ["Crybaby Entrepreneur"],
        duration: 7,
        emphasis: "NORMAL"
      },
      {
        type: "MASK_CARD",
        headline: "The Excuse King",
        left: {
          title: "Business",
          items: [
            "\"The market is saturated.\"",
            "\"Clients don't value my services.\"",
            "\"It's impossible to stand out.\"",
            "Excuses over action."
          ]
        },
        right: {
          title: "Life",
          items: [
            "Blames others, avoids responsibility",
            "Makes excuses, avoids work"
          ]
        },
        highlight: ["Excuse King"],
        duration: 7,
        emphasis: "NORMAL"
      },
      {
        type: "MASK_CARD",
        headline: "The \"Rebel\" Without Results",
        left: {
          title: "Business",
          items: [
            "Hates best practices, skips skill development",
            "Insists on doing things their way",
            "Achieves inconsistent results",
            "Disregards structured planning"
          ]
        },
        right: {
          title: "Life",
          items: [
            "Resists systems, clashes with collaborators",
            "Prioritizes perceived freedom over discipline",
            "Repeats unproductive patterns"
          ]
        },
        highlight: ["Rebel"],
        duration: 7,
        emphasis: "NORMAL"
      },
      {
        type: "MASK_CARD",
        headline: "The Champion Quitter",
        left: {
          title: "Business",
          items: [
            "Big plans, big hype",
            "Avoids crucial tasks"
          ]
        },
        right: {
          title: "Life",
          items: [
            "Starts new goals strong",
            "Gives up when challenges arise"
          ]
        },
        highlight: ["Champion Quitter"],
        duration: 6,
        emphasis: "NORMAL"
      },
      {
        type: "HERO_TEXT",
        headline: "Don't Take It Serious.\nTake Your Power Back.",
        subheadline: "Make It Funny",
        body: "Masks feel heavy when taken personally.\nHumor helps you see masks without shame.\nLaugh at your mask — it loses power.\n\nLaughter brings freedom.\nYou are not the mask.",
        highlight: ["Take Your Power Back", "You are not the mask"],
        duration: 6,
        emphasis: "PAUSE"
      },
      {
        type: "CONTRAST",
        headline: "So... What Is Essence?",
        left: {
          title: "When In Mask-Mode:",
          items: [
            "Clients feel fear or pushiness",
            "Your message doesn't feel authentic",
            "It's hard to build trust"
          ]
        },
        right: {
          title: "When In Essence-Mode:",
          items: [
            "Clients feel your confidence",
            "You quickly build trust",
            "You make real connections that lead to growth"
          ]
        },
        body: "Essence is the Real You. Your masks came from fear — but your Essence was always there. It's not something you earn; it's who you already are.",
        subheadline: "The real question: Are you choosing to live from your Essence?",
        highlight: ["Essence", "Real You", "choosing to live from your Essence"],
        duration: 8,
        emphasis: "PAUSE"
      }
    ]
  },
  {
    id: "shift4",
    number: 4,
    label: "SHIFT 4",
    title: "Break the Myths",
    subtitle: "Bust the 3 beliefs holding you back",
    color: "#FACC15",
    glow: "rgba(250, 204, 21, 0.35)",
    icon: "⚡",
    xp: 250,
    gameType: "misconceptions",
    theme: "lightning",
    scenes: [
      {
        type: "TITLE_CARD",
        headline: "Break The Myths",
        subheadline: "SHIFT 4",
        highlight: ["Break The Myths"],
        duration: 4,
        emphasis: "PAUSE"
      },
      {
        type: "STATEMENT",
        headline: "The 3 Big\nMisconceptions",
        body: "Today, the term \"coaching\" is often used without clear meaning. Let's clarify what real coaching is — and what it isn't.",
        highlight: ["3 Big", "Misconceptions", "real coaching"],
        duration: 5,
        emphasis: "PAUSE"
      },
      {
        type: "CONTRAST",
        headline: "Misconception #1:\nCoaching = Therapy",
        left: {
          title: "Therapy is for:",
          items: [
            "Mental illness, long-term anxiety, or depression",
            "Past trauma, major loss, or deep emotional pain",
            "Substance abuse or big relationship problems"
          ]
        },
        right: {
          title: "Coaching is for:",
          items: [
            "High-functioning people ready to operate at a higher level",
            "Closing the gap between where you are and where you want to be",
            "Building systems, identity, and performance — not healing wounds"
          ]
        },
        highlight: ["Misconception #1", "Coaching = Therapy"],
        duration: 8,
        emphasis: "NORMAL"
      },
      {
        type: "CONTRAST",
        headline: "Misconception #2:\nCoaching = Mentoring",
        left: {
          title: "Mentoring is for:",
          items: [
            "Guidance from someone who's walked your path",
            "Tips and wisdom from experience",
            "Inspiration and motivation from an expert"
          ]
        },
        right: {
          title: "Coaching is for:",
          items: [
            "Unlocking YOUR answers through powerful questions",
            "Building YOUR operating system, not copying someone else's",
            "Forward momentum — not expert advice"
          ]
        },
        highlight: ["Misconception #2", "Coaching = Mentoring"],
        duration: 8,
        emphasis: "NORMAL"
      },
      {
        type: "CONTRAST",
        headline: "Misconception #3:\nCoaching = Consulting",
        left: {
          title: "Consulting is for:",
          items: [
            "Expert advice on specific problems",
            "Ready-made solutions to known challenges",
            "Shortcuts and industry knowledge"
          ]
        },
        right: {
          title: "Coaching is for:",
          items: [
            "Developing YOUR capacity to solve future problems",
            "Owning your decisions and building self-trust",
            "Teaching you how to fish — for a lifetime"
          ]
        },
        body: "Consulting gives you the fish. Coaching teaches you how to fish for a lifetime.",
        highlight: ["Misconception #3", "Coaching = Consulting", "how to fish for a lifetime"],
        duration: 8,
        emphasis: "PAUSE"
      }
    ]
  }
];

export const SHIFTS_STORAGE_KEY = "shifts_state";

export function loadShiftsState() {
  try {
    return JSON.parse(localStorage.getItem(SHIFTS_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveShiftsState(state) {
  try {
    localStorage.setItem(SHIFTS_STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function isShiftUnlocked(shiftId, completed) {
  const idx = SHIFTS.findIndex(s => s.id === shiftId);
  if (idx === 0) return true;
  return completed.includes(SHIFTS[idx - 1].id);
}
