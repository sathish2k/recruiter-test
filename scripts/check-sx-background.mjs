#!/usr/bin/env bun
/**
 * `sx={{ background: "surface.inset" }}` does not resolve a palette path — only
 * `bgcolor` / `backgroundColor` do. The shorthand is passed through as raw CSS,
 * so the declaration is invalid and the element renders transparent. Silent:
 * no warning, no type error, it just looks unstyled. Twenty-six of these had
 * accumulated before anyone spotted the two most visible ones.
 *
 * Literal colours and gradients are fine on `background` — only quoted palette
 * paths are flagged.
 */
import { Glob } from "bun";

const PALETTES = [
  "surface",
  "text",
  "primary",
  "secondary",
  "action",
  "success",
  "error",
  "warning",
  "info",
  "background",
];
const PATTERN = new RegExp(`\\bbackground:[^\\n;]*"(?:${PALETTES.join("|")})\\.[a-zA-Z]`);

const offenders = [];

for await (const file of new Glob("packages/**/*.tsx").scan(".")) {
  const src = await Bun.file(file).text();
  src.split("\n").forEach((line, index) => {
    if (PATTERN.test(line)) offenders.push(`${file}:${index + 1}  ${line.trim()}`);
  });
}

if (offenders.length) {
  console.error(
    `\n${offenders.length} sx \`background\` declaration(s) using a palette path — use \`bgcolor\` instead:\n`,
  );
  for (const offender of offenders) console.error(`  ${offender}`);
  process.exit(1);
}

console.log("ok: no sx background palette paths");
