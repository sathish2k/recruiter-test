import { execSync } from "node:child_process";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { apiCreateCandidate, apiLogin, apiMoveStage } from "./api-helpers";
import { login, newAccount, register } from "./helpers";

// The five board columns show VISIBLE labels that differ from the stored stage
// values (documented in pipeline.configuration.ts). A newly-created candidate
// defaults to the stored stage "Sourced" → the "Sourcing" column.
const COLUMNS = [
  "Sourcing",
  "CV Received",
  "Lead Review",
  "Submitted",
  "Interview",
];

test.describe
  .serial("pipeline", () => {
    const acct = newAccount("pipe");

    test.beforeAll(async ({ browser }) => {
      const p = await browser.newPage();
      await register(p, acct);
      await p.close();
    });

    test.beforeEach(async ({ page }) => {
      await login(page, acct.email);
    });

    test("renders the 5 stage columns (empty board)", async ({ page }) => {
      await page.getByText("Pipeline", { exact: true }).click();
      await page.waitForURL("**/pipeline");
      for (const label of COLUMNS) {
        await expect(page.getByText(label, { exact: true })).toBeVisible();
      }
      // Every column starts empty for this fresh, agency-scoped board.
      await expect(page.getByText("Nothing in Sourcing")).toBeVisible();
    });

    test("a new candidate appears as a card in the Sourcing column", async ({
      page,
      request,
    }) => {
      // Seed the candidate through the API (fast, reliable) as this admin.
      const { token } = await apiLogin(request, acct.email);
      await apiCreateCandidate(request, token, {
        firstName: "Pipeline",
        lastName: `Probe ${Date.now()}`,
        currentTitle: "Backend Engineer",
      });
      // The unique first name segment is enough to find the card by name.

      await page.goto("/pipeline");

      // All 5 columns still render.
      for (const label of COLUMNS) {
        await expect(page.getByText(label, { exact: true })).toBeVisible();
      }

      // The card (candidate name) is on the board...
      await expect(page.getByText(/^Pipeline Probe/).first()).toBeVisible();
      // ...and it landed in Sourcing: that column is no longer the "Nothing in
      // Sourcing" ghost, while other empty columns still show theirs.
      await expect(page.getByText("Nothing in Sourcing")).toHaveCount(0);
      await expect(page.getByText("Nothing in CV Received")).toBeVisible();

      // NOTE: HTML5 drag-and-drop is unreliable under Playwright, so we assert
      // board structure + card placement rather than performing a real drag.
    });

    // Native HTML5 drag can't be driven reliably in Playwright, so the move is
    // exercised through the API (PATCH /pipeline/:id/stage) with a reload to
    // prove the persistence path end-to-end.
    test.fixme("drag-and-drop a card between columns", async () => {
      // Real drag: card.dragTo(targetColumn). Not driveable — see API move test.
    });
  });

// Board interactions on a fresh agency: an ACTIVE employee is DB-seeded (no HTTP
// path creates one — invites stay "invited"), so the recruiter workload strip +
// owner assignment have data. Two candidates with distinct clients drive search,
// the client filter, and an API-backed stage move.
test.describe
  .serial("pipeline board", () => {
    const acct = newAccount("pipeboard");
    let token = "";
    let movellaId = "";

    test.beforeAll(async ({ browser, request }) => {
      const p = await browser.newPage();
      await register(p, acct);
      await p.close();

      // Insert an active employee into THIS agency via the DB-seed script.
      execSync(`bun run ${path.join(__dirname, "db-seed.ts")}`, {
        cwd: path.join(__dirname, "..", "apps", "api"),
        env: {
          ...process.env,
          SEED_AGENCY: acct.agency,
          SEED_EMAIL: `emp.${Date.now()}@e2e.test`,
          SEED_NAME: "Ravi Sourcer",
        },
        stdio: "inherit",
      });

      ({ token } = await apiLogin(request, acct.email));
      const a = await apiCreateCandidate(request, token, {
        firstName: "Movella",
        lastName: `${Date.now()}`,
        currentTitle: "Backend Engineer",
        job: "Backend Engineer · Nortech",
      });
      movellaId = a.id;
      await apiCreateCandidate(request, token, {
        firstName: "Fabby",
        lastName: `${Date.now()}`,
        currentTitle: "Frontend Engineer",
        job: "Frontend Engineer · Fablio",
      });
    });

    test.beforeEach(async ({ page }) => {
      await login(page, acct.email);
      await page.goto("/pipeline");
    });

    test("renders both cards and the recruiter workload strip", async ({
      page,
    }) => {
      await expect(page.getByText(/^Movella/).first()).toBeVisible();
      await expect(page.getByText(/^Fabby/).first()).toBeVisible();
      // Workload strip (needs the active employee).
      await expect(page.getByText("Working on this:")).toBeVisible();
      await expect(page.getByText(/Ravi Sourcer/)).toBeVisible();
    });

    test("search narrows the board to a candidate", async ({ page }) => {
      await page
        .getByPlaceholder("Search candidate, role or client…")
        .fill("Movella");
      await expect(page.getByText(/^Movella/).first()).toBeVisible();
      await expect(page.getByText(/^Fabby/)).toHaveCount(0);
    });

    test("the client filter narrows the board by client", async ({ page }) => {
      // The client control is a cycle button; one click advances "All clients"
      // → the first configured client (Nortech).
      await page.getByRole("button", { name: "All clients" }).click();
      await expect(page.getByRole("button", { name: "Nortech" })).toBeVisible();
      await expect(page.getByText(/^Movella/).first()).toBeVisible();
      await expect(page.getByText(/^Fabby/)).toHaveCount(0);
    });

    // LAST: mutates a stage. Drive the move through the API, reload, and assert
    // the card changed columns (CV Received fills; Movella still on the board).
    test("an API stage move persists across a reload", async ({
      page,
      request,
    }) => {
      // Before the move, CV Received is empty (both candidates are in Sourcing).
      await expect(page.getByText("Nothing in CV Received")).toBeVisible();

      await apiMoveStage(request, token, movellaId, "Screened");
      await page.reload();

      // Movella now occupies CV Received (its ghost is gone) and is still shown;
      // Fabby stays in Sourcing.
      await expect(page.getByText("Nothing in CV Received")).toHaveCount(0);
      await expect(page.getByText(/^Movella/).first()).toBeVisible();
      await expect(page.getByText("Nothing in Sourcing")).toHaveCount(0);
    });
  });
