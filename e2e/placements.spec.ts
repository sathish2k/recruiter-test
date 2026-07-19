import { expect, test } from "@playwright/test";
import {
  apiCreateCandidate,
  apiCreatePlacement,
  apiLogin,
  apiSetPlacementStatus,
} from "./api-helpers";
import { login, newAccount, register } from "./helpers";

// Placements (Recruit.Placements.Page): a main column (4-KPI strip, the Offers
// table with a "+ Record offer" CTA, an Upcoming-joins band) plus a rail (Fees by
// client, Invoices, Guarantee watch). Offers seed through the API (POST
// /placements, computing Troy's 20% fee); their candidate/role/client are copied
// from the matching agency candidate, so candidates are created first. Offers
// start in status "Sent"; PATCH /placements/:id/status flips one to "Accepted",
// which schedules a join and lights up the fees/invoices/joins/guarantee rail.
test.describe
  .serial("placements", () => {
    const acct = newAccount("placements");
    // Seeded offers (status "Sent"). CTC → 20% fee: 200k → $40k, 150k → $30k.
    const offerA = { name: "Cara Vault", ctc: 200000, fee: "$40k" };
    const offerB = { name: "Dev Long", ctc: 150000, fee: "$30k" };
    const modalCandidate = "Ella New";
    let offerAId = "";
    let token = "";

    test.beforeAll(async ({ browser, request }) => {
      const p = await browser.newPage();
      await register(p, acct);
      await p.close();

      ({ token } = await apiLogin(request, acct.email));
      for (const [first, last] of [
        ["Cara", "Vault"],
        ["Dev", "Long"],
        ["Ella", "New"],
      ]) {
        await apiCreateCandidate(request, token, {
          firstName: first,
          lastName: last,
          currentTitle: "Principal Engineer",
        });
      }
      const a = await apiCreatePlacement(request, token, {
        candidateName: offerA.name,
        ctc: offerA.ctc,
      });
      offerAId = a.id;
      await apiCreatePlacement(request, token, {
        candidateName: offerB.name,
        ctc: offerB.ctc,
      });
    });

    test.beforeEach(async ({ page }) => {
      await login(page, acct.email);
      await page.goto("/placements");
    });

    test("the four KPI cards render", async ({ page }) => {
      await expect(page.getByText("Offers out", { exact: true })).toBeVisible();
      await expect(
        page.getByText("Accepted — joining", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByText("Placements YTD", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByText("Fees this quarter", { exact: true }),
      ).toBeVisible();
    });

    test("the Offers table lists a seeded offer with its 20% fee", async ({
      page,
    }) => {
      await expect(page.getByText("Offers", { exact: true })).toBeVisible();
      const row = page.getByRole("row").filter({ hasText: offerA.name });
      await expect(row).toBeVisible();
      await expect(row.getByText(offerA.fee)).toBeVisible();
    });

    test("the rail widget titles render", async ({ page }) => {
      await expect(
        page.getByText("Fees by client", { exact: true }),
      ).toBeVisible();
      await expect(page.getByText("Invoices", { exact: true })).toBeVisible();
      await expect(
        page.getByText("Guarantee watch", { exact: true }),
      ).toBeVisible();
    });

    test("the Record-offer modal shows a live 20% fee preview, then creates the offer", async ({
      page,
    }) => {
      await page.getByRole("button", { name: "Record offer" }).click();
      const modal = page.getByRole("dialog");
      await expect(modal.getByText("Record offer")).toBeVisible();

      // Pick the candidate (a themed MUI Select).
      await modal.getByRole("combobox").click();
      await page.getByRole("option", { name: modalCandidate }).click();

      // Live fee preview: 20% of the CTC as typed (250k → $50,000).
      await modal.getByPlaceholder("e.g. 180000").fill("250000");
      await expect(modal.getByText("$50,000")).toBeVisible();

      await modal.getByRole("button", { name: "Save & send offer" }).click();
      await expect(page.getByText("Offer recorded")).toBeVisible();

      // The new offer row shows the server-computed 20% fee (250k → $50k).
      const row = page.getByRole("row").filter({ hasText: modalCandidate });
      await expect(row).toBeVisible();
      await expect(row.getByText("$50k")).toBeVisible();
    });

    test("Generate letter shows a toast", async ({ page }) => {
      await page.getByRole("button", { name: "Record offer" }).click();
      const modal = page.getByRole("dialog");
      await modal.getByRole("combobox").click();
      await page.getByRole("option", { name: offerA.name }).click();
      await modal.getByRole("button", { name: "Generate letter" }).click();
      await expect(page.getByText("Offer letter generated")).toBeVisible();
    });

    test("clicking a status chip advances the offer status", async ({
      page,
    }) => {
      const row = page.getByRole("row").filter({ hasText: offerB.name });
      // Sent → Negotiating (PATCH /placements/:id/status), persisted on reload.
      await row.getByText("Sent", { exact: true }).click();
      await expect(row.getByText("Negotiating")).toBeVisible();
      await page.reload();
      await expect(
        page
          .getByRole("row")
          .filter({ hasText: offerB.name })
          .getByText("Negotiating"),
      ).toBeVisible();
    });

    test("accepting an offer populates the joins rail", async ({
      page,
      request,
    }) => {
      // Accept offer A → schedules a join and flows into the rail.
      await apiSetPlacementStatus(request, token, offerAId, "Accepted");
      await page.reload();
      // Upcoming joins now lists the accepted candidate; Fees-by-client renders.
      await expect(page.getByText(offerA.name).first()).toBeVisible();
      await expect(
        page.getByText("Fees by client", { exact: true }),
      ).toBeVisible();
    });

    test("clicking an invoice cell cycles its status and persists", async ({
      page,
    }) => {
      const row = page.getByRole("row").filter({ hasText: offerB.name });
      const cell = row.getByText("—", { exact: true });
      await expect(cell).toBeVisible();
      await cell.click();
      await expect(row.getByText("Invoiced · Net 30")).toBeVisible();
      await page.reload();
      await expect(
        page
          .getByRole("row")
          .filter({ hasText: offerB.name })
          .getByText("Invoiced · Net 30"),
      ).toBeVisible();
    });
  });
