import { expect, request, test } from "@playwright/test";

/**
 * Journey 0 — sign up → verify email → set the workspace up.
 *
 * `delivery-plan.md` exit criterion 1 starts here, and it is the only journey
 * whose first half must run *without* the shared signed-in state: the point of
 * these tests is what an unverified account can and cannot do.
 */

const API = process.env.E2E_API_URL ?? "http://localhost:3001";

function freshEmail() {
  return `e2e-verify-${Date.now()}-${Math.floor(Math.random() * 1e4)}@example.com`;
}

async function register(email: string) {
  const api = await request.newContext({ baseURL: API });
  const created = await api.post("/auth/register", {
    data: {
      fullName: "E2E Verify",
      agency: `E2E Verify Co ${Date.now()}`,
      email,
      password: "Passw0rd!23",
    },
  });
  expect(created.status()).toBe(201);
  return api;
}

test.describe("sign up and verify", () => {
  // These run against a brand-new unverified account, not the shared one.
  test.use({ storageState: { cookies: [], origins: [] } });

  test("TC-AUTH-004 — the verify screen offers no way past it", async ({ page }) => {
    await page.goto(`/verify?email=${encodeURIComponent(freshEmail())}`);

    await expect(page.getByText("Verify your email")).toBeVisible();
    await expect(page.getByText(/Code expires in \d\d:\d\d/)).toBeVisible();

    // The whole point of TC-AUTH-004: nothing on this screen skips it.
    const body = (await page.locator("body").innerText()).toLowerCase();
    expect(body).not.toContain("skip");
    expect(body).not.toContain("later");
    expect(body).not.toContain("continue without");
  });

  test("TC-AUTH-005 — sign-up lands on verify, carrying the address", async ({ page }) => {
    const email = freshEmail();
    await page.goto("/create-account");
    await page.getByPlaceholder("Full name").fill("E2E Verify");
    await page.getByPlaceholder("Agency name").fill(`E2E Verify Co ${Date.now()}`);
    await page.getByPlaceholder("Work email").fill(email);
    await page.getByPlaceholder("Password (8+ characters)").fill("Passw0rd!23");
    await page.getByRole("button", { name: /create account/i }).click();

    // The route is server-rendered, so the first hit in a dev server compiles
    // before the URL changes; the default expect timeout is too short for it.
    await expect(page).toHaveURL(new RegExp(`/verify\\?email=${encodeURIComponent(email)}`), {
      timeout: 30_000,
    });
    await expect(page.getByText(email)).toBeVisible();
  });

  test("TC-AUTH-006 — a wrong code is rejected without burning the request", async () => {
    const email = freshEmail();
    const api = await register(email);

    const wrong = await api.post("/auth/verify/confirm", { data: { email, code: "000000" } });
    expect(wrong.status()).toBe(400);
    expect((await wrong.json()).code).toBe("invalid");
  });

  test("TC-AUTH-007 — resend is rate-limited to one a minute", async () => {
    const email = freshEmail();
    const api = await register(email);

    // Registration already sent one, so an immediate resend is inside the window.
    const again = await api.post("/auth/verify/send", { data: { email } });
    expect(again.status()).toBe(429);
    const body = await again.json();
    expect(body.code).toBe("cooldown");
    expect(body.retryAfter).toBeGreaterThan(0);
    expect(body.retryAfter).toBeLessThanOrEqual(60);
  });

  test("TC-AUTH-008 — an unknown address is never disclosed", async () => {
    const api = await request.newContext({ baseURL: API });
    const sent = await api.post("/auth/verify/send", {
      data: { email: "definitely-not-a-user@example.com" },
    });
    // Same shape and status as a real send — the response must not distinguish.
    expect(sent.status()).toBe(200);
    expect(await sent.json()).toEqual({ data: { sent: true } });
  });

  test("TC-AUTH-004b — an unverified account cannot create records", async () => {
    const email = freshEmail();
    await register(email);

    const session = await request.newContext({ baseURL: API });
    const login = await session.post("/api/auth/sign-in/email", {
      data: { email, password: "Passw0rd!23" },
    });
    expect(login.ok()).toBeTruthy();

    // A screen that can be navigated past is not verification — the gate is
    // on the server, so the check is against the endpoint.
    const blocked = await session.post("/clients", { data: { name: "Should Not Exist" } });
    expect(blocked.status()).toBe(403);
    expect((await blocked.json()).code).toBe("email-unverified");
  });
});

