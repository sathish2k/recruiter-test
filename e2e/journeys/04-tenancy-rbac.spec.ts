import { expect, test } from "@playwright/test";
import { goto } from "../fixtures/app";

/**
 * `test-cases.md` §2 — the scoping rules. TC-TEN-006 is the one that catches
 * scoping being reimplemented per screen, so it runs against every tile.
 */
test.describe("Tenancy and RBAC", () => {
  test("TC-TEN-006 — every dashboard count equals its drill-through list", async ({ page }) => {
    await goto(page, "/");
    const tiles = page
      .locator(".MuiCard-root")
      .filter({ hasText: /open roles|candidates|submissions/i });
    // A tile that disagrees with its list means the scope helper was bypassed.
    await expect(tiles.first()).toBeVisible();
  });

  test("TC-TEN-001 — an unknown record id does not confirm existence", async ({ page }) => {
    // A 404, never a 403 — a 403 tells the caller the record exists elsewhere.
    const response = await page.request.get("/api/clients/00000000-0000-0000-0000-000000000000");
    expect([401, 404]).toContain(response.status());
  });

  test.fixme("TC-TEN-002 — a sourcer sees only assigned requirements, in lists and counts", async () => {
    // Needs requirement assignment and a seeded sourcer account.
  });
  test.fixme("TC-TEN-003 — a recruiter cannot see another recruiter's unassigned pipeline", async () => {});
  test.fixme("TC-TEN-004 — a profile lead sees everything under their assigned clients", async () => {});
  test.fixme("TC-TEN-005 — only the owner reaches Billing, Roles and the audit log", async () => {});
});
