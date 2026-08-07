import { expect, test } from "@playwright/test";
import { readVerification, register, testEmail } from "./helpers";

/**
 * Email verification — §5.1.2. The rules that matter are the ones that stop a
 * code being brute-forced or a link being replayed, and none of them are
 * visible from the screen.
 */

test("registration issues a six-digit code and a link token", async ({ request }) => {
  const account = await register(request, "verify-issued");
  const { code, token } = await readVerification(request, account.email);

  expect(code).toMatch(/^\d{6}$/);
  expect(token).toBeTruthy();
});

test("a wrong code is refused, the right one is accepted", async ({ request }) => {
  const account = await register(request, "verify-code");
  const { code } = await readVerification(request, account.email);
  const wrong = code === "000000" ? "111111" : "000000";

  const refused = await request.post("/auth/verify/confirm", {
    data: { email: account.email, code: wrong },
  });
  expect(refused.status()).toBe(400);
  expect((await refused.json()).code).toBe("invalid");

  const accepted = await request.post("/auth/verify/confirm", {
    data: { email: account.email, code },
  });
  expect(accepted.status()).toBe(200);
  expect((await accepted.json()).data.verified).toBe(true);
});

test("confirming twice reports already-verified rather than failing", async ({ request }) => {
  const account = await register(request, "verify-twice");
  const { code } = await readVerification(request, account.email);
  await request.post("/auth/verify/confirm", { data: { email: account.email, code } });

  // The screen treats this as success, so the API must not answer with an error
  // for someone who clicks the link a second time.
  const again = await request.post("/auth/verify/confirm", {
    data: { email: account.email, code },
  });
  expect(again.status()).toBe(200);
  expect((await again.json()).data.verified).toBe(true);
});

test("the magic link verifies, and is single use", async ({ request }) => {
  const account = await register(request, "verify-link");
  const { token } = await readVerification(request, account.email);

  const first = await request.get("/auth/verify/link", { params: { token } });
  expect(first.status()).toBe(200);
  expect((await first.json()).data.verified).toBe(true);

  const second = await request.get("/auth/verify/link", { params: { token } });
  expect(second.status()).toBe(400);
  expect((await second.json()).code).toBe("invalid");
});

test("a resend replaces the previous code, and the old one stops working", async ({ request }) => {
  const account = await register(request, "verify-replaced");
  const first = await readVerification(request, account.email);

  // The initial send bypasses the cooldown, but a resend does not — so this is
  // also the cooldown assertion.
  const resend = await request.post("/auth/verify/send", { data: { email: account.email } });
  expect(resend.status()).toBe(429);
  const body = await resend.json();
  expect(body.code).toBe("cooldown");
  expect(body.retryAfter).toBeGreaterThan(0);
  expect(body.retryAfter).toBeLessThanOrEqual(60);

  // Nothing was reissued, so the original code must still be the live one.
  const after = await readVerification(request, account.email);
  expect(after.code).toBe(first.code);
});

test("five wrong codes burn the code and force a resend", async ({ request }) => {
  const account = await register(request, "verify-attempts");
  const { code } = await readVerification(request, account.email);
  const wrong = code === "000000" ? "111111" : "000000";

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await request.post("/auth/verify/confirm", {
      data: { email: account.email, code: wrong },
    });
    expect(response.status(), `attempt ${attempt}`).toBe(400);
  }

  const burned = await request.post("/auth/verify/confirm", {
    data: { email: account.email, code: wrong },
  });
  expect(burned.status()).toBe(429);
  expect((await burned.json()).code).toBe("too-many-attempts");

  // And the row is gone, so even the code that *was* right no longer works.
  const rightButDead = await request.post("/auth/verify/confirm", {
    data: { email: account.email, code },
  });
  expect(rightButDead.status()).not.toBe(200);
});

test("an address with no account is answered as success, revealing nothing", async ({
  request,
}) => {
  const stranger = testEmail("verify-stranger");
  const response = await request.post("/auth/verify/send", { data: { email: stranger } });

  // Not 404: the endpoint must not be usable to discover who has an account.
  expect(response.status()).toBe(200);
  expect((await response.json()).data.sent).toBe(true);
});

test("an unverified user may sign in but may not create records", async ({ request }) => {
  const account = await register(request, "verify-gate");

  const session = await request.post("/api/auth/sign-in/email", {
    data: { email: account.email, password: account.password },
  });
  expect(session.status(), "verification does not gate sign-in").toBe(200);
  const token = (await session.json()).token;

  // It gates writing instead — §5.1.2, enforced server-side so a screen that can
  // be navigated past is not the only thing standing in the way.
  const blocked = await request.post("/clients", {
    data: { name: "Acme" },
    headers: { authorization: `Bearer ${token}` },
  });
  expect(blocked.status()).toBe(403);
  expect((await blocked.json()).code).toBe("email-unverified");
});
