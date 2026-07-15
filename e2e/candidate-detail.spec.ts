import { expect, test } from "@playwright/test";
import { apiCreateCandidate, apiLogin } from "./api-helpers";
import { login, newAccount, register } from "./helpers";

// Candidate Detail depth (Recruit.CandidateDetail.Page). A candidate is
// API-seeded with a title, skills, location, and source so the hero, details,
// and skills chips render. The AI report, stage timeline, and section headers
// always render (derived server-side). Also drives the session-local Notes rail.
test.describe
  .serial("candidate detail", () => {
    const acct = newAccount("canddetail");
    const first = "Amara";
    const last = `Okafor${Date.now()}`;
    const fullName = `${first} ${last}`;
    let candId = "";

    test.beforeAll(async ({ browser, request }) => {
      const p = await browser.newPage();
      await register(p, acct);
      await p.close();
      const { token } = await apiLogin(request, acct.email);
      const cand = await apiCreateCandidate(request, token, {
        firstName: first,
        lastName: last,
        email: `${first}.${Date.now()}@e2e.test`,
        currentTitle: "Staff Backend Engineer",
        years: 8,
        location: "Austin, TX",
        source: "LinkedIn",
        skills: ["Go", "Kubernetes", "PostgreSQL"],
      });
      candId = cand.id;
    });

    test.beforeEach(async ({ page }) => {
      await login(page, acct.email);
      await page.goto(`/candidates/${candId}`);
      await expect(page.getByText(fullName).first()).toBeVisible();
    });

    test("renders the hero, match ring, and stage timeline", async ({
      page,
    }) => {
      // Hero name + the match-ring center label.
      await expect(page.getByText(fullName).first()).toBeVisible();
      await expect(page.getByText("AI MATCH", { exact: true })).toBeVisible();
      // Stage timeline strip renders the fixed stage names.
      await expect(page.getByText("Invited", { exact: true })).toBeVisible();
      await expect(page.getByText("Connected", { exact: true })).toBeVisible();
    });

    test("renders the AI report and experience/education/skills sections", async ({
      page,
    }) => {
      await expect(
        page.getByText("AI Screening Report", { exact: true }),
      ).toBeVisible();
      await expect(page.getByText("STRENGTHS", { exact: true })).toBeVisible();
      await expect(page.getByText("WATCH-OUTS", { exact: true })).toBeVisible();
      // Section headers (present even when a subsection has no rows). Note
      // "Experience" also appears as an AI-report score-bar label, so match the
      // first occurrence.
      await expect(
        page.getByText("Experience", { exact: true }).first(),
      ).toBeVisible();
      await expect(
        page.getByText("Education & Certifications", { exact: true }),
      ).toBeVisible();
      await expect(page.getByText("Skills", { exact: true })).toBeVisible();
      // Seeded skills render as chips.
      await expect(page.getByText("Kubernetes")).toBeVisible();
    });

    test("adds a note to the Notes rail (session-local)", async ({ page }) => {
      await expect(page.getByText("Notes", { exact: true })).toBeVisible();
      const noteInput = page.getByPlaceholder("Add a note for the team…");
      const noteText = `Strong systems background ${Date.now()}`;
      await noteInput.fill(noteText);
      // Enter submits the note (the add IconButton has no accessible label).
      await noteInput.press("Enter");
      await expect(page.getByText(noteText)).toBeVisible();
      // The note is attributed to the current user with a "just now" timestamp.
      await expect(page.getByText("just now").first()).toBeVisible();
    });
  });
