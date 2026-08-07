import { expect, type Page, test } from "@playwright/test";

/**
 * The dashboard, pinned to a pixel baseline.
 *
 * `AIRecruiter - Dashboard.dc.html` is the authority for this screen, and it
 * draws one spine per role out of shared widgets. A regression in any of them —
 * a card that loses its shadow, a value that drops off the Space Grotesk scale,
 * a grid that stops pinning the context column at 380px — changes pixels here
 * and nowhere else, because no other screen composes these widgets.
 *
 * The seeded workspace supplies the counts. When it is empty the screen is
 * still valid, but it is the first-run state rather than the dashboard, so the
 * baseline is only meaningful after `bun run apps/api/src/db/seed.ts`.
 */

/** A fixed instant, so anything time-derived renders the same on every run. */
const FROZEN = new Date("2026-08-03T09:00:00.000Z");

/**
 * Freezes the clock, waits for the shell, and settles the page. The KPI values
 * arrive over SWR after first paint, so the wait is for a rendered card rather
 * than for `load` — without it the shot catches the skeletons.
 */
async function settle(page: Page) {
  await page.clock.install({ time: FROZEN });
  await page.goto("/");
  await page.getByRole("complementary").waitFor({ state: "visible" });
  // Every widget fetches its own slice and the API aggregates against a remote
  // database, so the screen fills in over ~17s across 14 round-trips. Waiting
  // for a card to *exist* photographs the skeletons, and waiting only for the
  // first batch to clear photographs the later cards still empty — so wait for
  // the network to go quiet, then for every skeleton to leave the document.
  await page.waitForLoadState("networkidle", { timeout: 45_000 }).catch(() => {});
  await page
    .locator(".MuiSkeleton-root")
    .last()
    .waitFor({ state: "detached", timeout: 30_000 })
    .catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  // Charts mount imperatively (see the `Chart` note in CLAUDE.md) and the cards
  // fade in; give the layout a frame to settle after fonts swap.
  await page.waitForTimeout(800);
}

test.describe("dashboard", () => {
  test("renders the role dashboard", async ({ page }) => {
    await settle(page);
    await expect(page).toHaveScreenshot("dashboard.png", {
      fullPage: true,
      // Signing in writes an audit row, so the activity feed — and every
      // "2 min" beside it — differs on every run. Freezing the clock fixes what
      // the *page* renders, not what the server returns, so these three live
      // lists are masked rather than pinned.
      mask: [page.locator('[data-testid^="side-list"]')],
    });
  });

  test("renders in dark mode", async ({ page }) => {
    // The theme is MUI's `data-theme` selector backed by localStorage, not the
    // `prefers-color-scheme` media query — `emulateMedia` alone leaves the page
    // in light and the baseline silently duplicates the light one.
    await page.addInitScript(() => {
      localStorage.setItem("recruit-theme", "dark");
    });
    await settle(page);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page).toHaveScreenshot("dashboard-dark.png", {
      fullPage: true,
      // Signing in writes an audit row, so the activity feed — and every
      // "2 min" beside it — differs on every run. Freezing the clock fixes what
      // the *page* renders, not what the server returns, so these three live
      // lists are masked rather than pinned.
      mask: [page.locator('[data-testid^="side-list"]')],
    });
  });
});
