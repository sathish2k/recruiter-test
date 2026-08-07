import { readFileSync } from "node:fs";

/**
 * Loads `.env` into the environment for anything it doesn't already define.
 *
 * `bun run` does this on its own, but `bunx playwright`, UI mode and the IDE
 * extensions do not — and without E2E_EMAIL the setup project throws, every
 * project that depends on it skips, and the UI looks like it simply did
 * nothing. Reading the file here makes every entry point behave the same.
 */
export function loadEnvFile(path = ".env"): void {
  let contents: string;
  try {
    contents = readFileSync(path, "utf8");
  } catch {
    return; // No .env is fine — the variables may come from the shell or CI.
  }
  for (const line of contents.split("\n")) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!match?.[1] || line.trimStart().startsWith("#")) continue;
    if (process.env[match[1]] !== undefined) continue;
    process.env[match[1]] = (match[2] ?? "").trim().replace(/^(['"])(.*)\1$/, "$2");
  }
}
