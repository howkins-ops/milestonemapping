# THE ULTIMATE 5 SHIFTS — CINEMATIC REBUILD PROMPT

## PROJECT CONTEXT

You are working inside a React/Vite mobile-first web app (the "Milestone Mapping App") that already contains a "5 Shifts Transformation Training" section. The current implementation uses PNG slide images displayed one at a time in a cinematic overlay. 

**The mission: rip out all PNG slides and replace every single one with a hand-crafted, full-screen cinematic scene built from pure React, CSS animations, and canvas particle systems — turning a slideshow into a world-class transformational experience.**

The existing files to modify/replace:
- `src/data/shiftsData.js` — replace `slides: ["file.png"]` with `scenes: [...]` rich data
- `src/components/training/ShiftCinematic.jsx` — replace image viewer with scene renderer
- `src/styles/training.css` — massively expand with new cinematic animation system

The existing games (`IntroGame`, `ValuesGame`, `IdentityGame`, `MasksGame`, `MisconceptionsGame`) and the `ShiftsPage` hub stay intact. Only the cinematic phase changes.

Brand tokens already in global CSS:
- `--brand-pink: #FF3EDB`
- `--brand-cyan: #00F0FF`  
- `--brand-green: #00FFBF`
- `--brand-purple: #8B5CF6`
- `--brand-yellow: #FACC15`
- `--font-display: "Sora"`
- `--font-mono: "JetBrains Mono"`
- `--font-body: "Manrope"`

---

## THE VISION

**No more PNG images. Every "slide" becomes a living, breathing cinematic SCENE.**

Each scene fills the screen and uses:
- **Word-by-word text reveals** — headline words bloom into existence one at a time with a glow burst
- **Staggered line entrances** — body text lines fly up with 80ms delays between each
- **Ambient particle systems** — canvas-rendered particles unique to each shift's visual world
- **Per-shift visual identity** — every shift has its own color world, particle type, and animation personality
- **Dramatic scene transitions** — entering scenes zoom/fade/split based on their type
- **Interactive micro-moments** — tap to advance with a ripple effect at touch point
- **Cinematic timer** — neon progress bar that pulses at 2s warning

Think: **Apple keynote meets a Netflix intro card meets a video game cutscene.**

---

## FIVE VISUAL WORLDS

Each shift gets its own immersive visual universe:

### INTRO — "THE AWAKENING" 
**Color:** `#FF3EDB` (hot pink/magenta)  
**Vibe:** Deep cosmos. Aurora borealis. You're waking up to something bigger than yourself.  
**Particles:** Slow-drifting star field — tiny white specks at varying speeds/opacity, occasional larger "aurora" blur behind headlines  
**Background:** Radial gradient `#0a0010 → #150025 → #0d001a`  
**Headline font:** Large, italic, bold Sora — feels like a revelation  
**Key animation:** WORD_BLOOM — each word materialises with a brief pink glow halo  
**Scene transition:** Fade up from black, 0.8s ease  

### SHIFT 1 — INTEGRITY — "THE FOUNDATION"
**Color:** `#00F0FF` (cyan)  
**Vibe:** Crystalline. Sharp geometry. The world of structure and unbreakable truth.  
**Particles:** Slow-rotating geometric hex grid overlay at 4% opacity + occasional "crystal shard" triangles that drift up and fade  
**Background:** `#000e14 → #001a20`  
**Headline font:** Heavy, uppercase, wide letter-spacing — power and permanence  
**Key animation:** CRACK_REVEAL — text appears to crack through like light splitting stone  
**Scene transition:** Slides in from right, slight 3D perspective tilt  

### SHIFT 2 — IDENTITY — "THE BECOMING"
**Color:** `#00FFBF` (green)  
**Vibe:** Neural networks. Infinite mirrors. You are being rewritten in real time.  
**Particles:** Tiny green dots connected by faint lines (neural mesh) — nodes pulse slowly  
**Background:** `#000d0a → #001a12`  
**Headline font:** Sora, glowing green — feels alive, electric  
**Key animation:** NEURAL_WRITE — text appears as if being written by electricity, letter by letter with green spark at the cursor  
**Scene transition:** Scale in from 95%, blur clears  

