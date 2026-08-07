#!/usr/bin/env bun
/**
 * MUI's Autocomplete threads its input ref through `renderInput`'s params.
 * Overriding the input slot on that TextField silently drops the ref: every
 * dropdown renders empty and the console fills with "Unable to find the input
 * element". This has regressed three times, so it's checked rather than
 * remembered — render adornments as an overlay beside the control instead.
 */
import { Glob } from "bun";

const offenders = [];

for await (const file of new Glob("packages/**/*.tsx").scan(".")) {
  const src = await Bun.file(file).text();
  if (!src.includes("renderInput")) continue;

  for (const match of src.matchAll(/renderInput=\{[\s\S]{0,800}?\n\s*\)\}/g)) {
    const block = match[0];
    if (/slotProps=\{\{[\s\S]*?\binput\s*:/.test(block) || /\bInputProps=\{/.test(block)) {
      offenders.push(`${file}:${src.slice(0, match.index).split("\n").length}`);
    }
  }
}

if (offenders.length) {
  console.error("Autocomplete renderInput overrides the input slot (drops the ref):");
  for (const offender of offenders) console.error(`  ${offender}`);
  process.exit(1);
}

console.log("ok: no Autocomplete input-slot overrides");
