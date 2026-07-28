import { eq } from "drizzle-orm";
import { application, applicationStageHistory } from "../models/application.model";
import { candidate } from "../models/candidate.model";
import { job } from "../models/job.model";
import {
  applicationBoard,
  applicationHistory,
  createApplication,
  moveApplication,
  TransitionBlocked,
} from "../services/application.service";
import { listRejectionReasons, listStages } from "../services/pipeline.service";
import { db } from "./index";

/**
 * Smoke test for the transition function against a real database: create one
 * application, move it, prove the rejection guard, then remove what it made.
 * Run with `bun run src/db/smoke-applications.ts` from `apps/api`.
 */

const actor = { id: undefined, name: "Smoke test" };

const [aJob] = await db.select().from(job).limit(1);
if (!aJob) throw new Error("No requirement in the database to test with");
const orgId = aJob.organizationId;
const [aCandidate] = await db
  .select()
  .from(candidate)
  .where(eq(candidate.organizationId, orgId))
  .limit(1);
if (!aCandidate) throw new Error("No candidate in the database to test with");

const stages = await listStages(orgId);
const reasons = await listRejectionReasons(orgId);
console.log("stages:", stages.map((stage) => `${stage.name}(${stage.kind})`).join(" → "));

let createdId = "";
try {
  const created = await createApplication(orgId, actor, {
    candidateId: aCandidate.id,
    jobId: aJob.id,
    source: "smoke",
  });
  createdId = created?.id ?? "";
  console.log("created:", created?.candidateName, "→", created?.jobTitle, "at", created?.stageName);

  const second = stages[1] ?? stages[0];
  const moved = await moveApplication(orgId, actor, createdId, {
    toStageId: second?.id,
    note: "smoke move",
  });
  console.log("moved to:", moved?.stageName, "· days in stage", moved?.daysInStage);

  try {
    await moveApplication(orgId, actor, createdId, { status: "rejected" });
    console.log("!! a rejection without a reason was allowed");
  } catch (error) {
    console.log(
      "guard:",
      error instanceof TransitionBlocked ? `${error.code} — ${error.message}` : error,
    );
  }

  const rejected = await moveApplication(orgId, actor, createdId, {
    status: "rejected",
    reasonId: reasons[0]?.id,
    note: "smoke rejection",
  });
  console.log("rejected:", rejected?.status, "·", rejected?.rejectionReason);

  const history = await applicationHistory(orgId, createdId);
  console.log(
    "history rows:",
    history.length,
    history.map((row) => `${row.fromStage || "—"}→${row.toStage}(${row.status})`).join(", "),
  );

  const board = await applicationBoard(orgId, { wipLimit: 5 });
  console.log(
    "board:",
    board.columns.map((column) => `${column.name}:${column.count}`).join(" | "),
    "· owners",
    board.owners.length,
    "· breaches",
    board.breaches.length,
  );
} finally {
  if (createdId) {
    await db
      .delete(applicationStageHistory)
      .where(eq(applicationStageHistory.applicationId, createdId));
    await db.delete(application).where(eq(application.id, createdId));
    console.log("cleaned up the smoke application");
  }
  process.exit(0);
}