### SHIFT 3 — MASKS & ESSENCE — "THE UNMASKING"
**Color:** `#8B5CF6` (purple)  
**Vibe:** Fire and shadow. Theater. Duality. Ancient and primal.  
**Particles:** Two particle systems — one dark/smoky (masks) and one light/ember (essence) — they drift toward each other and dissolve  
**Background:** `#08000f → #100020`  
**Headline font:** Sora, heavy — words feel like they're being pulled from shadow  
**Key animation:** SHADOW_BURN — text starts dark purple, then "ignites" left-to-right into full brightness  
**Scene transition:** Wipe from center out, iris-reveal style  

### SHIFT 4 — BREAK THE MYTHS — "THE SHATTERING"
**Color:** `#FACC15` (yellow/gold)  
**Vibe:** Lightning. Myth destruction. Electric truth.  
**Particles:** Electric arc particles — tiny yellow streaks that flash and fade like static discharge  
**Background:** `#0f0a00 → #1a1200`  
**Headline font:** Sora, bold — words feel like they're being burned onto the screen  
**Key animation:** SHATTER_IN — text appears to shatter into the frame from fragments  
**Scene transition:** Flash cut — brief full-white frame, then scene slams in  

---

## SCENE DATA ARCHITECTURE

Replace the current `slides: string[]` in `shiftsData.js` with `scenes: Scene[]`.

```typescript
type SceneType = 
  | "TITLE_CARD"      // Full-screen dramatic title, minimal content
  | "STATEMENT"       // One big truth — huge text, single punch line
  | "HERO_TEXT"       // Large headline + 2-3 lines of body, no bullets
  | "LIST"            // Headline + staggered bullet points
  | "SPLIT_CONCEPT"   // Two columns: left concept vs right concept
  | "CYCLE_DIAGRAM"   // Animated circular flow diagram (CSS-drawn)
  | "INFINITY_LOOP"   // Animated ∞ loop with 4 labeled nodes
  | "QUOTE"           // Pull quote, large italic text, attribution
  | "REVEAL_GRID"     // 2x2 or 3x3 grid of items that stagger in
  | "MASK_CARD"       // Character card: name + business + life impacts
  | "CONTRAST"        // Before (red) / After (green) side-by-side
  | "ESSENCE_LIST"    // Special animated essence words reveal

type Scene = {
  type: SceneType
  headline: string
  subheadline?: string
  body?: string              // paragraph text
  bullets?: string[]         // for LIST type
  left?: { title: string; items: string[] }   // for SPLIT_CONCEPT
  right?: { title: string; items: string[] }  // for SPLIT_CONCEPT
  quote?: string             // for QUOTE type
  cycle?: { label: string; detail: string }[] // for CYCLE_DIAGRAM
  nodes?: { label: string; detail: string }[] // for INFINITY_LOOP
  grid?: { title: string; detail: string }[]  // for REVEAL_GRID
  words?: string[]           // for ESSENCE_LIST
  highlight?: string[]       // words to render in shift color
  duration: number           // seconds before auto-advance
  emphasis?: "PAUSE" | "FAST" | "NORMAL"  // pacing
}
```

---

## COMPLETE SCENE DATA — ALL 37 SLIDES AS SCENES

### INTRO MODULE (9 scenes)

