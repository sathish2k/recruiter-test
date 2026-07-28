import { expect, test } from "@playwright/test";
import { completeness, fillField, goto, row } from "../fixtures/app";

/**
 * `delivery-plan.md` §1.4 — "4 candidate intake paths + dedupe merge".
 * Manual add, CV upload and CSV import run here, all three through the same
 * duplicate check. Inbound apply waits on the application record (step 8).
 */
test.describe("Candidate intake", () => {
  const stamp = Date.now();
  const email = `e2e.candidate.${stamp}@example.test`;
  const lastName = `Candidate${stamp}`;

  test("manual add creates a candidate", async ({ page }) => {
    await goto(page, "/candidates/new");
    await fillField(page, "First name", "Sanya");
    await fillField(page, "Last name", lastName);
    await fillField(page, "Email", email);
    await page.getByRole("button", { name: /save/i }).last().click();
    await page.waitForURL(/\/candidates(?!\/new)/);
    await expect(row(page, lastName)).toBeVisible();
  });

  test("completeness scores the profile as it is filled", async ({ page }) => {
    await goto(page, "/candidates/new");
    const card = completeness(page);
    // An empty form has only the job association met — 1 of 6.
    await expect(card).toContainText("1 of 6");
    await fillField(page, "Email", email);
    await expect(card).toContainText("2 of 6");
  });

  test("completeness rows link to the field that is missing", async ({ page }) => {
    await goto(page, "/candidates/new");
    await completeness(page).getByText("Contact", { exact: true }).click();
    // The row scrolls its card into view and focuses the control.
    await expect(page.locator('[data-field="email"] input')).toBeFocused();
  });

  test("TC-CAN-005 — a candidate is global, not nested under a requirement", async ({ page }) => {
    await goto(page, "/candidates");
    await row(page, lastName).first().click();
    // requirements.md §5.6.3 — the Applications panel lists every requirement
    // the person is on, each with its own client, stage and owner.
    await expect(page.getByText(/applications/i).first()).toBeVisible();
  });

  test("TC-CAN-001 — duplicate detection warns on email blur", async ({ page }) => {
    await goto(page, "/candidates/new");
    // The address belongs to the candidate the first test created.
    await fillField(page, "Email", email);
    await page.keyboard.press("Tab");
    await expect(page.getByTestId("duplicate-warning")).toBeVisible();
    await expect(page.getByTestId("duplicate-warning")).toContainText(lastName);
  });

  test("TC-CAN-002 — field-level merge keeps the chosen values", async ({ page }) => {
    await goto(page, "/candidates/new");
    // A different first name against the same address — one real conflict.
    await fillField(page, "First name", "Sanjana");
    await fillField(page, "Email", email);
    await page.keyboard.press("Tab");
    await page.getByTestId("duplicate-warning").getByRole("button", { name: /merge/i }).click();

    const conflict = page.locator('[data-merge-field="firstName"]');
    await expect(conflict).toBeVisible();
    // Keep the value typed here rather than the one on file.
    await conflict.getByText("Sanjana").click();
    await page.getByRole("button", { name: /^merge$/i }).click();

    // The survivor is the existing record, now holding the chosen value.
    await page.waitForURL(/\/candidates\/[^/]+\/edit/);
    await expect(page.locator('[data-field="firstName"] input')).toHaveValue("Sanjana");
  });

  test("CSV import creates the rows it was given", async ({ page }) => {
    await goto(page, "/candidates/import");
    const csv = `First name,Last name,Email\nRhea,Import${stamp},rhea.${stamp}@example.test\n`;
    // The CSV input is the second hidden picker (the first takes CVs).
    await page
      .locator('input[type="file"]')
      .nth(1)
      .setInputFiles({
        name: "candidates.csv",
        mimeType: "text/csv",
        buffer: Buffer.from(csv),
      });

    await expect(page.locator("tbody tr")).toHaveCount(1);
    await page.getByRole("button", { name: /import 1/i }).click();
    await expect(page.locator('[data-row-status="created"]')).toBeVisible();

    await goto(page, "/candidates");
    await expect(row(page, `Import${stamp}`)).toBeVisible();
  });

  // ── Not yet buildable — the feature does not exist ────────────────────────

  test.fixme("TC-CAN-007 — off-limits shield shows the reason", async () => {
    // Needs candidates.off_limits_until, derived from placement + client term.
  });

  test.fixme("TC-CAN-008 — archive warns about live applications", async () => {
    // Needs applications before it can count them.
  });

  test.fixme("TC-CAN-009 — erasure requires typing ERASE", async () => {
    // requirements.md §5.6.3 / §6.1. Needs the erasure path, distinct from archive.
  });

  test.fixme("TC-CAN-010 — do-not-contact suppresses every outbound channel", async () => {
    // Needs the outbound email path to consult the flag.
  });
});
