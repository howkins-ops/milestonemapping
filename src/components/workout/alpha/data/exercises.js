/* ALPHA MODE — the exercise library.
   One entry per movement used across the 16 campaign workouts.
   `setup` = start position, `steps` = execution cues in plain language.
   `hold: true` marks timed work (planks, swings, climbers) — the session
   runs a countdown instead of a reps stepper and logs seconds as reps.
   Signature lore moves (Spearpoint / Crown Press / Kingmaker) resolve
   through ALIASES to their generic entries; their lore cue stays in
   moves.js and renders on top of the how-to. */

import { moveByName } from "./moves.js";

export const EXERCISES = [
  /* ── squats & lunges ── */
  {
    name: "Goblet Squat", muscles: "legs · glutes", equipment: "dumbbell",
    setup: "Hold one dumbbell vertically at your chest, both hands cupping the top head of the weight.",
    steps: [
      "Push your hips back and squat until your upper thighs are at least parallel to the floor — elbows brushing the insides of your knees at the bottom.",
      "Pause at the bottom.",
      "Press back up through your heels.",
    ],
  },
  {
    name: "Back Squat", muscles: "legs · glutes", equipment: "barbell + rack",
    setup: "Bar across your upper back, hands just outside your shoulders, feet shoulder-width. Big breath, brace your abs.",
    steps: [
      "Sit your hips back and down until your thighs are at least parallel to the floor.",
      "Keep your chest up and your lower back naturally arched the whole way.",
      "Drive back up through your heels to standing.",
    ],
  },
  {
    name: "Barbell Front Squat", muscles: "legs · core", equipment: "barbell + rack",
    setup: "Grip just beyond shoulder-width, raise your upper arms parallel to the floor and let the bar roll back to rest on the front of your shoulders.",
    steps: [
      "Keeping your elbows high and lower back arched, sit your hips back and down until your thighs are at least parallel.",
      "Pause at the bottom.",
      "Drive back up to the start.",
    ],
  },
  {
    name: "Bodyweight Squat", muscles: "legs", equipment: "bodyweight",
    setup: "Feet shoulder-width, arms out in front for balance.",
    steps: [
      "Push your hips back and squat until your thighs are at least parallel to the floor.",
      "Keep your heels down and chest up.",
      "Stand back up and go straight into the next rep — smooth and steady.",
    ],
  },
  {
    name: "Jump Squat", muscles: "legs · explosive", equipment: "bodyweight",
    setup: "Fingers laced behind your head, elbows pulled back in line with your body.",
    steps: [
      "Dip your knees, then explode up — jump as high as you can, hands staying behind your head.",
      "Land soft and immediately sink into the next squat.",
    ],
  },
  {
    name: "Reverse Lunge", muscles: "legs · glutes", equipment: "bodyweight or dumbbells",
    setup: "Stand tall, shoulders back — hands on hips, or a dumbbell in each hand.",
    steps: [
      "Step backward with one leg and lower until your front knee is bent at least 90 degrees.",
      "Pause, then push back to standing as quickly as you can.",
      "Do all reps on one leg, then switch.",
    ],
  },
  {
    name: "Bulgarian Split Squat", muscles: "legs · glutes", equipment: "bodyweight + bench",
    setup: "Staggered stance, chest up, hands on hips. Rest the instep of your back foot on a bench behind you.",
    steps: [
      "Lower your body as far as you can, front knee tracking over your foot.",
      "Pause at the bottom.",
      "Push back up. All reps with one leg forward, then switch.",
    ],
  },

  /* ── hinges & deadlifts ── */
  {
    name: "Barbell Deadlift", muscles: "full body · posterior chain", equipment: "barbell",
    setup: "Roll the bar up against your shins. Bend your hips and knees, grab it overhand about shoulder-width.",
    steps: [
      "Without rounding your lower back, stand up — thrust your hips forward and squeeze your glutes at the top.",
      "Pause, then lower the bar keeping it close to your body the whole way.",
    ],
  },
  {
    name: "Two-Thirds Deadlift", muscles: "posterior chain · grip", equipment: "barbell",
    setup: "Double-overhand grip on the bar. Squat about two-thirds of the way down — back flat, shoulder blades pulled back.",
    steps: [
      "Drive through your heels and pull your hips through to a full lockout, squeezing your glutes.",
      "On the way down: push your hips back first, lower the bar without bending your knees further, hamstrings loaded, back straight, bar to the floor.",
    ],
  },
  {
    name: "Trap Bar Deadlift", muscles: "full body · posterior chain", equipment: "trap bar",
    setup: "Stand inside the trap bar, feet hip-width. Hips back, back flat, grip the handles at your sides.",
    steps: [
      "Stand up — drive through your heels and push your hips through at the top.",
      "Lower under control, keeping your back flat.",
    ],
  },
  {
    name: "Trap Bar Deficit Deadlift", muscles: "full body · posterior chain", equipment: "trap bar + low platform",
    setup: "Stand on a low plate or platform inside the trap bar — the extra depth makes a longer pull. Hips back, back flat, grip the handles.",
    steps: [
      "Stand up through your heels, hips through at the top.",
      "Lower under control back to the deficit. The longer range is the point — no rounding at the bottom.",
    ],
  },
  {
    name: "Rack Pull from Knee", muscles: "back · glutes · grip", equipment: "barbell + rack",
    setup: "Set the bar on rack pins at knee height. Hinge at the hips, grab it overhand just outside your legs, back flat.",
    steps: [
      "Stand up — drive your hips through and squeeze your glutes at lockout.",
      "Lower the bar back to the pins under control.",
    ],
  },
  {
    name: "Barbell Romanian Deadlift", muscles: "hamstrings · glutes", equipment: "barbell",
    setup: "Bar at arm's length in front of your hips, overhand grip just beyond shoulder-width, knees slightly bent, chest out.",
    steps: [
      "Without changing your knee bend, hinge at the hips and lower your torso until it's nearly parallel to the floor.",
      "Pause — you should feel your hamstrings loaded.",
      "Raise back up by driving your hips forward.",
    ],
  },
  {
    name: "KB Romanian Deadlift", muscles: "hamstrings · glutes", equipment: "kettlebell",
    setup: "Kettlebell at arm's length in front of your thighs, feet hip-width, knees slightly bent.",
    steps: [
      "Without changing your knee bend, hinge at the hips and lower your torso until it's nearly parallel to the floor.",
      "Pause, then raise back up by driving your hips forward.",
    ],
  },
  {
    name: "DB Romanian Deadlift", muscles: "hamstrings · glutes", equipment: "dumbbells",
    setup: "Dumbbells at arm's length in front of your thighs, overhand grip, feet hip-width, slight knee bend.",
    steps: [
      "Hinge at the hips — knee bend stays fixed — until your torso is nearly parallel to the floor.",
      "Pause, then stand back up through your hips.",
    ],
  },
  {
    name: "Two-Arm KB Swing", muscles: "hips · full body", equipment: "kettlebell", hold: true,
    setup: "Both hands on the kettlebell, overhand grip, held at your waist. Feet just wider than shoulder-width, lower back slightly arched.",
    steps: [
      "Hinge at your hips and knees until your torso is about 45° to the floor, swinging the bell between your legs.",
      "Snap your hips forward and straighten your knees — the bell swings up to chest height on its own. Arms are ropes, hips are the engine.",
      "Let it swing back between your legs and repeat, rep after rep, for the whole clock.",
    ],
  },
  {
    name: "High Pull", muscles: "traps · shoulders · explosive", equipment: "dumbbells or barbell",
    setup: "Weights held overhand just above knee height, hips back, back flat.",
    steps: [
      "Explode upward — rise onto your toes as your elbows drive high, pulling the weights to shoulder height.",
      "Lower and reset between reps. This is a snap, not a slow grind.",
    ],
  },

  /* ── glutes & core ── */
  {
    name: "Glute Bridge", muscles: "glutes", equipment: "bodyweight",
    setup: "Lie faceup, knees bent, feet flat on the floor.",
    steps: [
      "Raise your hips until your body forms a straight line from shoulders to knees.",
      "Squeeze your glutes and pause at the top.",
      "Lower back down.",
    ],
  },
  {
    name: "Barbell Glute Bridge", muscles: "glutes", equipment: "barbell + pad",
    setup: "Lie on the floor, knees bent, feet flat. Padded barbell across your hips, overhand grip at shoulder-width.",
    steps: [
      "Keeping the bar just below your pelvis, raise your hips while squeezing your glutes until your hips line up with your body.",
      "Lower and repeat.",
    ],
  },
  {
    name: "Bodyweight Glute Bridge", muscles: "glutes", equipment: "bodyweight",
    setup: "Lie faceup, knees bent, feet flat on the floor.",
    steps: [
      "Raise your hips to a straight line from shoulders to knees.",
      "Squeeze at the top, lower under control — ride the tempo when the block calls one.",
    ],
  },
  {
    name: "Single-Leg Hip Raise", muscles: "glutes · core", equipment: "bodyweight",
    setup: "Lie faceup, one knee bent with foot flat, the other leg straight and raised in line with the bent thigh. Arms out to your sides.",
    steps: [
      "Push your hips up, keeping the straight leg elevated the whole time.",
      "Pause at the top, lower back down.",
      "All reps on one side, then switch.",
    ],
  },
  {
    name: "Plank", muscles: "core", equipment: "bodyweight", hold: true,
    setup: "Forearms on the floor, elbows under your shoulders, feet together behind you.",
    steps: [
      "Brace your abs and hold a dead-straight line from shoulders to ankles.",
      "No sagging hips, no pike. Breathe and hold for the whole clock.",
    ],
  },
  {
    name: "Feet-Elevated Plank", muscles: "core", equipment: "bodyweight + bench", hold: true,
    setup: "Forearm plank with your feet up on a bench behind you.",
    steps: [
      "Brace hard — the elevation shifts more load onto your shoulders and abs.",
      "Hold a straight line from shoulders to ankles for the whole clock.",
    ],
  },
  {
    name: "Mountain Climber", muscles: "core · conditioning", equipment: "bodyweight", hold: true,
    setup: "Push-up position, arms straight, body straight from shoulders to ankles.",
    steps: [
      "Lift one foot and drive that knee toward your chest.",
      "Return it and immediately drive the other knee. Keep alternating at pace for the whole clock.",
    ],
  },
  {
    name: "Hanging Knee Raise", muscles: "abs · grip", equipment: "pull-up bar",
    setup: "Hang from the bar with an overhand, shoulder-width grip (straps if your grip gives out first). Feet together, knees slightly bent.",
    steps: [
      "Raise your hips and lift your thighs toward your chest.",
      "Stop when your thighs pass just above parallel to the floor.",
      "Pause, then lower under control — no swinging.",
    ],
  },
  {
    name: "Jumping Jack", muscles: "conditioning", equipment: "bodyweight", hold: true,
    setup: "Stand facing forward, arms at your sides.",
    steps: [
      "Jump up slightly, spreading your legs while bringing your arms together overhead.",
      "Jump again to return to the start. Keep a steady rhythm for the whole clock.",
    ],
  },

  /* ── pushes ── */
  {
    name: "Push-Up", muscles: "chest · triceps · core", equipment: "bodyweight",
    setup: "Hands slightly wider than your shoulders, body straight from ankles to shoulders, abs braced tight.",
    steps: [
      "Lower your chest to just above the floor, elbows tucked toward your sides.",
      "Pause, then push back up without letting your hips sag.",
    ],
  },
  {
    name: "Flat Chest Press", muscles: "chest · triceps", equipment: "dumbbells + bench",
    setup: "Lie on a flat bench, dumbbells held straight above your shoulders.",
    steps: [
      "Lower the dumbbells to the sides of your chest.",
      "Pause, then press them back up over your shoulders.",
    ],
  },
  {
    name: "Incline DB Chest Press", muscles: "upper chest · shoulders", equipment: "dumbbells + incline bench",
    setup: "Bench set to 30–45°. Dumbbells held straight above your shoulders.",
    steps: [
      "Lower the dumbbells to the sides of your chest.",
      "Pause, then press back up.",
    ],
  },
  {
    name: "Low-Incline DB Press", muscles: "upper chest", equipment: "dumbbells + incline bench",
    setup: "Bench set to a low 15–30° incline. Dumbbells straight above your shoulders.",
    steps: [
      "Lower to the sides of your chest under control — ride the tempo when the block calls one.",
      "Press back up over your shoulders.",
    ],
  },
  {
    name: "Bench Press", muscles: "chest · triceps", equipment: "barbell + bench",
    setup: "Overhand grip just wider than your shoulders, bar held over your sternum, arms straight.",
    steps: [
      "Lower the bar under control — elbows tucked so your upper arms sit about 45° from your torso at the bottom.",
      "Pause on your chest, then press straight up.",
    ],
  },
  {
    name: "Dumbbell Squeeze Press", muscles: "chest · triceps", equipment: "dumbbells + bench",
    setup: "Lie on a flat bench, dumbbells pressed together over your chest, palms facing each other.",
    steps: [
      "Keep squeezing the dumbbells into each other as you lower them to your chest.",
      "Press back up without letting the squeeze go — the inward pressure is the point.",
    ],
  },
  {
    name: "Dumbbell Fly", muscles: "chest", equipment: "dumbbells + bench",
    setup: "Lie on a flat bench, dumbbells over your chest, palms facing each other, slight bend in your elbows.",
    steps: [
      "Keeping that elbow bend fixed, open your arms wide until the weights are level with your chest.",
      "Squeeze your chest to bring them back together over you.",
    ],
  },
  {
    name: "DB Overhead Press", muscles: "shoulders", equipment: "dumbbells",
    setup: "Dumbbells just outside your shoulders, palms facing forward.",
    steps: [
      "Press overhead until your arms are straight.",
      "Pause, then lower slowly back to your shoulders.",
    ],
  },
  {
    name: "Barbell Push Press", muscles: "shoulders · legs", equipment: "barbell",
    setup: "Bar racked on the front of your shoulders, hands just outside shoulder-width.",
    steps: [
      "Dip your knees a few inches, then drive up with your legs and press the bar overhead in one motion.",
      "Lock out, then lower back to your shoulders under control.",
    ],
  },
  {
    name: "One-Arm Barbell Press", muscles: "shoulders · core", equipment: "barbell",
    setup: "Hold a barbell at shoulder level with one hand gripping the middle of the bar. Other arm straight out to the side as a counterbalance.",
    steps: [
      "Brace your abs and press the bar straight up — stabilize at the trunk and shoulder so the bar stays level.",
      "Your body shouldn't tilt either way. Softly lock out at the top.",
      "Return slowly to the start.",
    ],
  },
  {
    name: "Shoulder-to-Shoulder Press", muscles: "shoulders · core", equipment: "barbell",
    setup: "Barbell held lengthwise across one shoulder, hands staggered on the middle of the bar.",
    steps: [
      "Press the bar up and over your head, then lower it to the OTHER shoulder.",
      "Press it back the other way — every rep alternates sides.",
      "Swap which hand leads the stagger each set.",
    ],
  },
  {
    name: "Lateral Raise", muscles: "shoulders", equipment: "dumbbells",
    setup: "Dumbbells at your sides, slight bend in your knees and elbows.",
    steps: [
      "Raise your arms out to the sides until your hands are level with your shoulders.",
      "Pause, then lower under control — no swinging the weights up.",
    ],
  },

  /* ── pulls ── */
  {
    name: "Chin-Up", muscles: "back · biceps", equipment: "pull-up bar",
    setup: "Underhand grip at shoulder-width. Hang at arm's length, shoulder blades pulled down and back.",
    steps: [
      "Pull your chest to the bar.",
      "Pause at the top, then lower all the way back to a dead hang.",
    ],
  },
  {
    name: "Pull-Up", muscles: "back · biceps", equipment: "pull-up bar",
    setup: "Overhand grip just wider than shoulder-width. Hang at arm's length, shoulder blades down and back.",
    steps: [
      "Pull until your chin clears the bar.",
      "Lower under control to a full hang. Bands or an assist machine are fair game while you build to it.",
    ],
  },
  {
    name: "Weighted Chin-Up", muscles: "back · biceps", equipment: "pull-up bar + dumbbell or belt",
    setup: "Set a dumbbell on the floor under the bar and pinch it between your feet (or hang it from a belt). Underhand grip about shoulder-width, shoulder blades pulled down and back — shoulders away from your ears.",
    steps: [
      "Pull your chest to the bar.",
      "Hold the top for one second, then lower slowly.",
    ],
  },
  {
    name: "Barbell Bent-Over Row", muscles: "back", equipment: "barbell",
    setup: "Overhand grip at shoulder-width. Bend your torso to nearly parallel with the floor, knees slightly bent, lower back naturally arched.",
    steps: [
      "Squeeze your shoulder blades together and pull the bar to your upper abs.",
      "Pause, then return under control. Torso stays still — no heaving.",
    ],
  },
  {
    name: "Single-Arm DB Row", muscles: "back", equipment: "dumbbell + bench",
    setup: "Dumbbell in one hand, opposite hand braced on a bench, torso nearly parallel to the floor.",
    steps: [
      "Keeping your elbow close to your body, pull the dumbbell to your chest by squeezing your shoulder blade back.",
      "Pause, then lower.",
      "All reps on one arm, then switch.",
    ],
  },
  {
    name: "Inverted Row", muscles: "back · core", equipment: "bar in rack",
    setup: "Set a bar at waist height. Grab it overhand at shoulder-width and hang beneath it — arms straight, body straight from shoulders to ankles.",
    steps: [
      "Pull your shoulder blades back and lift your body until your chest touches the bar.",
      "Pause, then lower slowly. The straighter your body, the honester the rep.",
    ],
  },
  {
    name: "Seated Cable Row", muscles: "back", equipment: "cable row station",
    setup: "Sit tall at the row station, feet braced, chest up, handle at arm's length.",
    steps: [
      "Pull the handle to your torso, squeezing your shoulder blades together.",
      "Pause, then let it back out slowly — don't let the stack yank you forward.",
    ],
  },
  {
    name: "Upright Row", muscles: "shoulders · traps", equipment: "dumbbells",
    setup: "Weights in front of your thighs, overhand grip, standing tall.",
    steps: [
      "Pull straight up along your body to chest height — elbows lead the way, staying above your wrists.",
      "Pause, then lower under control.",
    ],
  },
  {
    name: "Face Pull", muscles: "rear shoulders · upper back", equipment: "cable + rope",
    setup: "Rope attachment set at face height. Grab both ends, arms extended, step back until the stack is live.",
    steps: [
      "Pull the rope toward your eyes, elbows driving high and wide.",
      "Squeeze your rear shoulders at the end, then resist it back out.",
    ],
  },
  {
    name: "Rear Delt Fly", muscles: "rear shoulders", equipment: "dumbbells",
    setup: "Hinge your torso to nearly parallel with the floor, dumbbells hanging below you, slight bend in your elbows.",
    steps: [
      "Raise your arms out to the sides, squeezing the back of your shoulders.",
      "Pause, then lower under control — light weight, honest reps.",
    ],
  },
  {
    name: "Dumbbell Shrug", muscles: "traps", equipment: "dumbbells",
    setup: "Heavy dumbbells at your sides, standing tall.",
    steps: [
      "Shrug your shoulders straight up toward your ears.",
      "Pause at the top, then lower. Straight up and down — no rolling.",
    ],
  },

  /* ── arms & calves ── */
  {
    name: "Biceps Curl", muscles: "biceps", equipment: "dumbbells",
    setup: "Dumbbells at your sides, palms facing forward, elbows pinned to your ribs.",
    steps: [
      "Curl the weights to your shoulders without moving your upper arms.",
      "Pause, then lower slowly.",
    ],
  },
  {
    name: "Barbell Curl", muscles: "biceps", equipment: "barbell",
    setup: "Underhand grip at shoulder-width, bar at arm's length, elbows pinned to your sides.",
    steps: [
      "Curl the bar to your shoulders — upper arms stay put.",
      "Lower slowly. Ride the tempo when the block calls one.",
    ],
  },
  {
    name: "Hammer Curl", muscles: "biceps · forearms", equipment: "dumbbells",
    setup: "Dumbbells at your sides, palms facing each other, elbows pinned.",
    steps: [
      "Curl the weights to your shoulders keeping the neutral grip.",
      "Pause, then lower under control.",
    ],
  },
  {
    name: "Reverse Curl", muscles: "forearms · biceps", equipment: "dumbbells",
    setup: "Dumbbells held overhand at shoulder-width, palms angled slightly in, hanging at arm's length in front of your waist.",
    steps: [
      "Keeping your upper arms pinned in place, bend your elbows and curl the weights toward your shoulders.",
      "Pause, then lower.",
    ],
  },
  {
    name: "Calf Raise", muscles: "calves", equipment: "barbell or dumbbells",
    setup: "Weight loaded, balls of your feet on the floor or the edge of a plate, standing tall.",
    steps: [
      "Rise up onto your toes as high as you can.",
      "Pause at the top, then lower slowly through the full stretch.",
    ],
  },
  {
    name: "Seated Calf Raise", muscles: "calves", equipment: "seated calf machine or bench + weight",
    setup: "Seated with the weight resting across your knees, balls of your feet on the platform.",
    steps: [
      "Raise your heels as high as you can.",
      "Pause, then lower slowly into the stretch.",
    ],
  },
];

