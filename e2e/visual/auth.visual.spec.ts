import { expect, type Page, test } from "@playwright/test";

/**
 * Every authentication surface that renders from configuration alone — no
 * session, no seeded data, no API. That is what makes them safe to pin to a
 * pixel baseline: nothing in them varies between runs except the things a
 * regression would change.
 *
 * The states that need a live API (verification confirmed, the reset link
 * accepted, an account actually locked out) are covered by the journey suite
 * instead. See `notes` at the foot of this file.
 */

/** A fixed instant, so anything time-derived renders the same on every run. */
const FROZEN = new Date("2026-08-03T09:00:00.000Z");

interface Screen {
  name: string;
  path: string;
  /** Something that only exists once the screen has finished rendering. */
  ready: string;
}

const SCREENS: Screen[] = [
  { name: "login", path: "/login", ready: "text=Sign in" },
  { name: "create-account", path: "/create-account", ready: "text=Create your account" },
  { name: "forgot-password", path: "/forgot-password", ready: '[data-testid="forgot-form"]' },
  // No token in the URL, so this is the invalid-link state.
  {
    name: "reset-password-invalid",
    path: "/reset-password",
    ready: '[data-testid="reset-invalid"]',
  },
  {
    name: "verify-email",
    path: "/verify?email=ana%40troyconsulting.com",
    ready: '[data-testid="verify-pending"]',
  },
  { name: "permission-denied", path: "/permission-denied", ready: "text=Error code: 403" },
  { name: "not-found", path: "/a-page-that-does-not-exist", ready: "text=Error code: 404" },
  { name: "terms", path: "/terms", ready: "text=Terms of Service" },
  { name: "privacy", path: "/privacy", ready: "text=Privacy Policy" },
];

/**
 * Freezes the clock before any script runs, waits for fonts, and settles the
 * page. Without the clock the verify screen's countdown ticks between the
 * baseline and the comparison and every run disagrees by a second.
 */
async function settle(page: Page, screen: Screen) {
  await page.clock.install({ time: FROZEN });
  await page.goto(screen.path);
  await page.locator(screen.ready).first().waitFor({ state: "visible" });
  await page.evaluate(() => document.fonts.ready);
  // The brand backdrop and the error screens fade in; `animations: "disabled"`
  // in the config jumps them to their end state, but the layout still needs a
  // frame to settle after fonts swap in.
  await page.waitForTimeout(150);
}

test.describe("authentication screens", () => {
  for (const screen of SCREENS) {
    test(`${screen.name} matches its baseline`, async ({ page }) => {
      await settle(page, screen);
      await expect(page).toHaveScreenshot(`${screen.name}.png`, { fullPage: true });
    });
  }
});

test.describe("dark scheme", () => {
  test.use({ colorScheme: "dark" });

  // The theme is the design system's other half, and a token that only breaks in
  // dark is invisible to a light-only suite. Two screens are enough to catch it:
  // one form-heavy card, one full-bleed error screen.
  for (const screen of SCREENS.filter((s) => s.name === "login" || s.name === "not-found")) {
    test(`${screen.name} matches its dark baseline`, async ({ page }) => {
      await settle(page, screen);
      await expect(page).toHaveScreenshot(`${screen.name}-dark.png`, { fullPage: true });
    });
  }
});

test.describe("form validation", () => {
  // The error states are as much a part of the design as the empty form, and
  // they are reachable without an API because the schema rejects before submit.
  test("create account shows every field error at once", async ({ page }) => {
    await settle(page, SCREENS[1] as Screen);
    await page.getByRole("button", { name: "Create account" }).click();
    await page.getByText("First name is required").waitFor({ state: "visible" });
    await expect(page).toHaveScreenshot("create-account-errors.png", { fullPage: true });
  });

  test("verify email rejects a code that is not six digits", async ({ page }) => {
    await settle(page, SCREENS[4] as Screen);
    await page.getByRole("button", { name: "Verify email" }).click();
    await page.getByText("Enter the 6-digit code we sent you").waitFor({ state: "visible" });
    await expect(page).toHaveScreenshot("verify-email-error.png", { fullPage: true });
  });
});

/**
 * notes
 *
 * Not covered here, and why:
 *
 * - Email Verified / Link Expired, Check Your Inbox, Password Updated — each
 *   needs a successful API call to reach. They belong in the journey suite,
 *   which has a database.
 * - Account Locked — needs five real failed sign-ins against the API.
 * - Session Expired / 500 — need a rejected session and a thrown render. Both
 *   are reachable in a journey run by revoking a session and by hitting a route
 *   that throws; neither is worth faking here.
 *
 * Baselines are per-platform (see `snapshotPathTemplate`). A macOS baseline will
 * not match Linux CI — generate each on the machine that will compare it, with
 * `bun run test:visual:update`.
 */
