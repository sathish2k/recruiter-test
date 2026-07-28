import { randomUUID } from "node:crypto";
import {
  and,
  asc,
  avg,
  count,
  desc,
  eq,
  getTableColumns,
  gt,
  gte,
  ilike,
  inArray,
  or,
  sum,
} from "drizzle-orm";
import { db } from "../db";
import { auditLog } from "../models/audit-log.model";
import { user } from "../models/auth.model";
import { candidate } from "../models/candidate.model";
import {
  type ClientAddress,
  type ClientAttachment,
  type ClientHealth,
  type ClientStatus,
  client,
} from "../models/client.model";
import { clientInvoice } from "../models/client-invoice.model";
import { contact } from "../models/contact.model";
import { interview } from "../models/interview.model";
import { job } from "../models/job.model";

type ClientRow = typeof client.$inferSelect;

function mapClient(row: ClientRow & { accountLeadName?: string | null }) {
  return {
    id: row.id,
    name: row.name,
    parentCompany: row.parentCompany ?? "",
    primaryContactId: row.primaryContactId ?? "",
    industry: row.industry ?? "",
    website: row.website ?? "",
    phone: row.phone ?? "",
    billingEmail: row.billingEmail ?? "",
    address: row.address ?? {},
    shippingAddress: row.shippingAddress ?? {},
    shippingSameAsBilling: row.shippingSameAsBilling ?? true,
    contract: row.contract ?? [],
    attachments: row.attachments ?? [],
    accountLeadId: row.accountLeadId ?? "",
    accountLeadName: row.accountLeadName ?? "",
    source: row.source ?? "",
    feeBasis: row.feeBasis ?? "percent",
    feeValue: row.feeValue ?? "",
    paymentTerms: row.paymentTerms ?? "",
    taxId: row.taxId ?? "",
    notes: row.notes ?? "",
    status: row.status,
    health: row.health,
    logo: row.logo ?? "",
    linkedin: row.linkedin ?? "",
    careerPage: row.careerPage ?? "",
    timezone: row.timezone ?? "",
    companySize: row.companySize ?? "",
    annualHiringVolume: row.annualHiringVolume ?? "",
    replacementPeriod: row.replacementPeriod ?? "",
    contractRenewsAt: row.contractRenewsAt ?? "",
    openRoles: row.openRoles,
    candidates: row.candidates,
    placements: row.placements,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt.toISOString(),
  };
}

const SORT_FIELDS = {
  name: client.name,
  status: client.status,
  createdAt: client.createdAt,
} as const;

function split(value?: string) {
  return (value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export interface ListClientsParams {
  search?: string;
  status?: string;
  health?: string;
  page?: number;
  pageSize?: number;
  sortKey?: string;
  sortDir?: string;
}

export async function listClients(organizationId: string, params: ListClientsParams = {}) {
  const filters = [eq(client.organizationId, organizationId)];

  if (params.search) {
    const term = `%${params.search}%`;
    const match = or(ilike(client.name, term), ilike(client.industry, term));
    if (match) filters.push(match);
  }
  const statuses = split(params.status);
  if (statuses.length) filters.push(inArray(client.status, statuses as ClientStatus[]));
  const healths = split(params.health);
  if (healths.length) filters.push(inArray(client.health, healths as ClientHealth[]));

  const where = and(...filters);
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 12));
  const column = SORT_FIELDS[params.sortKey as keyof typeof SORT_FIELDS] ?? client.createdAt;
  const order = params.sortDir === "asc" ? asc(column) : desc(column);

  const [rows, countRows, stageRows] = await Promise.all([
    db
      .select({ ...getTableColumns(client), accountLeadName: user.name })
      .from(client)
      .leftJoin(user, eq(client.accountLeadId, user.id))
      .where(where)
      .orderBy(order)
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ total: count() }).from(client).where(where),
    // Candidate-flow split per client, for the card's pipeline bar.
    db
      .select({ clientId: job.clientId, stage: candidate.startingStage, total: count() })
      .from(candidate)
      .innerJoin(job, eq(candidate.jobId, job.id))
      .where(eq(candidate.organizationId, organizationId))
      .groupBy(job.clientId, candidate.startingStage),
  ]);

  const flow = new Map<string, { sourced: number; screening: number; interviewing: number }>();
  for (const row of stageRows) {
    if (!row.clientId) continue;
    const entry = flow.get(row.clientId) ?? { sourced: 0, screening: 0, interviewing: 0 };
    if (row.stage === "sourced") entry.sourced += Number(row.total);
    else if (row.stage === "screening") entry.screening += Number(row.total);
    else if (row.stage === "interview") entry.interviewing += Number(row.total);
    flow.set(row.clientId, entry);
  }

  return {
    data: rows.map((row) => ({
      ...mapClient(row),
      flow: flow.get(row.id) ?? { sourced: 0, screening: 0, interviewing: 0 },
    })),
    totalCount: countRows[0]?.total ?? 0,
  };
}

