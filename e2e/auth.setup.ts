import { expect, test as setup } from "@playwright/test";

const AUTH_FILE = "e2e/.auth/user.json";

/**
 * Signs in once and saves the session for every other project, so the journeys
 * below start from the dashboard rather than re-authenticating each time.
 *
 * Credentials come from the environment — never commit a working login.
 */
setup("authenticate", async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "Set E2E_EMAIL and E2E_PASSWORD to run the suite — put them in .env " +
        "(gitignored), which playwright.config.ts loads. They should name a " +
        "seeded test workspace, not a real agency.",
    );
  }

  await page.goto("/login");
  // The auth forms hide their labels and lean on placeholders (`hideLabel` in
  // the sign-in configuration), so getByLabel finds nothing here.
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password").first().fill(password);
  await page.getByRole("button", { name: /sign in|log in/i }).click();

  // TC-AUTH-009 — login lands on the dashboard, not a list view.
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
  // The sidenav only exists inside the core layout, so it is the signal that
  // the engine has rendered a signed-in screen.
  await expect(page.getByRole("complementary")).toBeVisible();
  await expect(page.getByText("Dashboard").first()).toBeVisible();

  await page.context().storageState({ path: AUTH_FILE });
});
