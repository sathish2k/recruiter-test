import { expect, type Locator, type Page, test } from "@playwright/test";

/**
 * The clients journey, end to end in a real browser: list → add → detail →
 * edit → archive.
 *
 * Two of these assertions exist because the behaviour regressed once and the
 * failure was invisible from the screen you were on:
 *
 * - Re-opening the edit form used to seed every select from the JSON-schema
 *   default rather than the stored row, so saving an untouched form silently
 *   demoted a *Hiring* client to *Prospect*. "Edit and save changes nothing"
 *   is the test that would have caught it.
 * - Archiving hid the client from the list but left it inside the stats query,
 *   so the "Active clients" tile kept counting a client nobody could see.
 *
 * The forms label their fields with a `<p>`, not a `<label for>`, so getByLabel
 * finds nothing here — reach the control through its label paragraph instead.
 */

const STATUS = "hiring";
const SIZE = "201-1000";

function clientName(tag: string) {
  return `E2E ${tag} ${Date.now().toString(36)}`;
}

/** The field group wrapping a label paragraph — the control is its sibling. */
function field(page: Page, label: string) {
  return page.locator(`xpath=//p[normalize-space(text())=${JSON.stringify(label)}]/..`);
}

/** MUI keeps the enum value on the option and in a shadow input beside the
 * combobox, so both halves address the value, never the localised label. */
async function pickOption(page: Page, label: string, value: string) {
  await field(page, label).getByRole("combobox").click();
  await page.locator(`li[role="option"][data-value="${value}"]`).click();
}

function selectValue(page: Page, label: string) {
  return field(page, label).locator("input").inputValue();
}

/**
 * The "Active Clients" tile.
 *
 * Read the value out of its own element — the tile's textContent runs the
 * value straight into the delta ("7" + "6 currently hiring" = "76"), so
 * scraping the card as a whole silently reads a different number.
 */
async function activeClients(page: Page) {
  const tile = page.locator(".MuiCard-root").filter({ hasText: "Active Clients" }).first();
  const spans = await tile.locator("span").allTextContents();
  const value = spans.map((s) => s.trim()).find((s) => /^\d[\d,]*$/.test(s));
  return Number((value ?? "").replace(/,/g, "")) || Number.NaN;
}

function cardFor(page: Page, name: string) {
  return page.locator('[data-testid="client-card"]').filter({ hasText: name });
}

/**
 * The grid pages at six, so a freshly created client is not reliably on the
 * first page. Search for it rather than assuming where it landed.
 */
async function findCard(page: Page, name: string) {
  await page.getByPlaceholder(/Search clients/).fill(name);
  const card = cardFor(page, name);
  await expect(card).toBeVisible();
  return card;
}

async function createClient(page: Page, name: string) {
  await page.goto("/clients");
  await page.getByRole("button", { name: "Add client" }).click();
  await page.getByPlaceholder("e.g. Acme Corp").fill(name);
  await pickOption(page, "Client status", STATUS);
  await pickOption(page, "Company size", SIZE);
  await page.getByRole("button", { name: "Save client", exact: true }).click();
  // Landing back on the list is the signal the mutation resolved.
  await page.waitForURL(/\/clients(\?|$)/);
  return findCard(page, name);
}

async function openEdit(page: Page, card: Locator) {
  await card.getByTitle("Edit client").click();
  await page.waitForURL(/\/clients\/[^/]+\/edit$/);
}

/**
 * Every test here leaves a client behind, and an active client is not inert —
 * it counts toward the "Active Clients" tile the archive test asserts on. So
 * put them away afterwards; otherwise the suite poisons its own fixture a few
 * runs later. Cookies ignore the port, so the browser's session reaches the API
 * on :3001 directly. Best-effort: a cleanup failure must not fail the run.
 */
test.afterEach(async ({ page }) => {
  try {
    const list = await page.request.get("http://localhost:3001/clients?search=E2E&pageSize=100");
    if (!list.ok()) return;
    const rows = ((await list.json()).data ?? []) as Array<{ id: string; name: string }>;
    for (const row of rows.filter((r) => r.name.startsWith("E2E "))) {
      await page.request.post(`http://localhost:3001/clients/${row.id}/archive`);
    }
  } catch {
    // Leaving a stray test client behind is not worth failing a green run over.
  }
});

test("a new client appears on the list with the status it was given", async ({ page }) => {
  const card = await createClient(page, clientName("create"));

  await expect(card).toContainText("Hiring");
});

test("the detail screen opens from the card", async ({ page }) => {
  const name = clientName("detail");
  const card = await createClient(page, name);

  await card.getByTitle("Open client").click();
  await page.waitForURL(/\/clients\/[^/]+$/);
  await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
});

test("the edit form is seeded from the stored client, not the schema defaults", async ({
  page,
}) => {
  const name = clientName("prefill");
  await openEdit(page, await createClient(page, name));

  await expect(page.getByPlaceholder("e.g. Acme Corp")).toHaveValue(name);
  expect(await selectValue(page, "Client status")).toBe(STATUS);
  expect(await selectValue(page, "Company size")).toBe(SIZE);
});

test("editing and saving without touching a field changes nothing", async ({ page }) => {
  const name = clientName("nochange");
  await openEdit(page, await createClient(page, name));

  // Save an untouched form — the exact gesture that used to reset the status.
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page.waitForURL(/\/clients(\?|$)/);

  await expect(await findCard(page, name)).toContainText("Hiring");
});

test("archiving hides the client and drops the active count", async ({ page }) => {
  const name = clientName("archive");
  const card = await createClient(page, name);

  const before = await activeClients(page);
  expect(before).not.toBeNaN();

  await card.getByTitle("More").click();
  await page.getByRole("menuitem", { name: "Archive" }).click();
  await page.getByRole("button", { name: "Archive client", exact: true }).click();

  await expect(cardFor(page, name)).toHaveCount(0);

  // Re-read from the server: the bug was the stats query counting archived
  // clients, which a warm client-side cache would hide.
  await page.reload();
  await expect.poll(() => activeClients(page)).toBe(before - 1);
});