const QUARTER_MS = 90 * 24 * 60 * 60 * 1000;

export async function clientStats(organizationId: string) {
  const where = eq(client.organizationId, organizationId);
  const quarterAgo = new Date(Date.now() - QUARTER_MS);
  const [byStatusRows, [totals], [addedRow], [withRolesRow], placedRows] = await Promise.all([
    db
      .select({ status: client.status, total: count() })
      .from(client)
      .where(where)
      .groupBy(client.status),
    db
      .select({ openRoles: sum(client.openRoles), placements: sum(client.placements) })
      .from(client)
      .where(where),
    db
      .select({ total: count() })
      .from(client)
      .where(and(where, gte(client.createdAt, quarterAgo))),
    db
      .select({ total: count() })
      .from(client)
      .where(and(where, gt(client.openRoles, 0))),
    // Time to hire: how long a placed candidate took from first record to
    // placement. `updatedAt` is when they were marked placed.
    db
      .select({ createdAt: candidate.createdAt, updatedAt: candidate.updatedAt })
      .from(candidate)
      .where(and(eq(candidate.organizationId, organizationId), eq(candidate.status, "placed"))),
  ]);

  const days = placedRows
    .map((row) => (row.updatedAt.getTime() - row.createdAt.getTime()) / (24 * 60 * 60 * 1000))
    .filter((value) => value >= 0);
  const avgTimeToHire = days.length
    ? Math.round(days.reduce((sum, value) => sum + value, 0) / days.length)
    : 0;
  const byStatus = Object.fromEntries(byStatusRows.map((r) => [r.status, r.total]));
  const active = byStatusRows.reduce((acc, r) => acc + r.total, 0);
  return {
    active,
    hiring: byStatus.hiring ?? 0,
    paused: byStatus.paused ?? 0,
    openRoles: Number(totals?.openRoles ?? 0),
    placements: Number(totals?.placements ?? 0),
    addedThisQuarter: Number(addedRow?.total ?? 0),
    clientsWithRoles: Number(withRolesRow?.total ?? 0),
    avgTimeToHire,
  };
}

export async function getClient(organizationId: string, id: string) {
  const [row] = await db
    .select({ ...getTableColumns(client), accountLeadName: user.name })
    .from(client)
    .leftJoin(user, eq(client.accountLeadId, user.id))
    .where(and(eq(client.id, id), eq(client.organizationId, organizationId)))
    .limit(1);
  return row ? mapClient(row) : null;
}

export interface ClientInput {
  linkedin?: string;
  careerPage?: string;
  timezone?: string;
  companySize?: string;
  annualHiringVolume?: string;
  replacementPeriod?: string;
  contractRenewsAt?: string;
  name?: string;
  parentCompany?: string;
  primaryContactId?: string;
  industry?: string;
  website?: string;
  phone?: string;
  billingEmail?: string;
  address?: ClientAddress;
  shippingAddress?: ClientAddress;
  shippingSameAsBilling?: boolean;
  contract?: ClientAttachment[];
  attachments?: ClientAttachment[];
  accountLeadId?: string;
  source?: string;
  feeBasis?: string;
  feeValue?: string;
  paymentTerms?: string;
  taxId?: string;
  notes?: string;
  status?: string;
  health?: string;
  logo?: string;
}

const EDITABLE = [
  "name",
  "parentCompany",
  "primaryContactId",
  "industry",
  "website",
  "phone",
  "billingEmail",
  "address",
  "shippingAddress",
  "shippingSameAsBilling",
  "contract",
  "attachments",
  "accountLeadId",
  "source",
  "feeBasis",
  "feeValue",
  "paymentTerms",
  "taxId",
  "notes",
  "status",
  "health",
  "logo",
  "linkedin",
  "careerPage",
  "timezone",
  "companySize",
  "annualHiringVolume",
  "replacementPeriod",
  "contractRenewsAt",
] as const;

