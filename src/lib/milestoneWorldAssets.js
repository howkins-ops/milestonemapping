const BASE = "/assets/milestone-world";
const CF = "/assets/project-worlds/crystal-frontier";

export const milestoneWorldAssets = {
  backgrounds: {
    cosmic: `${BASE}/bg-cosmic-void.png`,
    emptyTrail: `${BASE}/bg-empty-trail-start.png`,
    floatingIslands: `${BASE}/bg-floating-islands-map.png`,
    fullTrail: `${BASE}/bg-full-trail-path.png`,
    goalAchieved: `${BASE}/bg-goal-achieved.png`,
    lockedFuture: `${BASE}/bg-locked-future-trail.png`,
    phoenixShrine: `${BASE}/bg-phoenix-shrine.png`,
    treasureTrail: `${BASE}/bg-treasure-trail.png`,
    treasureZone: `${BASE}/bg-treasure-zone.png`,
    projectCreate: `${BASE}/bg-project-create.png`,
  },
  avatars: {
    hoodedFront: `${BASE}/avatar-hooded-front.png`,
    hoodedBack: `${BASE}/avatar-hooded-back.png`,
    walkingTrail: `${BASE}/avatar-walking-trail.png`,
    victory: `${BASE}/avatar-victory.png`,
    portalGlow: `${BASE}/avatar-portal-glow.png`,
    mapMarker: `${BASE}/avatar-map-marker.png`,
  },
  icons: {
    maps: `${BASE}/main-card-maps-icon.png`,
    diamonds: `${BASE}/main-card-diamonds-icon.png`,
    streak: `${BASE}/main-card-streak-icon.png`,
  },
  portals: {
    active: `${BASE}/portal-active.png`,
    completed: `${BASE}/portal-completed.png`,
    locked: `${BASE}/portal-locked.png`,
    cyan: `${BASE}/portal-cyan-ring.png`,
    purple: `${BASE}/portal-purple-ring.png`,
  },
  trails: {
    active: `${BASE}/trail-active-glow.png`,
    completed: `${BASE}/trail-completed-glow.png`,
    locked: `${BASE}/trail-locked-fog.png`,
    straight: `${BASE}/trail-straight-glow.png`,
    brokenLocked: `${BASE}/trail-broken-locked.png`,
    curveLeft: `${BASE}/trail-curve-left.png`,
    curveRight: `${BASE}/trail-curve-right.png`,
    fork: `${BASE}/trail-fork.png`,
  },
};

export const crystalFrontierAssets = {
  map: {
    start: `${CF}/map/state-00-start.png`,
    m1Complete: `${CF}/map/state-02-m1-complete.png`,
    m2Complete: `${CF}/map/state-04-m2-complete.png`,
    m3Complete: `${CF}/map/state-06-m3-complete.png`,
    m4Complete: `${CF}/map/state-08-m4-complete.png`,
    finalGoal: `${CF}/map/state-11-final-goal.png`,
    worldComplete: `${CF}/map/state-12-world-complete.png`,
  },
  milestones: {
    m1: `${CF}/milestones/milestone-01-world.png`,
    m2: `${CF}/milestones/milestone-02-world.png`,
    m3: `${CF}/milestones/milestone-03-world.png`,
    m4: `${CF}/milestones/milestone-04-world.png`,
    m5: `${CF}/milestones/milestone-05-world.png`,
    m1Complete: `${CF}/milestones/milestone-01-complete.png`,
    m2Complete: `${CF}/milestones/milestone-02-complete.png`,
    m3Complete: `${CF}/milestones/milestone-03-complete.png`,
    m4Complete: `${CF}/milestones/milestone-04-complete.png`,
    m5Complete: `${CF}/milestones/milestone-05-complete.png`,
  },
  final: {
    finalGoal: `${CF}/final/final-goal-world.png`,
    finalAchieved: `${CF}/final/final-goal-achieved.png`,
    congratulations: `${CF}/final/congratulations-world-complete.png`,
  },
};

const MAP_SLOTS = [
  "start",
  "m1Complete",
  "m2Complete",
  "m3Complete",
  "m4Complete",
];

export function getMapBackground(completedCount, allDone, finalGoalActive) {
  if (allDone) return crystalFrontierAssets.map.worldComplete;
  if (finalGoalActive) return crystalFrontierAssets.map.finalGoal;
  const key = MAP_SLOTS[Math.min(completedCount, MAP_SLOTS.length - 1)];
  return crystalFrontierAssets.map[key];
}

const MS_KEYS = ["m1", "m2", "m3", "m4", "m5"];

export function getMilestoneBackground(index, isComplete) {
  const slot = MS_KEYS[index % MS_KEYS.length];
  return isComplete
    ? crystalFrontierAssets.milestones[`${slot}Complete`]
    : crystalFrontierAssets.milestones[slot];
}
