import { and, asc, eq, getTableColumns } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "../db";
import { application } from "../models/application.model";
import { user } from "../models/auth.model";
import { candidate } from "../models/candidate.model";
import { client } from "../models/client.model";
import { interview } from "../models/interview.model";
import { job } from "../models/job.model";
import { pipelineStage } from "../models/pipeline.model";
import { listStages } from "./pipeline.service";

/**
 * Everything the requirement detail screen reads. Split from `job.service.ts`
 * so the CRUD path stays short; every figure here is derived from real rows —
 * where the design shows something the data cannot answer yet (a stage clock
 * per move, client feedback), the field is simply absent.
 */

const DAY_MS = 86_400_000;
const profileLead = alias(user, "profile_lead");

/** Stages a candidate sits in, in board order — the same vocabulary the
 * candidate form writes into `starting_stage`. */
const SUBMITTED = "submitted";
const INTERVIEW = "interview";
const OFFER = "offer";

const days = (from: Date, to = new Date()) =>
  Math.max(0, Math.floor((to.getTime() - from.getTime()) / DAY_MS));

const shortDate = (value?: Date | string | null) => {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

async function detailBase(organizationId: string, id: string) {
  const [row] = await db
    .select({
      ...getTableColumns(job),
      clientName: client.name,
      clientReplacementPeriod: client.replacementPeriod,
      sourcerName: user.name,
      profileLeadName: profileLead.name,
    })
    .from(job)
    .leftJoin(client, eq(job.clientId, client.id))
    .leftJoin(user, eq(job.sourcerId, user.id))
    .leftJoin(profileLead, eq(job.profileLeadId, profileLead.id))
    .where(and(eq(job.id, id), eq(job.organizationId, organizationId)))
    .limit(1);
  return row ?? null;
}

/**
 * Every application on this requirement — the scope of every count on the
 * screen. Reads the application record, not the candidate's own fields, so the
 * board and this screen can never disagree.
 */
async function pipelineRows(id: string) {
  return db
    .select({
      id: application.id,
      stageId: application.stageId,
      stageName: pipelineStage.name,
      status: application.status,
      matchScore: candidate.matchScore,
      createdAt: application.createdAt,
      stageEnteredAt: application.stageEnteredAt,
      updatedAt: application.updatedAt,
    })
    .from(application)
    .leftJoin(candidate, eq(application.candidateId, candidate.id))
    .leftJoin(pipelineStage, eq(application.stageId, pipelineStage.id))
    .where(eq(application.jobId, id));
}

function money(currency: string, min?: string | null, max?: string | null) {
  const format = (value?: string | null) => {
    const amount = Number(value ?? "");
    if (!Number.isFinite(amount) || amount === 0) return "";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 0,
      notation: "compact",
    }).format(amount);
  };
  const from = format(min);
  const to = format(max);
  if (from && to) return `${from} – ${to}`;
  return from || to || "";
}

/** The identity row: title, who it is for, and the band it pays. */
export async function jobSummary(organizationId: string, id: string) {
  const row = await detailBase(organizationId, id);
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    reference: row.reference ?? "",
    clientId: row.clientId ?? "",
    clientName: row.clientName ?? "",
    roleCategory: row.roleCategory ?? "",
    status: row.status,
    priority: row.priority ?? "normal",
    remote: row.remote,
    workModel: row.workModel ?? "",
    employmentType: row.employmentType ?? "",
    salaryLabel: money(row.salaryCurrency ?? "INR", row.salaryMin, row.salaryMax),
    locationLabel:
      row.workModel === "remote" || row.remote
        ? "remote"
        : [row.address?.city, row.address?.country].filter(Boolean).join(", "),
  };
}

/**
 * The four progress tiles. Stage counts come from the candidates on the
 * requirement; "awaiting feedback" is a submission that has sat still longer
 * than the stage allows — the requirement's own SLA override first, then the
 * workspace default for that stage.
 */
export async function jobKpis(organizationId: string, id: string) {
  const row = await detailBase(organizationId, id);
  if (!row) return null;

  const [rows, stages, interviews] = await Promise.all([
    pipelineRows(id),
    listStages(organizationId),
    db
      .select({ id: interview.id, scheduledAt: interview.scheduledAt, status: interview.status })
      .from(interview)
      .where(and(eq(interview.organizationId, organizationId), eq(interview.jobId, id)))
      .orderBy(asc(interview.scheduledAt)),
  ]);

  const live = rows.filter((entry) => entry.status === "active" || entry.status === "hired");
  const at = (name: string) =>
    live.filter((entry) => (entry.stageName ?? "").toLowerCase() === name);
  const submitted = at(SUBMITTED);
  const offers = at(OFFER);
  const hires = rows.filter((entry) => entry.status === "hired");

  const submittedStage = stages.find((stage) => stage.name.toLowerCase() === SUBMITTED);
  const slaDays = submittedStage
    ? (row.stageSlas?.[submittedStage.id] ?? submittedStage.slaDays)
    : 0;
  // "Awaiting feedback" is a submission whose stage clock has run out.
  const awaiting = slaDays
    ? submitted.filter((entry) => days(entry.stageEnteredAt) > slaDays).length
    : 0;

  const upcoming = interviews.find((entry) => entry.scheduledAt.getTime() >= Date.now());
  const oldestOffer = offers.reduce<number>(
    (oldest, entry) => Math.max(oldest, days(entry.stageEnteredAt)),
    0,
  );

  return {
    submitted: submitted.length,
    awaiting,
    interviews: interviews.length,
    nextInterviewAt: upcoming?.scheduledAt?.toISOString() ?? "",
    offers: offers.length,
    offerWaitingDays: oldestOffer,
    hires: hires.length,
    openingsRemaining: Math.max(0, row.openings - hires.length),
    inPipeline: live.length,
    interviewing: at(INTERVIEW).length,
  };
}

