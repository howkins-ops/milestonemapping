/* ALPHA MODE — the Myth Boss roster.
   Eleven "Reject This Thought" battles. Each boss IS a fitness myth;
   defeating it = smashing the myth and pocketing the truth. Bosses gate
   stage transitions (never shown all at once). All copy is original
   game copy — the science claims are summarized, not quoted. */

export const MYTH_BOSSES = [
  {
    id: "morning-warden", n: 1, gatePhase: "prime", tier: 1,
    name: "The Morning Warden",
    myth: "Breakfast is the most important meal of the day. Skip it and everything falls apart.",
    truth: "The morning has no magic. What your body responds to is the fast that came before a meal — sleep is already an eight-hour fast. Timing is a free choice; the eating window is the dial that matters.",
    decoy: "Breakfast matters, but only if it's high-carb — the body needs morning sugar to wake up.",
  },
  {
    id: "grazer-king", n: 2, gatePhase: "prime", tier: 1,
    name: "The Grazer King",
    myth: "Keep eating small bites all day — frequent meals stoke the metabolic fire.",
    truth: "The thermic effect of food follows TOTAL calories, not how many plates they arrive on. Ten meals or one meal — same burn if the calories match.",
    decoy: "Grazing works, but only on protein — carb grazing is what slows the furnace.",
  },
  {
    id: "six-plate-hydra", n: 3, gatePhase: "prime", tier: 1,
    name: "The Six-Plate Hydra",
    myth: "Six small meals a day burns more fat than three.",
    truth: "Fewer, fuller meals leave you MORE satisfied and less hungry. More frequent eating trains hunger to show up more often — you feed the Hydra, it grows heads.",
    decoy: "Six meals burns more fat, but only if every meal is under 300 calories.",
  },
  {
    id: "gatekeeper-thirty", n: 4, gatePhase: "adapt", tier: 2,
    name: "The Gatekeeper of Thirty",
    myth: "The body can only digest 30 grams of protein per sitting — the rest is wasted.",
    truth: "Large single servings digest fine — the day's total protein is what counts, not the size of any one sitting. The gate was never locked.",
    decoy: "It's 40 grams, not 30 — anything past that becomes fat instantly.",
  },
  {
    id: "midnight-glutton", n: 5, gatePhase: "adapt", tier: 2,
    name: "The Midnight Glutton",
    myth: "Eating before bed makes you fat. The kitchen closes at eight.",
    truth: "Calories in versus calories out doesn't wear a watch. Evening eaters have matched — and in studies beaten — morning eaters at the same intake. Night carbs can even feed growth hormone in sleep.",
    decoy: "Night eating is fine, but only pure protein — a single evening carb becomes fat.",
  },
  {
    id: "dawn-herald", n: 6, gatePhase: "adapt", tier: 2,
    name: "The Dawn Herald",
    myth: "Eat your carbs early so you have all day to burn them off.",
    truth: "Carbs placed late — after training, toward sleep — load glycogen for the next fight and support the night's hormone work. The Herald has the clock upside down.",
    decoy: "Carb timing doesn't exist at all — eat them whenever, it never matters.",
  },
  {
    id: "treadmill-wraith", n: 7, gatePhase: "adapt", tier: 2,
    name: "The Treadmill Wraith",
    myth: "Long, slow cardio is the best way to burn fat.",
    truth: "Lifting and intervals keep the furnace burning for a day or two AFTER you leave — plus muscle and insulin benefits cardio can't match. Slow cardio still serves recovery and capacity. It's a tool, not the throne.",
    decoy: "Cardio is completely useless — never do anything but lift heavy.",
  },
  {
    id: "feather-duke", n: 8, gatePhase: "surge", tier: 3,
    name: "The Feather Duke",
    myth: "Light weights and high reps carve you shredded and 'toned.'",
    truth: "No struggle, no signal. The body changes when the load asks a real question. Light forever teaches the muscle it's already enough.",
    decoy: "Only maximal singles build anything — anything over 5 reps is cardio.",
  },
  {
    id: "snake-oil-peddler", n: 9, gatePhase: "surge", tier: 3,
    name: "The Snake-Oil Peddler",
    myth: "Supplements are ALL garbage — or ALL magic. Pick a side.",
    truth: "Both edges cut. A short list earns its place (quality-certified basics); the rest is marketing. The truth is boring, specific, and cheaper than the Peddler's cart.",
    decoy: "Everything sold in a tub is a scam with zero exceptions.",
  },
  {
    id: "sculptors-lie", n: 10, gatePhase: "surge", tier: 3,
    name: "The Sculptor's Lie",
    myth: "You can't target where you build — muscles grow the same no matter the angle.",
    truth: "Position and angle shift which fibers answer the call. You don't spot-reduce fat, but you CAN aim the chisel where muscle is built.",
    decoy: "You can spot-reduce fat — crunches melt belly fat directly.",
  },
  {
    id: "empty-tank", n: 11, gatePhase: "surge", tier: 3,
    name: "The Empty Tank",
    myth: "Never train on an empty stomach — you'll burn out mid-set.",
    truth: "Protein from earlier meals stays in the system for many hours. Trained fasted, the body learns to pull from stored fat. The tank was never empty — it just wasn't the tank you thought.",
    decoy: "Fasted training is the ONLY way to burn fat — eating breakfast cancels a workout.",
  },
];

export const bossesForPhase = (phaseId) => MYTH_BOSSES.filter((b) => b.gatePhase === phaseId);
