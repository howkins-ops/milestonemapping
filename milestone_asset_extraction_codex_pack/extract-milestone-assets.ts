
/**
 * Minimal manual cropper for Codex to adapt.
 * Install sharp first:
 *   npm i -D sharp tsx
 *
 * Run:
 *   npx tsx scripts/extract-milestone-assets.ts
 */

import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

type Crop = { name: string; x: number; y: number; w: number; h: number };
type BoardConfig = { source: string; outputDir: string; crops: Crop[] };
type Config = Record<string, BoardConfig>;

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function main() {
  const configPath = path.join(process.cwd(), "scripts", "asset-crop-config.json");
  const raw = await fs.readFile(configPath, "utf8");
  const config = JSON.parse(raw) as Config;

  for (const [boardName, board] of Object.entries(config)) {
    const sourcePath = path.join(process.cwd(), board.source.replace(/^\//, ""));
    const outputDir = path.join(process.cwd(), board.outputDir.replace(/^\//, ""));
    await ensureDir(outputDir);

    for (const crop of board.crops) {
      const out = path.join(outputDir, `${crop.name}.png`);
      await sharp(sourcePath)
        .extract({ left: crop.x, top: crop.y, width: crop.w, height: crop.h })
        .png({ quality: 100 })
        .toFile(out);

      console.log(`✅ ${boardName} → ${crop.name}.png`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