```js
scenes: [
  // Scene 1: Title card
  {
    type: "TITLE_CARD",
    headline: "The 5 Simple Shifts",
    subheadline: "To Upgrade How You Operate\n& Make Transformation Possible",
    body: "The proven system that helps self-employed entrepreneurs achieve more by becoming more.",
    highlight: ["5 Simple Shifts", "Upgrade", "Transformation"],
    duration: 6,
    emphasis: "PAUSE"
  },
  // Scene 2: Who is this for
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
  // Scene 3: What you'll discover
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
  // Scene 4: Promise
  {
    type: "STATEMENT",
    headline: "My Promise to You:",
    body: "By the end of this training, you'll know the 5 simple shifts to upgrade how you operate and make lasting transformation possible.",
    highlight: ["5 simple shifts", "upgrade how you operate", "lasting transformation possible"],
    duration: 6,
    emphasis: "PAUSE"
  },
  // Scene 5: Does this sound like you
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
  // Scene 6: The Big Question
  {
    type: "HERO_TEXT",
    headline: "The Big Question",
    body: "Are you starting to worry that if nothing changes... you'll still be in the same place a year from now?\n\nThat you'll keep setting goals, getting excited, then slipping back into old habits — telling yourself you'll \"get serious next time\"?\n\nThat you'll keep chasing motivation instead of mastering momentum — and watch another year go by with the same results?\n\nWhat if the truth is — it's not time holding you back... it's how you're operating?",
    highlight: ["nothing changes", "chasing motivation", "mastering momentum", "how you're operating"],
    duration: 9,
    emphasis: "PAUSE"
  },
  // Scene 7: Once you make these 5 shifts
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
  // Scene 8: Who am I
  {
    type: "HERO_TEXT",
    headline: "Who Am I?",
    subheadline: "I'm Jon Howkins, founder of The Identity Shift™",
    body: "I help self-employed entrepreneurs upgrade how they operate so they can achieve their goals faster — and actually sustain them.\n\nBut I didn't always have it figured out. My first year in sales was rough. I wasn't failing — but I wasn't winning either. I was stuck in the middle, just trying to survive.\n\nI didn't just want to make money — I wanted to transform who I was.",
    highlight: ["Jon Howkins", "The Identity Shift™", "transform who I was"],
    duration: 8,
    emphasis: "NORMAL"
  },
  // Scene 9: How I discovered the 5 shifts
  {
    type: "HERO_TEXT",
    headline: "How I Discovered The 5 Shifts",
    body: "That's when I discovered a year-long transformational leadership program accredited by the ICF. I used the last of my savings to join — and it changed everything.\n\nInside, I noticed something powerful: the top performers weren't just working harder — they were operating differently. They had structure. Integrity. Clarity. They didn't chase success; they became it.\n\nI broke those lessons down into five simple shifts that rebuilt how I thought, led, and executed. After applying them, I became one of the top sales professionals in the country.\n\nNow, I teach others the same five shifts — the exact process that helped me go from surviving to leading.",
    highlight: ["operating differently", "structure. Integrity. Clarity.", "they became it", "surviving to leading"],
    duration: 10,
    emphasis: "NORMAL"
  }
]
```

---

### SHIFT 1 — INTEGRITY (7 scenes)

```js
scenes: [
  // Scene 1: Title card
  {
    type: "TITLE_CARD",
    headline: "Shift To Integrity",
    subheadline: "SHIFT 1",
    highlight: ["Integrity"],
    duration: 4,
    emphasis: "PAUSE"
  },
  // Scene 2: Without a foundation
  {
    type: "STATEMENT",
    headline: "Without a Foundation,\nNothing Stands.",
    body: "Before you build success, habits, or systems — you need integrity. Integrity is the foundation everything else rests on. If your word doesn't mean anything to you, your goals won't either.\n\nWithout it, consistency collapses.\nWith it, everything you build becomes unshakable.",
    highlight: ["foundation", "integrity", "unshakable"],
    duration: 7,
    emphasis: "PAUSE"
  },
  // Scene 3: Integrity starts with brutal honesty
  {
    type: "HERO_TEXT",
    headline: "Integrity Starts With\nBrutal Honesty",
    body: "You can't build alignment on lies.\n\nBefore you can honor your word, you have to face where you've been breaking it.\n\nFacing the lie isn't about guilt — it's about truth.\n\nAnd truth is where real power begins.",
    highlight: ["Brutal Honesty", "honor your word", "truth", "real power begins"],
    duration: 8,
    emphasis: "PAUSE"
  },
  // Scene 4: Shift your values — quote
  {
    type: "QUOTE",
    headline: "Shift Your Values",
    quote: "\"Show me your values and I'll predict your future.\"",
    highlight: ["values", "predict your future"],
    duration: 5,
    emphasis: "PAUSE"
  },
  // Scene 5: Your values = GPS
  {
    type: "HERO_TEXT",
    headline: "Your Values = Your GPS",
    body: "Your core values are an invisible GPS, guiding your choices and habits. They are your inner compass, showing you the way.\n\nWhen your actions don't match your values, you feel stress, make excuses, and burn out.\n\nAlign them, and become unstoppable.",
    highlight: ["invisible GPS", "inner compass", "stress, make excuses, and burn out", "unstoppable"],
    duration: 7,
    emphasis: "NORMAL"
  },
  // Scene 6: Goals change but values don't (cycle diagram)
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
  // Scene 7: When values align
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
```

---

### SHIFT 2 — IDENTITY (5 scenes)

