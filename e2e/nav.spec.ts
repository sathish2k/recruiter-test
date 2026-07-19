import { expect, test } from "@playwright/test";
import { login, newAccount, register } from "./helpers";

// Admin walks the whole left sidenav. Every item below now has a declared route.
// The remaining nav entries (Messages, Help center) still point at routeIds NOT
// in configurations/routes.ts — they're inert placeholders, so they're
// intentionally not exercised here.
// `heading` (when set) is an in-screen text that proves the target page rendered
// — the three ops screens render empty for this fresh nav admin, but their table
// / section titles are always present, so we key on those.
const NAV: { label: string; url: RegExp; heading?: string }[] = [
  { label: "Clients", url: /\/clients$/ },
  { label: "Jobs", url: /\/jobs$/ },
  { label: "Candidates", url: /\/candidates$/ },
  { label: "Pipeline", url: /\/pipeline$/ },
  { label: "Team Activity", url: /\/team-activity$/, heading: "By employee" },
  { label: "Interviews", url: /\/interviews$/, heading: "Today's schedule" },
  { label: "Placements", url: /\/placements$/, heading: "Offers" },
  { label: "AI Screening", url: /\/ai-screening$/ },
  { label: "Automation", url: /\/automation$/ },
  { label: "Settings", url: /\/settings$/ },
];

test.describe
  .serial("admin navigation", () => {
    const acct = newAccount("nav");

    test.beforeAll(async ({ browser }) => {
      const p = await browser.newPage();
      await register(p, acct);
      await p.close();
    });

    test("navigates every routed sidebar item, then back to Dashboard", async ({
      page,
    }) => {
      await login(page, acct.email);
      await expect(page.getByText("Troy", { exact: true })).toBeVisible();

      const nav = page.getByRole("complementary");
      for (const item of NAV) {
        await nav.getByText(item.label, { exact: true }).click();
        await page.waitForURL(item.url);
        await expect(page).toHaveURL(item.url);
        if (item.heading) {
          await expect(
            page.getByText(item.heading, { exact: true }),
          ).toBeVisible();
        }
      }

      // Dashboard returns to root.
      await nav.getByText("Dashboard", { exact: true }).click();
      await page.waitForURL(/\/(\?.*)?$/);
      await expect(page.getByText("Hiring Activity")).toBeVisible();
    });
  });
