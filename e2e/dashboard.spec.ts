import { expect, test } from "@playwright/test";
import { apiCreateCandidate, apiLogin } from "./api-helpers";
import { login, newAccount, register } from "./helpers";

// Admin dashboard (Recruit.Home.Page): a main column (toolbar, stat cards,
// hiring chart, recent candidates) plus a right rail (controls, next interview,
// quick actions, AI screening). Dashboard data is agency-scoped, so this fresh
// admin only sees its own seeded candidate. Widgets that need interview data
// (Next interview / Upcoming) can't be seeded via the API and render nothing
// when empty — documented below.
test.describe
  .serial("dashboard", () => {
    const acct = newAccount("dash");
    const candFirst = "Dashboardy";
    const candLast = `Probe${Date.now()}`;
    const candName = `${candFirst} ${candLast}`;

    test.beforeAll(async ({ browser, request }) => {
      const p = await browser.newPage();
      await register(p, acct);
      await p.close();
      const { token } = await apiLogin(request, acct.email);
      // A uniquely-named candidate for the recent-candidates widget (limit-5 by
      // appliedTs desc). Data is agency-scoped, so this admin's pool is just
      // this one candidate and the seeded name lands in the widget. No job is
      // seeded, so the Open Roles stat card renders 0 — all this spec needs.
      await apiCreateCandidate(request, token, {
        firstName: candFirst,
        lastName: candLast,
        currentTitle: "Platform Engineer",
      });
    });

    test.beforeEach(async ({ page }) => {
      await login(page, acct.email);
    });

    test("stat cards render with numeric values", async ({ page }) => {
      await page.goto("/");
      // exact:true avoids matching lowercase "Open roles" metric labels elsewhere.
      await expect(page.getByText("Open Roles", { exact: true })).toBeVisible();
      await expect(
        page.getByText("Active Candidates", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByText("Hires This Month", { exact: true }),
      ).toBeVisible();
      // The Open Roles card value is a number.
      const openRolesCard = page
        .getByText("Open Roles", { exact: true })
        .locator("xpath=ancestor::a[1]");
      await expect(openRolesCard).toContainText(/\d+/);
    });

    test("the Open Roles stat card links to Jobs with a filters query", async ({
      page,
    }) => {
      await page.goto("/");
      // The stat card is wrapped in a LinkRenderer → /jobs?filters={status:[Active]}.
      await page.getByText("Open Roles", { exact: true }).click();
      await page.waitForURL(/\/jobs\?filters=/);
      expect(page.url()).toContain("filters=");
    });

    test("recent candidates lists the seeded candidate and opens detail", async ({
      page,
    }) => {
      await page.goto("/");
      await expect(page.getByText("Recent candidates")).toBeVisible();
      const row = page.getByText(candName);
      await expect(row).toBeVisible();
      // rowRouteId → Candidate Detail.
      await row.click();
      await page.waitForURL(/\/candidates\/[a-f0-9]{24}$/);
      await expect(page.getByText(candName).first()).toBeVisible();
    });

    test("the recent-candidates 'View all' link navigates to Candidates", async ({
      page,
    }) => {
      await page.goto("/");
      // The table header renders a "View all" chip linking to Candidates with a
      // sort query param. exact:true avoids a separate "View All" button on the page.
      await page.getByText("View all", { exact: true }).click();
      await page.waitForURL("**/candidates**");
      await expect(page).toHaveURL(/\/candidates/);
    });

    test("the right rail renders Quick Action and AI Screening widgets", async ({
      page,
    }) => {
      await page.goto("/");
      // NOTE: the `complementary` landmark is the LEFT nav sidebar, not the right
      // rail, so assert the rail widgets on the page directly.
      // Quick actions widget title.
      await expect(
        page.getByText("Quick Action", { exact: true }),
      ).toBeVisible();
      // AI Screening card — key on its unique body text (its title "AI Screening"
      // also appears as a sidebar link, so use the distribution label).
      await expect(
        page.getByText("Match score distribution", { exact: true }),
      ).toBeVisible();

      // NOTE: the "Next interview" and "Upcoming interviews" widgets require
      // interview records, which have no API create path. Their components return
      // null when there's no interview data, so they render nothing here — an
      // empty state we can't seed past. Nothing to assert for them.
    });
  });
