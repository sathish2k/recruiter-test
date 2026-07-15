import { expect, test } from "@playwright/test";
import { login, newAccount, register, uniqueEmail } from "./helpers";

// A second pass over Settings covering flows the first settings.spec skipped:
// member deactivation, the permissions "Reset" revert, and the profile password
// change (wrong-then-right + re-login). Uses its own throwaway admin so the
// password change at the end doesn't affect any other spec. Users are
// agency-scoped, so this admin's Members table only ever holds itself + its
// own invites.
test.describe
  .serial("settings extra", () => {
    const acct = newAccount("settings-extra");
    const newPassword = "NewPassw0rd1";

    test.beforeAll(async ({ browser }) => {
      const p = await browser.newPage();
      await register(p, acct);
      await p.close();
    });

    test.beforeEach(async ({ page }) => {
      // Uses the current (possibly-changed) password. The password-change test
      // runs LAST, so every prior beforeEach still logs in with the original.
      await login(page, acct.email);
    });

    test("invites a member then deactivates them (row removed)", async ({
      page,
    }) => {
      const inviteEmail = uniqueEmail("deact");
      await page.goto("/settings");
      await expect(page.getByText("Members", { exact: true })).toBeVisible();

      // Invite (status "invited").
      await page.getByRole("button", { name: "Invite member" }).click();
      const inviteDialog = page.getByRole("dialog");
      await inviteDialog.locator('input[name="email"]').fill(inviteEmail);
      await inviteDialog.getByRole("combobox").click();
      await page.getByRole("option", { name: "Employee", exact: true }).click();
      await inviteDialog.getByRole("button", { name: "Send invite" }).click();
      await expect(page.getByText("Invite sent")).toBeVisible();

      const inviteRow = page.getByRole("row").filter({ hasText: inviteEmail });
      await expect(inviteRow).toBeVisible();

      // Kebab (aria-label "actions") → Deactivate… → confirm modal → Deactivate.
      await inviteRow.getByRole("button", { name: "actions" }).click();
      await page.getByRole("menuitem", { name: /Deactivate/ }).click();
      const confirm = page.getByRole("dialog");
      const confirmBtn = confirm.getByRole("button", {
        name: "Deactivate",
        exact: true,
      });
      await expect(confirmBtn).toBeVisible();
      await confirmBtn.click();

      // Toast + the deactivated user is excluded from the refetched list.
      await expect(page.getByText("Member deactivated")).toBeVisible();
      await expect(
        page.getByRole("row").filter({ hasText: inviteEmail }),
      ).toHaveCount(0);
    });

    test("permissions Reset reverts an unsaved cell toggle", async ({
      page,
    }) => {
      await page.goto("/settings");
      await expect(page.getByText("Role permissions")).toBeVisible();

      // Column order: Permission(0), Admin(1), Profile Lead(2), Employee(3),
      // Client(4). Toggle the Employee cell of the "Manage roles / jobs" row.
      const rowFor = () =>
        page.getByRole("row").filter({ hasText: "Manage roles / jobs" });
      const empCell = rowFor().getByRole("cell").nth(3);
      const before = (await empCell.innerText()).trim();

      await empCell.click();
      await page.getByRole("menuitem", { name: "Create" }).click();
      await page.keyboard.press("Escape");
      const after = (await empCell.innerText()).trim();
      expect(after).not.toBe(before);

      // "Reset" (enabled only while dirty) discards the unsaved edit → back to
      // the baseline value, without any Save.
      await page.getByRole("button", { name: "Reset" }).click();
      await expect(rowFor().getByRole("cell").nth(3)).toHaveText(before);
    });

    // LAST for this account: change the password, then re-login with it.
    test("profile password change: wrong current errors, correct succeeds", async ({
      page,
    }) => {
      await page.goto("/settings/profile");
      await expect(page.getByText("Password", { exact: true })).toBeVisible();

      // Wrong current password → API 422 surfaced as an error toast.
      await page
        .locator('input[name="currentPassword"]')
        .fill("TotallyWrong99");
      await page.locator('input[name="newPassword"]').fill(newPassword);
      await page.getByRole("button", { name: "Update password" }).click();
      await expect(
        page.getByText("Current password is incorrect"),
      ).toBeVisible();

      // Correct current password + valid new password → success.
      await page.locator('input[name="currentPassword"]').fill(acct.password);
      await page.locator('input[name="newPassword"]').fill(newPassword);
      await page.getByRole("button", { name: "Update password" }).click();
      await expect(page.getByText("Password updated")).toBeVisible();

      // The new password actually works: log out and back in with it.
      await page.getByTitle(acct.name).click();
      await page.getByRole("menuitem", { name: "Log out" }).click();
      await page.waitForURL("**/login", { timeout: 20_000 });

      await login(page, acct.email, newPassword);
      await expect(page.getByText("Troy", { exact: true })).toBeVisible();
    });
  });