/** The rail's assigned-team card: who owns this requirement, and the number
 * each of them is measured on. */
export async function jobTeam(organizationId: string, id: string) {
  const row = await detailBase(organizationId, id);
  if (!row) return null;
  const rows = await pipelineRows(id);
  const submitted = rows.filter(
    (entry) => (entry.stageName ?? "").toLowerCase() === SUBMITTED,
  ).length;

  return {
    jobId: row.id,
    members: [
      {
        id: row.sourcerId ?? "",
        name: row.sourcerName ?? "",
        role: "sourcer",
        metric: rows.length,
      },
      {
        id: row.profileLeadId ?? "",
        name: row.profileLeadName ?? "",
        role: "profileLead",
        metric: submitted,
      },
    ].filter((member) => member.name),
  };
}

export type MilestoneState = "done" | "current" | "pending";

/**
 * The hiring timeline. Each milestone is the first real event of its kind;
 * without stage history the dates are the records' own timestamps, so a
 * milestone only appears as reached once something exists to prove it.
 */
export async function jobTimeline(organizationId: string, id: string) {
  const row = await detailBase(organizationId, id);
  if (!row) return null;

  const [rows, interviews] = await Promise.all([
    pipelineRows(id),
    db
      .select({ scheduledAt: interview.scheduledAt })
      .from(interview)
      .where(and(eq(interview.organizationId, organizationId), eq(interview.jobId, id)))
      .orderBy(asc(interview.scheduledAt))
      .limit(1),
  ]);

  const earliest = (list: { createdAt: Date }[]) =>
    list.reduce<Date | null>(
      (oldest, entry) => (!oldest || entry.createdAt < oldest ? entry.createdAt : oldest),
      null,
    );

  const stageIs = (name: string) => (entry: { stageName: string | null }) =>
    (entry.stageName ?? "").toLowerCase() === name;
  const firstCandidate = earliest(rows);
  const firstSubmission = earliest(rows.filter(stageIs(SUBMITTED)));
  const firstInterview = interviews[0]?.scheduledAt ?? null;
  const firstOffer = earliest(rows.filter(stageIs(OFFER)));
  const hires = rows.filter((entry) => entry.status === "hired").length;

  const raw: { key: string; at: Date | null; note?: string }[] = [
    { key: "created", at: row.createdAt },
    { key: "opened", at: row.dateOpened ? new Date(row.dateOpened) : null },
    { key: "firstCandidate", at: firstCandidate },
    { key: "firstSubmission", at: firstSubmission },
    { key: "firstInterview", at: firstInterview },
    { key: "offer", at: firstOffer },
  ];

  const milestones = raw.map((entry) => ({
    key: entry.key,
    when: shortDate(entry.at),
    state: (entry.at ? "done" : "pending") as MilestoneState,
  }));
  // The first unreached milestone is where the requirement actually stands.
  const current = milestones.find((entry) => entry.state === "pending");
  if (current) current.state = "current";

  milestones.push({
    key: "hire",
    when: `${hires} / ${row.openings}`,
    state: hires >= row.openings ? "done" : "pending",
  });

  return {
    milestones,
    dayCount: days(row.createdAt),
    stageLabel: current?.key ?? "hire",
  };
}

/** The rail's fact sheet, plus the hiring-period meter above it. */
export async function jobInfo(organizationId: string, id: string) {
  const row = await detailBase(organizationId, id);
  if (!row) return null;

  const start = row.dateOpened ? new Date(row.dateOpened) : row.createdAt;
  const end = row.targetDate ? new Date(row.targetDate) : null;
  const total = end ? Math.max(1, days(start, end)) : 0;
  const elapsed = days(start);

  return {
    status: row.status,
    periodLabel: [shortDate(start), shortDate(end)].filter(Boolean).join(" – "),
    dayOf: elapsed,
    dayTotal: total,
    daysLeft: total ? Math.max(0, total - elapsed) : 0,
    percent: total ? Math.min(100, Math.round((elapsed / total) * 100)) : 0,
    createdLabel: shortDate(row.createdAt),
    updatedLabel: shortDate(row.updatedAt),
    openings: row.openings,
    workModel: row.workModel ?? "",
    employmentType: row.employmentType ?? "",
    workExperience: row.workExperience ?? "",
    reference: row.reference ?? "",
    // The guarantee is the client's replacement term, not a per-role field.
    guarantee: row.clientReplacementPeriod ?? "",
  };
}

/** The rail's AI screening card — what the screener has actually scored. */
export async function jobScreening(organizationId: string, id: string) {
  const row = await detailBase(organizationId, id);
  if (!row) return null;

  const rows = await pipelineRows(id);
  const scored = rows.filter(
    (entry) => entry.matchScore !== null && entry.matchScore !== undefined,
  );

  return {
    enabled: row.aiScreening,
    threshold: row.matchThreshold,
    total: rows.length,
    screened: scored.length,
    // Counted here rather than in SQL: the threshold is the requirement's own.
    matched: scored.filter((entry) => (entry.matchScore ?? 0) >= row.matchThreshold).length,
    autoAdvance: row.autoAdvance,
    knockoutCount: (row.knockoutQuestions ?? []).length,
  };
}