```js
scenes: [
  // Scene 1: Title card
  {
    type: "TITLE_CARD",
    headline: "Shift To Identity",
    subheadline: "SHIFT 2",
    highlight: ["Identity"],
    duration: 4,
    emphasis: "PAUSE"
  },
  // Scene 2: Your identity is your being
  {
    type: "STATEMENT",
    headline: "Your Identity Is\nYour Being",
    body: "Identity isn't just what you do. It's who you truly are. Who you are guides your thoughts, actions, and results.",
    subheadline: "Change your Identity → Change your outcomes.",
    highlight: ["who you truly are", "Change your Identity", "Change your outcomes"],
    duration: 6,
    emphasis: "PAUSE"
  },
  // Scene 3: The entrepreneur rollercoaster
  {
    type: "HERO_TEXT",
    headline: "The Entrepreneur Rollercoaster",
    subheadline: "DO → HAVE → BE",
    body: "Most try to DO more to HAVE more and then BE who they want. This \"survival model\" leads to chasing outcomes and often burnout.\n\nChasing Outcomes = Emotional Rollercoaster\nWins bring temporary highs, setbacks crash your confidence. You become a slave to results instead of the creator of them.\n\nWhen outcomes define your worth, peace and power disappear.",
    highlight: ["survival model", "chasing outcomes", "burnout", "slave to results", "creator of them"],
    duration: 8,
    emphasis: "NORMAL"
  },
  // Scene 4: The old way cycle
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
  // Scene 5: The new way — infinity loop
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
```

---

### SHIFT 3 — MASKS & ESSENCE (11 scenes)

```js
scenes: [
  // Scene 1: Title card
  {
    type: "TITLE_CARD",
    headline: "Shift To Essence",
    subheadline: "SHIFT 3",
    highlight: ["Essence"],
    duration: 4,
    emphasis: "PAUSE"
  },
  // Scene 2: Yin & Yang
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
  // Scene 3: Survival mechanisms create masks
  {
    type: "REVEAL_GRID",
    headline: "Survival Mechanisms\nCreate Masks",
    grid: [
      { title: "Stems From Trauma Or Pain", detail: "Rejection, failure, or shame. Your brain says \"Never again\" — so you hide, blame, or shut down to feel safe." },
      { title: "Grows Stronger With Repetition", detail: "The more you avoid, the stronger the pattern gets. What once protected you starts controlling you. Avoidance starts to feel normal." },
      { title: "The Mask Traps You", detail: "It talks you out of change, growth, and truth. It tells you \"You're fine — just stay comfortable.\" It makes comfort feel safe." },
      { title: "Becomes Robotic", detail: "You don't choose the mask anymore — it wears you. You stop thinking — you just repeat. Every day feels the same, but emptier." }
    ],
    highlight: ["Stems From Trauma", "Grows Stronger", "Mask Traps You", "Becomes Robotic"],
    duration: 9,
    emphasis: "NORMAL"
  },
  // Scene 4: Awareness takes off the mask
  {
    type: "LIST",
    headline: "Awareness\nTakes Off The Mask",
    subheadline: "Uncover your true self by learning to identify and separate from your limiting patterns.",
    bullets: [
      "Step 1 — SEE THE PATTERN: You can't change what you don't notice. Recognizing your mask is where transformation begins.",
      "Step 2 — NAME IT TO TAME IT: Naming your feelings shifts brain activity from the fear center to the prefrontal cortex. UCLA neuroscientist Matthew Lieberman found labeling emotions reduces their intensity — promoting logic over fear.",
      "Step 3 — APPLY IT TO YOUR MASKS: By saying \"My Excuse King is showing up,\" you separate from it. You observe the mask rather than being it — and gain the power to choose a new action."
    ],
    body: "Awareness creates distance. Label your emotions. Observation gives you choice.",
    highlight: ["SEE THE PATTERN", "NAME IT TO TAME IT", "APPLY IT", "Awareness creates distance"],
    duration: 10,
    emphasis: "NORMAL"
  },
  // Scene 5: Mask examples intro
  {
    type: "STATEMENT",
    headline: "Mask Examples",
    body: "These are the most common masks entrepreneurs wear. You may recognize yourself — or someone you know.",
    subheadline: "Which one shows up for you?",
    highlight: ["masks entrepreneurs wear"],
    duration: 4,
    emphasis: "FAST"
  },
  // Scene 6: The Crybaby Entrepreneur
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
  // Scene 7: The Excuse King
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
  // Scene 8: The Rebel Without Results
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
  // Scene 9: The Champion Quitter
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
  // Scene 10: Make it funny
  {
    type: "HERO_TEXT",
    headline: "Don't Take It Serious.\nTake Your Power Back.",
    subheadline: "Make It Funny",
    body: "Masks feel heavy when taken personally.\nHumor helps you see masks without shame.\nLaugh at your mask — it loses power.\n\nLaughter brings freedom.\nYou are not the mask.",
    highlight: ["Take Your Power Back", "You are not the mask"],
    duration: 6,
    emphasis: "PAUSE"
  },
  // Scene 11: What is Essence + Choose Essence
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
```

