#!/usr/bin/env node
/**
 * Verify relative markdown links resolve to files in the repo.
 * Skips http(s), mailto, and anchor-only targets.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

/** @param {string} dir */
function listMarkdown(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      ent.name === "node_modules" ||
      ent.name === ".git" ||
      ent.name === "dist"
    ) {
      continue;
    }
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      listMarkdown(p, acc);
    } else if (ent.name.endsWith(".md")) {
      acc.push(p);
    }
  }
  return acc;
}

const SKIP_PREFIXES = [
  "docs/plans/archive/",
  "packages/template-generator/templates/",
];

const linkRe = /\[[^\]]+\]\(([^)]+)\)/g;
let failures = 0;

for (const file of listMarkdown(ROOT)) {
  const relFile = path.relative(ROOT, file);
  if (SKIP_PREFIXES.some((p) => relFile.startsWith(p))) {
    continue;
  }
  const text = fs.readFileSync(file, "utf8");
  const dir = path.dirname(file);
  for (const m of text.matchAll(linkRe)) {
    const raw = m[1].trim();
    if (
      !raw ||
      raw.startsWith("http") ||
      raw.startsWith("mailto:") ||
      raw.startsWith("#")
    ) {
      continue;
    }
    const [withoutHash = ""] = raw.split("#");
    const [target = ""] = withoutHash.split("?");
    if (!target) {
      continue;
    }
    const resolved = path.resolve(dir, decodeURIComponent(target));
    if (!fs.existsSync(resolved)) {
      console.error(`✗ ${path.relative(ROOT, file)} → missing: ${raw}`);
      failures++;
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} broken relative link(s).`);
  process.exit(1);
}
console.log("✓ All checked markdown relative links exist.");
