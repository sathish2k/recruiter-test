import { and, asc, desc, eq, getTableColumns, ne } from "drizzle-orm";
import { db } from "../db";
import { auditLog } from "../models/audit-log.model";
import { user } from "../models/auth.model";
import { candidate } from "../models/candidate.model";
import { client } from "../models/client.model";
import { interview } from "../models/interview.model";
import { job } from "../models/job.model";
import { listStages } from "./pipeline.service";

/**
 * The candidate detail screen. As on the requirement side, every figure is
 * read from rows that exist: the stage strip is the workspace's own pipeline,
 * the assessment scores the candidate's skills against the requirement's, and
 * the activity feed is the audit trail. Nothing here invents a history.
 */

const DAY_MS = 86_400_000;

const fullName = (first: string, last?: string | null) =>
  [first, last].filter(Boolean).join(" ").trim();

const days = (from: Date, to = new Date()) =>
  Math.max(0, Math.floor((to.getTime() - from.getTime()) / DAY_MS));

const shortDate = (value?: Date | string | null) => {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

/** "Today" / "Yesterday" / "5d ago", as the other detail screens write it. */
function relativeDays(when: Date) {
  const elapsed = days(when);
  if (elapsed <= 0) return "Today";
  if (elapsed === 1) return "Yesterday";
  if (elapsed < 7) return `${elapsed}d ago`;
  return `${Math.floor(elapsed / 7)}w ago`;
}

async function detailBase(organizationId: string, id: string) {
  const [row] = await db
    .select({
      ...getTableColumns(candidate),
      jobTitle: job.title,
      jobSkills: job.skills,
      jobWorkModel: job.workModel,
      jobEmploymentType: job.employmentType,
      jobSalaryMax: job.salaryMax,
      jobSalaryCurrency: job.salaryCurrency,
      clientId: client.id,
      clientName: client.name,
      ownerName: user.name,
    })
    .from(candidate)
    .leftJoin(job, eq(candidate.jobId, job.id))
    .leftJoin(client, eq(job.clientId, client.id))
    .leftJoin(user, eq(candidate.ownerId, user.id))
    .where(and(eq(candidate.id, id), eq(candidate.organizationId, organizationId)))
    .limit(1);
  return row ?? null;
}

/**
 * The hero: identity, the chips beside the name, and the stage strip. The
 * strip is the workspace's own `pipeline_stage` list, so it stays right when a
 * workspace renames or reorders its board.
 */
export async function candidateSummary(organizationId: string, id: string) {
  const row = await detailBase(organizationId, id);
  if (!row) return null;

  const stages = await listStages(organizationId);
  const currentIndex = stages.findIndex(
    (stage) => stage.name.toLowerCase() === (row.startingStage ?? "").toLowerCase(),
  );

  return {
    id: row.id,
    name: fullName(row.firstName, row.lastName),
    currentJobTitle: row.currentJobTitle ?? "",
    currentEmployer: row.currentEmployer ?? "",
    experienceYears: row.experienceYears ?? "",
    location: [row.address?.city, row.address?.state].filter(Boolean).join(", "),
    email: row.email ?? "",
    status: row.status,
    availability: row.availability ?? "",
    doNotContact: row.doNotContact,
    offLimits: Boolean(row.offLimitsUntil && row.offLimitsUntil.getTime() > Date.now()),
    matchScore: row.matchScore ?? 0,
    jobId: row.jobId ?? "",
    jobTitle: row.jobTitle ?? "",
    clientName: row.clientName ?? "",
    ownerName: row.ownerName ?? "",
    stage: row.startingStage ?? "",
    lastActivity: relativeDays(row.updatedAt),
    /** The strip: every stage, with the one the candidate sits in marked. */
    stages: stages.map((stage, index) => ({
      id: stage.id,
      name: stage.name,
      state:
        currentIndex < 0
          ? index === 0
            ? "current"
            : "pending"
          : index < currentIndex
            ? "done"
            : index === currentIndex
              ? "current"
              : "pending",
    })),
  };
}

/**
 * The assessment card. The score is what the screener stored; the breakdown is
 * computed here — the requirement's must-have skills against the candidate's,
 * which is the one comparison the data can actually justify.
 */
export async function candidateAssessment(organizationId: string, id: string) {
  const row = await detailBase(organizationId, id);
  if (!row) return null;

  const wanted = (row.jobSkills ?? []).map((skill) => skill.toLowerCase());
  const held = new Set((row.skillSet ?? []).map((skill) => skill.toLowerCase()));
  const matched = wanted.filter((skill) => held.has(skill));
  const missing = wanted.filter((skill) => !held.has(skill));
  const coverage = wanted.length ? Math.round((matched.length / wanted.length) * 100) : 0;

  return {
    score: row.matchScore ?? 0,
    hasScore: row.matchScore !== null,
    jobId: row.jobId ?? "",
    jobTitle: row.jobTitle ?? "",
    coverage,
    matched: (row.jobSkills ?? []).filter((skill) => held.has(skill.toLowerCase())),
    missing: (row.jobSkills ?? []).filter((skill) => !held.has(skill.toLowerCase())),
    missingCount: missing.length,
    /** Named from the coverage, never invented prose. */
    recommendation: coverage >= 80 ? "proceed" : coverage >= 50 ? "review" : "gap",
  };
}

/** The rail's fact card — contact, profile and the compliance row. */
export async function candidateDetails(organizationId: string, id: string) {
  const row = await detailBase(organizationId, id);
  if (!row) return null;

  return {
    email: row.email ?? "",
    phone: row.mobile || row.phone || "",
    linkedin: row.linkedin ?? "",
    location: [row.address?.city, row.address?.state, row.address?.country]
      .filter(Boolean)
      .join(", "),
    openToRemote: row.openToRemote,
    openToRelocate: row.openToRelocate,
    availability: row.availability ?? "",
    availableFromLabel: shortDate(row.availableFrom),
    noticePeriod: row.noticePeriod ?? "",
    currentSalary: row.currentSalary ?? "",
    expectedSalary: row.expectedSalary ?? "",
    salaryCurrency: row.salaryCurrency ?? "INR",
    source: row.source ?? "",
    addedLabel: shortDate(row.createdAt),
    consentAtLabel: shortDate(row.consentAt),
    consentSource: row.consentSource ?? "",
    doNotContact: row.doNotContact,
    offLimitsUntilLabel: shortDate(row.offLimitsUntil),
    workAuthorization: row.workAuthorization ?? "",
  };
}

/** The rail's "current assignment" card: the requirement this person is on. */
export async function candidateAssignment(organizationId: string, id: string) {
  const row = await detailBase(organizationId, id);
  if (!row) return null;
  if (!row.jobId) return { jobId: "" };

  const stages = await listStages(organizationId);
  const stage = stages.find(
    (entry) => entry.name.toLowerCase() === (row.startingStage ?? "").toLowerCase(),
  );
  const inStage = days(row.updatedAt);
  const sla = stage?.slaDays ?? 0;

  return {
    jobId: row.jobId,
    jobTitle: row.jobTitle ?? "",
    clientId: row.clientId ?? "",
    clientName: row.clientName ?? "",
    workModel: row.jobWorkModel ?? "",
    employmentType: row.jobEmploymentType ?? "",
    stage: row.startingStage ?? "",
    stageDays: inStage,
    slaDays: sla,
    slaOverBy: sla && inStage > sla ? inStage - sla : 0,
    ownerName: row.ownerName ?? "",
  };
}

/**
 * The rail's next actions. Each one is a gap the record itself proves — no CV
 * attached, no consent recorded, an SLA already passed — so the list is empty
 * when there is genuinely nothing to chase.
 */
export async function candidateActions(organizationId: string, id: string) {
  const row = await detailBase(organizationId, id);
  if (!row) return null;

  const stages = await listStages(organizationId);
  const stage = stages.find(
    (entry) => entry.name.toLowerCase() === (row.startingStage ?? "").toLowerCase(),
  );
  const inStage = days(row.updatedAt);
  const actions: { key: string; tone: "urgent" | "warn" | "info"; value?: string }[] = [];

  if (stage?.slaDays && inStage > stage.slaDays) {
    actions.push({ key: "slaBreached", tone: "urgent", value: String(inStage - stage.slaDays) });
  }
  if (!(row.resume ?? []).length) actions.push({ key: "noResume", tone: "warn" });
  if (!row.consentAt) actions.push({ key: "noConsent", tone: "warn" });
  if (!row.jobId) actions.push({ key: "noRequirement", tone: "info" });
  if (!row.email && !row.mobile && !row.phone) actions.push({ key: "noContact", tone: "warn" });

  return { actions };
}

export type CandidateWorkspaceTab = "applications" | "documents" | "activity";

/** One tab of the workspace panel. */
export async function candidateWorkspace(
  organizationId: string,
  id: string,
  tab: CandidateWorkspaceTab,
) {
  const row = await detailBase(organizationId, id);
  if (!row) return [];

  if (tab === "applications") {
    // One row until the application record exists (gap analysis, step 8): a
    // candidate carries a single requirement association today.
    if (!row.jobId) return [];
    const stages = await listStages(organizationId);
    const stage = stages.find(
      (entry) => entry.name.toLowerCase() === (row.startingStage ?? "").toLowerCase(),
    );
    return [
      {
        id: row.jobId,
        role: row.jobTitle ?? "",
        clientName: row.clientName ?? "",
        stage: stage?.name ?? row.startingStage ?? "",
        owner: row.ownerName ?? "",
        matchScore: row.matchScore ?? 0,
        updated: relativeDays(row.updatedAt),
      },
    ];
  }

  if (tab === "documents") {
    const slots: [string, typeof row.resume][] = [
      ["resume", row.resume],
      ["formattedResume", row.formattedResume],
      ["coverLetter", row.coverLetter],
      ["offer", row.offer],
      ["contracts", row.contracts],
      ["other", row.attachments],
    ];
    return slots.flatMap(([slot, files]) =>
      (files ?? []).map((file, index) => ({
        id: `${slot}-${index}`,
        slot,
        name: file.name,
        url: file.url,
        size: file.size ?? 0,
        type: file.type ?? "",
        updated: relativeDays(row.updatedAt),
      })),
    );
  }

  // Activity: the audit trail naming this candidate, newest first.
  const rows = await db
    .select({
      id: auditLog.id,
      event: auditLog.event,
      category: auditLog.category,
      actorName: auditLog.actorName,
      details: auditLog.details,
      createdAt: auditLog.createdAt,
    })
    .from(auditLog)
    .where(and(eq(auditLog.organizationId, organizationId), eq(auditLog.category, "candidates")))
    .orderBy(desc(auditLog.createdAt))
    .limit(80);

  const name = fullName(row.firstName, row.lastName);
  return rows
    .filter((entry) => entry.event.includes(name))
    .slice(0, 30)
    .map((entry) => ({
      id: entry.id,
      event: entry.event,
      actor: entry.actorName,
      stage: String((entry.details as Record<string, unknown> | null)?.stage ?? ""),
      when: relativeDays(entry.createdAt),
      day: relativeDays(entry.createdAt),
      icon: "history",
    }));
}

/** Interviews already scheduled with this candidate — the hero's next date. */
export async function candidateNextInterview(organizationId: string, id: string) {
  const [row] = await db
    .select({ scheduledAt: interview.scheduledAt, status: interview.status })
    .from(interview)
    .where(
      and(
        eq(interview.organizationId, organizationId),
        eq(interview.candidateId, id),
        ne(interview.status, "cancelled"),
      ),
    )
    .orderBy(asc(interview.scheduledAt))
    .limit(1);
  return row ?? null;
}
