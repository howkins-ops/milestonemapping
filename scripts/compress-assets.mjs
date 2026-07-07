// Recompress public/ images in place for the App Store build.
// PNGs are palette-quantized (same filename, same format — no code changes);
// a file is only overwritten when the result is ≥15% smaller. Originals are
// recoverable from git. Usage: node scripts/compress-assets.mjs [--dry]
//
// JPGs are re-encoded at quality 80 with mozjpeg. Skips public/legal/.

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PUBLIC = join(ROOT, "public");
const DRY = process.argv.includes("--dry");
const MIN_SAVING = 0.15;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "legal") continue;
      out.push(...walk(full));
    } else out.push(full);
  }
  return out;
}

let before = 0, after = 0, changed = 0, skipped = 0, failed = 0;
const files = walk(PUBLIC).filter((f) => /\.(png|jpe?g)$/i.test(f));
console.log(`${files.length} images to consider…`);

for (const file of files) {
  const rel = relative(PUBLIC, file).split(sep).join("/");
  const orig = statSync(file).size;
  before += orig;
  try {
    const input = readFileSync(file);
    const isPng = /\.png$/i.test(file);
    const out = isPng
      ? await sharp(input).png({ palette: true, quality: 80, effort: 8 }).toBuffer()
      : await sharp(input).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
    if (out.length < orig * (1 - MIN_SAVING)) {
      if (!DRY) writeFileSync(file, out);
      after += out.length;
      changed++;
      if (orig > 1048576) {
        console.log(`  ${(orig / 1048576).toFixed(1)}MB → ${(out.length / 1048576).toFixed(1)}MB  ${rel}`);
      }
    } else {
      after += orig;
      skipped++;
    }
  } catch (err) {
    after += orig;
    failed++;
    console.error(`  FAILED ${rel}: ${err.message}`);
  }
}

const mb = (b) => (b / 1048576).toFixed(1) + " MB";
console.log(`\n${DRY ? "[DRY RUN] " : ""}Done: ${changed} compressed, ${skipped} already tight, ${failed} failed`);
console.log(`Total: ${mb(before)} → ${mb(after)}  (saved ${mb(before - after)})`);
