
# CODEX TASK — MILESTONE MAPPING GAME ASSET EXTRACTION SYSTEM

You are not rebuilding these boards as one image. You are turning the uploaded storyboard boards into a real reusable game asset library.

## Goal

Take the provided board images and extract every usable asset into individual labeled PNG files so the app can use them independently.

The boards are asset atlases. Treat them like sprite sheets / production sheets.

## Source Boards

Use the uploaded files:

1. Board 01 — Milestone Nodes
2. Board 02 — Treasure System
3. Board 04 — Phoenix Shrine
4. Board 05 — Identity Shift Cards

Do not treat these as background images. Each icon, card, node, chest, reward, shrine, phoenix, platform, and UI panel needs to become its own reusable asset.

---

## Output Folder Structure

Create this exact structure:

```txt
/public/assets/milestone-mapping/
  boards/
    board-01-milestone-nodes.png
    board-02-treasure-system.png
    board-04-phoenix-shrine.png
    board-05-identity-shift-cards.png

  extracted/
    milestone-nodes/
      empty-node.png
      empty-node-variant-01.png
      hover-node.png
      active-node.png
      complete-node.png
      locked-node.png
      hidden-node.png
      diamond-node.png
      treasure-node.png
      phoenix-node.png
      final-goal-node.png

    treasure-system/
      small-chest-closed.png
      small-chest-opening.png
      small-chest-open.png
      medium-chest-closed.png
      medium-chest-opening.png
      medium-chest-open.png
      epic-chest-closed.png
      epic-chest-opening.png
      epic-chest-open.png
      legendary-chest-closed.png
      legendary-chest-opening.png
      legendary-chest-open.png
      xp-burst.png
      gold-reward.png
      diamond-reward.png
      phoenix-reward.png
      reward-popup-xp.png
      reward-popup-gold.png
      reward-popup-diamond.png
      reward-popup-phoenix.png

    phoenix-shrine/
      dormant-shrine.png
      awakened-shrine.png
      phoenix-appears.png
      phoenix-rising.png
      phoenix-ascended.png
      shrine-complete.png
      phoenix-flames.png
      phoenix-wings.png
      phoenix-aura.png
      rebirth-swirl.png
      ascension-beam.png
      shrine-icon.png
      active-icon.png
      complete-icon.png

    identity-shift/
      broke-king-front.png
      broke-king-card-back.png
      broke-king-shift.png
      broke-king-reward.png
      broke-king-activated.png
      broke-king-legendary.png
      addict-saint-front.png
      addict-saint-card-back.png
      addict-saint-shift.png
      addict-saint-reward.png
      addict-saint-activated.png
      addict-saint-legendary.png
      wasted-genius-front.png
      wasted-genius-card-back.png
      wasted-genius-shift.png
      wasted-genius-reward.png
      wasted-genius-activated.png
      wasted-genius-legendary.png
      raging-victim-front.png
      raging-victim-card-back.png
      raging-victim-shift.png
      raging-victim-reward.png
      raging-victim-activated.png
      raging-victim-legendary.png
      naive-warrior-front.png
      naive-warrior-card-back.png
      naive-warrior-shift.png
      naive-warrior-reward.png
      naive-warrior-activated.png
      naive-warrior-legendary.png

  manifest/
    asset-manifest.json
    asset-manifest.ts
```

---

## Important Rules

1. DO NOT place the full board images directly into the UI except inside a dev-only reference page.
2. Every visible item on the boards should be cropped into its own PNG.
3. Preserve the original art quality as much as possible.
4. Keep black/neon background where needed, but crop tight around the object.
5. For UI cards, crop the entire card including its border.
6. For icons/items, crop with padding.
7. File names must be lowercase kebab-case.
8. Every extracted asset must be registered in the manifest.
9. Build a dev preview page that shows all extracted assets grouped by category.
10. If automatic cropping fails, create a manual crop config JSON with editable coordinates.

---

## Recommended Implementation

Create these files:

```txt
/scripts/extract-milestone-assets.ts
/scripts/asset-crop-config.json
/scripts/generate-asset-manifest.ts
/app/dev/assets/page.tsx
/lib/assets/milestoneAssets.ts
```

### asset-crop-config.json

Use a manual config like this:

