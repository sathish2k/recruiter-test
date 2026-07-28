import { expect, type Page } from "@playwright/test";

/**
 * Helpers shared by the journey specs. Kept deliberately small — a page-object
 * layer per screen tends to rot faster than the screens do, so these wrap only
 * the things every journey needs: navigation that waits for the engine to
 * render, and the config-driven table/form primitives the app is built from.
 */

/** Navigates and waits for the render tree, not just the document. */
export async function goto(page: Page, path: string) {
  await page.goto(path);
  // The engine resolves dependencies client-side; the sidenav is the first
  // thing that exists once the tree is mounted.
  await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
}

/** A row in any TableRenderer list, matched on its visible text. */
export function row(page: Page, text: string) {
  return page.locator("tbody tr").filter({ hasText: text });
}

/** Fills a labelled field in a FormWithSectionsRenderer form. */
export async function fillField(page: Page, label: string, value: string) {
  const field = page.locator("[data-field]").filter({ hasText: label }).first();
  await field.locator("input, textarea").first().fill(value);
}

/** Picks a value in one of the app's select controls (plain or type-ahead). */
export async function selectOption(page: Page, label: string, option: string) {
  const field = page.locator("[data-field]").filter({ hasText: label }).first();
  await field.locator('[role="combobox"], .MuiSelect-select').first().click();
  await page.getByRole("option", { name: option }).click();
}

/** The completeness card on the candidate and requirement forms. */
export function completeness(page: Page) {
  return page.locator(".MuiCard-root").filter({ hasText: /completeness/i });
}

/**
 * Asserts a dashboard tile's count equals the row count of the list it drills
 * through to — `test-cases.md` TC-TEN-006, the check that catches scoping
 * being reimplemented somewhere.
 */
export async function expectCountMatchesList(page: Page, tile: string, listPath: string) {
  const card = page.locator(".MuiCard-root").filter({ hasText: tile }).first();
  const shown = Number((await card.innerText()).match(/\d+/)?.[0] ?? "-1");
  await goto(page, listPath);
  await expect(page.locator("tbody tr")).toHaveCount(shown);
}
