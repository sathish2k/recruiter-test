import { expect, test } from "@playwright/test";
import { apiCreateClient, apiLogin } from "./api-helpers";
import { login, newAccount, register } from "./helpers";

// Fresh admin drives the Clients screen. It's a card grid (ClientsComponent):
// a search + segmented status filter, four summary stat cards, an "Add Client"
// modal (FormModal), and one ClientCard per client. Create is fully driveable
// via the UI modal; we also API-seed a client to prove the grid renders server
// data. The ClientCard's old "View details" action (which pointed at a
// non-existent client-detail route) has been removed — the card no longer
// navigates, so this spec asserts the card renders and does not expect a link.
test.describe
  .serial("clients", () => {
    const acct = newAccount("clients");
    const seededName = `Seeded Client ${Date.now()}`;
    const createdName = `Modal Client ${Date.now()}`;

    test.beforeAll(async ({ browser, request }) => {
      const p = await browser.newPage();
      await register(p, acct);
      await p.close();
      // API-seed one client so the grid has server data on first render.
      const { token } = await apiLogin(request, acct.email);
      await apiCreateClient(request, token, {
        name: seededName,
        industry: "Fintech",
        manager: "Riya Kapoor",
      });
    });

    test.beforeEach(async ({ page }) => {
      await login(page, acct.email);
    });

    test("renders the Clients screen with stat cards and the seeded client", async ({
      page,
    }) => {
      await page.goto("/clients");
      // Summary stat cards (labels resolve from clients.translations.json).
      // exact:true — the card metric label "Open roles" (lowercase) also exists.
      await expect(
        page.getByText("Active Clients", { exact: true }),
      ).toBeVisible();
      await expect(page.getByText("Open Roles", { exact: true })).toBeVisible();
      // The API-seeded client's card renders in the grid.
      await expect(page.getByText(seededName)).toBeVisible();
      // The "Add Client" CTA opens the create modal.
      await expect(
        page.getByRole("button", { name: "Add Client" }),
      ).toBeVisible();
      // The card no longer carries a "View details" navigation affordance.
      await expect(page.getByText("View details")).toHaveCount(0);
    });

    test("creates a client through the Add Client modal and it appears", async ({
      page,
    }) => {
      await page.goto("/clients");
      await page.getByRole("button", { name: "Add Client" }).click();

      const dialog = page.getByRole("dialog");
      await expect(dialog.getByText("Add client")).toBeVisible();
      await dialog.locator('input[name="name"]').fill(createdName);
      await dialog.locator('input[name="industry"]').fill("SaaS");
      // "Account lead" is an enum select (combobox) — pick a valid option.
      await dialog.getByRole("combobox").click();
      await page.getByRole("option", { name: "Dev Shah" }).click();
      await dialog.getByRole("button", { name: "Create client" }).click();

      // Toast confirms, then the refetched grid shows the new card. exact:true —
      // the transient toast subtitle also embeds the name ("<name> — add …").
      await expect(page.getByText("Client created")).toBeVisible();
      await expect(page.getByText(createdName, { exact: true })).toBeVisible();
    });

    test("the segmented status filter narrows the grid", async ({ page }) => {
      await page.goto("/clients");
      // Both seeded/created clients default to "hiring" status. The segmented
      // filter is MUI Tabs (All / Hiring / Paused) whose labels carry a count,
      // e.g. "Paused (0)" — match by regex. Selecting "Paused" hides hiring cards.
      await expect(page.getByText(seededName)).toBeVisible();
      await page.getByRole("tab", { name: /Paused/ }).click();
      await expect(page.getByText(seededName)).toHaveCount(0);
      // Back to "Hiring" restores them.
      await page.getByRole("tab", { name: /Hiring/ }).click();
      await expect(page.getByText(seededName)).toBeVisible();
    });
  });
