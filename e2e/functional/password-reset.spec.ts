import { expect, test } from "@playwright/test";
import { PASSWORD, readResetToken, register, signIn, testEmail } from "./helpers";

/**
 * Password reset. The "Password updated" screen makes two promises the user
 * cannot check for themselves — that every other session ended, and that the
 * change was written to the audit log. Those are asserted here, because a
 * screen that claims something the system does not do is worse than a screen
 * that says nothing.
 */

const NEW_PASSWORD = "battery-staple-9";

test("the reset endpoint answers the same for an address with no account", async ({ request }) => {
  const real = await register(request, "reset-enumeration");
  const stranger = testEmail("reset-stranger");

  const onReal = await request.post("/auth/forgot-password", { data: { email: real.email } });
  const onStranger = await request.post("/auth/forgot-password", { data: { email: stranger } });

  expect(onReal.status()).toBe(200);
  expect(onStranger.status()).toBe(200);
  expect(await onReal.json()).toEqual(await onStranger.json());
});

test("a reset link sets the new password and retires the old one", async ({ request }) => {
  const account = await register(request, "reset-happy");
  await request.post("/auth/forgot-password", { data: { email: account.email } });
  const token = await readResetToken(request, account.email);

  const reset = await request.post("/auth/reset-password", {
    data: { token, password: NEW_PASSWORD },
  });
  expect(reset.status(), await reset.text()).toBe(200);

  expect((await signIn(request, account.email, NEW_PASSWORD)).status()).toBe(200);
  expect((await signIn(request, account.email, PASSWORD)).status()).toBe(401);
});

test("a reset token is single use", async ({ request }) => {
  const account = await register(request, "reset-single-use");
  await request.post("/auth/forgot-password", { data: { email: account.email } });
  const token = await readResetToken(request, account.email);

  expect(
    (
      await request.post("/auth/reset-password", { data: { token, password: NEW_PASSWORD } })
    ).status(),
  ).toBe(200);

  // The screen sends a spent token to its invalid-link state on a 400, so this
  // status is load-bearing, not incidental.
  const replay = await request.post("/auth/reset-password", {
    data: { token, password: "third-password-1" },
  });
  expect(replay.status()).toBe(400);
});

test("a made-up token is refused", async ({ request }) => {
  const response = await request.post("/auth/reset-password", {
    data: { token: "not-a-real-token-at-all", password: NEW_PASSWORD },
  });
  expect(response.status()).toBe(400);
});

test("resetting ends every other session, as the success screen claims", async ({ request }) => {
  const account = await register(request, "reset-revokes");

  // Two devices, both signed in.
  const deviceA = await signIn(request, account.email, account.password);
  const deviceB = await signIn(request, account.email, account.password);
  const tokenA = (await deviceA.json()).token;
  const tokenB = (await deviceB.json()).token;

  const stillValid = async (token: string) => {
    const response = await request.get("/api/auth/get-session", {
      headers: { authorization: `Bearer ${token}` },
    });
    const body = await response.text();
    return response.status() === 200 && body.length > 4 && body !== "null";
  };

  expect(await stillValid(tokenA), "device A should start signed in").toBe(true);
  expect(await stillValid(tokenB), "device B should start signed in").toBe(true);

  await request.post("/auth/forgot-password", { data: { email: account.email } });
  const token = await readResetToken(request, account.email);
  await request.post("/auth/reset-password", { data: { token, password: NEW_PASSWORD } });

  expect(await stillValid(tokenA), "device A should have been signed out").toBe(false);
  expect(await stillValid(tokenB), "device B should have been signed out").toBe(false);
});

test("resetting is written to the workspace audit log, as the success screen claims", async ({
  request,
}) => {
  const account = await register(request, "reset-audited");
  await request.post("/auth/forgot-password", { data: { email: account.email } });
  const token = await readResetToken(request, account.email);
  await request.post("/auth/reset-password", { data: { token, password: NEW_PASSWORD } });

  // Read the log back as the user themselves, with the new password.
  const session = await signIn(request, account.email, NEW_PASSWORD);
  const bearer = (await session.json()).token;
  const log = await request.get("/audit-logs", {
    headers: { authorization: `Bearer ${bearer}` },
  });
  expect(log.status(), await log.text()).toBe(200);

  const entries = (await log.json()).data as { event: string; category: string }[];
  const reset = entries.find((entry) => /reset their password/i.test(entry.event));
  expect(reset, "the password reset should appear in the audit log").toBeTruthy();
  expect(reset?.category).toBe("security");
});
