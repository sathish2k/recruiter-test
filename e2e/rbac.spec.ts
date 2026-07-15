import { expect, request as apiRequest, test } from "@playwright/test";
import { API, apiLogin, apiProvisionRole, apiRegister } from "./api-helpers";
import { login, newAccount } from "./helpers";

// Role-based access control. Accounts are provisioned WITHOUT any DB seed:
// each is registered through the API (a fresh account is admin of its own
// agency, so it can PATCH its own role), then UI-logged-in to assert what the
// engine renders per role. We also assert the API itself enforces admin-only
// endpoints.
test.describe
  .serial("rbac", () => {
    const admin = newAccount("rbac-admin");
    const lead = newAccount("rbac-lead");
    const employee = newAccount("rbac-emp");

    test.beforeAll(async () => {
      const ctx = await apiRequest.newContext();
      await apiRegister(ctx, admin); // stays admin
      await apiProvisionRole(ctx, lead, "lead");
      await apiProvisionRole(ctx, employee, "employee");
      await ctx.dispose();
    });

    test("admin sees the admin dashboard", async ({ page }) => {
      await login(page, admin.email);
      await expect(page.getByText("Open Roles")).toBeVisible();
      await expect(page.getByText("Hiring Activity")).toBeVisible();
      // Admin has the gated nav items.
      await expect(page.getByText("Settings", { exact: true })).toBeVisible();
    });

    test("lead sees the lead dashboard", async ({ page }) => {
      await login(page, lead.email);
      // Lead-specific KPI tiles.
      await expect(page.getByText("CVs to review")).toBeVisible();
      await expect(page.getByText("Approved — to schedule")).toBeVisible();
      // The lead-cv-queue widget's i18n now resolves: its title and the
      // "Submit all …%+" CTA render real text, not the raw "title" key.
      await expect(
        page.getByText("CV review queue", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /Submit all/ }),
      ).toBeVisible();
    });

    test("employee sees the employee dashboard, no Settings, /settings denied", async ({
      page,
    }) => {
      await login(page, employee.email);
      // Employee-specific KPI tiles.
      await expect(
        page.getByText("Invites sent today", { exact: true }),
      ).toBeVisible();
      await expect(page.getByText("JDs shared", { exact: true })).toBeVisible();
      // The employee-roles widget's i18n now resolves: its "My roles" title
      // renders real text, not the raw "title" key.
      await expect(page.getByText("My roles", { exact: true })).toBeVisible();

      // The Settings nav item is stripped by the engine for non-admins.
      await expect(page.getByText("Settings", { exact: true })).toHaveCount(0);

      // Direct navigation to a settings route is denied server-side.
      await page.goto("/settings");
      await page.waitForURL("**/permission-denied", { timeout: 20_000 });
      await expect(
        page.getByText("You don't have access to this page"),
      ).toBeVisible();
    });

    test("API rejects admin-only endpoints for an employee token", async ({
      request,
    }) => {
      const { token } = await apiLogin(request, employee.email);
      const res = await request.get(`${API}/automations`, {
        headers: { authorization: `Bearer ${token}` },
      });
      expect(res.status()).toBe(403);
    });
  });