/* ── movement families for the Program console library —
      boundaries mirror the section comments above ── */
const GROUP_BREAKS = [
  ["Goblet Squat", "squats & lunges"],
  ["Barbell Deadlift", "hinges & deadlifts"],
  ["Glute Bridge", "glutes & core"],
  ["Push-Up", "pushes"],
  ["Chin-Up", "pulls"],
  ["Biceps Curl", "arms & calves"],
];
export const EXERCISE_GROUPS = (() => {
  const groups = [];
  let current = null;
  for (const e of EXERCISES) {
    const brk = GROUP_BREAKS.find(([first]) => first === e.name);
    if (brk) { current = { id: brk[1], label: brk[1], exercises: [] }; groups.push(current); }
    if (current) current.exercises.push(e);
  }
  return groups;
})();

/* ── alias map: workout-definition names → canonical library entries ── */
const ALIASES = {
  /* signature lore moves → generic entries */
  "the spearpoint": "One-Arm Barbell Press",
  "the crown press": "Shoulder-to-Shoulder Press",
  "the kingmaker": "Two-Thirds Deadlift",
  /* naming variants used across phases */
  "squat": "Back Squat",
  "bent-over row": "Barbell Bent-Over Row",
  "flat db bench press": "Flat Chest Press",
  "incline db press": "Incline DB Chest Press",
  "seated row": "Seated Cable Row",
  "standing db overhead press": "DB Overhead Press",
  "barbell high pull": "High Pull",
  "kb swing": "Two-Arm KB Swing",
  "kettlebell rdl": "KB Romanian Deadlift",
};

const norm = (n) => String(n || "").trim().toLowerCase();
const BY_KEY = new Map(EXERCISES.map((e) => [norm(e.name), e]));

/* exerciseInfo("The Kingmaker") → the generic library entry, with the
   signature lore cue layered on when the name is a lore move. */
export function exerciseInfo(name) {
  const key = norm(name);
  const entry = BY_KEY.get(key) || BY_KEY.get(norm(ALIASES[key])) || null;
  if (!entry) return null;
  const move = moveByName(name);
  return move ? { ...entry, signature: move } : entry;
}

/* seconds for a hold exercise, parsed from its reps string ("30s", "45s",
   "30-45s", "max hold" → fallback) */
export function holdSeconds(repsStr, fallback = 30) {
  const m = String(repsStr || "").match(/(\d+)\s*s/i);
  return m ? Number(m[1]) : fallback;
}