> **Note on Slide 32 (Choose Essence):** Build the essence words (`Joy`, `Love`, `Freedom`, `Courage`, `Radiance`, `Power`, `Inspire`, `Connector`, `Leader`) as part of the `ESSENCE_LIST` scene type in the **victory screen** (`ShiftComplete.jsx`) for Shift 3 — not as a cinematic scene. They should bloom in one-by-one after the game is won.

---

### SHIFT 4 — BREAK THE MYTHS (5 scenes)

```js
scenes: [
  // Scene 1: Title card
  {
    type: "TITLE_CARD",
    headline: "Break The Myths",
    subheadline: "SHIFT 4",
    highlight: ["Break The Myths"],
    duration: 4,
    emphasis: "PAUSE"
  },
  // Scene 2: The 3 big misconceptions
  {
    type: "STATEMENT",
    headline: "The 3 Big\nMisconceptions",
    body: "Today, the term \"coaching\" is often used without clear meaning. Let's clarify what real coaching is — and what it isn't.",
    highlight: ["3 Big", "Misconceptions", "real coaching"],
    duration: 5,
    emphasis: "PAUSE"
  },
  // Scene 3: Coaching ≠ Therapy
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
    highlight: ["Misconception #1", "Coaching ≠ Therapy"],
    duration: 8,
    emphasis: "NORMAL"
  },
  // Scene 4: Coaching ≠ Mentoring
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
    highlight: ["Misconception #2", "Coaching ≠ Mentoring"],
    duration: 8,
    emphasis: "NORMAL"
  },
  // Scene 5: Coaching ≠ Consulting
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
```

---

## TECHNICAL IMPLEMENTATION PLAN

### 1. New File: `src/components/training/CinematicScene.jsx`

The core renderer. Takes a `scene` object and renders the appropriate layout with animations.

**Key behaviors:**
- On mount: trigger entrance animation based on `scene.type` and shift theme
- Words in `headline` that appear in `scene.highlight` render in `shift.color` with a subtle glow
- Tap anywhere: fire ripple effect at touch point, then advance
- Scene types map to layout components (see below)

**Sub-components (all in same file or co-located):**
- `<SceneTitleCard>` — centered, massive type, slow zoom in
- `<SceneStatement>` — 60vw headline, body text fades up after 0.5s delay
- `<SceneHeroText>` — headline + paragraph, lines stagger up 80ms apart
- `<SceneList>` — headline + bullets, each bullet slides in with 120ms stagger
- `<SceneSplitConcept>` — two panels slide in from left/right simultaneously
- `<SceneCycleDiagram>` — CSS animated circular flow with 5 nodes appearing one by one
- `<SceneInfinityLoop>` — animated ∞ SVG path with 4 node labels appearing in sequence
- `<SceneQuote>` — italic large text, quote marks animate in first, then text reveals
- `<SceneRevealGrid>` — 2-3 column grid, cards appear with 150ms stagger
- `<SceneMaskCard>` — character name in shift color + two-column impact list
- `<SceneContrast>` — left panel (slightly desaturated/dim) vs right panel (glowing shift color)

### 2. New File: `src/components/training/ParticleCanvas.jsx`

Canvas-based ambient particle system. Receives `theme` prop matching shift theme names.

```jsx
// Props
{ theme: "cosmic" | "crystal" | "neural" | "shadow" | "lightning", color: string }
```

Renders with `position: fixed, inset: 0, z-index: 0, pointerEvents: none`. The cinematic content renders at `z-index: 1` above it.

