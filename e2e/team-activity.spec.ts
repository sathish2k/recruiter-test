import { execSync } from "node:child_process";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { apiCreateJob, apiLogin } from "./api-helpers";
import { login, newAccount, register } from "./helpers";

// Team Activity (Recruit.TeamActivity.Page): a toolbar (viewer + role pills, a
// period tab, CSV export), an optional lead-view banner, a 5-KPI strip, and the
// "By employee" / "By role" tables. All data is agency-scoped and derived from
// this agency's *Active* jobs plus its *active* employees/leads:
//   - an Active job → a "By role" row (and the role-filter option);
//   - an active employee → the job's assignee → a "By employee" row;
//   - an active lead → the second viewer option, so the viewer pill can switch
//     into lead view (which shows the info banner).
// The invite endpoint only makes "invited" users, so the active employee + lead
// are DB-seeded directly (reuse db-seed.ts, as the pipeline board spec does).
test.describe
  .serial("team activity", () => {
    const acct = newAccount("teamact");
    const roleTitle = `Growth Engineer ${Date.now()}`;
    const employeeName = "Emma Employee";
    const leadName = "Leo Lead";

    test.beforeAll(async ({ browser, request }) => {
      const p = await browser.newPage();
      await register(p, acct);
      await p.close();

      const { token } = await apiLogin(request, acct.email);
      // An Active job → one By-role row + the role-filter option.
      await apiCreateJob(request, token, {
        title: roleTitle,
        client: "Nortech",
        status: "Active",
      });

      // Seed an active employee (the job's assignee → a By-employee row) and an
      // active lead (the viewer pill's lead-view option). Both need status
      // "active", which no HTTP path produces.
      const seed = (email: string, name: string, role: string) =>
        execSync(`bun run ${path.join(__dirname, "db-seed.ts")}`, {
          cwd: path.join(__dirname, "..", "apps", "api"),
          env: {
            ...process.env,
            SEED_AGENCY: acct.agency,
            SEED_EMAIL: email,
            SEED_NAME: name,
            SEED_ROLE: role,
          },
          stdio: "inherit",
        });
      seed(`emp.${Date.now()}@e2e.test`, employeeName, "employee");
      seed(`lead.${Date.now()}@e2e.test`, leadName, "lead");
    });

    test.beforeEach(async ({ page }) => {
      await login(page, acct.email);
      await page.goto("/team-activity");
    });

    test("renders the By-employee and By-role tables with seeded data", async ({
      page,
    }) => {
      await expect(
        page.getByText("By employee", { exact: true }),
      ).toBeVisible();
      await expect(page.getByText("By role", { exact: true })).toBeVisible();

      // By-employee row for the seeded active employee.
      const empRow = page.getByRole("row").filter({ hasText: employeeName });
      await expect(empRow).toBeVisible();

      // By-role row for the seeded Active job.
      const roleRow = page.getByRole("row").filter({ hasText: roleTitle });
      await expect(roleRow).toBeVisible();
    });

    test("the viewer pill toggles into lead view and shows the info banner", async ({
      page,
    }) => {
      // Default is the admin view — no lead-view banner.
      await expect(
        page.getByRole("button", { name: "Admin — all team" }),
      ).toBeVisible();
      await expect(
        page.getByText(/Lead view — showing only employees/),
      ).toHaveCount(0);

      // Cycle the viewer pill: admin → the seeded lead → the banner appears.
      await page.getByRole("button", { name: "Admin — all team" }).click();
      await expect(
        page.getByRole("button", { name: `${leadName} — lead view` }),
      ).toBeVisible();
      await expect(
        page.getByText(/Lead view — showing only employees/),
      ).toBeVisible();
    });

    test("the period tab changes the KPI values", async ({ page }) => {
      // The Invites KPI sub encodes both the target (scales with the period) and
      // the period label, so it's a single stable proxy for "values changed".
      await expect(page.getByText(/of \d+ target · today/)).toBeVisible();

      await page.getByRole("tab", { name: "Month", exact: true }).click();
      await expect(page.getByText(/of \d+ target · this month/)).toBeVisible();
      await expect(page.getByText(/of \d+ target · today/)).toHaveCount(0);
    });

    test("the role filter pill cycles through the seeded role", async ({
      page,
    }) => {
      // Starts on "All roles"; one click selects the only Active role, a second
      // wraps back to "All roles".
      await page.getByRole("button", { name: "All roles" }).click();
      await expect(page.getByRole("button", { name: roleTitle })).toBeVisible();

      await page.getByRole("button", { name: roleTitle }).click();
      await expect(
        page.getByRole("button", { name: "All roles" }),
      ).toBeVisible();
    });

    test("CSV export shows a toast", async ({ page }) => {
      await page.getByRole("button", { name: "CSV" }).click();
      await expect(page.getByText("Export started")).toBeVisible();
    });
  });
