// Audit public/ for orphaned assets before the App Store build.
// Usage: node scripts/audit-assets.mjs [--json out.json]
//
// Three verdicts per file:
//   USED    — exact filename appears in src/, index.html, or public/*.html
//   DYNAMIC — filename never appears, but its folder is referenced by code
//             that constructs paths (e.g. `${ASSET_BASE}${slug}.png`), so it
//             may be loaded at runtime. Verify by hand before deleting.
//   ORPHAN  — neither the file nor its folder is referenced anywhere.

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PUBLIC = join(ROOT, "public");

function walk(dir, exts = null) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      out.push(...walk(full, exts));
    } else if (!exts || exts.some((e) => entry.name.toLowerCase().endsWith(e))) {
      out.push(full);
    }
  }
  return out;
}

// Build the searchable code corpus.
const codeFiles = [
  ...walk(join(ROOT, "src"), [".js", ".jsx", ".css"]),
  join(ROOT, "index.html"),
  ...walk(PUBLIC, [".html", ".json"]),
];
const corpus = codeFiles.map((f) => readFileSync(f, "utf8")).join("\n");

// Folders referenced anywhere in code (covers `${BASE}file.png` constructions).
const dirRefs = new Set();
for (const m of corpus.matchAll(/["'`]\/?((?:assets|images|audio|game|shifts|daily|legal)[\w\-/]*)\/?/g)) {
  dirRefs.add(m[1].replace(/\/$/, ""));
}

const rows = [];
for (const file of walk(PUBLIC)) {
  const rel = relative(PUBLIC, file).split(sep).join("/");
  const name = rel.split("/").pop();
  const size = statSync(file).size;
  let verdict = "ORPHAN";
  if (corpus.includes(name)) verdict = "USED";
  else {
    const dir = rel.split("/").slice(0, -1).join("/");
    for (const ref of dirRefs) {
      if (dir === ref || dir.startsWith(ref + "/")) { verdict = "DYNAMIC"; break; }
    }
  }
  rows.push({ rel, size, verdict });
}

const fmtMB = (b) => (b / 1048576).toFixed(1).padStart(7) + " MB";
const byVerdict = (v) => rows.filter((r) => r.verdict === v);

for (const v of ["ORPHAN", "DYNAMIC", "USED"]) {
  const set = byVerdict(v);
  const total = set.reduce((s, r) => s + r.size, 0);
  console.log(`\n=== ${v}: ${set.length} files, ${fmtMB(total)} ===`);
  if (v !== "USED") {
    for (const r of set.sort((a, b) => b.size - a.size).slice(0, 40)) {
      console.log(`${fmtMB(r.size)}  public/${r.rel}`);
    }
    if (set.length > 40) console.log(`  … and ${set.length - 40} more`);
  }
}

const jsonIdx = process.argv.indexOf("--json");
if (jsonIdx !== -1 && process.argv[jsonIdx + 1]) {
  writeFileSync(process.argv[jsonIdx + 1], JSON.stringify(rows, null, 2));
  console.log(`\nFull report written to ${process.argv[jsonIdx + 1]}`);
}
