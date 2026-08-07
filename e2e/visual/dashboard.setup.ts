import { expect, request as playwrightRequest, test as setup } from "@playwright/test";

const AUTH_FILE = "e2e/.auth/visual.json";
const API = process.env.E2E_API_URL ?? "http://localhost:3001";

/**
 * The dashboard is the one design surface that cannot render from configuration
 * alone — every widget on it is a count of something. So unlike the auth
 * screens, this suite needs a session *and* a populated workspace.
 *
 * Provisioning is idempotent: register only if the address is unknown, verify
 * only if it is unverified. That way the same command works against a laptop
 * database that already has the account and a CI database that has never seen
 * it, without a separate bootstrap step.
 *
 * Credentials come from the environment — never commit a working login.
 */
setup("authenticate and provision", async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "Set E2E_EMAIL and E2E_PASSWORD to run the visual dashboard suite — put " +
        "them in .env (gitignored), which the config loads. They should name a " +
        "seeded test workspace, not a real agency.",
    );
  }

  const api = await playwrightRequest.newContext({
    baseURL: API,
    extraHTTPHeaders: { "content-type": "application/json" },
  });

  // 201 on a fresh database, a 4xx once the address is taken — both fine.
  const registered = await api.post("/auth/register", {
    data: { fullName: "Ana Novak", agency: "Troy Consulting", email, password },
  });
  if (registered.ok()) {
    const { code } = await api
      .get("/e2e/verification-code", { params: { email } })
      .then((r) => r.json())
      .then((body) => body.data);
    await api.post("/auth/verify/confirm", { data: { email, code } });
  }
  await api.dispose();

  await page.goto("/login");
  await page.getByPlaceholder("you@agency.com").fill(email);
  await page.getByPlaceholder("Enter your password").first().fill(password);
  await page.getByRole("button", { name: /sign in|log in/i }).click();

  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
  // The sidenav only exists inside the core layout, so it is the signal that
  // the engine has rendered a signed-in screen.
  await expect(page.getByRole("complementary")).toBeVisible();

  await page.context().storageState({ path: AUTH_FILE });
});
