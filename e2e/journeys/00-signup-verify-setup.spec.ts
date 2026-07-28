import { expect, type Page, request, test } from "@playwright/test";

/**
 * Journey 0 — sign up → verify email → set the workspace up.
 *
 * `delivery-plan.md` exit criterion 1 starts here, and it is the only journey
 * whose first half must run *without* the shared signed-in state: the point of
 * these tests is what an unverified account can and cannot do.
 *
 * Selectors are `data-testid` throughout. The wizard's copy changes with the
 * design and its markup changes with the form layer; the test ids are the one
 * contract that is meant to hold.
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

    await expect(page.getByTestId("verify-pending")).toBeVisible();
    await expect(page.getByTestId("verify-expiry")).toContainText(/\d+:\d\d/);

    // The whole point of TC-AUTH-004: nothing on this screen skips it.
    const body = (await page.locator("body").innerText()).toLowerCase();
    expect(body).not.toContain("skip");
    expect(body).not.toContain("continue without");
  });

  test("TC-AUTH-004a — the code field mirrors what was typed, one cell each", async ({ page }) => {
    await page.goto(`/verify?email=${encodeURIComponent(freshEmail())}`);

    const cells = page.getByTestId("verification-code-cells");
    await expect(cells.locator("> *")).toHaveCount(6);

    // One input, not six — so a pasted code lands in one go.
    const input = page.getByTestId("field-code").locator("input");
    await input.fill("4821");
    await expect(page.getByTestId("verification-code-cell-0")).toHaveText("4");
    await expect(page.getByTestId("verification-code-cell-3")).toHaveText("1");
    await expect(page.getByTestId("verification-code-cell-4")).toHaveText("");

    // Non-digits never reach the value.
    await input.fill("12ab34cd56");
    await expect(input).toHaveValue("123456");
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
    await expect(page.getByTestId("verify-pending")).toContainText(email);
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
  /** Waits for the autosave a given interaction triggers. */
  async function withSave(page: Page, act: () => Promise<void>) {
    const saved = page.waitForResponse(
      (r) => r.url().includes("/onboarding/setup") && r.request().method() === "PUT",
    );
    await act();
    await saved;
  }

