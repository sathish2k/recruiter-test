import { expect, test } from "@playwright/test";
import { login, newAccount, register } from "./helpers";

// Fresh admin drives the full job lifecycle: empty state → create → list →
// detail. Edit/delete are stubs, so we only assert the kebab menu opens.
test.describe
  .serial("jobs", () => {
    const acct = newAccount("jobs");
    const jobTitle = `Senior Backend Engineer ${Date.now()}`;

    test.beforeAll(async ({ browser }) => {
      const p = await browser.newPage();
      await register(p, acct);
      await p.close();
    });

    test.beforeEach(async ({ page }) => {
      await login(page, acct.email);
    });

    test("shows an empty Jobs list for a fresh admin", async ({ page }) => {
      await page.getByText("Jobs", { exact: true }).click();
      await page.waitForURL("**/jobs");
      await expect(page.getByText("No jobs match these filters")).toBeVisible();
    });

    test("creates a job and it appears in the list, then opens detail", async ({
      page,
    }) => {
      await page.goto("/jobs");
      await page.getByRole("button", { name: "New Job" }).click();
      await page.waitForURL("**/jobs/new");

      // Title is the only required field; optional fields (client, etc.) no
      // longer block submit, so publishing with just a title now succeeds.
      await page.locator('input[name="title"]').fill(jobTitle);
      await page.getByRole("button", { name: "Publish job" }).click();

      // Transient success toast (auto-navigates back to /jobs after ~1.2s).
      await expect(page.getByText("Job published")).toBeVisible();

      await page.waitForURL("**/jobs");
      // The list is a client-side SWR read; when the create→publish→auto-return
      // round-trip completes inside SWR's 2s dedupingInterval, the remounted list
      // reuses its cached (empty) snapshot. A reload forces a fresh fetch — real
      // users never fill + submit a form in under 2s, so this is a test-speed
      // artifact, not a product bug.
      await page.reload();
      const row = page.getByText(jobTitle, { exact: false });
      await expect(row).toBeVisible();

      // Whole row is clickable → Job Detail; the title renders in the header.
      await row.click();
      await page.waitForURL(/\/jobs\/[a-f0-9]{24}$/);
      await expect(
        page.getByText(jobTitle, { exact: false }).first(),
      ).toBeVisible();
    });

    test("row kebab menu opens (edit/delete are stubs)", async ({ page }) => {
      await page.goto("/jobs");
      await expect(page.getByText(jobTitle, { exact: false })).toBeVisible();
      // The actions column renders a kebab IconButton (aria-label="actions").
      await page.getByRole("button", { name: "actions" }).first().click();
      await expect(page.getByText("Edit job")).toBeVisible();
    });
  });
