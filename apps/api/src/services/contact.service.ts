import { randomUUID } from "node:crypto";
import { and, asc, count, desc, eq, getTableColumns, ilike, inArray, ne, or } from "drizzle-orm";
import { db } from "../db";
import { auditLog } from "../models/audit-log.model";
import { user } from "../models/auth.model";
import { candidate } from "../models/candidate.model";
import { client } from "../models/client.model";
import { type ContactAttachment, type ContactType, contact } from "../models/contact.model";
import { interview } from "../models/interview.model";
import { job } from "../models/job.model";

type ContactRow = typeof contact.$inferSelect;

function fullName(first?: string | null, last?: string | null) {
  return [first, last].filter(Boolean).join(" ").trim();
}

/** "Today" / "Yesterday" / "5d ago" / "3w ago", as the design writes it. */
function relativeDays(when: Date): string {
  const days = Math.floor((Date.now() - when.getTime()) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function mapContact(row: ContactRow & { clientName?: string | null; ownerName?: string | null }) {
  return {
    id: row.id,
    salutation: row.salutation ?? "",
    firstName: row.firstName,
    lastName: row.lastName,
    name: fullName(row.firstName, row.lastName),
    email: row.email ?? "",
    secondaryEmail: row.secondaryEmail ?? "",
    phone: row.phone ?? "",
    mobile: row.mobile ?? "",
    title: row.title ?? "",
    department: row.department ?? "",
    linkedin: row.linkedin ?? "",
    website: row.website ?? "",
    github: row.github ?? "",
    preferredChannel: row.preferredChannel ?? "",
    timezone: row.timezone ?? "",
    assistant: row.assistant ?? "",
    twitter: row.twitter ?? "",
    source: row.source ?? "",
    notes: row.notes ?? "",
    attachments: row.attachments ?? [],
    clientId: row.clientId ?? "",
    clientName: row.clientName ?? "",
    ownerId: row.ownerId ?? "",
    ownerName: row.ownerName ?? "",
    status: row.status,
    isPrimary: row.isPrimary,
    emailOptOut: row.emailOptOut,
    phoneOptOut: row.phoneOptOut,
    type: row.type,
    // "Contact since" on the detail screen.
    createdAt: row.createdAt.toISOString(),
    // How long since anyone touched this contact — the list flags anything
    // that has gone quiet for a fortnight.
    lastTouch: relativeDays(row.updatedAt),
    lastTouchStale: Date.now() - row.updatedAt.getTime() > 14 * 24 * 60 * 60 * 1000,
    lastTouchColor:
      Date.now() - row.updatedAt.getTime() > 14 * 24 * 60 * 60 * 1000
        ? "var(--mui-palette-surface-warningFg)"
        : "var(--mui-palette-surface-textSecondary)",
  };
}

const SORT_FIELDS = {
  name: contact.firstName,
  createdAt: contact.createdAt,
} as const;

function split(value?: string) {
  return (value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export interface ListContactsParams {
  search?: string;
  client?: string;
  owner?: string;
  page?: number;
  pageSize?: number;
  sortKey?: string;
  sortDir?: string;
}

export async function listContacts(organizationId: string, params: ListContactsParams = {}) {
  const filters = [eq(contact.organizationId, organizationId), eq(contact.archived, false)];

  if (params.search) {
    const term = `%${params.search}%`;
    const match = or(
      ilike(contact.firstName, term),
      ilike(contact.lastName, term),
      ilike(contact.email, term),
      ilike(contact.phone, term),
      ilike(contact.title, term),
    );
    if (match) filters.push(match);
  }
  const clients = split(params.client);
  if (clients.length) filters.push(inArray(contact.clientId, clients));
  const owners = split(params.owner);
  if (owners.length) filters.push(inArray(contact.ownerId, owners));

  const where = and(...filters);
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 10));
  const column = SORT_FIELDS[params.sortKey as keyof typeof SORT_FIELDS] ?? contact.createdAt;
  const order = params.sortDir === "asc" ? asc(column) : desc(column);

  const [rows, countRows] = await Promise.all([
    db
      .select({ ...getTableColumns(contact), clientName: client.name, ownerName: user.name })
      .from(contact)
      .leftJoin(client, eq(contact.clientId, client.id))
      .leftJoin(user, eq(contact.ownerId, user.id))
      .where(where)
      .orderBy(order)
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ total: count() }).from(contact).where(where),
  ]);

  return { data: rows.map(mapContact), totalCount: countRows[0]?.total ?? 0 };
}

