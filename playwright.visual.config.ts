import { defineConfig, devices } from "@playwright/test";
import { loadEnvFile } from "./e2e/load-env";

/**
 * Visual regression for the screens that render without a database.
 *
 * Deliberately separate from `playwright.config.ts`: the journey suite signs in
 * first and shares one workspace, so every project there depends on a setup
 * project and a stored session. These screens are public, so the suite needs
 * neither — and keeping it apart means a broken seed or an empty database can't
 * stop the design from being checked.
 *
 * Runs against a production build, not `next dev`. Dev injects overlays and
 * rebuilds on the fly, which shows up as pixel noise; `next start` renders the
 * same bytes every time. It also uses its own port so it can't collide with a
 * dev server already on 3000.
 */
loadEnvFile();

const PORT = Number(process.env.E2E_VISUAL_PORT ?? 3010);

export default defineConfig({
  testDir: "./e2e/visual",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  timeout: 60_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      // An absolute budget, not a ratio. A ratio scales with page size, so on a
      // full-page shot of ~1.4M pixels even 1% permits ~14,000 changed pixels —
      // enough to hide a re-worded button, which is exactly the regression this
      // suite exists to catch. 100 pixels absorbs antialiasing jitter and
      // nothing larger.
      maxDiffPixels: 100,
      animations: "disabled",
      caret: "hide",
      scale: "css",
    },
  },
  // `{projectName}` is not optional: desktop and mobile render the same route at
  // different widths, so without it the second project to run overwrites the
  // first one's baseline and both comparisons become meaningless.
  //
  // `{platform}` is here because rendering is font- and platform-dependent — a
  // macOS baseline will never match a Linux one, and separate folders let both
  // exist rather than CI and a laptop overwriting each other forever.
  snapshotPathTemplate: "{testDir}/__screenshots__/{platform}/{projectName}/{arg}{ext}",
  use: {
    baseURL: process.env.E2E_VISUAL_BASE_URL ?? `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    video: "off",
    colorScheme: "light",
  },
  projects: [
    {
      name: "desktop",
      testIgnore: /dashboard\.(visual\.spec|design-parity\.spec|roles\.spec|setup)\.ts/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile",
      testIgnore: /dashboard\.(visual\.spec|design-parity\.spec|roles\.spec|setup)\.ts/,
      use: { ...devices["Pixel 7"] },
    },
    // The dashboard is the one screen here that needs a session and a populated
    // workspace, so it gets its own setup and its own stored state rather than
    // making the public screens above depend on a database.
    { name: "dashboard-setup", testMatch: /dashboard\.setup\.ts/ },
    {
      name: "dashboard",
      testMatch: /dashboard\.(visual|design-parity|roles)\.spec\.ts/,
      dependencies: ["dashboard-setup"],
      // The dashboard fans out ~14 requests and the API aggregates against a
      // remote database, so one pass takes ~20s. Run these serially: three
      // contexts loading it at once starve each other and everything times out
      // on a laptop, which reads as a design regression and is not one.
      fullyParallel: false,
      timeout: 120_000,
      use: {
        ...devices["Desktop Chrome"],
        // Tall on purpose. The dashboard scrolls inside the layout rather than
        // the document, so `fullPage` captures only the fold — a baseline that
        // would miss every widget below the KPI row.
        viewport: { width: 1440, height: 3400 },
        storageState: "e2e/.auth/visual.json",
      },
    },
  ],
  webServer: [
    // The design export, so the parity suite can read the real thing rather
    // than a baseline we generated ourselves.
    {
      command: "bun run e2e/visual/__design__/serve.ts",
      url: process.env.E2E_DESIGN_URL ?? "http://localhost:3020",
      reuseExistingServer: true,
      timeout: 30_000,
    },
    ...(process.env.E2E_VISUAL_BASE_URL
      ? []
      : [
          {
            // Requires `bunx turbo run build --filter=@recruit/web` to have run.
            command: `bunx next start -p ${PORT}`,
            cwd: "apps/web",
            url: `http://localhost:${PORT}`,
            reuseExistingServer: !process.env.CI,
            timeout: 120_000,
          },
        ]),
  ],
});
