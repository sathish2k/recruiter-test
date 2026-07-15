import { defineConfig, devices } from "@playwright/test";

// E2E runs against a locally-running web (:3000) + api (:3001) with MongoDB up.
// globalSetup wipes the DB so every run drives each flow from an empty slate;
// tests share that state, so they run serially in a single worker.
export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 12_000,
    navigationTimeout: 20_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: [
    {
      command: "bun run --watch src/index.ts",
      cwd: "./apps/api",
      port: 3001,
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      command: "bun run dev",
      cwd: "./apps/web",
      url: "http://localhost:3000",
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