export async function getContact(organizationId: string, id: string) {
  const [row] = await db
    .select({ ...getTableColumns(contact), clientName: client.name, ownerName: user.name })
    .from(contact)
    .leftJoin(client, eq(contact.clientId, client.id))
    .leftJoin(user, eq(contact.ownerId, user.id))
    .where(and(eq(contact.id, id), eq(contact.organizationId, organizationId)))
    .limit(1);
  return row ? mapContact(row) : null;
}

export interface ContactInput {
  salutation?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  secondaryEmail?: string;
  phone?: string;
  mobile?: string;
  title?: string;
  department?: string;
  linkedin?: string;
  website?: string;
  github?: string;
  preferredChannel?: string;
  timezone?: string;
  assistant?: string;
  twitter?: string;
  source?: string;
  notes?: string;
  attachments?: ContactAttachment[];
  clientId?: string;
  ownerId?: string;
  status?: string;
  isPrimary?: boolean;
  emailOptOut?: boolean;
  phoneOptOut?: boolean;
  type?: string;
}

const EDITABLE = [
  "salutation",
  "firstName",
  "lastName",
  "email",
  "secondaryEmail",
  "phone",
  "mobile",
  "title",
  "department",
  "linkedin",
  "twitter",
  "website",
  "github",
  "preferredChannel",
  "timezone",
  "assistant",
  "source",
  "notes",
  "attachments",
  "clientId",
  "ownerId",
  "status",
  "isPrimary",
  "emailOptOut",
  "phoneOptOut",
] as const;

function pickEditable(input: ContactInput): Partial<ContactRow> {
  const patch: Record<string, unknown> = {};
  for (const field of EDITABLE) {
    if (input[field] === undefined) continue;
    patch[field] =
      input[field] === "" && field !== "firstName" && field !== "lastName" ? null : input[field];
  }
  return patch as Partial<ContactRow>;
}

