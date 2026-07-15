import { expect, test } from "@playwright/test";
import { login, newAccount, register } from "./helpers";

test.describe
  .serial("auth", () => {
    const acct = newAccount("auth");

    test("rejects invalid credentials", async ({ page }) => {
      await page.goto("/login");
      await page.locator('input[name="email"]').fill("nobody@e2e.test");
      await page.locator('input[name="password"]').fill("wrongpass1");
      await page.getByRole("button", { name: "Get Started" }).click();
      await expect(page).toHaveURL(/\/login/);
    });

    test("registers a new agency admin and reaches the dashboard", async ({
      page,
    }) => {
      await register(page, acct);
      await expect(page).toHaveURL(/\/login/);
      await login(page, acct.email, acct.password);
      await expect(page).toHaveURL(/\/$|\/\?/);
      await expect(page.getByText("Troy", { exact: true })).toBeVisible();
    });

    test("logs back in as the same admin", async ({ page }) => {
      await login(page, acct.email, acct.password);
      await expect(page.getByText("Troy", { exact: true })).toBeVisible();
    });
  });
