import { expect, type Page } from "@playwright/test";

export const PASSWORD = "Passw0rd123";

let seq = 0;
/** A unique email per call so parallel/re-runs never collide on the DB. */
export function uniqueEmail(prefix = "user"): string {
  seq += 1;
  return `${prefix}.${Date.now()}.${seq}@e2e.test`;
}

export interface Account {
  name: string;
  agency: string;
  email: string;
  password: string;
}

export function newAccount(prefix = "acct"): Account {
  return {
    name: "Test Admin",
    agency: `E2E ${Date.now()}-${++seq}`,
    email: uniqueEmail(prefix),
    password: PASSWORD,
  };
}

/** Sign-up flow: fills /create-account, submits, lands back on /login. */
export async function register(page: Page, acct: Account): Promise<void> {
  await page.goto("/create-account");
  await page.locator('input[name="fullName"]').fill(acct.name);
  await page.locator('input[name="agency"]').fill(acct.agency);
  await page.locator('input[name="email"]').fill(acct.email);
  await page.locator('input[name="password"]').fill(acct.password);
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL("**/login", { timeout: 20_000 });
}

/** Credentials login; resolves once we've left the login page. */
export async function login(
  page: Page,
  email: string,
  password = PASSWORD,
): Promise<void> {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Get Started" }).click();
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 20_000,
  });
}

/** Register then immediately log in — the common "fresh admin" setup. */
export async function registerAndLogin(
  page: Page,
  acct = newAccount(),
): Promise<Account> {
  await register(page, acct);
  await login(page, acct.email, acct.password);
  await expect(page.getByText("Troy", { exact: true })).toBeVisible();
  return acct;
}
