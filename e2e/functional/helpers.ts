import type { APIRequestContext } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Every address is unique to its test. The suite runs against a shared dev
 * database, so anything reused would let one run's history — especially failed
 * sign-ins, which is what the lockout counts — decide another run's outcome.
 *
 * `@example.com` is not cosmetic: the read-back routes refuse any other domain.
 */
export function testEmail(label: string): string {
  const unique = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  return `${label}-${unique}@example.com`;
}

export const PASSWORD = "correct-horse-8";

export interface Account {
  email: string;
  password: string;
  id: string;
  organizationId: string;
}

/** Signs up, and asserts the shape the sign-up screen depends on. */
export async function register(
  request: APIRequestContext,
  label: string,
  password = PASSWORD,
): Promise<Account> {
  const email = testEmail(label);
  const response = await request.post("/auth/register", {
    data: { fullName: "Ana Novak", agency: `Troy ${label}`, email, password },
  });
  expect(response.status(), await response.text()).toBe(201);
  const body = await response.json();
  return { email, password, id: body.id, organizationId: body.organizationId };
}

/** The live 6-digit code and magic-link token for a test address. */
export async function readVerification(
  request: APIRequestContext,
  email: string,
): Promise<{ code: string; token: string }> {
  const response = await request.get("/e2e/verification-code", { params: { email } });
  expect(response.status(), await response.text()).toBe(200);
  return (await response.json()).data;
}

/** The live password-reset token for a test address. */
export async function readResetToken(request: APIRequestContext, email: string): Promise<string> {
  const response = await request.get("/e2e/reset-token", { params: { email } });
  expect(response.status(), await response.text()).toBe(200);
  return (await response.json()).data.token;
}

export async function verifyAccount(request: APIRequestContext, email: string): Promise<void> {
  const { code } = await readVerification(request, email);
  const response = await request.post("/auth/verify/confirm", { data: { email, code } });
  expect(response.status(), await response.text()).toBe(200);
}

export function signIn(request: APIRequestContext, email: string, password: string) {
  return request.post("/api/auth/sign-in/email", { data: { email, password } });
}

/** Drives an address to the edge of the lock without tripping it. */
export async function failSignIn(request: APIRequestContext, email: string, times: number) {
  for (let attempt = 0; attempt < times; attempt += 1) {
    await signIn(request, email, "definitely-not-the-password");
  }
}
