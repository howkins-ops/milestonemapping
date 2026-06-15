// World configuration — background selection by milestone progress state.
// Re-exports helpers from milestoneWorldAssets so consumers import from one place.
export {
  getMapBackground,
  getMilestoneBackground,
  milestoneWorldAssets,
  crystalFrontierAssets,
} from "../lib/milestoneWorldAssets.js";

// Named world themes — extend here to support multiple visual themes per project.
export const WORLD_THEMES = {
  crystalFrontier: {
    id: "crystalFrontier",
    label: "Crystal Frontier",
    description: "A journey through crystalline landscapes and glowing ruins.",
  },
};

// Default theme used when a project has no explicit theme set.
export const DEFAULT_THEME = WORLD_THEMES.crystalFrontier;
