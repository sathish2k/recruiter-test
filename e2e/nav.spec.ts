import { expect, test } from "@playwright/test";
import { login, newAccount, register } from "./helpers";

// Admin walks the whole left sidenav. Only the items below have declared routes;
// the remaining nav entries (Team Activity, Interviews, Placements, Messages,
// Help center) point at routeIds NOT in configurations/routes.ts — they're inert
// placeholders, so they're intentionally not exercised here.
const NAV: { label: string; url: RegExp }[] = [
  { label: "Clients", url: /\/clients$/ },
  { label: "Jobs", url: /\/jobs$/ },
  { label: "Candidates", url: /\/candidates$/ },
  { label: "Pipeline", url: /\/pipeline$/ },
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
      }

      // Dashboard returns to root.
      await nav.getByText("Dashboard", { exact: true }).click();
      await page.waitForURL(/\/(\?.*)?$/);
      await expect(page.getByText("Hiring Activity")).toBeVisible();
    });
  });
