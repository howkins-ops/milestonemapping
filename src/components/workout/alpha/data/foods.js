/* ALPHA MODE — the food inventory (the in-app "equip a meal" picker
   and the Stockpile grocery engine's vocabulary). Category structure
   from the content bible: proteins, free veggies (unlimited, never
   counted), fats, low-GI carbs. Curated representative items —
   expandable without touching the engine. */

export const FOOD_CATEGORIES = [
  {
    id: "protein",
    label: "Proteins",
    rule: "the anchor of every meal",
    groups: [
      { id: "beef", label: "Beef", items: ["Ground beef (90/10)", "Sirloin steak", "Flank steak", "Roast beef"] },
      { id: "poultry", label: "Poultry", items: ["Chicken breast", "Chicken thighs", "Ground turkey", "Turkey breast"] },
      { id: "pork-lamb", label: "Pork & Lamb", items: ["Pork tenderloin", "Pork chops", "Lamb chops"] },
      { id: "fish", label: "Fish", items: ["Salmon", "Tuna (canned)", "Cod", "Tilapia", "Sardines"] },
      { id: "shellfish", label: "Shellfish", items: ["Shrimp", "Scallops", "Mussels"] },
      { id: "eggs-dairy", label: "Eggs & Dairy", items: ["Whole eggs", "Egg whites", "Greek yogurt", "Cottage cheese", "Protein powder"] },
    ],
  },
  {
    id: "free-veg",
    label: "Free Veggies",
    rule: "unlimited, anytime — never counted",
    groups: [
      {
        id: "free", label: "Always Free",
        items: ["Spinach", "Broccoli", "Cauliflower", "Zucchini", "Peppers", "Mushrooms",
          "Asparagus", "Green beans", "Cucumber", "Celery", "Kale", "Cabbage", "Lettuce", "Tomatoes"],
      },
    ],
  },
  {
    id: "fat",
    label: "Fats",
    rule: "one serving ≈ 14g fat",
    groups: [
      { id: "oils", label: "Oils", items: ["Olive oil", "Coconut oil", "Butter", "Avocado oil"] },
      { id: "nuts", label: "Nuts & Seeds", items: ["Almonds", "Walnuts", "Peanut butter", "Chia seeds", "Pumpkin seeds"] },
      { id: "whole", label: "Whole-Food Fats", items: ["Avocado", "Olives", "Whole eggs", "Cheese"] },
    ],
  },
  {
    id: "carb",
    label: "Low-GI Carbs",
    rule: "timed late — post-workout and toward night",
    groups: [
      { id: "grains", label: "Grains", items: ["Oatmeal", "Brown rice", "Quinoa", "Whole-grain bread", "Whole-wheat pasta"] },
      { id: "starchy", label: "Starchy Veg", items: ["Sweet potato", "White potato", "Squash", "Corn"] },
      { id: "legumes", label: "Legumes", items: ["Black beans", "Chickpeas", "Lentils", "Peas"] },
      { id: "fruit", label: "Fruits", items: ["Apples", "Berries", "Bananas", "Oranges"] },
    ],
  },
];

/* game-simple conversion heuristics for the grocery engine —
   guide-level numbers, not nutrition tables */
export const GROCERY_HEURISTICS = {
  proteinPerLbMeat: 100,   // ~100g protein per lb of lean meat/fish
  proteinPerEgg: 6,
  carbsPerCupCooked: 40,   // rice/oats/potato per cooked cup
  fatPerServing: 14,
  freeVegBagsPerWeek: 4,   // fixed floor — always stock the green wall
};

/* Sunday prep ritual — the guide steps behind Fill Your Fridge */
export const PREP_STEPS = [
  { id: "plan", label: "Read the week", line: "Check the schedule: how many training days, when the carbs land, where the cheat day sits." },
  { id: "shop", label: "Raid the market", line: "Buy the list. Nothing that isn't on it — the fridge is the loadout screen." },
  { id: "proteins", label: "Batch the anchors", line: "Cook proteins in bulk — grill, oven, one pan. Portion by meal." },
  { id: "veg", label: "Build the green wall", line: "Wash and chop the free veggies. Eye-level shelf. Free means visible." },
  { id: "carbs", label: "Portion the fuel", line: "Cook carbs, then portion them to TRAINING days only. Label the lids." },
  { id: "shake", label: "Stage the shake rack", line: "Line up post-workout shakes — the 30g window shouldn't require thinking." },
  { id: "stock", label: "Stock the fridge", line: "Everything in its shelf. Shut the door. That clunk is the week locking in." },
];