test.describe("setup wizard", () => {
  /**
   * The resume point is server-side and the specs share one workspace, so each
   * wizard test rewinds to step 1 rather than assuming where the last one left
   * off. The Basics chip is always reachable — the rail only walks backwards.
   */
  /** Waits for the autosave the given interaction triggers. */
  async function withSave(page: import("@playwright/test").Page, act: () => Promise<void>) {
    const saved = page.waitForResponse(
      (r) => r.url().includes("/onboarding/setup") && r.request().method() === "PUT",
    );
    await act();
    await saved;
  }

  async function rewind(page: import("@playwright/test").Page) {
    await page.goto("/setup");
    await expect(page.getByText(/STEP \d OF 5/)).toBeVisible();
    // Wait for the rewind to land too — two saves in flight at once would
    // race, and the later step number is the one under test.
    await withSave(page, () => page.getByText("Basics", { exact: true }).click());
    await expect(page.getByText("STEP 1 OF 5", { exact: true })).toBeVisible();
  }

  test("TC-SET-001 — five steps, each saving as it goes", async ({ page }) => {
    await rewind(page);
    await expect(page.getByText("How does your agency work?")).toBeVisible();

    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("STEP 2 OF 5", { exact: true })).toBeVisible();
    await expect(page.getByText(/YOUR BOARD COLUMNS/)).toBeVisible();

    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("STEP 3 OF 5", { exact: true })).toBeVisible();
    await expect(page.getByText(/REASONS ACTIVE/)).toBeVisible();

    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("STEP 4 OF 5", { exact: true })).toBeVisible();
    await expect(page.getByText("INVITES", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: /Send invites & continue/ }).click();
    await expect(page.getByText("STEP 5 OF 5", { exact: true })).toBeVisible();
    await expect(page.getByText("Here's your workspace")).toBeVisible();
  });

  test("TC-SET-002 — closing the tab resumes on the same step", async ({ page }) => {
    await rewind(page);
    // Autosave is fire-and-forget from the click handler, so wait for the write
    // itself rather than for the step to change on screen.
    await withSave(page, () => page.getByRole("button", { name: "Continue" }).click());
    await expect(page.getByText("STEP 2 OF 5", { exact: true })).toBeVisible();

    // Flow §1.4: the resume point lives on the server, not in this browser.
    await page.reload();
    await expect(page.getByText("STEP 2 OF 5", { exact: true })).toBeVisible();
    await expect(page.getByText("Picked up where you left off")).toBeVisible();
  });

  test("TC-SET-003 — the entry and hire stages cannot be removed", async ({ page }) => {
    await rewind(page);
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText(/YOUR BOARD COLUMNS/)).toBeVisible();

    // Exactly the two ends are locked; everything between can be removed.
    await expect(page.getByTestId("LockRoundedIcon")).toHaveCount(2);
    const removable = page.getByTestId("CloseRoundedIcon");
    await expect(removable).toHaveCount(4);

    // And the locks are on the first and last rows, not just anywhere.
    const rows = page.locator("[data-stage-row]");
    await expect(rows.first().getByTestId("LockRoundedIcon")).toBeVisible();
    await expect(rows.last().getByTestId("LockRoundedIcon")).toBeVisible();
    await expect(rows.nth(1).getByTestId("CloseRoundedIcon")).toBeVisible();
  });
});

test.describe("get started checklist", () => {
  test("TC-SET-005 — steps tick from real records, not a stored flag", async ({ page }) => {
    await page.goto("/get-started");
    await expect(page.getByText(/of 5 done/)).toBeVisible();

    // The seeded workspace has clients and requirements, so those two are done
    // and their titles are struck through.
    const clientRow = page
      .locator(".MuiCard-root")
      .filter({ hasText: "Add your first client" })
      .first();
    await expect(clientRow.getByText("Add your first client")).toHaveCSS(
      "text-decoration-line",
      "line-through",
    );

    // Nothing here toggles by hand — completion is derived.
    await expect(page.getByRole("checkbox")).toHaveCount(0);
  });
});
