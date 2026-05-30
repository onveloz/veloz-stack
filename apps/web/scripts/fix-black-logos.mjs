#!/usr/bin/env node
/**
 * Many SVG logos on svgl use `fill="black"` or omit fill entirely (defaults
 * black) — invisible on our dark theme. This rewrites those to white in place.
 *
 * Rules:
 *   1. `fill="black"`, `fill="#000"`, `fill="#000000"` → `fill="#ffffff"`
 *   2. `stroke="black"` / `#000` → `#ffffff`
 *   3. If the root <svg> has no `fill` attribute, inject `fill="#ffffff"`.
 *   4. Skip files that already contain a non-black fill (e.g. brand colors).
 *
 * Safe to re-run.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, "..", "public", "logos");

function repaint(svg) {
  let out = svg;

  // 1. Repaint explicit black fills/strokes
  out = out.replace(/fill=("(?:black|#000|#000000|#111111?|#222222?)")/gi, 'fill="#ffffff"');
  out = out.replace(/stroke=("(?:black|#000|#000000|#111111?|#222222?)")/gi, 'stroke="#ffffff"');

  // 2. Inject fill on root <svg> if missing
  const svgTag = out.match(/<svg[^>]*>/);
  if (svgTag && !/fill=/.test(svgTag[0])) {
    out = out.replace(/<svg/, '<svg fill="#ffffff"');
  }

  return out;
}

function hasGradientPaint(svg) {
  return /<(?:linear|radial)Gradient/i.test(svg) || /fill="url\s*\(#/i.test(svg);
}

function isMostlyColored(svg) {
  // Any non-black hex or named color beyond black/white counts as "colored"
  const fills = svg.match(/(fill|stroke)="[^"]+"/gi) ?? [];
  for (const f of fills) {
    const v = f
      .replace(/^(fill|stroke)="/i, "")
      .replace(/"$/, "")
      .toLowerCase();
    if (v === "none" || v === "currentcolor") continue;
    if (v === "black" || v === "#000" || v === "#000000") continue;
    if (v === "white" || v === "#fff" || v === "#ffffff") continue;
    if (v.startsWith("url(")) continue;
    return true;
  }
  return false;
}

async function main() {
  const files = (await readdir(DIR)).filter((f) => f.endsWith(".svg"));
  const fixed = [];
  const skipped = [];

  for (const f of files) {
    const path = join(DIR, f);
    const orig = await readFile(path, "utf8");

    // Gradients / brand marks (e.g. Next.js) must not be flattened to white.
    if (isMostlyColored(orig) || hasGradientPaint(orig)) {
      skipped.push(f);
      continue;
    }

    const next = repaint(orig);
    if (next !== orig) {
      await writeFile(path, next, "utf8");
      fixed.push(f);
    }
  }

  console.log(`Fixed ${fixed.length}:`);
  for (const f of fixed) console.log(`  ✓ ${f}`);
  if (skipped.length > 0) {
    console.log(`\nSkipped ${skipped.length} (already have brand colors).`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