function pickEditable(input: ClientInput): Partial<ClientRow> {
  const patch: Record<string, unknown> = {};
  for (const field of EDITABLE) {
    if (input[field] !== undefined) patch[field] = input[field] === "" ? null : input[field];
  }
  return patch as Partial<ClientRow>;
}

const toE164 = (value: string) => value.replace(/[^\d+]/g, "");
function normalizeWebsite(value: string) {
  const v = value.trim();
  if (!v || /^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

/** Canonicalise inputs so storage stays consistent. */
function normalizeInput(input: ClientInput): ClientInput {
  const out = { ...input };
  if (out.billingEmail !== undefined) out.billingEmail = out.billingEmail.trim().toLowerCase();
  if (out.phone) out.phone = toE164(out.phone);
  if (out.website) out.website = normalizeWebsite(out.website);
  return out;
}

export async function createClient(organizationId: string, rawInput: ClientInput) {
  const input = normalizeInput(rawInput);
  const [created] = await db
    .insert(client)
    .values({
      id: randomUUID(),
      organizationId,
      name: input.name?.trim() || "Untitled client",
      ...pickEditable({ ...input, name: undefined }),
    })
    .returning();
  return created ? mapClient(created) : null;
}

export async function updateClient(organizationId: string, id: string, rawInput: ClientInput) {
  const input = normalizeInput(rawInput);
  const [updated] = await db
    .update(client)
    .set({ ...pickEditable(input), updatedAt: new Date() })
    .where(and(eq(client.id, id), eq(client.organizationId, organizationId)))
    .returning();
  return updated ? mapClient(updated) : null;
}

export async function deleteClient(organizationId: string, id: string) {
  const [deleted] = await db
    .delete(client)
    .where(and(eq(client.id, id), eq(client.organizationId, organizationId)))
    .returning();
  return deleted ? { id: deleted.id } : null;
}

/* ------------------------------------------------------------------------- *
 * Client detail — one query per block of the screen, so each component owns
 * its own endpoint and refetches independently.
 * ------------------------------------------------------------------------- */

const SLA_HOURS = 48;
const HOUR_MS = 3_600_000;

const fullName = (first?: string | null, last?: string | null) =>
  [first, last].filter(Boolean).join(" ").trim();

/** The client's job ids — the scope every other detail query runs inside. */
async function clientJobIds(organizationId: string, id: string) {
  const rows = await db
    .select({ id: job.id })
    .from(job)
    .where(and(eq(job.organizationId, organizationId), eq(job.clientId, id)));
  return rows.map((row) => row.id);
}

/** Candidates the client still owes a decision on, oldest first. */
async function pendingSubmissions(jobIds: string[]) {
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
 * The client record, its feedback-SLA figures, and the attention state the
 * header chip shows — computed from those SLAs, unpaid invoices and whether any
 * requirement is still open, rather than read from the stored health column.
 */
export async function clientSummary(organizationId: string, id: string) {
  const record = await getClient(organizationId, id);
  if (!record) return null;

  const jobIds = await clientJobIds(organizationId, id);
  const [pending, overdueInvoices, openJobs] = await Promise.all([
    pendingSubmissions(jobIds),
    db
      .select({ total: count() })
      .from(clientInvoice)
      .where(
        and(
          eq(clientInvoice.organizationId, organizationId),
          eq(clientInvoice.clientId, id),
          eq(clientInvoice.status, "overdue"),
        ),
      ),
    db
      .select({ total: count() })
      .from(job)
      .where(
        and(eq(job.organizationId, organizationId), eq(job.clientId, id), eq(job.status, "open")),
      ),
  ]);
  const oldest = pending[0];
  const elapsedHours = oldest ? Math.round((Date.now() - oldest.updatedAt.getTime()) / HOUR_MS) : 0;

  const overdue = Number(overdueInvoices[0]?.total ?? 0);
  const open = Number(openJobs[0]?.total ?? 0);

  return {
    ...record,
    // Worst signal wins: money owed, then feedback owed, then silence.
    attention:
      overdue > 0
        ? "invoice_overdue"
        : pending.length > 0
          ? "waiting_feedback"
          : open === 0
            ? "dormant"
            : "on_track",
    sla: {
      pending: pending.length,
      slaHours: SLA_HOURS,
      elapsedHours,
      // Clamped so the bar never overflows once an item is past its SLA.
      percent: Math.min(100, Math.round((elapsedHours / SLA_HOURS) * 100)),
      breached: elapsedHours > SLA_HOURS,
    },
  };
}

/** The four KPI tiles. */
export async function clientKpis(organizationId: string, id: string) {
  const jobs = await db
    .select({
      id: job.id,
      status: job.status,
      actualRevenue: job.actualRevenue,
      missedRevenue: job.missedRevenue,
    })
    .from(job)
    .where(and(eq(job.organizationId, organizationId), eq(job.clientId, id)));

  const jobIds = jobs.map((row) => row.id);
  const candidates = jobIds.length
    ? await db
        .select({
          status: candidate.status,
          createdAt: candidate.createdAt,
          updatedAt: candidate.updatedAt,
        })
        .from(candidate)
        .where(inArray(candidate.jobId, jobIds))
    : [];

  const placed = candidates.filter((row) => row.status === "placed");
  const avgTimeToHire = placed.length
    ? Math.round(
        placed.reduce(
          (total, row) =>
            total + (row.updatedAt.getTime() - row.createdAt.getTime()) / (24 * HOUR_MS),
          0,
        ) / placed.length,
      )
    : 0;
  const money = (value: string | null) => Number(value ?? 0);

  return {
    openJobs: jobs.filter((row) => row.status === "open").length,
    onHoldJobs: jobs.filter((row) => row.status === "on_hold").length,
    activeCandidates: candidates.filter(
      (row) => row.status !== "placed" && row.status !== "rejected",
    ).length,
    placements: placed.length,
    avgTimeToHire,
    revenue: jobs.reduce((total, row) => total + money(row.actualRevenue), 0),
    outstanding: jobs.reduce((total, row) => total + money(row.missedRevenue), 0),
  };
}

/** Submitted CVs waiting on the client. */
export async function clientSubmissions(organizationId: string, id: string, limit = 6) {
  const jobIds = await clientJobIds(organizationId, id);
  const pending = await pendingSubmissions(jobIds);
  if (!pending.length) return [];

  const titles = new Map(
    (
      await db.select({ id: job.id, title: job.title }).from(job).where(inArray(job.id, jobIds))
    ).map((row) => [row.id, row.title]),
  );

  return pending.slice(0, limit).map((row) => {
    const role = titles.get(row.jobId ?? "") ?? "";
    const hours = Math.max(1, Math.round((Date.now() - row.updatedAt.getTime()) / HOUR_MS));
    const ago = hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
    const reminderHours = row.reminderSentAt
      ? Math.max(1, Math.round((Date.now() - row.reminderSentAt.getTime()) / HOUR_MS))
      : null;
    const chase =
      reminderHours == null
        ? `waiting ${ago.replace(" ago", "")} — no reminder yet`
        : `reminder sent ${reminderHours}h ago`;
    return {
      id: row.id,
      name: fullName(row.firstName, row.lastName),
      role,
      matchScore: row.matchScore,
      submittedAt: row.updatedAt,
      waitingHours: hours,
      // "Senior Backend Engineer · submitted 5h ago by Ana · reminder sent 2h ago",
      // as the design reads it.
      meta: [role, `submitted ${ago}`, row.ownerName ? `by ${row.ownerName}` : "", chase]
        .filter(Boolean)
        .join(" · "),
      chase,
      reminderSentAt: row.reminderSentAt,
      breached: hours > SLA_HOURS,
    };
  });
}

export type WorkspaceTab = "roles" | "interviews" | "placements" | "invoices";

/** One tab of the workspace panel. The tab is a filter, so the component keeps
 * a single datasource and refetches as the user switches. */
export async function clientWorkspace(organizationId: string, id: string, tab: WorkspaceTab) {
  if (tab === "interviews") {
    const rows = await db
      .select({
        id: interview.id,
        scheduledAt: interview.scheduledAt,
        status: interview.status,
        kind: interview.kind,
        jobTitle: job.title,
        candidateFirstName: candidate.firstName,
        candidateLastName: candidate.lastName,
        panelName: user.name,
      })
      .from(interview)
      .leftJoin(candidate, eq(interview.candidateId, candidate.id))
      .leftJoin(job, eq(interview.jobId, job.id))
      .leftJoin(user, eq(interview.ownerId, user.id))
      .where(and(eq(interview.organizationId, organizationId), eq(interview.clientId, id)))
      .orderBy(asc(interview.scheduledAt));

    return rows.map((row) => ({
      id: row.id,
      name: fullName(row.candidateFirstName, row.candidateLastName),
      role: row.jobTitle ?? "",
      scheduledAt: row.scheduledAt,
      panel: row.panelName ?? "",
      kind: row.kind,
      status: row.status,
    }));
  }

  if (tab === "invoices") {
    const rows = await db
      .select()
      .from(clientInvoice)
      .where(and(eq(clientInvoice.organizationId, organizationId), eq(clientInvoice.clientId, id)))
      .orderBy(desc(clientInvoice.issuedAt));

    const now = Date.now();
    return rows.map((row) => ({
      id: row.id,
      number: row.number,
      description: row.description ?? "",
      amount: row.amount,
      // "Overdue 6d" / "Due Aug 4" / "Paid Jul 2", as the design writes it.
      status:
        row.status === "paid" ? "paid" : row.dueAt && row.dueAt.getTime() < now ? "overdue" : "due",
      issuedAt: row.issuedAt,
      dueAt: row.dueAt,
    }));
  }

  const jobIds = await clientJobIds(organizationId, id);

  if (tab === "placements") {
    if (!jobIds.length) return [];
    const record = await getClient(organizationId, id);
    const rows = await db
      .select({
        id: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        updatedAt: candidate.updatedAt,
        jobTitle: job.title,
      })
      .from(candidate)
      .leftJoin(job, eq(candidate.jobId, job.id))
      .where(and(inArray(candidate.jobId, jobIds), eq(candidate.status, "placed")))
      .orderBy(desc(candidate.updatedAt));

    return rows.map((row) => ({
      id: row.id,
      name: fullName(row.firstName, row.lastName),
      role: row.jobTitle ?? "",
      joinedAt: row.updatedAt,
      guarantee: record?.replacementPeriod ?? "",
    }));
  }

  const jobs = await db
    .select({
      id: job.id,
      title: job.title,
      status: job.status,
      openings: job.openings,
      employmentType: job.employmentType,
      profileLeadName: user.name,
      contactFirstName: contact.firstName,
      contactLastName: contact.lastName,
    })
    .from(job)
    .leftJoin(user, eq(job.profileLeadId, user.id))
    .leftJoin(contact, eq(job.clientContactId, contact.id))
    .where(and(eq(job.organizationId, organizationId), eq(job.clientId, id)));

  const counts = new Map<string, { pipeline: number; submitted: number; score: number }>();
  if (jobIds.length) {
    const rows = await db
      .select({
        jobId: candidate.jobId,
        stage: candidate.startingStage,
        total: count(),
        score: avg(candidate.matchScore),
      })
      .from(candidate)
      .where(inArray(candidate.jobId, jobIds))
      .groupBy(candidate.jobId, candidate.startingStage);
    for (const row of rows) {
      if (!row.jobId) continue;
      const entry = counts.get(row.jobId) ?? { pipeline: 0, submitted: 0, score: 0 };
      const total = Number(row.total);
      // Weighted so the average is over candidates, not over stages.
      entry.score =
        entry.pipeline + total
          ? Math.round(
              (entry.score * entry.pipeline + Number(row.score ?? 0) * total) /
                (entry.pipeline + total),
            )
          : 0;
      entry.pipeline += total;
      if (row.stage === "submitted") entry.submitted += total;
      counts.set(row.jobId, entry);
    }
  }

  return jobs.map((row) => {
    const entry = counts.get(row.id) ?? { pipeline: 0, submitted: 0, score: 0 };
    return {
      id: row.id,
      title: row.title,
      meta: row.employmentType ?? "",
      openings: row.openings ?? 0,
      contactName: fullName(row.contactFirstName, row.contactLastName),
      profileLeadName: row.profileLeadName ?? "",
      pipeline: entry.pipeline,
      submitted: entry.submitted,
      coverage: entry.score,
      coverageBand: entry.score >= 85 ? "excellent" : entry.score >= 70 ? "good" : "sourcing",
      status: row.status,
    };
  });
}

/** The rail's contact list. */
export async function clientContacts(organizationId: string, id: string) {
  const rows = await db
    .select({
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      title: contact.title,
      email: contact.email,
      phone: contact.phone,
      isPrimary: contact.isPrimary,
      updatedAt: contact.updatedAt,
    })
    .from(contact)
    .where(and(eq(contact.organizationId, organizationId), eq(contact.clientId, id)))
    .orderBy(desc(contact.isPrimary));

  return rows.map((row) => {
    const days = Math.round((Date.now() - row.updatedAt.getTime()) / (24 * HOUR_MS));
    return {
      id: row.id,
      name: fullName(row.firstName, row.lastName),
      title: row.title ?? "",
      email: row.email ?? "",
      phone: row.phone ?? "",
      isPrimary: row.isPrimary,
      lastContactAt: row.updatedAt,
      lastContact: days < 1 ? "today" : days === 1 ? "yesterday" : `${days} days ago`,
    };
  });
}

/** Stage a candidate moved into → its glyph, so the feed reads by what
 * happened rather than giving every candidate event the same icon. */
const STAGE_ICON: Record<string, string> = {
  sourced: "person-add",
  screening: "fact-check",
  submitted: "upload",
  interview: "event",
  offer: "handshake",
  placed: "check-circle",
};

/** Category → the glyph the rail draws beside an entry. */
const ACTIVITY_ICON: Record<string, string> = {
  candidates: "group",
  requirements: "work",
  clientActions: "domain",
  billing: "payments",
  email: "mail",
  permissions: "shield",
  security: "shield",
  integrations: "hub",
  system: "settings",
};

/** Which of the design's chips an entry belongs to. */
const ACTIVITY_GROUP: Record<string, string> = {
  candidates: "recruitment",
  requirements: "recruitment",
  clientActions: "recruitment",
  billing: "billing",
  email: "billing",
  permissions: "system",
  security: "system",
  integrations: "system",
  system: "system",
};

/** Glyph tint per category — accent for recruitment, green for money in,
 * amber for anything awaiting a person. */
const ACTIVITY_TINT: Record<string, string> = {
  candidates: "var(--mui-palette-surface-primarySoftFg)",
  requirements: "var(--mui-palette-surface-primarySoftFg)",
  clientActions: "var(--mui-palette-surface-primarySoftFg)",
  billing: "var(--mui-palette-surface-successFg)",
  email: "var(--mui-palette-surface-warningFg)",
};

function dayBucket(when: Date): string {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  if (when >= start) return "today";
  const yesterday = new Date(start.getTime() - 24 * HOUR_MS);
  return when >= yesterday ? "yesterday" : "earlier";
}

/**
 * The rail's activity feed, grouped by day and tagged for the filter chips.
 * Scoped to the org, not the client — audit rows carry no client reference yet.
 */
export async function clientActivity(organizationId: string, filter = "all", limit = 12) {
  const rows = await db
    .select({
      id: auditLog.id,
      event: auditLog.event,
      category: auditLog.category,
      objects: auditLog.objects,
      details: auditLog.details,
      createdAt: auditLog.createdAt,
    })
    .from(auditLog)
    .where(eq(auditLog.organizationId, organizationId))
    .orderBy(desc(auditLog.createdAt))
    .limit(60);

  return rows
    .map((row) => ({
      id: row.id,
      event: row.event,
      // The design bolds the entity inside the sentence.
      subject: Object.values(row.objects ?? {})[0] ?? "",
      category: row.category,
      group: ACTIVITY_GROUP[row.category] ?? "system",
      icon:
        STAGE_ICON[String((row.details as Record<string, unknown>)?.stage ?? "")] ??
        ACTIVITY_ICON[row.category] ??
        "history",
      iconColor: ACTIVITY_TINT[row.category] ?? "var(--mui-palette-surface-textSecondary)",
      day: dayBucket(row.createdAt),
      when: row.createdAt.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }),
    }))
    .filter((row) => filter === "all" || row.group === filter)
    .slice(0, limit);
}
