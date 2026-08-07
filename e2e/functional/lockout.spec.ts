import { expect, test } from "@playwright/test";
import { failSignIn, PASSWORD, register, signIn, testEmail } from "./helpers";

/**
 * Account lockout — the behaviour that has no counter column behind it. Every
 * rule here is derived from the login history at request time, so these tests
 * are the only thing standing between that derivation and a silent regression.
 */

const LIMIT = 5;

test("five wrong passwords lock the account, and the fifth still reads as wrong", async ({
  request,
}) => {
  const email = testEmail("lock-trips");

  // The first five are ordinary credential failures — the user must not be told
  // anything different until the lock actually trips.
  for (let attempt = 1; attempt <= LIMIT; attempt += 1) {
    const response = await signIn(request, email, "wrong-password-here");
    expect(response.status(), `attempt ${attempt}`).toBe(401);
  }

  const locked = await signIn(request, email, "wrong-password-here");
  expect(locked.status()).toBe(403);
  const body = await locked.json();
  expect(body.code).toBe("ACCOUNT_LOCKED");
  expect(body.retryAfter).toBeGreaterThan(0);
  // 15 minutes, less the seconds this test took to run.
  expect(body.retryAfter).toBeLessThanOrEqual(15 * 60);
  expect(body.retryAfter).toBeGreaterThan(14 * 60);
});

test("the lock refuses the real password too, not just wrong ones", async ({ request }) => {
  const account = await register(request, "lock-refuses-real");
  await failSignIn(request, account.email, LIMIT);

  // The whole point: an attacker who guesses correctly on the sixth attempt
  // still gets nowhere, because the password is never checked.
  const response = await signIn(request, account.email, account.password);
  expect(response.status()).toBe(403);
  expect((await response.json()).code).toBe("ACCOUNT_LOCKED");
});

test("retrying while locked does not extend the lock", async ({ request }) => {
  const email = testEmail("lock-no-extend");
  await failSignIn(request, email, LIMIT);

  const first = await signIn(request, email, "wrong-password-here");
  const firstRetry = (await first.json()).retryAfter as number;

  // Hammer it. Every one of these writes a `blocked` row; if those counted as
  // failures the window would keep resetting and the account would never open.
  await failSignIn(request, email, 4);

  const later = await signIn(request, email, "wrong-password-here");
  const laterRetry = (await later.json()).retryAfter as number;

  expect(later.status()).toBe(403);
  // The wait must be shrinking, never growing.
  expect(laterRetry).toBeLessThanOrEqual(firstRetry);
});

test("one address locking does not lock another", async ({ request }) => {
  const victim = testEmail("lock-victim");
  const bystander = await register(request, "lock-bystander");

  await failSignIn(request, victim, LIMIT + 1);
  expect((await signIn(request, victim, "wrong-password-here")).status()).toBe(403);

  // The bystander shares nothing but the database.
  const response = await signIn(request, bystander.email, bystander.password);
  expect(response.status()).toBe(200);
});

test("four failures then a success clears the run", async ({ request }) => {
  const account = await register(request, "lock-forgiven");

  await failSignIn(request, account.email, LIMIT - 1);
  expect((await signIn(request, account.email, account.password)).status()).toBe(200);

  // Four more. Without the success in between this would be the eighth failure
  // and the account would be shut; the run has to start again from zero.
  await failSignIn(request, account.email, LIMIT - 1);
  const response = await signIn(request, account.email, account.password);
  expect(response.status(), "the success should have forgiven the earlier run").toBe(200);
});

test("a wrong password is reported the same whether or not the account exists", async ({
  request,
}) => {
  const real = await register(request, "lock-enumeration");
  const fake = testEmail("lock-enumeration-absent");

  const onReal = await signIn(request, real.email, "wrong-password-here");
  const onFake = await signIn(request, fake, "wrong-password-here");

  expect(onReal.status()).toBe(onFake.status());
  expect((await onReal.json()).code).toBe((await onFake.json()).code);
});

test("a locked-out user can still start a password reset", async ({ request }) => {
  const account = await register(request, "lock-reset-path");
  await failSignIn(request, account.email, LIMIT + 1);
  expect((await signIn(request, account.email, PASSWORD)).status()).toBe(403);

  // The locked screen offers "Reset my password instead" — that route must not
  // be shut by the same lock, or the advice is a dead end.
  const response = await request.post("/auth/forgot-password", {
    data: { email: account.email },
  });
  expect(response.status()).toBe(200);
});