/** Resolves once the wizard's own read has landed — it ignores clicks until then. */
  function loading(page: Page) {
    return page.waitForResponse(
      (r) => r.url().includes("/onboarding/setup") && r.request().method() === "GET",
    );
  }

  /**
   * The resume point is server-side and the specs share one workspace, so each
   * wizard test rewinds to step 1 rather than assuming where the last one left
   * off.
   */
  async function rewind(page: Page) {
    const loaded = loading(page);
    await page.goto("/setup");
    await loaded;
    await expect(page.getByTestId("setup-wizard")).toBeVisible();
    await withSave(page, () => page.getByTestId("wizard-rail-basics").click());
    await expect(page.getByTestId("wizard-rail-basics")).toHaveAttribute("data-state", "current");
  }

  test("TC-SET-001 — five steps, each saving as it goes", async ({ page }) => {
    await rewind(page);
    await expect(page.getByTestId("field-timezone")).toBeVisible();

    await withSave(page, () => page.getByTestId("wizard-next").click());
    await expect(page.getByTestId("wizard-rail-stages")).toHaveAttribute("data-state", "current");
    await expect(page.getByTestId("field-stages")).toBeVisible();

    await withSave(page, () => page.getByTestId("wizard-next").click());
    await expect(page.getByTestId("wizard-rail-reasons")).toHaveAttribute("data-state", "current");
    await expect(page.getByTestId("field-reasonsClient")).toBeVisible();

    await withSave(page, () => page.getByTestId("wizard-next").click());
    await expect(page.getByTestId("wizard-rail-team")).toHaveAttribute("data-state", "current");
    await expect(page.getByTestId("field-invites")).toBeVisible();

    await withSave(page, () => page.getByTestId("wizard-next").click());
    await expect(page.getByTestId("wizard-rail-review")).toHaveAttribute("data-state", "current");
    await expect(page.getByTestId("wizard-finish")).toBeVisible();
  });

  test("TC-SET-002 — closing the tab resumes on the same step", async ({ page }) => {
    await rewind(page);
    await withSave(page, () => page.getByTestId("wizard-next").click());
    await expect(page.getByTestId("wizard-rail-stages")).toHaveAttribute("data-state", "current");

    // Flow §1.4: the resume point lives on the server, not in this browser.
    await page.reload();
    await expect(page.getByTestId("wizard-rail-stages")).toHaveAttribute("data-state", "current");
    await expect(page.getByTestId("wizard-resumed")).toBeVisible();
  });

  test("TC-SET-003 — the entry and hire stages cannot be removed", async ({ page }) => {
    await rewind(page);
    await withSave(page, () => page.getByTestId("wizard-next").click());
    await expect(page.getByTestId("field-stages")).toBeVisible();

    const rows = page.locator('[data-testid^="stage-row-"]');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Exactly the two ends are locked; everything between can be removed.
    await expect(page.getByTestId("stage-locked-0")).toBeVisible();
    await expect(page.getByTestId(`stage-locked-${count - 1}`)).toBeVisible();
    await expect(page.getByTestId("stage-remove-1")).toBeVisible();
    await expect(page.locator('[data-testid^="stage-locked-"]')).toHaveCount(2);
  });

  test("TC-SET-004 — a renamed stage survives the round trip", async ({ page }) => {
    await rewind(page);
    await withSave(page, () => page.getByTestId("wizard-next").click());

    const renamed = `Screening ${Date.now() % 10000}`;
    await page.getByTestId("stage-name-1").locator("input").fill(renamed);
    await withSave(page, () => page.getByTestId("wizard-next").click());

    // Read it back from the server's copy rather than the form's. Continue
    // moved us on a step, so the reload resumes there — walk back to stages.
    const reloaded = loading(page);
    await page.reload();
    await reloaded;
    await withSave(page, () => page.getByTestId("wizard-rail-stages").click());
    await expect(page.getByTestId("field-stages")).toBeVisible();
    await expect(page.getByTestId("stage-name-1").locator("input")).toHaveValue(renamed);
  });

  test("TC-SET-006 — the timezone choice is stored and comes back selected", async ({ page }) => {
    await rewind(page);

    await page.getByTestId("timezone-option-Europe/London").click();
    await expect(page.getByTestId("timezone-option-Europe/London")).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await withSave(page, () => page.getByTestId("wizard-next").click());

    await rewind(page);
    await expect(page.getByTestId("timezone-option-Europe/London")).toHaveAttribute(
      "aria-checked",
      "true",
    );

    // Put it back, so the other specs see the workspace they expect.
    await page.getByTestId("timezone-option-Asia/Kolkata").click();
    await withSave(page, () => page.getByTestId("wizard-next").click());
  });
});

test.describe("get started checklist", () => {
  test("TC-SET-005 — steps tick from real records, not a stored flag", async ({ page }) => {
    await page.goto("/get-started");
    await expect(page.getByTestId("get-started")).toBeVisible();

    // The seeded workspace has clients and requirements, so those two are done.
    await expect(page.getByTestId("checklist-client")).toHaveAttribute("data-done", "true");
    await expect(page.getByTestId("checklist-role")).toHaveAttribute("data-done", "true");

    // The bar reports the same count the rows do.
    const bar = page.getByTestId("get-started-bar");
    const done = Number(await bar.getAttribute("data-done"));
    const ticked = await page.locator('[data-testid^="checklist-"][data-done="true"]').count();
    expect(ticked).toBe(done);

    // Nothing here toggles by hand — completion is derived.
    await expect(page.getByRole("checkbox")).toHaveCount(0);
  });
});