```json
{
  "board-01-milestone-nodes": {
    "source": "/public/assets/milestone-mapping/boards/board-01-milestone-nodes.png",
    "outputDir": "/public/assets/milestone-mapping/extracted/milestone-nodes",
    "crops": [
      { "name": "empty-node", "x": 20, "y": 110, "w": 500, "h": 215 },
      { "name": "hover-node", "x": 540, "y": 110, "w": 500, "h": 215 },
      { "name": "active-node", "x": 1060, "y": 110, "w": 500, "h": 215 }
    ]
  }
}
```

Start with approximate coordinates, then refine by visually checking the preview page.

---

## Asset Manifest Format

Generate a manifest like this:

```ts
export const milestoneAssets = {
  milestoneNodes: {
    emptyNode: "/assets/milestone-mapping/extracted/milestone-nodes/empty-node.png",
    activeNode: "/assets/milestone-mapping/extracted/milestone-nodes/active-node.png",
    completeNode: "/assets/milestone-mapping/extracted/milestone-nodes/complete-node.png",
    lockedNode: "/assets/milestone-mapping/extracted/milestone-nodes/locked-node.png",
    diamondNode: "/assets/milestone-mapping/extracted/milestone-nodes/diamond-node.png",
    treasureNode: "/assets/milestone-mapping/extracted/milestone-nodes/treasure-node.png",
    phoenixNode: "/assets/milestone-mapping/extracted/milestone-nodes/phoenix-node.png",
    finalGoalNode: "/assets/milestone-mapping/extracted/milestone-nodes/final-goal-node.png"
  },

  treasure: {
    smallClosed: "/assets/milestone-mapping/extracted/treasure-system/small-chest-closed.png",
    smallOpen: "/assets/milestone-mapping/extracted/treasure-system/small-chest-open.png",
    legendaryOpen: "/assets/milestone-mapping/extracted/treasure-system/legendary-chest-open.png",
    xpBurst: "/assets/milestone-mapping/extracted/treasure-system/xp-burst.png",
    diamondReward: "/assets/milestone-mapping/extracted/treasure-system/diamond-reward.png",
    phoenixReward: "/assets/milestone-mapping/extracted/treasure-system/phoenix-reward.png"
  },

  phoenixShrine: {
    dormant: "/assets/milestone-mapping/extracted/phoenix-shrine/dormant-shrine.png",
    awakened: "/assets/milestone-mapping/extracted/phoenix-shrine/awakened-shrine.png",
    rising: "/assets/milestone-mapping/extracted/phoenix-shrine/phoenix-rising.png",
    ascended: "/assets/milestone-mapping/extracted/phoenix-shrine/phoenix-ascended.png",
    complete: "/assets/milestone-mapping/extracted/phoenix-shrine/shrine-complete.png"
  },

  identityShift: {
    brokeKing: {
      front: "/assets/milestone-mapping/extracted/identity-shift/broke-king-front.png",
      back: "/assets/milestone-mapping/extracted/identity-shift/broke-king-card-back.png",
      shift: "/assets/milestone-mapping/extracted/identity-shift/broke-king-shift.png",
      reward: "/assets/milestone-mapping/extracted/identity-shift/broke-king-reward.png",
      activated: "/assets/milestone-mapping/extracted/identity-shift/broke-king-activated.png",
      legendary: "/assets/milestone-mapping/extracted/identity-shift/broke-king-legendary.png"
    }
  }
};
```

---

## Dev Preview Page

Create `/app/dev/assets/page.tsx`.

The page should:

- Show each category.
- Display every cropped asset.
- Show filename under each asset.
- Include copy path button.
- Include source board reference above each group.
- Make it easy to visually confirm if a crop is wrong.

---

## Milestone Mapping UI Usage

After extraction, replace hardcoded placeholder art with these real assets:

- Milestone node cards use `/milestone-nodes`.
- Reward modal uses `/treasure-system`.
- Transformation section uses `/phoenix-shrine`.
- Identity Shift card game uses `/identity-shift`.

Do not import board images into production components. Use only the extracted individual assets.

---

## Acceptance Criteria

The task is complete when:

1. The source boards are copied into `/public/assets/milestone-mapping/boards`.
2. Individual cropped assets exist in `/public/assets/milestone-mapping/extracted`.
3. `asset-manifest.json` and `asset-manifest.ts` are generated.
4. `/app/dev/assets/page.tsx` displays every asset clearly.
5. The actual Milestone Mapping app can import assets by name instead of using one giant image.
6. Cropping config is editable so we can quickly fix bad crops.
7. No board image is used as a production UI image.
8. The extracted assets are grouped, named, and reusable.
