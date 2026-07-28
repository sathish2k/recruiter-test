import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, getTableColumns, ilike, inArray, ne, or } from "drizzle-orm";
import { db } from "../db";
import {
  type ApplicationStatus,
  application,
  applicationStageHistory,
} from "../models/application.model";
import { user } from "../models/auth.model";
import { candidate } from "../models/candidate.model";
import { client } from "../models/client.model";
import { job } from "../models/job.model";
import { pipelineStage, rejectionReason } from "../models/pipeline.model";
import { record as recordAudit } from "./audit-log.service";
import { listStages } from "./pipeline.service";

/**
 * The application record and the one function that moves it.
 *
 * Flow §5: a stage move writes the row, its history and the activity feed
 * together. Nothing else in the codebase may write `application.stage_id` —
 * scatter that across screens and the history stops being trustworthy, and
 * every metric read from it becomes a guess.
 */

const DAY_MS = 86_400_000;
const days = (from: Date, to = new Date()) =>
  Math.max(0, Math.floor((to.getTime() - from.getTime()) / DAY_MS));

export interface Actor {
  id?: string;
  name?: string | null;
}

/** A guard refused the move; the message is shown to the user as-is. */
export class TransitionBlocked extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
  }
}

function withJoins() {
  return db
    .select({
      ...getTableColumns(application),
      candidateFirstName: candidate.firstName,
      candidateLastName: candidate.lastName,
      candidateEmail: candidate.email,
      candidateTitle: candidate.currentJobTitle,
      candidateMatchScore: candidate.matchScore,
      candidateOffLimitsUntil: candidate.offLimitsUntil,
      candidateDoNotContact: candidate.doNotContact,
      candidateResume: candidate.resume,
      jobTitle: job.title,
      jobReference: job.reference,
      jobStageSlas: job.stageSlas,
      clientId: client.id,
      clientName: client.name,
      stageName: pipelineStage.name,
      stagePosition: pipelineStage.position,
      stageKind: pipelineStage.kind,
      stageSlaDays: pipelineStage.slaDays,
      ownerName: user.name,
      reasonLabel: rejectionReason.label,
    })
    .from(application)
    .leftJoin(candidate, eq(application.candidateId, candidate.id))
    .leftJoin(job, eq(application.jobId, job.id))
    .leftJoin(client, eq(job.clientId, client.id))
    .leftJoin(pipelineStage, eq(application.stageId, pipelineStage.id))
    .leftJoin(user, eq(application.ownerId, user.id))
    .leftJoin(rejectionReason, eq(application.rejectionReasonId, rejectionReason.id));
}

type Row = Awaited<ReturnType<ReturnType<typeof withJoins>["execute"]>>[number];

const fullName = (first?: string | null, last?: string | null) =>
  [first, last].filter(Boolean).join(" ").trim();

function mapApplication(row: Row) {
  const slaDays = row.jobStageSlas?.[row.stageId ?? ""] ?? row.stageSlaDays ?? 0;
  const inStage = days(row.stageEnteredAt);
  return {
    id: row.id,
    candidateId: row.candidateId,
    candidateName: fullName(row.candidateFirstName, row.candidateLastName),
    candidateTitle: row.candidateTitle ?? "",
    matchScore: row.candidateMatchScore ?? 0,
    hasResume: (row.candidateResume ?? []).length > 0,
    doNotContact: row.candidateDoNotContact ?? false,
    offLimits: Boolean(
      row.candidateOffLimitsUntil && row.candidateOffLimitsUntil.getTime() > Date.now(),
    ),
    jobId: row.jobId,
    jobTitle: row.jobTitle ?? "",
    jobReference: row.jobReference ?? "",
    clientId: row.clientId ?? "",
    clientName: row.clientName ?? "",
    stageId: row.stageId ?? "",
    stageName: row.stageName ?? "",
    stageKind: row.stageKind ?? "middle",
    status: row.status,
    ownerId: row.ownerId ?? "",
    ownerName: row.ownerName ?? "",
    consentAt: row.consentAt?.toISOString() ?? "",
    rejectionReasonId: row.rejectionReasonId ?? "",
    rejectionReason: row.reasonLabel ?? "",
    rejectionNote: row.rejectionNote ?? "",
    daysInStage: inStage,
    slaDays,
    /** Positive when the stage clock has run out — what the board flags. */
    slaOverBy: slaDays && inStage > slaDays ? inStage - slaDays : 0,
    source: row.source ?? "",
    updatedAt: row.updatedAt.toISOString(),
  };
}

