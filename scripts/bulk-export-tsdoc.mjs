#!/usr/bin/env node
/**
 * One-off helper: prepend a one-line JSDoc to exported declarations missing docs.
 * Usage: node scripts/bulk-export-tsdoc.mjs <dir> [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? ".");
const dryRun = process.argv.includes("--dry-run");
const DOC_BY_KIND = {
  function: "/** @internal Scaffold pipeline step. */",
  const: "/** @internal Scaffold export. */",
  interface: "/** @internal Generated-app type. */",
  type: "/** @internal Generated-app type. */",
};

function hasDocAbove(lines, idx) {
  let j = idx - 1;
  while (j >= 0 && lines[j].trim() === "") {
    j--;
  }
  if (j < 0) {
    return false;
  }
  const t = lines[j].trim();
  if (t.endsWith("*/")) {
    return true;
  }
  if (t.startsWith("//")) {
    return false;
  }
  if (t.startsWith("*") || t.startsWith("/**")) {
    return true;
  }
  return false;
}

function kindFromExport(line) {
  if (/^export\s+(async\s+)?function\s/.test(line)) {
    return "function";
  }
  if (/^export\s+(const|let)\s/.test(line)) {
    return "const";
  }
  if (/^export\s+interface\s/.test(line)) {
    return "interface";
  }
  if (/^export\s+type\s/.test(line)) {
    return "type";
  }
  if (/^export\s+\{/.test(line)) {
    return "const";
  }
  return null;
}

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (
      ent.name === "node_modules" ||
      ent.name === "dist" ||
      ent.name === ".turbo" ||
      ent.name === ".next"
    ) {
      continue;
    }
    if (ent.isDirectory()) {
      walk(p, out);
    } else if (/\.tsx?$/.test(ent.name) && !ent.name.endsWith(".d.ts")) {
      out.push(p);
    }
  }
  return out;
}

let changed = 0;
for (const file of walk(root)) {
  const rel = path.relative(process.cwd(), file);
  if (rel.includes("templates.generated")) {
    continue;
  }
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split("\n");
  let dirty = false;
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const kind = kindFromExport(line);
    if (kind && !hasDocAbove(lines, i)) {
      const doc = rel.includes("templates/ui/shadcn")
        ? "/** shadcn/ui primitive copied into generated apps. */"
        : DOC_BY_KIND[kind];
      out.push(doc);
      dirty = true;
    }
    out.push(line);
  }
  if (dirty) {
    changed++;
    const next = `${out.join("\n")}\n`;
    if (!dryRun) {
      fs.writeFileSync(file, next, "utf8");
    }
    console.log(dryRun ? "[dry-run] " : "", rel);
  }
}
console.log(`\n${dryRun ? "Would update" : "Updated"} ${changed} file(s).`);
