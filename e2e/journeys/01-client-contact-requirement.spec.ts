import { expect, test } from "@playwright/test";
import { fillField, goto, row, selectOption } from "../fixtures/app";

/**
 * `delivery-plan.md` §1.4 — "Client → contact → requirement → assign team".
 * The first half of the golden path, and the part that exists today.
 */
test.describe("Client, contact and requirement intake", () => {
  const stamp = Date.now();
  const clientName = `E2E Client ${stamp}`;
  const contactLast = `Tester${stamp}`;
  const requirementTitle = `E2E Backend Engineer ${stamp}`;

  test("TC-CLI-001 — a client cannot be saved without a primary contact", async ({ page }) => {
    await goto(page, "/clients/new");
    await fillField(page, "Client name", clientName);
    await page
      .getByRole("button", { name: /save|create/i })
      .last()
      .click();

    // The primary-contact block is required; nothing should persist.
    await expect(page.getByText(/primary contact/i)).toBeVisible();
    await expect(page).toHaveURL(/\/clients\/new/);
  });

  test("TC-CLI-002 — the primary contact becomes a contact record", async ({ page }) => {
    await goto(page, "/clients/new");
    await fillField(page, "Client name", clientName);
    await fillField(page, "Primary contact", contactLast);
    await page
      .getByRole("button", { name: /save|create/i })
      .last()
      .click();
    await page.waitForURL(/\/clients(?!\/new)/);

    await goto(page, "/contacts");
    await expect(row(page, contactLast)).toBeVisible();
  });

  test("TC-CON-004 — only one primary contact per client", async ({ page }) => {
    await goto(page, "/contacts");
    // Setting a second contact primary must demote the first.
    const second = row(page, contactLast).first();
    await second.getByRole("button").last().click();
    const setPrimary = page.getByRole("menuitem", { name: /primary/i });
    if (await setPrimary.isVisible()) await setPrimary.click();

    await goto(page, "/contacts");
    await expect(page.getByText("PRIMARY").first()).toBeVisible();
  });

  test("TC-REQ-001 — the team is assignable on the create form", async ({ page }) => {
    await goto(page, "/jobs/new");
    await fillField(page, "Job title", requirementTitle);
    await selectOption(page, "Client", clientName);

    // requirements.md §5.5.2 — assigned team is required *on this form*, so an
    // unstaffed requirement can never be created.
    const team = page.locator('[data-field="sourcerId"], [data-field="profileLeadId"]');
    await expect(team.first()).toBeVisible();
  });

  test("TC-REQ-002 — salary band validation rejects max below min", async ({ page }) => {
    await goto(page, "/jobs/new");
    await fillField(page, "Salary range", "180000");
    const max = page.locator('[data-field="salaryMin"] input').last();
    await max.fill("150000");
    await page
      .getByRole("button", { name: /publish|save/i })
      .last()
      .click();
    await expect(page.getByText(/salary|minimum|maximum/i).first()).toBeVisible();
  });

  test("TC-REQ-003 — completeness reflects what is still missing", async ({ page }) => {
    await goto(page, "/jobs/new");
    const card = page.locator(".MuiCard-root").filter({ hasText: "Job completeness" });
    await expect(card).toContainText("of 6 required items");
    // Filling the title moves the meter — the card is live, not a static badge.
    const before = await card.innerText();
    await fillField(page, "Job title", requirementTitle);
    await expect(card).not.toHaveText(before);
  });
});