**Theme implementations:**
- `cosmic`: 120 white dots drifting at 0.1-0.3px/frame, opacity 0.1-0.5, occasional slow aurora blur behind headlines
- `crystal`: Hex grid at 4% opacity as a CSS repeating-pattern SVG background, 8 triangular shards that slowly drift upward and fade
- `neural`: 60 green nodes connected by lines when within 80px of each other, nodes slowly drift, each pulses opacity 0.4→0.8 on a 3-6s sine cycle
- `shadow`: 40 dark purple smoke particles that drift up and fade (use CSS radial gradient circles), 20 orange ember particles that drift up faster
- `lightning`: Random electric arc flashes — every 2-4s, draw a jagged line from a random edge point to center, opacity peaks then drops to 0 over 300ms

### 3. Updated File: `src/components/training/ShiftCinematic.jsx`

Replace the entire image-viewer with a scene driver:

```jsx
// Core logic stays the same:
// - index state, auto-advance timer, tap handler
// - progress bar, skip button, dot indicators

// Replace the <img> with:
<ParticleCanvas theme={SHIFT_THEMES[module.id]} color={module.color} />
<CinematicScene 
  scene={module.scenes[index]}
  shiftColor={module.color}
  shiftTheme={SHIFT_THEMES[module.id]}
  key={`${module.id}-${index}`}
/>
```

The `AUTO_ADVANCE_SECS` should be driven by `module.scenes[index].duration` instead of a fixed value.

### 4. Updated File: `src/data/shiftsData.js`

- Replace all `slides: ["filename.png"]` arrays with `scenes: [...]` arrays (data above)
- Add `theme` field to each shift: `"cosmic"`, `"crystal"`, `"neural"`, `"shadow"`, `"lightning"`
- The `SHIFT_THEMES` map is: `{ intro: "cosmic", shift1: "crystal", shift2: "neural", shift3: "shadow", shift4: "lightning" }`
- Keep all other fields unchanged (`id`, `number`, `label`, `title`, `subtitle`, `color`, `glow`, `icon`, `xp`, `gameType`)

### 5. Updated File: `src/styles/training.css`

**Expand massively.** Add:

```css
/* Scene entrance animations — one per type */
@keyframes scene-zoom-in { from { opacity: 0; transform: scale(1.08); } to { opacity: 1; transform: scale(1); } }
@keyframes scene-slide-right { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
@keyframes scene-scale-blur { from { opacity: 0; transform: scale(0.95); filter: blur(6px); } to { opacity: 1; transform: scale(1); filter: blur(0); } }
@keyframes scene-flash-cut { 0% { opacity: 1; background: #fff; } 100% { opacity: 1; background: transparent; } }
@keyframes scene-iris { from { clip-path: circle(0% at 50% 50%); } to { clip-path: circle(100% at 50% 50%); } }

/* Word reveal — used for headlines */
@keyframes word-bloom { 
  from { opacity: 0; transform: translateY(8px) scale(0.96); filter: blur(4px); }
  to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}

/* Stagger utility — applied via inline --delay CSS var */
.stagger-item { animation: word-bloom 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: var(--delay, 0ms); }

/* Neural write cursor */
@keyframes cursor-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
.neural-cursor { display: inline-block; width: 2px; height: 1em; background: var(--shift-color); animation: cursor-blink 0.6s steps(1) infinite; vertical-align: text-bottom; margin-left: 2px; }

/* Shadow burn — left-to-right ignition */
@keyframes shadow-burn {
  from { color: #3d1a5c; text-shadow: none; }
  to   { color: var(--shift-color); text-shadow: 0 0 20px var(--shift-color-40); }
}

/* Cycle diagram node appear */
@keyframes node-appear { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }

/* Infinity loop draw */
@keyframes path-draw { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }

/* Tap ripple */
@keyframes tap-ripple {
  from { transform: scale(0); opacity: 0.6; }
  to   { transform: scale(4); opacity: 0; }
}
.tap-ripple {
  position: fixed; width: 60px; height: 60px; border-radius: 50%;
  border: 2px solid var(--shift-color);
  transform: scale(0); pointer-events: none; z-index: 10000;
  animation: tap-ripple 0.5s ease-out forwards;
}

/* Contrast panel glow */
.contrast-panel-right { box-shadow: 0 0 30px var(--shift-color-15); border-color: var(--shift-color-40); }

/* Mask card entrance */
@keyframes mask-card-enter { from { opacity: 0; transform: translateY(20px) rotateX(8deg); } to { opacity: 1; transform: translateY(0) rotateX(0); } }
```

