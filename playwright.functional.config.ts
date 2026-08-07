import { defineConfig } from "@playwright/test";

/**
 * Functional tests for the authentication module — real HTTP against a running
 * API and a real database. No browser, no screenshots: these assert what the
 * system *does*.
 *
 * Separate from `bun test` on purpose. Those are pure unit tests and must pass
 * with nothing running; these need the API up, so making them a different
 * command keeps a stopped server from looking like a broken build.
 *
 * Requires, in `apps/api/.env`:
 *   E2E_ENABLED=true   — mounts the read-back routes for verification codes and
 *                        reset tokens, which are the only way to complete an
 *                        email flow without a mailbox. They serve `@example.com`
 *                        addresses only, which is why every test uses one.
 */
export default defineConfig({
  testDir: "./e2e/functional",
  // Every test mints its own address, so nothing is shared and the lockout
  // tests cannot collide with each other.
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: process.env.E2E_API_URL ?? "http://localhost:3001",
    extraHTTPHeaders: { "content-type": "application/json" },
  },
  projects: [{ name: "api" }],
});
