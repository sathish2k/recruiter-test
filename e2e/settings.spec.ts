import { expect, test } from "@playwright/test";
import { login, newAccount, register, uniqueEmail } from "./helpers";

// Fresh admin exercises the whole settings surface: members/invite, role
// change, permissions matrix, profile, email templates, AI screening, and
// automation. Users are agency-scoped, so a fresh admin's Members table starts
// with exactly one row (itself) and grows only by invites this spec sends.
test.describe
  .serial("settings", () => {
    const acct = newAccount("settings");

    test.beforeAll(async ({ browser }) => {
      const p = await browser.newPage();
      await register(p, acct);
      await p.close();
    });

    test.beforeEach(async ({ page }) => {
      await login(page, acct.email);
    });

    test("members table marks the current admin as (you), agency-scoped", async ({
      page,
    }) => {
      await page.getByText("Settings", { exact: true }).click();
      await page.waitForURL("**/settings");
      await expect(page.getByText("Members", { exact: true })).toBeVisible();
      await expect(page.getByText(`${acct.name} (you)`)).toBeVisible();
      // Agency-scoped: the Members table holds exactly one member (the admin)
      // before any invite. Scope to the members table (the settings page also
      // renders a Role permissions table) — header row + a single body row.
      const membersTable = page
        .getByRole("table")
        .filter({ hasText: `${acct.name} (you)` });
      await expect(membersTable.getByRole("row")).toHaveCount(2);
    });

    test("invites a member and changes their role", async ({ page }) => {
      const inviteEmail = uniqueEmail("invitee");
      await page.goto("/settings");
      await expect(page.getByText("Members", { exact: true })).toBeVisible();

      // Open the invite modal, fill email + role, submit.
      await page.getByRole("button", { name: "Invite member" }).click();
      const dialog = page.getByRole("dialog");
      await dialog.locator('input[name="email"]').fill(inviteEmail);
      await dialog.getByRole("combobox").click();
      await page.getByRole("option", { name: "Employee", exact: true }).click();
      await dialog.getByRole("button", { name: "Send invite" }).click();

      await expect(page.getByText("Invite sent")).toBeVisible();
      const inviteRow = page.getByRole("row").filter({ hasText: inviteEmail });
      await expect(inviteRow).toBeVisible();
      await expect(inviteRow.getByText("Invited")).toBeVisible();

      // Change the invited member's role via the role pill menu. The shared
      // RoleRenderer now resolves its option translation keys, so the pill and
      // menu items render real labels (Admin / Profile Lead / Employee / Client).
      await inviteRow
        .getByRole("button", { name: "Employee", exact: true })
        .click();
      await page
        .getByRole("menuitem", { name: "Profile Lead", exact: true })
        .click();
      await expect(page.getByText("Role updated")).toBeVisible();
      await expect(
        page
          .getByRole("row")
          .filter({ hasText: inviteEmail })
          .getByText("Profile Lead"),
      ).toBeVisible();
    });

    test("toggles a permission cell, saves, and it persists", async ({
      page,
    }) => {
      await page.goto("/settings");
      await expect(page.getByText("Role permissions")).toBeVisible();

      const rowFor = (p = page) =>
        p.getByRole("row").filter({ hasText: "Manage roles / jobs" });
      // Column order: Permission(0), Admin(1), Profile Lead(2), Employee(3), Client(4).
      const empCell = rowFor().getByRole("cell").nth(3);
      const before = (await empCell.innerText()).trim();

      await empCell.click();
      await page.getByRole("menuitem", { name: "Create" }).click();
      await page.keyboard.press("Escape");
      const after = (await empCell.innerText()).trim();
      expect(after).not.toBe(before);

      await page.getByRole("button", { name: "Save changes" }).click();
      await expect(page.getByText("Permissions updated")).toBeVisible();

      // Reload — the persisted state loads and the cell keeps the toggled value.
      await page.reload();
      await expect(page.getByText("Role permissions")).toBeVisible();
      await expect(rowFor().getByRole("cell").nth(3)).toHaveText(after);
    });

    test("updates the profile (phone + timezone)", async ({ page }) => {
      await page.goto("/settings");
      await page.getByRole("tab", { name: "My profile" }).click();
      await page.waitForURL("**/settings/profile");

      await page.locator('input[name="phone"]').fill("+1 555 010 2244");
      await page.getByRole("combobox").first().click();
      await page
        .getByRole("option", { name: "America/New_York (EST)" })
        .click();

      await page.getByRole("button", { name: "Save changes" }).click();
      await expect(page.getByText("Changes saved")).toBeVisible();
    });

    test("edits, creates and deletes an email template", async ({ page }) => {
      await page.goto("/settings");
      await page.getByRole("tab", { name: "Email templates" }).click();
      await page.waitForURL("**/settings/templates");

      // The 6 defaults seed on first load.
      await expect(page.getByText("Application received")).toBeVisible();
      await expect(page.getByText("Interview invitation")).toBeVisible();

      // Edit a subject and save.
      await page.getByText("Application received").click();
      const subject = page.getByPlaceholder("Email subject line");
      await subject.fill("We received your application (updated)");
      await page.getByRole("button", { name: "Save changes" }).click();
      await expect(page.getByText("Template saved")).toBeVisible();

      // "+ New" creates a template.
      await page.getByRole("button", { name: "New", exact: true }).click();
      await expect(page.getByText("Template created")).toBeVisible();

      // Delete the freshly-created (now-selected) template.
      await page.getByRole("button", { name: "Delete" }).click();
      await expect(page.getByText("Template deleted")).toBeVisible();
    });

    test("AI screening threshold + toggle auto-persist", async ({ page }) => {
      await page.goto("/");
      await page
        .getByRole("complementary")
        .getByText("AI Screening", { exact: true })
        .click();
      await page.waitForURL("**/ai-screening");

      // Threshold is stepped by +/- IconButtons (both aria-label "Match
      // threshold"); the value Typography sits between them. Scope to that
      // control's container so we don't match KPI percentages elsewhere.
      const thresholdValue = (p = page) =>
        p
          .getByRole("button", { name: "Match threshold" })
          .first()
          .locator("xpath=..")
          .getByText(/^\d+%$/);
      const before = (await thresholdValue().innerText()).trim();
      // The plus button is color=primary; both share the aria-label, so the
      // second (add) one increments.
      await page
        .getByRole("button", { name: "Match threshold" })
        .nth(1)
        .click();
      await expect(page.getByText("Screening settings saved")).toBeVisible();
      await expect(thresholdValue()).not.toHaveText(before);
      const after = (await thresholdValue().innerText()).trim();

      // Toggle a switch (also auto-persists). The label and Switch are separate
      // elements, so click the Switch itself.
      await page.getByRole("switch").first().click();
      await expect(page.getByText("Screening settings saved")).toBeVisible();

      // Reload — the threshold persisted.
      await page.reload();
      await expect(thresholdValue()).toHaveText(after);
    });

    test("automation recipe toggle persists", async ({ page }) => {
      await page.goto("/");
      await page
        .getByRole("complementary")
        .getByText("Automation", { exact: true })
        .click();
      await page.waitForURL("**/automation");

      // Recipes seed lazily on first GET. The first card is "Score CVs on upload"
      // (enabled by default) — toggle it off.
      await expect(page.getByText("Score CVs on upload").first()).toBeVisible();
      const firstSwitch = page.getByRole("switch").first();
      const wasOn = await firstSwitch.isChecked();
      await firstSwitch.click();
      await expect(
        page.getByText(
          wasOn ? "Automation turned off" : "Automation turned on",
        ),
      ).toBeVisible();

      // Reload — the new state persisted.
      await page.reload();
      await expect(page.getByRole("switch").first()).toBeChecked({
        checked: !wasOn,
      });
    });
  });
