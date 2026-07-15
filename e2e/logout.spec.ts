import { expect, test } from "@playwright/test";
import { login, newAccount, register } from "./helpers";

// Fresh admin: open the appbar avatar menu → Log out → land on /login, and
// confirm the app bounces an unauthenticated visit to "/" back to /login.
test.describe
  .serial("logout", () => {
    const acct = newAccount("logout");

    test.beforeAll(async ({ browser }) => {
      const p = await browser.newPage();
      await register(p, acct);
      await p.close();
    });

    test("logs out from the avatar menu and cannot return to /", async ({
      page,
    }) => {
      await login(page, acct.email);
      await expect(page.getByText("Troy", { exact: true })).toBeVisible();

      // The appbar avatar is an MUI Avatar whose only accessible hook is its
      // title attribute = the user's name ("Test Admin").
      await page.getByTitle(acct.name).click();
      await page.getByRole("menuitem", { name: "Log out" }).click();

      await page.waitForURL("**/login", { timeout: 20_000 });
      await expect(page.locator('input[name="email"]')).toBeVisible();

      // The authentication guard bounces an unauthenticated "/" back to login.
      await page.goto("/");
      await page.waitForURL("**/login", { timeout: 20_000 });
    });
  });