export type Application = ReturnType<typeof mapApplication>;

export interface ListApplicationsParams {
  jobId?: string;
  clientId?: string;
  ownerId?: string;
  candidateId?: string;
  search?: string;
  /** Include the closed-out ones; the board asks for them in its last column. */
  includeClosed?: boolean;
}

export async function listApplications(
  organizationId: string,
  params: ListApplicationsParams = {},
) {
  const filters = [eq(application.organizationId, organizationId)];
  if (params.jobId) filters.push(eq(application.jobId, params.jobId));
  if (params.clientId) filters.push(eq(job.clientId, params.clientId));
  if (params.ownerId) filters.push(eq(application.ownerId, params.ownerId));
  if (params.candidateId) filters.push(eq(application.candidateId, params.candidateId));
  if (!params.includeClosed) filters.push(eq(application.status, "active"));
  if (params.search) {
    const term = `%${params.search}%`;
    const match = or(
      ilike(candidate.firstName, term),
      ilike(candidate.lastName, term),
      ilike(job.title, term),
      ilike(client.name, term),
    );
    if (match) filters.push(match);
  }

  const rows = await withJoins()
    .where(and(...filters))
    .orderBy(asc(pipelineStage.position), asc(application.stageEnteredAt));
  return rows.map(mapApplication);
}

export async function getApplication(organizationId: string, id: string) {
  const [row] = await withJoins()
    .where(and(eq(application.id, id), eq(application.organizationId, organizationId)))
    .limit(1);
  return row ? mapApplication(row) : null;
}

async function readRow(organizationId: string, id: string) {
  const [row] = await db
    .select()
    .from(application)
    .where(and(eq(application.id, id), eq(application.organizationId, organizationId)))
    .limit(1);
  return row ?? null;
}

/** The workspace's stages, with the entry one first. */
async function stagesFor(organizationId: string) {
  const stages = await listStages(organizationId);
  return {
    all: stages,
    entry: stages.find((stage) => stage.kind === "entry") ?? stages[0],
    hire: stages.find((stage) => stage.kind === "hire") ?? stages.at(-1),
    byId: new Map(stages.map((stage) => [stage.id, stage])),
  };
}

export interface CreateApplicationInput {
  candidateId: string;
  jobId: string;
  ownerId?: string;
  stageId?: string;
  source?: string;
}

/**
 * Puts a candidate on a requirement at the entry stage. Re-applying to a role
 * they were closed out of reopens the same row — the unique index means there
 * is never a second one, and the history stays continuous.
 */
