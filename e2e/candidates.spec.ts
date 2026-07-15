import { expect, test } from "@playwright/test";
import { login, newAccount, register } from "./helpers";

// Fresh admin: empty Candidates list → add a candidate → it shows in the list →
// row opens the Candidate Detail with the name rendered.
test.describe
  .serial("candidates", () => {
    const acct = newAccount("cand");
    const first = "Savannah";
    const last = `Nguyen${Date.now()}`;
    const fullName = `${first} ${last}`;

    test.beforeAll(async ({ browser }) => {
      const p = await browser.newPage();
      await register(p, acct);
      await p.close();
    });

    test.beforeEach(async ({ page }) => {
      await login(page, acct.email);
    });

    test("shows an empty Candidates list for a fresh admin", async ({
      page,
    }) => {
      await page.getByText("Candidates", { exact: true }).click();
      await page.waitForURL("**/candidates");
      await expect(
        page.getByText("No candidates match these filters"),
      ).toBeVisible();
    });

    test("adds a candidate and it appears, then opens detail", async ({
      page,
    }) => {
      await page.goto("/candidates");
      await page.getByRole("button", { name: "Add Candidate" }).click();
      await page.waitForURL("**/candidates/new");

      // firstName is the only required field; optional fields (email, "Applying
      // for", etc.) no longer block submit, so saving with a name now succeeds.
      await page.locator('input[name="firstName"]').fill(first);
      await page.locator('input[name="lastName"]').fill(last);
      await page.getByRole("button", { name: "Save candidate" }).click();

      // Transient toast (auto-navigates back to /candidates after ~1.2s).
      await expect(page.getByText("Candidate saved")).toBeVisible();

      await page.waitForURL("**/candidates");
      // Reload to defeat SWR's 2s dedupingInterval: the fast create→save→return
      // round-trip can remount the list within the dedup window, reusing its
      // cached (empty) snapshot. A reload forces a fresh fetch. Real users take
      // longer than 2s to fill a form, so this is a test-speed artifact.
      await page.reload();
      const row = page.getByText(fullName, { exact: false });
      await expect(row).toBeVisible();

      await row.click();
      await page.waitForURL(/\/candidates\/[a-f0-9]{24}$/);
      await expect(
        page.getByText(fullName, { exact: false }).first(),
      ).toBeVisible();
    });
  });
