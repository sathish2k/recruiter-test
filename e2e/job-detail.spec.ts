import { expect, test } from "@playwright/test";
import { apiCreateJob, apiLogin } from "./api-helpers";
import { login, newAccount, register } from "./helpers";

// Job Detail depth (Recruit.JobDetail.Page). A job is API-seeded with a rich
// body (client, skills, markdown description, level) so the detail renders its
// hero, attribute tiles, description, and the AI sourcing-keywords modal. Covers
// the Keywords modal, the Edit action (→ Add Job), and Share (inline "Link
// copied ✓").
test.describe
  .serial("job detail", () => {
    const acct = newAccount("jobdetail");
    const title = `Senior Backend Engineer ${Date.now()}`;
    let jobId = "";

    test.beforeAll(async ({ browser, request }) => {
      const p = await browser.newPage();
      await register(p, acct);
      await p.close();
      const { token } = await apiLogin(request, acct.email);
      const job = await apiCreateJob(request, token, {
        title,
        client: "Nortech",
        level: "Senior",
        location: "Remote (US)",
        empType: "Full-time",
        salaryMin: "150000",
        salaryMax: "180000",
        skills: ["Go", "PostgreSQL", "Kubernetes"],
        description:
          "## About the role\nWe are building a **distributed platform**.\n- Own core services\n- Mentor engineers",
      });
      jobId = job.id;
    });

    test.beforeEach(async ({ page }) => {
      await login(page, acct.email);
      await page.goto(`/jobs/${jobId}`);
      await expect(page.getByText(title).first()).toBeVisible();
    });

    test("renders the hero, attribute tiles, and description", async ({
      page,
    }) => {
      // Attribute tiles (labels resolve from job-detail.translations.json). The
      // level tile value resolves through the "levels" prefix (Senior →
      // Senior-level).
      await expect(page.getByText("Level", { exact: true })).toBeVisible();
      await expect(page.getByText("Senior-level")).toBeVisible();
      await expect(
        page.getByText("Employment Type", { exact: true }),
      ).toBeVisible();
      await expect(page.getByText("Work Type", { exact: true })).toBeVisible();
      // Description section + rendered markdown body.
      await expect(
        page.getByText("Job Description", { exact: true }),
      ).toBeVisible();
      await expect(page.getByText("About the role")).toBeVisible();
      // Must-have skills chips render the seeded skills.
      await expect(page.getByText("Kubernetes")).toBeVisible();
    });

    test("opens the AI sourcing-keywords modal with a copy control", async ({
      page,
    }) => {
      await page.getByRole("button", { name: "Keywords" }).click();
      const dialog = page.getByRole("dialog");
      await expect(dialog.getByText("Sourcing keywords")).toBeVisible();
      // The SEARCH-AS chips + the boolean-string boards each carry a Copy chip.
      await expect(dialog.getByText("SEARCH AS")).toBeVisible();
      await expect(dialog.getByText("LinkedIn boolean")).toBeVisible();
      await expect(
        dialog.getByRole("button", { name: "Copy" }).first(),
      ).toBeVisible();
    });

    test("the Edit action navigates to Add Job", async ({ page }) => {
      await page.getByRole("button", { name: "Edit" }).click();
      await page.waitForURL("**/jobs/new");
      await expect(page.getByText("New Job", { exact: true })).toBeVisible();
    });

    test("Share copies the link and confirms inline", async ({
      page,
      context,
    }) => {
      // Grant clipboard write so navigator.clipboard.writeText resolves cleanly.
      await context.grantPermissions(["clipboard-write"]);
      await page.getByRole("button", { name: "Share" }).click();
      // The Share button swaps its label to the "Link copied ✓" confirmation.
      await expect(page.getByText("Link copied ✓")).toBeVisible();
    });
  });
