export const INTENSITY_LEVELS = [
  { level: 1, value: 2, label: "Present" },
  { level: 2, value: 4, label: "Pulling" },
  { level: 3, value: 6, label: "Loud" },
  { level: 4, value: 8, label: "Roaring" },
  { level: 5, value: 10, label: "Immediate danger" },
];

export const URGE_FORMS = [
  "Mental image", "Body pull", "Negotiating thought", "Emotion",
  "Habit / autopilot", "Easy access", "Boredom",
];

export const RISK_LEVELS = [
  { id: "crossed", label: "It crossed my mind" },
  { id: "negotiating", label: "I’m actively negotiating" },
  { id: "one-action", label: "I’m one action away" },
  { id: "happened", label: "It has already happened" },
];

export const THOUGHT_TYPES = [
  "A prediction", "An excuse", "A command", "A memory", "An image", "A permission slip",
];

export const TRACK_BATTLE = {
  weed: {
    cueActions: ["I moved it out of reach", "I moved myself to a different place", "I can’t safely move right now"],
    safetyActions: ["Move away from the cue", "Contact someone real", "Walk or stretch if it feels safe"],
    nextActions: ["Walk outside", "Go to the gym", "Dispose of the cue", "Prepare food", "Meet someone", "Drink water somewhere else"],
    signals: ["Just once", "You need relief", "Start tomorrow", "You already bought it", "You deserve it", "You can stop after"],
    anchors: ["Clear morning", "My word", "Tomorrow’s energy", "Presence", "Freedom", "What I’m building"],
  },
  porn: {
    cueActions: ["I put the device out of reach", "I moved into a visible space", "I can’t safely move right now"],
    safetyActions: ["Put the device outside the room", "Move into a shared space", "Contact someone real"],
    nextActions: ["Phone in another room", "Walk outside", "Go to the gym", "Enter a shared space", "Start an offline task", "Meet someone"],
    signals: ["Just look", "No one knows", "It doesn’t count", "Start tomorrow", "You deserve it", "Tonight is different"],
    anchors: ["Real connection", "My word", "Tomorrow’s energy", "Presence", "Freedom", "Real life"],
  },
};

export const ROUND_COPY = [
  { title: "Cut the loop", instruction: "Sever the permission slips.", duration: 36 },
  { title: "Protect what is real", instruction: "Cut the noise. Protect what matters.", duration: 48 },
  { title: "Break the pattern", instruction: "Wait for the second pulse. Then cut the excuses.", duration: 60 },
];

export function resultCopy(start, end) {
  if (!Number.isFinite(start) || !Number.isFinite(end)) return "You checked the signal honestly. That is useful data.";
  const delta = start - end;
  if (delta >= 3) return `The urge moved from ${start} to ${end}. You created room to choose.`;
  if (delta > 0) return `It moved from ${start} to ${end}, even if only slightly. Stay with the process.`;
  if (delta === 0) return `It is still at ${end}. That is data—not failure. We change tactics now.`;
  return `It moved from ${start} to ${end}. Stop fighting it alone and change the environment.`;
}

export function comboLabel(combo) {
  if (combo >= 10) return "CLEAR CHOICE";
  if (combo >= 6) return "DISTANCE";
  if (combo >= 3) return "INTERRUPTED";
  return "FOCUS";
}
