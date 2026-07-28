import { defineConfig, devices } from "@playwright/test";

/**
 * E2E configuration for the Phase 1 journeys in `delivery-plan.md` §1.4.
 *
 * The suite assumes the web app and API are already running (`bun run dev`).
 *
 * Watching it: `bun run test:e2e:headed` opens a real browser, and
 * `E2E_SLOWMO=300` slows each action enough to follow. `bun run test:e2e:ui`
 * is the better tool for working through one flow at a time — it lists the
 * journeys, runs a single test on click, and keeps a time-travel trace.
 * `E2E_ENABLED` gates the seeding routes the tests use — per `test-cases.md`
 * TC-SEC-002 those routes must 404 when it is unset, so it is never set in a
 * production configuration.
 */
export default defineConfig({
  testDir: "./e2e",
  // Journeys share a workspace; running them in parallel would let one test's
  // records leak into another's counts.
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    // Headed runs go too fast to follow; E2E_SLOWMO=300 makes each action
    // visible without changing what the test does.
    launchOptions: { slowMo: Number(process.env.E2E_SLOWMO ?? 0) },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    viewport: { width: 1440, height: 900 },
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      testIgnore: /mobile\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], storageState: "e2e/.auth/user.json" },
      dependencies: ["setup"],
    },
    // The five screens `requirements.md` §6.5 requires to work one-handed.
    {
      name: "mobile",
      testMatch: /mobile\.spec\.ts/,
      use: { ...devices["Pixel 7"], storageState: "e2e/.auth/user.json" },
      dependencies: ["setup"],
    },
  ],
});
