import { defineConfig, devices } from "@playwright/test";

// Runs against a production build (`bun run build` first) — dev-server
// numbers and markup are not what ships.
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3100",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: "bunx next start apps/web -p 3100",
    url: "http://localhost:3100/login",
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