const toE164 = (value: string) => value.replace(/[^\d+]/g, "");
function normalizeLinkedin(value: string) {
  const v = value.trim();
  if (!v || /^https?:\/\//i.test(v)) return v;
  return /^([\w-]+\.)?linkedin\.com/i.test(v) ? `https://${v}` : v;
}
function normalizeTwitter(value: string) {
  const v = value.trim();
  if (!v) return v;
  const handle = v.replace(/^https?:\/\/(x|twitter)\.com\//i, "").replace(/^@/, "");
  return `@${handle.replace(/\/.*$/, "")}`;
}

/** Canonicalise inputs so storage stays consistent regardless of the client. */
function normalizeInput(input: ContactInput): ContactInput {
  const out = { ...input };
  if (out.email !== undefined) out.email = out.email.trim().toLowerCase();
  if (out.secondaryEmail !== undefined)
    out.secondaryEmail = out.secondaryEmail.trim().toLowerCase();
  if (out.phone) out.phone = toE164(out.phone);
  if (out.mobile) out.mobile = toE164(out.mobile);
  if (out.linkedin) out.linkedin = normalizeLinkedin(out.linkedin);
  if (out.twitter) out.twitter = normalizeTwitter(out.twitter);
  // Secondary email can never equal the primary.
  if (out.secondaryEmail && out.email && out.secondaryEmail === out.email) out.secondaryEmail = "";
  return out;
}

/** At most one primary per client — clear the others. */
async function clearOtherPrimaries(organizationId: string, clientId: string, exceptId: string) {
  await db
    .update(contact)
    .set({ isPrimary: false })
    .where(
      and(
        eq(contact.organizationId, organizationId),
        eq(contact.clientId, clientId),
        ne(contact.id, exceptId),
      ),
    );
}

export async function createContact(organizationId: string, rawInput: ContactInput) {
  const input = normalizeInput(rawInput);
  // Default the owner to the client's account lead when none was chosen.
  let ownerId = input.ownerId;
  if (!ownerId && input.clientId) {
    const [row] = await db
      .select({ lead: client.accountLeadId })
      .from(client)
      .where(and(eq(client.id, input.clientId), eq(client.organizationId, organizationId)))
      .limit(1);
    ownerId = row?.lead ?? undefined;
  }
  const [created] = await db
    .insert(contact)
    .values({
      id: randomUUID(),
      organizationId,
      type: (input.type as ContactType) ?? "hiring_manager",
      firstName: input.firstName?.trim() ?? "",
      lastName: input.lastName?.trim() ?? "",
      ...pickEditable({ ...input, ownerId, firstName: undefined, lastName: undefined }),
    })
    .returning();
  if (created?.isPrimary && created.clientId) {
    await clearOtherPrimaries(organizationId, created.clientId, created.id);
  }
  return created ? mapContact(created) : null;
}

export async function updateContact(organizationId: string, id: string, rawInput: ContactInput) {
  const input = normalizeInput(rawInput);
  const [updated] = await db
    .update(contact)
    .set({ ...pickEditable(input), updatedAt: new Date() })
    .where(and(eq(contact.id, id), eq(contact.organizationId, organizationId)))
    .returning();
  if (updated?.isPrimary && updated.clientId) {
    await clearOtherPrimaries(organizationId, updated.clientId, updated.id);
  }
  return updated ? mapContact(updated) : null;
}

export interface DuplicateQuery {
  clientId: string;
  email?: string;
  mobile?: string;
  firstName?: string;
  lastName?: string;
  excludeId?: string;
}

/** Same-client contacts matching by email, mobile or first+last name. */
export async function findDuplicates(organizationId: string, query: DuplicateQuery) {
  if (!query.clientId) return [];
  const matchers = [];
  if (query.email) matchers.push(eq(contact.email, query.email.trim().toLowerCase()));
  if (query.mobile) matchers.push(eq(contact.mobile, toE164(query.mobile)));
  if (query.firstName && query.lastName) {
    matchers.push(
      and(ilike(contact.firstName, query.firstName), ilike(contact.lastName, query.lastName)),
    );
  }
  const anyMatch = or(...matchers);
  if (!anyMatch) return [];

  const filters = [
    eq(contact.organizationId, organizationId),
    eq(contact.clientId, query.clientId),
    eq(contact.archived, false),
    anyMatch,
  ];
  if (query.excludeId) filters.push(ne(contact.id, query.excludeId));

  const rows = await db
    .select({ ...getTableColumns(contact), clientName: client.name, ownerName: user.name })
    .from(contact)
    .leftJoin(client, eq(contact.clientId, client.id))
    .leftJoin(user, eq(contact.ownerId, user.id))
    .where(and(...filters))
    .limit(5);
  return rows.map(mapContact);
}

export async function archiveContact(organizationId: string, id: string) {
  const [archived] = await db
    .update(contact)
    .set({ archived: true, isPrimary: false, updatedAt: new Date() })
    .where(and(eq(contact.id, id), eq(contact.organizationId, organizationId)))
    .returning();
  return archived ? { id: archived.id } : null;
}

export async function deleteContact(organizationId: string, id: string) {
  const [deleted] = await db
    .delete(contact)
    .where(and(eq(contact.id, id), eq(contact.organizationId, organizationId)))
    .returning();
  return deleted ? { id: deleted.id } : null;
}

/** Makes one contact the primary for its client, clearing the others. */
export async function setPrimary(organizationId: string, id: string) {
  const [target] = await db
    .select({ clientId: contact.clientId })
    .from(contact)
    .where(and(eq(contact.id, id), eq(contact.organizationId, organizationId)))
    .limit(1);
  if (!target) return null;
  if (target.clientId) {
    await db
      .update(contact)
      .set({ isPrimary: false })
      .where(
        and(eq(contact.organizationId, organizationId), eq(contact.clientId, target.clientId)),
      );
  }
  const [updated] = await db
    .update(contact)
    .set({ isPrimary: true, updatedAt: new Date() })
    .where(and(eq(contact.id, id), eq(contact.organizationId, organizationId)))
    .returning();
  return updated ? { id: updated.id } : null;
}

/* ------------------------------------------------------------------ *
 * Contact detail — one query per card, mirroring the client detail.
 * ------------------------------------------------------------------ */

const SLA_HOURS = 48;
const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

/** The requirements this contact is named on — the scope every detail query
 * below runs inside. */
async function contactJobIds(organizationId: string, id: string) {
  const rows = await db
    .select({ id: job.id })
    .from(job)
    .where(and(eq(job.organizationId, organizationId), eq(job.clientContactId, id)));
  return rows.map((row) => row.id);
}

/** Candidates this contact still owes a decision on, oldest first. */
async function pendingWithContact(jobIds: string[]) {
  if (!jobIds.length) return [];
  return db
    .select({
      id: candidate.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      jobId: candidate.jobId,
      matchScore: candidate.matchScore,
      reminderSentAt: candidate.reminderSentAt,
      ownerName: user.name,
      updatedAt: candidate.updatedAt,
    })
    .from(candidate)
    .leftJoin(user, eq(candidate.ownerId, user.id))
    .where(and(inArray(candidate.jobId, jobIds), eq(candidate.startingStage, "submitted")))
    .orderBy(asc(candidate.updatedAt));
}

/**
 * How responsive this contact is, measured from the only feedback signal the
 * data actually carries: candidates submitted on their requirements and how
 * long each took to move on. There is no message or call history to read, so
 * "reply" here means "decision on a submission" throughout.
 */
async function responsiveness(jobIds: string[]) {
  if (!jobIds.length) {
    return { replyRate: 0, avgReplyHours: 0, decided: 0, submitted: 0, interactions90d: 0 };
  }
  const rows = await db
    .select({
      stage: candidate.startingStage,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
    })
    .from(candidate)
    .where(inArray(candidate.jobId, jobIds));

  const moved = rows.filter((row) => row.stage && row.stage !== "submitted");
  const hours = moved.map((row) => (row.updatedAt.getTime() - row.createdAt.getTime()) / HOUR_MS);
  const since = Date.now() - 90 * DAY_MS;
  return {
    submitted: rows.length,
    decided: moved.length,
    replyRate: rows.length ? Math.round((moved.length / rows.length) * 100) : 0,
    avgReplyHours: hours.length
      ? Math.max(1, Math.round(hours.reduce((total, value) => total + value, 0) / hours.length))
      : 0,
    interactions90d: rows.filter((row) => row.updatedAt.getTime() >= since).length,
  };
}

/** Reply rate and speed → the design's five-star band. */
function healthBand(replyRate: number, avgReplyHours: number) {
  const speed = avgReplyHours === 0 ? 0 : Math.max(0, 100 - (avgReplyHours / SLA_HOURS) * 100);
  const score = Math.round(replyRate * 0.6 + speed * 0.4);
  return {
    score,
    band: score >= 75 ? "strong" : score >= 50 ? "steady" : score > 0 ? "slipping" : "new",
  };
}

async function detailBase(organizationId: string, id: string) {
  const [row] = await db
    .select({
      ...getTableColumns(contact),
      clientName: client.name,
      clientIndustry: client.industry,
      clientCreatedAt: client.createdAt,
      ownerName: user.name,
    })
    .from(contact)
    .leftJoin(client, eq(contact.clientId, client.id))
    .leftJoin(user, eq(contact.ownerId, user.id))
    .where(and(eq(contact.id, id), eq(contact.organizationId, organizationId)))
    .limit(1);
  return row ?? null;
}

/** The identity header: name, the chips beside it, and the meta line. */
export async function contactSummary(organizationId: string, id: string) {
  const row = await detailBase(organizationId, id);
  if (!row) return null;

  const jobIds = await contactJobIds(organizationId, id);
  const stats = await responsiveness(jobIds);

  return {
    id: row.id,
    name: fullName(row.firstName, row.lastName),
    title: row.title ?? "",
    department: row.department ?? "",
    clientId: row.clientId ?? "",
    clientName: row.clientName ?? "",
    ownerName: row.ownerName ?? "",
    email: row.email ?? "",
    phone: row.mobile || row.phone || "",
    status: row.status,
    isPrimary: row.isPrimary,
    createdAt: row.createdAt.toISOString(),
    // The design's "Fast responder" badge — only shown once there is a
    // decision history to justify it.
    fastResponder: stats.decided > 0 && stats.avgReplyHours <= 24,
    avgReplyHours: stats.avgReplyHours,
  };
}

/**
 * The prose card. The design writes it from email and call history; we have
 * neither, so this is assembled from the same figures the rest of the screen
 * shows — open requirements, decisions owed, reply speed and last touch.
 */
export async function contactBriefing(organizationId: string, id: string) {
  const row = await detailBase(organizationId, id);
  if (!row) return null;

  const jobIds = await contactJobIds(organizationId, id);
  const [stats, pending, openJobs] = await Promise.all([
    responsiveness(jobIds),
    pendingWithContact(jobIds),
    jobIds.length
      ? db
          .select({ total: count() })
          .from(job)
          .where(and(inArray(job.id, jobIds), eq(job.status, "open")))
      : Promise.resolve([{ total: 0 }]),
  ]);

  const name = row.firstName || fullName(row.firstName, row.lastName);
  const open = Number(openJobs[0]?.total ?? 0);
  const sentences = [
    open
      ? `${name} is named on ${open} open requirement${open === 1 ? "" : "s"} at ${row.clientName ?? "their client"}.`
      : `${name} has no open requirements at ${row.clientName ?? "their client"} right now.`,
    pending.length
      ? `${pending.length} submission${pending.length === 1 ? " is" : "s are"} waiting on their decision.`
      : "No submissions are waiting on their decision.",
    stats.decided
      ? `They decide in ${stats.avgReplyHours}h on average and have responded to ${stats.replyRate}% of submissions.`
      : "There is no decision history to measure their response speed yet.",
    `Last touched ${relativeDays(row.updatedAt).toLowerCase()}.`,
  ];

  return {
    prose: sentences.join(" "),
    basis: {
      openJobs: open,
      pending: pending.length,
      decided: stats.decided,
      submitted: stats.submitted,
    },
    generatedAt: new Date().toISOString(),
  };
}

/** The "Waiting on <name>" card: what this contact owes a decision on. */
export async function contactWaiting(organizationId: string, id: string) {
  const row = await detailBase(organizationId, id);
  if (!row) return null;

  const jobIds = await contactJobIds(organizationId, id);
  const pending = await pendingWithContact(jobIds);
  const titles = new Map(
    jobIds.length
      ? (
          await db.select({ id: job.id, title: job.title }).from(job).where(inArray(job.id, jobIds))
        ).map((entry) => [entry.id, entry.title])
      : [],
  );

  const oldest = pending[0];
  const elapsedHours = oldest ? Math.round((Date.now() - oldest.updatedAt.getTime()) / HOUR_MS) : 0;

  return {
    name: row.firstName || fullName(row.firstName, row.lastName),
    sla: {
      pending: pending.length,
      slaHours: SLA_HOURS,
      elapsedHours,
      remainingHours: Math.max(0, SLA_HOURS - elapsedHours),
      percent: Math.min(100, Math.round((elapsedHours / SLA_HOURS) * 100)),
      breached: elapsedHours > SLA_HOURS,
    },
    items: pending.map((entry) => {
      const role = titles.get(entry.jobId ?? "") ?? "";
      const hours = Math.max(1, Math.round((Date.now() - entry.updatedAt.getTime()) / HOUR_MS));
      const ago = hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
      return {
        id: entry.id,
        name: fullName(entry.firstName, entry.lastName),
        role,
        matchScore: entry.matchScore,
        meta: [role, `submitted ${ago}`, entry.ownerName ? `by ${entry.ownerName}` : ""]
          .filter(Boolean)
          .join(" · "),
        breached: hours > SLA_HOURS,
      };
    }),
  };
}

export type ContactWorkspaceTab = "activity" | "roles" | "candidates" | "interviews" | "notes";

/** One tab of the workspace panel, queried on demand as the user switches. */
export async function contactWorkspace(
  organizationId: string,
  id: string,
  tab: ContactWorkspaceTab,
  filter = "all",
) {
  const row = await detailBase(organizationId, id);
  if (!row) return [];
  const jobIds = await contactJobIds(organizationId, id);

  if (tab === "notes") {
    // The single pinned note lives on the contact; it is edited from the form.
    if (!row.notes) return [];
    return [
      {
        id: `${row.id}-note`,
        author: row.ownerName ?? "",
        body: row.notes,
        when: row.updatedAt.toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      },
    ];
  }

  if (tab === "interviews") {
    if (!jobIds.length) return [];
    const rows = await db
      .select({
        id: interview.id,
        scheduledAt: interview.scheduledAt,
        status: interview.status,
        jobTitle: job.title,
        candidateFirstName: candidate.firstName,
        candidateLastName: candidate.lastName,
        panelName: user.name,
      })
      .from(interview)
      .leftJoin(candidate, eq(interview.candidateId, candidate.id))
      .leftJoin(job, eq(interview.jobId, job.id))
      .leftJoin(user, eq(interview.ownerId, user.id))
      .where(and(eq(interview.organizationId, organizationId), inArray(interview.jobId, jobIds)))
      .orderBy(asc(interview.scheduledAt));

    return rows.map((entry) => ({
      id: entry.id,
      name: fullName(entry.candidateFirstName ?? "", entry.candidateLastName ?? ""),
      role: entry.jobTitle ?? "",
      scheduledAt: entry.scheduledAt,
      panel: entry.panelName ?? "",
      status: entry.status,
    }));
  }

  if (tab === "candidates") {
    if (!jobIds.length) return [];
    const rows = await db
      .select({
        id: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        stage: candidate.startingStage,
        matchScore: candidate.matchScore,
        updatedAt: candidate.updatedAt,
        jobTitle: job.title,
      })
      .from(candidate)
      .leftJoin(job, eq(candidate.jobId, job.id))
      .where(inArray(candidate.jobId, jobIds))
      .orderBy(desc(candidate.updatedAt));

    return rows.map((entry) => ({
      id: entry.id,
      name: fullName(entry.firstName, entry.lastName),
      role: entry.jobTitle ?? "",
      stage: entry.stage ?? "sourced",
      matchScore: entry.matchScore ?? 0,
      updated: relativeDays(entry.updatedAt),
    }));
  }

  if (tab === "roles") {
    if (!jobIds.length) return [];
    const rows = await db
      .select({
        id: job.id,
        title: job.title,
        status: job.status,
        employmentType: job.employmentType,
      })
      .from(job)
      .where(inArray(job.id, jobIds));

    const counts = new Map<string, { pipeline: number; submitted: number }>();
    const grouped = await db
      .select({ jobId: candidate.jobId, stage: candidate.startingStage, total: count() })
      .from(candidate)
      .where(inArray(candidate.jobId, jobIds))
      .groupBy(candidate.jobId, candidate.startingStage);
    for (const entry of grouped) {
      if (!entry.jobId) continue;
      const bucket = counts.get(entry.jobId) ?? { pipeline: 0, submitted: 0 };
      bucket.pipeline += Number(entry.total);
      if (entry.stage === "submitted") bucket.submitted += Number(entry.total);
      counts.set(entry.jobId, bucket);
    }

    return rows.map((entry) => {
      const bucket = counts.get(entry.id) ?? { pipeline: 0, submitted: 0 };
      return {
        id: entry.id,
        title: entry.title,
        meta: entry.employmentType ?? "",
        // The one relationship the data records: named contact on the
        // requirement, and the client's primary contact on top of that.
        herRole: row.isPrimary ? "primary" : "named",
        pipeline: bucket.pipeline,
        submitted: bucket.submitted,
        status: entry.status,
      };
    });
  }

  const rows = await db
    .select({
      id: auditLog.id,
      event: auditLog.event,
      category: auditLog.category,
      objects: auditLog.objects,
      createdAt: auditLog.createdAt,
    })
    .from(auditLog)
    .where(eq(auditLog.organizationId, organizationId))
    .orderBy(desc(auditLog.createdAt))
    .limit(60);

  const name = fullName(row.firstName, row.lastName);
  return rows
    .map((entry) => ({
      id: entry.id,
      event: entry.event,
      subject: String(Object.values(entry.objects ?? {})[0] ?? ""),
      category: entry.category,
      group: CONTACT_ACTIVITY_GROUP[entry.category] ?? "other",
      icon: CONTACT_ACTIVITY_ICON[entry.category] ?? "history",
      iconColor:
        CONTACT_ACTIVITY_TINT[entry.category] ?? "var(--mui-palette-surface-textSecondary)",
      day: dayBucketOf(entry.createdAt),
      when: entry.createdAt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
      who: name,
    }))
    .filter((entry) => filter === "all" || entry.group === filter)
    .slice(0, 20);
}

/** Category → the chip it belongs to, the glyph, and that glyph's tint. */
const CONTACT_ACTIVITY_GROUP: Record<string, string> = {
  email: "email",
  candidates: "submissions",
  requirements: "submissions",
  clientActions: "meetings",
  billing: "other",
};
const CONTACT_ACTIVITY_ICON: Record<string, string> = {
  email: "mail",
  candidates: "group",
  requirements: "work",
  clientActions: "event",
  billing: "payments",
};
const CONTACT_ACTIVITY_TINT: Record<string, string> = {
  email: "var(--mui-palette-surface-primarySoftFg)",
  candidates: "var(--mui-palette-surface-primarySoftFg)",
  requirements: "var(--mui-palette-surface-textSecondary)",
  clientActions: "var(--mui-palette-surface-successFg)",
  billing: "var(--mui-palette-surface-warningFg)",
};

function dayBucketOf(when: Date): string {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  if (when >= start) return "today";
  return when >= new Date(start.getTime() - DAY_MS) ? "yesterday" : "earlier";
}

/** The rail's "Contact info" card. */
export async function contactInfo(organizationId: string, id: string) {
  const row = await detailBase(organizationId, id);
  if (!row) return null;
  return {
    email: row.email ?? "",
    phone: row.mobile || row.phone || "",
    linkedin: row.linkedin ?? "",
    timezone: row.timezone ?? "",
    preferredChannel: row.preferredChannel ?? "",
    emailOptOut: row.emailOptOut,
    phoneOptOut: row.phoneOptOut,
  };
}

/** The rail's "Relationship" card — owner, last touch, and the health band. */
export async function contactRelationship(organizationId: string, id: string) {
  const row = await detailBase(organizationId, id);
  if (!row) return null;

  const jobIds = await contactJobIds(organizationId, id);
  const stats = await responsiveness(jobIds);
  const health = healthBand(stats.replyRate, stats.avgReplyHours);

  return {
    ownerId: row.ownerId ?? "",
    ownerName: row.ownerName ?? "",
    lastTouch: relativeDays(row.updatedAt),
    health: health.band,
    healthPercent: health.score,
    avgReplyHours: stats.avgReplyHours,
    replyRate: stats.replyRate,
    interactions90d: stats.interactions90d,
    reference: `CON-${row.id.slice(-6).toUpperCase()}`,
    source: row.source ?? "",
    addedAt: row.createdAt.toISOString(),
  };
}

/** The rail's client card — the same figures the clients list shows. */
export async function contactClientCard(organizationId: string, id: string) {
  const row = await detailBase(organizationId, id);
  if (!row?.clientId) return null;

  const clientJobs = await db
    .select({ id: job.id, status: job.status })
    .from(job)
    .where(and(eq(job.organizationId, organizationId), eq(job.clientId, row.clientId)));
  const ids = clientJobs.map((entry) => entry.id);
  const [candidateCount, waiting] = await Promise.all([
    ids.length
      ? db.select({ total: count() }).from(candidate).where(inArray(candidate.jobId, ids))
      : Promise.resolve([{ total: 0 }]),
    ids.length
      ? db
          .select({ total: count() })
          .from(candidate)
          .where(and(inArray(candidate.jobId, ids), eq(candidate.startingStage, "submitted")))
      : Promise.resolve([{ total: 0 }]),
  ]);

  return {
    id: row.clientId,
    name: row.clientName ?? "",
    industry: row.clientIndustry ?? "",
    since: row.clientCreatedAt
      ? row.clientCreatedAt.toLocaleDateString(undefined, { month: "short", year: "numeric" })
      : "",
    openJobs: clientJobs.filter((entry) => entry.status === "open").length,
    candidates: Number(candidateCount[0]?.total ?? 0),
    waitingFeedback: Number(waiting[0]?.total ?? 0),
  };
}

/**
 * The three tiles between the waiting card and the tabs. "Faster than N%" is a
 * real percentile: this contact's decision speed against every other contact
 * in the org that has a decision history.
 */
export async function contactKpis(organizationId: string, id: string) {
  const row = await detailBase(organizationId, id);
  if (!row) return null;

  const jobIds = await contactJobIds(organizationId, id);
  const [stats, pending, openJobs] = await Promise.all([
    responsiveness(jobIds),
    pendingWithContact(jobIds),
    jobIds.length
      ? db
          .select({ total: count() })
          .from(job)
          .where(and(inArray(job.id, jobIds), eq(job.status, "open")))
      : Promise.resolve([{ total: 0 }]),
  ]);

  const oldest = pending[0];
  const oldestHours = oldest
    ? Math.max(1, Math.round((Date.now() - oldest.updatedAt.getTime()) / HOUR_MS))
    : 0;

  return {
    openJobs: Number(openJobs[0]?.total ?? 0),
    namedRoles: jobIds.length,
    waiting: pending.length,
    oldestHours,
    avgReplyHours: stats.avgReplyHours,
    fasterThan: await fasterThanPercent(organizationId, id, stats.avgReplyHours),
  };
}

/** Share of the org's other contacts this one decides faster than. */
async function fasterThanPercent(organizationId: string, id: string, avgReplyHours: number) {
  if (!avgReplyHours) return 0;
  const peers = await db
    .select({ id: contact.id })
    .from(contact)
    .where(and(eq(contact.organizationId, organizationId), ne(contact.id, id)));

  const speeds = await Promise.all(
    peers.map(async (peer) => {
      const ids = await contactJobIds(organizationId, peer.id);
      const stats = await responsiveness(ids);
      return stats.avgReplyHours;
    }),
  );
  const measured = speeds.filter((hours) => hours > 0);
  if (!measured.length) return 0;
  const slower = measured.filter((hours) => hours > avgReplyHours).length;
  return Math.round((slower / measured.length) * 100);
}
