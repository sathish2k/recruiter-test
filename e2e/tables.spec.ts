import { expect, test } from "@playwright/test";
import { apiCreateJob, apiLogin } from "./api-helpers";
import { login, newAccount, register } from "./helpers";

// Exercises the Jobs table (TableFilterExportRenderer): search, a filter
// popover, sortable column headers, server-side pagination (pageSize 5), and the
// export menu. Jobs are agency-scoped, so this fresh admin's table holds exactly
// the seven seeded jobs below — no unique-marker hack or spec-ordering needed.
// Titles are ordered Alpha … Zulu so a title sort is deterministic; two share
// the "Corely" client for the filter test.
const JOBS = [
  { title: "Alpha", client: "Nortech", status: "Active" },
  { title: "Bravo", client: "Fablio", status: "Active" },
  { title: "Charlie", client: "Vantor", status: "Draft" },
  { title: "Delta", client: "Corely", status: "Active" },
  { title: "Echo", client: "Corely", status: "Draft" },
  { title: "Foxtrot", client: "Mistvale", status: "Active" },
  { title: "Zulu", client: "Nortech", status: "Active" },
];

test.describe
  .serial("jobs table", () => {
    const acct = newAccount("tables");

    test.beforeAll(async ({ browser, request }) => {
      const p = await browser.newPage();
      await register(p, acct);
      await p.close();
      const { token } = await apiLogin(request, acct.email);
      // Seed sequentially so insertion order (default _id sort) is Alpha … Zulu.
      for (const job of JOBS) {
        await apiCreateJob(request, token, job);
      }
    });

    test.beforeEach(async ({ page }) => {
      await login(page, acct.email);
      await page.goto("/jobs");
    });

    test("search narrows rows to matching titles", async ({ page }) => {
      const search = page.getByPlaceholder(/Search jobs/);
      await search.fill("Delta");
      await expect(page.getByText("Delta")).toBeVisible();
      await expect(page.getByText("Alpha")).toHaveCount(0);
    });

    test("the Client filter popover narrows rows, then clears", async ({
      page,
    }) => {
      // Filters are responsive; on a desktop viewport the "Client" filter button
      // is visible (it collapses only on narrow widths). Its label collides with
      // the "Client" sort header, so scope to the first match (filters render
      // before the table).
      await page.getByRole("button", { name: "Client" }).first().click();
      // The popover renders checkbox rows; scope to the popover paper so we don't
      // match "Corely" inside a table cell.
      await page
        .locator(".MuiPopover-paper")
        .getByText("Corely", { exact: true })
        .click();
      await page.keyboard.press("Escape");

      // Only the two Corely jobs remain; a Fablio job is filtered out.
      await expect(page.getByText("Delta")).toBeVisible();
      await expect(page.getByText("Bravo")).toHaveCount(0);

      // "Clear all" restores the filtered-out row.
      await page.getByRole("button", { name: "Clear all" }).click();
      await expect(page.getByText("Bravo")).toBeVisible();
    });

    test("sorting the title column flips the first row asc/desc", async ({
      page,
    }) => {
      // The "Role" column header (the title cell) is sortable. Scope to the table
      // so we don't hit the "Role" filter button of the same name. Regex
      // tolerates MUI TableSortLabel appending "sorted ascending" to the
      // accessible name once the column becomes active.
      const roleHeader = page
        .locator("table")
        .getByRole("button", { name: /^Role/ });

      // Wait for the (server-fetched) page to settle before sorting, else the
      // first click can race the initial SWR load.
      await expect(page.locator("tbody tr")).toHaveCount(5);

      await roleHeader.click(); // ascending → Alpha first
      await page.waitForURL(/sortDir=asc/);
      await expect(page.locator("tbody tr").first()).toContainText("Alpha");

      await roleHeader.click(); // descending → Zulu first
      await page.waitForURL(/sortDir=desc/);
      await expect(page.locator("tbody tr").first()).toContainText("Zulu");
    });

    test("pagination advances to the next page of results", async ({
      page,
    }) => {
      // Default _id sort = insertion order. With pageSize 5, "Zulu" (last
      // inserted) lives on page 2 only.
      await expect(page.getByText("Alpha")).toBeVisible();
      await expect(page.getByText("Zulu")).toHaveCount(0);

      await page.getByRole("button", { name: "Go to page 2" }).click();
      await expect(page.getByText("Zulu")).toBeVisible();
      await expect(page.getByText("Alpha")).toHaveCount(0);
    });

    test("the Export button opens the format menu", async ({ page }) => {
      await page.getByRole("button", { name: "Export" }).click();
      // The menu lists the three configured formats (labels resolve from
      // jobs.translations.json). A real file download is not asserted.
      await expect(page.getByRole("menuitem", { name: /PDF/ })).toBeVisible();
      await expect(page.getByRole("menuitem", { name: /Excel/ })).toBeVisible();
      await expect(page.getByRole("menuitem", { name: /Word/ })).toBeVisible();
    });
  });
