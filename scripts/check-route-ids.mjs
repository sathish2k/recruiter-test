#!/usr/bin/env bun
/**
 * Fails the build when a configuration links to a route that does not exist.
 *
 * `usePortalRouter().getPathFromRouteId` returns nothing for an unknown id, so
 * a stale `routeId` is a link that silently goes nowhere — the same failure
 * mode as an unknown icon name. The dashboard, the appbar and two detail
 * headers all shipped one.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROUTES = "packages/configurations/src/routes.ts";
const ROOTS = ["packages/modules", "packages/configurations/src"];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (entry === "node_modules") continue;
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.(ts|tsx)$/.test(path)) out.push(path);
  }
  return out;
}

const known = new Set(
  [...readFileSync(ROUTES, "utf8").matchAll(/\bid:\s*"([^"]+)"/g)].map((m) => m[1]),
);

const misses = [];
for (const root of ROOTS) {
  for (const file of walk(root)) {
    if (file.endsWith("routes.ts")) continue;
    for (const match of readFileSync(file, "utf8").matchAll(/routeId:\s*"([^"]+)"/g)) {
      if (!known.has(match[1])) misses.push({ file, id: match[1] });
    }
  }
}

if (misses.length) {
  console.error(`\n${misses.length} link(s) point at a route that does not exist:\n`);
  for (const { file, id } of misses) console.error(`  ${id}  ${file}`);
  console.error(`\nAdd the route to ${ROUTES}, or point the link somewhere real.\n`);
  process.exit(1);
}
console.log(`check:routes — ${known.size} routes, every routeId resolves.`);
