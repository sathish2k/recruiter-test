import { test } from "@playwright/test";

/**
 * The golden path from `delivery-plan.md` §1.4 — source → screen → submit →
 * interview → offer → place → invoice → commission.
 *
 * Every journey below is `fixme` because the screen it drives does not exist
 * yet. They are written now, against their `test-cases.md` IDs, so the suite
 * is the Phase 1 checklist rather than something assembled after the fact —
 * the plan calls this "the regression net for everything else".
 *
 * Remove the `.fixme` as each feature lands. Do not delete a test to make the
 * run green.
 */

test.describe("Golden path — pipeline", () => {
  test.fixme("TC-PIP-001 — a stage move writes history with actor and timestamp", async () => {});
  test.fixme("TC-PIP-002 — rejection cannot be recorded without a reason", async () => {});
  test.fixme("TC-PIP-003 — WIP capacity is advisory: amber, red, never blocked", async () => {});
  test.fixme("TC-PIP-004 — off-limits blocks submission to the originating client", async () => {});
  test.fixme("TC-PIP-005 — offer-elsewhere warns before a second submission", async () => {});
  test.fixme("TC-PIP-006 — the same candidate cannot enter one pipeline twice", async () => {});
  test.fixme("TC-PIP-007 — SLA breach flips the badge and auto-creates a task", async () => {});
});

test.describe("Golden path — CV review and submission", () => {
  test.fixme("TC-CVR-001 — send back returns to Sourced and is not a rejection", async () => {});
  test.fixme("TC-CVR-002 — only Profile Lead and above can approve for submission", async () => {});
  test.fixme("TC-SUB-001 — submission is blocked without candidate consent", async () => {});
  test.fixme("TC-SUB-002 — consent is per client, never blanket", async () => {});
  test.fixme("TC-SUB-003 — the submission snapshot is frozen after the profile changes", async () => {});
  test.fixme("TC-SUB-004 — an anonymised submission hides identity until approval", async () => {});
  test.fixme("TC-SUB-005 — the client SLA clock starts on submission", async () => {});
});

test.describe("Golden path — interviews and scorecards", () => {
  test.fixme("TC-INT-001 — scheduling creates the event, link and reminders", async () => {});
  test.fixme("TC-SCR-001 — must-have competencies must all be rated", async () => {});
  test.fixme("TC-SCR-002 — a negative recommendation requires a primary reason", async () => {});
  test.fixme("TC-SCR-003 — a non-client-visible scorecard is absent from the portal", async () => {});
});

test.describe("Golden path — offers, placements, commissions", () => {
  test.fixme("TC-OFR-001 — an out-of-band offer warns and logs the confirmation", async () => {});
  test.fixme("TC-OFR-002 — every revision records actor, field, from, to and reason", async () => {});
  test.fixme("TC-OFR-003 — acceptance prompts the cascade, with an opt-out, never silently", async () => {});
  test.fixme("TC-PLC-001 — joining sets guarantee end and off-limits, and decrements openings", async () => {});
  test.fixme("TC-PLC-002 — a fallout reopens the requirement and increments openings", async () => {});
  test.fixme("TC-COM-001 — a split cannot save at 90% and saves at 100%", async () => {});
  test.fixme("TC-COM-002 — recipients snapshotted at acceptance never move", async () => {});
  test.fixme("TC-COM-003 — an inbound application sends the sourcer share to the house", async () => {});
  test.fixme("TC-COM-006 — commission releases only when the invoice is paid", async () => {});
});

test.describe("Golden path — portals", () => {
  test.fixme("TC-CPO-001 — a client magic link is single-use", async () => {});
  test.fixme("TC-CPO-003 — a contact can reach only their own client's submissions", async () => {});
  test.fixme("TC-CPO-004 — declining requires a reason", async () => {});
  test.fixme("TC-CAR-002 — applying without consent is blocked", async () => {});
  test.fixme("TC-CAR-005 — applying with a known email links rather than duplicates", async () => {});
  test.fixme("TC-CDP-001 — a candidate refusal blocks the submission", async () => {});
});

test.describe("Golden path — billing limit states", () => {
  test.fixme("TC-BIL-001 — quota blocks creation while read, search and export work", async () => {});
  test.fixme("TC-BIL-002 — concurrent creation cannot exceed the cap", async () => {});
  test.fixme("TC-BIL-003 — trial expiry pauses the workspace", async () => {});
  test.fixme("TC-BIL-006 — a downgrade over limit is held, never auto-resolved", async () => {});
});
