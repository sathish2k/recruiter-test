import { expect, test } from "@playwright/test";
import { apiCreateJob, apiLogin } from "./api-helpers";
import { login, newAccount, register } from "./helpers";

// AI Screening (Recruit.AiScreening.Page) and Automation (Recruit.Automation.Page)
// depth. settings.spec already covers the threshold/toggle persistence; this
// spec covers the read-only rails: per-role thresholds (driven by a seeded
// active job), the "what the AI scores" list, and the automation "+ New
// automation" builder toast + recent-runs / impact rails.
test.describe
  .serial("ai screening & automation", () => {
    const acct = newAccount("aidepth");
    const roleTitle = `Data Scientist ${Date.now()}`;

    test.beforeAll(async ({ browser, request }) => {
      const p = await browser.newPage();
      await register(p, acct);
      await p.close();
      // An Active job surfaces a per-role threshold row on the screening screen.
      const { token } = await apiLogin(request, acct.email);
      await apiCreateJob(request, token, {
        title: roleTitle,
        client: "Nortech",
        status: "Active",
      });
    });

    test.beforeEach(async ({ page }) => {
      await login(page, acct.email);
    });

    test("AI Screening: per-role thresholds + score rails render", async ({
      page,
    }) => {
      await page.goto("/ai-screening");
      // Default settings card.
      await expect(
        page.getByText("Default screening settings", { exact: true }),
      ).toBeVisible();
      // Per-role thresholds list, populated by the seeded active job.
      await expect(
        page.getByText("Per-role thresholds", { exact: true }),
      ).toBeVisible();
      await expect(page.getByText(roleTitle)).toBeVisible();
      // Score distribution rail.
      await expect(
        page.getByText("Score distribution", { exact: true }),
      ).toBeVisible();
      // "What the AI scores" list with its four factors.
      await expect(
        page.getByText("What the AI scores", { exact: true }),
      ).toBeVisible();
      await expect(page.getByText("Skills vs JD")).toBeVisible();
      await expect(page.getByText("Experience depth")).toBeVisible();
      await expect(page.getByText("Domain fit")).toBeVisible();
      await expect(page.getByText("Compensation fit")).toBeVisible();
    });

    test("Automation: builder CTA + recent-runs / impact rails render", async ({
      page,
    }) => {
      await page.goto("/automation");
      // Recipe cards seed lazily on first GET.
      await expect(page.getByText("Score CVs on upload").first()).toBeVisible();
      // Recent-runs + impact rails.
      await expect(
        page.getByText("Recent runs", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByText("Impact this month", { exact: true }),
      ).toBeVisible();
      // "+ New automation" opens the "coming soon" builder toast.
      await page.getByRole("button", { name: "New automation" }).click();
      await expect(
        page.getByText("Automation builder coming soon"),
      ).toBeVisible();
    });
  });
