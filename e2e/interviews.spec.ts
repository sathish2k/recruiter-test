import { execSync } from "node:child_process";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { apiCreateCandidate, apiLogin, apiMoveStage } from "./api-helpers";
import { login, newAccount, register } from "./helpers";

// Interviews (Recruit.Interviews.Page): a main column (Today / This-week / Past
// tabs, a 4-KPI strip, a "+ Schedule interview" CTA) plus a rail (Needs
// scheduling, Calendar sync, Feedback pending). Interviews have NO HTTP create
// path, so the KPI / Today / Past / Feedback data is DB-seeded (interview-seed.ts,
// mirroring db-seed.ts). The Needs-scheduling rail is driven purely via the API:
// it lists agency candidates in the "Shortlisted"/"Offer" stage, so we create one
// candidate and move it to "Shortlisted".
test.describe
  .serial("interviews", () => {
    const acct = newAccount("interviews");
    const readyCandidate = "Uma Ready";

    test.beforeAll(async ({ browser, request }) => {
      const p = await browser.newPage();
      await register(p, acct);
      await p.close();

      const { token } = await apiLogin(request, acct.email);
      // A candidate in "Shortlisted" → the Needs-scheduling rail.
      const cand = await apiCreateCandidate(request, token, {
        firstName: "Uma",
        lastName: "Ready",
        currentTitle: "Staff Engineer",
      });
      await apiMoveStage(request, token, cand.id, "Shortlisted");

      // Three interviews (one Today, one later this week, one Passed) → KPIs,
      // the Today / This-week / Past sections, and the Feedback-pending rail.
      execSync(`bun run ${path.join(__dirname, "interview-seed.ts")}`, {
        cwd: path.join(__dirname, "..", "apps", "api"),
        env: { ...process.env, SEED_AGENCY: acct.agency },
        stdio: "inherit",
      });
    });

    test.beforeEach(async ({ page }) => {
      await login(page, acct.email);
      await page.goto("/interviews");
    });

    test("the KPI strip renders its four cards", async ({ page }) => {
      // Key on each card's sub-label (the "This week" / "Upcoming" KPI titles
      // also appear as tab labels, so the subs are the unambiguous anchors).
      await expect(page.getByText("Live rooms open 5 min early")).toBeVisible();
      await expect(page.getByText("Across all clients")).toBeVisible();
      await expect(page.getByText("Confirmed + pending")).toBeVisible();
      await expect(page.getByText("Feedback drives next step")).toBeVisible();
    });

    test("the Today section lists the seeded today interview", async ({
      page,
    }) => {
      // Today is the default tab.
      await expect(
        page.getByText("Today's schedule", { exact: true }),
      ).toBeVisible();
      await expect(page.getByText("Nadia Bloom")).toBeVisible();
      // The first slot of the day is joinable → a "Join call" button.
      await expect(
        page.getByRole("button", { name: "Join call" }),
      ).toBeVisible();
    });

    test("the This-week tab shows the upcoming table", async ({ page }) => {
      await page.getByRole("tab", { name: "This week" }).click();
      await expect(
        page.getByText("Upcoming this week", { exact: true }),
      ).toBeVisible();
      await expect(page.getByText("Owen Frost")).toBeVisible();
    });

    test("the Past tab lists the seeded passed interview", async ({ page }) => {
      await page.getByRole("tab", { name: "Past", exact: true }).click();
      await expect(
        page.getByText("Past interviews", { exact: true }),
      ).toBeVisible();
      // exact:true — the Feedback-pending rail also mentions "Grace Poll — …".
      await expect(page.getByText("Grace Poll", { exact: true })).toBeVisible();
    });

    test("the rail widgets render (needs-scheduling, calendar sync, feedback)", async ({
      page,
    }) => {
      // Needs scheduling — driven by the "Shortlisted" candidate.
      await expect(
        page.getByText("Needs scheduling", { exact: true }),
      ).toBeVisible();
      await expect(page.getByText(readyCandidate)).toBeVisible();

      // Calendar sync card (its toggle is exercised only up to render — see the
      // fixme below).
      await expect(
        page.getByText("Calendar sync", { exact: true }),
      ).toBeVisible();
      await expect(page.getByText("Google Calendar")).toBeVisible();
      await expect(page.getByText("Outlook", { exact: true })).toBeVisible();

      // Feedback pending — the passed interview surfaces here as a due scorecard.
      await expect(
        page.getByText("Feedback pending", { exact: true }),
      ).toBeVisible();
      await expect(page.getByText(/Grace Poll — Final round/)).toBeVisible();
    });

    test("the Schedule-interview CTA shows a toast", async ({ page }) => {
      await page.getByRole("button", { name: "Schedule interview" }).click();
      // Assert on the toast subtitle (the button text also contains "Schedule
      // interview"), which is unique to the toast.
      await expect(
        page.getByText(
          "The candidate gets an invite + reminders automatically.",
        ),
      ).toBeVisible();
    });

    // The calendar-sync rows only flip a local useState flag and show a toast —
    // there is no persistence endpoint, so nothing survives a reload and there's
    // no real behaviour to assert past the toast. Left undriveable on purpose.
    test.fixme("calendar sync connect/disconnect persists", () => {
      // Would require a POST/PATCH to store the Google/Outlook connection and a
      // reload to prove it stuck.
    });
  });
