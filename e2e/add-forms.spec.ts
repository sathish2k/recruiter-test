import { expect, test } from "@playwright/test";
import { login, newAccount, register } from "./helpers";

// Add Job / Add Candidate form depth (FormWithSectionsRenderer + side panels):
// minimal required-only submit, Save-as-draft, the AI side panels, the segmented
// + chips fields, and the markdown Write/Preview editor.
test.describe
  .serial("add forms", () => {
    const acct = newAccount("addforms");

    test.beforeAll(async ({ browser }) => {
      const p = await browser.newPage();
      await register(p, acct);
      await p.close();
    });

    test.beforeEach(async ({ page }) => {
      await login(page, acct.email);
    });

    test("Add Job: minimal (title-only) publish succeeds", async ({ page }) => {
      await page.goto("/jobs/new");
      await page
        .locator('input[name="title"]')
        .fill(`Minimal Role ${Date.now()}`);
      await page.getByRole("button", { name: "Publish job" }).click();
      await expect(page.getByText("Job published")).toBeVisible();
    });

    test("Add Job: Save as draft creates a Draft-status job", async ({
      page,
    }) => {
      // Title deliberately avoids the word "Draft" so the row's status pill is
      // the only "Draft" text inside it.
      const draftTitle = `Nightshift Role ${Date.now()}`;
      await page.goto("/jobs/new");
      await page.locator('input[name="title"]').fill(draftTitle);
      await page.getByRole("button", { name: "Save draft" }).click();
      await expect(page.getByText("Draft saved")).toBeVisible();

      await page.waitForURL("**/jobs");
      // Reload to defeat SWR's 2s dedup window (see jobs.spec).
      await page.reload();
      const row = page.getByRole("row").filter({ hasText: draftTitle });
      await expect(row).toBeVisible();
      await expect(row.getByText("Draft")).toBeVisible();
    });

    test("Add Job: the AI screening side panel renders", async ({ page }) => {
      await page.goto("/jobs/new");
      // Panel-unique copy (its "AI Screening" title collides with the sidebar
      // nav item, so key on controls only the panel has).
      await expect(
        page.getByText("Match threshold", { exact: true }),
      ).toBeVisible();
      await expect(page.getByText("80%")).toBeVisible();
      await expect(
        page.getByText("Assigned team", { exact: true }),
      ).toBeVisible();
      await expect(page.getByText("Publish to", { exact: true })).toBeVisible();
    });

    test("Add Job: segmented + chips fields work", async ({ page }) => {
      await page.goto("/jobs/new");
      // Segmented employment-type (MUI Tabs). Default is Full-time; pick Contract.
      const contractTab = page.getByRole("tab", { name: "Contract" });
      await contractTab.click();
      await expect(contractTab).toHaveAttribute("aria-selected", "true");

      // Skills chips: type + Enter adds a chip.
      const skillInput = page.getByPlaceholder("Add skill + Enter");
      await skillInput.fill("GraphQL");
      await skillInput.press("Enter");
      await expect(page.getByText("GraphQL", { exact: true })).toBeVisible();
    });

    test("Add Job: markdown editor Write/Preview renders", async ({ page }) => {
      await page.goto("/jobs/new");
      const editor = page.getByPlaceholder(/Describe the role/);
      await editor.fill("## Preview Heading\nSome **bold** copy.");
      // Switch to Preview — the write textarea is replaced by rendered HTML.
      await page.getByRole("tab", { name: "Preview" }).click();
      await expect(
        page.getByRole("heading", { name: "Preview Heading" }),
      ).toBeVisible();
      await expect(page.locator("strong", { hasText: "bold" })).toBeVisible();
    });

    test("Add Candidate: minimal (firstName-only) save succeeds", async ({
      page,
    }) => {
      await page.goto("/candidates/new");
      await page.locator('input[name="firstName"]').fill(`Solo${Date.now()}`);
      await page.getByRole("button", { name: "Save candidate" }).click();
      await expect(page.getByText("Candidate saved")).toBeVisible();
    });

    test("Add Candidate: resume/duplicate side panel renders", async ({
      page,
    }) => {
      await page.goto("/candidates/new");
      await expect(
        page.getByText("Resume autofill", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByText("Duplicate check", { exact: true }),
      ).toBeVisible();
      // A form select ("Applying for") opens and takes a value.
      await page.getByRole("combobox").first().click();
      await page.getByRole("option").first().click();
    });

    // A real resume upload needs a file input + parsing pipeline; the panel's
    // drop zone isn't a driveable <input type=file> in this build.
    test.fixme("Add Candidate: resume file upload autofills the form", () => {
      // Would require: set a PDF/DOCX on the resume input, wait for the parse to
      // populate firstName/skills, then submit.
    });
  });
