import { expect, test } from "@playwright/test";
import { API, apiLogin, apiRegister } from "./api-helpers";
import { newAccount, PASSWORD, uniqueEmail } from "./helpers";

// Auth recovery flow. We assert the forgot-password confirmation UI, the
// reset-password page's render + client-side validation, and now a full
// token-based reset end-to-end.
//
// The confirmation view is privacy-preserving: /auth/forgot-password returns 200
// for both unknown and registered emails (it never reveals which addresses have
// accounts), so the confirmation-UI test drives it with an unregistered address.
// In non-prod with mail unconfigured, the endpoint also returns a `devResetToken`
// for a REGISTERED email, which the final test uses to complete the reset.
test.describe
  .serial("password recovery", () => {
    test("Forgot password link → confirmation state", async ({ page }) => {
      await page.goto("/login");
      // The sign-in form links to the forgot-password screen.
      await page.getByRole("link", { name: "Forgot password?" }).click();
      await page.waitForURL("**/forgot-password");
      // exact:true — the subtitle also contains "…reset your password."
      await expect(
        page.getByText("Reset your password", { exact: true }),
      ).toBeVisible();

      // Unregistered email → endpoint returns 200 → the confirmation UI renders.
      await page.locator('input[name="email"]').fill(uniqueEmail("forgot"));
      await page.getByRole("button", { name: "Send reset link" }).click();

      // The success view swaps the card title/subtitle; assert the confirmation.
      await expect(page.getByText("Check your inbox")).toBeVisible();
      await expect(page.getByText("Didn't get it? Send again")).toBeVisible();
    });

    test("Reset password renders the invalid state without a token", async ({
      page,
    }) => {
      await page.goto("/reset-password");
      await expect(page.getByText("Set a new password")).toBeVisible();
      // No ?token → the form is replaced by an invalid-link message.
      await expect(
        page.getByText("This reset link is invalid or has expired."),
      ).toBeVisible();
    });

    test("Reset password enforces client-side validation with a token", async ({
      page,
    }) => {
      // A truthy (fake) token makes the form render; client-side validation runs
      // before any submit, so the API is never hit for the invalid cases below.
      await page.goto("/reset-password?token=e2e-fake-token");
      await expect(page.locator('input[name="password"]')).toBeVisible();

      // Too-short password → minLength error (validation fires on submit).
      await page.locator('input[name="password"]').fill("short");
      await page.locator('input[name="confirmPassword"]').fill("short");
      await page.getByRole("button", { name: "Reset password" }).click();
      await expect(
        page.getByText("Password must be at least 8 characters"),
      ).toBeVisible();

      // Valid password but mismatched confirmation → matches error.
      await page.locator('input[name="password"]').fill("Passw0rd123");
      await page.locator('input[name="confirmPassword"]').fill("Different123");
      await page.getByRole("button", { name: "Reset password" }).click();
      await expect(page.getByText("Passwords don't match yet")).toBeVisible();
    });

    // Full reset: request a token via the API (non-prod returns `devResetToken`
    // for a registered email when mail is unconfigured), visit the reset page
    // with it, set a new password, then log in with the new password.
    test("completes a token-based password reset and logs in", async ({
      page,
      request,
    }) => {
      const acct = newAccount("reset");
      const newPassword = "Reset3dPass9";
      await apiRegister(request, acct);

      // Request a reset; read the dev token straight from the JSON response.
      const res = await request.post(`${API}/auth/forgot-password`, {
        data: { email: acct.email },
      });
      expect(res.ok(), `forgot-password: ${res.status()}`).toBeTruthy();
      const body = (await res.json()) as {
        ok: boolean;
        devResetToken?: string;
      };
      expect(body.ok).toBeTruthy();
      expect(
        body.devResetToken,
        "expected devResetToken in non-prod with mail unconfigured",
      ).toBeTruthy();

      // Visit the reset page with the live token and set a new password.
      await page.goto(`/reset-password?token=${body.devResetToken}`);
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await page.locator('input[name="password"]').fill(newPassword);
      await page.locator('input[name="confirmPassword"]').fill(newPassword);
      await page.getByRole("button", { name: "Reset password" }).click();

      // Success card swaps in.
      await expect(page.getByText("Password updated")).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Go to sign in" }),
      ).toBeVisible();

      // The new password works, the old one doesn't (API-level checks are fast
      // and unambiguous).
      const ok = await apiLogin(request, acct.email, newPassword);
      expect(ok.token).toBeTruthy();
      const oldTry = await request.post(`${API}/auth/login`, {
        data: { email: acct.email, password: PASSWORD },
      });
      expect(oldTry.ok()).toBeFalsy();
    });
  });
