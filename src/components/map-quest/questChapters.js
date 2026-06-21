export const QUEST_CHAPTERS = [
  {
    key: "chapter-anchor",
    number: 1,
    title: "The Anchor",
    subtitle: "Find your why before the forest gets loud.",
    reward: "Anchor mentor",
    type: "Story + coaching",
    cardImage: "/assets/map-quest/chapter-anchor-card.png",
    available: true,
    saveKey: "milestone-quest:anchor-v1",
  },
  {
    key: "chapter-shadow",
    number: 2,
    title: "The Shadow",
    subtitle: "Meet the first mask walking beside you.",
    reward: "Shadow journal",
    type: "Story + exercise",
    cardImage: "/assets/map-quest/chapter-shadow-card.png",
    available: true,
    requires: "chapter-anchor",
    saveKey: "milestone-quest:shadow-v3",
  },
  {
    key: "chapter-alchemy",
    number: 3,
    title: "The Alchemy",
    subtitle: "Reforge the old story into Power.",
    reward: "Essence: Power",
    type: "Story + forge",
    cardImage: "/assets/map-quest/chapter-alchemy-card.png",
    available: true,
    requires: "chapter-shadow",
    saveKey: "milestone-quest:alchemy-v1",
  },
  {
    key: "chapter-integration",
    number: 4,
    title: "The Integration",
    subtitle: "Bring the lesson back into the real project.",
    reward: "Quest completion",
    type: "Coming soon",
    cardImage: "/assets/map-quest/chapter-integration-card.png",
    available: false,
    requires: "chapter-alchemy",
  },
];

export function getChapterByKey(key) {
  return QUEST_CHAPTERS.find((chapter) => chapter.key === key);
}