---

## INTERACTION MODEL

**Tap to advance** — tap anywhere on the scene (not the skip button):
1. Create a `<div class="tap-ripple">` at the touch/click coordinates, remove after animation
2. Advance to next scene (or call `onComplete()` if last)

**Long-press to pause** — holding tap for 500ms pauses the auto-advance timer

**Skip button** — always visible in top-right, calls `onComplete()` immediately

**Back tap** — tap the left 15% of screen to go to previous scene (if index > 0)

**Scene pacing** — each scene's `duration` drives the auto-advance timer, overriding the fixed 5s

---

## WORD HIGHLIGHT SYSTEM

In headlines and body text, wrap words/phrases from the `highlight` array in a `<span>` with:

```css
.scene-highlight {
  color: var(--shift-color);
  text-shadow: 0 0 12px var(--shift-color-40);
}
```

For `STATEMENT` and `TITLE_CARD` scene types, additionally apply a micro-pulse animation to highlighted words after the entrance animation completes:

```css
@keyframes highlight-pulse {
  0%, 100% { text-shadow: 0 0 12px var(--shift-color-40); }
  50% { text-shadow: 0 0 24px var(--shift-color-70), 0 0 40px var(--shift-color-20); }
}
```

---

## CYCLE DIAGRAM IMPLEMENTATION

The `CYCLE_DIAGRAM` scene type renders a CSS-drawn circular flow (no SVG images needed):

- Container: circular div, `border: 2px solid var(--shift-color-20)`, `border-radius: 50%`, 200px diameter on mobile
- Nodes: 5 absolutely-positioned divs around the circle perimeter using `transform: rotate(Ndeg) translateX(100px) rotate(-Ndeg)`
- Each node: small circle + label below. Nodes appear sequentially with 400ms delay each (`node-appear` animation)
- Connecting arrows: CSS borders or pseudo-elements pointing clockwise
- The "Big Idea" body text appears below the circle after all nodes have appeared (delay: nodes × 400ms + 200ms)

---

## INFINITY LOOP IMPLEMENTATION

The `INFINITY_LOOP` scene type (used for Shift 2's "New Way"):

- Render an SVG `<path>` with a figure-8 shape using cubic Bézier curves
- Animate `stroke-dashoffset` from 1000 to 0 over 2s to draw the path
- 4 labeled nodes appear at the 4 "crossing points" of the ∞ shape as the path passes through them
- Each node: colored dot + label + subtext below, fades in at the right timing
- Path color: `var(--shift-color)` at 60% opacity, stroke-width 3

---

## QUALITY CHECKLIST

Before declaring this complete:

- [ ] All 37 slides replaced — zero PNG `<img>` tags in ShiftCinematic
- [ ] Auto-advance uses `scene.duration` not a fixed constant
- [ ] Every shift has a working particle canvas in its visual world
- [ ] Highlight words render in shift color with glow in all scene types
- [ ] Tap ripple fires at touch coordinates on every advance tap
- [ ] CYCLE_DIAGRAM works with 5 nodes (Shift 1 scene 6, Shift 2 scene 4)
- [ ] INFINITY_LOOP animates the SVG path draw (Shift 2 scene 5)
- [ ] CONTRAST panels show left in dim/muted and right in shift-color-glow
- [ ] MASK_CARD renders character name large in shift color
- [ ] Skip button always visible, never obstructed by particles
- [ ] Games (`IntroGame`, `ValuesGame`, `IdentityGame`, `MasksGame`, `MisconceptionsGame`) remain 100% unchanged
- [ ] `ShiftsPage` hub remains 100% unchanged
- [ ] `ShiftComplete` victory screen remains intact (can add ESSENCE_LIST words bloom to Shift 3 completion)
- [ ] `localStorage` key `shifts_state` unchanged — existing progress not broken
- [ ] Mobile-first: all scenes look correct at 390px width
- [ ] `npm run build` passes with no errors

---

## DEFINITION OF "ULTIMATE"

This is not a slideshow. This is not a tutorial. This is a transformational cinematic experience where:

> Every word lands with weight.
> Every scene has a visual world.
> Every shift feels like a different dimension of the same journey.
> The user doesn't watch it — they *inhabit* it.

When someone finishes all 5 shifts, they should feel like they've been through something — like they've crossed a threshold. The content hasn't changed. The delivery has become the experience.
