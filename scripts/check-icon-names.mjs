#!/usr/bin/env bun
/**
 * Fails the build when a configuration names an icon the registry does not have.
 *
 * `ICON_REGISTRY[name]` misses return `null`, so a typo is a silently blank
 * cell rather than an error — the dashboard shipped with four of them
 * (`add-box`, `rate-review`, `trending-up`, `auto-awesome`), each an empty tile
 * nobody noticed. This turns that into a build failure.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const REGISTRY = "packages/shared/src/components/renderers/icon-renderer.tsx";
const ROOTS = ["packages/modules", "packages/configurations/src", "packages/shared/src"];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (entry === "node_modules") continue;
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.(ts|tsx)$/.test(path)) out.push(path);
  }
  return out;
}

const registrySource = readFileSync(REGISTRY, "utf8");
const known = new Set(
  [...registrySource.matchAll(/^\s+"?([A-Za-z][\w-]*)"?:\s*\w+,\s*$/gm)].map((m) => m[1]),
);

// `icon: "x"` names a glyph. Three things wear the same key and are not glyphs:
// a data path inside a `paths` block, and — in the renderers' own tone maps — a
// CSS colour or a palette token.
const NOT_A_GLYPH = /^(var\(|#)|[.(]/;

const misses = [];
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const source = readFileSync(file, "utf8");
    const pathBlocks = [...source.matchAll(/paths:\s*\{[^}]*\}/g)].map((m) => m[0]).join("\n");
    for (const match of source.matchAll(/\bicon:\s*"([^"]+)"/g)) {
      const name = match[1];
      if (known.has(name) || NOT_A_GLYPH.test(name)) continue;
      if (pathBlocks.includes(`icon: "${name}"`)) continue;
      misses.push({ file, name });
    }
  }
}

if (misses.length) {
  console.error(`\n${misses.length} unknown icon name(s) — these render as nothing:\n`);
  for (const { file, name } of misses) console.error(`  ${name}  ${file}`);
  console.error(`\nAdd them to ICON_REGISTRY in ${REGISTRY}, or fix the spelling.\n`);
  process.exit(1);
}
console.log(`check:icons — ${known.size} registered, no unknown names.`);
