import { expect, request, test } from "@playwright/test";

/**
 * The onboarding journey, walked end to end the way a real agency walks it:
 *
 *   create account → verify the email → log in → set the workspace up → dashboard
 *
 * `00-signup-verify-setup.spec.ts` covers each of those pieces on its own and
 * fails precisely when one breaks. This file covers the *seams* between them —
 * that verifying really does let you in, that the guard bounces you to login,
 * that finishing the wizard really does land on the dashboard — which is what
 * `delivery-plan.md` exit criterion 1 actually asks for.
 *
 * It runs signed out: the shared storage state would skip the very steps under
 * test.
 */

const API = process.env.E2E_API_URL ?? "http://localhost:3001";
const PASSWORD = "Passw0rd!23";

test.describe("onboarding, end to end", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  // Five screens, a login and seven server round trips: this one journey does
  // more than a whole file of focused tests, so it gets its own budget rather
  // than raising the default for everything.
  test.setTimeout(180_000);

  test("TC-JOURNEY-001 — sign up, verify, log in, set up, land on the dashboard", async ({
    page,
  }) => {
    // A fresh agency every run; the workspace name has to be unique or the
    // account joins the existing one instead of provisioning its own.
    const stamp = `${Date.now()}-${Math.floor(Math.random() * 1e4)}`;
    const email = `e2e-journey-${stamp}@example.com`;
    const agency = `E2E Journey Co ${stamp}`;

    // ── 1. Create the account ────────────────────────────────────────────
    await page.goto("/create-account");
    await page.getByPlaceholder("Full name").fill("Riya Kapoor");
    await page.getByPlaceholder("Agency name").fill(agency);
    await page.getByPlaceholder("Work email").fill(email);
    await page.getByPlaceholder("Password (8+ characters)").fill(PASSWORD);
    await page.getByRole("button", { name: /create account/i }).click();

    // Sign-up hands off to verification, not to login — §5.1.2.
    await expect(page).toHaveURL(new RegExp(`/verify\\?email=${encodeURIComponent(email)}`), {
      timeout: 30_000,
    });
    await expect(page.getByTestId("verify-pending")).toContainText(email);

    // ── 2. Verify the email ──────────────────────────────────────────────
    // The code only exists in the user's inbox, so the test reads it through
    // the E2E_ENABLED-only helper route.
    const api = await request.newContext({ baseURL: API });
    const issued = await api.get("/e2e/verification-code", { params: { email } });
    expect(issued.ok()).toBeTruthy();
    const { code } = (await issued.json()).data as { code: string };
    expect(code).toMatch(/^\d{6}$/);

    await page.getByTestId("field-code").locator("input").fill(code);
    await page.getByRole("button", { name: /verify email/i }).click();
    await expect(page.getByTestId("verify-done")).toBeVisible();

    // ── 3. Log in ────────────────────────────────────────────────────────
    // Registration runs server-side and never puts a session in the browser,
    // so the guard on the setup route sends the new user to login first.
    await page.getByTestId("verify-continue").click();
    await expect(page).toHaveURL(/\/login/, { timeout: 30_000 });

    await page.getByPlaceholder("Email").fill(email);
    await page.getByPlaceholder("Password").first().fill(PASSWORD);
    await page.getByRole("button", { name: /sign in|log in/i }).click();
    await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 30_000 });

    // ── 4. Set the workspace up ──────────────────────────────────────────
    const loaded = page.waitForResponse(
      (r) => r.url().includes("/onboarding/setup") && r.request().method() === "GET",
    );
    await page.goto("/setup");
    await loaded;
    await expect(page.getByTestId("wizard-rail-basics")).toHaveAttribute("data-state", "current");

    // A brand-new workspace opens on step 1 with no resume banner.
    await expect(page.getByTestId("wizard-resumed")).toHaveCount(0);

    // Walk all five steps, waiting for each autosave rather than racing it.
    for (const next of ["stages", "reasons", "team", "review"]) {
      const saved = page.waitForResponse(
        (r) => r.url().includes("/onboarding/setup") && r.request().method() === "PUT",
      );
      await page.getByTestId("wizard-next").click();
      await saved;
      await expect(page.getByTestId(`wizard-rail-${next}`)).toHaveAttribute(
        "data-state",
        "current",
      );
    }

    // ── 5. Finish → the dashboard ────────────────────────────────────────
    await page.getByTestId("wizard-finish").click();
    await page.waitForURL((url) => url.pathname === "/", { timeout: 30_000 });
    // The sidenav only exists inside the core layout, so it is the proof that
    // a signed-in screen rendered rather than a redirect back to auth.
    await expect(page.getByRole("complementary")).toBeVisible();

    // ── 6. The workspace the journey just built ──────────────────────────
    // Verification is what unlocked writes: the same call was 403 before it.
    const session = await request.newContext({ baseURL: API });
    const login = await session.post("/api/auth/sign-in/email", {
      data: { email, password: PASSWORD },
    });
    expect(login.ok()).toBeTruthy();
    const created = await session.post("/clients", { data: { name: `${agency} First Client` } });
    expect(created.status()).toBe(201);

    // And the checklist notices, because it reads records rather than a flag.
    await page.goto("/get-started");
    await expect(page.getByTestId("checklist-client")).toHaveAttribute("data-done", "true");
  });

  test("TC-SEC-002 — the test-only route refuses addresses it does not own", async () => {
    const api = await request.newContext({ baseURL: API });

    // Mounted only under E2E_ENABLED, and even then only for test addresses,
    // so a real account's code is never readable through it.
    const refused = await api.get("/e2e/verification-code", {
      params: { email: "someone@a-real-agency.com" },
    });
    expect(refused.status()).toBe(403);
  });
});