export async function createApplication(
  organizationId: string,
  actor: Actor,
  input: CreateApplicationInput,
) {
  const stages = await stagesFor(organizationId);
  const stage = input.stageId ? stages.byId.get(input.stageId) : stages.entry;
  if (!stage) throw new TransitionBlocked("This workspace has no pipeline stages", "no-stages");

  const [existing] = await db
    .select()
    .from(application)
    .where(
      and(
        eq(application.organizationId, organizationId),
        eq(application.candidateId, input.candidateId),
        eq(application.jobId, input.jobId),
      ),
    )
    .limit(1);

  if (existing) {
    if (existing.status === "active") return getApplication(organizationId, existing.id);
    // Reopening: back to the entry stage, closure cleared, history continues.
    await db
      .update(application)
      .set({
        status: "active",
        stageId: stage.id,
        stageEnteredAt: new Date(),
        rejectionReasonId: null,
        rejectionNote: null,
        closedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(application.id, existing.id));
    await writeHistory(organizationId, actor, {
      applicationId: existing.id,
      fromStageId: existing.stageId,
      toStage: stage,
      status: "active",
      note: "Reopened",
      enteredAt: existing.stageEnteredAt,
    });
    return getApplication(organizationId, existing.id);
  }

  const id = randomUUID();
  await db.insert(application).values({
    id,
    organizationId,
    candidateId: input.candidateId,
    jobId: input.jobId,
    stageId: stage.id,
    ownerId: input.ownerId,
    source: input.source ?? "manual",
    stageEnteredAt: new Date(),
  });
  await writeHistory(organizationId, actor, {
    applicationId: id,
    fromStageId: null,
    toStage: stage,
    status: "active",
    note: null,
    enteredAt: null,
  });

  const created = await getApplication(organizationId, id);
  if (created) {
    await recordAudit({
      organizationId,
      userId: actor.id,
      actorName: actor.name ?? "Unknown",
      event: `${created.candidateName} added to ${created.jobTitle}`,
      category: "candidates",
      objects: { Candidate: created.candidateName, Requirement: created.jobTitle },
      details: { stage: created.stageName },
    });
  }
  return created;
}

async function writeHistory(
  organizationId: string,
  actor: Actor,
  input: {
    applicationId: string;
    fromStageId: string | null;
    toStage: { id: string; name: string } | null;
    status: ApplicationStatus;
    note: string | null;
    enteredAt: Date | null;
    reason?: { id: string; label: string } | null;
    fromStageName?: string | null;
  },
) {
  await db.insert(applicationStageHistory).values({
    id: randomUUID(),
    organizationId,
    applicationId: input.applicationId,
    fromStageId: input.fromStageId,
    fromStageName: input.fromStageName ?? null,
    toStageId: input.toStage?.id ?? null,
    toStageName: input.toStage?.name ?? null,
    status: input.status,
    reasonId: input.reason?.id ?? null,
    reasonLabel: input.reason?.label ?? null,
    note: input.note,
    daysInPreviousStage: input.enteredAt ? days(input.enteredAt) : null,
    actorId: actor.id,
    actorName: actor.name ?? "Unknown",
  });
}

export interface MoveInput {
  toStageId?: string;
  /** Closing the application out instead of moving it along. */
  status?: ApplicationStatus;
  reasonId?: string;
  note?: string;
  /** Proceed past an advisory guard the user has seen and accepted. */
  force?: boolean;
}

/**
 * The only way an application changes stage or status. Runs the guards, writes
 * the row, its history and the activity feed in one transaction, and returns
 * the moved application.
 *
 * Notifications and tasks belong here too (flow §5) — neither model exists
 * yet, so this is where they land rather than in a screen.
 */
export async function moveApplication(
  organizationId: string,
  actor: Actor,
  id: string,
  input: MoveInput,
) {
  const row = await readRow(organizationId, id);
  if (!row) return null;

  const stages = await stagesFor(organizationId);
  const toStage = input.toStageId
    ? stages.byId.get(input.toStageId)
    : stages.byId.get(row.stageId ?? "");
  if (input.toStageId && !toStage) {
    throw new TransitionBlocked("That stage is not on this workspace's board", "unknown-stage");
  }
  const fromStage = stages.byId.get(row.stageId ?? "");
  const status = input.status ?? (toStage?.kind === "hire" ? "hired" : "active");

  // A rejection has to say why — the catalogue is the workspace's own.
  let reason: { id: string; label: string } | null = null;
  if (status === "rejected") {
    if (!input.reasonId) {
      throw new TransitionBlocked("A rejection needs a reason", "reason-required");
    }
    const [found] = await db
      .select({ id: rejectionReason.id, label: rejectionReason.label })
      .from(rejectionReason)
      .where(
        and(
          eq(rejectionReason.id, input.reasonId),
          eq(rejectionReason.organizationId, organizationId),
        ),
      )
      .limit(1);
    if (!found)
      throw new TransitionBlocked("That rejection reason is not on file", "unknown-reason");
    reason = found;
  }

  await runGuards(organizationId, row, { status, toStage, force: input.force });

  const now = new Date();
  const movingStage = Boolean(toStage && toStage.id !== row.stageId);
  await db.transaction(async (tx) => {
    await tx
      .update(application)
      .set({
        stageId: toStage?.id ?? row.stageId,
        stageEnteredAt: movingStage ? now : row.stageEnteredAt,
        status,
        rejectionReasonId: reason?.id ?? (status === "rejected" ? row.rejectionReasonId : null),
        rejectionNote: status === "rejected" ? (input.note ?? row.rejectionNote) : null,
        closedAt: status === "active" ? null : now,
        updatedAt: now,
      })
      .where(eq(application.id, id));
  });

  await writeHistory(organizationId, actor, {
    applicationId: id,
    fromStageId: row.stageId,
    fromStageName: fromStage?.name ?? null,
    toStage: toStage ?? null,
    status,
    note: input.note?.trim() || null,
    enteredAt: row.stageEnteredAt,
    reason,
  });

  const moved = await getApplication(organizationId, id);
  if (moved) {
    const event =
      status === "rejected"
        ? `${moved.candidateName} rejected on ${moved.jobTitle} — ${reason?.label ?? ""}`
        : status === "hired"
          ? `${moved.candidateName} hired on ${moved.jobTitle}`
          : `${moved.candidateName} moved to ${moved.stageName} on ${moved.jobTitle}`;
    await recordAudit({
      organizationId,
      userId: actor.id,
      actorName: actor.name ?? "Unknown",
      event,
      category: "candidates",
      objects: { Candidate: moved.candidateName, Requirement: moved.jobTitle },
      details: { stage: moved.stageName, status },
    });
  }
  return moved;
}

/**
 * The rules that stop a move. Two are hard (the data says no), one is advisory
 * — the caller may repeat the move with `force` once the user has seen it.
 */
async function runGuards(
  organizationId: string,
  row: typeof application.$inferSelect,
  input: { status: ApplicationStatus; toStage?: { kind: string } | undefined; force?: boolean },
) {
  if (input.status !== "active" && input.status !== "hired") return;

  const [person] = await db
    .select({
      offLimitsUntil: candidate.offLimitsUntil,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
    })
    .from(candidate)
    .where(eq(candidate.id, row.candidateId))
    .limit(1);

  // Off-limits is a contractual promise to a client, not a preference.
  if (person?.offLimitsUntil && person.offLimitsUntil.getTime() > Date.now()) {
    throw new TransitionBlocked(
      `${fullName(person.firstName, person.lastName)} is off-limits until ${person.offLimitsUntil.toDateString()}`,
      "off-limits",
    );
  }

  // An offer accepted elsewhere: advisory, because the recruiter may know the
  // candidate turned it down before the other record was updated.
  const elsewhere = await db
    .select({ id: application.id })
    .from(application)
    .where(
      and(
        eq(application.organizationId, organizationId),
        eq(application.candidateId, row.candidateId),
        ne(application.id, row.id),
        eq(application.status, "hired"),
      ),
    )
    .limit(1);
  if (elsewhere.length && !input.force) {
    throw new TransitionBlocked(
      "This candidate has already accepted an offer on another requirement",
      "hired-elsewhere",
    );
  }
}

/** The id of the board's closed-out column — not a stage, so it cannot clash
 * with one. */
export const CLOSED_COLUMN = "__closed__";

export interface BoardParams extends ListApplicationsParams {
  /** Advisory column limit (D4). Above it a column is flagged, never blocked. */
  wipLimit?: number;
}

/**
 * The board read model: one column per workspace stage, plus the closed-out
 * column the design draws last. Every count is derived from the same rows the
 * cards come from, so a column header can never disagree with what is under it.
 */
export async function applicationBoard(organizationId: string, params: BoardParams = {}) {
  await backfillApplications(organizationId);

  const [stages, rows] = await Promise.all([
    listStages(organizationId),
    listApplications(organizationId, { ...params, includeClosed: true }),
  ]);

  const active = rows.filter((row) => row.status === "active" || row.status === "hired");
  const columns = stages.map((stage) => {
    const cards = active.filter((row) => row.stageId === stage.id);
    const inStage = cards.map((card) => card.daysInStage);
    return {
      id: stage.id,
      name: stage.name,
      kind: stage.kind,
      clientVisible: stage.clientVisible,
      slaDays: stage.slaDays,
      count: cards.length,
      avgDays: inStage.length
        ? Math.round(inStage.reduce((total, value) => total + value, 0) / inStage.length)
        : 0,
      oldestDays: inStage.length ? Math.max(...inStage) : 0,
      wipLimit: params.wipLimit ?? 0,
      overWip: Boolean(params.wipLimit && cards.length > params.wipLimit),
      cards,
    };
  });

  const closed = rows.filter((row) => row.status === "rejected" || row.status === "withdrawn");
  columns.push({
    id: CLOSED_COLUMN,
    name: "Closed",
    kind: "closed" as never,
    clientVisible: false,
    slaDays: 0,
    count: closed.length,
    avgDays: 0,
    oldestDays: 0,
    wipLimit: 0,
    overWip: false,
    cards: closed,
  });

  // The owner strip and the SLA banner both read the same active set.
  const owners = new Map<string, { id: string; name: string; count: number; breaches: number }>();
  for (const card of active) {
    if (!card.ownerId) continue;
    const entry = owners.get(card.ownerId) ?? {
      id: card.ownerId,
      name: card.ownerName,
      count: 0,
      breaches: 0,
    };
    entry.count += 1;
    if (card.slaOverBy) entry.breaches += 1;
    owners.set(card.ownerId, entry);
  }

  const breaches = active
    .filter((card) => card.slaOverBy > 0)
    .sort((a, b) => b.slaOverBy - a.slaOverBy)
    .slice(0, 5)
    .map((card) => ({
      id: card.id,
      candidateName: card.candidateName,
      stageName: card.stageName,
      daysInStage: card.daysInStage,
      slaDays: card.slaDays,
      slaOverBy: card.slaOverBy,
    }));

  return {
    columns,
    owners: [...owners.values()].sort((a, b) => b.count - a.count),
    breaches,
    total: active.length,
  };
}

/** Every move on one application, newest first. */
export async function applicationHistory(organizationId: string, id: string) {
  const rows = await db
    .select()
    .from(applicationStageHistory)
    .where(
      and(
        eq(applicationStageHistory.organizationId, organizationId),
        eq(applicationStageHistory.applicationId, id),
      ),
    )
    .orderBy(desc(applicationStageHistory.createdAt));

  return rows.map((entry) => ({
    id: entry.id,
    fromStage: entry.fromStageName ?? "",
    toStage: entry.toStageName ?? "",
    status: entry.status,
    reason: entry.reasonLabel ?? "",
    note: entry.note ?? "",
    daysInPreviousStage: entry.daysInPreviousStage ?? 0,
    actor: entry.actorName ?? "",
    at: entry.createdAt.toISOString(),
  }));
}

/**
 * Creates the applications implied by the candidate records that predate this
 * table — one per candidate that names a requirement. Idempotent, and run when
 * the board is read, the same way the stage list seeds itself.
 */
export async function backfillApplications(organizationId: string) {
  const stages = await stagesFor(organizationId);
  if (!stages.entry) return 0;

  const rows = await db
    .select({
      id: candidate.id,
      jobId: candidate.jobId,
      stage: candidate.startingStage,
      ownerId: candidate.ownerId,
      status: candidate.status,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
    })
    .from(candidate)
    .where(
      and(
        eq(candidate.organizationId, organizationId),
        eq(candidate.archived, false),
        ne(candidate.jobId, ""),
      ),
    );

  const withJob = rows.filter((row): row is typeof row & { jobId: string } => Boolean(row.jobId));
  if (!withJob.length) return 0;

  const existing = await db
    .select({ candidateId: application.candidateId, jobId: application.jobId })
    .from(application)
    .where(
      and(
        eq(application.organizationId, organizationId),
        inArray(
          application.candidateId,
          withJob.map((row) => row.id),
        ),
      ),
    );
  const seen = new Set(existing.map((row) => `${row.candidateId}:${row.jobId}`));
  const missing = withJob.filter((row) => !seen.has(`${row.id}:${row.jobId}`));
  if (!missing.length) return 0;

  const byName = new Map(stages.all.map((stage) => [stage.name.toLowerCase(), stage]));
  const values = missing.map((row) => {
    const stage = byName.get((row.stage ?? "").toLowerCase()) ?? stages.entry;
    return {
      id: randomUUID(),
      organizationId,
      candidateId: row.id,
      jobId: row.jobId,
      stageId: stage?.id,
      // A candidate already marked placed arrives as a hire, not as new work.
      status: (row.status === "placed" ? "hired" : "active") as ApplicationStatus,
      ownerId: row.ownerId,
      source: "backfill",
      // The best evidence of when this stage was entered is the last edit.
      stageEnteredAt: row.updatedAt,
      createdAt: row.createdAt,
    };
  });

  await db.transaction(async (tx) => {
    await tx.insert(application).values(values).onConflictDoNothing();
    await tx.insert(applicationStageHistory).values(
      values.map((row) => ({
        id: randomUUID(),
        organizationId,
        applicationId: row.id,
        fromStageId: null,
        toStageId: row.stageId ?? null,
        toStageName: stages.byId.get(row.stageId ?? "")?.name ?? null,
        status: row.status,
        note: "Carried over from the candidate record",
        actorName: "System",
        createdAt: row.createdAt,
      })),
    );
  });
  return values.length;
}
